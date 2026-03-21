# Bills App — Full System Design Spec
**Date:** 2026-03-15
**Author:** Jaime Henao
**Status:** Approved for implementation

---

## 1. Product Vision

A personal finance management platform (web + mobile) for tracking income and expenses — both manually entered and auto-synced from real financial sources. Starting as a personal tool for the author, designed to grow into a multi-tenant SaaS product for Latam users.

**Core value props:**
- Multi-currency first (COP primary, USD, EUR, crypto)
- Automatic bank/investment connectors for Colombia and international accounts
- AI-powered financial advisor (chat interface with personal data context)
- ML predictions and anomaly detection
- Growth path: personal → SaaS product

---

## 2. Sub-Project Decomposition

| ID | Name | Scope | Timeline |
|---|---|---|---|
| SP-1 | Core Platform MVP | Auth, manual transactions, dashboard, budgets, multi-currency | Weeks 1–6 |
| SP-2 | Automatic Connectors | Belvo, Wise, Binance, Stripe, PayPal, Revolut | Weeks 7–9 |
| SP-3 | Analytics & Predictions | Advanced charts, ML service (Prophet), anomaly detection | Weeks 10–12 |
| SP-4 | AI Advisor | Claude API chat, streaming, financial context injection | Weeks 13–15 |
| SP-5 | Mobile App | Expo + React Native, shared monorepo packages | Weeks 16–18 |
| SP-6 | AWS Infrastructure | Terraform, ECS, RDS, ElastiCache, S3, CloudFront | Weeks 19–20 |
| SP-7 | SaaS Multi-tenant | Multi-tenancy, Stripe billing, admin panel | Weeks 21+ |

---

## 3. Architecture — Option A: Turborepo Monorepo (Selected)

### 3.1 Repository Structure

```
bills-app/
├── apps/
│   ├── web/              → Next.js 14 (App Router) + TypeScript
│   ├── api/              → NestJS + TypeScript
│   ├── ml-service/       → Python FastAPI (SP-3)
│   └── mobile/           → Expo + React Native (SP-5)
├── packages/
│   ├── types/            → Shared Zod schemas + TypeScript types
│   ├── ui/               → Shared React components (shadcn/ui base)
│   └── utils/            → Currency helpers, date utils, formatters
├── docker-compose.yml    → PostgreSQL 16 + Redis 7
├── turbo.json
└── package.json
```

### 3.2 Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 14 + TypeScript | SSR, SEO-ready, App Router |
| Styling | Tailwind CSS + shadcn/ui | Fast DX, accessible components |
| State | Zustand + React Query (TanStack) | UI state + server cache |
| Backend | NestJS + TypeScript | Modular, decorator-based, scalable |
| ORM | Prisma | Type-safe, migrations, PostgreSQL |
| Database | PostgreSQL 16 | Relational, robust, RLS-ready for SaaS |
| Cache/Sessions | Redis 7 | JWT blacklist, BullMQ queues |
| Auth | NextAuth.js (web) + NestJS JWT | NextAuth calls NestJS for credential validation; NestJS issues JWT |
| Charts | Recharts | Lightweight, composable, React-native compatible |
| Validation | Zod | Shared schemas across frontend + backend |
| Background Jobs | BullMQ + Redis | Exchange rate updates, connector sync |
| ML Service | Python + FastAPI + Prophet | Time-series predictions |
| AI Chat | Claude API (claude-sonnet-4-6) | Streaming financial advisor |
| Testing | Vitest + Testing Library | Fast, TypeScript-native |
| Build | Turborepo | Monorepo task orchestration with caching |

---

## 4. Data Model (SP-1)

