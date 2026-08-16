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
  UserFinancialData,
  WeeklyBudgetSettings,
} from "../types"
import { convertCurrency } from "../currencies"
import { useAuth } from "../auth/auth-context"
import { encryptPayload, decryptPayload } from "../auth/crypto"

interface FinanceContextType {
  // Navigation
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  subView: SubView
  setSubView: (view: SubView) => void

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

  // Mock User Profile adapter for KokonutUI TopNav
  userProfile: {
    fullName: string
    username: string
    email: string
    avatar: string
    baseCurrency: CurrencyCode
  }
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState<ActiveTab>("home")
  const [subView, setSubView] = useState<SubView>(null)
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(user?.baseCurrency || "EGP")
  const [activeAccountId, setActiveAccountId] = useState<string>("")

  // Core Data States
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [custodialEntries, setCustodialEntries] = useState<CustodialEntry[]>([])
  const [plannedPayments, setPlannedPayments] = useState<PlannedPayment[]>([])
  const [shortcuts, setShortcuts] = useState<ShortcutPreset[]>([])
  const [weeklyBudget, setWeeklyBudget] = useState<WeeklyBudgetSettings>({
    enabled: true,
    amount: 5000,
    currency: "EGP",
    resetMode: "rolling_7_days",
    scopedAccountIds: [],
    alertThreshold: 80,
  })
  const [categoryCaps, setCategoryCaps] = useState<CategoryCap[]>([])
  const [savingsTargets, setSavingsTargets] = useState<SavingsTarget[]>([])

  // Modal State
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [modalProps, setModalProps] = useState<any>(null)

  // Load isolated user data whenever authenticated user changes
  useEffect(() => {
    if (!user) {
      // Clear data on logout
      setAccounts([])
      setTransactions([])
      setCustodialEntries([])
      setPlannedPayments([])
      setShortcuts([])
      setCategoryCaps([])
      setSavingsTargets([])
      setActiveAccountId("")
      return
    }

    try {
      const storageKey = `spendly_data_${user.id}`
      const userSecret = `${user.id}_${user.passwordHash.substring(0, 12)}`
      const rawEncrypted = localStorage.getItem(storageKey)

      if (rawEncrypted) {
        const decrypted = decryptPayload<UserFinancialData>(rawEncrypted, userSecret)
        if (decrypted) {
          setAccounts(decrypted.accounts || [])
          setTransactions(decrypted.transactions || [])
          setCustodialEntries(decrypted.custodialEntries || [])
          setPlannedPayments(decrypted.plannedPayments || [])
          setShortcuts(decrypted.shortcuts || [])
          if (decrypted.weeklyBudget) setWeeklyBudget(decrypted.weeklyBudget)
          if (decrypted.categoryCaps) setCategoryCaps(decrypted.categoryCaps)
          if (decrypted.savingsTargets) setSavingsTargets(decrypted.savingsTargets)
          if (decrypted.baseCurrency) setBaseCurrency(decrypted.baseCurrency)

          if (decrypted.accounts && decrypted.accounts.length > 0) {
            const defaultAcc = decrypted.accounts.find((a) => a.isDefault) || decrypted.accounts[0]
            setActiveAccountId(defaultAcc.id)
          }
        }
      }
    } catch (e) {
      console.error("Failed to load user financial data:", e)
    }
  }, [user])

  // Save isolated user data whenever state changes
  useEffect(() => {
    if (!user) return
    try {
      const storageKey = `spendly_data_${user.id}`
      const userSecret = `${user.id}_${user.passwordHash.substring(0, 12)}`

      const payload: UserFinancialData = {
        accounts,
        transactions,
        custodialEntries,
        plannedPayments,
        shortcuts,
        weeklyBudget,
        categoryCaps,
        savingsTargets,
        baseCurrency,
        activeAccountId,
      }

      const encrypted = encryptPayload(payload, userSecret)
      localStorage.setItem(storageKey, encrypted)
    } catch (e) {
      console.error("Failed to save isolated user data:", e)
    }
  }, [
    user,
    accounts,
    transactions,
    custodialEntries,
    plannedPayments,
    shortcuts,
    weeklyBudget,
    categoryCaps,
    savingsTargets,
    baseCurrency,
    activeAccountId,
  ])

  const activeAccount = useMemo(() => {
    return accounts.find((a) => a.id === activeAccountId) || accounts[0]
  }, [accounts, activeAccountId])

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
          balance -= tx.amount + (tx.instaPayFee || 0)
        }
      } else if (tx.toAccountId === accountId && tx.type === "transfer") {
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

    const custodialHeld = custodialEntries
      .filter((c) => {
        if (c.accountId && c.accountId !== accountId) return false
        return c.direction === "held_provision" || c.direction === "i_owe_them"
      })
      .reduce((sum, c) => sum + convertCurrency(c.amount, c.currency, accCurrency), 0)

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

  // Transactions Actions
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
      notes: notes || `Transfer of ${amount} ${fromAcc.currency} to ${toAcc.name}`,
      instaPayFee: fee,
      createdAt: new Date().toISOString(),
    }

    setTransactions((prev) => [transferTx, ...prev])
  }

  // Account Actions
  const addAccount = (acc: Omit<Account, "id" | "order">) => {
    const newAcc: Account = {
      ...acc,
      id: `acc_${Date.now()}`,
      order: accounts.length,
    }
    setAccounts((prev) => [...prev, newAcc])
    if (!activeAccountId) setActiveAccountId(newAcc.id)
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

  // Custodial Actions
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
        .filter((item) => item.amount > 0)
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

  // Planned Payments
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

    setPlannedPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPaid: true } : p))
    )

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

  // Shortcuts
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

  // Budget
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

  // Savings
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

    const inTargetCurr = convertCurrency(amount, acc.currency, target.currency)

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

    setSavingsTargets((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, currentAmount: s.currentAmount + inTargetCurr } : s
      )
    )
  }

  // Modals
  const openModal = (name: string, props: any = null) => {
    setActiveModal(name)
    setModalProps(props)
  }

  const closeModal = () => {
    setActiveModal(null)
    setModalProps(null)
  }

  const userProfile = {
    fullName: user?.fullName || "Spendly User",
    username: user?.username || "user",
    email: user?.email || "user@spendly.os",
    avatar:
      user?.avatar ||
      "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png",
    baseCurrency: user?.baseCurrency || baseCurrency,
  }

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        subView,
        setSubView,
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
        userProfile,
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
