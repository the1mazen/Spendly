"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { PRESET_CATEGORIES, formatCurrency } from "@/lib/currencies"
import {
  Sparkles,
  Plus,
  Scissors,
  CalendarClock,
  X,
  PlusCircle,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react"
import { toast } from "sonner"

export default function QuickPresetsCard() {
  const {
    shortcuts,
    addShortcut,
    deleteShortcut,
    openModal,
    setSubView,
    addTransaction,
    accounts,
  } = useFinance()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newCategory, setNewCategory] = useState("food")
  const [newAccountId, setNewAccountId] = useState(accounts[0]?.id || "")
  const [newType, setNewType] = useState<"expense" | "income">("expense")

  const handleExecuteShortcut = (sc: (typeof shortcuts)[0]) => {
    const acc = accounts.find((a) => a.id === sc.accountId) || accounts[0]
    addTransaction({
      title: sc.label,
      amount: sc.amount,
      currency: sc.currency,
      type: sc.type,
      category: sc.category,
      accountId: sc.accountId,
      date: new Date().toISOString().split("T")[0],
      notes: "Preset 1-Tap Trigger",
    })
    toast.success(`Executed preset: ${sc.label} (${formatCurrency(sc.amount, sc.currency)})`)
  }

  const handleCreateShortcut = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(newAmount) || 0
    if (!newLabel.trim()) {
      toast.error("Please enter a shortcut name")
      return
    }
    if (num <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    const acc = accounts.find((a) => a.id === newAccountId) || accounts[0]

    addShortcut({
      label: newLabel,
      amount: num,
      currency: acc.currency,
      category: newCategory,
      accountId: acc.id,
      type: newType,
    })

    toast.success(`Created Shortcut Preset: ${newLabel}`)
    setNewLabel("")
    setNewAmount("")
    setShowAddForm(false)
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Quick Actions & Presets</h2>
            <p className="text-[11px] text-zinc-400">One-tap workflows & modal launchers</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-4">
        {/* Action Button Grid */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => openModal("log_transaction")}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/40 text-zinc-200 hover:text-white transition-all group"
          >
            <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 group-hover:scale-110 transition-transform mb-1.5">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-center leading-tight">Log Modal</span>
            <span className="text-[10px] text-zinc-500">Universal Entry</span>
          </button>

          <button
            type="button"
            onClick={() => openModal("expense_divider")}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-rose-500/40 text-zinc-200 hover:text-white transition-all group"
          >
            <div className="p-2 rounded-lg bg-rose-950/40 text-rose-400 group-hover:scale-110 transition-transform mb-1.5">
              <Scissors className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-center leading-tight">Expense Divider</span>
            <span className="text-[10px] text-zinc-500">Multi-Split / Amortize</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView("planned_payments")}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-cyan-500/40 text-zinc-200 hover:text-white transition-all group"
          >
            <div className="p-2 rounded-lg bg-cyan-950/40 text-cyan-400 group-hover:scale-110 transition-transform mb-1.5">
              <CalendarClock className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-center leading-tight">Planned Bills</span>
            <span className="text-[10px] text-zinc-500">Schedule & Auto-pay</span>
          </button>
        </div>

        {/* Shortcut Chips Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">1-Tap Shortcuts</span>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <PlusCircle className="w-3 h-3" />
              {showAddForm ? "Close Form" : "+ Add Shortcut"}
            </button>
          </div>

          {/* Inline Add Shortcut Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateShortcut}
              className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2.5"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. Uber Commute)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700/80 rounded-lg px-2.5 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700/80 rounded-lg px-2.5 py-1 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700/80 rounded-lg px-2 py-1 text-xs text-zinc-200 focus:outline-none"
                >
                  {PRESET_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={newAccountId}
                  onChange={(e) => setNewAccountId(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700/80 rounded-lg px-2 py-1 text-xs text-zinc-200 focus:outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="py-1 px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                >
                  Save Chip
                </button>
              </div>
            </form>
          )}

          {/* Chips Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {shortcuts.map((sc) => (
              <div
                key={sc.id}
                className="group relative flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer"
                onClick={() => handleExecuteShortcut(sc)}
              >
                <div className="flex items-center gap-2 min-w-0 pr-4">
                  <div
                    className={`p-1.5 rounded-lg ${
                      sc.type === "expense"
                        ? "bg-rose-950/50 text-rose-400"
                        : "bg-emerald-950/50 text-emerald-400"
                    }`}
                  >
                    {sc.type === "expense" ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownLeft className="w-3 h-3" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{sc.label}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {formatCurrency(sc.amount, sc.currency)}
                    </p>
                  </div>
                </div>

                {/* Delete button visible on hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteShortcut(sc.id)
                    toast.success(`Removed shortcut ${sc.label}`)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-950/60 text-zinc-500 hover:text-rose-400 transition-all"
                  title="Delete Shortcut"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Helper Note */}
        <p className="text-[10px] text-zinc-500 text-center">
          Click any preset chip to instantly log the transaction into your ledger.
        </p>
      </div>
    </div>
  )
}
