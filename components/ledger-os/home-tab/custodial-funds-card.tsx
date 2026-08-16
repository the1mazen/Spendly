"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { formatCurrency, convertCurrency } from "@/lib/currencies"
import { CustodialType } from "@/lib/types"
import { ShieldAlert, Users, Plus, ArrowRight, CheckCircle2, ChevronRight, Lock } from "lucide-react"

export default function CustodialFundsCard() {
  const { custodialEntries, openModal, baseCurrency } = useFinance()
  const [filterType, setFilterType] = useState<"all" | CustodialType>("all")

  const filtered = custodialEntries.filter((item) => {
    if (filterType === "all") return true
    return item.type === filterType
  })

  // Total Held / Owed calculations
  const totalReceivable = custodialEntries
    .filter((c) => c.direction === "they_owe_me")
    .reduce((sum, c) => sum + convertCurrency(c.amount, c.currency, baseCurrency), 0)

  const totalPayable = custodialEntries
    .filter((c) => c.direction === "i_owe_them")
    .reduce((sum, c) => sum + convertCurrency(c.amount, c.currency, baseCurrency), 0)

  const totalHeldProvision = custodialEntries
    .filter((c) => c.direction === "held_provision")
    .reduce((sum, c) => sum + convertCurrency(c.amount, c.currency, baseCurrency), 0)

  return (
    <div className="flex flex-col h-full rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 backdrop-blur-xl shadow-xl">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Held Funds & Custodial</h2>
            <p className="text-[11px] text-zinc-400">Escrow balances, provisions & IOUs</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openModal("add_custodial")}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
          title="Add Custodial Entity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Summary KPI Mini Badges */}
      <div className="grid grid-cols-3 gap-1.5 mb-3 text-xs">
        <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] text-emerald-400 font-medium block">Owed to You</span>
          <span className="font-mono font-bold text-emerald-300 text-xs">
            +{formatCurrency(totalReceivable, baseCurrency, { compact: true })}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] text-rose-400 font-medium block">You Owe</span>
          <span className="font-mono font-bold text-rose-300 text-xs">
            -{formatCurrency(totalPayable, baseCurrency, { compact: true })}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] text-amber-400 font-medium block">Locked Escrow</span>
          <span className="font-mono font-bold text-amber-300 text-xs">
            {formatCurrency(totalHeldProvision, baseCurrency, { compact: true })}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-0.5 rounded-lg bg-zinc-900/80 border border-zinc-800 mb-3 text-xs">
        <button
          type="button"
          onClick={() => setFilterType("all")}
          className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all ${
            filterType === "all" ? "bg-zinc-800 text-white font-semibold shadow-sm" : "text-zinc-400"
          }`}
        >
          All ({custodialEntries.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("person")}
          className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all flex items-center justify-center gap-1 ${
            filterType === "person" ? "bg-zinc-800 text-white font-semibold shadow-sm" : "text-zinc-400"
          }`}
        >
          <Users className="w-3 h-3 text-blue-400" />
          Persons
        </button>
        <button
          type="button"
          onClick={() => setFilterType("hold_fund")}
          className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all flex items-center justify-center gap-1 ${
            filterType === "hold_fund" ? "bg-zinc-800 text-white font-semibold shadow-sm" : "text-zinc-400"
          }`}
        >
          <Lock className="w-3 h-3 text-amber-400" />
          Hold Funds
        </button>
      </div>

      {/* Entity List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-56">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No custodial balances or hold funds tracked.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => openModal("custodial_details", { id: item.id })}
              className="group flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-850 border border-zinc-800/60 hover:border-zinc-700 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-1.5 rounded-lg ${
                    item.type === "person"
                      ? item.direction === "they_owe_me"
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                        : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                      : "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                  }`}
                >
                  {item.type === "person" ? <Users className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {item.description || (item.type === "person" ? "Peer IOU" : "Hold Reserve")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pl-2 text-right">
                <span
                  className={`font-mono text-xs font-bold ${
                    item.direction === "they_owe_me"
                      ? "text-emerald-400"
                      : item.direction === "i_owe_them"
                      ? "text-rose-400"
                      : "text-amber-400"
                  }`}
                >
                  {item.direction === "they_owe_me" ? "+" : item.direction === "i_owe_them" ? "-" : "🔒 "}
                  {formatCurrency(item.amount, item.currency)}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-2 text-center border-t border-zinc-800/60 mt-2">
        <button
          type="button"
          onClick={() => openModal("add_custodial")}
          className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center justify-center gap-1 w-full"
        >
          <span>+ Add Person IOU or Hold Provision</span>
        </button>
      </div>
    </div>
  )
}
