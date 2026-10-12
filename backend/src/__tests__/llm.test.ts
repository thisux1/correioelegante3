import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { generateAccessToken } from '../utils/jwt';
import { interpretFreeText } from '../services/interpret.service';
import { rewriteText } from '../services/rewrite.service';

const FREE_TEXT = 'quero fazer uma homenagem pra Marina, sou o Thiago, amo ela demais';

function mockGeminiJson(payload: unknown, ok = true) {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }),
        { status: ok ? 200 : 500 },
      ),
    ),
  );
}

beforeEach(() => {
  vi.stubEnv('GEMINI_API_KEY', 'test-key');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('interpretFreeText — texto livre → campos do brief', () => {
  it('rejeita texto curto demais', async () => {
    await expect(interpretFreeText('oi')).rejects.toMatchObject({
      statusCode: 400,
      code: 'TEXT_TOO_SHORT',
    });
  });

  it('extrai campos quando o Gemini responde JSON válido', async () => {
    mockGeminiJson({
      momento: 'carta_amor',
      tom: 'vulneravel',
      destinatario: 'Marina',
      remetente: 'Thiago',
      apelidos: ['Mari', 'Mar'],
      contexto: 'homenagem de amor pra Marina',
      memorias: [{ titulo: 'o primeiro cinema', descricao: 'vimos titanic' }],
      anonimoParaDestinatario: false,
    });

    const result = await interpretFreeText(FREE_TEXT);
    expect(result.source).toBe('llm');
    expect(result.fields.momento).toBe('carta_amor');
    expect(result.fields.destinatario).toBe('Marina');
    expect(result.fields.apelidos).toEqual(['Mari', 'Mar']);
  });

  it('descarta campo fora do enum sem derrubar o resto', async () => {
    mockGeminiJson({
      momento: 'halloween',
      tom: 'leve',
      destinatario: 'Marina',
      contexto: 'algo',
    });
    const result = await interpretFreeText(FREE_TEXT);
    expect(result.fields.momento).toBeUndefined();
    expect(result.fields.tom).toBe('leve');
    expect(result.fields.destinatario).toBe('Marina');
  });

  it('cai no fallback quando não há chave configurada', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const result = await interpretFreeText(FREE_TEXT);
    expect(result.source).toBe('fallback');
    expect(result.fields).toEqual({ contexto: FREE_TEXT });
    expect(result.notes[0]).toContain('llm_unavailable');
  });

  it('cai no fallback quando o LLM retorna JSON quebrado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ candidates: [{ content: { parts: [{ text: 'não é json' }] } }] }),
        { status: 200 },
      ),
    ));
    const result = await interpretFreeText(FREE_TEXT);
    expect(result.source).toBe('fallback');
    expect(result.fields.contexto).toBe(FREE_TEXT);
  });

  it('cai no fallback quando o fetch aborta por timeout', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(
      Object.assign(new Error('aborted'), { name: 'AbortError' }),
    ));
    const result = await interpretFreeText(FREE_TEXT);
    expect(result.source).toBe('fallback');
    expect(result.notes[0]).toContain('LLM_TIMEOUT');
  });

  it('cai no fallback quando a API responde erro', async () => {
    mockGeminiJson('{}', false);
    const result = await interpretFreeText(FREE_TEXT);
    expect(result.source).toBe('fallback');
  });

  it('usa o texto original como contexto quando o LLM omite resumo', async () => {
    mockGeminiJson({ momento: 'carta_amor' });
    const result = await interpretFreeText(FREE_TEXT);
    expect(result.fields.contexto).toBe(FREE_TEXT);
  });
});

describe('POST /api/generate/interpret', () => {
  it('200 — devolve campos interpretados', async () => {
    mockGeminiJson({ momento: 'desculpas', destinatario: 'Marina', contexto: 'pedido de desculpas' });
    const res = await request(app)
      .post('/api/generate/interpret')
      .send({ texto: FREE_TEXT });
    expect(res.status).toBe(200);
    expect(res.body.fields.momento).toBe('desculpas');
  });

  it('400 — texto ausente ou curto', async () => {
    const res = await request(app).post('/api/generate/interpret').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/ai/rewrite', () => {
  const token = () => generateAccessToken('507f1f77bcf86cd799439000');

  it('401 — sem autenticação', async () => {
    const res = await request(app)
      .post('/api/ai/rewrite')
      .send({ text: 'te amo muito', action: 'carinhoso' });
    expect(res.status).toBe(401);
  });

  it('400 — ação inválida', async () => {
    const res = await request(app)
      .post('/api/ai/rewrite')
      .set('Authorization', `Bearer ${token()}`)
      .send({ text: 'te amo muito', action: 'dramatico' });
    expect(res.status).toBe(400);
  });

  it('200 — devolve texto reescrito', async () => {
    mockGeminiJson({ text: 'você mora no meu peito' });
    const res = await request(app)
      .post('/api/ai/rewrite')
      .set('Authorization', `Bearer ${token()}`)
      .send({ text: 'gosto muito de você', action: 'carinhoso' });
    expect(res.status).toBe(200);
    expect(res.body.text).toBe('você mora no meu peito');
  });

  it('502 — LLM indisponível propaga erro honesto', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 500 })));
    await expect(rewriteText('texto', 'curto')).rejects.toMatchObject({
      statusCode: 502,
      code: 'LLM_UNAVAILABLE',
    });
  });
});
