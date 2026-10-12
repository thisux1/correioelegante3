import {
  MOMENTO_VALUES,
  TOM_VALUES,
  type Momento,
  type Tom,
} from '../contracts/generation.contract';
import { generateJson, isLlmAvailable } from './llm.service';
import { AppError } from '../utils/AppError';

/**
 * Interpretação de texto livre → campos do CreativeBrief (camada L2).
 * Saída sempre parcial e defensivamente normalizada: qualquer campo fora do
 * contrato é descartado — quem valida o brief de verdade é o fluxo de geração.
 */

export interface InterpretedFields {
  momento?: Momento;
  tom?: Tom;
  destinatario?: string;
  remetente?: string;
  apelidos?: string[];
  contexto?: string;
  memorias?: Array<{ titulo: string; descricao?: string }>;
  perguntasIntimidade?: Array<{ pergunta: string; resposta: string; dica?: string }>;
  evento?: { data?: string; lugar?: string; descricao?: string };
  musicaUrl?: string;
  anonimoParaDestinatario?: boolean;
}

export interface InterpretResult {
  /** 'llm' = Gemini extraiu; 'fallback' = texto foi para o contexto sem extração. */
  source: 'llm' | 'fallback';
  fields: InterpretedFields;
  notes: string[];
}

const FREE_TEXT_MAX = 4_000;

const INTERPRET_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    momento: { type: 'string', enum: [...MOMENTO_VALUES] },
    tom: { type: 'string', enum: [...TOM_VALUES] },
    destinatario: { type: 'string' },
    remetente: { type: 'string' },
    apelidos: { type: 'array', items: { type: 'string' } },
    contexto: { type: 'string' },
    memorias: {
      type: 'array',
      items: {
        type: 'object',
        properties: { titulo: { type: 'string' }, descricao: { type: 'string' } },
      },
    },
    perguntasIntimidade: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pergunta: { type: 'string' },
          resposta: { type: 'string' },
          dica: { type: 'string' },
        },
        required: ['pergunta', 'resposta'],
      },
    },
    evento: {
      type: 'object',
      properties: {
        data: { type: 'string' },
        lugar: { type: 'string' },
        descricao: { type: 'string' },
      },
    },
    musicaUrl: { type: 'string' },
    anonimoParaDestinatario: { type: 'boolean' },
  },
};

const SYSTEM_PROMPT = `Você extrai um CreativeBrief de um texto livre em português brasileiro sobre uma homenagem afetiva.
Regras:
- Extraia APENAS o que o texto afirma ou sugere claramente. Não invente nomes, datas ou memórias.
- momento: escolha o mais próximo entre os valores permitidos (crush_secreto, carta_amor, desculpas, anonimo, convite_date, pedido_namoro, data_especial, so_porque_sim).
- tom: cinematico, leve, vulneravel, misterioso ou celebratorio — o que combina com a voz do texto.
- destinatario/remetente: primeiro nome ou como a pessoa chama a outra. Omita se não houver. NUNCA use pronomes ("eu", "ela", "ele") como nome.
- apelidos: apelidos citados, no máximo 8.
- contexto: resumo fiel do texto, até 3 frases, sem inventar fatos.
- memorias: episódios concretos mencionados (titulo curto + descricao), no máximo 10.
- perguntasIntimidade: só se o texto sugerir uma pergunta que só o casal sabe responder (pergunta + resposta).
- evento: data/lugar/descricao apenas quando o texto mencionar um encontro ou ocasião concreta.
- musicaUrl: só URLs completas citadas no texto.
- anonimoParaDestinatario: true quando o texto pedir mistério ou identidade escondida.
Responda SOMENTE com o JSON do schema.`;

function clampText(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, max) : undefined;
}

function asStringArray(value: unknown, maxItems: number, maxLen: number): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim().slice(0, maxLen))
    .filter((v) => v.length > 0)
    .slice(0, maxItems);
  return items.length > 0 ? items : undefined;
}

