"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { PRESET_CATEGORIES, calculateInstaPayFee } from "@/lib/currencies"
import { CurrencyCode, TransactionType } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Check, Sparkles, Tag, Calendar, Wallet } from "lucide-react"
import { toast } from "sonner"

export default function LogTransactionModal() {
  const {
    activeModal,
    modalProps,
    closeModal,
    accounts,
    activeAccountId,
    addTransaction,
    editTransaction,
  } = useFinance()

  const isOpen = activeModal === "log_transaction"
  const isEditing = Boolean(modalProps?.transaction)
  const existingTx = modalProps?.transaction

  const [type, setType] = useState<TransactionType>(
    existingTx?.type || modalProps?.defaultType || "expense"
  )
  const [title, setTitle] = useState(existingTx?.title || modalProps?.defaultTitle || "")
  const [amount, setAmount] = useState<string>(
    existingTx?.amount ? String(existingTx.amount) : modalProps?.defaultAmount ? String(modalProps.defaultAmount) : ""
  )
  const [accountId, setAccountId] = useState(
    existingTx?.accountId || modalProps?.defaultAccountId || activeAccountId
  )
  const [toAccountId, setToAccountId] = useState(
    existingTx?.toAccountId || accounts.find((a) => a.id !== (existingTx?.accountId || activeAccountId))?.id || ""
  )
  const [category, setCategory] = useState(
    existingTx?.category || modalProps?.defaultCategory || "food"
  )
  const [date, setDate] = useState(
    existingTx?.date || new Date().toISOString().split("T")[0]
  )
  const [notes, setNotes] = useState(existingTx?.notes || "")
  const [isInstaPay, setIsInstaPay] = useState(existingTx?.isInstaPay || false)

  const selectedAccount = accounts.find((a) => a.id === accountId) || accounts[0]
  const parsedAmount = parseFloat(amount) || 0
  const autoFee = isInstaPay ? calculateInstaPayFee(parsedAmount, selectedAccount?.currency) : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Please enter a transaction title or payee")
      return
    }
    if (parsedAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0")
      return
    }

    if (isEditing && existingTx) {
      editTransaction(existingTx.id, {
        title,
        amount: parsedAmount,
        currency: selectedAccount.currency,
        type,
        category: type === "transfer" ? "other" : category,
        accountId,
        toAccountId: type === "transfer" ? toAccountId : undefined,
        date,
        notes,
        isInstaPay,
        instaPayFee: isInstaPay ? autoFee : 0,
      })
      toast.success("Transaction updated successfully")
    } else {
      addTransaction({
        title,
        amount: parsedAmount,
        currency: selectedAccount.currency,
        type,
        category: type === "transfer" ? "other" : category,
        accountId,
        toAccountId: type === "transfer" ? toAccountId : undefined,
        date,
        notes,
        isInstaPay,
        instaPayFee: isInstaPay ? autoFee : 0,
      })
      toast.success(`Logged ${type === "expense" ? "Expense" : type === "income" ? "Income" : "Transfer"}: ${title}`)
    }

    closeModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {isEditing ? "Edit Transaction" : "Quick Log Transaction"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Type Segmented Buttons */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                type === "expense"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                type === "income"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
              Income
            </button>
            <button
              type="button"
              onClick={() => setType("transfer")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                type === "transfer"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
              Transfer
            </button>
          </div>

          {/* Amount Box */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 focus-within:border-zinc-700 transition-colors">
            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
              Amount ({selectedAccount?.currency})
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-zinc-400">
                {selectedAccount?.currency === "EGP" ? "EGP" : "$"}
              </span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-2xl font-bold text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>
            {isInstaPay && autoFee > 0 && (
              <div className="mt-2 text-xs text-amber-400/90 flex items-center justify-between border-t border-zinc-800/80 pt-1.5">
                <span>InstaPay auto-fee:</span>
                <span className="font-semibold">+{autoFee} {selectedAccount?.currency}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Description / Title</label>
            <input
              type="text"
              placeholder="e.g. Grocery Supermarket, Client Retainer..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Account Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">
                {type === "transfer" ? "From Account" : "Account"}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </option>
                ))}
              </select>
            </div>

            {type === "transfer" ? (
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">To Account</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                >
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.currency})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date and InstaPay Checkbox */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex-1">
              <label className="text-xs font-medium text-zinc-300 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
              />
            </div>

            <div className="flex-1 pt-5">
              <label className="flex items-center gap-2 cursor-pointer bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={isInstaPay}
                  onChange={(e) => setIsInstaPay(e.target.checked)}
                  className="rounded border-zinc-700 text-emerald-500 focus:ring-0 w-3.5 h-3.5 bg-zinc-800"
                />
                <div className="text-[11px] leading-tight">
                  <span className="font-medium text-zinc-200">Egypt InstaPay</span>
                  <p className="text-[10px] text-zinc-500">Auto calculate fee</p>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">Memo / Notes (Optional)</label>
            <input
              type="text"
              placeholder="Add details, invoice reference or tags..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              {isEditing ? "Save Changes" : "Confirm Entry"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
