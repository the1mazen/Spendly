"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { PRESET_CATEGORIES, formatCurrency, convertCurrency } from "@/lib/currencies"
import {
  PieChart,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Calendar,
  Sparkles,
  AlertCircle,
  Percent,
} from "lucide-react"

export default function SpendDistribution() {
  const { transactions, baseCurrency, categoryCaps, openModal } = useFinance()
  const [dateRange, setDateRange] = useState<"this_month" | "last_month" | "30_days" | "all">("this_month")

  // Filter transactions based on dateRange
  const now = new Date()
  const currentMonthPrefix = now.toISOString().substring(0, 7) // YYYY-MM
  
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthPrefix = lastMonthDate.toISOString().substring(0, 7)

  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]

  const filteredTx = transactions.filter((t) => {
    if (dateRange === "this_month") return t.date.startsWith(currentMonthPrefix)
    if (dateRange === "last_month") return t.date.startsWith(lastMonthPrefix)
    if (dateRange === "30_days") return t.date >= thirtyDaysAgoStr
    return true
  })

  // Calculate totals
  const totalIncome = filteredTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, baseCurrency), 0)

  const totalExpense = filteredTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + convertCurrency(t.amount + (t.instaPayFee || 0), t.currency, baseCurrency), 0)

  const netSavings = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0

  // Category Spend Aggregation
  const categorySpendMap: { [cat: string]: number } = {}
  filteredTx
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const converted = convertCurrency(t.amount + (t.instaPayFee || 0), t.currency, baseCurrency)
      categorySpendMap[t.category] = (categorySpendMap[t.category] || 0) + converted
    })

  // Sort categories by spend descending
  const sortedCategories = PRESET_CATEGORIES.map((cat) => {
    const amount = categorySpendMap[cat.id] || 0
    const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
    const cap = categoryCaps.find((c) => c.category === cat.id)?.monthlyCap || 0
    const isExceeded = cap > 0 && amount > cap
    return {
      ...cat,
      amount,
      pct,
      cap,
      isExceeded,
    }
  })
    .filter((c) => c.amount > 0 || c.cap > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-6">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-400">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Monthly Summary & Category Distribution</h2>
            <p className="text-[11px] text-zinc-400">Spend breakdown, savings rate, and category caps</p>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex p-0.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setDateRange("this_month")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              dateRange === "this_month" ? "bg-zinc-800 text-white font-semibold shadow-sm" : "text-zinc-400"
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => setDateRange("last_month")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              dateRange === "last_month" ? "bg-zinc-800 text-white font-semibold shadow-sm" : "text-zinc-400"
            }`}
          >
            Last Month
          </button>
          <button
            type="button"
            onClick={() => setDateRange("30_days")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              dateRange === "30_days" ? "bg-zinc-800 text-white font-semibold shadow-sm" : "text-zinc-400"
            }`}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => setDateRange("all")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              dateRange === "all" ? "bg-zinc-800 text-white font-semibold shadow-sm" : "text-zinc-400"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* 3 Metric Cards: Total Earned, Total Spent, Net Savings Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 font-semibold uppercase flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5" /> Total Inflow
            </span>
            <p className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
              {formatCurrency(totalIncome, baseCurrency)}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-400 font-semibold uppercase flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Total Outflow
            </span>
            <p className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
              {formatCurrency(totalExpense, baseCurrency)}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-cyan-400 font-semibold uppercase flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" /> Savings Rate
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-cyan-300 font-mono">
                {savingsRate}%
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                ({formatCurrency(netSavings, baseCurrency)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Proportional Colored Spend Bars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Category Breakdown ({sortedCategories.length} Active Categories)
          </h3>
          <button
            type="button"
            onClick={() => openModal("budget_caps")}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <Sliders className="w-3 h-3" /> Adjust Category Caps
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/70 hover:border-zinc-700/80 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-semibold text-zinc-200">{cat.name}</span>
                  {cat.isExceeded && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                      Cap Exceeded
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-white">{formatCurrency(cat.amount, baseCurrency)}</span>
                  <span className="text-zinc-500 text-[11px]">({cat.pct}%)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.pct}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>

              {cat.cap > 0 && (
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Monthly Cap: {formatCurrency(cat.cap, baseCurrency)}</span>
                  <span>{cat.amount > cat.cap ? `Over by ${formatCurrency(cat.amount - cat.cap, baseCurrency)}` : `${formatCurrency(cat.cap - cat.amount, baseCurrency)} left`}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