```prisma
model User {
  id           String        @id @default(cuid())
  email        String        @unique
  name         String?
  avatar       String?
  baseCurrency String        @default("COP")
  createdAt    DateTime      @default(now())
  accounts     Account[]
  transactions Transaction[]
  categories   Category[]
  budgets      Budget[]
}

model Account {
  id                String        @id @default(cuid())
  userId            String
  name              String
  type              AccountType   // BANK | CASH | INVESTMENT | CRYPTO | CREDIT_CARD
  currency          String        // balance is always stored in this currency
  balance           Decimal       @db.Decimal(15, 2)
  color             String?
  icon              String?
  isManual          Boolean       @default(true)
  connectorId       String?       // SP-2: external connector reference
  updatedAt         DateTime      @updatedAt
  user              User          @relation(fields: [userId], references: [id])
  transactions      Transaction[] @relation("SourceAccount")
  transfersIn       Transaction[] @relation("DestinationAccount")
}

model Transaction {
  id                   String            @id @default(cuid())
  userId               String
  accountId            String            // source account
  toAccountId          String?           // destination account (required when type = TRANSFER)
  categoryId           String?
  type                 TransactionType   // INCOME | EXPENSE | TRANSFER
  amount               Decimal           @db.Decimal(15, 2)
  currency             String
  amountInBaseCurrency Decimal           @db.Decimal(15, 2)
  exchangeRate         Decimal           @db.Decimal(10, 6)
  date                 DateTime
  description          String
  notes                String?
  tags                 String[]
  attachments          String[]          // S3 URLs (SP-6)
  isRecurring          Boolean           @default(false)
  recurringRule        String?           // cron expression
  source               TransactionSource @default(MANUAL)
  externalId           String?           // dedup key for connectors
  updatedAt            DateTime          @updatedAt
  user                 User              @relation(fields: [userId], references: [id])
  account              Account           @relation("SourceAccount", fields: [accountId], references: [id])
  toAccount            Account?          @relation("DestinationAccount", fields: [toAccountId], references: [id])
  category             Category?         @relation(fields: [categoryId], references: [id])
}

model Category {
  id           String        @id @default(cuid())
  userId       String
  name         String
  icon         String?
  color        String?
  type         CategoryType  // INCOME | EXPENSE | BOTH
  parentId     String?
  updatedAt    DateTime      @updatedAt
  parent       Category?     @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children     Category[]    @relation("CategoryHierarchy")
  transactions Transaction[]
  budgets      Budget[]
  user         User          @relation(fields: [userId], references: [id])
}

model Budget {
  id           String        @id @default(cuid())
  userId       String
  categoryId   String
  amount       Decimal       @db.Decimal(15, 2)
  period       BudgetPeriod  // MONTHLY | WEEKLY | YEARLY
  startDate    DateTime      // anchor date for the period (e.g., 2026-03-01 for March)
  isActive     Boolean       @default(true)
  alertAt      Int           @default(80) // percentage threshold to trigger alert
  updatedAt    DateTime      @updatedAt
  user         User          @relation(fields: [userId], references: [id])
  category     Category      @relation(fields: [categoryId], references: [id])
  @@unique([categoryId, startDate])  // one budget per category per period
}

model ExchangeRate {
  id        String   @id @default(cuid())
  fromCurrency String
  toCurrency   String
  rate         Decimal @db.Decimal(10, 6)
  date         DateTime
  @@unique([fromCurrency, toCurrency, date])
}

enum AccountType { BANK CASH INVESTMENT CRYPTO CREDIT_CARD }
enum TransactionType { INCOME EXPENSE TRANSFER }
enum TransactionSource { MANUAL CONNECTOR_BELVO CONNECTOR_WISE CONNECTOR_BINANCE CONNECTOR_STRIPE CONNECTOR_PAYPAL CONNECTOR_REVOLUT CONNECTOR_COINBASE }
enum CategoryType { INCOME EXPENSE BOTH }
enum BudgetPeriod { WEEKLY MONTHLY YEARLY }
```

**Key design decisions:**
- `amountInBaseCurrency` stored on every transaction for O(1) dashboard aggregations
- `source` enum tracks data provenance (manual vs connector)
- `externalId` enables deduplication when connectors re-sync
- Category hierarchy supports parent/child (e.g., Food → Restaurants)
- `isManual` on Account distinguishes user-created vs connector-synced accounts
- `Account.balance` is always in `Account.currency` (native currency of the account)
- Balance recalculation on edit/delete: delta-adjust (`new_amount - old_amount`) for edits; reverse-add original amount on delete
- `Transaction.toAccountId` is required (enforced at service layer) when `type = TRANSFER`; both accounts have their balance adjusted in their respective native currencies
- `Budget.startDate` anchors each budget to a specific period; `isActive` marks the current active budget per category

