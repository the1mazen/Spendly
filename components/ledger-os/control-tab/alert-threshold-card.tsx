"use client"

import React from "react"
import { useFinance } from "@/lib/context/finance-context"
import { BellRing, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function AlertThresholdCard() {
  const { weeklyBudget, updateWeeklyBudget } = useFinance()

  const threshold = weeklyBudget.alertThreshold || 80

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateWeeklyBudget({ alertThreshold: parseInt(e.target.value) })
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-400">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Alert Threshold Triggers</h2>
            <p className="text-[11px] text-zinc-400">Configure safety margin warnings before hitting budget limits</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400 font-mono font-bold text-xs">
          Trigger at {threshold}%
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-zinc-400 mb-2">
            <span>Conservative (50%)</span>
            <span className="font-semibold text-zinc-200">Current Trigger: {threshold}%</span>
            <span>Aggressive (100%)</span>
          </div>

          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={threshold}
            onChange={handleSliderChange}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Live Simulation Preview Banner */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-zinc-200">Live Warning Banner Simulation</p>
            <p className="text-zinc-400 text-[11px] mt-0.5">
              When weekly spending reaches <strong className="text-amber-300">{threshold}%</strong> of your ceiling (e.g. {Math.round(weeklyBudget.amount * (threshold / 100))} {weeklyBudget.currency}), the system automatically renders high-priority warning badges and highlights overspend risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
