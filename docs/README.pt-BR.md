<div align="center">
  <a href="#correio-elegante"><img src="./banner.svg?v=4" alt="Correio Elegante" width="100%"/></a>
</div>

> 🇺🇸 [English version](../README.md)

<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <pre lang="text"><code>CORREIO ELEGANTE · despacho postal
------------------------------------------------
item     : carta digital interativa
editor   : 11 tipos de bloco, drag-and-drop
música   : vinil/cassete + letra sincronizada
selo     : envelope com lacre de cera
preço    : pix R$4,99 · cartão · R$15/mês
entrega  : link público ou QR code</code></pre>
    </td>
    <td width="50%" valign="top">
      <pre lang="python"><code>class CorreioElegante:
    frontend = ["react 19", "vite 7", "tailwind v4",
                "zustand", "framer motion", "dnd-kit"]
    backend  = ["express 5", "prisma 6", "mongodb",
                "stripe", "pagbank v3", "resend"]
    video    = "remotion 4 · 1920x1080 @ 30fps"
    deploy   = "vercel · correioelegante.studio"</code></pre>
    </td>
  </tr>
</table>

## Badges

<p align="left">
  <img src="https://img.shields.io/badge/React-19.2-e11d48?style=flat-square&logo=react&logoColor=white&labelColor=4c0519" alt="React 19.2" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-e11d48?style=flat-square&logo=typescript&logoColor=white&labelColor=4c0519" alt="TypeScript 5.9" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-e11d48?style=flat-square&logo=tailwindcss&logoColor=white&labelColor=4c0519" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Express-5.1-e11d48?style=flat-square&logo=express&logoColor=white&labelColor=4c0519" alt="Express 5.1" />
  <img src="https://img.shields.io/badge/Prisma_6-MongoDB_Atlas-e11d48?style=flat-square&logo=mongodb&logoColor=white&labelColor=4c0519" alt="Prisma 6 + MongoDB Atlas" />
  <img src="https://img.shields.io/badge/Stripe-checkout-e11d48?style=flat-square&logo=stripe&logoColor=white&labelColor=4c0519" alt="Stripe checkout" />
  <img src="https://img.shields.io/badge/PagBank_V3-pix-e11d48?style=flat-square&labelColor=4c0519" alt="PagBank V3 Pix" />
  <img src="https://img.shields.io/badge/Remotion-4-e11d48?style=flat-square&labelColor=4c0519" alt="Remotion 4" />
  <img src="https://img.shields.io/badge/deploy-correioelegante.studio-d4a574?style=flat-square&labelColor=4c0519" alt="No ar em correioelegante.studio" />
  <img src="https://img.shields.io/badge/licença-MIT-d4a574?style=flat-square&labelColor=4c0519" alt="Licença MIT" />
</p>

---

## O que é

O Correio Elegante é um serviço de cartas digitais pagas. O remetente escreve
em um editor de blocos (texto, fotos, trilha sonora com letra sincronizada,
quizzes, contagem regressiva), lacra o resultado num envelope virtual com
selo de cera e paga por carta avulsa ou num plano mensal. A carta fica bloqueada
até o webhook de pagamento confirmar; a entrega é um link ou QR code que abre a
sequência completa de unboxing para o destinatário. No ar em
`correioelegante.studio`.

O repo é um monorepo sem hoisting: uma SPA em React, uma API em Express, um
workspace de vídeo em Remotion e um entrypoint serverless da Vercel que monta a
API em `/api/*` no mesmo domínio.

---

## A jornada da carta

<div align="center">
  <img src="./architecture.svg?v=2" alt="Fluxo de dados: editor, API, pagamentos, webhook, entrega" width="100%"/>
</div>

1. **Escrita**: o remetente monta a carta no editor React: blocos, tema,
   trilha sonora e uploads de mídia (armazenados no Cloudinary, com transcode
   via worker FFmpeg para arquivos pesados).
2. **Checkout**: a API Express valida o payload com Zod, salva a carta como
   inativa no MongoDB Atlas via Prisma e abre o pagamento: PagBank V3 para Pix
   ou cartão transparente, Stripe Checkout para cartão.
3. **Pagamento**: o remetente conclui na página do gateway ou escaneia o QR
   code Pix (payload EMV copia-e-cola mais PNG hospedado, expiração padrão de
   30 minutos).
4. **Webhook**: o gateway notifica; a API verifica a assinatura, ativa a carta
   e gera a URL pública.
5. **Entrega**: link ou QR code. O destinatário recebe o unboxing do lacre de
   cera, a trilha sonora e cada bloco exatamente como foi desenhado.

---

## O editor

- 11 tipos de bloco: `text`, `image`, `gallery`, `polaroid`, `music`, `video`,
  `envelope`, `timer`, `timeline`, `quiz`, `scratch` (painel secreto de
  raspar). Schema versionado com migração progressiva (`frontend/src/editor/`).
- Reordenação drag-and-drop com dnd-kit, rascunhos com autosave e modos de
  edição e preview.
- O bloco `music` busca letras sincronizadas no LRCLIB e toca em skins de
  vinil ou cassete (`SyncedLyricsView`, `VinylRecord`, `VintagePlayerDeck`).
- Motion com Framer Motion, scroll suave via Lenis e acentos em Lottie; o
  unboxing do envelope é uma sequência de animação feita à mão, sem WebGL.
