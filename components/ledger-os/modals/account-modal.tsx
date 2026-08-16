"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { CurrencyCode } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Wallet, Plus, Trash2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

const ACCOUNT_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#71717a", // zinc
]

export default function AccountModal() {
  const {
    activeModal,
    modalProps,
    closeModal,
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
  } = useFinance()

  const isOpen = activeModal === "account_modal"
  const isEditing = Boolean(modalProps?.account)
  const existingAcc = modalProps?.account

  const [name, setName] = useState(existingAcc?.name || "")
  const [type, setType] = useState<"bank" | "wallet" | "cash" | "crypto" | "savings">(
    existingAcc?.type || "bank"
  )
  const [currency, setCurrency] = useState<CurrencyCode>(existingAcc?.currency || "EGP")
  const [initialBalance, setInitialBalance] = useState(
    existingAcc?.initialBalance !== undefined ? String(existingAcc.initialBalance) : ""
  )
  const [color, setColor] = useState(existingAcc?.color || ACCOUNT_COLORS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Please enter an account name")
      return
    }
    const balanceNum = parseFloat(initialBalance) || 0

    if (isEditing && existingAcc) {
      updateAccount(existingAcc.id, {
        name,
        type,
        currency,
        initialBalance: balanceNum,
        color,
      })
      toast.success(`Updated account: ${name}`)
    } else {
      addAccount({
        name,
        type,
        currency,
        initialBalance: balanceNum,
        color,
        isDefault: accounts.length === 0,
        isHidden: false,
      })
      toast.success(`Created account: ${name}`)
    }

    closeModal()
  }

  const handleDelete = () => {
    if (!existingAcc) return
    if (accounts.length <= 1) {
      toast.error("You must have at least one account")
      return
    }
    deleteAccount(existingAcc.id)
    toast.success(`Deleted account: ${existingAcc.name}`)
    closeModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              {isEditing ? "Edit Account" : "Add New Account"}
            </span>
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-zinc-500 hover:text-rose-400 p-1"
                title="Delete Account"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Account Name</label>
            <input
              type="text"
              placeholder="e.g. CIB Smart Current, Vodafone Cash, Wise..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Account Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="bank">Bank Account</option>
                <option value="wallet">Digital Wallet</option>
                <option value="cash">Physical Cash</option>
                <option value="savings">High-Yield Savings</option>
                <option value="crypto">Crypto Wallet</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="EGP">EGP - Egyptian Pound</option>
                <option value="USD">USD - US Dollar</option>
                <option value="AED">AED - UAE Dirham</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">
              Starting Baseline Balance ({currency})
            </label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-100 focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Color theme selection */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1.5">Card Accent Color</label>
            <div className="flex items-center gap-2">
              {ACCOUNT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-950" : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
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
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isEditing ? "Save Changes" : "Create Account"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
