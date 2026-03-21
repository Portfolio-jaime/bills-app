'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCompleteOnboarding, OnboardingAccount, IncomeEntry } from '@/lib/queries/onboarding'
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
  Zap,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7

const INCOME_SOURCES = [
  { value: 'salary',       label: '💼 Salario / Empleo' },
  { value: 'freelance',    label: '💻 Freelance / Contratos' },
  { value: 'business',     label: '🏢 Negocio propio' },
  { value: 'investment',   label: '📈 Inversiones / Dividendos' },
  { value: 'rental',       label: '🏠 Arriendos / Renta' },
  { value: 'pension',      label: '🏦 Pensión / Jubilación' },
  { value: 'scholarship',  label: '🎓 Beca / Ayuda educativa' },
  { value: 'remittance',   label: '💸 Remesas' },
  { value: 'online_sales', label: '🛒 Ventas online' },
  { value: 'bonus',        label: '🎁 Bonos / Comisiones' },
  { value: 'crypto',       label: '₿ Cripto / Trading' },
  { value: 'other',        label: '🔀 Otro' },
]

const FINANCIAL_GOALS = [
  { value: 'emergency_fund', label: '🛡️ Fondo de emergencia',  desc: '3–6 meses de gastos' },
  { value: 'pay_debt',       label: '💳 Pagar deudas',          desc: 'Tarjetas, préstamos, créditos' },
  { value: 'invest',         label: '📈 Invertir',              desc: 'Acciones, fondos, ETFs, cripto' },
  { value: 'save_travel',    label: '✈️ Ahorrar para viaje',    desc: 'Vacaciones o experiencias' },
  { value: 'buy_home',       label: '🏠 Comprar vivienda',      desc: 'Casa o apartamento propio' },
  { value: 'buy_car',        label: '🚗 Comprar vehículo',      desc: 'Carro, moto, bicicleta' },
  { value: 'retirement',     label: '🌴 Retiro anticipado',     desc: 'Libertad financiera' },
  { value: 'education',      label: '🎓 Educación / Posgrado',  desc: 'Formación y desarrollo profesional' },
  { value: 'start_business', label: '🏢 Emprender',             desc: 'Iniciar o expandir un negocio' },
  { value: 'track_only',     label: '📊 Solo llevar control',   desc: 'Entender mis finanzas' },
]

const ACCOUNT_TYPES = [
  { value: 'BANK',        label: '🏦 Cuenta bancaria' },
  { value: 'CASH',        label: '💵 Efectivo' },
  { value: 'CREDIT_CARD', label: '💳 Tarjeta de crédito' },
  { value: 'INVESTMENT',  label: '📈 Inversiones' },
  { value: 'CRYPTO',      label: '₿ Cripto' },
]

// ─── Expense types ─────────────────────────────────────────────────────────────

interface EssentialExpenses {
  housing: string
  food: string; dining: string
  transport: string; fuel: string; rideshare: string
  medical: string; pharmacy: string; gym: string
}

interface DetailedExpenses {
  electricity: string; water: string; gasNatural: string
  internet: string; phone: string
  streaming: string; musicSub: string; gamingSub: string; softwareSub: string
  education: string; school: string
  clothing: string; beauty: string
  entertainment: string; social: string
  pets: string; insurance: string; other: string
}

const INIT_ESSENTIALS: EssentialExpenses = {
  housing: '', food: '', dining: '', transport: '', fuel: '',
  rideshare: '', medical: '', pharmacy: '', gym: '',
}

const INIT_DETAILED: DetailedExpenses = {
  electricity: '', water: '', gasNatural: '', internet: '', phone: '',
  streaming: '', musicSub: '', gamingSub: '', softwareSub: '',
  education: '', school: '',
  clothing: '', beauty: '',
  entertainment: '', social: '',
  pets: '', insurance: '', other: '',
}

const n = (v: string) => Number(v) || 0

// ─── Shared helpers ────────────────────────────────────────────────────────────

function ExpRow({ icon, label, placeholder, value, onChange, currency }: {
  icon: string; label: string; placeholder: string
  value: string; onChange: (v: string) => void; currency: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg w-6 text-center flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <Input type="number" min="0" step="10" value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} className="h-8 text-sm" />
          <span className="text-xs text-muted-foreground flex-shrink-0">{currency}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1 border-b border-border/50">
      <span>{icon}</span>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</span>
    </div>
  )
}

