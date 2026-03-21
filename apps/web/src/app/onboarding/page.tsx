'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCompleteOnboarding, OnboardingAccount } from '@/lib/queries/onboarding'
import { Button, Input } from '@bills/ui'
import { SUPPORTED_CURRENCIES } from '@bills/types'
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  TrendingUp,
  Target,
  Banknote,
  BarChart3,
  Wallet,
  Sparkles,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 6

const INCOME_SOURCES = [
  { value: 'salary', label: '💼 Salario / Empleo' },
  { value: 'freelance', label: '💻 Freelance / Contratos' },
  { value: 'business', label: '🏢 Negocio propio' },
  { value: 'investment', label: '📈 Inversiones' },
  { value: 'pension', label: '🏦 Pensión / Jubilación' },
  { value: 'other', label: '🔀 Otro' },
]

const FINANCIAL_GOALS = [
  { value: 'emergency_fund', label: '🛡️ Fondo de emergencia', desc: '3–6 meses de gastos' },
  { value: 'pay_debt', label: '💳 Pagar deudas', desc: 'Tarjetas, préstamos, etc.' },
  { value: 'invest', label: '📈 Invertir', desc: 'Acciones, fondos, cripto' },
  { value: 'save_travel', label: '✈️ Ahorrar para viaje', desc: 'Vacaciones o experiencias' },
  { value: 'buy_home', label: '🏠 Comprar vivienda', desc: 'Casa o apartamento propio' },
  { value: 'retirement', label: '🌴 Retiro anticipado', desc: 'Libertad financiera' },
  { value: 'track_only', label: '📊 Solo llevar control', desc: 'Entender mis finanzas' },
]

const ACCOUNT_TYPES = [
  { value: 'BANK', label: '🏦 Cuenta bancaria' },
  { value: 'CASH', label: '💵 Efectivo' },
  { value: 'CREDIT_CARD', label: '💳 Tarjeta de crédito' },
  { value: 'INVESTMENT', label: '📈 Inversiones' },
  { value: 'CRYPTO', label: '₿ Cripto' },
]

// ─── Step components ──────────────────────────────────────────────────────────