---

## 5. Backend API (SP-1)

### 5.1 NestJS Module Structure

### 5.0 Auth Integration Contract (NextAuth ↔ NestJS)

NextAuth.js handles the web session layer; NestJS owns credential validation and JWT issuance.

**Flow:**
```
1. User logs in via NextAuth (credentials or Google OAuth)
2. NextAuth CredentialsProvider calls POST /auth/login (email+password)
   OR NextAuth GoogleProvider → on signIn callback calls POST /auth/google/callback
3. NestJS validates credentials, returns { accessToken, refreshToken }
4. NextAuth stores accessToken in its encrypted session cookie (HttpOnly)
5. Axios client in lib/api.ts reads session and sends: Authorization: Bearer <accessToken>
6. NestJS JwtGuard verifies token on every protected route
```

**Token policy:**
- Access token TTL: 15 minutes
- Refresh token TTL: 7 days, stored in HttpOnly cookie (never localStorage)
- Refresh token rotation: each use issues a new refresh token; old one is blacklisted in Redis
- On logout: both tokens added to Redis blacklist until expiry

```
apps/api/src/
├── auth/           → register, login, OAuth (Google), JWT refresh, logout
├── users/          → profile CRUD, base currency setting
├── accounts/       → account CRUD, balance recalculation
├── transactions/   → CRUD, filtering, pagination, CSV import stub
├── categories/     → CRUD with hierarchy support
├── budgets/        → CRUD + real-time status calculation
├── exchange-rates/ → cron job (hourly), rate lookup
├── dashboard/      → aggregated read-only endpoints for charts
└── common/         → JWT guard, validation pipe, exception filters
```

### 5.2 Key Endpoints

```
# Auth
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/google            ← OAuth redirect

# Transactions
GET    /transactions           ?page&limit&from&to&type&categoryId&accountId&search
POST   /transactions
PATCH  /transactions/:id
DELETE /transactions/:id
POST   /transactions/bulk      ← CSV import (SP-2)

# Dashboard
GET    /dashboard/summary      → total balance, monthly income/expenses
GET    /dashboard/chart/monthly     → 12-month bar chart data
GET    /dashboard/chart/by-category → donut chart data
GET    /dashboard/chart/by-account  → balance per account
GET    /dashboard/top-expenses      → top 5 expense categories

# Budgets
GET    /budgets/status         → current period consumption per category
```

### 5.3 Transaction Creation Flow

```
1. Frontend validates with Zod (shared schema from packages/types)
2. POST /transactions → JWT Guard → ValidationPipe
3. TransactionsService.create():
   a. Fetch ExchangeRate { from: currency, to: user.baseCurrency, date: today }
      Fallback: if today's rate missing, use most recent available rate (up to 3 days old)
      If no rate found at all: throw 422 with message "Exchange rate unavailable, try again later"
   b. Calculate amountInBaseCurrency = amount * exchangeRate
   c. Prisma transaction (atomic):
      - INSERT Transaction
      - UPDATE Account.balance (delta: +amount for INCOME, -amount for EXPENSE)
      - If TRANSFER: UPDATE toAccount.balance (+amount), enforce toAccountId non-null
4. Return created transaction
5. React Query invalidates: [transactions], [dashboard/summary], [budgets/status]
```

**Edit flow:** delta-adjust Account.balance by `(newAmount - oldAmount)`. Recalculate `amountInBaseCurrency` if amount or currency changed.

**Delete flow:** reverse the balance delta applied at creation. Soft-delete not used — hard delete only.

### 5.4 Background Jobs (BullMQ)

| Job | Schedule | Action |
|---|---|---|
| `exchange-rate-sync` | Every hour | Fetch rates from open.er-api.com for COP, USD, EUR, GBP, BTC, ETH |
| `budget-alert-check` | Daily at 8am | Evaluate all budgets, send email if threshold exceeded |
| `connector-sync` | Every 6 hours | Re-sync all active connectors (SP-2) |

---

## 6. Frontend (SP-1)

