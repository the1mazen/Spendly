"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { PRESET_CATEGORIES, calculateInstaPayFee } from "@/lib/currencies"
import { ArrowUpRight, ArrowDownLeft, Zap, Check, Sparkles } from "lucide-react"
import { toast } from "sonner"

export default function FastLogCard() {
  const { accounts, activeAccountId, addTransaction } = useFinance()

  const [type, setType] = useState<"expense" | "income">("expense")
  const [amount, setAmount] = useState("")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("food")
  const [accountId, setAccountId] = useState(activeAccountId)
  const [isInstaPay, setIsInstaPay] = useState(true)

  const selectedAccount = accounts.find((a) => a.id === accountId) || accounts[0]
  const parsedAmount = parseFloat(amount) || 0
  const fee = isInstaPay ? calculateInstaPayFee(parsedAmount, selectedAccount?.currency) : 0

  const handleFastSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Please enter a fast description (e.g. Coffee, Uber)")
      return
    }
    if (parsedAmount <= 0) {
      toast.error("Please enter an amount greater than 0")
      return
    }

    addTransaction({
      title,
      amount: parsedAmount,
      currency: selectedAccount.currency,
      type,
      category,
      accountId,
      date: new Date().toISOString().split("T")[0],
      isInstaPay,
      instaPayFee: isInstaPay ? fee : 0,
      notes: "Quick Fast Log entry",
    })

    toast.success(`Logged ${type === "expense" ? "Expense" : "Income"}: ${title}`)
    setAmount("")
    setTitle("")
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Fast Log Stream</h2>
            <p className="text-[11px] text-zinc-400">Rapid single-tap ledger recording</p>
          </div>
        </div>

        {/* Type Toggle */}
        <div className="flex p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              type === "expense" ? "bg-rose-950/80 text-rose-300 border border-rose-800/50" : "text-zinc-400"
            }`}
          >
            Spend
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              type === "income" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/50" : "text-zinc-400"
            }`}
          >
            Income
          </button>
        </div>
      </div>

      <form onSubmit={handleFastSubmit} className="flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3.5">
          {/* Amount & Currency */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Fast Amount
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="bg-transparent text-[11px] font-medium text-emerald-400 focus:outline-none cursor-pointer text-right"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id} className="bg-zinc-900 text-zinc-200">
                    {a.name} ({a.currency})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-zinc-400">{selectedAccount?.currency}</span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-white placeholder-zinc-700 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Description Title */}
          <div>
            <label className="text-[11px] font-medium text-zinc-300 block mb-1">Payee / Description</label>
            <input
              type="text"
              placeholder="e.g. Specialty Coffee, Fuel, Supermarket..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Category Tag Pills (Scrollable/Wrap) */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">Category Tag</label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {PRESET_CATEGORIES.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    category === cat.id
                      ? "bg-zinc-800 text-white border border-zinc-600 shadow-sm"
                      : "bg-zinc-900/60 text-zinc-400 border border-zinc-800/60 hover:text-zinc-200"
                  }`}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Egypt InstaPay Fee Toggle */}
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/70 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInstaPay}
                onChange={(e) => setIsInstaPay(e.target.checked)}
                className="rounded border-zinc-700 text-emerald-500 focus:ring-0 w-3.5 h-3.5 bg-zinc-800"
              />
              <span className="text-xs text-zinc-300 font-medium">Egypt InstaPay Auto-Calc</span>
            </label>
            {isInstaPay && (
              <span className="text-[11px] font-mono text-amber-400">
                Fee: +{fee} {selectedAccount?.currency}
              </span>
            )}
          </div>
        </div>

        {/* Submit Fast Log */}
        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>Quick Record to Ledger</span>
        </button>
      </form>
    </div>
  )
}
