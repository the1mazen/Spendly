"use client"

import React from "react"
import { useFinance } from "@/lib/context/finance-context"
import { formatCurrency, convertCurrency, CURRENCY_CONFIGS } from "@/lib/currencies"
import {
  TrendingUp,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Wallet,
  Building,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function ConsolidatedNetWorth() {
  const {
    accounts,
    baseCurrency,
    totalConsolidatedNetWorth,
    getAccountBalance,
    toggleAccountVisibility,
    transactions,
  } = useFinance()

  // Calculate total liquid vs invested/saved
  const visibleAccounts = accounts.filter((a) => !a.isHidden)

  const liquidBalance = visibleAccounts
    .filter((a) => a.type === "bank" || a.type === "wallet" || a.type === "cash")
    .reduce((sum, a) => sum + convertCurrency(getAccountBalance(a.id), a.currency, baseCurrency), 0)

  const savingsPortfolio = visibleAccounts
    .filter((a) => a.type === "savings" || a.type === "crypto")
    .reduce((sum, a) => sum + convertCurrency(getAccountBalance(a.id), a.currency, baseCurrency), 0)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-6 backdrop-blur-xl shadow-2xl">
      {/* Glow highlight */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left: Net Worth Total & Sub-Categories */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Consolidated Global Net Worth ({baseCurrency})
            </span>

            {/* Visibility Settings Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  title="Account Scope & Visibility"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 bg-zinc-950 border-zinc-800 p-3 text-zinc-100">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-xs font-semibold text-zinc-300">Account Scope Inclusion</span>
                    <span className="text-[10px] text-zinc-500">{visibleAccounts.length} Active</span>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {accounts.map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() => toggleAccountVisibility(acc.id)}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color }} />
                          <span className={acc.isHidden ? "text-zinc-500 line-through" : "text-zinc-200"}>
                            {acc.name}
                          </span>
                        </div>
                        {acc.isHidden ? (
                          <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
              {formatCurrency(totalConsolidatedNetWorth, baseCurrency)}
            </h1>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> Multi-Currency Aggregate
              </span>
              <span>across {visibleAccounts.length} accounts converted in real-time</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Liquid Cash & Checking</span>
              <p className="text-sm font-bold text-zinc-100 font-mono mt-0.5">
                {formatCurrency(liquidBalance, baseCurrency)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <span className="text-[10px] text-purple-400 uppercase font-semibold">Savings & Portfolio</span>
              <p className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                {formatCurrency(savingsPortfolio, baseCurrency)}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Currency Distribution Proportion Bars */}
        <div className="lg:w-96 space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300">Account Holdings Breakdown</span>
            <span className="text-[11px] text-zinc-500 font-mono">Share of Net Worth</span>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {visibleAccounts.map((acc) => {
              const balInBase = convertCurrency(getAccountBalance(acc.id), acc.currency, baseCurrency)
              const pct = totalConsolidatedNetWorth > 0 ? Math.round((balInBase / totalConsolidatedNetWorth) * 100) : 0

              return (
                <div key={acc.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: acc.color }} />
                      <span className="text-zinc-300 truncate">{acc.name}</span>
                    </div>
                    <span className="text-zinc-400 font-mono text-[11px] flex-shrink-0">
                      {formatCurrency(getAccountBalance(acc.id), acc.currency)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: acc.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
