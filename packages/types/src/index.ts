import { z } from 'zod'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const AccountType = z.enum(['BANK', 'CASH', 'INVESTMENT', 'CRYPTO', 'CREDIT_CARD'])
export type AccountType = z.infer<typeof AccountType>

export const TransactionType = z.enum(['INCOME', 'EXPENSE', 'TRANSFER'])
export type TransactionType = z.infer<typeof TransactionType>

export const TransactionSource = z.enum([
  'MANUAL',
  'CONNECTOR_BELVO',
  'CONNECTOR_WISE',
  'CONNECTOR_BINANCE',
  'CONNECTOR_STRIPE',
  'CONNECTOR_PAYPAL',
  'CONNECTOR_REVOLUT',
  'CONNECTOR_COINBASE',
])
export type TransactionSource = z.infer<typeof TransactionSource>

export const CategoryType = z.enum(['INCOME', 'EXPENSE', 'BOTH'])
export type CategoryType = z.infer<typeof CategoryType>

export const BudgetPeriod = z.enum(['WEEKLY', 'MONTHLY', 'YEARLY'])
export type BudgetPeriod = z.infer<typeof BudgetPeriod>

// ─── Supported currencies ─────────────────────────────────────────────────────

export const SUPPORTED_CURRENCIES = ['COP', 'USD', 'EUR', 'GBP', 'BTC', 'ETH'] as const
export const Currency = z.enum(SUPPORTED_CURRENCIES)
export type Currency = z.infer<typeof Currency>

// ─── Auth schemas ─────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  name: z.string().min(1).max(100).optional(),
})
export type RegisterDto = z.infer<typeof RegisterSchema>

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export type LoginDto = z.infer<typeof LoginSchema>

export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(), // seconds
})
export type TokenResponse = z.infer<typeof TokenResponseSchema>

// ─── Account schemas ──────────────────────────────────────────────────────────

export const CreateAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: AccountType,
  currency: Currency,
  balance: z.number().min(0).default(0),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  icon: z.string().max(50).optional(),
})
export type CreateAccountDto = z.infer<typeof CreateAccountSchema>

export const UpdateAccountSchema = CreateAccountSchema.partial()
export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>

export const AccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: AccountType,
  currency: Currency,
  balance: z.number(),
  color: z.string().nullable(),
  icon: z.string().nullable(),
  isManual: z.boolean(),
  connectorId: z.string().nullable(),
  updatedAt: z.string().datetime(),
})
export type Account = z.infer<typeof AccountSchema>

// ─── Transaction schemas ──────────────────────────────────────────────────────

export const CreateTransactionSchema = z
  .object({
    type: TransactionType,
    amount: z.number().positive(),
    currency: Currency,
    accountId: z.string().cuid(),
    toAccountId: z.string().cuid().optional(),
    categoryId: z.string().cuid().optional(),
    date: z.string().datetime(),
    description: z.string().min(1).max(255),
    notes: z.string().max(1000).optional(),
    tags: z.array(z.string().max(50)).max(10).default([]),
    isRecurring: z.boolean().default(false),
    recurringRule: z.string().max(100).optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'TRANSFER') {
        return !!data.toAccountId && data.toAccountId !== data.accountId
      }
      return true
    },
    {
      message: 'TRANSFER requires a valid toAccountId different from accountId',
      path: ['toAccountId'],
    },
  )
export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>

// UpdateTransactionSchema — partial of the base object (without the TRANSFER refinement)
export const UpdateTransactionSchema = z.object({
  type: TransactionType.optional(),
  amount: z.number().positive().optional(),
  currency: Currency.optional(),
  accountId: z.string().cuid().optional(),
  toAccountId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  date: z.string().datetime().optional(),
  description: z.string().min(1).max(255).optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isRecurring: z.boolean().optional(),
  recurringRule: z.string().max(100).optional(),
})
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>

export const TransactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  type: TransactionType.optional(),
  categoryId: z.string().cuid().optional(),
  accountId: z.string().cuid().optional(),
  search: z.string().max(100).optional(),
})
export type TransactionQuery = z.infer<typeof TransactionQuerySchema>