### 6.1 App Router Structure

```
apps/web/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← sidebar + topbar
│   │   ├── page.tsx                ← Dashboard
│   │   ├── transactions/
│   │   │   ├── page.tsx            ← list + filters
│   │   │   └── [id]/page.tsx       ← detail/edit
│   │   ├── accounts/page.tsx
│   │   ├── budgets/page.tsx
│   │   └── settings/page.tsx
│   └── api/auth/[...nextauth]/route.ts
├── components/
│   ├── dashboard/
│   │   ├── SummaryCards.tsx        ← total balance, income, expenses
│   │   ├── MonthlyBarChart.tsx
│   │   ├── CategoryDonutChart.tsx
│   │   └── BudgetProgressList.tsx
│   ├── transactions/
│   │   ├── TransactionTable.tsx
│   │   ├── TransactionFilters.tsx
│   │   └── TransactionForm.tsx     ← modal/sheet
│   └── shared/
│       ├── Sidebar.tsx
│       └── CurrencyDisplay.tsx
└── lib/
    ├── api.ts                      ← Axios client with JWT interceptor
    ├── store.ts                    ← Zustand (UI state only)
    └── queries/                    ← React Query hooks per domain
```

### 6.2 Screens

| Screen | Key Content |
|---|---|
| Dashboard | Balance total (multi-currency), income vs expenses this month, 12-month bar chart, category donut, budget status bars |
| Transactions | Paginated table, filters (date range, type, category, account, search), New Transaction button |
| New Transaction | Slide-over form: amount, currency, type, account, category, date, description, recurring toggle |
| Accounts | Cards grid with balance, type icon, color. Add/edit/archive |
| Budgets | Progress bars per category, current vs limit, alert threshold indicator |
| Settings | Base currency, profile, custom categories |

### 6.3 Design System

- Dark mode default (finance = night usage)
- Green for income, Red/orange for expenses, Blue for investments/transfers
- shadcn/ui component library (Button, Card, Sheet, Dialog, Table, Form)
- Recharts for all data visualizations

---

## 7. SP-2: Automatic Connectors

| Source | Integration | Method |
|---|---|---|
| Colombian banks (Bancolombia, Davivienda, Nequi) | Belvo API | OAuth, 6h polling |
| Wise | Wise API v2 | OAuth + webhooks |
| Revolut | Revolut Open API | OAuth + webhooks |
| Binance | Binance API (read-only) | User API key (AES-256 encrypted) |
| Coinbase | Coinbase API v3 | OAuth |
| PayPal | PayPal Transactions API | OAuth |
| Stripe | Stripe API | User API key (AES-256 encrypted) |
| Stocks/ETFs | Alpha Vantage / Polygon.io | Internal API key, user portfolio |

**Deduplication strategy:** `hash(date + amount + description + accountId)` checked before insert.

**API key security:** User-provided keys encrypted with AES-256-GCM using a server-side master key (AWS KMS in production).

---

## 8. SP-3: Analytics & ML Predictions

### ML Service (Python FastAPI)

```
apps/ml-service/
├── main.py                     ← FastAPI app
├── models/
│   ├── expense_predictor.py    ← Facebook Prophet for time-series
│   ├── anomaly_detector.py     ← Isolation Forest
│   └── savings_advisor.py      ← Rule-based + ML hybrid
└── Dockerfile
```

**Models:**
- **Expense Predictor**: Prophet trained on user's transaction history → next month income/expense forecast
- **Anomaly Detector**: Isolation Forest flags transactions >2σ from category baseline
- **Weekly retraining**: BullMQ job triggers model refresh when user has ≥30 days of data

### Analytics Endpoints

```
GET /analytics/cashflow?period=12m
GET /analytics/networth?period=12m
GET /analytics/savings-rate
GET /analytics/by-category?drill=true
GET /analytics/predictions/next-month
GET /analytics/anomalies
```

---

## 9. SP-4: AI Financial Advisor

### Architecture

