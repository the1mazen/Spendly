"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { CurrencyCode } from "@/lib/types"
import { PRESET_CATEGORIES } from "@/lib/currencies"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CalendarClock, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function PlannedPaymentModal() {
  const {
    activeModal,
    modalProps,
    closeModal,
    accounts,
    activeAccountId,
    addPlannedPayment,
    updatePlannedPayment,
  } = useFinance()

  const isOpen = activeModal === "planned_payment_modal"
  const isEditing = Boolean(modalProps?.plannedPayment)
  const existing = modalProps?.plannedPayment

  const [title, setTitle] = useState(existing?.title || "")
  const [amount, setAmount] = useState(existing?.amount ? String(existing.amount) : "")
  const [accountId, setAccountId] = useState(existing?.accountId || activeAccountId)
  const [category, setCategory] = useState(existing?.category || "utilities")
  const [dueDate, setDueDate] = useState(
    existing?.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  )
  const [frequency, setFrequency] = useState<"once" | "weekly" | "monthly" | "yearly">(
    existing?.frequency || "monthly"
  )
  const [autoPay, setAutoPay] = useState(existing?.autoPay ?? true)

  const selectedAccount = accounts.find((a) => a.id === accountId) || accounts[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(amount) || 0
    if (!title.trim()) {
      toast.error("Please enter a payment title")
      return
    }
    if (num <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (isEditing && existing) {
      updatePlannedPayment(existing.id, {
        title,
        amount: num,
        currency: selectedAccount.currency,
        accountId,
        category,
        dueDate,
        frequency,
        autoPay,
      })
      toast.success(`Updated planned payment: ${title}`)
    } else {
      addPlannedPayment({
        title,
        amount: num,
        currency: selectedAccount.currency,
        accountId,
        category,
        dueDate,
        frequency,
        isPaid: false,
        autoPay,
      })
      toast.success(`Scheduled planned payment: ${title}`)
    }

    closeModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-cyan-400" />
            {isEditing ? "Edit Planned Payment" : "Schedule Planned Payment / Bill"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Bill / Expense Title</label>
            <input
              type="text"
              placeholder="e.g. Internet Bill, Netflix, Gym Membership, Rent..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">
                Amount ({selectedAccount?.currency})
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-100 focus:outline-none focus:border-zinc-600"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Assigned Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="once">One-Time Only</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly Recurring</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
              >
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={autoPay}
                  onChange={(e) => setAutoPay(e.target.checked)}
                  className="rounded border-zinc-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5 bg-zinc-800"
                />
                <div className="text-[11px] leading-tight">
                  <span className="font-medium text-zinc-200">Auto-Debit Notice</span>
                  <p className="text-[10px] text-zinc-500">Deduct on schedule</p>
                </div>
              </label>
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
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-cyan-950/40 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isEditing ? "Save Payment" : "Add Payment Schedule"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
