import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import * as pagbankService from '../services/pagbank.service';
import { prisma } from '../utils/prisma';

vi.mock('axios');

const USER_ID = '507f1f77bcf86cd799439000';
const MSG_ID = '507f1f77bcf86cd799439011';
const PAGE_ID = '507f1f77bcf86cd799439022';

describe('PagBank Service (API V3 Checkout Transparente)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.PAGBANK_TOKEN = 'test_pagbank_token';
    process.env.PAGBANK_ENV = 'sandbox';
  });

  describe('createPixPaymentForResource', () => {
    it('cria pedido Pix no PagBank com sucesso para uma mensagem', async () => {
      vi.spyOn(prisma.message, 'findUnique').mockResolvedValue({
        id: MSG_ID,
        userId: USER_ID,
        paymentStatus: 'pending',
      } as any);

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: USER_ID,
        email: 'thiago@example.com',
      } as any);

      vi.spyOn(prisma.message, 'update').mockResolvedValue({} as any);

      const mockPost = vi.fn().mockResolvedValue({
        data: {
          id: 'ORDE_123456789',
          reference_id: `message:${MSG_ID}`,
          created_at: new Date().toISOString(),
          qr_codes: [
            {
              id: 'QRCO_123',
              amount: { value: 499 },
              text: '00020126580014br.gov.bcb.pix...',
              links: [
                {
                  rel: 'QRCODE.PNG',
                  href: 'https://sandbox.api.pagseguro.com/qrcode/123.png',
                },
              ],
              expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            },
          ],
        },
      });

      vi.mocked(axios.create).mockReturnValue({
        post: mockPost,
      } as any);

      const result = await pagbankService.createPixPaymentForResource(
        { resourceType: 'message', resourceId: MSG_ID },
        USER_ID,
      );

      expect(result.paymentId).toBe('ORDE_123456789');
      expect(result.status).toBe('pending');
      expect(result.paymentProvider).toBe('pagbank');
      expect(result.pixQrCode).toBe('00020126580014br.gov.bcb.pix...');
      expect(result.pixQrCodeUrl).toBe('https://sandbox.api.pagseguro.com/qrcode/123.png');
      expect(mockPost).toHaveBeenCalledWith(
        '/orders',
        expect.objectContaining({
          reference_id: `message:${MSG_ID}`,
          items: [
            expect.objectContaining({
              unit_amount: 499,
            }),
          ],
        }),
      );
    });

    it('cria pedido Pix no PagBank para uma página', async () => {
      vi.spyOn(prisma.page, 'findUnique').mockResolvedValue({
        id: PAGE_ID,
        userId: USER_ID,
        paymentStatus: 'pending',
      } as any);

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: USER_ID,
        email: 'thiago@example.com',
      } as any);

      vi.spyOn(prisma.page, 'update').mockResolvedValue({} as any);

      const mockPost = vi.fn().mockResolvedValue({
        data: {
          id: 'ORDE_PAGE_987',
          reference_id: `page:${PAGE_ID}`,
          qr_codes: [
            {
              id: 'QRCO_PAGE',
              amount: { value: 499 },
              text: '00020126_pix_page...',
              links: [],
              expiration_date: new Date().toISOString(),
            },
          ],
        },
      });

      vi.mocked(axios.create).mockReturnValue({
        post: mockPost,
      } as any);

      const result = await pagbankService.createPixPaymentForResource(
        { resourceType: 'page', resourceId: PAGE_ID },
        USER_ID,
      );

      expect(result.paymentId).toBe('ORDE_PAGE_987');
      expect(result.paymentProvider).toBe('pagbank');
      expect(result.pixQrCode).toBe('00020126_pix_page...');
    });
  });

  describe('createCreditCardPaymentForResource', () => {
    it('processa cartão transparente e aprova cobrança', async () => {
      vi.spyOn(prisma.message, 'findUnique').mockResolvedValue({
        id: MSG_ID,
        userId: USER_ID,
        paymentStatus: 'pending',
      } as any);

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: USER_ID,
        email: 'thiago@example.com',
      } as any);

      vi.spyOn(prisma.message, 'updateMany').mockResolvedValue({ count: 1 } as any);

      const mockPost = vi.fn().mockResolvedValue({
        data: {
          id: 'ORDE_CARD_123',
          charges: [
            {
              id: 'CHAR_123',
              status: 'PAID',
              amount: { value: 499, currency: 'BRL' },
            },
          ],
        },
      });

      vi.mocked(axios.create).mockReturnValue({
        post: mockPost,
      } as any);

      const result = await pagbankService.createCreditCardPaymentForResource(
        { resourceType: 'message', resourceId: MSG_ID },
        USER_ID,
        {
          encrypted: 'enc_card_token_abc',
          holderName: 'Thiago Costa',
        },
      );

      expect(result.status).toBe('paid');
      expect(result.paymentProvider).toBe('pagbank');
    });
  });

  describe('handleWebhook', () => {
    it('processa webhook de pedido pago e atualiza página (confirmação server-side)', async () => {
      const updateManySpy = vi.spyOn(prisma.page, 'updateMany').mockResolvedValue({ count: 1 } as any);

      // O corpo do webhook não é confiável: apenas o id é usado e o status real
      // é confirmado via GET /orders/{id} com o token da API.
      const mockGet = vi.fn().mockResolvedValue({
        data: {
          id: 'ORDE_WEBHOOK_123',
          reference_id: `page:${PAGE_ID}`,
          charges: [
            {
              id: 'CHAR_123',
              status: 'PAID',
            },
          ],
        },
      });

      vi.mocked(axios.create).mockReturnValue({
        get: mockGet,
      } as any);

      const result = await pagbankService.handleWebhook({ id: 'ORDE_WEBHOOK_123' });

      expect(mockGet).toHaveBeenCalledWith('/orders/ORDE_WEBHOOK_123');
      expect(result.received).toBe(true);
      expect(result.type).toBe('page');
      expect(updateManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: PAGE_ID, paymentStatus: { not: 'paid' } },
        }),
      );
    });

    it('processa webhook de assinatura paga', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: USER_ID,
        subscriptionStatus: 'none',
        subscriptionExpiresAt: null,
      } as any);

      vi.spyOn(prisma.subscription, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma, '$transaction').mockResolvedValue([] as any);

      const mockGet = vi.fn().mockResolvedValue({
        data: {
          id: 'ORDE_SUB_123',
          reference_id: `subscription:${USER_ID}`,
          charges: [
            {
              id: 'CHAR_SUB',
              status: 'PAID',
            },
          ],
        },
      });

      vi.mocked(axios.create).mockReturnValue({
        get: mockGet,
      } as any);

      const result = await pagbankService.handleWebhook({ id: 'ORDE_SUB_123' });
      expect(result.received).toBe(true);
      expect(result.type).toBe('subscription');
    });

    it('ignora payload forjado sem pedido correspondente na API (anti-forjamento)', async () => {
      const updateManySpy = vi.spyOn(prisma.page, 'updateMany');

      // Atacante envia charges PAID forjados no corpo — mas a consulta à API
      // falha/não encontra o pedido, então nada é marcado como pago.
      vi.mocked(axios.create).mockReturnValue({
        get: vi.fn().mockRejectedValue(new Error('order not found')),
      } as any);

      const result = await pagbankService.handleWebhook({
        id: 'ORDE_FORJADO',
        reference_id: `page:${PAGE_ID}`,
        charges: [{ id: 'CHAR_FAKE', status: 'PAID' }],
      });

      expect(result.received).toBe(true);
      expect(result.status).toBe('ignored_order_lookup_failed');
      expect(updateManySpy).not.toHaveBeenCalled();
    });

    it('ignora payload sem order id', async () => {
      const result = await pagbankService.handleWebhook({
        reference_id: `page:${PAGE_ID}`,
        charges: [{ id: 'CHAR_FAKE', status: 'PAID' }],
      });

      expect(result.received).toBe(true);
      expect(result.status).toBe('ignored_no_order_id');
    });
  });
});
