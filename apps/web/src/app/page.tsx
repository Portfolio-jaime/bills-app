import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  TrendingUp,
  Wallet,
  PieChart,
  RefreshCw,
  BarChart3,
  Shield,
  ChevronRight,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Globe,
} from 'lucide-react'

const features = [
  {
    icon: Wallet,
    title: 'Multi-Currency Accounts',
    description:
      'Manage bank accounts, cash, investments and crypto in any currency with automatic exchange rate conversion.',
  },
  {
    icon: TrendingUp,
    title: 'Smart Transactions',
    description:
      'Categorize income, expenses and transfers. Attach notes, tags and receipts to every movement.',
  },
  {
    icon: PieChart,
    title: 'Budget Control',
    description:
      'Set budgets per category, track your spending and get real-time alerts before you overspend.',
  },
  {
    icon: RefreshCw,
    title: 'Recurring Bills',
    description:
      'Never miss a payment. Automate rent, subscriptions and any periodic bill with flexible frequency rules.',
  },
  {
    icon: BarChart3,
    title: 'Visual Analytics',
    description:
      'See your 12-month trend, category breakdown and top expenses in beautiful interactive charts.',
  },
  {
    icon: Globe,
    title: 'Global Currencies',
    description:
      'COP, USD, EUR, GBP, BTC, ETH and more — hourly rates synced automatically from open exchange APIs.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description:
      'JWT with refresh token rotation, bcrypt-hashed passwords. Your data is never shared with third parties.',
  },
]

const stats = [
  { value: '10+', label: 'Supported Currencies' },
  { value: '100%', label: 'Self-hosted & Private' },
  { value: '0', label: 'Subscription Fees' },
]

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">Bills App</span>
        </div>

        <nav className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Dashboard <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 gap-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wide">
          <Zap className="h-3 w-3" />
          Personal Finance — Simple &amp; Powerful
        </div>

        <h1 className="relative max-w-4xl text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Take control of{' '}
          <span className="bg-gradient-to-r from-primary via-blue-400 to-violet-400 bg-clip-text text-transparent">
            your finances
          </span>
        </h1>

        <p className="relative max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
          Track income, expenses, recurring bills and investments across multiple currencies —
          from a single beautiful dashboard. Open-source and self-hosted.
        </p>

        <div className="relative flex items-center gap-4 flex-wrap justify-center">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Open Dashboard <ChevronRight className="h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Start for free <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-border px-8 py-3.5 text-base font-medium text-foreground hover:bg-accent transition-colors"
              >
                Sign in
              </Link>
            </>
          )}
        </div>

        <div className="relative flex items-center gap-6 text-sm text-muted-foreground flex-wrap justify-center">
          {['No credit card required', 'Free forever', 'Multi-currency support'].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ─── Stats ───────────────────────────────────────────────── */}
      <section className="border-y border-border/60 bg-card/30 px-6 py-12">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div className="text-4xl font-extrabold text-primary mb-1">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Built for people who take their money seriously. No bloat, no subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────── */}
      {!isLoggedIn && (
        <section className="border-t border-border/60 bg-card/30 px-6 py-24 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to take control?</h2>
            <p className="text-muted-foreground text-lg mb-10">
              Create your account in 30 seconds. No credit card, no trial — just free.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-10 py-4 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xl shadow-primary/20"
            >
              Create free account <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      )}

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border/60 px-6 py-8 flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span>Bills App © 2026 — Personal Finance Dashboard</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="hover:text-foreground transition-colors">
            Register
          </Link>
        </div>
      </footer>
    </div>
  )
}