// ─── Step components ──────────────────────────────────────────────────────────

function StepWelcome({ name, setName, currency, setCurrency }: {
  name: string; setName: (v: string) => void
  currency: string; setCurrency: (v: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-4">👋</div>
        <h2 className="text-2xl font-bold text-foreground">¡Bienvenido/a a Bills!</h2>
        <p className="text-muted-foreground text-sm">Vamos a configurar tu perfil financiero en pocos minutos.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">¿Cómo te llamas?</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoFocus />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Moneda principal</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {SUPPORTED_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <p className="text-xs text-muted-foreground">Todos tus totales se mostrarán en esta moneda.</p>
        </div>
      </div>
    </div>
  )
}

function StepIncome({ entries, setEntries, currency }: {
  entries: IncomeEntry[]; setEntries: (v: IncomeEntry[]) => void; currency: string
}) {
  const add = () => setEntries([...entries, { source: 'other', amount: '' }])
  const remove = (i: number) => setEntries(entries.filter((_, idx) => idx !== i))
  const update = (i: number, patch: Partial<IncomeEntry>) =>
    setEntries(entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))
  const total = entries.reduce((s, e) => s + n(e.amount), 0)

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <div className="text-4xl mb-2">💰</div>
        <h2 className="text-2xl font-bold text-foreground">Tus ingresos</h2>
        <p className="text-muted-foreground text-sm">Agrega todas tus fuentes de ingreso mensual.</p>
      </div>
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div key={i} className="flex gap-2 items-center rounded-lg border border-border bg-muted/10 p-3">
            <select
              value={entry.source}
              onChange={(e) => update(i, { source: e.target.value })}
              className="flex-1 h-9 px-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {INCOME_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <div className="flex items-center gap-1 w-36">
              <Input type="number" min="0" step="100" value={entry.amount}
                onChange={(e) => update(i, { amount: e.target.value })}
                placeholder="0" className="h-9 text-sm" />
              <span className="text-xs text-muted-foreground flex-shrink-0">{currency}</span>
            </div>
            {entries.length > 1 && (
              <button onClick={() => remove(i)} className="text-muted-foreground hover:text-rose-400 transition-colors p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={add}
          className="w-full border border-dashed border-border rounded-lg py-2 text-sm text-muted-foreground hover:text-foreground hover:border-border/70 transition-colors flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" /> Agregar otra fuente
        </button>
      </div>
      {total > 0 && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
          <p className="text-xs text-muted-foreground">Total mensual</p>
          <p className="text-xl font-bold text-emerald-400">{total.toLocaleString()} {currency}</p>
        </div>
      )}
    </div>
  )
}

function StepEssentialExpenses({ exp, setExp, currency }: {
  exp: EssentialExpenses; setExp: (v: EssentialExpenses) => void; currency: string
}) {
  const set = (k: keyof EssentialExpenses) => (v: string) => setExp({ ...exp, [k]: v })
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <div className="text-4xl mb-2">🏠</div>
        <h2 className="text-2xl font-bold text-foreground">Gastos esenciales</h2>
        <p className="text-muted-foreground text-sm">Deja en 0 si no aplica. Puedes ajustar después.</p>
      </div>
      <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
        <SectionHeader icon="🏠" title="Vivienda" />
        <ExpRow icon="🏠" label="Arriendo / Hipoteca" placeholder="800" value={exp.housing} onChange={set('housing')} currency={currency} />
        <SectionHeader icon="🛒" title="Alimentación" />
        <ExpRow icon="🛒" label="Supermercado / Mercado" placeholder="400" value={exp.food} onChange={set('food')} currency={currency} />
        <ExpRow icon="🍽️" label="Restaurantes / Delivery" placeholder="150" value={exp.dining} onChange={set('dining')} currency={currency} />
        <SectionHeader icon="🚗" title="Transporte" />
        <ExpRow icon="🚌" label="Transporte público / Bus" placeholder="80" value={exp.transport} onChange={set('transport')} currency={currency} />
        <ExpRow icon="⛽" label="Gasolina / Combustible" placeholder="120" value={exp.fuel} onChange={set('fuel')} currency={currency} />
        <ExpRow icon="🚕" label="Uber / Taxi / Rideshare" placeholder="60" value={exp.rideshare} onChange={set('rideshare')} currency={currency} />
        <SectionHeader icon="🏥" title="Salud y bienestar" />
        <ExpRow icon="🏥" label="Médico / EPS / Prepagada" placeholder="100" value={exp.medical} onChange={set('medical')} currency={currency} />
        <ExpRow icon="💊" label="Farmacia / Medicamentos" placeholder="50" value={exp.pharmacy} onChange={set('pharmacy')} currency={currency} />
        <ExpRow icon="🏋️" label="Gimnasio / Deporte" placeholder="40" value={exp.gym} onChange={set('gym')} currency={currency} />
      </div>
    </div>
  )
}

