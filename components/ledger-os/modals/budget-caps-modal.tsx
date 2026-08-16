"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { PRESET_CATEGORIES, formatCurrency, convertCurrency } from "@/lib/currencies"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ShieldCheck, Sliders, AlertTriangle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function BudgetCapsModal() {
  const {
    activeModal,
    closeModal,
    categoryCaps,
    updateCategoryCap,
    transactions,
    baseCurrency,
  } = useFinance()

  const isOpen = activeModal === "budget_caps"

  // Local state for caps
  const [caps, setCaps] = useState<{ [category: string]: number }>(() => {
    const map: { [category: string]: number } = {}
    PRESET_CATEGORIES.forEach((cat) => {
      const existing = categoryCaps.find((c) => c.category === cat.id)
      map[cat.id] = existing ? existing.monthlyCap : 5000
    })
    return map
  })

  // Calculate actual spend per category for this month
  const currentMonth = new Date().toISOString().substring(0, 7)
  const categoryMonthlySpend: { [cat: string]: number } = {}

  transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
    .forEach((t) => {
      const converted = convertCurrency(t.amount, t.currency, baseCurrency)
      categoryMonthlySpend[t.category] = (categoryMonthlySpend[t.category] || 0) + converted
    })

  const handleCapChange = (catId: string, val: string) => {
    const num = parseFloat(val) || 0
    setCaps((prev) => ({ ...prev, [catId]: num }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    Object.entries(caps).forEach(([catId, amount]) => {
      updateCategoryCap(catId, amount, baseCurrency)
    })
    toast.success("Budget Category Caps updated successfully")
    closeModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-xl bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Category Budget Caps & Thresholds ({baseCurrency})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 mt-2">
          <p className="text-xs text-zinc-400">
            Set maximum monthly spend limits per category. Real-time alert badges trigger when spending exceeds 80% or 100% of limits.
          </p>

          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {PRESET_CATEGORIES.map((cat) => {
              const capValue = caps[cat.id] || 0
              const spent = categoryMonthlySpend[cat.id] || 0
              const pct = capValue > 0 ? Math.min(150, Math.round((spent / capValue) * 100)) : 0
              const isOver = capValue > 0 && spent > capValue
              const isWarning = capValue > 0 && spent >= capValue * 0.8 && !isOver

              return (
                <div
                  key={cat.id}
                  className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-3 space-y-2 hover:border-zinc-700/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs font-semibold text-zinc-200">{cat.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOver && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Exceeded ({pct}%)
                        </span>
                      )}
                      {isWarning && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                          {pct}% Used
                        </span>
                      )}
                      {!isOver && !isWarning && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-400">
                          {pct}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr,160px] gap-3 items-center">
                    {/* Visual Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                        <span>Spent: {formatCurrency(spent, baseCurrency)}</span>
                        <span>Remaining: {formatCurrency(Math.max(0, capValue - spent), baseCurrency)}</span>
                      </div>
                    </div>

                    {/* Cap Input */}
                    <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-700/80 rounded-lg px-2 py-1">
                      <span className="text-[11px] text-zinc-400 font-medium">Cap:</span>
                      <input
                        type="number"
                        step="any"
                        value={capValue}
                        onChange={(e) => handleCapChange(cat.id, e.target.value)}
                        className="w-full bg-transparent text-right text-xs font-bold text-white focus:outline-none"
                      />
                      <span className="text-[10px] text-zinc-500">{baseCurrency}</span>
                    </div>
                  </div>
                </div>
              )
            })}
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
              Save Budget Caps
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
