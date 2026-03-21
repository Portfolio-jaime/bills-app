# Bills App 💰

Personal finance dashboard — multi-currency, recurring bills, budget control and visual analytics. Built as a **Turborepo monorepo** with NestJS + Next.js 14, deployable to Docker and Kubernetes.

---

## 🗂 Project Structure

```
bills-app/
├── apps/
│   ├── api/          # NestJS REST API (port 3002)
│   └── web/          # Next.js 14 App Router (port 3000)
├── packages/
│   ├── types/        # Shared Zod schemas & TypeScript types
│   ├── utils/        # Currency, date & number utilities
│   └── ui/           # Shared UI components (Button, Card, Input, Badge)
├── k8s/              # Kubernetes manifests + kind cluster config
│   ├── kind-config.yaml
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── postgres.yaml
│   ├── redis.yaml
│   ├── api.yaml
│   ├── web.yaml
│   ├── ingress.yaml
│   └── deploy.sh     # One-command kind cluster setup
├── docker-compose.yml          # Dev: PostgreSQL + Redis only
└── docker-compose.prod.yml     # Prod: Full stack (API + Web + DB + Cache)
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **Landing Page** | Marketing page with hero, features grid and CTAs |
| **User Registration** | Sign up with name, email and password |
| **Profile Settings** | Update name, phone, bio, avatar URL and base currency |
| **Multi-Currency Accounts** | BANK, CASH, INVESTMENT, CRYPTO, CREDIT_CARD |
| **Transactions** | INCOME / EXPENSE / TRANSFER with categories, tags and attachments |
| **Recurring Bills** | Automate rent, subscriptions — DAILY to YEARLY frequency |
| **Budget Control** | Per-category budgets with `% spent` alerts |
| **Exchange Rates** | Hourly sync from open.er-api.com (COP, USD, EUR, GBP, BTC, ETH…) |
| **Dashboard** | Summary cards, 12-month bar chart, category donut, top expenses |
| **Swagger Docs** | Auto-generated at `/api/docs` in development |

---

## 🚀 Quick Start (Local Dev)

### Prerequisites

- Node.js 22+
- pnpm 10+
- Docker Desktop / OrbStack

### 1 — Start infrastructure

```bash
cd bills-app
docker compose up -d        # starts PostgreSQL 16 + Redis 7
```

### 2 — Install dependencies

```bash
pnpm install
```

### 3 — Configure environment

```bash
# apps/api/.env
DATABASE_URL="postgresql://bills:bills_secret@localhost:5432/bills_db"
REDIS_URL="redis://:redis_secret@localhost:6379"
JWT_SECRET="dev-jwt-secret-change-in-production-must-be-32-chars-min"
PORT=3002
NODE_ENV=development
```

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-nextauth-secret-change-in-production
```

### 4 — Run Prisma migrations

```bash
pnpm --filter @bills/api exec prisma migrate dev
```

### 5 — Start both apps

```bash
pnpm dev
```

| URL | Description |
|---|---|
| http://localhost:3000 | Landing page / Dashboard |
| http://localhost:3002/api/docs | Swagger UI (API docs) |

---

## 🐳 Docker (Full Stack)

### Build images

```bash
# From bills-app/ root
docker build -f apps/api/Dockerfile -t bills-api:latest .
docker build -f apps/web/Dockerfile -t bills-web:latest .
```

### Run with docker compose