function StepWelcome({
  name,
  setName,
  currency,
  setCurrency,
}: {
  name: string
  setName: (v: string) => void
  currency: string
  setCurrency: (v: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-4">👋</div>
        <h2 className="text-2xl font-bold text-foreground">¡Bienvenido/a a Bills!</h2>
        <p className="text-muted-foreground">
          Vamos a configurar tu perfil financiero en menos de 5 minutos.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">¿Cómo te llamas?</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Moneda principal</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Todos tus totales se convertirán a esta moneda.
          </p>
        </div>
      </div>
    </div>
  )
}

function StepIncome({
  income,
  setIncome,
  source,
  setSource,
  currency,
}: {
  income: string
  setIncome: (v: string) => void
  source: string
  setSource: (v: string) => void
  currency: string
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-4">💰</div>
        <h2 className="text-2xl font-bold text-foreground">Tus ingresos</h2>
        <p className="text-muted-foreground">
          ¿Cuánto dinero recibes aproximadamente cada mes?
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">
            Ingresos mensuales ({currency})
          </label>
          <Input
            type="number"
            min="0"
            step="100"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">
            Ingresa tu promedio mensual neto (después de impuestos).
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Fuente principal de ingresos</label>
          <div className="grid grid-cols-2 gap-2">
            {INCOME_SOURCES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSource(s.value)}
                className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                  source === s.value
                    ? 'border-indigo-500 bg-indigo-500/10 text-foreground'
                    : 'border-border bg-muted/20 text-muted-foreground hover:border-border/80'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface Expenses {
  housing: string
  food: string
  transport: string
  health: string
  entertainment: string
  other: string
}

function StepExpenses({
  expenses,
  setExpenses,
  currency,
}: {
  expenses: Expenses
  setExpenses: (v: Expenses) => void
  currency: string
}) {
  const fields: Array<{ key: keyof Expenses; label: string; icon: string; placeholder: string }> = [
    { key: 'housing', label: 'Vivienda (arriendo/hipoteca)', icon: '🏠', placeholder: '800' },
    { key: 'food', label: 'Comida y mercado', icon: '🛒', placeholder: '400' },
    { key: 'transport', label: 'Transporte', icon: '🚗', placeholder: '200' },
    { key: 'health', label: 'Salud y bienestar', icon: '🏥', placeholder: '100' },
    { key: 'entertainment', label: 'Entretenimiento', icon: '🎮', placeholder: '150' },
    { key: 'other', label: 'Otros gastos', icon: '📦', placeholder: '200' },
  ]

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-foreground">Tus gastos mensuales</h2>
        <p className="text-muted-foreground">
          Estima cuánto gastas en cada categoría. Puedes ajustarlo después.
        </p>
      </div>

      <div className="space-y-3">
        {fields.map(({ key, label, icon, placeholder }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xl w-7 text-center flex-shrink-0">{icon}</span>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">{label}</label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  step="10"
                  value={expenses[key]}
                  onChange={(e) => setExpenses({ ...expenses, [key]: e.target.value })}
                  placeholder={placeholder}
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">{currency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StepGoals({
  goals,
  setGoals,
}: {
  goals: string[]
  setGoals: (v: string[]) => void
}) {
  const toggle = (value: string) => {
    setGoals(
      goals.includes(value) ? goals.filter((g) => g !== value) : [...goals, value],
    )
  }

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-foreground">Tus metas financieras</h2>
        <p className="text-muted-foreground">
          Selecciona una o varias. Esto nos ayuda a personalizar tu plan.
        </p>
      </div>

      <div className="space-y-2">
        {FINANCIAL_GOALS.map((g) => {
          const selected = goals.includes(g.value)
          return (
            <button
              key={g.value}
              type="button"
              onClick={() => toggle(g.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-3 ${
                selected
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-border bg-muted/20 hover:border-border/70'
              }`}
            >
              <span className="text-lg flex-shrink-0">{g.label.split(' ')[0]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {g.label.split(' ').slice(1).join(' ')}
                </p>
                <p className="text-xs text-muted-foreground">{g.desc}</p>
              </div>
              {selected && (
                <CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepAccounts({
  accounts,
  setAccounts,
  currency,
}: {
  accounts: OnboardingAccount[]
  setAccounts: (v: OnboardingAccount[]) => void
  currency: string
}) {
  const add = () =>
    setAccounts([...accounts, { name: '', type: 'BANK', currency, balance: 0 }])

  const update = (i: number, patch: Partial<OnboardingAccount>) =>
    setAccounts(accounts.map((a, idx) => (idx === i ? { ...a, ...patch } : a)))

  const remove = (i: number) => setAccounts(accounts.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-4">🏦</div>
        <h2 className="text-2xl font-bold text-foreground">Tus cuentas actuales</h2>
        <p className="text-muted-foreground">
          Agrega las cuentas que usas hoy. Puedes agregar más después.
        </p>
      </div>

      <div className="space-y-3">
        {accounts.map((acc, i) => (
          <div key={i} className="rounded-lg border border-border bg-muted/10 p-3 space-y-2">
            <div className="flex gap-2 items-center">
              <Input
                value={acc.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Nombre de la cuenta"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-muted-foreground hover:text-rose-400 transition-colors p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <select
                value={acc.type}
                onChange={(e) => update(i, { type: e.target.value })}
                className="flex-1 h-9 px-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <Input
                type="number"
                min="0"
                step="100"
                value={acc.balance ?? ''}
                onChange={(e) => update(i, { balance: Number(e.target.value) })}
                placeholder="Saldo actual"
                className="w-32"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={add}
          className="w-full border border-dashed border-border rounded-lg py-3 text-sm text-muted-foreground hover:text-foreground hover:border-border/70 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Agregar cuenta
        </button>
      </div>

      {accounts.length === 0 && (
        <p className="text-xs text-center text-muted-foreground">
          Puedes omitir este paso y agregar cuentas desde el dashboard.
        </p>
      )}
    </div>
  )
}

function StepSummary({
  name,
  currency,
  income,
  expenses,
  goals,
  accounts,
}: {
  name: string
  currency: string
  income: string
  expenses: Expenses
  goals: string[]
  accounts: OnboardingAccount[]
}) {
  const inc = Number(income) || 0
  const totalExpenses =
    (Number(expenses.housing) || 0) +
    (Number(expenses.food) || 0) +
    (Number(expenses.transport) || 0) +
    (Number(expenses.health) || 0) +
    (Number(expenses.entertainment) || 0) +
    (Number(expenses.other) || 0)

  const savings = Math.max(0, inc - totalExpenses)
  const savingsPct = inc > 0 ? Math.round((savings / inc) * 100) : 0

  const goalLabels = FINANCIAL_GOALS.filter((g) => goals.includes(g.value)).map(
    (g) => g.label,
  )

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-4">✨</div>
        <h2 className="text-2xl font-bold text-foreground">Tu plan financiero</h2>
        <p className="text-muted-foreground">
          Basado en tus respuestas, esto es lo que hemos preparado para ti.
        </p>
      </div>

      {/* Financial summary card */}
      <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart3 className="h-4 w-4 text-indigo-400" />
          Resumen mensual de {name}
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2">
            <p className="text-xs text-muted-foreground">Ingresos</p>
            <p className="text-lg font-bold text-emerald-400">
              {inc.toLocaleString()} {currency}
            </p>
          </div>
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2">
            <p className="text-xs text-muted-foreground">Gastos</p>
            <p className="text-lg font-bold text-rose-400">
              {totalExpenses.toLocaleString()} {currency}
            </p>
          </div>
          <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-2">
            <p className="text-xs text-muted-foreground">Ahorro</p>
            <p className="text-lg font-bold text-indigo-400">
              {savings.toLocaleString()} {currency}
            </p>
          </div>
        </div>
        {savingsPct > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            💡 Estás ahorrando el <strong className="text-foreground">{savingsPct}%</strong> de tus ingresos
            {savingsPct >= 20 ? ' — ¡excelente hábito!' : '. La meta recomendada es 20%.'}
          </p>
        )}
      </div>

      {/* Budgets to be created */}
      <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Target className="h-4 w-4 text-indigo-400" />
          Presupuestos mensuales que crearemos
        </div>
        {[
          { label: '🏠 Vivienda', amount: expenses.housing },
          { label: '🛒 Comida', amount: expenses.food },
          { label: '🚗 Transporte', amount: expenses.transport },
          { label: '🏥 Salud', amount: expenses.health },
          { label: '🎮 Entretenimiento', amount: expenses.entertainment },
          { label: '📦 Otros', amount: expenses.other },
        ]
          .filter((b) => Number(b.amount) > 0)
          .map((b) => (
            <div key={b.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{b.label}</span>
              <span className="font-medium text-foreground">
                {Number(b.amount).toLocaleString()} {currency}
              </span>
            </div>
          ))}
      </div>

      {/* Accounts */}
      {accounts.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Wallet className="h-4 w-4 text-indigo-400" />
            Cuentas a crear ({accounts.filter((a) => a.name.trim()).length})
          </div>
          {accounts
            .filter((a) => a.name.trim())
            .map((a, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {ACCOUNT_TYPES.find((t) => t.value === a.type)?.label.split(' ')[0]} {a.name}
                </span>
                <span className="font-medium text-foreground">
                  {(a.balance ?? 0).toLocaleString()} {a.currency || currency}
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Goals */}
      {goalLabels.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Tus metas
          </div>
          <div className="flex flex-wrap gap-2">
            {goalLabels.map((g) => (
              <span
                key={g}
                className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          Paso {step} de {total}
        </span>
        <span>{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const mutation = useCompleteOnboarding()

  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)

  // Step 1
  const [name, setName] = useState((session?.user?.name as string) ?? '')
  const [currency, setCurrency] = useState('USD')

  // Step 2
  const [income, setIncome] = useState('')
  const [incomeSource, setIncomeSource] = useState('salary')

  // Step 3
  const [expenses, setExpenses] = useState<Expenses>({
    housing: '',
    food: '',
    transport: '',
    health: '',
    entertainment: '',
    other: '',
  })

  // Step 4
  const [goals, setGoals] = useState<string[]>([])

  // Step 5
  const [accounts, setAccounts] = useState<OnboardingAccount[]>([])

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0
    if (step === 2) return Number(income) > 0 && incomeSource !== ''
    if (step === 4) return goals.length > 0
    return true
  }

  const handleNext = () => {
    setError(null)
    if (!canProceed()) return
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
  }

  const handleFinish = async () => {
    setError(null)
    try {
      await mutation.mutateAsync({
        name: name.trim(),
        baseCurrency: currency,
        monthlyIncome: Number(income) || 0,
        incomeSource,
        housingCost: Number(expenses.housing) || 0,
        foodBudget: Number(expenses.food) || 0,
        transportBudget: Number(expenses.transport) || 0,
        healthBudget: Number(expenses.health) || 0,
        entertainmentBudget: Number(expenses.entertainment) || 0,
        otherExpenses: Number(expenses.other) || 0,
        goals,
        accounts: accounts.filter((a) => a.name.trim()),
      })
      await updateSession()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al guardar el plan. Intenta de nuevo.')
    }
  }

  const stepIcons = [TrendingUp, Banknote, BarChart3, Target, Wallet, Sparkles]
  const StepIcon = stepIcons[step - 1] ?? Sparkles

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <StepIcon className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">Bills</span>
        </div>

        <ProgressBar step={step} total={TOTAL_STEPS} />

        {/* Card */}
        <div className="mt-6 rounded-2xl border border-border bg-card shadow-xl p-6">
          {step === 1 && (
            <StepWelcome name={name} setName={setName} currency={currency} setCurrency={setCurrency} />
          )}
          {step === 2 && (
            <StepIncome income={income} setIncome={setIncome} source={incomeSource} setSource={setIncomeSource} currency={currency} />
          )}
          {step === 3 && (
            <StepExpenses expenses={expenses} setExpenses={setExpenses} currency={currency} />
          )}
          {step === 4 && <StepGoals goals={goals} setGoals={setGoals} />}
          {step === 5 && (
            <StepAccounts accounts={accounts} setAccounts={setAccounts} currency={currency} />
          )}
          {step === 6 && (
            <StepSummary
              name={name}
              currency={currency}
              income={income}
              expenses={expenses}
              goals={goals}
              accounts={accounts}
            />
          )}

          {error && (
            <p className="mt-4 text-sm text-rose-400 bg-rose-500/10 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-4 flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
          )}
          <div className="flex-1" />

          {step < TOTAL_STEPS ? (
            <Button onClick={handleNext} disabled={!canProceed()} className="flex items-center gap-1">
              {step === 5 ? 'Ver mi plan' : 'Siguiente'} <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={mutation.isPending}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {mutation.isPending ? (
                'Guardando…'
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Comenzar
                </>
              )}
            </Button>
          )}
        </div>

        {/* Skip link */}
        {step !== TOTAL_STEPS && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            ¿Prefieres configurarlo después?{' '}
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="underline hover:text-foreground transition-colors"
            >
              Ir al dashboard
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