export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  accountId: z.string(),
  toAccountId: z.string().nullable(),
  categoryId: z.string().nullable(),
  type: TransactionType,
  amount: z.number(),
  currency: Currency,
  amountInBaseCurrency: z.number(),
  exchangeRate: z.number(),
  date: z.string().datetime(),
  description: z.string(),
  notes: z.string().nullable(),
  tags: z.array(z.string()),
  attachments: z.array(z.string()),
  isRecurring: z.boolean(),
  recurringRule: z.string().nullable(),
  source: TransactionSource,
  externalId: z.string().nullable(),
  updatedAt: z.string().datetime(),
})
export type Transaction = z.infer<typeof TransactionSchema>

export const PaginatedTransactionsSchema = z.object({
  data: z.array(TransactionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})
export type PaginatedTransactions = z.infer<typeof PaginatedTransactionsSchema>

// ─── Category schemas ─────────────────────────────────────────────────────────

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  type: CategoryType,
  parentId: z.string().cuid().optional(),
})
export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>

export const UpdateCategorySchema = CreateCategorySchema.partial()
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>

interface CategoryType_Shape {
  id: string
  userId: string
  name: string
  icon: string | null
  color: string | null
  type: z.infer<typeof CategoryType>
  parentId: string | null
  updatedAt: string
  children?: CategoryType_Shape[]
}
export type Category = CategoryType_Shape

export const CategorySchema: z.ZodType<CategoryType_Shape> = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  type: CategoryType,
  parentId: z.string().nullable(),
  updatedAt: z.string().datetime(),
  children: z.array(z.lazy(() => CategorySchema)).optional(),
})

// ─── Budget schemas ───────────────────────────────────────────────────────────

export const CreateBudgetSchema = z.object({
  categoryId: z.string().cuid(),
  amount: z.number().positive(),
  period: BudgetPeriod,
  startDate: z.string().datetime(),
  alertAt: z.number().int().min(1).max(100).default(80),
})
export type CreateBudgetDto = z.infer<typeof CreateBudgetSchema>

export const UpdateBudgetSchema = CreateBudgetSchema.partial()
export type UpdateBudgetDto = z.infer<typeof UpdateBudgetSchema>

export const BudgetStatusSchema = z.object({
  budgetId: z.string(),
  categoryId: z.string(),
  categoryName: z.string(),
  categoryIcon: z.string().nullable(),
  categoryColor: z.string().nullable(),
  amount: z.number(),
  spent: z.number(),
  remaining: z.number(),
  percentage: z.number(),
  alertAt: z.number(),
  period: BudgetPeriod,
  isOverBudget: z.boolean(),
  isAlertTriggered: z.boolean(),
})
export type BudgetStatus = z.infer<typeof BudgetStatusSchema>

// ─── Dashboard schemas ────────────────────────────────────────────────────────

export const DashboardSummarySchema = z.object({
  totalBalanceInBaseCurrency: z.number(),
  monthlyIncome: z.number(),
  monthlyExpenses: z.number(),
  monthlySavings: z.number(),
  savingsRate: z.number(), // percentage
  baseCurrency: Currency,
  accountBalances: z.array(
    z.object({
      accountId: z.string(),
      accountName: z.string(),
      accountType: AccountType,
      currency: Currency,
      balance: z.number(),
      balanceInBaseCurrency: z.number(),
      color: z.string().nullable(),
    }),
  ),
})
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>

export const MonthlyChartDataSchema = z.object({
  month: z.string(), // "2026-01"
  income: z.number(),
  expenses: z.number(),
  savings: z.number(),
})
export type MonthlyChartData = z.infer<typeof MonthlyChartDataSchema>

export const CategoryChartDataSchema = z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  color: z.string().nullable(),
  amount: z.number(),
  percentage: z.number(),
  transactionCount: z.number(),
})
export type CategoryChartData = z.infer<typeof CategoryChartDataSchema>

// ─── User/Profile schemas ─────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  baseCurrency: Currency.optional(),
  avatar: z.string().url().optional(),
})
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatar: z.string().nullable(),
  baseCurrency: Currency,
  createdAt: z.string().datetime(),
})
export type User = z.infer<typeof UserSchema>

// ─── Common / API response wrappers ──────────────────────────────────────────

export const ApiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string().or(z.array(z.string())),
  error: z.string().optional(),
})
export type ApiError = z.infer<typeof ApiErrorSchema>
