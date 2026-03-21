import { z } from 'zod';
export declare const AccountType: z.ZodEnum<["BANK", "CASH", "INVESTMENT", "CRYPTO", "CREDIT_CARD"]>;
export type AccountType = z.infer<typeof AccountType>;
export declare const TransactionType: z.ZodEnum<["INCOME", "EXPENSE", "TRANSFER"]>;
export type TransactionType = z.infer<typeof TransactionType>;
export declare const TransactionSource: z.ZodEnum<["MANUAL", "CONNECTOR_BELVO", "CONNECTOR_WISE", "CONNECTOR_BINANCE", "CONNECTOR_STRIPE", "CONNECTOR_PAYPAL", "CONNECTOR_REVOLUT", "CONNECTOR_COINBASE"]>;
export type TransactionSource = z.infer<typeof TransactionSource>;
export declare const CategoryType: z.ZodEnum<["INCOME", "EXPENSE", "BOTH"]>;
export type CategoryType = z.infer<typeof CategoryType>;
export declare const BudgetPeriod: z.ZodEnum<["WEEKLY", "MONTHLY", "YEARLY"]>;
export type BudgetPeriod = z.infer<typeof BudgetPeriod>;
export declare const SUPPORTED_CURRENCIES: readonly ["COP", "USD", "EUR", "GBP", "BTC", "ETH"];
export declare const Currency: z.ZodEnum<["COP", "USD", "EUR", "GBP", "BTC", "ETH"]>;
export type Currency = z.infer<typeof Currency>;
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name?: string | undefined;
}, {
    email: string;
    password: string;
    name?: string | undefined;
}>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginDto = z.infer<typeof LoginSchema>;
export declare const TokenResponseSchema: z.ZodObject<{
    accessToken: z.ZodString;
    expiresIn: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    expiresIn: number;
    accessToken: string;
}, {
    expiresIn: number;
    accessToken: string;
}>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export declare const CreateAccountSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["BANK", "CASH", "INVESTMENT", "CRYPTO", "CREDIT_CARD"]>;
    currency: z.ZodEnum<["COP", "USD", "EUR", "GBP", "BTC", "ETH"]>;
    balance: z.ZodDefault<z.ZodNumber>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "BANK" | "CASH" | "INVESTMENT" | "CRYPTO" | "CREDIT_CARD";
    currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
    balance: number;
    color?: string | undefined;
    icon?: string | undefined;
}, {
    name: string;
    type: "BANK" | "CASH" | "INVESTMENT" | "CRYPTO" | "CREDIT_CARD";
    currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
    balance?: number | undefined;
    color?: string | undefined;
    icon?: string | undefined;
}>;
export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;
export declare const UpdateAccountSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["BANK", "CASH", "INVESTMENT", "CRYPTO", "CREDIT_CARD"]>>;
    currency: z.ZodOptional<z.ZodEnum<["COP", "USD", "EUR", "GBP", "BTC", "ETH"]>>;
    balance: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    icon: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    type?: "BANK" | "CASH" | "INVESTMENT" | "CRYPTO" | "CREDIT_CARD" | undefined;
    currency?: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH" | undefined;
    balance?: number | undefined;
    color?: string | undefined;
    icon?: string | undefined;
}, {
    name?: string | undefined;
    type?: "BANK" | "CASH" | "INVESTMENT" | "CRYPTO" | "CREDIT_CARD" | undefined;
    currency?: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH" | undefined;
    balance?: number | undefined;
    color?: string | undefined;
    icon?: string | undefined;
}>;
export type UpdateAccountDto = z.infer<typeof UpdateAccountSchema>;
export declare const AccountSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["BANK", "CASH", "INVESTMENT", "CRYPTO", "CREDIT_CARD"]>;
    currency: z.ZodEnum<["COP", "USD", "EUR", "GBP", "BTC", "ETH"]>;
    balance: z.ZodNumber;
    color: z.ZodNullable<z.ZodString>;
    icon: z.ZodNullable<z.ZodString>;
    isManual: z.ZodBoolean;
    connectorId: z.ZodNullable<z.ZodString>;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "BANK" | "CASH" | "INVESTMENT" | "CRYPTO" | "CREDIT_CARD";
    currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
    balance: number;
    color: string | null;
    icon: string | null;
    id: string;
    userId: string;
    isManual: boolean;
    connectorId: string | null;
    updatedAt: string;
}, {
    name: string;
    type: "BANK" | "CASH" | "INVESTMENT" | "CRYPTO" | "CREDIT_CARD";
    currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
    balance: number;
    color: string | null;
    icon: string | null;
    id: string;
    userId: string;
    isManual: boolean;
    connectorId: string | null;
    updatedAt: string;
}>;
export type Account = z.infer<typeof AccountSchema>;
export declare const CreateTransactionSchema: z.ZodEffects<z.ZodObject<{
    type: z.ZodEnum<["INCOME", "EXPENSE", "TRANSFER"]>;
    amount: z.ZodNumber;
    currency: z.ZodEnum<["COP", "USD", "EUR", "GBP", "BTC", "ETH"]>;
    accountId: z.ZodString;
    toAccountId: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
    description: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    isRecurring: z.ZodDefault<z.ZodBoolean>;
    recurringRule: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "EXPENSE" | "INCOME" | "TRANSFER";
    description: string;
    tags: string[];
    currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
    amount: number;
    accountId: string;
    date: string;
    isRecurring: boolean;
    toAccountId?: string | undefined;
    categoryId?: string | undefined;
    notes?: string | undefined;
    recurringRule?: string | undefined;
}, {
    type: "EXPENSE" | "INCOME" | "TRANSFER";
    description: string;
    currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
    amount: number;
    accountId: string;
    date: string;
    tags?: string[] | undefined;
    toAccountId?: string | undefined;
    categoryId?: string | undefined;
    notes?: string | undefined;
    isRecurring?: boolean | undefined;
    recurringRule?: string | undefined;
}>, {
    type: "EXPENSE" | "INCOME" | "TRANSFER";
    description: string;
    tags: string[];
    currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
    amount: number;
    accountId: string;
    date: string;
    isRecurring: boolean;
    toAccountId?: string | undefined;
    categoryId?: string | undefined;
    notes?: string | undefined;
    recurringRule?: string | undefined;
}, {
    type: "EXPENSE" | "INCOME" | "TRANSFER";
    description: string;
    currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
    amount: number;
    accountId: string;
    date: string;
    tags?: string[] | undefined;
    toAccountId?: string | undefined;
    categoryId?: string | undefined;
    notes?: string | undefined;
    isRecurring?: boolean | undefined;
    recurringRule?: string | undefined;
}>;
export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
export declare const UpdateTransactionSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["INCOME", "EXPENSE", "TRANSFER"]>>;
    amount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodEnum<["COP", "USD", "EUR", "GBP", "BTC", "ETH"]>>;
    accountId: z.ZodOptional<z.ZodString>;
    toAccountId: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isRecurring: z.ZodOptional<z.ZodBoolean>;
    recurringRule: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: "EXPENSE" | "INCOME" | "TRANSFER" | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    currency?: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH" | undefined;
    amount?: number | undefined;
    accountId?: string | undefined;
    toAccountId?: string | undefined;
    categoryId?: string | undefined;
    date?: string | undefined;
    notes?: string | undefined;
    isRecurring?: boolean | undefined;
    recurringRule?: string | undefined;
}, {
    type?: "EXPENSE" | "INCOME" | "TRANSFER" | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    currency?: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH" | undefined;
    amount?: number | undefined;
    accountId?: string | undefined;
    toAccountId?: string | undefined;
    categoryId?: string | undefined;
    date?: string | undefined;
    notes?: string | undefined;
    isRecurring?: boolean | undefined;
    recurringRule?: string | undefined;
}>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;
export declare const TransactionQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["INCOME", "EXPENSE", "TRANSFER"]>>;
    categoryId: z.ZodOptional<z.ZodString>;
    accountId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    type?: "EXPENSE" | "INCOME" | "TRANSFER" | undefined;
    accountId?: string | undefined;
    categoryId?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
    search?: string | undefined;
}, {
    type?: "EXPENSE" | "INCOME" | "TRANSFER" | undefined;
    accountId?: string | undefined;
    categoryId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    from?: string | undefined;
    to?: string | undefined;
    search?: string | undefined;
}>;
export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;
export declare const TransactionSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    accountId: z.ZodString;
    toAccountId: z.ZodNullable<z.ZodString>;
    categoryId: z.ZodNullable<z.ZodString>;
    type: z.ZodEnum<["INCOME", "EXPENSE", "TRANSFER"]>;
    amount: z.ZodNumber;
    currency: z.ZodEnum<["COP", "USD", "EUR", "GBP", "BTC", "ETH"]>;
    amountInBaseCurrency: z.ZodNumber;
    exchangeRate: z.ZodNumber;
    date: z.ZodString;
    description: z.ZodString;
    notes: z.ZodNullable<z.ZodString>;
    tags: z.ZodArray<z.ZodString, "many">;
    attachments: z.ZodArray<z.ZodString, "many">;
    isRecurring: z.ZodBoolean;
    recurringRule: z.ZodNullable<z.ZodString>;
    source: z.ZodEnum<["MANUAL", "CONNECTOR_BELVO", "CONNECTOR_WISE", "CONNECTOR_BINANCE", "CONNECTOR_STRIPE", "CONNECTOR_PAYPAL", "CONNECTOR_REVOLUT", "CONNECTOR_COINBASE"]>;
    externalId: z.ZodNullable<z.ZodString>;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "EXPENSE" | "INCOME" | "TRANSFER";
    description: string;
    tags: string[];
    currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
    id: string;
    userId: string;
    updatedAt: string;
    amount: number;
    accountId: string;
    toAccountId: string | null;
    categoryId: string | null;
    date: string;
    notes: string | null;
    isRecurring: boolean;
    recurringRule: string | null;
    amountInBaseCurrency: number;
    exchangeRate: number;
    attachments: string[];
    source: "MANUAL" | "CONNECTOR_BELVO" | "CONNECTOR_WISE" | "CONNECTOR_BINANCE" | "CONNECTOR_STRIPE" | "CONNECTOR_PAYPAL" | "CONNECTOR_REVOLUT" | "CONNECTOR_COINBASE";
    externalId: string | null;
}, {
    type: "EXPENSE" | "INCOME" | "TRANSFER";
    description: string;
    tags: string[];
    currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
    id: string;
    userId: string;
    updatedAt: string;
    amount: number;
    accountId: string;
    toAccountId: string | null;
    categoryId: string | null;
    date: string;
    notes: string | null;
    isRecurring: boolean;
    recurringRule: string | null;
    amountInBaseCurrency: number;
    exchangeRate: number;
    attachments: string[];
    source: "MANUAL" | "CONNECTOR_BELVO" | "CONNECTOR_WISE" | "CONNECTOR_BINANCE" | "CONNECTOR_STRIPE" | "CONNECTOR_PAYPAL" | "CONNECTOR_REVOLUT" | "CONNECTOR_COINBASE";
    externalId: string | null;
}>;
export type Transaction = z.infer<typeof TransactionSchema>;
export declare const PaginatedTransactionsSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        accountId: z.ZodString;
        toAccountId: z.ZodNullable<z.ZodString>;
        categoryId: z.ZodNullable<z.ZodString>;
        type: z.ZodEnum<["INCOME", "EXPENSE", "TRANSFER"]>;
        amount: z.ZodNumber;
        currency: z.ZodEnum<["COP", "USD", "EUR", "GBP", "BTC", "ETH"]>;
        amountInBaseCurrency: z.ZodNumber;
        exchangeRate: z.ZodNumber;
        date: z.ZodString;
        description: z.ZodString;
        notes: z.ZodNullable<z.ZodString>;
        tags: z.ZodArray<z.ZodString, "many">;
        attachments: z.ZodArray<z.ZodString, "many">;
        isRecurring: z.ZodBoolean;
        recurringRule: z.ZodNullable<z.ZodString>;
        source: z.ZodEnum<["MANUAL", "CONNECTOR_BELVO", "CONNECTOR_WISE", "CONNECTOR_BINANCE", "CONNECTOR_STRIPE", "CONNECTOR_PAYPAL", "CONNECTOR_REVOLUT", "CONNECTOR_COINBASE"]>;
        externalId: z.ZodNullable<z.ZodString>;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "EXPENSE" | "INCOME" | "TRANSFER";
        description: string;
        tags: string[];
        currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
        id: string;
        userId: string;
        updatedAt: string;
        amount: number;
        accountId: string;
        toAccountId: string | null;
        categoryId: string | null;
        date: string;
        notes: string | null;
        isRecurring: boolean;
        recurringRule: string | null;
        amountInBaseCurrency: number;
        exchangeRate: number;
        attachments: string[];
        source: "MANUAL" | "CONNECTOR_BELVO" | "CONNECTOR_WISE" | "CONNECTOR_BINANCE" | "CONNECTOR_STRIPE" | "CONNECTOR_PAYPAL" | "CONNECTOR_REVOLUT" | "CONNECTOR_COINBASE";
        externalId: string | null;
    }, {
        type: "EXPENSE" | "INCOME" | "TRANSFER";
        description: string;
        tags: string[];
        currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
        id: string;
        userId: string;
        updatedAt: string;
        amount: number;
        accountId: string;
        toAccountId: string | null;
        categoryId: string | null;
        date: string;
        notes: string | null;
        isRecurring: boolean;
        recurringRule: string | null;
        amountInBaseCurrency: number;
        exchangeRate: number;
        attachments: string[];
        source: "MANUAL" | "CONNECTOR_BELVO" | "CONNECTOR_WISE" | "CONNECTOR_BINANCE" | "CONNECTOR_STRIPE" | "CONNECTOR_PAYPAL" | "CONNECTOR_REVOLUT" | "CONNECTOR_COINBASE";
        externalId: string | null;
    }>, "many">;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
    totalPages: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    data: {
        type: "EXPENSE" | "INCOME" | "TRANSFER";
        description: string;
        tags: string[];
        currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
        id: string;
        userId: string;
        updatedAt: string;
        amount: number;
        accountId: string;
        toAccountId: string | null;
        categoryId: string | null;
        date: string;
        notes: string | null;
        isRecurring: boolean;
        recurringRule: string | null;
        amountInBaseCurrency: number;
        exchangeRate: number;
        attachments: string[];
        source: "MANUAL" | "CONNECTOR_BELVO" | "CONNECTOR_WISE" | "CONNECTOR_BINANCE" | "CONNECTOR_STRIPE" | "CONNECTOR_PAYPAL" | "CONNECTOR_REVOLUT" | "CONNECTOR_COINBASE";
        externalId: string | null;
    }[];
    total: number;
    totalPages: number;
}, {
    page: number;
    limit: number;
    data: {
        type: "EXPENSE" | "INCOME" | "TRANSFER";
        description: string;
        tags: string[];
        currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
        id: string;
        userId: string;
        updatedAt: string;
        amount: number;
        accountId: string;
        toAccountId: string | null;
        categoryId: string | null;
        date: string;
        notes: string | null;
        isRecurring: boolean;
        recurringRule: string | null;
        amountInBaseCurrency: number;
        exchangeRate: number;
        attachments: string[];
        source: "MANUAL" | "CONNECTOR_BELVO" | "CONNECTOR_WISE" | "CONNECTOR_BINANCE" | "CONNECTOR_STRIPE" | "CONNECTOR_PAYPAL" | "CONNECTOR_REVOLUT" | "CONNECTOR_COINBASE";
        externalId: string | null;
    }[];
    total: number;
    totalPages: number;
}>;
export type PaginatedTransactions = z.infer<typeof PaginatedTransactionsSchema>;
export declare const CreateCategorySchema: z.ZodObject<{
    name: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["INCOME", "EXPENSE", "BOTH"]>;
    parentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "EXPENSE" | "INCOME" | "BOTH";
    color?: string | undefined;
    icon?: string | undefined;
    parentId?: string | undefined;
}, {
    name: string;
    type: "EXPENSE" | "INCOME" | "BOTH";
    color?: string | undefined;
    icon?: string | undefined;
    parentId?: string | undefined;
}>;
export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export declare const UpdateCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodEnum<["INCOME", "EXPENSE", "BOTH"]>>;
    parentId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    type?: "EXPENSE" | "INCOME" | "BOTH" | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    parentId?: string | undefined;
}, {
    name?: string | undefined;
    type?: "EXPENSE" | "INCOME" | "BOTH" | undefined;
    color?: string | undefined;
    icon?: string | undefined;
    parentId?: string | undefined;
}>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
interface CategoryType_Shape {
    id: string;
    userId: string;
    name: string;
    icon: string | null;
    color: string | null;
    type: z.infer<typeof CategoryType>;
    parentId: string | null;
    updatedAt: string;
    children?: CategoryType_Shape[];
}
export type Category = CategoryType_Shape;
export declare const CategorySchema: z.ZodType<CategoryType_Shape>;
export declare const CreateBudgetSchema: z.ZodObject<{
    categoryId: z.ZodString;
    amount: z.ZodNumber;
    period: z.ZodEnum<["WEEKLY", "MONTHLY", "YEARLY"]>;
    startDate: z.ZodString;
    alertAt: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    categoryId: string;
    period: "WEEKLY" | "MONTHLY" | "YEARLY";
    startDate: string;
    alertAt: number;
}, {
    amount: number;
    categoryId: string;
    period: "WEEKLY" | "MONTHLY" | "YEARLY";
    startDate: string;
    alertAt?: number | undefined;
}>;
export type CreateBudgetDto = z.infer<typeof CreateBudgetSchema>;
export declare const UpdateBudgetSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    period: z.ZodOptional<z.ZodEnum<["WEEKLY", "MONTHLY", "YEARLY"]>>;
    startDate: z.ZodOptional<z.ZodString>;
    alertAt: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    amount?: number | undefined;
    categoryId?: string | undefined;
    period?: "WEEKLY" | "MONTHLY" | "YEARLY" | undefined;
    startDate?: string | undefined;
    alertAt?: number | undefined;
}, {
    amount?: number | undefined;
    categoryId?: string | undefined;
    period?: "WEEKLY" | "MONTHLY" | "YEARLY" | undefined;
    startDate?: string | undefined;
    alertAt?: number | undefined;
}>;
export type UpdateBudgetDto = z.infer<typeof UpdateBudgetSchema>;
export declare const BudgetStatusSchema: z.ZodObject<{
    budgetId: z.ZodString;
    categoryId: z.ZodString;
    categoryName: z.ZodString;
    categoryIcon: z.ZodNullable<z.ZodString>;
    categoryColor: z.ZodNullable<z.ZodString>;
    amount: z.ZodNumber;
    spent: z.ZodNumber;
    remaining: z.ZodNumber;
    percentage: z.ZodNumber;
    alertAt: z.ZodNumber;
    period: z.ZodEnum<["WEEKLY", "MONTHLY", "YEARLY"]>;
    isOverBudget: z.ZodBoolean;
    isAlertTriggered: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    amount: number;
    categoryId: string;
    period: "WEEKLY" | "MONTHLY" | "YEARLY";
    alertAt: number;
    budgetId: string;
    categoryName: string;
    categoryIcon: string | null;
    categoryColor: string | null;
    spent: number;
    remaining: number;
    percentage: number;
    isOverBudget: boolean;
    isAlertTriggered: boolean;
}, {
    amount: number;
    categoryId: string;
    period: "WEEKLY" | "MONTHLY" | "YEARLY";
    alertAt: number;
    budgetId: string;
    categoryName: string;
    categoryIcon: string | null;
    categoryColor: string | null;
    spent: number;
    remaining: number;
    percentage: number;
    isOverBudget: boolean;
    isAlertTriggered: boolean;
}>;
export type BudgetStatus = z.infer<typeof BudgetStatusSchema>;
export declare const DashboardSummarySchema: z.ZodObject<{
    totalBalanceInBaseCurrency: z.ZodNumber;
    monthlyIncome: z.ZodNumber;
    monthlyExpenses: z.ZodNumber;
    monthlySavings: z.ZodNumber;
    savingsRate: z.ZodNumber;
    baseCurrency: z.ZodEnum<["COP", "USD", "EUR", "GBP", "BTC", "ETH"]>;
    accountBalances: z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        accountName: z.ZodString;
        accountType: z.ZodEnum<["BANK", "CASH", "INVESTMENT", "CRYPTO", "CREDIT_CARD"]>;
        currency: z.ZodEnum<["COP", "USD", "EUR", "GBP", "BTC", "ETH"]>;
        balance: z.ZodNumber;
        balanceInBaseCurrency: z.ZodNumber;
        color: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
        balance: number;
        color: string | null;
        accountId: string;
        accountName: string;
        accountType: "BANK" | "CASH" | "INVESTMENT" | "CRYPTO" | "CREDIT_CARD";
        balanceInBaseCurrency: number;
    }, {
        currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
        balance: number;
        color: string | null;
        accountId: string;
        accountName: string;
        accountType: "BANK" | "CASH" | "INVESTMENT" | "CRYPTO" | "CREDIT_CARD";
        balanceInBaseCurrency: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    totalBalanceInBaseCurrency: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    savingsRate: number;
    baseCurrency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
    accountBalances: {
        currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
        balance: number;
        color: string | null;
        accountId: string;
        accountName: string;
        accountType: "BANK" | "CASH" | "INVESTMENT" | "CRYPTO" | "CREDIT_CARD";
        balanceInBaseCurrency: number;
    }[];
}, {
    totalBalanceInBaseCurrency: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    savingsRate: number;
    baseCurrency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
    accountBalances: {
        currency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
        balance: number;
        color: string | null;
        accountId: string;
        accountName: string;
        accountType: "BANK" | "CASH" | "INVESTMENT" | "CRYPTO" | "CREDIT_CARD";
        balanceInBaseCurrency: number;
    }[];
}>;
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;
export declare const MonthlyChartDataSchema: z.ZodObject<{
    month: z.ZodString;
    income: z.ZodNumber;
    expenses: z.ZodNumber;
    savings: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    month: string;
    income: number;
    expenses: number;
    savings: number;
}, {
    month: string;
    income: number;
    expenses: number;
    savings: number;
}>;
export type MonthlyChartData = z.infer<typeof MonthlyChartDataSchema>;
export declare const CategoryChartDataSchema: z.ZodObject<{
    categoryId: z.ZodString;
    categoryName: z.ZodString;
    color: z.ZodNullable<z.ZodString>;
    amount: z.ZodNumber;
    percentage: z.ZodNumber;
    transactionCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    color: string | null;
    amount: number;
    categoryId: string;
    categoryName: string;
    percentage: number;
    transactionCount: number;
}, {
    color: string | null;
    amount: number;
    categoryId: string;
    categoryName: string;
    percentage: number;
    transactionCount: number;
}>;
export type CategoryChartData = z.infer<typeof CategoryChartDataSchema>;
export declare const UpdateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    baseCurrency: z.ZodOptional<z.ZodEnum<["COP", "USD", "EUR", "GBP", "BTC", "ETH"]>>;
    avatar: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    baseCurrency?: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH" | undefined;
    avatar?: string | undefined;
}, {
    name?: string | undefined;
    baseCurrency?: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH" | undefined;
    avatar?: string | undefined;
}>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodNullable<z.ZodString>;
    avatar: z.ZodNullable<z.ZodString>;
    baseCurrency: z.ZodEnum<["COP", "USD", "EUR", "GBP", "BTC", "ETH"]>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string | null;
    email: string;
    id: string;
    baseCurrency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
    avatar: string | null;
    createdAt: string;
}, {
    name: string | null;
    email: string;
    id: string;
    baseCurrency: "COP" | "USD" | "EUR" | "GBP" | "BTC" | "ETH";
    avatar: string | null;
    createdAt: string;
}>;
export type User = z.infer<typeof UserSchema>;
export declare const ApiErrorSchema: z.ZodObject<{
    statusCode: z.ZodNumber;
    message: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string | string[];
    statusCode: number;
    error?: string | undefined;
}, {
    message: string | string[];
    statusCode: number;
    error?: string | undefined;
}>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export {};
//# sourceMappingURL=index.d.ts.map