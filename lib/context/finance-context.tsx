"use client"

import React, { createContext, useContext, useEffect, useState, useMemo } from "react"
import {
  Account,
  ActiveTab,
  CategoryCap,
  CurrencyCode,
  CustodialEntry,
  PlannedPayment,
  SavingsTarget,
  ShortcutPreset,
  SubView,
  Transaction,
  UserProfile,
  WeeklyBudgetSettings,
} from "../types"
import { convertCurrency } from "../currencies"

const DEFAULT_USER_PROFILE: UserProfile = {
  fullName: "Mazen Al-Ghamdi",
  username: "mazen",
  email: "mazen@spendly.os",
  avatar: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png",
  monthlyIncome: 65000,
  baseCurrency: "EGP",
  instaPayAutoCalcDefault: true,
  isConfigured: true,
}

const INITIAL_ACCOUNTS: Account[] = [
  {
    id: "acc_1",
    name: "CIB Smart Current",
    type: "bank",
    currency: "EGP",
    initialBalance: 48500,
    color: "#10b981",
    isDefault: true,
    isHidden: false,
    order: 0,
  },
  {
    id: "acc_2",
    name: "InstaPay & Vodafone Cash",
    type: "wallet",
    currency: "EGP",
    initialBalance: 12350,
    color: "#f59e0b",
    isDefault: false,
    isHidden: false,
    order: 1,
  },
  {
    id: "acc_3",
    name: "HSBC Global USD",
    type: "bank",
    currency: "USD",
    initialBalance: 4200,
    color: "#3b82f6",
    isDefault: false,
    isHidden: false,
    order: 2,
  },
  {
    id: "acc_4",
    name: "Emirates NBD Savings",
    type: "savings",
    currency: "AED",
    initialBalance: 8500,
    color: "#8b5cf6",
    isDefault: false,
    isHidden: false,
    order: 3,
  },
  {
    id: "acc_5",
    name: "Wise Multi-Currency EUR",
    type: "wallet",
    currency: "EUR",
    initialBalance: 1850,
    color: "#06b6d4",
    isDefault: false,
    isHidden: false,
    order: 4,
  },
  {
    id: "acc_6",
    name: "Physical Cash Vault",
    type: "cash",
    currency: "EGP",
    initialBalance: 6500,
    color: "#71717a",
    isDefault: false,
    isHidden: false,
    order: 5,
  },
]

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_1",
    title: "Software Engineering Client Milestone",
    amount: 32000,
    currency: "EGP",
    type: "income",
    category: "freelance",
    accountId: "acc_1",
    date: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0],
    notes: "Q3 contract delivery payment",
    isInstaPay: true,
    instaPayFee: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "tx_2",
    title: "Gourmet Grocery & Organics",
    amount: 1450,
    currency: "EGP",
    type: "expense",
    category: "food",
    accountId: "acc_2",
    date: new Date().toISOString().split("T")[0],
    notes: "Weekly pantry essentials",
    isInstaPay: true,
    instaPayFee: 1.5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "tx_3",
    title: "Uber Executive Rides",
    amount: 320,
    currency: "EGP",
    type: "expense",
    category: "transport",
    accountId: "acc_2",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    notes: "Airport commute",
    createdAt: new Date().toISOString(),
  },
  {
    id: "tx_4",
    title: "OpenAI & Anthropic API Invoices",
    amount: 140,
    currency: "USD",
    type: "expense",
    category: "utilities",
    accountId: "acc_3",
    date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
    notes: "Monthly AI agent usage",
    createdAt: new Date().toISOString(),
  },
  {
    id: "tx_5",
    title: "Apartment Maintenance & Utilities",
    amount: 2800,
    currency: "EGP",
    type: "expense",
    category: "housing",
    accountId: "acc_1",
    date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
    notes: "Compound security and water bill",
    createdAt: new Date().toISOString(),
  },
  {
    id: "tx_6",
    title: "Gym & Fitness Personal Training",
    amount: 1600,
    currency: "EGP",
    type: "expense",
    category: "healthcare",
    accountId: "acc_1",
    date: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
    notes: "Monthly session package",
    createdAt: new Date().toISOString(),
  },
  {
    id: "tx_7",
    title: "International Consulting Retainer",
    amount: 1200,
    currency: "USD",
    type: "income",
    category: "salary",
    accountId: "acc_3",
    date: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
    notes: "London advisory client",
    createdAt: new Date().toISOString(),
  },
  {
    id: "tx_8",
    title: "Weekend Dining & Social",
    amount: 950,
    currency: "EGP",
    type: "expense",
    category: "entertainment",
    accountId: "acc_2",
    date: new Date(Date.now() - 12 * 86400000).toISOString().split("T")[0],
    notes: "Dinner with team",
    isInstaPay: true,
    instaPayFee: 1.5,
    createdAt: new Date().toISOString(),
  },
]

