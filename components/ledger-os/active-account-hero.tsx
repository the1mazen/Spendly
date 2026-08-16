"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { ALL_CURRENCIES, CURRENCY_CONFIGS, convertCurrency, formatCurrency } from "@/lib/currencies"
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  ShieldAlert,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Plus,
  Scissors,
  Sparkles,
  Layers,
  Info,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ActiveAccountHero() {
  const {
    accounts,
    activeAccountId,
    setActiveAccountId,
    activeAccount,
    getAccountBalance,
    getAccountAvailableBalance,
    openModal,
    transactions,
  } = useFinance()

  const [showAvailableAccordion, setShowAvailableAccordion] = useState(false)

  const currentAcc = activeAccount || accounts[0]
  const rawBalance = getAccountBalance(currentAcc.id)
  const { total, custodialHeld, unpaidPlanned, available } = getAccountAvailableBalance(currentAcc.id)

  // Generate dynamic 30-day sparkline SVG points based on transactions
  const accountTx = transactions
    .filter((t) => t.accountId === currentAcc.id || t.toAccountId === currentAcc.id)
    .slice(0, 15)

  // Sparkline coordinates
  const sparklinePoints = React.useMemo(() => {
    let cur = currentAcc.initialBalance
    const points: number[] = [cur]
    // replay transactions to build historical trajectory
    for (let i = accountTx.length - 1; i >= 0; i--) {
      const tx = accountTx[i]
      if (tx.type === "income" || (tx.type === "transfer" && tx.toAccountId === currentAcc.id)) {
        cur += tx.amount
      } else {
        cur -= tx.amount + (tx.instaPayFee || 0)
      }
      points.push(cur)
    }
    if (points.length < 5) {
      points.push(rawBalance * 0.95, rawBalance * 0.98, rawBalance * 1.02, rawBalance)
    }

    const min = Math.min(...points)
    const max = Math.max(...points)
    const range = max - min || 1
    const width = 360
    const height = 70

    return points
      .map((p, idx) => {
        const x = (idx / (points.length - 1)) * width
        const y = height - ((p - min) / range) * (height - 16) - 8
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(" ")
  }, [accountTx, currentAcc, rawBalance])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 sm:p-6 backdrop-blur-xl shadow-2xl transition-all duration-300">
      {/* Ambient background glow gradient */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl transition-colors duration-700"
        style={{ backgroundColor: currentAcc.color || "#10b981" }}
      />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Account Switcher, Live Calculated Balance & Available Breakdown */}
        <div className="flex-1 space-y-3">
          {/* Account Selector Dropdown */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-white shadow-md focus:outline-none transition-all">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: currentAcc.color || "#10b981" }}
                />
                <span className="text-zinc-100">{currentAcc.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                  {currentAcc.currency}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-zinc-950 border-zinc-800 text-zinc-200">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Switch Active Account
                </div>
                <DropdownMenuSeparator className="bg-zinc-800" />
                {accounts.map((acc) => {
                  const bal = getAccountBalance(acc.id)
                  return (
                    <DropdownMenuItem
                      key={acc.id}
                      onClick={() => setActiveAccountId(acc.id)}
                      className={`flex items-center justify-between text-xs cursor-pointer p-2 ${
                        acc.id === currentAcc.id ? "bg-zinc-900 text-emerald-400 font-semibold" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color }} />
                        <span>{acc.name}</span>
                      </div>
                      <span className="font-mono text-zinc-400 text-[11px]">
                        {formatCurrency(bal, acc.currency)}
                      </span>
                    </DropdownMenuItem>
                  )
                })}
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  onClick={() => openModal("account_modal")}
                  className="text-xs text-emerald-400 cursor-pointer p-2 hover:bg-emerald-950/20"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add New Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {currentAcc.isDefault && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                Primary Default
              </span>
            )}
            <span className="text-xs text-zinc-400 capitalize hidden sm:inline">
              • {currentAcc.type} Account
            </span>
          </div>

          {/* Large Total Balance Display */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <span>Total Calculated Balance</span>
              <span className="text-[10px] text-zinc-500 font-mono">(Baseline + Incomes - Expenses - Transfers)</span>
            </p>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                {formatCurrency(total, currentAcc.currency)}
              </h1>
            </div>
          </div>

          {/* "Available Balance" Accordion / Breakdown */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAvailableAccordion(!showAvailableAccordion)}
              className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-1 px-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Available Spending Liquidity:</span>
              <span className="font-mono font-bold">{formatCurrency(available, currentAcc.currency)}</span>
              {showAvailableAccordion ? (
                <ChevronUp className="w-3.5 h-3.5 ml-1" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              )}
            </button>

            {showAvailableAccordion && (
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">1. Gross Balance</span>
                  <p className="font-mono font-bold text-zinc-100">
                    {formatCurrency(total, currentAcc.currency)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-amber-400 uppercase font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> - Custodial / Held
                  </span>
                  <p className="font-mono font-bold text-amber-300">
                    -{formatCurrency(custodialHeld, currentAcc.currency)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-rose-400 uppercase font-semibold flex items-center gap-1">
                    <CalendarClock className="w-3 h-3" /> - Unpaid Planned Bills
                  </span>
                  <p className="font-mono font-bold text-rose-300">
                    -{formatCurrency(unpaidPlanned, currentAcc.currency)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Dynamic SVG 30-Day Cashflow Sparkline */}
        <div className="hidden xl:flex flex-col items-center justify-center px-4 border-x border-zinc-800/80">
          <div className="flex items-center justify-between w-full text-[11px] text-zinc-400 mb-1">
            <span className="font-medium">30-Day Trajectory</span>
            <span className="text-emerald-400 font-semibold font-mono">Live Curve</span>
          </div>
          <svg className="w-56 h-16 overflow-visible" viewBox="0 0 360 70">
            <defs>
              <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparklinePoints}
            />
          </svg>
        </div>

        {/* Right: Multi-Currency Live Conversion Matrix */}
        <div className="lg:w-80 space-y-2 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-800">
            <span>Multi-Currency Matrix</span>
            <span className="text-zinc-500 font-mono">Real-time Equiv.</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {ALL_CURRENCIES.filter((c) => c !== currentAcc.currency).slice(0, 4).map((c) => {
              const converted = convertCurrency(total, currentAcc.currency, c)
              return (
                <div
                  key={c}
                  className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/60 flex items-center justify-between"
                >
                  <span className="text-zinc-400 flex items-center gap-1 font-sans text-[11px]">
                    <span>{CURRENCY_CONFIGS[c].flag}</span>
                    <span className="font-medium">{c}</span>
                  </span>
                  <span className="text-zinc-100 font-bold text-[11px]">
                    {formatCurrency(converted, c, { compact: true })}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Quick Actions Footer inside Hero */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => openModal("log_transaction", { defaultType: "expense" })}
              className="py-1.5 px-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
            >
              <ArrowUpRight className="w-3 h-3 text-rose-400" /> Log Spend
            </button>
            <button
              type="button"
              onClick={() => openModal("log_transaction", { defaultType: "income" })}
              className="py-1.5 px-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
            >
              <ArrowDownLeft className="w-3 h-3 text-emerald-400" /> Log Income
            </button>
            <button
              type="button"
              onClick={() => openModal("transfer_modal")}
              className="py-1.5 px-2 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/50 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
            >
              <ArrowRightLeft className="w-3 h-3 text-cyan-400" /> Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
