"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { CurrencyCode, CustodialDirection, CustodialType } from "@/lib/types"
import { formatCurrency } from "@/lib/currencies"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ShieldAlert, Users, Plus, Minus, CheckCircle, Trash2, Calendar, FileText } from "lucide-react"
import { toast } from "sonner"

export default function CustodialModal() {
  const {
    activeModal,
    modalProps,
    closeModal,
    accounts,
    custodialEntries,
    addCustodialEntry,
    updateCustodialEntry,
    deleteCustodialEntry,
    settleCustodialEntry,
    depositToCustodial,
    withdrawFromCustodial,
  } = useFinance()

  const isAddOpen = activeModal === "add_custodial"
  const isDetailsOpen = activeModal === "custodial_details"
  const targetId = modalProps?.id
  const currentEntity = custodialEntries.find((c) => c.id === targetId)

  // Form State for Add
  const [name, setName] = useState("")
  const [type, setType] = useState<CustodialType>("person")
  const [direction, setDirection] = useState<CustodialDirection>("they_owe_me")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<CurrencyCode>("EGP")
  const [accountId, setAccountId] = useState(accounts[0]?.id || "")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")

  // State for Details Actions (Deposit / Withdraw / Settle)
  const [actionAmount, setActionAmount] = useState("")
  const [actionNote, setActionNote] = useState("")

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount) || 0
    if (!name.trim()) {
      toast.error("Please enter a name or entity title")
      return
    }
    if (parsedAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    addCustodialEntry({
      name,
      type,
      direction: type === "hold_fund" ? "held_provision" : direction,
      amount: parsedAmount,
      currency,
      accountId: accountId || undefined,
      description,
      dueDate: dueDate || undefined,
    })

    toast.success(`Created Custodial Entity: ${name}`)
    closeModal()
    setName("")
    setAmount("")
    setDescription("")
  }

  const handleSettle = () => {
    if (!currentEntity) return
    const parsed = parseFloat(actionAmount) || currentEntity.amount
    settleCustodialEntry(currentEntity.id, parsed)
    toast.success(`Settled ${formatCurrency(parsed, currentEntity.currency)} for ${currentEntity.name}`)
    closeModal()
  }

  const handleDeposit = () => {
    if (!currentEntity) return
    const parsed = parseFloat(actionAmount) || 0
    if (parsed <= 0) {
      toast.error("Please enter a valid deposit amount")
      return
    }
    depositToCustodial(currentEntity.id, parsed, actionNote)
    toast.success(`Added ${formatCurrency(parsed, currentEntity.currency)} to ${currentEntity.name}`)
    setActionAmount("")
    setActionNote("")
  }

  const handleWithdraw = () => {
    if (!currentEntity) return
    const parsed = parseFloat(actionAmount) || 0
    if (parsed <= 0 || parsed > currentEntity.amount) {
      toast.error("Invalid withdrawal amount (exceeds balance)")
      return
    }
    withdrawFromCustodial(currentEntity.id, parsed, actionNote)
    toast.success(`Withdrew ${formatCurrency(parsed, currentEntity.currency)} from ${currentEntity.name}`)
    setActionAmount("")
    setActionNote("")
  }

  const handleDelete = () => {
    if (!currentEntity) return
    deleteCustodialEntry(currentEntity.id)
    toast.success(`Removed ${currentEntity.name}`)
    closeModal()
  }

  if (isDetailsOpen && currentEntity) {
    return (
      <Dialog open={isDetailsOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-md bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                {currentEntity.type === "person" ? (
                  <Users className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                )}
                {currentEntity.name}
              </span>
              <button
                type="button"
                onClick={handleDelete}
                className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                title="Delete Entity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Balance Badge Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-medium">
                  {currentEntity.direction === "they_owe_me"
                    ? "They Owe You (Receivable)"
                    : currentEntity.direction === "i_owe_them"
                    ? "You Owe Them (Payable)"
                    : "Held Escrow / Provision"}
                </p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    currentEntity.direction === "they_owe_me"
                      ? "text-emerald-400"
                      : currentEntity.direction === "i_owe_them"
                      ? "text-rose-400"
                      : "text-amber-400"
                  }`}
                >
                  {formatCurrency(currentEntity.amount, currentEntity.currency)}
                </p>
              </div>

              {currentEntity.dueDate && (
                <div className="text-right text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Due
                  </span>
                  <span className="text-zinc-300 font-medium">{currentEntity.dueDate}</span>
                </div>
              )}
            </div>

            {currentEntity.description && (
              <p className="text-xs text-zinc-400 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/60">
                {currentEntity.description}
              </p>
            )}

            {/* Quick Action Input */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 space-y-3">
              <label className="text-xs font-semibold text-zinc-300 block">
                {currentEntity.type === "hold_fund" ? "Adjust Held Balance" : "Record Partial / Full Settlement"}
              </label>

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={`Amount (max ${currentEntity.amount})`}
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                {currentEntity.type === "hold_fund" ? (
                  <>
                    <button
                      type="button"
                      onClick={handleDeposit}
                      className="flex-1 py-1.5 px-3 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/50 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Deposit
                    </button>
                    <button
                      type="button"
                      onClick={handleWithdraw}
                      className="flex-1 py-1.5 px-3 bg-rose-900/40 hover:bg-rose-800/60 text-rose-300 border border-rose-700/50 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                    >
                      <Minus className="w-3.5 h-3.5" /> Release
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleSettle}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {actionAmount ? `Settle ${actionAmount} ${currentEntity.currency}` : "Settle Full Balance"}
                  </button>
                )}
              </div>
            </div>

            {/* History Ledger */}
            {currentEntity.history && currentEntity.history.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Activity History</p>
                <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                  {currentEntity.history.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between text-xs p-2 bg-zinc-900/40 rounded-lg border border-zinc-800/40"
                    >
                      <div>
                        <span className="font-medium text-zinc-300 capitalize">{h.action}</span>
                        <span className="text-[10px] text-zinc-500 ml-2">{h.date}</span>
                        {h.note && <p className="text-[11px] text-zinc-400 mt-0.5">{h.note}</p>}
                      </div>
                      <span className="font-mono font-semibold text-zinc-200">
                        {formatCurrency(h.amount, currentEntity.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isAddOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            Track Custodial / Held Balance
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAddSubmit} className="space-y-4 mt-2">
          {/* Entity Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setType("person")}
              className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 ${
                type === "person"
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Person / Counterparty
            </button>
            <button
              type="button"
              onClick={() => setType("hold_fund")}
              className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 ${
                type === "hold_fund"
                  ? "bg-zinc-800 text-white border border-zinc-700 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Hold Fund / Escrow
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">
              {type === "person" ? "Person's Name" : "Hold Fund Title"}
            </label>
            <input
              type="text"
              placeholder={type === "person" ? "e.g. Khaled, Sarah..." : "e.g. Security Deposit, Tax Escrow"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Direction if Person */}
          {type === "person" && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection("they_owe_me")}
                className={`py-2 px-3 rounded-lg text-xs font-medium border ${
                  direction === "they_owe_me"
                    ? "bg-emerald-950/40 border-emerald-500 text-emerald-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400"
                }`}
              >
                + They Owe Me (Receivable)
              </button>
              <button
                type="button"
                onClick={() => setDirection("i_owe_them")}
                className={`py-2 px-3 rounded-lg text-xs font-medium border ${
                  direction === "i_owe_them"
                    ? "bg-rose-950/40 border-rose-500 text-rose-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400"
                }`}
              >
                - I Owe Them (Payable)
              </button>
            </div>
          )}

          {/* Amount and Currency */}
          <div className="grid grid-cols-[1fr,100px] gap-2">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Amount</label>
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

          {/* Account Tie-in & Due Date */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Impacted Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
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
              <label className="text-xs font-medium text-zinc-400 block mb-1">Settlement / Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">Description / Reason</label>
            <input
              type="text"
              placeholder="e.g. Hardware purchase split, Rental bond escrow..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
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
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-950/40 transition-all"
            >
              Save Custodial Entry
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
