import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

const validBrief = {
  momento: 'crush_secreto',
  nomes: { remetente: 'Rafa', destinatario: 'Duda' },
};

describe('POST /api/generate', () => {
  it('generates a compiled page from a valid brief without persisting', async () => {
    const res = await request(app)
      .post('/api/generate')
      .send({ brief: validBrief });

    expect(res.status).toBe(200);
    expect(res.body.spec.templateFamily).toBe('crush_secreto/misterio-leve');
    expect(res.body.content.blocks.length).toBeGreaterThan(0);
    expect(res.body.content.version).toBe(1);
    expect(Array.isArray(res.body.notes)).toBe(true);
    for (const block of res.body.content.blocks) {
      expect(block).toHaveProperty('id');
      expect(block).toHaveProperty('type');
      expect(block).toHaveProperty('props');
      expect(block).toHaveProperty('meta');
    }
    // copySlot markers must be resolved before content leaves the backend
    expect(JSON.stringify(res.body.content)).not.toContain('copySlot:');
    // recipient name interpolated into copy
    expect(JSON.stringify(res.body.content)).toContain('Duda');
  });

  it('rejects a malformed brief with 400 and a readable message', async () => {
    const res = await request(app)
      .post('/api/generate')
      .send({ brief: { momento: 'nao_existe', nomes: {} } });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('rejects missing brief field', async () => {
    const res = await request(app).post('/api/generate').send({});
    expect(res.status).toBe(400);
  });
});
