"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { PRESET_CATEGORIES, formatCurrency } from "@/lib/currencies"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Scissors, Split, Calendar, Plus, Trash2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface CategorySplitItem {
  id: string
  category: string
  percentage: number
  amount: number
}

export default function ExpenseDividerModal() {
  const { activeModal, closeModal, accounts, activeAccountId, addTransaction, addPlannedPayment } = useFinance()
  const isOpen = activeModal === "expense_divider"

  const [mode, setMode] = useState<"category" | "timeline">("category")
  const [totalAmount, setTotalAmount] = useState("")
  const [title, setTitle] = useState("")
  const [accountId, setAccountId] = useState(activeAccountId)

  // Category Split Mode State
  const [splits, setSplits] = useState<CategorySplitItem[]>([
    { id: "1", category: "food", percentage: 50, amount: 0 },
    { id: "2", category: "entertainment", percentage: 50, amount: 0 },
  ])

  // Timeline Installment Mode State
  const [monthsCount, setMonthsCount] = useState(3)
  const [startMonthDate, setStartMonthDate] = useState(new Date().toISOString().split("T")[0])
  const [timelineCategory, setTimelineCategory] = useState("shopping")

  const selectedAccount = accounts.find((a) => a.id === accountId) || accounts[0]
  const parsedTotal = parseFloat(totalAmount) || 0

  const handleTotalChange = (val: string) => {
    setTotalAmount(val)
    const num = parseFloat(val) || 0
    // Recalculate split amounts based on percentages
    setSplits((prev) =>
      prev.map((s) => ({
        ...s,
        amount: Number(((num * s.percentage) / 100).toFixed(2)),
      }))
    )
  }

  const handlePercentageChange = (id: string, newPct: number) => {
    setSplits((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, percentage: newPct } : s))
      return updated.map((s) => ({
        ...s,
        amount: Number(((parsedTotal * s.percentage) / 100).toFixed(2)),
      }))
    })
  }

  const addSplitRow = () => {
    if (splits.length >= 5) return
    const remainingPct = Math.max(0, 100 - splits.reduce((sum, s) => sum + s.percentage, 0))
    setSplits((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        category: PRESET_CATEGORIES[prev.length % PRESET_CATEGORIES.length].id,
        percentage: remainingPct,
        amount: Number(((parsedTotal * remainingPct) / 100).toFixed(2)),
      },
    ])
  }

  const removeSplitRow = (id: string) => {
    if (splits.length <= 2) return
    setSplits((prev) => prev.filter((s) => s.id !== id))
  }

  const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Please enter a title for the split expense")
      return
    }
    if (parsedTotal <= 0) {
      toast.error("Please enter a total amount greater than 0")
      return
    }

    if (mode === "category") {
      if (Math.round(totalPercentage) !== 100) {
        toast.error("Total split percentage must equal 100%")
        return
      }

      // Log each categorized chunk as a transaction
      splits.forEach((split) => {
        const catName = PRESET_CATEGORIES.find((c) => c.id === split.category)?.name || split.category
        addTransaction({
          title: `${title} [${catName} (${split.percentage}%)]`,
          amount: split.amount,
          currency: selectedAccount.currency,
          type: "expense",
          category: split.category,
          accountId,
          date: new Date().toISOString().split("T")[0],
          notes: `Divided from master total of ${formatCurrency(parsedTotal, selectedAccount.currency)}`,
        })
      })

      toast.success(`Successfully divided into ${splits.length} category entries`)
    } else {
      // Timeline Mode: Split across months!
      const monthlyAmount = Number((parsedTotal / monthsCount).toFixed(2))

      // 1. Log First Month Immediately
      addTransaction({
        title: `${title} (Installment 1/${monthsCount})`,
        amount: monthlyAmount,
        currency: selectedAccount.currency,
        type: "expense",
        category: timelineCategory,
        accountId,
        date: startMonthDate,
        notes: `Month 1 of ${monthsCount} amortized split`,
      })

      // 2. Schedule remaining installments into Planned Payments
      for (let i = 2; i <= monthsCount; i++) {
        const futureDate = new Date(startMonthDate)
        futureDate.setMonth(futureDate.getMonth() + (i - 1))
        const dateStr = futureDate.toISOString().split("T")[0]

        addPlannedPayment({
          title: `${title} (Installment ${i}/${monthsCount})`,
          amount: monthlyAmount,
          currency: selectedAccount.currency,
          accountId,
          category: timelineCategory,
          dueDate: dateStr,
          frequency: "once",
          isPaid: false,
          autoPay: true,
        })
      }

      toast.success(
        `Divided into ${monthsCount} monthly installments of ${formatCurrency(
          monthlyAmount,
          selectedAccount.currency
        )} each`
      )
    }

    closeModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-lg bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Scissors className="w-4 h-4 text-rose-400" />
            Smart Expense Divider & Amortizer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setMode("category")}
              className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                mode === "category"
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Split className="w-3.5 h-3.5 text-indigo-400" />
              Category Multi-Split
            </button>
            <button
              type="button"
              onClick={() => setMode("timeline")}
              className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                mode === "timeline"
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Multi-Month Timeline
            </button>
          </div>

          {/* Master Title & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Expense Title</label>
              <input
                type="text"
                placeholder="e.g. Annual Cloud Services / Office Setup"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">
                Total Amount ({selectedAccount?.currency})
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={totalAmount}
                onChange={(e) => handleTotalChange(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          {/* Account Selection */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">Source Account</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Category Multi-Split Mode Content */}
          {mode === "category" ? (
            <div className="space-y-2 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-zinc-300">Category Allocation Shares</span>
                <span
                  className={`font-mono text-xs font-bold ${
                    Math.round(totalPercentage) === 100 ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  Total: {totalPercentage}%
                </span>
              </div>

              <div className="space-y-2">
                {splits.map((s, idx) => (
                  <div key={s.id} className="grid grid-cols-[1.5fr,80px,1fr,auto] gap-2 items-center">
                    <select
                      value={s.category}
                      onChange={(e) => {
                        const val = e.target.value
                        setSplits((prev) => prev.map((item) => (item.id === s.id ? { ...item, category: val } : item)))
                      }}
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
                    >
                      {PRESET_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1">
                      <input
                        type="number"
                        value={s.percentage}
                        onChange={(e) => handlePercentageChange(s.id, parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent text-xs text-right text-zinc-100 font-semibold focus:outline-none"
                      />
                      <span className="text-[10px] text-zinc-400">%</span>
                    </div>

                    <span className="text-xs font-mono text-zinc-300 text-right px-1">
                      {formatCurrency(s.amount, selectedAccount.currency)}
                    </span>

                    {splits.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeSplitRow(s.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {splits.length < 5 && (
                <button
                  type="button"
                  onClick={addSplitRow}
                  className="mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Category Slice
                </button>
              )}
            </div>
          ) : (
            /* Timeline Installments Mode Content */
            <div className="space-y-3 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Amortize Over (Months)</label>
                  <select
                    value={monthsCount}
                    onChange={(e) => setMonthsCount(parseInt(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months (Quarter)</option>
                    <option value={4}>4 Months</option>
                    <option value={6}>6 Months (Half-Year)</option>
                    <option value={12}>12 Months (Full Year)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Category</label>
                  <select
                    value={timelineCategory}
                    onChange={(e) => setTimelineCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-zinc-950/70 border border-zinc-800 rounded-lg p-3 text-xs flex items-center justify-between">
                <div>
                  <p className="text-zinc-400">Monthly Installment Amount</p>
                  <p className="text-base font-bold text-cyan-400 mt-0.5">
                    {formatCurrency(parsedTotal / monthsCount || 0, selectedAccount.currency)} / mo
                  </p>
                </div>
                <div className="text-right text-zinc-500 text-[11px]">
                  <p>1 instant ledger log</p>
                  <p>+{monthsCount - 1} scheduled payments</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-rose-950/40 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Execute Divider
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
