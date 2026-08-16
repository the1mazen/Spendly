"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { formatCurrency, convertCurrency } from "@/lib/currencies"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  Sparkles,
} from "lucide-react"

export default function CalendarPlannerView() {
  const {
    setSubView,
    transactions,
    plannedPayments,
    baseCurrency,
    openModal,
    accounts,
  } = useFinance()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split("T")[0])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // First day of the month & total days
  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Aggregate transactions and planned bills per day for this month
  const daysMap: {
    [dateStr: string]: {
      expenses: number
      income: number
      planned: typeof plannedPayments
      txs: typeof transactions
    }
  } = {}

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    daysMap[dayStr] = {
      expenses: 0,
      income: 0,
      planned: [],
      txs: [],
    }
  }

  transactions.forEach((t) => {
    if (daysMap[t.date]) {
      const converted = convertCurrency(t.amount, t.currency, baseCurrency)
      if (t.type === "expense") daysMap[t.date].expenses += converted
      if (t.type === "income") daysMap[t.date].income += converted
      daysMap[t.date].txs.push(t)
    }
  })

  plannedPayments.forEach((p) => {
    if (daysMap[p.dueDate]) {
      daysMap[p.dueDate].planned.push(p)
    }
  })

  const selectedDayData = daysMap[selectedDay] || { expenses: 0, income: 0, planned: [], txs: [] }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Return Navigation */}
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
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
              Calendar Expense Planner
            </h1>
            <p className="text-xs text-zinc-400">Map cashflow, daily spend density and upcoming obligations</p>
          </div>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const todayStr = new Date().toISOString().split("T")[0]
              setCurrentDate(new Date())
              setSelectedDay(todayStr)
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300"
          >
            Today
          </button>

          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-zinc-200 min-w-[130px] text-center font-mono">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Grid (Left) + Selected Day Inspector Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6 items-start">
        {/* Calendar Month Matrix */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 backdrop-blur-xl shadow-2xl space-y-3">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wider pb-2 border-b border-zinc-800">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty prefix slots */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[85px] rounded-xl bg-zinc-900/10 border border-transparent" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1
              const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
              const isSelected = selectedDay === dayStr
              const isToday = new Date().toISOString().split("T")[0] === dayStr
              const data = daysMap[dayStr] || { expenses: 0, income: 0, planned: [], txs: [] }

              return (
                <div
                  key={dayStr}
                  onClick={() => setSelectedDay(dayStr)}
                  className={`min-h-[85px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-indigo-950/50 border-indigo-500 shadow-md ring-1 ring-indigo-500"
                      : "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono ${
                        isToday
                          ? "w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center"
                          : isSelected
                          ? "text-indigo-300"
                          : "text-zinc-400"
                      }`}
                    >
                      {dayNum}
                    </span>

                    {data.planned.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-cyan-950" title="Planned payment due" />
                    )}
                  </div>

                  {/* Daily Badges / Totals */}
                  <div className="space-y-0.5 text-[10px] font-mono">
                    {data.expenses > 0 && (
                      <div className="text-rose-400 font-semibold truncate">
                        -{formatCurrency(data.expenses, baseCurrency, { compact: true, hideDecimals: true })}
                      </div>
                    )}
                    {data.income > 0 && (
                      <div className="text-emerald-400 font-semibold truncate">
                        +{formatCurrency(data.income, baseCurrency, { compact: true, hideDecimals: true })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Day Inspector Card */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                Inspecting Date
              </span>
              <h3 className="text-sm font-bold text-white font-mono">{selectedDay}</h3>
            </div>

            <button
              type="button"
              onClick={() => openModal("log_transaction", { defaultDate: selectedDay })}
              className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/40 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log For Day</span>
            </button>
          </div>

          {/* Daily Net Flow */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block uppercase font-sans">Spent Today</span>
              <span className="font-bold text-rose-400">
                {formatCurrency(selectedDayData.expenses, baseCurrency)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block uppercase font-sans">Income Today</span>
              <span className="font-bold text-emerald-400">
                {formatCurrency(selectedDayData.income, baseCurrency)}
              </span>
            </div>
          </div>

          {/* Scheduled Bills For Day */}
          {selectedDayData.planned.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" /> Scheduled Bills Due
              </span>
              <div className="space-y-1.5">
                {selectedDayData.planned.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-zinc-200">{p.title}</p>
                      <p className="text-[10px] text-zinc-400 capitalize">{p.frequency} payment</p>
                    </div>
                    <span className="font-mono font-bold text-cyan-300">
                      {formatCurrency(p.amount, p.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actual Logged Transactions For Day */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-300">Logged Transactions</span>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {selectedDayData.txs.length === 0 ? (
                <p className="text-xs text-zinc-500 py-3 text-center">No transactions recorded on this date.</p>
              ) : (
                selectedDayData.txs.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-zinc-200">{t.title}</p>
                      <p className="text-[10px] text-zinc-400 capitalize">{t.category}</p>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        t.type === "income" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount, t.currency)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
