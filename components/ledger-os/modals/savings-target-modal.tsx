"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { CurrencyCode } from "@/lib/types"
import { formatCurrency } from "@/lib/currencies"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Target, PiggyBank, PlusCircle, Trash2, Calendar, TrendingUp } from "lucide-react"
import { toast } from "sonner"

export default function SavingsTargetModal() {
  const {
    activeModal,
    modalProps,
    closeModal,
    accounts,
    savingsTargets,
    addSavingsTarget,
    deleteSavingsTarget,
    contributeToSavings,
  } = useFinance()

  const isOpen = activeModal === "savings_target"
  const isContributeMode = modalProps?.mode === "contribute"
  const targetGoal = savingsTargets.find((s) => s.id === modalProps?.id)

  // Add Target Form State
  const [title, setTitle] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [currency, setCurrency] = useState<CurrencyCode>("EGP")
  const [deadline, setDeadline] = useState("")
  const [targetAccountId, setTargetAccountId] = useState(accounts[0]?.id || "")
  const [category, setCategory] = useState("Long-term Savings")

  // Contribution State
  const [contribAmount, setContribAmount] = useState("")
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || "")

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetAmt = parseFloat(targetAmount) || 0
    const curAmt = parseFloat(currentAmount) || 0

    if (!title.trim()) {
      toast.error("Please enter a goal title")
      return
    }
    if (targetAmt <= 0) {
      toast.error("Please enter a valid target goal amount")
      return
    }

    addSavingsTarget({
      title,
      targetAmount: targetAmt,
      currentAmount: curAmt,
      currency,
      deadline: deadline || new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
      targetAccountId,
      category,
    })

    toast.success(`Created Savings Goal: ${title}`)
    closeModal()
    setTitle("")
    setTargetAmount("")
    setCurrentAmount("")
  }

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetGoal) return
    const amt = parseFloat(contribAmount) || 0
    if (amt <= 0) {
      toast.error("Please enter a valid contribution amount")
      return
    }

    contributeToSavings(targetGoal.id, amt, fromAccountId)
    toast.success(`Funded ${formatCurrency(amt, accounts.find((a) => a.id === fromAccountId)?.currency)} to ${targetGoal.title}`)
    closeModal()
  }

  const handleDeleteGoal = () => {
    if (!targetGoal) return
    deleteSavingsTarget(targetGoal.id)
    toast.success(`Deleted goal: ${targetGoal.title}`)
    closeModal()
  }

  if (isContributeMode && targetGoal) {
    const fromAccount = accounts.find((a) => a.id === fromAccountId) || accounts[0]
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-md bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-400" />
                Fund Savings Goal
              </span>
              <button
                type="button"
                onClick={handleDeleteGoal}
                className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                title="Delete Goal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleContributeSubmit} className="space-y-4 mt-2">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4">
              <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
                <span>{targetGoal.title}</span>
                <span className="font-semibold text-zinc-200">
                  {Math.round((targetGoal.currentAmount / targetGoal.targetAmount) * 100)}% Funded
                </span>
              </div>
              <p className="text-xl font-bold text-emerald-400">
                {formatCurrency(targetGoal.currentAmount, targetGoal.currency)} /{" "}
                <span className="text-zinc-500 font-normal text-sm">
                  {formatCurrency(targetGoal.targetAmount, targetGoal.currency)}
                </span>
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Fund From Account</label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">
                Contribution Amount ({fromAccount?.currency})
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={contribAmount}
                onChange={(e) => setContribAmount(e.target.value)}
                autoFocus
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-base font-bold text-white focus:outline-none focus:border-zinc-600"
              />
            </div>

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
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Deposit Funds
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Create New Savings Target
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAddSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Target Name</label>
            <input
              type="text"
              placeholder="e.g. MacBook Pro M4, Vacation Fund, Emergency Buffer..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Target Amount</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-100 focus:outline-none focus:border-zinc-600"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="EGP">EGP</option>
                <option value="USD">USD</option>
                <option value="AED">AED</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Initial Saved (Optional)</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Deadline Date</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Assigned Account</label>
              <select
                value={targetAccountId}
                onChange={(e) => setTargetAccountId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Category Tag</label>
              <input
                type="text"
                placeholder="e.g. Travel, Tech, Safety..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

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
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-purple-950/40 transition-all flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              Save Target Goal
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
