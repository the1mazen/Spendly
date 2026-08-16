"use client"

import React from "react"
import { useFinance } from "@/lib/context/finance-context"
import { formatCurrency } from "@/lib/currencies"
import { Target, Plus, PiggyBank, Calendar, ArrowRight, CheckCircle2 } from "lucide-react"

export default function SavingsGoalsCard() {
  const { savingsTargets, openModal } = useFinance()

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Savings Targets & Capital Goals</h2>
            <p className="text-[11px] text-zinc-400">Track milestones, deposit funds, and measure time-to-goal</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openModal("savings_target")}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {savingsTargets.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

          return (
            <div
              key={goal.id}
              className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider block">
                      {goal.category || "Capital Target"}
                    </span>
                    <h3 className="text-xs font-bold text-white mt-0.5">{goal.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 font-mono">
                    {pct}%
                  </span>
                </div>

                {/* Amount Progress */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold">
                      {formatCurrency(goal.currentAmount, goal.currency)}
                    </span>
                    <span className="text-zinc-500">
                      / {formatCurrency(goal.targetAmount, goal.currency)}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {goal.deadline}
                  </span>
                  <span>{formatCurrency(remaining, goal.currency)} left</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openModal("savings_target", { id: goal.id, mode: "contribute" })}
                className="w-full py-2 px-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fund Goal</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