const INITIAL_CUSTODIAL: CustodialEntry[] = [
  {
    id: "cust_1",
    name: "Ahmed (Freelance Escrow Hold)",
    type: "hold_fund",
    direction: "held_provision",
    amount: 7500,
    currency: "EGP",
    accountId: "acc_1",
    description: "Design milestone held until final client signoff",
    dueDate: "2026-09-01",
    history: [
      {
        id: "h1",
        date: "2026-08-01",
        action: "created",
        amount: 7500,
        note: "Initial escrow deposit locked",
      },
    ],
  },
  {
    id: "cust_2",
    name: "Omar Farooq (Shared Project Advance)",
    type: "person",
    direction: "they_owe_me",
    amount: 3200,
    currency: "EGP",
    accountId: "acc_2",
    description: "Covered hardware procurement for office",
    dueDate: "2026-08-25",
    history: [
      {
        id: "h2",
        date: "2026-08-10",
        action: "deposit",
        amount: 3200,
        note: "Transferred for graphics tablet",
      },
    ],
  },
  {
    id: "cust_3",
    name: "Apartment Security Deposit",
    type: "hold_fund",
    direction: "held_provision",
    amount: 15000,
    currency: "EGP",
    accountId: "acc_1",
    description: "Landlord refundable lease bond",
    dueDate: "2027-01-01",
    history: [
      {
        id: "h3",
        date: "2026-01-01",
        action: "created",
        amount: 15000,
        note: "Lease deposit withheld",
      },
    ],
  },
  {
    id: "cust_4",
    name: "Mona (Group Dinner Reimbursement)",
    type: "person",
    direction: "i_owe_them",
    amount: 480,
    currency: "EGP",
    accountId: "acc_2",
    description: "Owed for anniversary gathering bill split",
    dueDate: "2026-08-20",
    history: [
      {
        id: "h4",
        date: "2026-08-12",
        action: "created",
        amount: 480,
        note: "Pending InstaPay payback",
      },
    ],
  },
]

const INITIAL_PLANNED: PlannedPayment[] = [
  {
    id: "plan_1",
    title: "WE Ultra High-Speed VDSL",
    amount: 680,
    currency: "EGP",
    accountId: "acc_1",
    category: "utilities",
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    frequency: "monthly",
    isPaid: false,
    autoPay: true,
    reminderDays: 2,
  },
  {
    id: "plan_2",
    title: "ChatGPT Plus & GitHub Copilot",
    amount: 30,
    currency: "USD",
    accountId: "acc_3",
    category: "utilities",
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    frequency: "monthly",
    isPaid: false,
    autoPay: true,
    reminderDays: 3,
  },
  {
    id: "plan_3",
    title: "Property Compound Service Charge",
    amount: 4200,
    currency: "EGP",
    accountId: "acc_1",
    category: "housing",
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
    frequency: "monthly",
    isPaid: false,
    autoPay: false,
    reminderDays: 5,
  },
  {
    id: "plan_4",
    title: "Vercel Enterprise Pro Tier",
    amount: 40,
    currency: "USD",
    accountId: "acc_3",
    category: "utilities",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    frequency: "monthly",
    isPaid: false,
    autoPay: true,
  },
]