function StepDetailedExpenses({ exp, setExp, currency }: {
  exp: DetailedExpenses; setExp: (v: DetailedExpenses) => void; currency: string
}) {
  const set = (k: keyof DetailedExpenses) => (v: string) => setExp({ ...exp, [k]: v })
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <div className="text-4xl mb-2">📡</div>
        <h2 className="text-2xl font-bold text-foreground">Servicios y más</h2>
        <p className="text-muted-foreground text-sm">Servicios públicos, plataformas y otros gastos.</p>
      </div>
      <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
        <SectionHeader icon="📡" title="Servicios públicos" />
        <ExpRow icon="⚡" label="Electricidad / Luz" placeholder="60" value={exp.electricity} onChange={set('electricity')} currency={currency} />
        <ExpRow icon="💧" label="Agua" placeholder="20" value={exp.water} onChange={set('water')} currency={currency} />
        <ExpRow icon="🔥" label="Gas natural" placeholder="25" value={exp.gasNatural} onChange={set('gasNatural')} currency={currency} />
        <ExpRow icon="📡" label="Internet / WiFi" placeholder="40" value={exp.internet} onChange={set('internet')} currency={currency} />
        <ExpRow icon="📱" label="Celular / Teléfono" placeholder="30" value={exp.phone} onChange={set('phone')} currency={currency} />
        <SectionHeader icon="📺" title="Plataformas y suscripciones" />
        <ExpRow icon="🎬" label="Streaming (Netflix, HBO, Disney...)" placeholder="20" value={exp.streaming} onChange={set('streaming')} currency={currency} />
        <ExpRow icon="🎵" label="Música (Spotify, Apple Music...)" placeholder="10" value={exp.musicSub} onChange={set('musicSub')} currency={currency} />
        <ExpRow icon="🎮" label="Gaming / Xbox / PlayStation" placeholder="15" value={exp.gamingSub} onChange={set('gamingSub')} currency={currency} />
        <ExpRow icon="💻" label="Software / Apps / Cloud (Adobe, MS365...)" placeholder="20" value={exp.softwareSub} onChange={set('softwareSub')} currency={currency} />
        <SectionHeader icon="🎓" title="Educación" />
        <ExpRow icon="📚" label="Cursos / Formación online" placeholder="50" value={exp.education} onChange={set('education')} currency={currency} />
        <ExpRow icon="🎓" label="Colegio / Universidad" placeholder="200" value={exp.school} onChange={set('school')} currency={currency} />
        <SectionHeader icon="👕" title="Personal y estilo" />
        <ExpRow icon="👕" label="Ropa y moda" placeholder="80" value={exp.clothing} onChange={set('clothing')} currency={currency} />
        <ExpRow icon="💄" label="Belleza y cuidado personal" placeholder="40" value={exp.beauty} onChange={set('beauty')} currency={currency} />
        <SectionHeader icon="🎮" title="Entretenimiento y social" />
        <ExpRow icon="🎮" label="Entretenimiento general" placeholder="60" value={exp.entertainment} onChange={set('entertainment')} currency={currency} />
        <ExpRow icon="🍺" label="Salidas / Planes sociales" placeholder="80" value={exp.social} onChange={set('social')} currency={currency} />
        <SectionHeader icon="📦" title="Mascotas, seguros y otros" />
        <ExpRow icon="🐶" label="Mascotas (comida, vet...)" placeholder="50" value={exp.pets} onChange={set('pets')} currency={currency} />
        <ExpRow icon="🛡️" label="Seguros (auto, vida, hogar...)" placeholder="60" value={exp.insurance} onChange={set('insurance')} currency={currency} />
        <ExpRow icon="📦" label="Otros gastos" placeholder="50" value={exp.other} onChange={set('other')} currency={currency} />
      </div>
    </div>
  )
}

