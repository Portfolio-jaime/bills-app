# ─── Bills App Web (Next.js 14) — Dockerfile ────────────────────────────────
#
# Usage (from monorepo root):
#   docker build -f apps/web/Dockerfile -t bills-web .
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Dependencies ─────────────────────────────────────────────────────
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc* ./
COPY tsconfig.base.json ./

COPY packages/types/package.json   ./packages/types/
COPY packages/utils/package.json   ./packages/utils/
COPY packages/ui/package.json      ./packages/ui/
COPY apps/web/package.json         ./apps/web/

RUN pnpm install --frozen-lockfile

# ── Stage 2: Builder ──────────────────────────────────────────────────────────
FROM deps AS builder

COPY packages/types/src      ./packages/types/src
COPY packages/utils/src      ./packages/utils/src
COPY packages/ui/src         ./packages/ui/src

COPY apps/web/src            ./apps/web/src
COPY apps/web/public         ./apps/web/public
COPY apps/web/next.config.js ./apps/web/
COPY apps/web/postcss.config.js ./apps/web/
COPY apps/web/tailwind.config.js ./apps/web/
COPY apps/web/tsconfig.json  ./apps/web/

# Build args for env vars required at build time
ARG NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
ARG NEXTAUTH_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXTAUTH_URL=$NEXTAUTH_URL \
    NEXT_STANDALONE=true

WORKDIR /app/apps/web
RUN pnpm build

# ── Stage 3: Runner ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Standalone output contains all necessary server files
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static      ./apps/web/.next/static
COPY --from=builder /app/apps/web/public            ./apps/web/public

EXPOSE 3000

WORKDIR /app/apps/web

CMD ["node", "server.js"]
