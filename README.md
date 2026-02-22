# Correio Elegante 💌

Plataforma de correio elegante digital com pagamento via Pix e QR Code.

## Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion + GSAP
- Lenis (smooth scroll)
- Zustand (estado global)
- React Router DOM v6
- React Hook Form + Zod
- Axios

### Backend
- Node.js + Express 5
- TypeScript
- Prisma + PostgreSQL
- JWT (Access + Refresh Token)
- Zod (validação server-side)

## Como Rodar

### Pré-requisitos
- Node.js 18+
- PostgreSQL

### Backend
```bash
cd backend
cp .env.example .env
# Configure DATABASE_URL no .env
npm install
npx prisma migrate dev --name init
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
│   ├── prisma/        # Schema + migrations
│   └── src/
│       ├── routes/    # Rotas da API
│       ├── controllers/# Controllers
│       ├── middlewares/# Auth, validation, error handler
│       ├── services/  # Business logic
│       └── utils/     # JWT, validation schemas
└── README.md
```

## Funcionalidades

- ✅ Autenticação (registro/login com JWT + refresh token)
- ✅ Criação de mensagens com temas
- ✅ Pagamento via Pix (Mercado Pago)
- ✅ Visualização pública de cartão
- ✅ Perfil com histórico de mensagens
- ✅ Animações avançadas (scroll reveal, parallax, 3D tilt, magnetic buttons, custom cursor)
- ✅ Design system com glassmorphism
- ✅ Smooth scroll com Lenis
- ✅ Responsivo
