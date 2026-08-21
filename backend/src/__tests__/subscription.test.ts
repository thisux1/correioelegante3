import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { generateAccessToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';
import * as subscriptionService from '../services/subscription.service';
import * as pagbankService from '../services/pagbank.service';

const USER_ID = '507f1f77bcf86cd799439000';

function makeToken(userId = USER_ID) {
  return generateAccessToken(userId);
}

describe('Subscription API & Logic', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/payments/subscription/status', () => {
    it('200 — retorna status de usuário sem assinatura', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: USER_ID,
        email: 'user@example.com',
        subscriptionStatus: 'none',
        subscriptionPlan: null,
        subscriptionExpiresAt: null,
        subscriptionProvider: null,
        subscriptions: [],
      } as any);

      const res = await request(app)
        .get('/api/payments/subscription/status')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.isSubscribed).toBe(false);
      expect(res.body.status).toBe('none');
    });

    it('200 — retorna status de usuário com assinatura ativa', async () => {
      const futureDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: USER_ID,
        email: 'pro@example.com',
        subscriptionStatus: 'active',
        subscriptionPlan: 'monthly_unlimited',
        subscriptionExpiresAt: futureDate,
        subscriptionProvider: 'pagbank',
        subscriptions: [
          {
            id: 'sub_123',
            planId: 'monthly_unlimited',
            status: 'active',
            amount: 15.0,
            startsAt: new Date(),
            expiresAt: futureDate,
          },
        ],
      } as any);

      const res = await request(app)
        .get('/api/payments/subscription/status')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.isSubscribed).toBe(true);
      expect(res.body.plan).toBe('monthly_unlimited');
      expect(res.body.daysRemaining).toBeGreaterThan(0);
    });
  });

  describe('POST /api/payments/subscription/checkout', () => {
    it('200 — gera checkout Pix para assinatura via PagBank', async () => {
      vi.spyOn(pagbankService, 'createSubscriptionPagBankPixPayment').mockResolvedValue({
        paymentMethod: 'pix',
        paymentProvider: 'pagbank',
        paymentId: 'ORDE_SUB_123',
        status: 'pending',
        pixQrCode: '00020126...BR.GOV.BCB.PIX...',
        pixQrCodeBase64: null,
        pixQrCodeUrl: 'https://sandbox.api.pagseguro.com/qrcode/sub.png',
        pixExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        amount: 15.0,
        planId: 'monthly_unlimited',
      });

      const res = await request(app)
        .post('/api/payments/subscription/checkout')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ paymentMethod: 'pix', planId: 'monthly_unlimited' });

      expect(res.status).toBe(200);
      expect(res.body.pixQrCode).toBeDefined();
      expect(res.body.amount).toBe(15.0);
    });


    it('400 — rejeita método de pagamento inválido', async () => {
      const res = await request(app)
        .post('/api/payments/subscription/checkout')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ paymentMethod: 'invalid_method' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/payments/simulate-subscription', () => {
    it('200 — ativa assinatura no ambiente de desenvolvimento/teste', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: USER_ID,
        subscriptionStatus: 'none',
        subscriptionExpiresAt: null,
      } as any);

      vi.spyOn(prisma, '$transaction').mockResolvedValue([
        {} as any,
        {} as any,
        { count: 1 } as any,
        { count: 1 } as any,
      ]);

      const res = await request(app)
        .post('/api/payments/simulate-subscription')
        .set('Authorization', `Bearer ${makeToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.isSubscribed).toBe(true);
    });

    it('retorna sem duplicar se providerPaymentId já estiver ativo (idempotência)', async () => {
      const existingExpiresAt = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000);
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: USER_ID,
        subscriptionStatus: 'active',
        subscriptionExpiresAt: existingExpiresAt,
      } as any);

      vi.spyOn(prisma.subscription, 'findFirst').mockResolvedValue({
        id: 'sub_exist',
        userId: USER_ID,
        providerPaymentId: 'mp_pay_already_processed',
        status: 'active',
        expiresAt: existingExpiresAt,
      } as any);

      const txSpy = vi.spyOn(prisma, '$transaction');

      const result = await subscriptionService.activateUserSubscription({
        userId: USER_ID,
        provider: 'mercadopago',
        providerPaymentId: 'mp_pay_already_processed',
      });

      expect(result.success).toBe(true);
      expect(result.isSubscribed).toBe(true);
      expect(result.expiresAt).toEqual(existingExpiresAt);
      expect(txSpy).not.toHaveBeenCalled();
    });
  });
});
