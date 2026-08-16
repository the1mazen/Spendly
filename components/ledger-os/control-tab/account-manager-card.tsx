"use client"

import React from "react"
import { useFinance } from "@/lib/context/finance-context"
import { formatCurrency } from "@/lib/currencies"
import {
  Wallet,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Star,
  Edit,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"

export default function AccountManagerCard() {
  const {
    accounts,
    reorderAccounts,
    setDefaultAccount,
    toggleAccountVisibility,
    getAccountBalance,
    openModal,
  } = useFinance()

  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    const newAccounts = [...accounts]
    const temp = newAccounts[index]
    newAccounts[index] = newAccounts[index - 1]
    newAccounts[index - 1] = temp
    reorderAccounts(newAccounts)
  }

  const handleMoveDown = (index: number) => {
    if (index >= accounts.length - 1) return
    const newAccounts = [...accounts]
    const temp = newAccounts[index]
    newAccounts[index] = newAccounts[index + 1]
    newAccounts[index + 1] = temp
    reorderAccounts(newAccounts)
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Account Ordering & Workspace Scope</h2>
            <p className="text-[11px] text-zinc-400">Set priority order, primary defaults, and hide/reveal accounts</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openModal("account_modal")}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Account List */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {accounts.map((acc, index) => {
          const bal = getAccountBalance(acc.id)
          return (
            <div
              key={acc.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                acc.isHidden
                  ? "bg-zinc-900/30 border-zinc-800/50 opacity-60"
                  : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {/* Left: Indicator, Name & Balance */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: acc.color }} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate">{acc.name}</span>
                    {acc.isDefault && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Default
                      </span>
                    )}
                    {acc.isHidden && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-zinc-800 text-zinc-400">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-zinc-400">
                    {formatCurrency(bal, acc.currency)} ({acc.currency} • {acc.type})
                  </p>
                </div>
              </div>

              {/* Right: Actions (Reorder Up/Down, Default, Visibility, Edit) */}
              <div className="flex items-center gap-1.5">
                {/* Move Up */}
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMoveUp(index)}
                  className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  disabled={index === accounts.length - 1}
                  onClick={() => handleMoveDown(index)}
                  className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Set Default */}
                <button
                  type="button"
                  onClick={() => {
                    setDefaultAccount(acc.id)
                    toast.success(`Set ${acc.name} as primary default account`)
                  }}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    acc.isDefault
                      ? "bg-amber-950/60 border-amber-700/60 text-amber-300"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-amber-400"
                  }`}
                  title="Make Default"
                >
                  <Star className="w-3.5 h-3.5" />
                </button>

                {/* Toggle Visibility */}
                <button
                  type="button"
                  onClick={() => {
                    toggleAccountVisibility(acc.id)
                    toast.info(`Toggled visibility for ${acc.name}`)
                  }}
                  className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  title={acc.isHidden ? "Unhide Account" : "Hide Account"}
                >
                  {acc.isHidden ? <EyeOff className="w-3.5 h-3.5 text-zinc-600" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                {/* Edit Account */}
                <button
                  type="button"
                  onClick={() => openModal("account_modal", { account: acc })}
                  className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  title="Edit Account"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
