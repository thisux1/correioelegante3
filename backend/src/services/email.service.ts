import { Resend } from 'resend';

let resendClient: Resend | null = null;

// Escapa conteúdo fornecido por usuários antes de interpolar em templates HTML,
// prevenindo HTML injection / phishing via e-mails transacionais.
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

// Estilos e componentes reutilizáveis para os e-mails com a identidade visual do Correio Elegante
const EMAIL_BASE_STYLES = `
  body {
    margin: 0;
    padding: 0;
    background-color: #fff5f7;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #4c0519;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .wrapper {
    width: 100%;
    background-color: #fff5f7;
    padding: 36px 12px 48px;
    box-sizing: border-box;
  }
  .envelope-card {
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 28px;
    border: 1px solid #fecdd3;
    box-shadow: 0 16px 36px -8px rgba(225, 29, 72, 0.09), 0 4px 12px rgba(0, 0, 0, 0.03);
    overflow: hidden;
  }
  .envelope-header {
    background: linear-gradient(180deg, #ffe4ec 0%, #fff5f7 100%);
    padding: 36px 28px 24px;
    text-align: center;
    border-bottom: 1px dashed #fda4af;
    position: relative;
  }
  .brand-title {
    font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
    font-size: 24px;
    font-weight: 800;
    color: #881337;
    letter-spacing: -0.5px;
    margin: 12px 0 2px;
  }
  .brand-tagline {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #be123c;
    font-weight: 700;
    margin: 0;
  }
  .envelope-body {
    padding: 36px 36px 32px;
  }
  @media only screen and (max-width: 480px) {
    .envelope-body {
      padding: 24px 20px 24px;
    }
    .envelope-header {
      padding: 28px 16px 20px;
    }
  }
  h1 {
    font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
    font-size: 22px;
    font-weight: 700;
    color: #4c0519;
    margin: 0 0 16px;
    line-height: 1.3;
  }
  p {
    font-size: 15px;
    line-height: 1.65;
    color: #701a35;
    margin: 14px 0;
  }
  .wax-seal {
    display: inline-block;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e11d48 0%, #9f1239 100%);
    box-shadow: 0 6px 16px rgba(225, 29, 72, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.4);
    border: 2px solid #ffffff;
    text-align: center;
    line-height: 48px;
    vertical-align: middle;
  }
  .protocol-badge {
    display: inline-block;
    background: #ffe4ec;
    border: 1px solid #fecdd3;
    color: #e11d48;
    font-family: 'SF Mono', Consolas, Monaco, monospace;
    font-size: 13px;
    font-weight: 800;
    padding: 6px 14px;
    border-radius: 12px;
    letter-spacing: 0.5px;
  }
  .highlight-card {
    background: #fffafb;
    border: 1px solid #ffe4ec;
    border-left: 4px solid #e11d48;
    border-radius: 4px 16px 16px 4px;
    padding: 20px 24px;
    margin: 24px 0;
  }
  .highlight-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 800;
    color: #e11d48;
    margin-bottom: 8px;
  }
  .highlight-content {
    font-size: 14px;
    line-height: 1.65;
    color: #4c0519;
    white-space: pre-wrap;
  }
  .quote-card {
    background: #fdf2f4;
    border-radius: 14px;
    padding: 16px 20px;
    margin-top: 20px;
    border: 1px solid #ffe4ec;
  }
  .quote-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 700;
    color: #9f1239;
    margin-bottom: 6px;
  }
  .quote-body {
    font-size: 13px;
    line-height: 1.6;
    color: #701a35;
    font-style: italic;
    white-space: pre-wrap;
  }
  .btn-container {
    text-align: center;
    margin: 32px 0 24px;
  }
  .btn-primary {
    display: inline-block;
    background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
    color: #ffffff !important;
    text-decoration: none;
    padding: 15px 36px;
    border-radius: 14px;
    font-weight: 700;
    font-size: 15px;
    box-shadow: 0 8px 20px -4px rgba(225, 29, 72, 0.4);
  }
  .envelope-footer {
    background: #fff5f7;
    border-top: 1px solid #fecdd3;
    padding: 24px 28px;
    text-align: center;
    font-size: 12px;
    line-height: 1.6;
    color: #881337;
  }
  .footer-sub {
    font-size: 11px;
    color: #9f1239;
    margin-top: 8px;
  }
  .stamp-mark {
    display: inline-block;
    border: 1.5px dashed #fda4af;
    border-radius: 8px;
    padding: 4px 10px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #be123c;
    font-weight: 700;
    margin-bottom: 10px;
  }
`;

export interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
  userName?: string;
}