const INITIAL_SHORTCUTS: ShortcutPreset[] = [
  {
    id: "sc_1",
    label: "Espresso & Pastry",
    amount: 95,
    currency: "EGP",
    category: "food",
    accountId: "acc_2",
    type: "expense",
  },
  {
    id: "sc_2",
    label: "Uber Commute",
    amount: 75,
    currency: "EGP",
    category: "transport",
    accountId: "acc_2",
    type: "expense",
  },
  {
    id: "sc_3",
    label: "Supermarket Run",
    amount: 350,
    currency: "EGP",
    category: "food",
    accountId: "acc_1",
    type: "expense",
  },
  {
    id: "sc_4",
    label: "InstaPay Quick 500",
    amount: 500,
    currency: "EGP",
    category: "other",
    accountId: "acc_2",
    type: "expense",
  },
  {
    id: "sc_5",
    label: "Freelance Micro-Payout",
    amount: 4500,
    currency: "EGP",
    category: "freelance",
    accountId: "acc_1",
    type: "income",
  },
]

const INITIAL_BUDGET_SETTINGS: WeeklyBudgetSettings = {
  enabled: true,
  amount: 6000,
  currency: "EGP",
  resetMode: "rolling_7_days",
  scopedAccountIds: ["acc_1", "acc_2"],
  alertThreshold: 80,
}

const INITIAL_CAPS: CategoryCap[] = [
  { category: "food", monthlyCap: 7500, currency: "EGP" },
  { category: "transport", monthlyCap: 2500, currency: "EGP" },
  { category: "shopping", monthlyCap: 5000, currency: "EGP" },
  { category: "entertainment", monthlyCap: 3000, currency: "EGP" },
  { category: "utilities", monthlyCap: 4000, currency: "EGP" },
  { category: "healthcare", monthlyCap: 2500, currency: "EGP" },
]

const INITIAL_SAVINGS: SavingsTarget[] = [
  {
    id: "sav_1",
    title: "MacBook Pro M4 Max Setup",
    targetAmount: 140000,
    currentAmount: 96000,
    currency: "EGP",
    deadline: "2026-11-30",
    targetAccountId: "acc_1",
    category: "Tech Hardware",
  },
  {
    id: "sav_2",
    title: "Emergency 6-Month Cash Buffer",
    targetAmount: 200000,
    currentAmount: 145000,
    currency: "EGP",
    deadline: "2026-12-31",
    targetAccountId: "acc_1",
    category: "Security",
  },
  {
    id: "sav_3",
    title: "European Summer Vacation",
    targetAmount: 3500,
    currentAmount: 2200,
    currency: "EUR",
    deadline: "2027-06-15",
    targetAccountId: "acc_5",
    category: "Travel",
  },
]

interface FinanceContextType {
  // Navigation
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  subView: SubView
  setSubView: (view: SubView) => void

  // User Profile & Identity
  userProfile: UserProfile
  updateUserProfile: (profile: Partial<UserProfile>) => void
  completeOnboarding: (data: {
    profile: UserProfile
    accounts: Account[]
    budget: WeeklyBudgetSettings
    baseCurrency: CurrencyCode
  }) => void

  // Currencies & Base Preference
  baseCurrency: CurrencyCode
  setBaseCurrency: (c: CurrencyCode) => void

  // Accounts
  accounts: Account[]
  activeAccountId: string
  setActiveAccountId: (id: string) => void
  activeAccount: Account | undefined
  addAccount: (account: Omit<Account, "id" | "order">) => void
  updateAccount: (id: string, updates: Partial<Account>) => void
  deleteAccount: (id: string) => void
  reorderAccounts: (reordered: Account[]) => void
  setDefaultAccount: (id: string) => void
  toggleAccountVisibility: (id: string) => void