function normalizeLlmOutput(raw: unknown, originalText: string): InterpretedFields {
  const out = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const fields: InterpretedFields = {};

  if (typeof out.momento === 'string' && (MOMENTO_VALUES as readonly string[]).includes(out.momento)) {
    fields.momento = out.momento as Momento;
  }
  if (typeof out.tom === 'string' && (TOM_VALUES as readonly string[]).includes(out.tom)) {
    fields.tom = out.tom as Tom;
  }

  const destinatario = clampText(out.destinatario, 80);
  const remetente = clampText(out.remetente, 80);
  if (destinatario) fields.destinatario = destinatario;
  if (remetente) fields.remetente = remetente;

  const apelidos = asStringArray(out.apelidos, 8, 60);
  if (apelidos) fields.apelidos = apelidos;

  // contexto: o do LLM é resumo; se vier vazio, o texto original inteiro vira contexto.
  fields.contexto = clampText(out.contexto, FREE_TEXT_MAX) ?? originalText;

  if (Array.isArray(out.memorias)) {
    const memorias: Array<{ titulo: string; descricao?: string }> = [];
    for (const m of out.memorias) {
      if (typeof m !== 'object' || m === null) continue;
      const titulo = clampText((m as Record<string, unknown>).titulo, 120);
      if (!titulo) continue;
      const descricao = clampText((m as Record<string, unknown>).descricao, 500);
      memorias.push(descricao ? { titulo, descricao } : { titulo });
      if (memorias.length >= 10) break;
    }
    if (memorias.length > 0) fields.memorias = memorias;
  }

  if (Array.isArray(out.perguntasIntimidade)) {
    const perguntas: Array<{ pergunta: string; resposta: string; dica?: string }> = [];
    for (const p of out.perguntasIntimidade) {
      if (typeof p !== 'object' || p === null) continue;
      const rec = p as Record<string, unknown>;
      const pergunta = clampText(rec.pergunta, 300);
      const resposta = clampText(rec.resposta, 300);
      if (!pergunta || !resposta) continue;
      const dica = clampText(rec.dica, 300);
      perguntas.push(dica ? { pergunta, resposta, dica } : { pergunta, resposta });
      if (perguntas.length >= 5) break;
    }
    if (perguntas.length > 0) fields.perguntasIntimidade = perguntas;
  }

  if (typeof out.evento === 'object' && out.evento !== null) {
    const ev = out.evento as Record<string, unknown>;
    const evento = {
      data: clampText(ev.data, 40),
      lugar: clampText(ev.lugar, 120),
      descricao: clampText(ev.descricao, 300),
    };
    if (evento.data || evento.lugar || evento.descricao) fields.evento = evento;
  }

  const musicaUrl = clampText(out.musicaUrl, 500);
  if (musicaUrl && /^https?:\/\//i.test(musicaUrl)) fields.musicaUrl = musicaUrl;

  if (typeof out.anonimoParaDestinatario === 'boolean') {
    fields.anonimoParaDestinatario = out.anonimoParaDestinatario;
  }

  return fields;
}

export async function interpretFreeText(rawText: string): Promise<InterpretResult> {
  const text = rawText.trim().slice(0, FREE_TEXT_MAX);
  if (text.length < 10) {
    throw new AppError('Escreve um pouquinho mais pra eu entender.', 400, 'TEXT_TOO_SHORT');
  }

  if (!isLlmAvailable()) {
    return {
      source: 'fallback',
      fields: { contexto: text },
      notes: ['llm_unavailable→contexto'],
    };
  }

  try {
    const raw = await generateJson<unknown>({
      system: SYSTEM_PROMPT,
      prompt: `Texto da pessoa que quer criar a homenagem:\n\n"""${text}"""`,
      responseSchema: INTERPRET_SCHEMA,
    });
    return {
      source: 'llm',
      fields: normalizeLlmOutput(raw, text),
      notes: [],
    };
  } catch (error) {
    // Fallback L0: LLM fora/lento/inválido → texto vira contexto, form continua utilizável.
    if (error instanceof AppError) {
      return {
        source: 'fallback',
        fields: { contexto: text },
        notes: [`${error.code ?? 'llm_error'}→contexto`],
      };
    }
    throw error;
  }
}
