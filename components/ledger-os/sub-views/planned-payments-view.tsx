"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { formatCurrency, convertCurrency, PRESET_CATEGORIES } from "@/lib/currencies"
import {
  CalendarClock,
  ArrowLeft,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  AlertCircle,
  Sparkles,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

export default function PlannedPaymentsView() {
  const {
    setSubView,
    plannedPayments,
    markPlannedPaymentPaid,
    deletePlannedPayment,
    openModal,
    accounts,
    baseCurrency,
  } = useFinance()

  const [tabFilter, setTabFilter] = useState<"unpaid" | "paid" | "all">("unpaid")

  const filtered = plannedPayments.filter((p) => {
    if (tabFilter === "unpaid") return !p.isPaid
    if (tabFilter === "paid") return p.isPaid
    return true
  })

  // Total unpaid obligations
  const totalUnpaid = plannedPayments
    .filter((p) => !p.isPaid)
    .reduce((sum, p) => sum + convertCurrency(p.amount, p.currency, baseCurrency), 0)

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Return Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSubView(null)}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-cyan-400" />
              Planned Payments & Recurring Bills Schedule
            </h1>
            <p className="text-xs text-zinc-400">
              Manage scheduled obligations, automatic deductions, and upcoming bills
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openModal("planned_payment_modal")}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Bill / Payment</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-cyan-400 font-semibold uppercase">Pending Commitments</span>
            <p className="text-2xl font-bold text-white font-mono mt-1">
              {formatCurrency(totalUnpaid, baseCurrency)}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-400 font-semibold uppercase">Unpaid Schedules</span>
            <p className="text-2xl font-bold text-amber-300 font-mono mt-1">
              {plannedPayments.filter((p) => !p.isPaid).length} Bills Due
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 font-semibold uppercase">Auto-Debit Enabled</span>
            <p className="text-2xl font-bold text-emerald-300 font-mono mt-1">
              {plannedPayments.filter((p) => p.autoPay).length} Active
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-0.5 rounded-xl bg-zinc-900 border border-zinc-800 w-fit text-xs">
        <button
          type="button"
          onClick={() => setTabFilter("unpaid")}
          className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
            tabFilter === "unpaid" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400"
          }`}
        >
          Upcoming & Due ({plannedPayments.filter((p) => !p.isPaid).length})
        </button>
        <button
          type="button"
          onClick={() => setTabFilter("paid")}
          className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
            tabFilter === "paid" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400"
          }`}
        >
          Paid History ({plannedPayments.filter((p) => p.isPaid).length})
        </button>
        <button
          type="button"
          onClick={() => setTabFilter("all")}
          className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
            tabFilter === "all" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400"
          }`}
        >
          All ({plannedPayments.length})
        </button>
      </div>

      {/* Payments Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-zinc-500 text-sm">
            No planned payments found for this filter.
          </div>
        ) : (
          filtered.map((plan) => {
            const acc = accounts.find((a) => a.id === plan.accountId)
            const catObj = PRESET_CATEGORIES.find((c) => c.id === plan.category)

            return (
              <div
                key={plan.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  plan.isPaid
                    ? "bg-zinc-950/40 border-zinc-800/40 opacity-70"
                    : "bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 shadow-xl"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: catObj?.color || "#38bdf8" }}
                        />
                        <h3 className="text-sm font-bold text-white">{plan.title}</h3>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {acc?.name} • <span className="capitalize">{plan.frequency} cycle</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-bold text-white font-mono">
                        {formatCurrency(plan.amount, plan.currency)}
                      </p>
                      {plan.isPaid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50 mt-1">
                          <CheckCircle2 className="w-3 h-3" /> Paid & Logged
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/50 mt-1">
                          <Clock className="w-3 h-3" /> Due {plan.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    {plan.autoPay && (
                      <span className="flex items-center gap-1 text-cyan-400 text-[11px]">
                        <Zap className="w-3.5 h-3.5" /> Auto-Debit Notice
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!plan.isPaid && (
                      <button
                        type="button"
                        onClick={() => {
                          markPlannedPaymentPaid(plan.id)
                          toast.success(`Paid & recorded "${plan.title}" to transaction ledger`)
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Paid & Deduct</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete payment schedule "${plan.title}"?`)) {
                          deletePlannedPayment(plan.id)
                          toast.success("Schedule deleted")
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-950/60 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
