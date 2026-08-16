"use client"

import React from "react"
import { cn } from "@/lib/utils"
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  ShoppingCart,
  Utensils,
  Car,
  Home as HomeIcon,
  Zap,
  Film,
  HeartPulse,
  Briefcase,
  TrendingUp,
  Receipt,
  MoreHorizontal,
  CreditCard,
} from "lucide-react"
import { useFinance } from "@/lib/context/finance-context"
import { formatCurrency, PRESET_CATEGORIES } from "@/lib/currencies"

interface List02Props {
  className?: string
  onViewAll?: () => void
}

export default function List02({ className, onViewAll }: List02Props) {
  const { transactions, setActiveTab, setSubView, openModal } = useFinance()

  const recentTransactions = transactions.slice(0, 6)

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case "food":
        return Utensils
      case "transport":
        return Car
      case "housing":
        return HomeIcon
      case "utilities":
        return Zap
      case "shopping":
        return ShoppingCart
      case "entertainment":
        return Film
      case "healthcare":
        return HeartPulse
      case "salary":
      case "freelance":
        return Briefcase
      case "investment":
        return TrendingUp
      case "loan":
        return Receipt
      default:
        return CreditCard
    }
  }

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll()
    } else {
      setSubView(null)
      setActiveTab("analysis")
    }
  }

  return (
    <div
      className={cn(
        "w-full flex flex-col justify-between h-full",
        "bg-white dark:bg-zinc-900/70",
        "border border-zinc-100 dark:border-zinc-800",
        "rounded-xl shadow-sm backdrop-blur-xl",
        className
      )}
    >
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Recent Activity
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 ml-1">
              ({transactions.length} total)
            </span>
          </h2>
          <button
            type="button"
            onClick={() => openModal("log_transaction")}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
          >
            + Quick Log
          </button>
        </div>

        <div className="space-y-1 overflow-y-auto max-h-[300px]">
          {recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No recent transactions recorded.
            </div>
          ) : (
            recentTransactions.map((transaction) => {
              const Icon = getCategoryIcon(transaction.category)
              const isIncoming = transaction.type === "income"

              return (
                <div
                  key={transaction.id}
                  onClick={() => openModal("log_transaction", { transaction })}
                  className={cn(
                    "group flex items-center gap-3 cursor-pointer",
                    "p-2 rounded-lg",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                    "transition-all duration-200"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      "bg-zinc-100 dark:bg-zinc-800",
                      "border border-zinc-200 dark:border-zinc-700"
                    )}
                  >
                    <Icon className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                  </div>

                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div className="space-y-0.5 truncate pr-2">
                      <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {transaction.title}
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {transaction.date} {transaction.isInstaPay ? "• ⚡ InstaPay" : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pl-2 flex-shrink-0">
                      <span
                        className={cn(
                          "text-xs font-semibold font-mono",
                          isIncoming
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {isIncoming ? "+" : "-"}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </span>
                      {isIncoming ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
        <button
          type="button"
          onClick={handleViewAll}
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "py-2 px-3 rounded-lg",
            "text-xs font-medium",
            "bg-gradient-to-r from-zinc-900 to-zinc-800",
            "dark:from-zinc-50 dark:to-zinc-200",
            "text-zinc-50 dark:text-zinc-900",
            "hover:from-zinc-800 hover:to-zinc-700",
            "dark:hover:from-zinc-200 dark:hover:to-zinc-300",
            "shadow-sm hover:shadow",
            "transform transition-all duration-200",
            "hover:-translate-y-0.5",
            "active:translate-y-0",
            "focus:outline-none focus:ring-2",
            "focus:ring-zinc-500 dark:focus:ring-zinc-400"
          )}
        >
          <span>View All Transactions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
