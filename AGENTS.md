# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Correio Elegante is a digital "love letter" platform (Brazilian Portuguese) where users create themed messages, pay via Pix (Mercado Pago), and share public card links. It is a monorepo with separate `frontend/` and `backend/` directories, each with their own `package.json` and `node_modules`.

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

### Video asset scripts (from root)
- `node scripts/extract-frames.js` — Extracts video frames to WebP for the hero animation in `frontend/public/hero-frames/`
- `node scripts/analyze-video.js` — Analyzes video metadata with ffprobe

## Architecture

### Backend (`backend/src/`)
Express 5 + TypeScript API following a **routes → controllers → Prisma** pattern (no dedicated service layer files currently exist despite the `services/` directory).

- **Entry:** `server.ts` loads dotenv and starts the app; `app.ts` wires middleware and routes.
- **Routes** (`routes/`): Define endpoints and attach `authenticate` and `validate` middleware. Three route groups: `/api/auth`, `/api/messages`, `/api/payments`.
- **Controllers** (`controllers/`): Each controller instantiates its own `new PrismaClient()`. Async handlers throw `AppError` for error responses — the global `errorHandler` middleware catches these.
- **Auth flow:** JWT access tokens (15min) sent in response JSON; refresh tokens (7d) stored as httpOnly cookies. The `authenticate` middleware reads `Authorization: Bearer <token>` and injects `req.userId` via `AuthRequest` interface.
- **Validation:** Zod schemas in `utils/validation.ts` used via the `validate` middleware, which parses `req.body` and replaces it with the validated data.
- **Payment:** Mercado Pago integration is stubbed — `payment.controller.ts` has placeholder logic. Public cards (`/api/messages/card/:id`) are only visible after `paymentStatus === 'paid'`.

### Database (Prisma + PostgreSQL)
Schema in `backend/prisma/schema.prisma`. Two models: `User` and `Message` (1:N). Messages have `paymentStatus` (`"pending"` | `"paid"`) and optional `mediaUrl`/`paymentId`. UUIDs for all IDs.

### Frontend (`frontend/src/`)
React 19 SPA with Vite, Tailwind CSS v4, TypeScript.

- **Bootstrap:** `main.tsx` → `Providers` (Lenis smooth scroll + custom cursor) → `SmoothScroll` → `AppRouter`.
- **Routing** (`app/router.tsx`): All routes wrapped in a `Layout` component. Key routes: `/` (Home), `/create`, `/auth`, `/profile`, `/payment/:messageId`, `/card/:id`.
- **State:** Zustand stores in `store/` — `authStore` (user + accessToken) and `messageStore` (messages list + current message). No persistence; state is in-memory only.
- **API layer** (`services/`): `api.ts` creates an Axios instance with base URL `/api` (proxied to backend by Vite). Includes request interceptor for auth token and response interceptor for automatic token refresh on 401. Service files (`authService.ts`, `messageService.ts`) wrap specific API calls.
- **Path alias:** `@/` maps to `frontend/src/` (configured in both `vite.config.ts` and `tsconfig.app.json`). Backend also has `@/*` alias for `src/*` in `tsconfig.json`.

### Design System & Animations
- **Tailwind v4** with custom theme tokens defined in `index.css` using `@theme` (colors: primary/rose palette, gold accents; fonts: Inter, Playfair Display, Dancing Script).
- **Glassmorphism:** `.glass` utility class in `index.css` (backdrop blur + semi-transparent white + border).
- **Animation stack:** Framer Motion for component transitions, GSAP for complex scroll-driven animations, Lenis for smooth scrolling. Animation components are in `components/animations/` (ScrollReveal, ParallaxSection, CardTilt3D, MagneticButton, CustomCursor, HeroAnimation, etc.).
- **UI components** (`components/ui/`): Badge, Button, Card, Input, Modal, TextArea.

## Conventions

- The entire app uses **Brazilian Portuguese** for user-facing strings, error messages, and variable naming in some places (e.g., `"Credenciais inválidas"`, `"Mensagem não encontrada"`). Keep this consistent.
- Backend error handling: throw `new AppError(message, statusCode, code?)` — never send raw error responses from controllers.
- Vite dev server proxies `/api` requests to `http://localhost:3000`, so the frontend always uses relative `/api/...` paths.
- The backend `.env` requires: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `MERCADOPAGO_ACCESS_TOKEN`, `FRONTEND_URL`, `PORT`, `NODE_ENV`.
