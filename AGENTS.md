# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Correio Elegante é uma plataforma digital de "cartas de amor" (Português Brasileiro) onde usuários criam mensagens temáticas, pagam via Stripe (Cartão/Boleto) ou Mercado Pago (Pix), e compartilham links públicos. É um monorepo com diretórios `frontend/` e `backend/` independentes, cada um com seu próprio `package.json`.
 and `node_modules`.

## Commands

### Running both services together (from root)
```
npm run all
```

### Backend (from `backend/`)
- **Dev server:** `npm run dev` (uses `tsx watch`, runs on port 3000)
- **Build:** `npm run build` (TypeScript compilation to `dist/`)
- **Production:** `npm start` (runs `node dist/server.js`)
- **Prisma generate:** `npm run prisma:generate`
- **Prisma migrate:** `npm run prisma:migrate`
- **Prisma Studio:** `npm run prisma:studio`

### Frontend (from `frontend/`)
- **Dev server:** `npm run dev` (Vite, port 5173)
- **Build:** `npm run build` (TypeScript check + Vite build)
- **Lint:** `npm run lint` (ESLint with typescript-eslint + react-hooks + react-refresh)
- **Preview production build:** `npm run preview`

- `node scripts/extract-frames.js` — Extrai frames de vídeo para WebP para a animação do hero em `frontend/public/hero-frames/`
- `node scripts/analyze-video.js` — Analisa metadados de vídeo com ffprobe

### Testes e CI (GitHub Actions)
- **CI Workflow:** Localizado em `.github/workflows/ci.yml`. Executa testes de backend, lint e build de frontend em cada push para `main`/`master`.
- **Backend Tests:** Localizados em `backend/src/__tests__`. Usa Vitest + Supertest. `npm test` para rodar.

## Architecture

### Backend (`backend/src/`)
Express 5 + TypeScript API seguindo o padrão **routes → controllers → services → Prisma**.

- **Entry:** `server.ts` carrega dotenv e inicia o app; `app.ts` configura middlewares e rotas.
- **Service Layer:** Localizada em `services/`, centraliza a lógica de negócio e integrações (Stripe, Cloudinary, Auth).
- **Routes** (`routes/`): Define endpoints and attach `authenticate` and `validate` middleware. Three route groups: `/api/auth`, `/api/messages`, `/api/payments`.
- **Controllers** (`controllers/`): Each controller instantiates its own `new PrismaClient()`. Async handlers throw `AppError` for error responses — the global `errorHandler` middleware catches these.
- **Auth flow:** JWT access tokens (15min) sent in response JSON; refresh tokens (7d) stored as httpOnly cookies. The `authenticate` middleware reads `Authorization: Bearer <token>` and injects `req.userId` via `AuthRequest` interface.
- **Validation:** Zod schemas in `utils/validation.ts` used via the `validate` middleware, which parses `req.body` and replaces it with the validated data.
- **Pagamento:** Integração híbrida com Stripe (Cartão, Boleto, Apple/Google Pay) e Mercado Pago (STUB de Pix). `payment.controller.ts` e `payment.service.ts` gerenciam o fluxo. Cartões públicos (`/api/messages/card/:id`) só ficam visíveis após `paymentStatus === 'paid'`.

### Banco de Dados (Prisma + MongoDB Atlas)
Schema em `backend/prisma/schema.prisma`. Dois modelos principais: `User` e `Message` (1:N). Mensagens possuem `paymentStatus` (`"pending"` | `"paid"`) e opcionais `mediaUrl`/`paymentId`. Usa ObjectIDs do MongoDB.

### Frontend (`frontend/src/`)
React 19 SPA with Vite, Tailwind CSS v4, TypeScript.

- **Bootstrap:** `main.tsx` → `Providers` (Lenis smooth scroll + custom cursor) → `SmoothScroll` → `AppRouter`.
- **Routing** (`app/router.tsx`): All routes wrapped in a `Layout` component. Key routes: `/` (Home), `/create`, `/auth`, `/profile`, `/payment/:messageId`, `/card/:id`.
- **State:** Zustand stores in `store/` — `authStore` (user + accessToken) and `messageStore` (messages list + current message). No persistence; state is in-memory only.
- **API layer** (`services/`): `api.ts` creates an Axios instance with base URL `/api` (proxied to backend by Vite). Includes request interceptor for auth token and response interceptor for automatic token refresh on 401. Service files (`authService.ts`, `messageService.ts`) wrap specific API calls.
- **Path alias:** `@/` maps to `frontend/src/` (configured in both `vite.config.ts` and `tsconfig.app.json`). Backend also has `@/*` alias for `src/*` in `tsconfig.json`.

- **Design System & Animations:** Tailwind v4 com tokens customizados em `index.css`. Glassmorphism via classe `.glass`.
- **Animation stack:** Framer Motion (transições), GSAP (scroll-driven), Lenis (smooth scroll).
- **Canvas Hero:** `HeroVideo.tsx` usa Canvas 2D para renderizar sequências de frames WebP de forma performática.
- **UI components** (`components/ui/`): Badge, Button, Card, Input, Modal, TextArea.

## Conventions

- The entire app uses **Brazilian Portuguese** for user-facing strings, error messages, and variable naming in some places (e.g., `"Credenciais inválidas"`, `"Mensagem não encontrada"`). Keep this consistent.
- Backend error handling: throw `new AppError(message, statusCode, code?)` — never send raw error responses from controllers.
- Vite dev server proxies `/api` requests to `http://localhost:3000`, so the frontend always uses relative `/api/...` paths.
- O backend `.env` exige: `DATABASE_URL` (MongoDB), `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `STRIPE_SECRET_KEY`, `FRONTEND_URL`, `PORT`, `NODE_ENV`.
