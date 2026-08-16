"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useFinance } from "@/lib/context/finance-context"
import { Account, CurrencyCode, UserProfile, WeeklyBudgetSettings } from "@/lib/types"
import { ALL_CURRENCIES, CURRENCY_CONFIGS, convertCurrency, formatCurrency } from "@/lib/currencies"
import {
  Sparkles,
  User,
  Wallet,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Star,
  ShieldCheck,
  Zap,
  Building,
  Smartphone,
  Banknote,
  PiggyBank,
  TrendingUp,
  AlertTriangle,
  Mail,
  AtSign,
  DollarSign,
  Layers,
  Coins,
  Check,
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

const AVATAR_PRESETS = [
  "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png",
  "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-02-albo9B0tWOSLXCVZh9rX9KFxXIVWMr.png",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
]

const ACCOUNT_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#f97316", // orange
  "#71717a", // zinc
]

const ACCOUNT_PRESETS = [
  { name: "CIB Smart Current", type: "bank" as const, currency: "EGP" as CurrencyCode, initialBalance: 35000, color: "#10b981" },
  { name: "Vodafone Cash & InstaPay", type: "wallet" as const, currency: "EGP" as CurrencyCode, initialBalance: 8500, color: "#f59e0b" },
  { name: "Physical Cash Vault", type: "cash" as const, currency: "EGP" as CurrencyCode, initialBalance: 4000, color: "#71717a" },
  { name: "HSBC Global USD", type: "bank" as const, currency: "USD" as CurrencyCode, initialBalance: 2500, color: "#3b82f6" },
  { name: "Emirates NBD Savings", type: "savings" as const, currency: "AED" as CurrencyCode, initialBalance: 6000, color: "#8b5cf6" },
  { name: "Wise Multi-Currency EUR", type: "wallet" as const, currency: "EUR" as CurrencyCode, initialBalance: 1200, color: "#06b6d4" },
]

