"use client"

import React, { useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Account, CurrencyCode } from "@/lib/types"
import { ALL_CURRENCIES, CURRENCY_CONFIGS, convertCurrency, formatCurrency } from "@/lib/currencies"
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AtSign,
  Wallet,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Star,
  ShieldCheck,
  Building,
  Smartphone,
  Banknote,
  PiggyBank,
  Check,
  Coins,
  KeyRound,
  LogIn,
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
]

const ACCOUNT_PRESETS = [
  { name: "CIB Smart Current", type: "bank" as const, currency: "EGP" as CurrencyCode, initialBalance: 35000, color: "#10b981" },
  { name: "Vodafone Cash & InstaPay", type: "wallet" as const, currency: "EGP" as CurrencyCode, initialBalance: 8500, color: "#f59e0b" },
  { name: "Physical Cash Vault", type: "cash" as const, currency: "EGP" as CurrencyCode, initialBalance: 4000, color: "#71717a" },
  { name: "HSBC Global USD", type: "bank" as const, currency: "USD" as CurrencyCode, initialBalance: 2500, color: "#3b82f6" },
  { name: "Wise Multi-Currency EUR", type: "wallet" as const, currency: "EUR" as CurrencyCode, initialBalance: 1200, color: "#06b6d4" },
]

export default function AuthView() {
  const { register, login, isLoading } = useAuth()

  const [authMode, setAuthMode] = useState<"login" | "register">("register")

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Registration Wizard State (Steps 1 to 3)
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1)
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0])
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>("EGP")

  // Step 2: Accounts State (Mandatory at least 1 account)
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "acc_1",
      name: "Primary Bank Account",
      type: "bank",
      currency: "EGP",
      initialBalance: 10000,
      color: "#10b981",
      isDefault: true,
      isHidden: false,
      order: 0,
    },
  ])

  // Custom Account Adder Form State
  const [newAccName, setNewAccName] = useState("")
  const [newAccType, setNewAccType] = useState<Account["type"]>("bank")
  const [newAccCurrency, setNewAccCurrency] = useState<CurrencyCode>("EGP")
  const [newAccBalance, setNewAccBalance] = useState("")
  const [newAccColor, setNewAccColor] = useState(ACCOUNT_COLORS[0])
  const [showAddForm, setShowAddForm] = useState(false)

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginIdentifier.trim()) {
      toast.error("Please enter your Username or Gmail address")
      return
    }
    if (!loginPassword) {
      toast.error("Please enter your password")
      return
    }
    await login(loginIdentifier, loginPassword)
  }

  // Step 1 Validation
  const validateStep1 = () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name")
      return false
    }
    if (!username.trim() || username.length < 3) {
      toast.error("Username must be at least 3 characters")
      return false
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid Gmail / Email address")
      return false
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return false
    }
    return true
  }

  // Step 2 Validation
  const validateStep2 = () => {
    if (accounts.length === 0) {
      toast.error("You MUST initialize at least 1 account to proceed")
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (regStep === 1 && !validateStep1()) return
    if (regStep === 2 && !validateStep2()) return
    setRegStep((prev) => Math.min(3, prev + 1) as any)
  }

  const handlePrevStep = () => {
    setRegStep((prev) => Math.max(1, prev - 1) as any)
  }

  // Account Handlers
  const handleAddPreset = (preset: (typeof ACCOUNT_PRESETS)[0]) => {
    const isFirst = accounts.length === 0
    const newAcc: Account = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: preset.name,
      type: preset.type,
      currency: preset.currency,
      initialBalance: preset.initialBalance,
      color: preset.color,
      isDefault: isFirst,
      isHidden: false,
      order: accounts.length,
    }
    setAccounts((prev) => [...prev, newAcc])
    toast.success(`Added ${preset.name}`)
  }

  const handleAddCustomAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAccName.trim()) {
      toast.error("Please enter an account name")
      return
    }
    const bal = parseFloat(newAccBalance) || 0
    const isFirst = accounts.length === 0

    const newAcc: Account = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: newAccName,
      type: newAccType,
      currency: newAccCurrency,
      initialBalance: bal,
      color: newAccColor,
      isDefault: isFirst,
      isHidden: false,
      order: accounts.length,
    }
    setAccounts((prev) => [...prev, newAcc])
    toast.success(`Added account: ${newAccName}`)
    setNewAccName("")
    setNewAccBalance("")
    setShowAddForm(false)
  }

  const handleRemoveAccount = (id: string) => {
    if (accounts.length <= 1) {
      toast.error("You must retain at least one initialized account")
      return
    }
    const filtered = accounts.filter((a) => a.id !== id)
    if (accounts.find((a) => a.id === id)?.isDefault && filtered.length > 0) {
      filtered[0].isDefault = true
    }
    setAccounts(filtered)
  }

  const handleSetDefault = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    )
  }

  // Step 3 Finish Registration
  const handleCompleteRegistration = async () => {
    await register({
      username,
      email,
      password,
      fullName,
      avatar,
      baseCurrency,
      initialAccounts: accounts,
    })
  }

  // Total Starting Balance calculation converted to chosen Base Currency
  const totalStartingNetWorth = accounts.reduce((sum, a) => {
    return sum + convertCurrency(a.initialBalance, a.currency, baseCurrency)
  }, 0)

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="w-full max-w-2xl z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl shadow-lg mb-1">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5">
              <div className="w-full h-full bg-zinc-950 rounded-[6px] flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              </div>
            </div>
            <span className="text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Spendly OS — KokonutUI Ledger
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {authMode === "login" ? "Welcome Back" : "Welcome & Account Setup"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            {authMode === "login"
              ? "Sign in to access your client-encrypted financial ledger and accounts."
              : "Create your profile, initialize your wallets, and launch your private dashboard."}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 w-fit mx-auto mt-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className={`px-5 py-1.5 rounded-lg transition-all ${
                authMode === "register"
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700 text-emerald-400"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`px-5 py-1.5 rounded-lg transition-all ${
                authMode === "login"
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700 text-cyan-400"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LOGIN VIEW */}
        {/* ========================================================================= */}
        {authMode === "login" ? (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-5 animate-in fade-in duration-300">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                  Username or Gmail Address
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. mazen or mazen@gmail.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    autoFocus
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Client-Side Encryption Enabled
                </span>
                <span className="text-zinc-400">Auto-login active</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In & Decrypt Dashboard</span>
              </button>
            </form>
          </div>
        ) : (
          /* ========================================================================= */
          /* REGISTRATION WIZARD (STEPS 1 TO 3) */
          /* ========================================================================= */
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 animate-in fade-in duration-300">
            {/* Step Stepper Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-xs">
              <span className="font-semibold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold">
                  {regStep}
                </span>
                <span>
                  {regStep === 1 && "Step 1: Credentials & Profile Identity"}
                  {regStep === 2 && "Step 2: Initialize Wallets & Accounts (Mandatory)"}
                  {regStep === 3 && "Step 3: Summary Review & Encrypted Launch"}
                </span>
              </span>
              <span className="font-mono text-zinc-500 text-[11px]">Step {regStep} of 3</span>
            </div>

            {/* STEP 1: CREDENTIALS */}
            {regStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Avatar Selection */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
                    Profile Avatar
                  </label>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {AVATAR_PRESETS.map((av, idx) => (
                      <div
                        key={idx}
                        onClick={() => setAvatar(av)}
                        className={`relative rounded-full cursor-pointer transition-all ${
                          avatar === av
                            ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-950 scale-105"
                            : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={av}
                          alt="Avatar Option"
                          width={38}
                          height={38}
                          className="rounded-full object-cover w-9 h-9"
                        />
                        {avatar === av && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-zinc-950 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mazen Al-Ghamdi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1">Username Handle</label>
                    <div className="relative">
                      <AtSign className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. mazen"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1">Gmail / Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="e.g. mazen@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-9 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Base Currency Selection */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Preferred Base Currency
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {ALL_CURRENCIES.map((curr) => {
                      const conf = CURRENCY_CONFIGS[curr]
                      const isSelected = baseCurrency === curr
                      return (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => setBaseCurrency(curr)}
                          className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                            isSelected
                              ? "bg-emerald-950/40 border-emerald-500 text-white shadow-sm"
                              : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <span className="text-base">{conf.flag}</span>
                          <span className="text-xs font-bold font-mono">{conf.code}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: INITIALIZE ACCOUNTS */}
            {regStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-400">
                    You <strong className="text-white">MUST</strong> initialize at least 1 account to proceed.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddForm ? "Cancel" : "+ Add Account"}</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {ACCOUNT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleAddPreset(preset)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-medium text-zinc-300 flex items-center gap-1.5 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: preset.color }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* Add Custom Form */}
                {showAddForm && (
                  <form
                    onSubmit={handleAddCustomAccount}
                    className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2.5"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Account Name"
                        value={newAccName}
                        onChange={(e) => setNewAccName(e.target.value)}
                        className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none"
                      />
                      <select
                        value={newAccType}
                        onChange={(e) => setNewAccType(e.target.value as any)}
                        className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
                      >
                        <option value="bank">Bank Account</option>
                        <option value="wallet">Digital Wallet</option>
                        <option value="cash">Cash Vault</option>
                        <option value="savings">Savings</option>
                      </select>
                      <div className="flex gap-1">
                        <select
                          value={newAccCurrency}
                          onChange={(e) => setNewAccCurrency(e.target.value as any)}
                          className="bg-zinc-950 border border-zinc-700 rounded-lg px-1.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
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
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-100 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Save Account
                      </button>
                    </div>
                  </form>
                )}

                {/* Account Items List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: acc.color }} />
                        <div className="truncate">
                          <p className="font-semibold text-zinc-200 truncate">{acc.name}</p>
                          <span className="text-[10px] text-zinc-500 capitalize">{acc.type} • {acc.currency}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-mono font-bold text-white">
                          {formatCurrency(acc.initialBalance, acc.currency)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleSetDefault(acc.id)}
                          className={`p-1 rounded-md text-[10px] font-semibold border ${
                            acc.isDefault
                              ? "bg-amber-950/60 text-amber-300 border-amber-700/60"
                              : "text-zinc-500 border-zinc-800 hover:text-amber-400"
                          }`}
                          title="Set as Default"
                        >
                          <Star className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveAccount(acc.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded-md transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: SUMMARY & ENCRYPTED LAUNCH */}
            {regStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Profile Overview */}
                <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={avatar}
                      alt={fullName}
                      width={40}
                      height={40}
                      className="rounded-full ring-2 ring-emerald-500/60 object-cover"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-white">{fullName}</h3>
                      <p className="text-[11px] text-zinc-400">@{username} • {email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {CURRENCY_CONFIGS[baseCurrency].flag} {baseCurrency}
                  </span>
                </div>

                {/* Net Worth Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-zinc-900/90 to-cyan-950/30 border border-emerald-800/40">
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                    Starting Net Worth
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                    {formatCurrency(totalStartingNetWorth, baseCurrency)}
                  </h2>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    {accounts.length} initialized accounts configured under encrypted user partition.
                  </p>
                </div>

                {/* Accounts Mini List */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 block">Initialized Wallets:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {accounts.map((a) => (
                      <div
                        key={a.id}
                        className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs flex justify-between items-center"
                      >
                        <span className="text-zinc-300 truncate text-[11px]">{a.name}</span>
                        <span className="font-mono font-bold text-white text-[11px]">
                          {formatCurrency(a.initialBalance, a.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/70 text-[11px] text-zinc-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    AES-GCM / SHA-256 Client-Side Encryption active. Only your password can decrypt your ledger records.
                  </span>
                </div>
              </div>
            )}

            {/* Stepper Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              {regStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {regStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteRegistration}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 text-xs font-extrabold flex items-center gap-2 shadow-xl shadow-emerald-950/60 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  <span>Complete Account Setup & Launch Dashboard</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
