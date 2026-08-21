# ==============================================================================
# Correio Elegante Monorepo - Backend Multi-stage Dockerfile (Node.js 22 / Cloud Run)
# ==============================================================================

# Stage 1: Build backend TypeScript application
FROM node:22-alpine AS builder

WORKDIR /app/backend

# Install OpenSSL for Prisma engine compatibility
RUN apk add --no-cache openssl

# Install build dependencies
COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma/

RUN npm ci

# Copy source code and build config
COPY backend/tsconfig.json ./
COPY backend/src ./src/

# Generate Prisma Client and compile TypeScript
RUN npx prisma generate
RUN npm run build

# Stage 2: Install production dependencies only
FROM node:22-alpine AS prod-deps

WORKDIR /app/backend

RUN apk add --no-cache openssl

COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma/

RUN npm ci --omit=dev
RUN npx prisma generate

# Stage 3: Production runtime (Cloud Run ready)
FROM node:22-alpine AS runner

WORKDIR /app

# Install dumb-init for proper signal handling in containers & OpenSSL for Prisma
RUN apk add --no-cache openssl dumb-init

ENV NODE_ENV=production
ENV PORT=8080

# Run as unprivileged user
USER node

# Copy runtime assets
COPY --chown=node:node --from=prod-deps /app/backend/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/backend/dist ./dist
COPY --chown=node:node --from=builder /app/backend/prisma ./prisma
COPY --chown=node:node backend/package.json ./

EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
