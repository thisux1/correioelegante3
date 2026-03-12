# Correio Elegante 💌

Plataforma de correio elegante digital com pagamento via Pix (Mercado Pago) e Cartão de Crédito (Stripe).

## Stack

### Frontend
- React 19 + TypeScript
- Vite + Tailwind CSS v4
- Framer Motion + GSAP
- Lenis (smooth scroll)
- Zustand (estado global)
- React Router DOM v7
- Zod
- Axios

### Backend
- Node.js + Express 5
- TypeScript
- Prisma + MongoDB (Atlas)
- JWT (Access + Refresh Token)
- Zod (validação server-side)
- Stripe (Cartão de Crédito — Checkout Session)
- Mercado Pago (Pix — QR Code + Copia e Cola)

## Como Rodar

### Pré-requisitos
- Node.js 18+

### Rodar tudo junto (raiz do projeto)
```bash
npm install
npm run all
```

### Backend (individual)
```bash
cd backend
# Copie e configure as variáveis de ambiente:
cp .env.example .env
npm install
npx prisma generate
npm run dev
```

### Frontend (individual)
```bash
cd frontend
npm install
npm run dev
```

O frontend roda em `http://localhost:5173` e o backend em `http://localhost:3000`.

## Variáveis de Ambiente (backend/.env)

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URI de conexão MongoDB Atlas |
| `JWT_SECRET` | Segredo para tokens de acesso |
| `JWT_REFRESH_SECRET` | Segredo para refresh tokens |
| `CLOUDINARY_CLOUD_NAME` | Nome do cloud Cloudinary |
| `CLOUDINARY_API_KEY` | API Key do Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret do Cloudinary |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe (`whsec_...`) |
| `STRIPE_CHECKOUT_SUCCESS_URL` | URL de retorno após pagamento aprovado no Stripe |
| `STRIPE_CHECKOUT_CANCEL_URL` | URL de retorno após cancelamento no Stripe |
| `MERCADOPAGO_ACCESS_TOKEN` | Access token do Mercado Pago (`TEST-...`) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secret para validar webhooks do Mercado Pago |
| `FRONTEND_URL` | URL do frontend (ex: `http://localhost:5173`) |
| `PORT` | Porta do backend (padrão: `3000`) |
| `NODE_ENV` | `development` ou `production` |

## Deploy na Vercel (pré-produção)

- O frontend é buildado a partir de `frontend/` e publicado como SPA (`frontend/dist`).
- A API Express roda como função serverless via `api/[...all].ts`, mantendo as rotas em `/api/...`.
- Garanta todas as variáveis de ambiente do backend no projeto da Vercel.
- Defina `FRONTEND_URL` com o domínio da Vercel para CORS e cookies em produção.
- Configure os webhooks do Stripe e Mercado Pago apontando para a URL de produção.

## Estrutura

```
correioelegante3/
├── frontend/          # React SPA
│   └── src/
│       ├── app/       # Router + Providers
│       ├── pages/     # Páginas da aplicação
│       ├── components/# Componentes (layout, ui, animations)
│       ├── hooks/     # Hooks reutilizáveis
│       ├── store/     # Zustand stores
│       └── services/  # API service layer (api, authService, messageService)
├── backend/           # Express API
│   ├── prisma/        # Schema (User, Message)
│   └── src/
│       ├── routes/    # Rotas da API (/auth, /messages, /payments)
│       ├── controllers/# Controllers
│       ├── middlewares/# Auth, validation, error handler
│       ├── services/  # auth, message, upload, stripe, mercadopago
│       ├── utils/     # JWT, Zod schemas, AppError, Prisma singleton
│       └── __tests__/ # Testes Backend (Vitest + Supertest)
└── README.md
```

## Funcionalidades

- ✅ Autenticação (registro/login com JWT + refresh token httpOnly)
- ✅ Criação de mensagens com temas
- ✅ Pagamento Pix via Mercado Pago (QR Code + Copia e Cola)
- ✅ Pagamento por Cartão via Stripe Checkout Session
- ✅ Webhooks independentes por gateway (`/api/payments/webhook/stripe` e `/webhook/mercadopago`)
- ✅ Visualização pública de cartão (somente após pagamento confirmado)
- ✅ Perfil com histórico de mensagens
- ✅ Animações avançadas e Hero com Canvas 2D
- ✅ CI/CD com GitHub Actions
- ✅ Design system com glassmorphism
- ✅ Smooth scroll com Lenis
- ✅ Responsivo
- ✅ Testes automatizados (47 testes, Vitest + Supertest)
