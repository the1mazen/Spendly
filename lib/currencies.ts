import { CurrencyCode, CurrencyConfig } from "./types"

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  EGP: {
    code: "EGP",
    symbol: "EGP",
    name: "Egyptian Pound",
    flag: "🇪🇬",
    rateToUSD: 48.65, // 1 USD = 48.65 EGP
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    flag: "🇺🇸",
    rateToUSD: 1.0,
  },
  AED: {
    code: "AED",
    symbol: "AED",
    name: "UAE Dirham",
    flag: "🇦🇪",
    rateToUSD: 3.6725, // 1 USD = 3.6725 AED
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    flag: "🇪🇺",
    rateToUSD: 0.92, // 1 USD = 0.92 EUR
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    flag: "🇬🇧",
    rateToUSD: 0.79, // 1 USD = 0.79 GBP
  },
}

export const ALL_CURRENCIES: CurrencyCode[] = ["EGP", "USD", "AED", "EUR", "GBP"]

/**
 * Convert an amount from one currency to another using the USD pivot rate
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to || !amount) return amount || 0
  const fromRate = CURRENCY_CONFIGS[from]?.rateToUSD || 1.0
  const toRate = CURRENCY_CONFIGS[to]?.rateToUSD || 1.0
  
  // Convert from source currency to USD, then USD to target currency
  const inUSD = amount / fromRate
  const result = inUSD * toRate
  return Number(result.toFixed(2))
}

/**
 * Format currency with appropriate symbol and decimals
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "EGP",
  options?: { showSymbol?: boolean; compact?: boolean; hideDecimals?: boolean }
): string {
  const { showSymbol = true, compact = false, hideDecimals = false } = options || {}
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.EGP
  
  if (compact && Math.abs(amount) >= 1000) {
    const formatter = new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    })
    const formatted = formatter.format(amount)
    return showSymbol ? `${config.symbol} ${formatted}` : formatted
  }

  const fractionDigits = hideDecimals ? 0 : (currency === "EGP" ? 2 : 2)
  const numStr = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })

  const sign = amount < 0 ? "-" : ""
  if (showSymbol) {
    if (config.symbol === "$" || config.symbol === "€" || config.symbol === "£") {
      return `${sign}${config.symbol}${numStr}`
    }
    return `${sign}${config.symbol} ${numStr}`
  }

  return `${sign}${numStr}`
}

/**
 * Calculate Egypt InstaPay transfer fee:
 * Formula: 0.1% of transaction amount.
 * Minimum fee: 0.5 EGP.
 * Maximum fee: 20.0 EGP.
 * Formula logic: Math.min(Math.max(amount * 0.001, 0.5), 20)
 */
export function calculateInstaPayFee(amount: number, currency: CurrencyCode = "EGP"): number {
  if (amount <= 0) return 0
  const egpAmount = currency === "EGP" ? amount : convertCurrency(amount, currency, "EGP")
  
  const feeInEgp = Math.min(Math.max(egpAmount * 0.001, 0.5), 20)

  if (currency === "EGP") {
    return Number(feeInEgp.toFixed(2))
  }
  return Number(convertCurrency(feeInEgp, "EGP", currency).toFixed(2))
}

export const PRESET_CATEGORIES = [
  { id: "food", name: "Food & Dining", color: "#f59e0b", icon: "Utensils" },
  { id: "transport", name: "Transportation", color: "#3b82f6", icon: "Car" },
  { id: "housing", name: "Housing & Rent", color: "#8b5cf6", icon: "Home" },
  { id: "utilities", name: "Utilities & Bills", color: "#ec4899", icon: "Zap" },
  { id: "shopping", name: "Shopping", color: "#10b981", icon: "ShoppingBag" },
  { id: "entertainment", name: "Entertainment", color: "#6366f1", icon: "Film" },
  { id: "healthcare", name: "Health & Medical", color: "#ef4444", icon: "HeartPulse" },
  { id: "salary", name: "Salary & Wages", color: "#10b981", icon: "BadgePercent" },
  { id: "freelance", name: "Freelance / Consulting", color: "#06b6d4", icon: "Briefcase" },
  { id: "investment", name: "Investments & Dividends", color: "#a855f7", icon: "TrendingUp" },
  { id: "loan", name: "Loans & Repayments", color: "#f97316", icon: "Receipt" },
  { id: "other", name: "Other Expenses", color: "#71717a", icon: "MoreHorizontal" },
]
