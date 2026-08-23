import { PaymentTarget } from './pagbank.service';

/**
 * Mercado Pago — DESATIVADO (provedor fora de uso).
 *
 * O SDK (`mercadopago`) foi removido das dependências para eliminar CVEs
 * herdadas (uuid <11.1.1). Para reativar o provedor:
 *   1. `npm install mercadopago`
 *   2. Restaurar este serviço a partir do histórico do git
 *   3. Descomentar o webhook em routes/payment.routes.ts e os branches
 *      `mercadopago_checkout` em controllers/payment.controller.ts
 *   4. Reconfigurar MERCADOPAGO_ACCESS_TOKEN / MERCADOPAGO_WEBHOOK_SECRET
 */

/**
 * Sincronização de status legado: mantida como no-op seguro para pagamentos
 * antigos do Mercado Pago que permanecerem pendentes no banco. Sem o SDK,
 * não há como consultar a API — o status permanece o atual.
 */
export async function syncMercadoPagoPaymentStatus(
  _target: PaymentTarget,
  _paymentId: string,
): Promise<string> {
  console.warn('[MERCADOPAGO] Provedor desativado — sincronização de status ignorada.');
  return 'pending';
}