```
User message
     ↓
POST /ai/chat → Server-Sent Events (streaming)
     ↓
AiService builds context:
  - Last 90 days transactions summary (aggregated, not raw)
  - Current month income/expenses
  - Active budgets + consumption %
  - ML predictions for next month
  - Net worth trend
     ↓
Claude API (claude-sonnet-4-6) with financial system prompt
     ↓
Streaming response → React SSE consumer
```

**Privacy rule:** Raw transaction descriptions never sent to Claude. Only aggregated summaries and category totals.

**Example queries supported:**
- "How much did I spend on food this month vs last month?"
- "Am I on track to meet my July budget?"
- "Where can I cut expenses this month?"
- "Analyze my crypto investments this year"
- "How much do I need to save to reach [goal] in [N] months?"

---

## 10. SP-5: Mobile App

```
apps/mobile/
├── app/                    ← Expo Router (file-based routing)
│   ├── (auth)/
│   └── (tabs)/
│       ├── index.tsx       ← Dashboard
│       ├── transactions.tsx
│       └── add.tsx         ← Quick add transaction
├── components/             ← Mobile-specific, reuses packages/ui where possible
└── lib/                    ← Same API client, same Zustand store
```

**MVP mobile features:** Dashboard, quick transaction entry, transaction list, push notifications for budget alerts (Expo Notifications).

---

## 11. SP-6: AWS Infrastructure

```
Route53 → CloudFront (CDN + SSL)
                ↓
         Application Load Balancer
          /          \
    ECS (web)      ECS (api)
    Next.js        NestJS
                     |
              ┌──────┴──────┐
           RDS (PostgreSQL   ElastiCache
           Multi-AZ)         (Redis)
                     |
                   S3 (attachments)
                     |
              Secrets Manager (credentials)
              ECR (Docker images)
              CloudWatch (logs/metrics)
```

**IaC:** Terraform modules for all resources. State in S3 + DynamoDB lock.

---

## 12. SP-7: SaaS Multi-tenant

- Row Level Security (RLS) on all PostgreSQL tables via `tenantId`
- Stripe Billing integration (Free / Pro $9/mo / Business $25/mo)
- Freemium limits: 2 accounts, 1 month history, no connectors
- Pro: unlimited connectors, AI Advisor, unlimited history
- Business: multi-user (family/company), API access

---

## 13. DevOps & CI/CD

### Local Development

```bash
docker-compose up -d          # PostgreSQL + Redis
pnpm install
pnpm dev                      # Turborepo runs web + api in parallel
```

### GitHub Actions Pipeline

```
On PR:
  ├── pnpm lint
  ├── pnpm typecheck
  ├── pnpm test
  └── pnpm build (Turborepo cache)

On merge to main:
  ├── Docker build & push to ECR
  └── ECS rolling deploy (SP-7)
```

---

## 14. SEO Strategy (when opening to public)

- Next.js Metadata API for all pages
- Static landing page (SSG) with keyword targeting: "control gastos Colombia", "app finanzas personales"
- Blog section with personal finance content (Latam/Colombia focus)
- Schema.org FinancialProduct markup
- sitemap.xml + robots.txt auto-generated

---

## 15. Implementation Roadmap

```
Weeks 1-2   SP-1a: Monorepo setup + Docker + Auth + Prisma migrations
Weeks 3-4   SP-1b: Manual transactions + Dashboard + Charts
Weeks 5-6   SP-1c: Budgets + Multi-currency (exchange rates + base currency conversion) → MVP complete
Weeks 7-9   SP-2:  Belvo + Wise + Stripe connectors + CSV import/export
Weeks 10-12 SP-3:  Advanced analytics + ML service
Weeks 13-15 SP-4:  AI Advisor (Claude API + streaming chat)
Weeks 16-18 SP-5:  Mobile app (Expo)
Weeks 19-20 SP-6:  AWS infrastructure (Terraform)
Weeks 21+   SP-7:  SaaS multi-tenant + Stripe billing
```

---

## 16. Open Questions / Decisions Deferred

- [ ] Belvo pricing tier selection (depends on connector usage volume)
- [ ] Self-hosted vs managed PostgreSQL for production (RDS vs Supabase)
- [ ] Email provider for alerts (Resend vs SES)
- [ ] Analytics provider (PostHog vs Mixpanel) for SaaS product metrics
