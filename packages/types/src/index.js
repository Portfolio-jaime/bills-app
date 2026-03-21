"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorSchema = exports.UserSchema = exports.UpdateProfileSchema = exports.CategoryChartDataSchema = exports.MonthlyChartDataSchema = exports.DashboardSummarySchema = exports.BudgetStatusSchema = exports.UpdateBudgetSchema = exports.CreateBudgetSchema = exports.CategorySchema = exports.UpdateCategorySchema = exports.CreateCategorySchema = exports.PaginatedTransactionsSchema = exports.TransactionSchema = exports.TransactionQuerySchema = exports.UpdateTransactionSchema = exports.CreateTransactionSchema = exports.AccountSchema = exports.UpdateAccountSchema = exports.CreateAccountSchema = exports.TokenResponseSchema = exports.LoginSchema = exports.RegisterSchema = exports.Currency = exports.SUPPORTED_CURRENCIES = exports.BudgetPeriod = exports.CategoryType = exports.TransactionSource = exports.TransactionType = exports.AccountType = void 0;
const zod_1 = require("zod");
exports.AccountType = zod_1.z.enum(['BANK', 'CASH', 'INVESTMENT', 'CRYPTO', 'CREDIT_CARD']);
exports.TransactionType = zod_1.z.enum(['INCOME', 'EXPENSE', 'TRANSFER']);
exports.TransactionSource = zod_1.z.enum([
    'MANUAL',
    'CONNECTOR_BELVO',
    'CONNECTOR_WISE',
    'CONNECTOR_BINANCE',
    'CONNECTOR_STRIPE',
    'CONNECTOR_PAYPAL',
    'CONNECTOR_REVOLUT',
    'CONNECTOR_COINBASE',
]);
exports.CategoryType = zod_1.z.enum(['INCOME', 'EXPENSE', 'BOTH']);
exports.BudgetPeriod = zod_1.z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']);
exports.SUPPORTED_CURRENCIES = ['COP', 'USD', 'EUR', 'GBP', 'BTC', 'ETH'];
exports.Currency = zod_1.z.enum(exports.SUPPORTED_CURRENCIES);
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Must contain at least one number'),
    name: zod_1.z.string().min(1).max(100).optional(),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.TokenResponseSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    expiresIn: zod_1.z.number(),
});
exports.CreateAccountSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    type: exports.AccountType,
    currency: exports.Currency,
    balance: zod_1.z.number().min(0).default(0),
    color: zod_1.z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
    icon: zod_1.z.string().max(50).optional(),
});
exports.UpdateAccountSchema = exports.CreateAccountSchema.partial();
exports.AccountSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    name: zod_1.z.string(),
    type: exports.AccountType,
    currency: exports.Currency,
    balance: zod_1.z.number(),
    color: zod_1.z.string().nullable(),
    icon: zod_1.z.string().nullable(),
    isManual: zod_1.z.boolean(),
    connectorId: zod_1.z.string().nullable(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.CreateTransactionSchema = zod_1.z
    .object({
    type: exports.TransactionType,
    amount: zod_1.z.number().positive(),
    currency: exports.Currency,
    accountId: zod_1.z.string().cuid(),
    toAccountId: zod_1.z.string().cuid().optional(),
    categoryId: zod_1.z.string().cuid().optional(),
    date: zod_1.z.string().datetime(),
    description: zod_1.z.string().min(1).max(255),
    notes: zod_1.z.string().max(1000).optional(),
    tags: zod_1.z.array(zod_1.z.string().max(50)).max(10).default([]),
    isRecurring: zod_1.z.boolean().default(false),
    recurringRule: zod_1.z.string().max(100).optional(),
})
    .refine((data) => {
    if (data.type === 'TRANSFER') {
        return !!data.toAccountId && data.toAccountId !== data.accountId;
    }
    return true;
}, {
    message: 'TRANSFER requires a valid toAccountId different from accountId',
    path: ['toAccountId'],
});
exports.UpdateTransactionSchema = zod_1.z.object({
    type: exports.TransactionType.optional(),
    amount: zod_1.z.number().positive().optional(),
    currency: exports.Currency.optional(),
    accountId: zod_1.z.string().cuid().optional(),
    toAccountId: zod_1.z.string().cuid().optional(),
    categoryId: zod_1.z.string().cuid().optional(),
    date: zod_1.z.string().datetime().optional(),
    description: zod_1.z.string().min(1).max(255).optional(),
    notes: zod_1.z.string().max(1000).optional(),
    tags: zod_1.z.array(zod_1.z.string().max(50)).max(10).optional(),
    isRecurring: zod_1.z.boolean().optional(),
    recurringRule: zod_1.z.string().max(100).optional(),
});
exports.TransactionQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    from: zod_1.z.string().datetime().optional(),
    to: zod_1.z.string().datetime().optional(),
    type: exports.TransactionType.optional(),
    categoryId: zod_1.z.string().cuid().optional(),
    accountId: zod_1.z.string().cuid().optional(),
    search: zod_1.z.string().max(100).optional(),
});
exports.TransactionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    accountId: zod_1.z.string(),
    toAccountId: zod_1.z.string().nullable(),
    categoryId: zod_1.z.string().nullable(),
    type: exports.TransactionType,
    amount: zod_1.z.number(),
    currency: exports.Currency,
    amountInBaseCurrency: zod_1.z.number(),
    exchangeRate: zod_1.z.number(),
    date: zod_1.z.string().datetime(),
    description: zod_1.z.string(),
    notes: zod_1.z.string().nullable(),
    tags: zod_1.z.array(zod_1.z.string()),
    attachments: zod_1.z.array(zod_1.z.string()),
    isRecurring: zod_1.z.boolean(),
    recurringRule: zod_1.z.string().nullable(),
    source: exports.TransactionSource,
    externalId: zod_1.z.string().nullable(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.PaginatedTransactionsSchema = zod_1.z.object({
    data: zod_1.z.array(exports.TransactionSchema),
    total: zod_1.z.number(),
    page: zod_1.z.number(),
    limit: zod_1.z.number(),
    totalPages: zod_1.z.number(),
});
exports.CreateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    icon: zod_1.z.string().max(50).optional(),
    color: zod_1.z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(),
    type: exports.CategoryType,
    parentId: zod_1.z.string().cuid().optional(),
});
exports.UpdateCategorySchema = exports.CreateCategorySchema.partial();
exports.CategorySchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    name: zod_1.z.string(),
    icon: zod_1.z.string().nullable(),
    color: zod_1.z.string().nullable(),
    type: exports.CategoryType,
    parentId: zod_1.z.string().nullable(),
    updatedAt: zod_1.z.string().datetime(),
    children: zod_1.z.array(zod_1.z.lazy(() => exports.CategorySchema)).optional(),
});
exports.CreateBudgetSchema = zod_1.z.object({
    categoryId: zod_1.z.string().cuid(),
    amount: zod_1.z.number().positive(),
    period: exports.BudgetPeriod,
    startDate: zod_1.z.string().datetime(),
    alertAt: zod_1.z.number().int().min(1).max(100).default(80),
});
exports.UpdateBudgetSchema = exports.CreateBudgetSchema.partial();
exports.BudgetStatusSchema = zod_1.z.object({
    budgetId: zod_1.z.string(),
    categoryId: zod_1.z.string(),
    categoryName: zod_1.z.string(),
    categoryIcon: zod_1.z.string().nullable(),
    categoryColor: zod_1.z.string().nullable(),
    amount: zod_1.z.number(),
    spent: zod_1.z.number(),
    remaining: zod_1.z.number(),
    percentage: zod_1.z.number(),
    alertAt: zod_1.z.number(),
    period: exports.BudgetPeriod,
    isOverBudget: zod_1.z.boolean(),
    isAlertTriggered: zod_1.z.boolean(),
});
exports.DashboardSummarySchema = zod_1.z.object({
    totalBalanceInBaseCurrency: zod_1.z.number(),
    monthlyIncome: zod_1.z.number(),
    monthlyExpenses: zod_1.z.number(),
    monthlySavings: zod_1.z.number(),
    savingsRate: zod_1.z.number(),
    baseCurrency: exports.Currency,
    accountBalances: zod_1.z.array(zod_1.z.object({
        accountId: zod_1.z.string(),
        accountName: zod_1.z.string(),
        accountType: exports.AccountType,
        currency: exports.Currency,
        balance: zod_1.z.number(),
        balanceInBaseCurrency: zod_1.z.number(),
        color: zod_1.z.string().nullable(),
    })),
});
exports.MonthlyChartDataSchema = zod_1.z.object({
    month: zod_1.z.string(),
    income: zod_1.z.number(),
    expenses: zod_1.z.number(),
    savings: zod_1.z.number(),
});
exports.CategoryChartDataSchema = zod_1.z.object({
    categoryId: zod_1.z.string(),
    categoryName: zod_1.z.string(),
    color: zod_1.z.string().nullable(),
    amount: zod_1.z.number(),
    percentage: zod_1.z.number(),
    transactionCount: zod_1.z.number(),
});
exports.UpdateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    baseCurrency: exports.Currency.optional(),
    avatar: zod_1.z.string().url().optional(),
});
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().nullable(),
    avatar: zod_1.z.string().nullable(),
    baseCurrency: exports.Currency,
    createdAt: zod_1.z.string().datetime(),
});
exports.ApiErrorSchema = zod_1.z.object({
    statusCode: zod_1.z.number(),
    message: zod_1.z.string().or(zod_1.z.array(zod_1.z.string())),
    error: zod_1.z.string().optional(),
});
//# sourceMappingURL=index.js.map