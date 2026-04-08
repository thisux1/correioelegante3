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

## 🚀 Guia de Configuração e Execução

Siga a ordem abaixo para configurar, instalar e rodar o projeto localmente da forma correta.

### 1. Pré-requisitos
- Node.js 18+
- Serviços de terceiros configurados caso deseje utilizar todas as features (MongoDB Atlas, Cloudinary, Stripe, Mercado Pago).

### 2. Variáveis de Ambiente
Antes de instalar tudo, configure as credenciais do backend:

```bash
cd backend
cp .env.example .env
```
Edite o arquivo `backend/.env` recém-criado com as suas informações:

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor (default: 3001) |
| `NODE_ENV` | `development` ou `production` |
| `FRONTEND_URL` | URL do frontend para CORS e Cookies |
| `DATABASE_URL` | URL de conexão do Prisma (ex: MongoDB Atlas) |
| `JWT_SECRET` | Chave secreta para Access Tokens |
| `JWT_REFRESH_SECRET` | Chave secreta para Refresh Tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloud name do Cloudinary |
| `CLOUDINARY_API_KEY` | API Key do Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret do Cloudinary |
| `STRIPE_SECRET_KEY` | Secret Key do Stripe (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook Secret do Stripe (`whsec_...`) |
| `MP_ACCESS_TOKEN` | Access Token do Mercado Pago |
| `MP_PUBLIC_KEY` | Public Key do Mercado Pago |

### 3. Instalação de Dependências
Volte para a raiz do repositório para instalar as dependências do frontend e backend:
```bash
npm install --prefix frontend
npm install --prefix backend
```

### 4. Configuração do Banco de Dados (Prisma)
Entre na pasta do backend para gerar o cliente do Prisma e rodar as migrações:
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 5. Inicialização do Projeto (Ambiente Dev)
Para rodar tanto o frontend (porta 5173) quanto o backend (porta 3000) simultaneamente, volte para a raiz do repositório e rode:
```bash
npm run all
```
*(Opcional) Execução isolada: `npm run dev` dentro de `frontend/` ou `backend/` separadamente.*

---

## 🛠 Outros Comandos e Ferramentas Úteis

Após configurar o projeto, você tem à disposição diversos scripts de qualidade e build, divididos por área.

### Comandos de Frontend (`frontend/`)
- **Linting de código:** `npm run lint`
- **Geração de Build:** `npm run build`
- **Rodar todos os testes:** `npm run test`
- **Testes Smoke E2E:** `npm run e2e:smoke`

**Testes Vitest Específicos (Frontend):**
- Por arquivo: `npm run test -- src/editor/components/MediaField.test.ts`
- Por nome/descrição: `npm run test -- -t "status feedback"`
- Combinado: `npm run test -- src/editor/components/MediaField.test.ts -t "shows ready state"`

### Comandos de Backend (`backend/`)
- **Gerar Build:** `npm run build`
- **Rodar o servidor compilado:** `npm start`
- **Acessar interface do Banco (Prisma Studio):** `npm run prisma:studio`
- **Rodar todos os testes:** `npm run test`
- **Testes em tempo real (watch):** `npm run test:watch`
- **Relatório de Cobertura (coverage):** `npm run test:coverage`

**Testes Vitest Específicos (Backend):**
- Por arquivo: `npm run test -- src/__tests__/auth/auth.controller.test.ts`
- Por nome/descrição: `npm run test -- -t "should refresh token"`
- Combinado: `npm run test -- src/__tests__/payments/payment.service.test.ts -t "creates checkout"`

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
- ✅ Responsivo (Mobile First)
- ✅ Qualidade de Código (ESLint + Prettier + Polimento Geral)
- ✅ Testes automatizados (Vitest + Supertest)