```bash
export JWT_SECRET="your-32-char-minimum-jwt-secret"
export NEXTAUTH_SECRET="your-nextauth-secret"

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

| URL | Description |
|---|---|
| http://localhost:3000 | Next.js Web App |
| http://localhost:3002/api/v1 | NestJS API |

---

## ☸️ Kubernetes (kind — local cluster)

### Prerequisites

```bash
brew install kind kubectl
```

### One-command deploy

```bash
chmod +x k8s/deploy.sh
./k8s/deploy.sh
```

This script will:
1. Create a `kind` cluster with 1 control-plane + 2 worker nodes
2. Install the Nginx Ingress controller
3. Build and load Docker images into the cluster
4. Apply all Kubernetes manifests
5. Wait for all pods to be ready and print the access URLs

### Useful kubectl commands

```bash
kubectl get pods -n bills                         # List all pods
kubectl logs -n bills deployment/bills-api -f     # API logs
kubectl logs -n bills deployment/bills-web -f     # Web logs
kind delete cluster --name bills                  # Destroy cluster
```

### Access points (kind)

| URL | Description |
|---|---|
| http://localhost | Web App (via Nginx Ingress) |
| http://localhost/api/v1 | API (via Ingress) |
| http://localhost:3000 | Web (NodePort) |
| http://localhost:3002 | API (NodePort) |

---

## 🗄 Database Schema

```
User           — id, email, passwordHash, name, avatar, phone, bio, baseCurrency
Account        — id, userId, name, type, currency, balance, color, icon
Transaction    — id, userId, accountId, type, amount, currency, category, date
Category       — id, userId, name, icon, color, type, parentId (hierarchical)
Budget         — id, userId, categoryId, amount, period, alertAt
RecurringRule  — id, userId, name, amount, frequency, nextDueDate, accountId
ExchangeRate   — fromCurrency, toCurrency, rate, date (hourly cron)
RefreshToken   — userId, tokenHash, expiresAt, isRevoked
```

### Prisma commands

```bash
# Create migration after schema changes
pnpm --filter @bills/api exec prisma migrate dev --name <name>

# Apply in production
pnpm --filter @bills/api exec prisma migrate deploy

# Open Prisma Studio
pnpm --filter @bills/api exec prisma studio
```

---

## 🔑 API Authentication

```bash
# Register
curl -s -X POST http://localhost:3002/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jaime","email":"jaime@example.com","password":"MyP@ss123"}'

# Login and capture token
TOKEN=$(curl -s -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jaime@example.com","password":"MyP@ss123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

# Use token
curl -H "Authorization: Bearer $TOKEN" http://localhost:3002/api/v1/users/me
```

---

## 📁 Key Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Sign in |
| `GET` | `/users/me` | Get profile |
| `PATCH` | `/users/me` | Update profile (name, phone, bio, avatar, currency) |
| `GET` | `/accounts` | List accounts |
| `GET` | `/transactions` | Paginated transactions |
| `POST` | `/transactions` | Create transaction |
| `GET` | `/recurring-rules` | List recurring rules |
| `POST` | `/recurring-rules` | Create recurring rule |
| `PATCH` | `/recurring-rules/:id` | Update / toggle rule |
| `GET` | `/recurring-rules/due` | Rules due today |
| `GET` | `/budgets/status` | Real-time budget usage |
| `GET` | `/dashboard/summary` | Dashboard summary cards |
| `GET` | `/dashboard/chart/monthly` | 12-month bar chart |

Full interactive docs: **http://localhost:3002/api/docs**

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo 2 + pnpm workspaces |
| API | NestJS 10, TypeScript 5, Prisma 6, PostgreSQL 16 |
| Auth | JWT (HS256) + refresh token rotation, bcrypt |
| Cache | Redis 7 |
| Web | Next.js 14 (App Router), React Query, Zustand, Recharts |
| Styling | Tailwind CSS (dark theme) |
| Validation | class-validator (API), Zod (shared types) |
| Exchange rates | open.er-api.com (hourly cron) |
| Container | Docker multi-stage builds |
| Orchestration | Kubernetes — kind (local), any k8s cluster (prod) |

---

## 🗺 Roadmap

| ID | Name | Status |
|---|---|---|
| **SP-1** | Core Platform MVP | ✅ Done |
| **SP-2** | Automatic Connectors (Belvo, Wise, Binance…) | 🔜 Next |
| **SP-3** | Analytics & ML | 🔜 Planned |
| **SP-4** | AI Financial Advisor (Claude API) | 🔜 Planned |
| **SP-5** | Mobile App (Expo) | 🔜 Planned |
| **SP-6** | AWS Infrastructure (Terraform, ECS/EKS) | 🔜 Planned |
| **SP-7** | SaaS Multi-tenant | 🔜 Planned |

See [docs/superpowers/specs/2026-03-15-bills-app-design.md](docs/superpowers/specs/2026-03-15-bills-app-design.md) for the full design spec.