export async function sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getResendClient();
  const from = process.env.EMAIL_FROM || 'Correio Elegante <contato@correioelegante.studio>';

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha - Correio Elegante</title>
  <style>${EMAIL_BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="envelope-card">
      <div class="envelope-header">
        <div class="wax-seal">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" style="margin-top: 13px; display: inline-block;">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div class="brand-title">Correio Elegante</div>
        <p class="brand-tagline">Correspondência Digital</p>
      </div>

      <div class="envelope-body">
        <h1>Redefinição de Senha</h1>
        <p>Olá${params.userName ? `, <strong>${escapeHtml(params.userName)}</strong>` : ''}!</p>
        <p>Recebemos uma solicitação segura para criar uma nova senha para sua conta no <strong>Correio Elegante</strong>.</p>
        <p>Para prosseguir com a redefinição, clique no botão abaixo:</p>

        <div class="btn-container">
          <a href="${escapeHtml(params.resetUrl)}" class="btn-primary" target="_blank">Redefinir Minha Senha</a>
        </div>

        <p style="font-size: 13px; color: #881337; text-align: center; margin-top: 24px;">
          Este link de acesso é protegido e expira automaticamente em <strong>60 minutos</strong>.
        </p>
      </div>

      <div class="envelope-footer">
        <div class="stamp-mark">Segurança & Autenticação</div>
        <p>Se você não solicitou a troca de senha, fique tranquilo. Sua conta permanece segura e nenhuma ação é necessária.</p>
        <p class="footer-sub">&copy; ${new Date().getFullYear()} Correio Elegante &bull; correioelegante.studio</p>
      </div>
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

export interface SendEmailVerificationEmailParams {
  to: string;
  verifyUrl: string;
}

export async function sendEmailVerificationEmail(params: SendEmailVerificationEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getResendClient();
  const from = process.env.EMAIL_FROM || 'Correio Elegante <contato@correioelegante.studio>';

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificação de E-mail - Correio Elegante</title>
  <style>${EMAIL_BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="envelope-card">
      <div class="envelope-header">
        <div class="wax-seal">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" style="margin-top: 13px; display: inline-block;">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div class="brand-title">Correio Elegante</div>
        <p class="brand-tagline">Confirmação de Cadastro</p>
      </div>

      <div class="envelope-body">
        <h1>Verificação de E-mail</h1>
        <p>Olá!</p>
        <p>Recebemos o seu cadastro no <strong>Correio Elegante</strong>. Para confirmar que este endereço de e-mail pertence a você, clique no botão abaixo:</p>

        <div class="btn-container">
          <a href="${escapeHtml(params.verifyUrl)}" class="btn-primary" target="_blank">Confirmar Meu E-mail</a>
        </div>

        <p style="font-size: 13px; color: #881337; text-align: center; margin-top: 24px;">
          Este link é válido por <strong>24 horas</strong> e pode ser utilizado apenas uma vez.
        </p>
      </div>

      <div class="envelope-footer">
        <div class="stamp-mark">Confirmação de Conta</div>
        <p>Se você não criou uma conta no Correio Elegante, fique tranquilo. Basta ignorar esta mensagem e nenhuma ação será necessária.</p>
        <p class="footer-sub">&copy; ${new Date().getFullYear()} Correio Elegante &bull; correioelegante.studio</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  if (!client) {
    console.warn(`[EmailService] RESEND_API_KEY não configurada. E-mail de verificação simulado para: ${params.to}`);
    return { success: true, id: 'simulated_no_key' };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to: params.to,
      subject: 'Confirme seu e-mail - Correio Elegante',
      html: htmlContent,
    });

    if (error) {
      console.error('[EmailService] Erro ao enviar e-mail de verificação via Resend:', error);
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
  const from = process.env.EMAIL_FROM || 'Correio Elegante <contato@correioelegante.studio>';

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chamado Recebido #${params.protocol} - Correio Elegante</title>
  <style>${EMAIL_BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="envelope-card">
      <div class="envelope-header">
        <div class="wax-seal">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" style="margin-top: 13px; display: inline-block;">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div class="brand-title">Correio Elegante</div>
        <p class="brand-tagline">Central de Atendimento</p>
      </div>

      <div class="envelope-body">
        <div style="text-align: center; margin-bottom: 20px;">
          <span class="protocol-badge">PROTOCOLO: ${escapeHtml(params.protocol)}</span>
        </div>

        <h1>Chamado Registrado com Sucesso</h1>
        <p>Olá, <strong>${escapeHtml(params.recipientName)}</strong>!</p>
        <p>Sua solicitação sobre <strong>${escapeHtml(params.subject)}</strong> foi recebida e encaminhada para a nossa equipe de atendimento.</p>

        <div class="highlight-card">
          <div class="highlight-title">Resumo da sua mensagem:</div>
          <div class="highlight-content">${escapeHtml(params.message)}</div>
        </div>

        <p>Já estamos analisando sua mensagem e responderemos diretamente neste endereço de e-mail assim que concluirmos o atendimento.</p>
      </div>

      <div class="envelope-footer">
        <div class="stamp-mark">Protocolo Oficial #${params.protocol}</div>
        <p>Para acompanhar ou enviar novos dados, basta responder a este e-mail mantendo o número do protocolo.</p>
        <p class="footer-sub">&copy; ${new Date().getFullYear()} Correio Elegante &bull; correioelegante.studio</p>
      </div>
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
  const from = process.env.EMAIL_FROM || 'Correio Elegante <contato@correioelegante.studio>';

  const rawAdmins = process.env.ADMIN_EMAILS || 'contato@correioelegante.studio';
  const adminRecipients = rawAdmins
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  const targetEmail = adminRecipients[0] || 'contato@correioelegante.studio';

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Chamado [${params.protocol}] - Correio Elegante</title>
  <style>${EMAIL_BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="envelope-card">
      <div class="envelope-header">
        <div class="wax-seal">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" style="margin-top: 13px; display: inline-block;">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div class="brand-title">Correio Elegante</div>
        <p class="brand-tagline">Painel de Atendimento</p>
      </div>

      <div class="envelope-body">
        <div style="text-align: center; margin-bottom: 18px;">
          <span class="protocol-badge">NOVO CHAMADO: ${escapeHtml(params.protocol)}</span>
        </div>

        <h1>${escapeHtml(params.subject)}</h1>
        <p><strong>Cliente:</strong> ${escapeHtml(params.name)} &lt;<a href="mailto:${escapeHtml(params.email)}" style="color: #e11d48; text-decoration: none;">${escapeHtml(params.email)}</a>&gt;</p>
        ${params.orderRef ? `<p><strong>Referência / Carta:</strong> <code style="background: #ffe4ec; padding: 2px 6px; border-radius: 6px; font-family: monospace; font-size: 13px;">${escapeHtml(params.orderRef)}</code></p>` : ''}

        <div class="highlight-card">
          <div class="highlight-title">Mensagem enviada pelo cliente:</div>
          <div class="highlight-content">${escapeHtml(params.message)}</div>
        </div>

        <div class="btn-container">
          <a href="https://correioelegante.studio/chamados" class="btn-primary" target="_blank">Acessar Central de Chamados</a>
        </div>
      </div>

      <div class="envelope-footer">
        <div class="stamp-mark">Painel Administrativo</div>
        <p>Notificação automática enviada para a equipe de suporte do Correio Elegante.</p>
        <p class="footer-sub">&copy; ${new Date().getFullYear()} Correio Elegante &bull; correioelegante.studio</p>
      </div>
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
  const from = process.env.EMAIL_FROM || 'Correio Elegante <contato@correioelegante.studio>';

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resposta ao Chamado #${params.protocol} - Correio Elegante</title>
  <style>${EMAIL_BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="envelope-card">
      <div class="envelope-header">
        <div class="wax-seal">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" style="margin-top: 13px; display: inline-block;">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div class="brand-title">Correio Elegante</div>
        <p class="brand-tagline">Retorno Oficial de Atendimento</p>
      </div>

      <div class="envelope-body">
        <div style="text-align: center; margin-bottom: 18px;">
          <span class="protocol-badge">PROTOCOLO: ${escapeHtml(params.protocol)}</span>
        </div>

        <h1>Resposta ao seu Chamado</h1>
        <p>Olá, <strong>${escapeHtml(params.recipientName)}</strong>!</p>
        <p>Nossa equipe revisou sua mensagem sobre <strong>${escapeHtml(params.subject)}</strong> e preparou o seguinte retorno:</p>

        <div class="highlight-card">
          <div class="highlight-title">Mensagem da Equipe:</div>
          <div class="highlight-content">${escapeHtml(params.replyMessage)}</div>
        </div>

        <div class="quote-card">
          <div class="quote-title">Sua solicitação original:</div>
          <div class="quote-body">${escapeHtml(params.originalMessage)}</div>
        </div>

        <p style="margin-top: 24px;">Caso ainda tenha qualquer dúvida ou necessite de suporte complementar, basta responder a este e-mail.</p>
      </div>

      <div class="envelope-footer">
        <div class="stamp-mark">Atendimento ao Cliente</div>
        <p>Agradecemos por fazer parte do Correio Elegante. Estamos à disposição para ajudar.</p>
        <p class="footer-sub">&copy; ${new Date().getFullYear()} Correio Elegante &bull; correioelegante.studio</p>
      </div>
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
