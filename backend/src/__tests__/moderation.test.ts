import { describe, expect, it } from 'vitest';
import { scanText, scanBriefText } from '../services/moderation.service';

describe('moderation L1 — scanText', () => {
  it('passa texto romântico comum', () => {
    expect(scanText('Marina, desde o ônibus das 18h eu só penso em você').verdict).toBe('pass');
    expect(scanText('amo você mais que café com paçoca').verdict).toBe('pass');
    expect(scanText('meu amor, minha vida, meu tudo').verdict).toBe('pass');
  });

  it('flagga telefone brasileiro', () => {
    const r = scanText('me liga depois: (11) 98765-4321');
    expect(r.verdict).toBe('flagged');
    expect(r.flags).toContain('pii_phone');
  });

  it('flagga CPF', () => {
    const r = scanText('o cpf dela é 123.456.789-00');
    expect(r.verdict).toBe('flagged');
    expect(r.flags).toContain('pii_cpf');
  });

  it('flagga email', () => {
    const r = scanText('manda no email dela marina@exemplo.com');
    expect(r.verdict).toBe('flagged');
    expect(r.flags).toContain('pii_email');
  });

  it('flagga número de cartão', () => {
    const r = scanText('usa o cartão 4111 1111 1111 1111');
    expect(r.verdict).toBe('flagged');
    expect(r.flags).toContain('pii_card');
  });

  it('bloqueia ameaça', () => {
    expect(scanText('vou te encontrar onde você mora').verdict).toBe('blocked');
    expect(scanText('eu sei onde você estuda').verdict).toBe('blocked');
  });

  it('bloqueia slur direcionado', () => {
    expect(scanText('você é uma vagabunda').verdict).toBe('blocked');
  });

  it('bloqueia sexualização de menor', () => {
    expect(scanText('nudes de adolescente').verdict).toBe('blocked');
  });

  it('bloqueio ganha de flag no mesmo texto', () => {
    const r = scanText('te acho onde você mora, o telefone é (11) 98765-4321');
    expect(r.verdict).toBe('blocked');
    expect(r.flags).toContain('abuse_threat');
    expect(r.flags).toContain('pii_phone');
  });
});

describe('moderation L1 — scanBriefText', () => {
  it('ignora campos vazios e undefined', () => {
    expect(scanBriefText([undefined, '', '  ']).verdict).toBe('pass');
  });

  it('passa brief romântico completo', () => {
    const r = scanBriefText([
      'Marina',
      'dividimos fone no ônibus',
      'café coado',
      'o que eu sempre peço?',
    ]);
    expect(r.verdict).toBe('pass');
  });
});
