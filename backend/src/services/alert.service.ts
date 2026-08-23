import crypto from 'crypto';
import { prisma } from '../utils/prisma';
import { sendNewTicketNotificationToAdmin } from './email.service';

/**
 * Sistema de alertas internos — alternativa leve ao Sentry para esta escala.
 *
 * Quando um evento crítico ocorre (falha em webhook de pagamento, erro 500 etc.),
 * um chamado é aberto automaticamente no painel de suporte e um e-mail é enviado
 * aos administradores, reutilizando a infraestrutura existente (SupportTicket +
 * Resend). Nenhuma dependência externa é adicionada.
 *
 * Deduplicação: alertas com a mesma chave são suprimidos por uma janela de tempo,
 * evitando tempestade de e-mails durante incidentes (ex: gateway fora do ar).
 * A dedupe é in-memory — best effort em ambientes serverless.
 */

const DEDUPE_WINDOW_MS = 15 * 60 * 1000;
const recentAlertKeys = new Map<string, number>();

export type AlertContext =
  | 'stripe_webhook'
  | 'pagbank_webhook'
  | 'payment_sync'
  | 'server_error'
  | 'email_delivery';

function pruneDedupeMap(now: number): void {
  for (const [key, ts] of recentAlertKeys) {
    if (now - ts > DEDUPE_WINDOW_MS) {
      recentAlertKeys.delete(key);
    }
  }
}

export interface CriticalAlert {
  context: AlertContext;
  title: string;
  detail?: string;
  error?: unknown;
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`.slice(0, 500);
  }
  if (typeof error === 'string') {
    return error.slice(0, 500);
  }
  return JSON.stringify(error)?.slice(0, 500) ?? 'erro desconhecido';
}

/**
 * Envia um alerta crítico aos administradores. Nunca lança — falhas de alerta
 * são apenas logadas para não mascarar o erro original nem quebrar o fluxo
 * principal (ex: resposta do webhook).
 */
export async function sendCriticalAlert(alert: CriticalAlert): Promise<void> {
  try {
    const now = Date.now();
    pruneDedupeMap(now);

    const dedupeKey = `${alert.context}:${alert.title}`;
    const lastSent = recentAlertKeys.get(dedupeKey);
    if (lastSent && now - lastSent < DEDUPE_WINDOW_MS) {
      console.warn(`[ALERT] Suprimido (dedupe ${Math.round((now - lastSent) / 1000)}s): ${dedupeKey}`);
      return;
    }
    recentAlertKeys.set(dedupeKey, now);

    const protocol = `ALERT-${crypto.randomInt(100000, 999999)}`;
    const messageParts = [
      `Contexto: ${alert.context}`,
      `Evento: ${alert.title}`,
      alert.detail ? `Detalhes: ${alert.detail.slice(0, 800)}` : null,
      alert.error !== undefined ? `Erro: ${describeError(alert.error)}` : null,
      `Recebido em: ${new Date().toISOString()}`,
    ].filter(Boolean);

    const ticket = await prisma.supportTicket.create({
      data: {
        protocol,
        name: 'Monitor Automático',
        email: 'sistema@correioelegante.studio',
        subject: `[ALERTA] ${alert.title}`.slice(0, 200),
        orderRef: alert.context,
        message: messageParts.join('\n'),
        status: 'open',
      },
    });

    await sendNewTicketNotificationToAdmin({
      protocol,
      name: ticket.name,
      email: ticket.email,
      subject: ticket.subject,
      message: ticket.message,
      orderRef: ticket.orderRef,
    });

    console.error(`[ALERT] Chamado ${protocol} aberto: ${dedupeKey}`, alert.error ?? '');
  } catch (err) {
    // Última linha de defesa: o alerta nunca pode derrubar o fluxo principal.
    console.error('[ALERT] Falha ao disparar alerta crítico:', err);
  }
}