export default function OnboardingWizard() {
  const router = useRouter()
  const { completeOnboarding, setBaseCurrency, setActiveTab, setSubView } = useFinance()

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Step 1: Personal Profile State
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0])
  const [fullName, setFullName] = useState("Mazen Al-Ghamdi")
  const [username, setUsername] = useState("mazen")
  const [email, setEmail] = useState("mazen@spendly.os")
  const [homeCurrency, setHomeCurrency] = useState<CurrencyCode>("EGP")
  const [monthlyIncome, setMonthlyIncome] = useState("65000")

  // Step 2: Wallets & Accounts State
  const [accountsList, setAccountsList] = useState<Account[]>([
    {
      id: "acc_init_1",
      name: "CIB Smart Current",
      type: "bank",
      currency: "EGP",
      initialBalance: 35000,
      color: "#10b981",
      isDefault: true,
      isHidden: false,
      order: 0,
    },
    {
      id: "acc_init_2",
      name: "Vodafone Cash & InstaPay",
      type: "wallet",
      currency: "EGP",
      initialBalance: 8500,
      color: "#f59e0b",
      isDefault: false,
      isHidden: false,
      order: 1,
    },
  ])

  // Custom Account Form
  const [newAccName, setNewAccName] = useState("")
  const [newAccType, setNewAccType] = useState<Account["type"]>("bank")
  const [newAccCurrency, setNewAccCurrency] = useState<CurrencyCode>("EGP")
  const [newAccBalance, setNewAccBalance] = useState("")
  const [newAccColor, setNewAccColor] = useState(ACCOUNT_COLORS[0])
  const [showAddCustom, setShowAddCustom] = useState(false)

  // Step 3: Financial Rules State
  const [instaPayAutoCalc, setInstaPayAutoCalc] = useState(true)
  const [weeklyBudgetCeiling, setWeeklyBudgetCeiling] = useState("5000")
  const [resetMode, setResetMode] = useState<WeeklyBudgetSettings["resetMode"]>("rolling_7_days")
  const [alertThreshold, setAlertThreshold] = useState(80)

  // Validation
  const validateStep1 = () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name")
      return false
    }
    if (!username.trim()) {
      toast.error("Please choose a username handle")
      return false
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address")
      return false
    }
    const incomeNum = parseFloat(monthlyIncome) || 0
    if (incomeNum <= 0) {
      toast.error("Please enter your estimated monthly income")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (accountsList.length === 0) {
      toast.error("Please create at least one account / wallet")
      return false
    }
    return true
  }

  const validateStep3 = () => {
    const weeklyNum = parseFloat(weeklyBudgetCeiling) || 0
    if (weeklyNum <= 0) {
      toast.error("Please enter a weekly budget amount greater than 0")
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step === 3 && !validateStep3()) return
    setStep((prev) => Math.min(4, prev + 1) as any)
  }

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1) as any)
  }

  // Account List Handlers
  const handleAddPresetAccount = (preset: (typeof ACCOUNT_PRESETS)[0]) => {
    const isFirst = accountsList.length === 0
    const newAcc: Account = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: preset.name,
      type: preset.type,
      currency: preset.currency,
      initialBalance: preset.initialBalance,
      color: preset.color,
      isDefault: isFirst,
      isHidden: false,
      order: accountsList.length,
    }
    setAccountsList((prev) => [...prev, newAcc])
    toast.success(`Added ${preset.name}`)
  }

  const handleAddCustomAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAccName.trim()) {
      toast.error("Please enter an account name")
      return
    }
    const bal = parseFloat(newAccBalance) || 0
    const isFirst = accountsList.length === 0

    const newAcc: Account = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: newAccName,
      type: newAccType,
      currency: newAccCurrency,
      initialBalance: bal,
      color: newAccColor,
      isDefault: isFirst,
      isHidden: false,
      order: accountsList.length,
    }
    setAccountsList((prev) => [...prev, newAcc])
    toast.success(`Added account: ${newAccName}`)
    setNewAccName("")
    setNewAccBalance("")
    setShowAddCustom(false)
  }

  const handleRemoveAccount = (id: string) => {
    if (accountsList.length <= 1) {
      toast.error("You must retain at least one account")
      return
    }
    const filtered = accountsList.filter((a) => a.id !== id)
    if (accountsList.find((a) => a.id === id)?.isDefault && filtered.length > 0) {
      filtered[0].isDefault = true
    }
    setAccountsList(filtered)
  }

  const handleSetDefaultAccount = (id: string) => {
    setAccountsList((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    )
    toast.info("Updated default primary account")
  }

  // Calculate Starting Net Worth in chosen Home Currency
  const totalStartingNetWorth = accountsList.reduce((sum, a) => {
    return sum + convertCurrency(a.initialBalance, a.currency, homeCurrency)
  }, 0)

  // Step 4 Finish & Launch Dashboard
  const handleCompleteSetup = () => {
    const profile: UserProfile = {
      fullName,
      username,
      email,
      avatar,
      monthlyIncome: parseFloat(monthlyIncome) || 0,
      baseCurrency: homeCurrency,
      instaPayAutoCalcDefault: instaPayAutoCalc,
      isConfigured: true,
    }

    const budgetSettings: WeeklyBudgetSettings = {
      enabled: true,
      amount: parseFloat(weeklyBudgetCeiling) || 5000,
      currency: homeCurrency,
      resetMode,
      scopedAccountIds: accountsList.map((a) => a.id),
      alertThreshold,
    }

    completeOnboarding({
      profile,
      accounts: accountsList,
      budget: budgetSettings,
      baseCurrency: homeCurrency,
    })

    setBaseCurrency(homeCurrency)
    setActiveTab("home")
    setSubView(null)

    toast.success(`Welcome to Spendly OS, ${fullName}! Your financial ledger is initialized.`)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[140px]" />

      <div className="w-full max-w-3xl z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl shadow-lg mb-1">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5">
              <div className="w-full h-full bg-zinc-950 rounded-[6px] flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              </div>
            </div>
            <span className="text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Spendly OS Setup Wizard
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Initialize Your Financial Operating System
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            Set up your profile, connect initial multi-currency wallets, and configure your cashflow pacing rules.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
            <span className="flex items-center gap-2 text-white">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[11px] font-bold">
                {step}
              </span>
              <span>
                {step === 1 && "Step 1: Personal Profile & Identity"}
                {step === 2 && "Step 2: Wallets & Multi-Currency Accounts"}
                {step === 3 && "Step 3: Financial Rules & Budget Pacing"}
                {step === 4 && "Step 4: Executive Review & Launch"}
              </span>
            </span>
            <span className="font-mono text-zinc-500">{step} of 4 ({step * 25}%)</span>
          </div>

          {/* Stepper Dots & Progress Track */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                onClick={() => {
                  if (s < step) setStep(s as any)
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  s < step
                    ? "bg-emerald-500"
                    : s === step
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-sm shadow-emerald-500/50"
                    : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Main Card */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
          {/* ========================================================================= */}
          {/* STEP 1: PERSONAL PROFILE & IDENTITY */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-zinc-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  Personal Profile & Identity
                </h2>
                <p className="text-xs text-zinc-400">
                  Provide your identity details and choose your primary base currency.
                </p>
              </div>

              {/* Avatar Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">Select Profile Avatar</label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {AVATAR_PRESETS.map((av, idx) => (
                    <div
                      key={idx}
                      onClick={() => setAvatar(av)}
                      className={`relative rounded-full cursor-pointer transition-all ${
                        avatar === av
                          ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-950 scale-110"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={av}
                        alt="Avatar Option"
                        width={46}
                        height={46}
                        className="rounded-full object-cover w-11 h-11"
                      />
                      {avatar === av && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-zinc-950 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Mazen Al-Ghamdi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                {/* Username Handle */}
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                    Username Handle
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. mazen"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="e.g. mazen@spendly.os"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                {/* Monthly Income / Target Budget */}
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                    Target Monthly Inflow ({homeCurrency})
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 65000"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-white font-mono focus:outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Home Base Currency Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Preferred Home Base Currency (for Net Worth Aggregation)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ALL_CURRENCIES.map((curr) => {
                    const conf = CURRENCY_CONFIGS[curr]
                    const isSelected = homeCurrency === curr
                    return (
                      <div
                        key={curr}
                        onClick={() => {
                          setHomeCurrency(curr)
                          setBaseCurrency(curr)
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                          isSelected
                            ? "bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 text-white shadow-lg"
                            : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400"
                        }`}
                      >
                        <span className="text-xl mb-0.5">{conf.flag}</span>
                        <span className="text-xs font-bold text-zinc-200">{conf.code}</span>
                        <span className="text-[10px] text-zinc-500 truncate max-w-full">{conf.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: WALLETS & ACCOUNTS SETUP */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-cyan-400" />
                    Wallets & Multi-Currency Accounts
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Add your banks, digital wallets, cash, and select your primary default account.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddCustom(!showAddCustom)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddCustom ? "Close Custom" : "+ Custom Account"}</span>
                </button>
              </div>

              {/* 1-Tap Preset Quick Adders */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Quick Add Recommended Templates:
                </span>
                <div className="flex flex-wrap gap-2">
                  {ACCOUNT_PRESETS.map((preset) => {
                    const alreadyAdded = accountsList.some((a) => a.name === preset.name)
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => handleAddPresetAccount(preset)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                          alreadyAdded
                            ? "bg-zinc-900/30 border-zinc-800/40 text-zinc-600 cursor-not-allowed"
                            : "bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.color }} />
                        <span>{preset.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">({preset.currency})</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Custom Add Account Form */}
              {showAddCustom && (
                <form
                  onSubmit={handleAddCustomAccount}
                  className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3"
                >
                  <span className="text-xs font-bold text-white block">Add Custom Wallet / Bank</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Account Name (e.g. QNB Savings)"
                      value={newAccName}
                      onChange={(e) => setNewAccName(e.target.value)}
                      className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                    />

                    <select
                      value={newAccType}
                      onChange={(e) => setNewAccType(e.target.value as any)}
                      className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                    >
                      <option value="bank">Bank Account</option>
                      <option value="wallet">Digital Wallet / InstaPay</option>
                      <option value="cash">Cash Vault</option>
                      <option value="savings">High-Yield Savings</option>
                      <option value="crypto">Crypto Wallet</option>
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newAccCurrency}
                        onChange={(e) => setNewAccCurrency(e.target.value as CurrencyCode)}
                        className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
                      >
                        <option value="EGP">EGP</option>
                        <option value="USD">USD</option>
                        <option value="AED">AED</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>

                      <input
                        type="number"
                        placeholder="Balance"
                        value={newAccBalance}
                        onChange={(e) => setNewAccBalance(e.target.value)}
                        className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-zinc-400">Color:</span>
                      {ACCOUNT_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewAccColor(c)}
                          className={`w-4 h-4 rounded-full ${
                            newAccColor === c ? "ring-2 ring-white scale-110" : "opacity-70"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Save Account
                    </button>
                  </div>
                </form>
              )}

              {/* Initialized Accounts List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-300 block">
                  Configured Wallets ({accountsList.length})
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {accountsList.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.color }} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{acc.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                              {acc.currency}
                            </span>
                            <span className="text-[10px] text-zinc-500 capitalize">• {acc.type}</span>
                          </div>
                          <p className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">
                            Starting: {formatCurrency(acc.initialBalance, acc.currency)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAccount(acc.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all ${
                            acc.isDefault
                              ? "bg-amber-950/60 text-amber-300 border-amber-700/60"
                              : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-amber-400"
                          }`}
                        >
                          <Star className="w-3 h-3" />
                          <span>{acc.isDefault ? "Primary Default" : "Set Default"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveAccount(acc.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Remove Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: FINANCIAL RULES & PREFERENCES */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-zinc-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  Financial Rules & Budget Pacing
                </h2>
                <p className="text-xs text-zinc-400">
                  Configure Egypt InstaPay fees, weekly burn-down pacing, and alert safety thresholds.
                </p>
              </div>

              {/* Egypt InstaPay Toggle */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Egypt InstaPay Auto-Calculation</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                      Standard Tariff
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Automatically compute official 0.1% fees (min 1.50 EGP, max 10.00 EGP) when logging transfers or peer expenses.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={instaPayAutoCalc}
                    onChange={(e) => setInstaPayAutoCalc(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              {/* Weekly Spending Limit & Reset Cycle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <label className="text-xs font-bold text-white block">
                    Weekly Spending Ceiling ({homeCurrency})
                  </label>
                  <p className="text-[11px] text-zinc-400">
                    Maximum weekly cash burn target (Suggested: ~25% of monthly income).
                  </p>
                  <input
                    type="number"
                    step="any"
                    value={weeklyBudgetCeiling}
                    onChange={(e) => setWeeklyBudgetCeiling(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-sm font-bold text-white font-mono focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <label className="text-xs font-bold text-white block">Budget Reset Cycle Mode</label>
                  <p className="text-[11px] text-zinc-400">
                    Choose when your weekly burn pool resets.
                  </p>
                  <select
                    value={resetMode}
                    onChange={(e) => setResetMode(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-200 focus:outline-none"
                  >
                    <option value="rolling_7_days">Rolling 7-Day Window (Continuous)</option>
                    <option value="fixed_sunday">Fixed Sunday Reset</option>
                    <option value="fixed_monday">Fixed Monday Reset</option>
                  </select>
                </div>
              </div>

              {/* Alert Warning Threshold Slider */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Alert Warning Threshold</span>
                    <span className="text-[11px] text-zinc-400">
                      Warn me when weekly spend reaches this percentage of budget
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-amber-400 font-mono font-bold text-xs">
                    {alertThreshold}% Trigger
                  </span>
                </div>

                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />

                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>Conservative (50%)</span>
                  <span>Balanced (75%-80%)</span>
                  <span>Strict / Late (90%)</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: SUMMARY & ACCOUNT CREATION */}
          {/* ========================================================================= */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-zinc-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Executive Review & Final Confirmation
                </h2>
                <p className="text-xs text-zinc-400">
                  Review your configured profile, wallets, and initial net worth before launching.
                </p>
              </div>

              {/* User Identity Card */}
              <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <Image
                    src={avatar}
                    alt={fullName}
                    width={48}
                    height={48}
                    className="rounded-full ring-2 ring-emerald-500/80 object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{fullName}</h3>
                    <p className="text-xs text-zinc-400">@{username} • {email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Base Currency</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {CURRENCY_CONFIGS[homeCurrency].flag} {homeCurrency}
                  </span>
                </div>
              </div>

              {/* Big KPI Starting Net Worth Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-zinc-900/90 to-cyan-950/30 border border-emerald-800/40 space-y-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                  Calculated Starting Global Net Worth ({homeCurrency})
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  {formatCurrency(totalStartingNetWorth, homeCurrency)}
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Aggregated across {accountsList.length} initialized wallets converted in real-time.
                </p>
              </div>

              {/* Accounts Summary Grid */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-300 block">
                  Initialized Accounts & Starting Balances
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {accountsList.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: acc.color }} />
                        <div>
                          <p className="text-xs font-semibold text-zinc-200">{acc.name}</p>
                          <span className="text-[10px] text-zinc-500 capitalize">{acc.type}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-white font-mono">
                          {formatCurrency(acc.initialBalance, acc.currency)}
                        </span>
                        {acc.isDefault && (
                          <span className="block text-[9px] font-bold text-emerald-400">Primary Default</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules Summary Matrix */}
              <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Weekly Ceiling</span>
                  <span className="font-mono font-bold text-zinc-200">
                    {formatCurrency(parseFloat(weeklyBudgetCeiling) || 0, homeCurrency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Reset Cycle</span>
                  <span className="font-semibold text-zinc-200 capitalize">
                    {resetMode.replace(/_/g, " ")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Warning Trigger</span>
                  <span className="font-mono font-bold text-amber-400">{alertThreshold}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
              >
                <span>Continue to Step {step + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteSetup}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 text-xs font-extrabold flex items-center gap-2 shadow-xl shadow-emerald-950/60 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-zinc-950" />
                <span>Complete Account Setup & Launch Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
