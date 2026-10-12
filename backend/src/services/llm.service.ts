import { AppError } from '../utils/AppError';

/**
 * Cliente mínimo do Gemini (REST, sem SDK) — usado só pela camada L2 do
 * pipeline: interpretação de texto livre e ações de reescrita. Nunca decide
 * estrutura de página (§4.2 do plano).
 */
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.5-flash';
const DEFAULT_TIMEOUT_MS = 15_000;

export function isLlmAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

interface GenerateJsonOptions {
  system: string;
  prompt: string;
  /** JSON Schema (subset aceito pela API) do objeto esperado. */
  responseSchema: Record<string, unknown>;
  temperature?: number;
  timeoutMs?: number;
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

export async function generateJson<T>(options: GenerateJsonOptions): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError('A interpretação por IA não está disponível no momento.', 503, 'LLM_UNAVAILABLE');
  }

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: options.system }] },
        contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: options.responseSchema,
          temperature: options.temperature ?? 0.3,
        },
      }),
    });

    if (!res.ok) {
      throw new AppError('A interpretação por IA falhou. Tenta de novo.', 502, 'LLM_UNAVAILABLE');
    }

    const data = (await res.json()) as GeminiGenerateResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string' || text.length === 0) {
      throw new AppError('A interpretação por IA veio vazia. Tenta de novo.', 502, 'LLM_UNAVAILABLE');
    }
    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
      throw new AppError('A interpretação demorou demais. Tenta de novo.', 504, 'LLM_TIMEOUT');
    }
    throw new AppError('A interpretação por IA falhou. Tenta de novo.', 502, 'LLM_UNAVAILABLE');
  } finally {
    clearTimeout(timer);
  }
}
