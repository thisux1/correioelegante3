import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
  userName?: string;
}

export async function sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getResendClient();
  const from = process.env.EMAIL_FROM || 'Correio Elegante <onboarding@resend.dev>';

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha - Correio Elegante</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fff5f7; margin: 0; padding: 24px; color: #4c0519; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 40px 32px; border: 1px solid #fecdd3; box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.08); }
    .logo { text-align: center; margin-bottom: 24px; }
    .logo-text { font-size: 22px; font-weight: 800; color: #e11d48; letter-spacing: -0.5px; margin: 0; }
    h1 { font-size: 20px; font-weight: 700; color: #4c0519; text-align: center; margin-top: 0; margin-bottom: 16px; }
    p { font-size: 15px; line-height: 1.6; color: #701a35; margin: 12px 0; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #e11d48; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; }
    .footer { text-align: center; font-size: 12px; color: #881337; margin-top: 32px; border-top: 1px solid #ffe4ec; padding-top: 20px; }
    .link-fallback { word-break: break-all; font-size: 12px; color: #e11d48; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h2 class="logo-text">Correio Elegante</h2>
    </div>
    <h1>Recuperação de Senha</h1>
    <p>Olá${params.userName ? `, <strong>${params.userName}</strong>` : ''}!</p>
    <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Correio Elegante</strong>.</p>
    <p>Para escolher uma nova senha, clique no botão abaixo:</p>
    <div class="btn-container">
      <a href="${params.resetUrl}" class="btn" target="_blank">Redefinir Minha Senha</a>
    </div>
    <p style="font-size: 13px; color: #701a35;">
      Este link é seguro e expira automaticamente em <strong>60 minutos</strong>.
    </p>
    <div class="footer">
      <p>Caso o botão não funcione, copie e cole este link no seu navegador:</p>
      <p class="link-fallback">${params.resetUrl}</p>
      <p style="margin-top: 16px;">© ${new Date().getFullYear()} Correio Elegante. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;

  if (!client) {
    console.warn(`[EmailService] RESEND_API_KEY não configurada. E-mail simulado para: ${params.to}`);
    return { success: true, id: 'simulated_no_key' };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to: params.to,
      subject: 'Redefinição de Senha - Correio Elegante',
      html: htmlContent,
    });

    if (error) {
      console.error('[EmailService] Erro ao enviar e-mail via Resend:', error);
      return { success: false, error: (error as any).message || JSON.stringify(error) };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[EmailService] Falha de conexão com Resend:', err);
    return { success: false, error: err?.message || 'Falha de conexão com Resend' };
  }
}

export interface SendTicketConfirmationParams {
  to: string;
  recipientName: string;
  protocol: string;
  subject: string;
  message: string;
}

export async function sendTicketConfirmationEmail(params: SendTicketConfirmationParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getResendClient();
  const from = process.env.EMAIL_FROM || 'Correio Elegante <onboarding@resend.dev>';

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chamado Recebido #${params.protocol} - Correio Elegante</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fff5f7; margin: 0; padding: 24px; color: #4c0519; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 40px 32px; border: 1px solid #fecdd3; box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.08); }
    .logo { text-align: center; margin-bottom: 24px; }
    .logo-text { font-size: 22px; font-weight: 800; color: #e11d48; letter-spacing: -0.5px; margin: 0; }
    .badge { display: inline-block; background: #ffe4ec; color: #e11d48; padding: 6px 14px; border-radius: 10px; font-size: 13px; font-weight: 800; font-family: monospace; letter-spacing: 0.5px; margin-bottom: 12px; }
    h1 { font-size: 22px; font-weight: 700; color: #4c0519; margin-top: 0; margin-bottom: 16px; }
    p { font-size: 15px; line-height: 1.6; color: #701a35; margin: 12px 0; }
    .card { background: #fffafb; border: 1px solid #ffe4ec; border-radius: 14px; padding: 20px; margin: 20px 0; }
    .card-title { font-size: 12px; text-transform: uppercase; font-weight: 700; color: #881337; margin-bottom: 6px; }
    .card-content { font-size: 14px; color: #4c0519; white-space: pre-wrap; }
    .footer { text-align: center; font-size: 12px; color: #881337; margin-top: 32px; border-top: 1px solid #ffe4ec; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h2 class="logo-text">Correio Elegante</h2>
    </div>
    <div style="text-align: center;">
      <span class="badge">PROTOCOLO: ${params.protocol}</span>
      <h1>Chamado Registrado com Sucesso</h1>
    </div>
    <p>Olá, <strong>${params.recipientName}</strong>!</p>
    <p>Recebemos sua mensagem sobre <strong>${params.subject}</strong> e ela já foi registrada em nossa central de atendimento.</p>
    
    <div class="card">
      <div class="card-title">Resumo da sua solicitação:</div>
      <div class="card-content">${params.message}</div>
    </div>

    <p>Nossa equipe já está analisando o seu caso e retornará em breve.</p>
    
    <div class="footer">
      <p style="margin-top: 12px;">© ${new Date().getFullYear()} Correio Elegante. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;

  if (!client) {
    console.warn(`[EmailService] RESEND_API_KEY não configurada. E-mail de confirmação simulado para: ${params.to}`);
    return { success: true, id: 'simulated_no_key' };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to: params.to,
      subject: `Chamado Recebido [${params.protocol}] - ${params.subject}`,
      html: htmlContent,
    });

    if (error) {
      console.error('[EmailService] Erro ao enviar confirmação de ticket via Resend:', error);
      return { success: false, error: (error as any).message || JSON.stringify(error) };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[EmailService] Falha de conexão com Resend:', err);
    return { success: false, error: err?.message || 'Falha de conexão com Resend' };
  }
}

export interface SendNewTicketAdminNotificationParams {
  protocol: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  orderRef?: string | null;
}

export async function sendNewTicketNotificationToAdmin(params: SendNewTicketAdminNotificationParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getResendClient();
  const from = process.env.EMAIL_FROM || 'Correio Elegante <onboarding@resend.dev>';

  // Destinatários dos alertas para administradores
  const rawAdmins = process.env.ADMIN_EMAILS || 'thicosta1432@gmail.com,contato@correioelegante.studio';
  const adminRecipients = rawAdmins
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  const targetEmail = adminRecipients[0] || 'thicosta1432@gmail.com';

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Chamado de Suporte [${params.protocol}]</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fff5f7; margin: 0; padding: 24px; color: #4c0519; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px 28px; border: 1px solid #fecdd3; }
    .header { border-bottom: 2px solid #ffe4ec; padding-bottom: 16px; margin-bottom: 20px; }
    .badge { display: inline-block; background: #e11d48; color: #ffffff; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; font-family: monospace; }
    h1 { font-size: 20px; font-weight: 800; color: #4c0519; margin: 12px 0 4px 0; }
    .meta-row { font-size: 13px; color: #701a35; margin: 6px 0; }
    .msg-box { background: #fff5f7; border-left: 4px solid #e11d48; border-radius: 0 12px 12px 0; padding: 18px; margin: 20px 0; }
    .msg-title { font-size: 11px; text-transform: uppercase; font-weight: 800; color: #e11d48; margin-bottom: 6px; }
    .msg-body { font-size: 14px; color: #4c0519; white-space: pre-wrap; line-height: 1.6; }
    .footer { font-size: 12px; color: #881337; margin-top: 24px; border-top: 1px solid #ffe4ec; padding-top: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">NOVO CHAMADO ${params.protocol}</span>
      <h1>${params.subject}</h1>
      <div class="meta-row"><strong>Cliente:</strong> ${params.name} &lt;${params.email}&gt;</div>
      ${params.orderRef ? `<div class="meta-row"><strong>Ref / Carta:</strong> ${params.orderRef}</div>` : ''}
    </div>

    <div class="msg-box">
      <div class="msg-title">Mensagem enviada:</div>
      <div class="msg-body">${params.message}</div>
    </div>

    <div class="footer">
      Acesse o painel em <strong>Configurações &gt; Central de Chamados</strong> ou na página <strong>/contato</strong> para responder.
    </div>
  </div>
</body>
</html>
  `;

  if (!client) {
    console.warn(`[EmailService] RESEND_API_KEY não configurada. Alerta de admin simulado para: ${targetEmail}`);
    return { success: true, id: 'simulated_no_key' };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to: targetEmail,
      subject: `[Novo Chamado ${params.protocol}] ${params.subject} - ${params.name}`,
      html: htmlContent,
    });

    if (error) {
      console.error('[EmailService] Erro ao enviar notificação de admin via Resend:', error);
      return { success: false, error: (error as any).message || JSON.stringify(error) };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[EmailService] Falha de conexão com Resend para admin:', err);
    return { success: false, error: err?.message || 'Falha de conexão com Resend' };
  }
}

export interface SendTicketReplyParams {
  to: string;
  recipientName: string;
  protocol: string;
  subject: string;
  originalMessage: string;
  replyMessage: string;
}

export async function sendTicketReplyEmail(params: SendTicketReplyParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getResendClient();
  const from = process.env.EMAIL_FROM || 'Correio Elegante <onboarding@resend.dev>';

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resposta ao Chamado #${params.protocol} - Correio Elegante</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fff5f7; margin: 0; padding: 24px; color: #4c0519; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 40px 32px; border: 1px solid #fecdd3; box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.08); }
    .logo { text-align: center; margin-bottom: 24px; }
    .logo-text { font-size: 22px; font-weight: 800; color: #e11d48; letter-spacing: -0.5px; margin: 0; }
    .badge { display: inline-block; background: #ffe4ec; color: #e11d48; padding: 6px 14px; border-radius: 10px; font-size: 13px; font-weight: 800; font-family: monospace; letter-spacing: 0.5px; margin-bottom: 12px; }
    h1 { font-size: 22px; font-weight: 700; color: #4c0519; margin-top: 0; margin-bottom: 16px; }
    p { font-size: 15px; line-height: 1.6; color: #701a35; margin: 12px 0; }
    .reply-card { background: #fff0f4; border-left: 4px solid #e11d48; border-radius: 0 14px 14px 0; padding: 20px 24px; margin: 24px 0; }
    .reply-title { font-size: 12px; text-transform: uppercase; font-weight: 800; color: #e11d48; margin-bottom: 8px; letter-spacing: 0.5px; }
    .reply-body { font-size: 15px; color: #4c0519; line-height: 1.7; white-space: pre-wrap; }
    .original-quote { background: #fafafa; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-top: 24px; }
    .quote-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #94a3b8; margin-bottom: 6px; }
    .quote-body { font-size: 13px; color: #64748b; font-style: italic; white-space: pre-wrap; }
    .footer { text-align: center; font-size: 12px; color: #881337; margin-top: 36px; border-top: 1px solid #ffe4ec; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h2 class="logo-text">Correio Elegante</h2>
    </div>
    <div style="text-align: center;">
      <span class="badge">PROTOCOLO: ${params.protocol}</span>
      <h1>Resposta ao seu Chamado</h1>
    </div>
    <p>Olá, <strong>${params.recipientName}</strong>!</p>
    <p>Nossa equipe revisou sua solicitação referente a <strong>${params.subject}</strong> e preparou o seguinte retorno para você:</p>
    
    <div class="reply-card">
      <div class="reply-title">Mensagem da Equipe:</div>
      <div class="reply-body">${params.replyMessage}</div>
    </div>

    <div class="original-quote">
      <div class="quote-title">Sua mensagem original:</div>
      <div class="quote-body">${params.originalMessage}</div>
    </div>

    <div class="footer">
      <p>Caso precise de novos esclarecimentos, basta nos contatar com o protocolo #${params.protocol}.</p>
      <p style="margin-top: 12px;">© ${new Date().getFullYear()} Correio Elegante. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;

  if (!client) {
    console.warn(`[EmailService] RESEND_API_KEY não configurada. E-mail de resposta simulado para: ${params.to}`);
    return { success: true, id: 'simulated_no_key' };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to: params.to,
      subject: `Re: [${params.protocol}] ${params.subject}`,
      html: htmlContent,
    });

    if (error) {
      console.error('[EmailService] Erro ao enviar resposta de ticket via Resend:', error);
      return { success: false, error: (error as any).message || JSON.stringify(error) };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[EmailService] Falha de conexão com Resend:', err);
    return { success: false, error: err?.message || 'Falha de conexão com Resend' };
  }
}
