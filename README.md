# Correio Elegante 💌

Plataforma de correio elegante digital com pagamento via Pix e QR Code.

## Stack

### Frontend
- React 19 + TypeScript
- Vite + Tailwind CSS v4
- Framer Motion + GSAP
- Lenis (smooth scroll)
- Zustand (estado global)
- React Router DOM v7
- React Hook Form + Zod
- Axios

### Backend
- Node.js + Express 5
- TypeScript
- Prisma + MongoDB (Atlas)
- JWT (Access + Refresh Token)
- Zod (validação server-side)
- Stripe (Pagamentos)

## Como Rodar

### Pré-requisitos
- Node.js 18+
- PostgreSQL

### Backend
```bash
cd backend
cp .env.example .env
# Configure DATABASE_URL (MongoDB) no .env
npm install
npx prisma generate
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

O frontend roda em `http://localhost:5173` e o backend em `http://localhost:3000`.

## Deploy na Vercel (pré-produção)

- O frontend é buildado a partir de `frontend/` e publicado como SPA (`frontend/dist`).
- A API Express roda como função serverless via `api/[...all].ts`, mantendo as rotas em `/api/...`.
- Garanta as variáveis de ambiente do backend no projeto da Vercel (`DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, etc.).
- Defina `FRONTEND_URL` com o domínio da Vercel para CORS e cookies em produção.

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
│       └── services/  # API service layer
├── backend/           # Express API
│   ├── prisma/        # Schema
│   └── src/
│       ├── routes/    # Rotas da API
│       ├── controllers/# Controllers
│       ├── middlewares/# Auth, validation, error handler
│       ├── services/  # Camada de Serviços (Lógica)
│       ├── utils/     # JWT, validações
│       └── __tests__/ # Testes Backend (Vitest)
└── README.md
```

## Funcionalidades

- ✅ Autenticação (registro/login com JWT + refresh token)
- ✅ Criação de mensagens com temas
- ✅ Pagamento Híbrido: Stripe (Cartão/Boleto) e Mercado Pago (Pix)
- ✅ Visualização pública de cartão
- ✅ Perfil com histórico de mensagens
- ✅ Animações avançadas e Hero com Canvas 2D
- ✅ CI/CD com GitHub Actions
- ✅ Design system com glassmorphism
- ✅ Smooth scroll com Lenis
- ✅ Responsivo
