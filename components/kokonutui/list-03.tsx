"use client"

import React from "react"
import { cn } from "@/lib/utils"
import {
  Calendar,
  ArrowRight,
  CheckCircle2,
  Timer,
  AlertCircle,
  PiggyBank,
  TrendingUp,
  CreditCard,
  Target,
  Plus,
} from "lucide-react"
import { useFinance } from "@/lib/context/finance-context"
import { formatCurrency } from "@/lib/currencies"

interface List03Props {
  className?: string
}

export default function List03({ className }: List03Props) {
  const { savingsTargets, openModal } = useFinance()

  const getStatusConfig = (current: number, target: number) => {
    const pct = Math.round((current / target) * 100)
    if (pct >= 100) {
      return {
        label: "Completed",
        icon: CheckCircle2,
        class: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
      }
    }
    if (pct >= 50) {
      return {
        label: "In-progress",
        icon: AlertCircle,
        class: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-900/30",
      }
    }
    return {
      label: "Pending",
      icon: Timer,
      class: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    }
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          Active Milestones ({savingsTargets.length})
        </span>
        <button
          type="button"
          onClick={() => openModal("savings_target")}
          className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          <span>New Target</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {savingsTargets.map((item) => {
          const progress = Math.min(100, Math.round((item.currentAmount / item.targetAmount) * 100))
          const status = getStatusConfig(item.currentAmount, item.targetAmount)

          return (
            <div
              key={item.id}
              className={cn(
                "flex flex-col justify-between",
                "bg-white dark:bg-zinc-900/70",
                "rounded-xl p-4",
                "border border-zinc-100 dark:border-zinc-800",
                "hover:border-zinc-200 dark:hover:border-zinc-700",
                "transition-all duration-200",
                "shadow-sm backdrop-blur-xl"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                  <div
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5",
                      status.bg,
                      status.class
                    )}
                  >
                    <status.icon className="w-3.5 h-3.5" />
                    <span>{status.label}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {item.category || "Savings Capital Goal"}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 dark:text-zinc-400">Progress</span>
                    <span className="text-zinc-900 dark:text-zinc-100 font-bold">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(item.currentAmount, item.currency)}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                    target: {formatCurrency(item.targetAmount, item.currency)}
                  </span>
                </div>

                <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  <span>Target: {item.deadline}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => openModal("savings_target", { id: item.id, mode: "contribute" })}
                  className={cn(
                    "w-full flex items-center justify-center gap-2",
                    "py-2 px-3",
                    "text-xs font-medium rounded-lg",
                    "text-zinc-700 dark:text-zinc-300",
                    "hover:text-zinc-900 dark:hover:text-zinc-100",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                    "transition-colors duration-200"
                  )}
                >
                  <span>Deposit Funds & View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
