# ─── Bills App API — Dockerfile ─────────────────────────────────────────────
# Multi-stage build: deps → builder (tsc + prisma generate) → runner
#
# Usage (from monorepo root):
#   docker build -f apps/api/Dockerfile -t jaimehenao8126/bills-api:latest .
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Install all dependencies ────────────────────────────────────────
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc* ./
COPY tsconfig.base.json ./

COPY packages/types/package.json   ./packages/types/
COPY packages/utils/package.json   ./packages/utils/
COPY packages/ui/package.json      ./packages/ui/
COPY apps/api/package.json         ./apps/api/

# Use hoisted node_modules so @prisma/client is at /app/node_modules/@prisma/client
RUN pnpm install --frozen-lockfile --shamefully-hoist

# ── Stage 2: Build (compile TypeScript + generate Prisma client) ──────────────
FROM deps AS builder

COPY packages/types/src  ./packages/types/src
COPY packages/utils/src  ./packages/utils/src
COPY packages/ui/src     ./packages/ui/src
COPY apps/api/src        ./apps/api/src
COPY apps/api/tsconfig.json  ./apps/api/
COPY apps/api/nest-cli.json  ./apps/api/
COPY apps/api/webpack.config.js ./apps/api/
COPY apps/api/prisma         ./apps/api/prisma

# Generate Prisma client (lands directly in /app/node_modules/@prisma/client with hoisting)
RUN cd apps/api && npx prisma generate

# Compile TypeScript → apps/api/dist/ (webpack bundle)
RUN cd apps/api && npx nest build

# ── Stage 3: Lean production runner ──────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Hoisted node_modules — @prisma/client is a real directory, no symlinks
COPY --from=builder /app/node_modules          ./node_modules
COPY --from=builder /app/package.json          ./package.json
COPY --from=builder /app/pnpm-workspace.yaml   ./pnpm-workspace.yaml

# Compiled webpack bundle
COPY --from=builder /app/apps/api/dist         ./apps/api/dist
# Prisma schema needed by migrate deploy
COPY --from=builder /app/apps/api/prisma       ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/

ENV NODE_ENV=production \
    PORT=3002

EXPOSE 3002

WORKDIR /app/apps/api

CMD ["node", "dist/main"]
