"use client"

import React from "react"
import { cn } from "@/lib/utils"
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  SendHorizontal,
  QrCode,
  Plus,
  ArrowRight,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  PiggyBank,
} from "lucide-react"
import { useFinance } from "@/lib/context/finance-context"
import { formatCurrency, convertCurrency } from "@/lib/currencies"

interface List01Props {
  className?: string
}

export default function List01({ className }: List01Props) {
  const {
    accounts,
    baseCurrency,
    totalConsolidatedNetWorth,
    getAccountBalance,
    openModal,
    activeAccountId,
    setActiveAccountId,
  } = useFinance()

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return Building
      case "wallet":
        return QrCode
      case "cash":
        return Banknote
      case "savings":
        return PiggyBank
      default:
        return Wallet
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
      {/* Total Balance Section */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Balance ({baseCurrency})</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono mt-0.5">
            {formatCurrency(totalConsolidatedNetWorth, baseCurrency)}
          </h1>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          {accounts.filter((a) => !a.isHidden).length} Accounts
        </span>
      </div>

      {/* Accounts List */}
      <div className="p-3 flex-1 overflow-y-auto max-h-[300px]">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Your Accounts
          </h2>
        </div>

        <div className="space-y-1">
          {accounts.map((account) => {
            const bal = getAccountBalance(account.id)
            const Icon = getAccountIcon(account.type)
            const isSelected = activeAccountId === account.id

            return (
              <div
                key={account.id}
                onClick={() => setActiveAccountId(account.id)}
                className={cn(
                  "group flex items-center justify-between cursor-pointer",
                  "p-2.5 rounded-lg",
                  isSelected
                    ? "bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border border-transparent",
                  "transition-all duration-200"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn("p-2 rounded-lg flex-shrink-0", {
                      "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400":
                        account.type === "savings" || account.type === "bank",
                      "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400":
                        account.type === "wallet",
                      "bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400":
                        account.type === "cash" || account.type === "crypto",
                    })}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {account.name}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 capitalize">
                      {account.type} account • {account.currency}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                  <span className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(bal, account.currency)}
                  </span>
                  {account.isDefault && (
                    <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Default</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer with four action buttons */}
      <div className="p-2.5 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
        <div className="grid grid-cols-4 gap-2">
          {/* + Add Button */}
          <button
            type="button"
            onClick={() => openModal("account_modal")}
            className={cn(
              "flex items-center justify-center gap-1.5",
              "py-2 px-2 rounded-lg",
              "text-xs font-medium",
              "bg-zinc-900 dark:bg-zinc-50",
              "text-zinc-50 dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "shadow-sm hover:shadow",
              "transition-all duration-200"
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>

          {/* Send / Transfer Button */}
          <button
            type="button"
            onClick={() => openModal("transfer_modal")}
            className={cn(
              "flex items-center justify-center gap-1.5",
              "py-2 px-2 rounded-lg",
              "text-xs font-medium",
              "bg-zinc-900 dark:bg-zinc-50",
              "text-zinc-50 dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "shadow-sm hover:shadow",
              "transition-all duration-200"
            )}
          >
            <SendHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>

          {/* Top-up Button */}
          <button
            type="button"
            onClick={() => openModal("log_transaction", { defaultType: "income" })}
            className={cn(
              "flex items-center justify-center gap-1.5",
              "py-2 px-2 rounded-lg",
              "text-xs font-medium",
              "bg-zinc-900 dark:bg-zinc-50",
              "text-zinc-50 dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "shadow-sm hover:shadow",
              "transition-all duration-200"
            )}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Top-up</span>
          </button>

          {/* More Actions Button */}
          <button
            type="button"
            onClick={() => openModal("add_custodial")}
            className={cn(
              "flex items-center justify-center gap-1.5",
              "py-2 px-2 rounded-lg",
              "text-xs font-medium",
              "bg-zinc-900 dark:bg-zinc-50",
              "text-zinc-50 dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "shadow-sm hover:shadow",
              "transition-all duration-200"
            )}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">More</span>
          </button>
        </div>
      </div>
    </div>
  )
}
