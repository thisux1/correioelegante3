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

export async function sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<{ success: boolean; id?: string }> {
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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fdf2f8; margin: 0; padding: 24px; color: #1e1b4b; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 40px 32px; border: 1px solid #fbcfe8; box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.08); }
    .logo { text-align: center; margin-bottom: 24px; }
    .logo-text { font-size: 22px; font-weight: 800; color: #e11d48; letter-spacing: -0.5px; margin: 0; }
    h1 { font-size: 20px; font-weight: 700; color: #0f172a; text-align: center; margin-top: 0; margin-bottom: 16px; }
    p { font-size: 15px; line-height: 1.6; color: #475569; margin: 12px 0; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #e11d48, #be123c); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.3); }
    .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
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
    <p style="font-size: 13px; color: #64748b;">
      Este link é seguro e expira automaticamente em <strong>60 minutos</strong>.
    </p>
    <p style="font-size: 13px; color: #64748b;">
      Se você não solicitou a redefinição de senha, nenhuma ação é necessária. Sua conta continua segura.
    </p>
    <div class="footer">
      <p>Caso o botão não funcione, copie e cole este link no seu navegador:</p>
      <p class="link-fallback">${params.resetUrl}</p>
      <p style="margin-top: 16px;">© ${new Date().getFullYear()} Correio Elegante Studio. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;

  if (!client) {
    console.warn(`[EmailService] RESEND_API_KEY não configurada. E-mail simulado para: ${params.to} com URL: ${params.resetUrl}`);
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
      return { success: false };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[EmailService] Falha de conexão com Resend:', err);
    return { success: false };
  }
}