  // Balances calculations
  getAccountBalance: (accountId: string) => number
  getAccountAvailableBalance: (accountId: string) => {
    total: number
    custodialHeld: number
    unpaidPlanned: number
    available: number
  }
  totalConsolidatedNetWorth: number // in baseCurrency

  // Transactions
  transactions: Transaction[]
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void
  editTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  transferFunds: (params: {
    fromAccountId: string
    toAccountId: string
    amount: number
    targetAmount?: number
    fee?: number
    notes?: string
    date?: string
  }) => void

  // Custodial & Hold Funds
  custodialEntries: CustodialEntry[]
  addCustodialEntry: (entry: Omit<CustodialEntry, "id">) => void
  updateCustodialEntry: (id: string, updates: Partial<CustodialEntry>) => void
  deleteCustodialEntry: (id: string) => void
  settleCustodialEntry: (id: string, settleAmount?: number) => void
  depositToCustodial: (id: string, amount: number, note?: string) => void
  withdrawFromCustodial: (id: string, amount: number, note?: string) => void

  // Planned Payments
  plannedPayments: PlannedPayment[]
  addPlannedPayment: (plan: Omit<PlannedPayment, "id">) => void
  updatePlannedPayment: (id: string, updates: Partial<PlannedPayment>) => void
  deletePlannedPayment: (id: string) => void
  markPlannedPaymentPaid: (id: string) => void

  // Shortcuts
  shortcuts: ShortcutPreset[]
  addShortcut: (shortcut: Omit<ShortcutPreset, "id">) => void
  deleteShortcut: (id: string) => void

  // Budget & Controls
  weeklyBudget: WeeklyBudgetSettings
  updateWeeklyBudget: (settings: Partial<WeeklyBudgetSettings>) => void
  categoryCaps: CategoryCap[]
  updateCategoryCap: (category: string, monthlyCap: number, currency: CurrencyCode) => void

  // Savings Targets
  savingsTargets: SavingsTarget[]
  addSavingsTarget: (target: Omit<SavingsTarget, "id">) => void
  updateSavingsTarget: (id: string, updates: Partial<SavingsTarget>) => void
  deleteSavingsTarget: (id: string) => void
  contributeToSavings: (id: string, amount: number, fromAccountId: string) => void

  // Active Modals controller state
  activeModal: string | null
  modalProps: any
  openModal: (name: string, props?: any) => void
  closeModal: () => void

