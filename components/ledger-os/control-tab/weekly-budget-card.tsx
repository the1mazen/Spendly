"use client"

import React from "react"
import { useFinance } from "@/lib/context/finance-context"
import { formatCurrency, convertCurrency } from "@/lib/currencies"
import { Sliders, Zap, AlertTriangle, ShieldCheck, Calendar, RefreshCw } from "lucide-react"

export default function WeeklyBudgetCard() {
  const {
    weeklyBudget,
    updateWeeklyBudget,
    accounts,
    transactions,
    baseCurrency,
  } = useFinance()

  // Calculate past 7 days spending across scoped accounts
  const sevenDaysAgoStr = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]

  const weeklyExpenses = transactions
    .filter((t) => {
      if (t.type !== "expense") return false
      if (t.date < sevenDaysAgoStr) return false
      if (weeklyBudget.scopedAccountIds.length > 0 && !weeklyBudget.scopedAccountIds.includes(t.accountId)) {
        return false
      }
      return true
    })
    .reduce((sum, t) => sum + convertCurrency(t.amount + (t.instaPayFee || 0), t.currency, weeklyBudget.currency), 0)

  const budgetLimit = weeklyBudget.amount || 1
  const remaining = Math.max(0, budgetLimit - weeklyExpenses)
  const spentPct = Math.min(150, Math.round((weeklyExpenses / budgetLimit) * 100))
  const dailyBurnRate = Number((weeklyExpenses / 7).toFixed(2))
  const projectedDaysLeft = dailyBurnRate > 0 ? Number((remaining / dailyBurnRate).toFixed(1)) : 7

  const isAlertTriggered = spentPct >= weeklyBudget.alertThreshold

  const toggleAccountScope = (accId: string) => {
    const current = weeklyBudget.scopedAccountIds
    if (current.includes(accId)) {
      if (current.length === 1) return // keep at least 1
      updateWeeklyBudget({ scopedAccountIds: current.filter((id) => id !== accId) })
    } else {
      updateWeeklyBudget({ scopedAccountIds: [...current, accId] })
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-5">
      {/* Header with Enable Switch */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Weekly Spending Limit & Burn-Down Engine</h2>
            <p className="text-[11px] text-zinc-400">Pace your weekly cashflow with rolling burn-down calculations</p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={weeklyBudget.enabled}
            onChange={(e) => updateWeeklyBudget({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
        </label>
      </div>

      {weeklyBudget.enabled ? (
        <div className="space-y-5">
          {/* Controls Grid: Budget Amount, Reset Mode, Scope Accounts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Limit Input */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Weekly Budget Ceiling
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-400">{weeklyBudget.currency}</span>
                <input
                  type="number"
                  value={weeklyBudget.amount}
                  onChange={(e) => updateWeeklyBudget({ amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-transparent text-xl font-bold text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Reset Mode */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Reset Cycle Mode
              </label>
              <select
                value={weeklyBudget.resetMode}
                onChange={(e) => updateWeeklyBudget({ resetMode: e.target.value as any })}
                className="w-full bg-transparent text-xs font-semibold text-zinc-100 focus:outline-none cursor-pointer mt-1"
              >
                <option value="rolling_7_days" className="bg-zinc-900">
                  Rolling 7-Day Window (Continuous)
                </option>
                <option value="fixed_sunday" className="bg-zinc-900">
                  Fixed Sunday Reset
                </option>
                <option value="fixed_monday" className="bg-zinc-900">
                  Fixed Monday Reset
                </option>
              </select>
            </div>

            {/* Scoped Accounts Multi-Select */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Scoped Accounts ({weeklyBudget.scopedAccountIds.length})
              </label>
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                {accounts.map((acc) => {
                  const isScoped = weeklyBudget.scopedAccountIds.includes(acc.id)
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => toggleAccountScope(acc.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                        isScoped
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-700/60"
                          : "bg-zinc-950 text-zinc-500 border border-zinc-800 hover:text-zinc-300"
                      }`}
                    >
                      {acc.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Burn-Down Projection Table / Status Card */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Current Burn-Down Trajectory</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 font-mono">
                  Week Cycle Active
                </span>
              </div>

              {isAlertTriggered ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Alert: {spentPct}% of Weekly Cap Spent
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                  Healthy Burn Rate ({spentPct}%)
                </span>
              )}
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1">
              <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    spentPct >= 100 ? "bg-rose-500" : isAlertTriggered ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, spentPct)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                <span>Spent: {formatCurrency(weeklyExpenses, weeklyBudget.currency)}</span>
                <span>Remaining Pool: {formatCurrency(remaining, weeklyBudget.currency)}</span>
              </div>
            </div>

            {/* Burn-Down Metric Pillars */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Daily Burn-Rate</span>
                <span className="font-mono font-bold text-zinc-200">
                  {formatCurrency(dailyBurnRate, weeklyBudget.currency)} / day
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Projected Runway</span>
                <span className="font-mono font-bold text-zinc-200">
                  ~{projectedDaysLeft} Days Remaining
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Weekly Deduction</span>
                <span className="font-mono font-bold text-emerald-400">
                  {spentPct}% / 100%
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-zinc-500 text-xs">
          Weekly Spending Limit is currently disabled. Toggle the switch above to activate automatic burn-down pacing.
        </div>
      )}
    </div>
  )
}
