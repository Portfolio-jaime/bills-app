# ─── Bills App API — Dockerfile ─────────────────────────────────────────────
# Multi-stage build: avoids shipping devDependencies in the final image.
#
# Usage (from monorepo root):
#   docker build -f apps/api/Dockerfile -t bills-api .
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Dependency installer ────────────────────────────────────────────
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Copy workspace manifests (layer-cache friendly)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc* ./
COPY tsconfig.base.json ./

# Package manifests only — no source yet
COPY packages/types/package.json   ./packages/types/
COPY packages/utils/package.json   ./packages/utils/
COPY packages/ui/package.json      ./packages/ui/
COPY apps/api/package.json         ./apps/api/

# Install ALL deps (including devDependencies needed for ts-node)
RUN pnpm install --frozen-lockfile

# ── Stage 2: Builder (generate Prisma client) ─────────────────────────────────
FROM deps AS builder

# Copy source
COPY packages/types/src  ./packages/types/src
COPY packages/utils/src  ./packages/utils/src
COPY packages/ui/src     ./packages/ui/src
COPY apps/api/src        ./apps/api/src
COPY apps/api/tsconfig.json  ./apps/api/
COPY apps/api/nest-cli.json  ./apps/api/
COPY apps/api/prisma         ./apps/api/prisma

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# ── Stage 3: Runner ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# Copy everything from builder (source + node_modules + generated client)
COPY --from=builder /app ./

# Runtime env defaults (override via docker-compose / k8s secrets)
ENV NODE_ENV=production \
    PORT=3002

EXPOSE 3002

WORKDIR /app/apps/api

# Use ts-node with transpile-only (no type-check in prod container)
CMD ["node", \
     "../../node_modules/.bin/ts-node", \
     "--transpile-only", \
     "--project", "tsconfig.json", \
     "-r", "../../node_modules/tsconfig-paths/register", \
     "src/main.ts"]