function StepGoals({ goals, setGoals }: { goals: string[]; setGoals: (v: string[]) => void }) {
  const toggle = (value: string) =>
    setGoals(goals.includes(value) ? goals.filter((g) => g !== value) : [...goals, value])

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <div className="text-4xl mb-2">🎯</div>
        <h2 className="text-2xl font-bold text-foreground">Tus metas financieras</h2>
        <p className="text-muted-foreground text-sm">Selecciona una o varias.</p>
      </div>
      <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-1">
        {FINANCIAL_GOALS.map((g) => {
          const selected = goals.includes(g.value)
          return (
            <button key={g.value} type="button" onClick={() => toggle(g.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-3 ${
                selected ? 'border-indigo-500 bg-indigo-500/10' : 'border-border bg-muted/20 hover:border-border/70'
              }`}
            >
              <span className="text-lg flex-shrink-0">{g.label.split(' ')[0]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{g.label.split(' ').slice(1).join(' ')}</p>
                <p className="text-xs text-muted-foreground">{g.desc}</p>
              </div>
              {selected && <CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepAccounts({ accounts, setAccounts, currency }: {
  accounts: OnboardingAccount[]; setAccounts: (v: OnboardingAccount[]) => void; currency: string
}) {
  const add = () => setAccounts([...accounts, { name: '', type: 'BANK', currency, balance: 0 }])
  const remove = (i: number) => setAccounts(accounts.filter((_, idx) => idx !== i))
  const update = (i: number, patch: Partial<OnboardingAccount>) =>
    setAccounts(accounts.map((a, idx) => (idx === i ? { ...a, ...patch } : a)))

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <div className="text-4xl mb-2">🏦</div>
        <h2 className="text-2xl font-bold text-foreground">Tus cuentas actuales</h2>
        <p className="text-muted-foreground text-sm">Agrega las que usas hoy. Puedes agregar más después.</p>
      </div>
      <div className="space-y-3 overflow-y-auto max-h-[45vh] pr-1">
        {accounts.map((acc, i) => (
          <div key={i} className="rounded-lg border border-border bg-muted/10 p-3 space-y-2">
            <div className="flex gap-2 items-center">
              <Input value={acc.name} onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Nombre de la cuenta" className="flex-1" />
              <button type="button" onClick={() => remove(i)}
                className="text-muted-foreground hover:text-rose-400 transition-colors p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <select value={acc.type} onChange={(e) => update(i, { type: e.target.value })}
                className="flex-1 h-9 px-2 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                {ACCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div className="flex items-center gap-1">
                <Input type="number" min="0" step="100" value={acc.balance ?? ''}
                  onChange={(e) => update(i, { balance: Number(e.target.value) })}
                  placeholder="Saldo" className="w-28 h-9 text-sm" />
                <span className="text-xs text-muted-foreground">{currency}</span>
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={add}
          className="w-full border border-dashed border-border rounded-lg py-3 text-sm text-muted-foreground hover:text-foreground hover:border-border/70 transition-colors flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" /> Agregar cuenta
        </button>
      </div>
      {accounts.length === 0 && (
        <p className="text-xs text-center text-muted-foreground">Puedes omitir este paso y agregar cuentas desde el dashboard.</p>
      )}
    </div>
  )
}

function StepSummary({ name, currency, incomeEntries, essentials, detailed, goals, accounts }: {
  name: string; currency: string
  incomeEntries: IncomeEntry[]; essentials: EssentialExpenses; detailed: DetailedExpenses
  goals: string[]; accounts: OnboardingAccount[]
}) {
  const totalIncome = incomeEntries.reduce((s, e) => s + n(e.amount), 0)
  const budgets = [
    { label: '🏠 Vivienda', amount: n(essentials.housing) },
    { label: '🛒 Alimentación', amount: n(essentials.food) + n(essentials.dining) },
    { label: '🚗 Transporte', amount: n(essentials.transport) + n(essentials.fuel) + n(essentials.rideshare) },
    { label: '🏥 Salud', amount: n(essentials.medical) + n(essentials.pharmacy) + n(essentials.gym) },
    { label: '📡 Servicios públicos', amount: n(detailed.electricity) + n(detailed.water) + n(detailed.gasNatural) + n(detailed.internet) + n(detailed.phone) },
    { label: '📺 Plataformas', amount: n(detailed.streaming) + n(detailed.musicSub) + n(detailed.gamingSub) + n(detailed.softwareSub) },
    { label: '🎮 Entretenimiento', amount: n(detailed.entertainment) + n(detailed.social) },
    { label: '📦 Otros', amount: n(detailed.education) + n(detailed.school) + n(detailed.clothing) + n(detailed.beauty) + n(detailed.pets) + n(detailed.insurance) + n(detailed.other) },
  ].filter((b) => b.amount > 0)

  const totalExpenses = budgets.reduce((s, b) => s + b.amount, 0)
  const savings = Math.max(0, totalIncome - totalExpenses)
  const savingsPct = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0
  const goalLabels = FINANCIAL_GOALS.filter((g) => goals.includes(g.value))

  return (
    <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1">
      <div className="text-center space-y-1">
        <div className="text-4xl mb-2">✨</div>
        <h2 className="text-2xl font-bold text-foreground">Tu plan financiero</h2>
        <p className="text-muted-foreground text-sm">Basado en tus respuestas.</p>
      </div>

      <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart3 className="h-4 w-4 text-indigo-400" /> Resumen mensual de {name}
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2">
            <p className="text-xs text-muted-foreground">Ingresos</p>
            <p className="text-lg font-bold text-emerald-400">{totalIncome.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{currency}</p>
          </div>
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2">
            <p className="text-xs text-muted-foreground">Gastos</p>
            <p className="text-lg font-bold text-rose-400">{totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{currency}</p>
          </div>
          <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-2">
            <p className="text-xs text-muted-foreground">Ahorro</p>
            <p className="text-lg font-bold text-indigo-400">{savings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{currency}</p>
          </div>
        </div>
        {savingsPct > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            💡 Ahorras el <strong className="text-foreground">{savingsPct}%</strong> de tus ingresos
            {savingsPct >= 20 ? ' — ¡excelente!' : '. Meta recomendada: 20%.'}
          </p>
        )}
      </div>

      {budgets.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target className="h-4 w-4 text-indigo-400" /> Presupuestos mensuales a crear
          </div>
          {budgets.map((b) => (
            <div key={b.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{b.label}</span>
              <span className="font-medium text-foreground">{b.amount.toLocaleString()} {currency}</span>
            </div>
          ))}
        </div>
      )}

      {incomeEntries.filter((e) => n(e.amount) > 0).length > 0 && (
        <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Banknote className="h-4 w-4 text-indigo-400" /> Fuentes de ingreso
          </div>
          {incomeEntries.filter((e) => n(e.amount) > 0).map((e, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{INCOME_SOURCES.find((s) => s.value === e.source)?.label ?? e.source}</span>
              <span className="font-medium text-foreground">{n(e.amount).toLocaleString()} {currency}</span>
            </div>
          ))}
        </div>
      )}

      {accounts.filter((a) => a.name.trim()).length > 0 && (
        <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Wallet className="h-4 w-4 text-indigo-400" /> Cuentas ({accounts.filter((a) => a.name.trim()).length})
          </div>
          {accounts.filter((a) => a.name.trim()).map((a, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{ACCOUNT_TYPES.find((t) => t.value === a.type)?.label.split(' ')[0]} {a.name}</span>
              <span className="font-medium text-foreground">{(a.balance ?? 0).toLocaleString()} {a.currency || currency}</span>
            </div>
          ))}
        </div>
      )}

      {goalLabels.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-indigo-400" /> Tus metas
          </div>
          <div className="flex flex-wrap gap-2">
            {goalLabels.map((g) => (
              <span key={g.value} className="text-xs px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                {g.label}
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

  const [name, setName] = useState((session?.user?.name as string) ?? '')
  const [currency, setCurrency] = useState('USD')
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([{ source: 'salary', amount: '' }])
  const [essentials, setEssentials] = useState<EssentialExpenses>(INIT_ESSENTIALS)
  const [detailed, setDetailed] = useState<DetailedExpenses>(INIT_DETAILED)
  const [goals, setGoals] = useState<string[]>([])
  const [accounts, setAccounts] = useState<OnboardingAccount[]>([])

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0
    if (step === 2) return incomeEntries.some((e) => n(e.amount) > 0)
    if (step === 5) return goals.length > 0
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
      const totalIncome = incomeEntries.reduce((s, e) => s + n(e.amount), 0)
      const primarySource = [...incomeEntries]
        .filter((e) => n(e.amount) > 0)
        .sort((a, b) => n(b.amount) - n(a.amount))[0]?.source ?? 'other'

      await mutation.mutateAsync({
        name: name.trim(),
        baseCurrency: currency,
        monthlyIncome: totalIncome,
        incomeSource: primarySource,
        housingCost: n(essentials.housing),
        foodBudget: n(essentials.food) + n(essentials.dining),
        transportBudget: n(essentials.transport) + n(essentials.fuel) + n(essentials.rideshare),
        healthBudget: n(essentials.medical) + n(essentials.pharmacy) + n(essentials.gym),
        utilitiesBudget: n(detailed.electricity) + n(detailed.water) + n(detailed.gasNatural) + n(detailed.internet) + n(detailed.phone),
        subscriptionsBudget: n(detailed.streaming) + n(detailed.musicSub) + n(detailed.gamingSub) + n(detailed.softwareSub),
        entertainmentBudget: n(detailed.entertainment) + n(detailed.social),
        otherExpenses: n(detailed.education) + n(detailed.school) + n(detailed.clothing) + n(detailed.beauty) + n(detailed.pets) + n(detailed.insurance) + n(detailed.other),
        goals,
        accounts: accounts.filter((a) => a.name.trim()),
      })
      await updateSession()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al guardar el plan. Intenta de nuevo.')
    }
  }

  const stepIcons = [TrendingUp, Banknote, BarChart3, Zap, Target, Wallet, Sparkles]
  const StepIcon = stepIcons[step - 1] ?? Sparkles
  const stepLabels = ['Bienvenida', 'Ingresos', 'Gastos', 'Servicios', 'Metas', 'Cuentas', 'Tu plan']

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <StepIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">Bills</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium px-2 py-1 rounded-full bg-muted/40">
            {stepLabels[step - 1]}
          </span>
        </div>

        <ProgressBar step={step} total={TOTAL_STEPS} />

        {/* Card */}
        <div className="mt-5 rounded-2xl border border-border bg-card shadow-xl p-6">
          {step === 1 && <StepWelcome name={name} setName={setName} currency={currency} setCurrency={setCurrency} />}
          {step === 2 && <StepIncome entries={incomeEntries} setEntries={setIncomeEntries} currency={currency} />}
          {step === 3 && <StepEssentialExpenses exp={essentials} setExp={setEssentials} currency={currency} />}
          {step === 4 && <StepDetailedExpenses exp={detailed} setExp={setDetailed} currency={currency} />}
          {step === 5 && <StepGoals goals={goals} setGoals={setGoals} />}
          {step === 6 && <StepAccounts accounts={accounts} setAccounts={setAccounts} currency={currency} />}
          {step === 7 && (
            <StepSummary
              name={name} currency={currency}
              incomeEntries={incomeEntries} essentials={essentials} detailed={detailed}
              goals={goals} accounts={accounts}
            />
          )}
          {error && (
            <p className="mt-4 text-sm text-rose-400 bg-rose-500/10 rounded-md px-3 py-2">{error}</p>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-4 flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
          )}
          <div className="flex-1" />
          {step < TOTAL_STEPS ? (
            <Button onClick={handleNext} disabled={!canProceed()} className="flex items-center gap-1">
              {step === 6 ? 'Ver mi plan' : 'Siguiente'} <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={mutation.isPending}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
              {mutation.isPending ? 'Guardando…' : <><CheckCircle2 className="h-4 w-4" /> Comenzar</>}
            </Button>
          )}
        </div>

        {step !== TOTAL_STEPS && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            ¿Prefieres configurarlo después?{' '}
            <button type="button" onClick={() => router.push('/dashboard')}
              className="underline hover:text-foreground transition-colors">
              Ir al dashboard
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