- Tema claro estrito em todo o produto: fundo papel, primária rosa, texto vinho
  escuro, acentos dourados. Tipografia: Playfair Display, Inter, Dancing Script.

---

## Pagamentos

- **Pix** na Orders API do PagBank V3. A resposta traz o EMV copia-e-cola, a
  URL do QR code em PNG hospedado e o timestamp de expiração.
- **Cartão** via Stripe Checkout (sessão hospedada) ou checkout transparente
  PagBank com payload de cartão criptografado no client.
- **Assinatura**: plano de R$ 15/mês para remetentes frequentes, via Pix PagBank
  ou cartão Stripe (`POST /api/payments/subscription/checkout`).
- **Mercado Pago desativado.** O SDK foi removido por exposição a CVEs; o
  arquivo de serviço virou um no-op documentado para pagamentos legados
  pendentes, com o procedimento de reativação em quatro passos em
  `backend/src/services/mercadopago.service.ts`.
- Webhooks verificam assinatura antes de desbloquear qualquer carta
  (`/api/payments/webhook/pagbank`, Stripe). Cloudflare Turnstile protege a
  criação de checkouts; endpoints de auth têm rate limit de 10 req/min por IP.

---

## Stack

| módulo | stack | papel |
| :--- | :--- | :--- |
| `frontend/` | React 19.2, Vite 7, TypeScript 5.9, Tailwind CSS v4, Zustand, Framer Motion, dnd-kit, Lenis, Lottie, qrcode.react | SPA: landing, editor, visualizador público de cartas |
| `backend/` | Express 5.1, Prisma 6.5, MongoDB Atlas, Zod, JWT, bcryptjs, helmet, express-rate-limit | API REST: auth, cartas, pagamentos, webhooks |
| pipeline de mídia | Cloudinary, Multer, worker FFmpeg/ffprobe | uploads de usuários, transcode + poster |
| comunicação | Resend, Cloudflare Turnstile | e-mail transacional, proteção contra bots |
| `my-video/` | Remotion 4.0, React 19, Tailwind v4 | filme do produto de 90 s, 1920×1080 @ 30 fps |
| `api/` | @vercel/node | wrapper serverless que monta a app Express |
| testes | Vitest 4, Supertest, jsdom | suítes unitárias e de integração em todos os workspaces |

---

## Setup

Pré-requisitos: Node 18+, uma connection string do MongoDB Atlas (replica set,
necessária para transações do Prisma) e chaves de sandbox de Stripe, PagBank,
Cloudinary, Resend e Turnstile.

```bash
npm install
npm install --prefix frontend
npm install --prefix backend
npm install --prefix my-video   # só se for mexer no workspace de vídeo

cp backend/.env.example backend/.env   # depois preencha as chaves
npm run prisma:generate --prefix backend

npm run dev   # backend :3000 + frontend :5173, via concurrently
```

Variáveis essenciais no `backend/.env`:

| variável | o que libera |
| :--- | :--- |
| `DATABASE_URL` | conexão com o MongoDB Atlas |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | tokens de acesso (15 min) + cookie httpOnly de refresh (7 d) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | checkout de cartão + webhooks assinados |
| `PAGBANK_TOKEN` / `PAGBANK_PUBLIC_KEY` / `PAGBANK_ENV` | ordens Pix + cartão transparente (`sandbox` primeiro) |
| `CLOUDINARY_URL` | armazenamento e entrega de mídia |
| `TURNSTILE_SECRET` | verificação anti-bot nos endpoints de checkout |
| `RESEND_API_KEY` / `EMAIL_FROM` | e-mails de verificação e recibo |
| `FRONTEND_URL` | origem do CORS e redirects pós-pagamento |

As variáveis do Mercado Pago existem no `.env.example` apenas para suportar uma
reativação do provedor desativado; fora isso, deixe vazio.

Checagens antes de entregar qualquer coisa:

```bash
npm test          # vitest: frontend + backend
npm run lint      # eslint: frontend + backend + my-video
npm run typecheck # tsc nos três workspaces
npm run build     # builds de produção
```

---

## Estrutura

<pre lang="text"><code>correioelegante3/
├── frontend/          SPA React 19 · landing, editor de blocos, viewer público
│   └── src/editor/    tipos de bloco, temas, autosave, migração de schema
├── backend/           API Express 5 · rotas validadas com zod, services de domínio
│   ├── prisma/        schema MongoDB (11 models: user, message, page, asset...)
│   └── src/services/  pagbank, stripe, cloudinary, resend, media worker
├── my-video/          workspace Remotion 4 · filme do produto de 90 s
├── api/               entrypoint serverless da Vercel que monta a app Express
├── docs/              SVGs de banner e arquitetura
├── graphify-out/      grafo de conhecimento do codebase (graph.html, report)
├── SPEC.md            contratos de API, modelos de dados, máquina de estados
└── ARCHITECTURE.md    pipelines de request e fronteiras de segurança</code></pre>

---

## Docs

`SPEC.md` · contratos de API e a máquina de estados de pagamento  
`ARCHITECTURE.md` · pipelines de request e fronteiras de segurança  
`AGENTS.md` · regras do repo para agentes de código  
`graphify-out/GRAPH_REPORT.md` + `graph.html` · grafo gerado do codebase  
`frontend/README.md` / `my-video/README.md` · notas por workspace

---

MIT © 2026 Thiago Araújo. Veja [LICENSE](../LICENSE).
