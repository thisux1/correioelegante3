import { AppError } from '../utils/AppError';
import { generateJson } from './llm.service';

/**
 * AI actions por bloco (§6.2): reescrita de texto por tom, em pt-BR, sem
 * emoji e sem inventar conteúdo novo. O fallback honesto quando a IA está
 * fora é manter o texto original — o cliente trata o 503.
 */
export const REWRITE_ACTIONS = ['carinhoso', 'curto', 'engracado', 'poetico'] as const;
export type RewriteAction = (typeof REWRITE_ACTIONS)[number];

const ACTION_INSTRUCTIONS: Record<RewriteAction, string> = {
  carinhoso: 'mais carinhoso e afetuoso, sem ficar meloso',
  curto: 'mais curto e direto, sem perder a emoção',
  engracado: 'mais engraçado e leve, com humor gentil e zero deboche',
  poetico: 'mais poético e imagético, mas ainda natural de ler',
};

const TEXT_MAX_IN = 2_000;
const TEXT_MAX_OUT = 1_200;

export async function rewriteText(text: string, action: RewriteAction): Promise<string> {
  const instruction = ACTION_INSTRUCTIONS[action];
  const result = await generateJson<{ text?: string }>({
    system: `Você reescreve trechos de homenagens afetivas em português brasileiro.
Regras:
- Deixe o texto ${instruction}.
- Não use emojis. Não invente fatos, nomes ou datas que não estavam no texto.
- Mantenha a ideia central e a pessoa a quem se dirige.
- Responda SOMENTE com JSON no formato {"text": "..."}.`,
    prompt: `Texto original:\n\n"""${text.slice(0, TEXT_MAX_IN)}"""`,
    label: 'rewrite',
    responseSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
    },
    temperature: 0.6,
    timeoutMs: 12_000,
  });

  const rewritten = typeof result.text === 'string' ? result.text.trim() : '';
  if (!rewritten) {
    throw new AppError('A reescrita veio vazia. Tenta de novo.', 502, 'LLM_UNAVAILABLE');
  }
  return rewritten.slice(0, TEXT_MAX_OUT);
}