  // Reset to demo data
  resetToDemoData: () => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home")
  const [subView, setSubView] = useState<SubView>(null)
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>("EGP")
  const [activeAccountId, setActiveAccountId] = useState<string>("acc_1")

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE)

  // Core Data States
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS)
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [custodialEntries, setCustodialEntries] = useState<CustodialEntry[]>(INITIAL_CUSTODIAL)
  const [plannedPayments, setPlannedPayments] = useState<PlannedPayment[]>(INITIAL_PLANNED)
  const [shortcuts, setShortcuts] = useState<ShortcutPreset[]>(INITIAL_SHORTCUTS)
  const [weeklyBudget, setWeeklyBudget] = useState<WeeklyBudgetSettings>(INITIAL_BUDGET_SETTINGS)
  const [categoryCaps, setCategoryCaps] = useState<CategoryCap[]>(INITIAL_CAPS)
  const [savingsTargets, setSavingsTargets] = useState<SavingsTarget[]>(INITIAL_SAVINGS)

  // Modal State
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [modalProps, setModalProps] = useState<any>(null)

  // LocalStorage persistence
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("spendly_user_profile")
      if (savedProfile) setUserProfile(JSON.parse(savedProfile))

      const savedAccounts = localStorage.getItem("spendly_accounts")
      if (savedAccounts) setAccounts(JSON.parse(savedAccounts))

      const savedTx = localStorage.getItem("spendly_transactions")
      if (savedTx) setTransactions(JSON.parse(savedTx))

      const savedCust = localStorage.getItem("spendly_custodial")
      if (savedCust) setCustodialEntries(JSON.parse(savedCust))

      const savedPlan = localStorage.getItem("spendly_planned")
      if (savedPlan) setPlannedPayments(JSON.parse(savedPlan))

      const savedSc = localStorage.getItem("spendly_shortcuts")
      if (savedSc) setShortcuts(JSON.parse(savedSc))

      const savedBudget = localStorage.getItem("spendly_budget")
      if (savedBudget) setWeeklyBudget(JSON.parse(savedBudget))

      const savedCaps = localStorage.getItem("spendly_caps")
      if (savedCaps) setCategoryCaps(JSON.parse(savedCaps))

      const savedSavings = localStorage.getItem("spendly_savings")
      if (savedSavings) setSavingsTargets(JSON.parse(savedSavings))

      const savedBase = localStorage.getItem("spendly_base_curr") as CurrencyCode | null
      if (savedBase) setBaseCurrency(savedBase)
    } catch (e) {
      console.warn("Could not load from localStorage:", e)
    }
  }, [])

  // Auto save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("spendly_user_profile", JSON.stringify(userProfile))
      localStorage.setItem("spendly_accounts", JSON.stringify(accounts))
      localStorage.setItem("spendly_transactions", JSON.stringify(transactions))
      localStorage.setItem("spendly_custodial", JSON.stringify(custodialEntries))
      localStorage.setItem("spendly_planned", JSON.stringify(plannedPayments))
      localStorage.setItem("spendly_shortcuts", JSON.stringify(shortcuts))
      localStorage.setItem("spendly_budget", JSON.stringify(weeklyBudget))
      localStorage.setItem("spendly_caps", JSON.stringify(categoryCaps))
      localStorage.setItem("spendly_savings", JSON.stringify(savingsTargets))
      localStorage.setItem("spendly_base_curr", baseCurrency)
    } catch (e) {
      console.warn("Could not save to localStorage:", e)
    }
  }, [
    userProfile,
    accounts,
    transactions,
    custodialEntries,
    plannedPayments,
    shortcuts,
    weeklyBudget,
    categoryCaps,
    savingsTargets,
    baseCurrency,
  ])

  const activeAccount = useMemo(() => {
    return accounts.find((a) => a.id === activeAccountId) || accounts[0]
  }, [accounts, activeAccountId])

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profile }))
  }

  const completeOnboarding = ({
    profile,
    accounts: newAccounts,
    budget,
    baseCurrency: newBase,
  }: {
    profile: UserProfile
    accounts: Account[]
    budget: WeeklyBudgetSettings
    baseCurrency: CurrencyCode
  }) => {
    setUserProfile({ ...profile, isConfigured: true })
    setAccounts(newAccounts)
    if (newAccounts.length > 0) {
      const defaultAcc = newAccounts.find((a) => a.isDefault) || newAccounts[0]
      setActiveAccountId(defaultAcc.id)
    }
    setWeeklyBudget(budget)
    setBaseCurrency(newBase)

    try {
      localStorage.setItem("spendly_user_profile", JSON.stringify({ ...profile, isConfigured: true }))
      localStorage.setItem("spendly_accounts", JSON.stringify(newAccounts))
      localStorage.setItem("spendly_budget", JSON.stringify(budget))
      localStorage.setItem("spendly_base_curr", newBase)
    } catch (e) {
      console.warn(e)
    }
  }

  // Dynamic balance calculation
  const getAccountBalance = (accountId: string): number => {
    const acc = accounts.find((a) => a.id === accountId)
    if (!acc) return 0
    let balance = acc.initialBalance

    for (const tx of transactions) {
      if (tx.accountId === accountId) {
        if (tx.type === "income") {
          balance += tx.amount
        } else if (tx.type === "expense") {
          balance -= tx.amount + (tx.instaPayFee || 0)
        } else if (tx.type === "transfer") {
          // outgoing transfer
          balance -= tx.amount + (tx.instaPayFee || 0)
        }
      } else if (tx.toAccountId === accountId && tx.type === "transfer") {
        // incoming transfer
        balance += tx.amount
      }
    }
    return balance
  }

  // Available balance subtracting held/custodial & unpaid planned payments
  const getAccountAvailableBalance = (accountId: string) => {
    const total = getAccountBalance(accountId)
    const acc = accounts.find((a) => a.id === accountId)
    const accCurrency = acc?.currency || "EGP"

    // Held funds tied to this account or general
    const custodialHeld = custodialEntries
      .filter((c) => {
        if (c.accountId && c.accountId !== accountId) return false
        return c.direction === "held_provision" || c.direction === "i_owe_them"
      })
      .reduce((sum, c) => sum + convertCurrency(c.amount, c.currency, accCurrency), 0)

    // Unpaid planned payments for this account
    const unpaidPlanned = plannedPayments
      .filter((p) => !p.isPaid && p.accountId === accountId)
      .reduce((sum, p) => sum + convertCurrency(p.amount, p.currency, accCurrency), 0)

    const available = Math.max(0, total - custodialHeld - unpaidPlanned)

    return {
      total,
      custodialHeld,
      unpaidPlanned,
      available,
    }
  }

  // Consolidated Net Worth in baseCurrency
  const totalConsolidatedNetWorth = useMemo(() => {
    return accounts
      .filter((a) => !a.isHidden)
      .reduce((sum, acc) => {
        const bal = getAccountBalance(acc.id)
        return sum + convertCurrency(bal, acc.currency, baseCurrency)
      }, 0)
  }, [accounts, transactions, baseCurrency])

  // Actions
  const addTransaction = (tx: Omit<Transaction, "id" | "createdAt">) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    }
    setTransactions((prev) => [newTx, ...prev])
  }

  const editTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const transferFunds = ({
    fromAccountId,
    toAccountId,
    amount,
    targetAmount,
    fee = 0,
    notes = "Account Transfer",
    date = new Date().toISOString().split("T")[0],
  }: {
    fromAccountId: string
    toAccountId: string
    amount: number
    targetAmount?: number
    fee?: number
    notes?: string
    date?: string
  }) => {
    const fromAcc = accounts.find((a) => a.id === fromAccountId)
    const toAcc = accounts.find((a) => a.id === toAccountId)
    if (!fromAcc || !toAcc) return

    const actualTargetAmount =
      targetAmount !== undefined
        ? targetAmount
        : convertCurrency(amount, fromAcc.currency, toAcc.currency)

    const transferTx: Transaction = {
      id: `tx_trf_${Date.now()}`,
      title: `Transfer: ${fromAcc.name} ➔ ${toAcc.name}`,
      amount: amount,
      currency: fromAcc.currency,
      type: "transfer",
      category: "other",
      accountId: fromAccountId,
      toAccountId: toAccountId,
      date,
      notes: notes || `Transfer of ${amount} ${fromAcc.currency} to ${toAcc.name} (${actualTargetAmount} ${toAcc.currency})`,
      instaPayFee: fee,
      createdAt: new Date().toISOString(),
    }

    setTransactions((prev) => [transferTx, ...prev])
  }

  const addAccount = (acc: Omit<Account, "id" | "order">) => {
    const newAcc: Account = {
      ...acc,
      id: `acc_${Date.now()}`,
      order: accounts.length,
    }
    setAccounts((prev) => [...prev, newAcc])
  }

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    )
  }

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
    if (activeAccountId === id) {
      const remaining = accounts.filter((a) => a.id !== id)
      if (remaining.length > 0) setActiveAccountId(remaining[0].id)
    }
  }

  const reorderAccounts = (reordered: Account[]) => {
    const updated = reordered.map((item, index) => ({
      ...item,
      order: index,
    }))
    setAccounts(updated)
  }

  const setDefaultAccount = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    )
  }

  const toggleAccountVisibility = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isHidden: !a.isHidden } : a))
    )
  }

  // Custodial Operations
  const addCustodialEntry = (entry: Omit<CustodialEntry, "id">) => {
    const newEntry: CustodialEntry = {
      ...entry,
      id: `cust_${Date.now()}`,
      history: [
        {
          id: `h_${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          action: "created",
          amount: entry.amount,
          note: entry.description || "Created entity",
        },
      ],
    }
    setCustodialEntries((prev) => [newEntry, ...prev])
  }

  const updateCustodialEntry = (id: string, updates: Partial<CustodialEntry>) => {
    setCustodialEntries((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    )
  }

  const deleteCustodialEntry = (id: string) => {
    setCustodialEntries((prev) => prev.filter((c) => c.id !== id))
  }

  const settleCustodialEntry = (id: string, settleAmount?: number) => {
    setCustodialEntries((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item
          const amt = settleAmount !== undefined ? settleAmount : item.amount
          const remaining = Math.max(0, item.amount - amt)
          const newHist = [
            ...(item.history || []),
            {
              id: `h_${Date.now()}`,
              date: new Date().toISOString().split("T")[0],
              action: "settle" as const,
              amount: amt,
              note: `Settled ${amt} ${item.currency}`,
            },
          ]
          return {
            ...item,
            amount: remaining,
            history: newHist,
          }
        })
        .filter((item) => item.amount > 0) // remove if fully settled
    )
  }

  const depositToCustodial = (id: string, amount: number, note?: string) => {
    setCustodialEntries((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        return {
          ...item,
          amount: item.amount + amount,
          history: [
            ...(item.history || []),
            {
              id: `h_${Date.now()}`,
              date: new Date().toISOString().split("T")[0],
              action: "deposit",
              amount,
              note: note || "Added deposit funds",
            },
          ],
        }
      })
    )
  }

  const withdrawFromCustodial = (id: string, amount: number, note?: string) => {
    setCustodialEntries((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        return {
          ...item,
          amount: Math.max(0, item.amount - amount),
          history: [
            ...(item.history || []),
            {
              id: `h_${Date.now()}`,
              date: new Date().toISOString().split("T")[0],
              action: "withdraw",
              amount,
              note: note || "Withdrew funds",
            },
          ],
        }
      })
    )
  }

  // Planned Payments Operations
  const addPlannedPayment = (plan: Omit<PlannedPayment, "id">) => {
    const newPlan: PlannedPayment = {
      ...plan,
      id: `plan_${Date.now()}`,
    }
    setPlannedPayments((prev) => [...prev, newPlan])
  }

  const updatePlannedPayment = (id: string, updates: Partial<PlannedPayment>) => {
    setPlannedPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  const deletePlannedPayment = (id: string) => {
    setPlannedPayments((prev) => prev.filter((p) => p.id !== id))
  }

  const markPlannedPaymentPaid = (id: string) => {
    const plan = plannedPayments.find((p) => p.id === id)
    if (!plan) return

    // 1. Mark as paid
    setPlannedPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPaid: true } : p))
    )

    // 2. Automatically log as an expense in the ledger
    addTransaction({
      title: `Bill: ${plan.title}`,
      amount: plan.amount,
      currency: plan.currency,
      type: "expense",
      category: plan.category,
      accountId: plan.accountId,
      date: new Date().toISOString().split("T")[0],
      notes: `Executed planned payment (${plan.frequency})`,
    })
  }

  // Shortcuts Operations
  const addShortcut = (shortcut: Omit<ShortcutPreset, "id">) => {
    const newSc: ShortcutPreset = {
      ...shortcut,
      id: `sc_${Date.now()}`,
    }
    setShortcuts((prev) => [...prev, newSc])
  }

  const deleteShortcut = (id: string) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id))
  }

  // Budget & Controls
  const updateWeeklyBudget = (settings: Partial<WeeklyBudgetSettings>) => {
    setWeeklyBudget((prev) => ({ ...prev, ...settings }))
  }

  const updateCategoryCap = (category: string, monthlyCap: number, currency: CurrencyCode) => {
    setCategoryCaps((prev) => {
      const exists = prev.some((c) => c.category === category)
      if (exists) {
        return prev.map((c) =>
          c.category === category ? { ...c, monthlyCap, currency } : c
        )
      }
      return [...prev, { category, monthlyCap, currency }]
    })
  }

  // Savings Goals
  const addSavingsTarget = (target: Omit<SavingsTarget, "id">) => {
    const newTarget: SavingsTarget = {
      ...target,
      id: `sav_${Date.now()}`,
    }
    setSavingsTargets((prev) => [...prev, newTarget])
  }

  const updateSavingsTarget = (id: string, updates: Partial<SavingsTarget>) => {
    setSavingsTargets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const deleteSavingsTarget = (id: string) => {
    setSavingsTargets((prev) => prev.filter((s) => s.id !== id))
  }

  const contributeToSavings = (id: string, amount: number, fromAccountId: string) => {
    const target = savingsTargets.find((s) => s.id === id)
    const acc = accounts.find((a) => a.id === fromAccountId)
    if (!target || !acc) return

    // Convert contribution to target currency
    const inTargetCurr = convertCurrency(amount, acc.currency, target.currency)

    // Deduct from account as expense / savings allocation
    addTransaction({
      title: `Savings Allocation: ${target.title}`,
      amount: amount,
      currency: acc.currency,
      type: "expense",
      category: "investment",
      accountId: fromAccountId,
      date: new Date().toISOString().split("T")[0],
      notes: `Goal target funding (+${inTargetCurr} ${target.currency})`,
    })

    // Add to current target progress
    setSavingsTargets((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, currentAmount: s.currentAmount + inTargetCurr } : s
      )
    )
  }

  // Modal handlers
  const openModal = (name: string, props: any = null) => {
    setActiveModal(name)
    setModalProps(props)
  }

  const closeModal = () => {
    setActiveModal(null)
    setModalProps(null)
  }

  const resetToDemoData = () => {
    setUserProfile(DEFAULT_USER_PROFILE)
    setAccounts(INITIAL_ACCOUNTS)
    setTransactions(INITIAL_TRANSACTIONS)
    setCustodialEntries(INITIAL_CUSTODIAL)
    setPlannedPayments(INITIAL_PLANNED)
    setShortcuts(INITIAL_SHORTCUTS)
    setWeeklyBudget(INITIAL_BUDGET_SETTINGS)
    setCategoryCaps(INITIAL_CAPS)
    setSavingsTargets(INITIAL_SAVINGS)
    setBaseCurrency("EGP")
    setActiveAccountId("acc_1")
    try {
      localStorage.clear()
    } catch (e) {
      console.warn(e)
    }
  }

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        subView,
        setSubView,
        userProfile,
        updateUserProfile,
        completeOnboarding,
        baseCurrency,
        setBaseCurrency,
        accounts,
        activeAccountId,
        setActiveAccountId,
        activeAccount,
        addAccount,
        updateAccount,
        deleteAccount,
        reorderAccounts,
        setDefaultAccount,
        toggleAccountVisibility,
        getAccountBalance,
        getAccountAvailableBalance,
        totalConsolidatedNetWorth,
        transactions,
        addTransaction,
        editTransaction,
        deleteTransaction,
        transferFunds,
        custodialEntries,
        addCustodialEntry,
        updateCustodialEntry,
        deleteCustodialEntry,
        settleCustodialEntry,
        depositToCustodial,
        withdrawFromCustodial,
        plannedPayments,
        addPlannedPayment,
        updatePlannedPayment,
        deletePlannedPayment,
        markPlannedPaymentPaid,
        shortcuts,
        addShortcut,
        deleteShortcut,
        weeklyBudget,
        updateWeeklyBudget,
        categoryCaps,
        updateCategoryCap,
        savingsTargets,
        addSavingsTarget,
        updateSavingsTarget,
        deleteSavingsTarget,
        contributeToSavings,
        activeModal,
        modalProps,
        openModal,
        closeModal,
        resetToDemoData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
