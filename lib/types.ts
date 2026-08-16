export type CurrencyCode = "EGP" | "USD" | "AED" | "EUR" | "GBP"

export interface CurrencyConfig {
  code: CurrencyCode
  symbol: string
  name: string
  flag: string
  rateToUSD: number // 1 USD = rate units of this currency
}

export type TransactionType = "expense" | "income" | "transfer"

export interface AuthUser {
  id: string
  username: string
  email: string
  fullName: string
  avatar: string
  baseCurrency: CurrencyCode
  passwordHash: string
  createdAt: string
}

export interface UserSession {
  userId: string
  username: string
  email: string
  token: string
  loginAt: string
}

export interface UserFinancialData {
  accounts: Account[]
  transactions: Transaction[]
  custodialEntries: CustodialEntry[]
  plannedPayments: PlannedPayment[]
  shortcuts: ShortcutPreset[]
  weeklyBudget: WeeklyBudgetSettings
  categoryCaps: CategoryCap[]
  savingsTargets: SavingsTarget[]
  baseCurrency: CurrencyCode
  activeAccountId?: string
}

export interface UserProfile {
  fullName: string
  username: string
  email: string
  avatar: string
  monthlyIncome: number
  baseCurrency: CurrencyCode
  instaPayAutoCalcDefault: boolean
  isConfigured: boolean
}

export interface Transaction {
  id: string
  title: string
  amount: number
  currency: CurrencyCode
  type: TransactionType
  category: string
  accountId: string
  toAccountId?: string // for transfer
  date: string // ISO string YYYY-MM-DD
  notes?: string
  isInstaPay?: boolean
  instaPayFee?: number
  tags?: string[]
  createdAt: string
}

export interface Account {
  id: string
  name: string
  type: "bank" | "wallet" | "cash" | "crypto" | "savings"
  currency: CurrencyCode
  initialBalance: number
  color: string
  isDefault?: boolean
  isHidden?: boolean
  order: number
}

export type CustodialType = "person" | "hold_fund"
export type CustodialDirection = "they_owe_me" | "i_owe_them" | "held_provision"

export interface CustodialEntry {
  id: string
  name: string
  type: CustodialType
  direction: CustodialDirection
  amount: number
  currency: CurrencyCode
  accountId?: string
  description?: string
  dueDate?: string
  history?: {
    id: string
    date: string
    action: "deposit" | "withdraw" | "settle" | "created"
    amount: number
    note?: string
  }[]
}

export interface PlannedPayment {
  id: string
  title: string
  amount: number
  currency: CurrencyCode
  accountId: string
  category: string
  dueDate: string // YYYY-MM-DD
  frequency: "once" | "weekly" | "monthly" | "yearly"
  isPaid: boolean
  autoPay?: boolean
  reminderDays?: number
}

export interface ShortcutPreset {
  id: string
  label: string
  amount: number
  currency: CurrencyCode
  category: string
  accountId: string
  type: TransactionType
  iconName?: string
}

export interface WeeklyBudgetSettings {
  enabled: boolean
  amount: number
  currency: CurrencyCode
  resetMode: "fixed_sunday" | "fixed_monday" | "rolling_7_days"
  scopedAccountIds: string[]
  alertThreshold: number // 50 to 100 (%)
}

export interface CategoryCap {
  category: string
  monthlyCap: number
  currency: CurrencyCode
}

export interface SavingsTarget {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  currency: CurrencyCode
  deadline: string // YYYY-MM-DD
  targetAccountId?: string
  category?: string
}

export type ActiveTab = "home" | "analysis" | "control"
export type SubView = "calendar" | "planned_payments" | null
