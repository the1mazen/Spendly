"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { convertCurrency, CURRENCY_CONFIGS, formatCurrency } from "@/lib/currencies"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ArrowRight, ArrowLeftRight, Check, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function TransferModal() {
  const { activeModal, closeModal, accounts, activeAccountId, transferFunds } = useFinance()
  const isOpen = activeModal === "transfer_modal"

  const defaultFrom = accounts.find((a) => a.id === activeAccountId) || accounts[0]
  const defaultTo = accounts.find((a) => a.id !== defaultFrom?.id) || accounts[1] || accounts[0]

  const [fromAccountId, setFromAccountId] = useState(defaultFrom?.id || "")
  const [toAccountId, setToAccountId] = useState(defaultTo?.id || "")
  const [amount, setAmount] = useState("")
  const [fee, setFee] = useState("0")
  const [notes, setNotes] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const fromAcc = accounts.find((a) => a.id === fromAccountId) || accounts[0]
  const toAcc = accounts.find((a) => a.id === toAccountId) || accounts[1]

  const parsedAmount = parseFloat(amount) || 0
  const parsedFee = parseFloat(fee) || 0

  // Live conversion rate & target amount
  const targetAmount = fromAcc && toAcc ? convertCurrency(parsedAmount, fromAcc.currency, toAcc.currency) : 0
  const rate1Unit = fromAcc && toAcc ? convertCurrency(1, fromAcc.currency, toAcc.currency) : 1

  const handleSwap = () => {
    const temp = fromAccountId
    setFromAccountId(toAccountId)
    setToAccountId(temp)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (fromAccountId === toAccountId) {
      toast.error("Source and destination accounts cannot be the same")
      return
    }
    if (parsedAmount <= 0) {
      toast.error("Please enter a valid transfer amount")
      return
    }

    transferFunds({
      fromAccountId,
      toAccountId,
      amount: parsedAmount,
      targetAmount,
      fee: parsedFee,
      notes: notes || `Transfer from ${fromAcc?.name} to ${toAcc?.name}`,
      date,
    })

    toast.success(
      `Transferred ${formatCurrency(parsedAmount, fromAcc?.currency)} ➔ ${formatCurrency(
        targetAmount,
        toAcc?.currency
      )}`
    )
    closeModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
            Inter-Account Transfer & FX
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* From / To selector with swap button */}
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase block mb-1">From Account</label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-zinc-200 focus:outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id} className="bg-zinc-900 text-zinc-200">
                    {a.name} ({a.currency})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSwap}
              className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-zinc-700"
              title="Swap From and To"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase block mb-1">To Account</label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-zinc-200 focus:outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id} className="bg-zinc-900 text-zinc-200">
                    {a.name} ({a.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount input */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Send Amount ({fromAcc?.currency})
              </label>
              <span className="text-[11px] text-zinc-500 font-mono">
                1 {fromAcc?.currency} = {rate1Unit} {toAcc?.currency}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-2xl font-bold text-white placeholder-zinc-600 focus:outline-none"
              />
              <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded font-semibold">
                {fromAcc?.currency}
              </span>
            </div>
          </div>

          {/* Destination Converted Output Preview */}
          <div className="bg-gradient-to-br from-cyan-950/30 to-blue-950/20 border border-cyan-800/40 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-cyan-300 font-medium">Estimated Destination Credit</p>
              <p className="text-xl font-bold text-cyan-200 mt-0.5">
                {formatCurrency(targetAmount, toAcc?.currency)}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-cyan-400/80" />
          </div>

          {/* Transfer Fee & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">
                Transfer Fee ({fromAcc?.currency})
              </label>
              <input
                type="number"
                step="any"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Transfer Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">Memo / Reference</label>
            <input
              type="text"
              placeholder="e.g. Monthly savings transfer, FX conversion..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-cyan-950/40 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Confirm Transfer
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
