"use client"

import React, { useState, useMemo } from "react"
import { useFinance } from "@/lib/context/finance-context"
import { PRESET_CATEGORIES, formatCurrency, convertCurrency } from "@/lib/currencies"
import { Transaction } from "@/lib/types"
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Edit2,
  Trash2,
  Download,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

export default function SearchableLedger() {
  const { transactions, accounts, deleteTransaction, openModal, baseCurrency } = useFinance()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [selectedType, setSelectedType] = useState<"all" | "expense" | "income" | "transfer">("all")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = t.title.toLowerCase().includes(q)
        const matchNotes = t.notes?.toLowerCase().includes(q)
        const matchCategory = t.category.toLowerCase().includes(q)
        if (!matchTitle && !matchNotes && !matchCategory) return false
      }

      // Category filter
      if (selectedCategory !== "all" && t.category !== selectedCategory) return false

      // Account filter
      if (selectedAccount !== "all" && t.accountId !== selectedAccount && t.toAccountId !== selectedAccount)
        return false

      // Type filter
      if (selectedType !== "all" && t.type !== selectedType) return false

      // Amount filter
      if (minAmount && t.amount < parseFloat(minAmount)) return false
      if (maxAmount && t.amount > parseFloat(maxAmount)) return false

      return true
    })
  }, [transactions, searchQuery, selectedCategory, selectedAccount, selectedType, minAmount, maxAmount])

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleExportCSV = () => {
    const headers = ["ID", "Date", "Title", "Type", "Amount", "Currency", "Category", "Account", "InstaPay", "Notes"]
    const rows = filteredTransactions.map((t) => {
      const acc = accounts.find((a) => a.id === t.accountId)?.name || t.accountId
      return [
        t.id,
        t.date,
        `"${t.title.replace(/"/g, '""')}"`,
        t.type,
        t.amount,
        t.currency,
        t.category,
        `"${acc.replace(/"/g, '""')}"`,
        t.isInstaPay ? "Yes" : "No",
        `"${(t.notes || "").replace(/"/g, '""')}"`,
      ]
    })

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `spendly_ledger_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filteredTransactions.length} transactions to CSV`)
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Searchable Transaction Ledger</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
              {filteredTransactions.length} records
            </span>
          </h2>
          <p className="text-[11px] text-zinc-400">Filter, search keywords, inline edits and ledger exports</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showFilters
                ? "bg-zinc-800 border-zinc-700 text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by payee, description, note, or category..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setCurrentPage(1)
          }}
          className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
        />
      </div>

      {/* Expandable Multi-Filter Drawer */}
      {showFilters && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
          <div>
            <label className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as any)
                setCurrentPage(1)
              }}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="expense">Expense Only</option>
              <option value="income">Income Only</option>
              <option value="transfer">Transfer Only</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {PRESET_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-1.5">
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">Min Amt</label>
              <input
                type="number"
                placeholder="Min"
                value={minAmount}
                onChange={(e) => {
                  setMinAmount(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">Max Amt</label>
              <input
                type="number"
                placeholder="Max"
                value={maxAmount}
                onChange={(e) => {
                  setMaxAmount(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Transaction</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-medium">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  No matching transactions found.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => {
                const acc = accounts.find((a) => a.id === tx.accountId)
                const catObj = PRESET_CATEGORIES.find((c) => c.id === tx.category)

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-zinc-900/50 transition-colors group"
                  >
                    {/* Title & Memo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg ${
                            tx.type === "income"
                              ? "bg-emerald-950/60 text-emerald-400"
                              : tx.type === "expense"
                              ? "bg-rose-950/60 text-rose-400"
                              : "bg-cyan-950/60 text-cyan-400"
                          }`}
                        >
                          {tx.type === "income" ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : tx.type === "expense" ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div>
                          <p className="font-semibold text-zinc-200 group-hover:text-white">
                            {tx.title}
                          </p>
                          {tx.notes && (
                            <p className="text-[11px] text-zinc-500 truncate max-w-xs">{tx.notes}</p>
                          )}
                          {tx.isInstaPay && (
                            <span className="inline-block text-[10px] text-amber-400/90 font-mono mt-0.5">
                              ⚡ InstaPay {tx.instaPayFee ? `(+${tx.instaPayFee} fee)` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Account */}
                    <td className="py-3 px-4 text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: acc?.color || "#fff" }} />
                        <span className="truncate">{acc?.name || "Account"}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-300">
                        <span
                          className="w-1.5 h-1.5 rounded-full mr-1.5"
                          style={{ backgroundColor: catObj?.color || "#71717a" }}
                        />
                        {catObj?.name || tx.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-mono font-bold text-xs ${
                          tx.type === "income"
                            ? "text-emerald-400"
                            : tx.type === "expense"
                            ? "text-rose-400"
                            : "text-cyan-400"
                        }`}
                      >
                        {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : "⇄ "}
                        {formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openModal("log_transaction", { transaction: tx })}
                          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          title="Edit Transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete transaction "${tx.title}"?`)) {
                              deleteTransaction(tx.id)
                              toast.success("Transaction deleted")
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2 text-xs text-zinc-400">
        <span>
          Page {currentPage} of {totalPages}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-40 hover:bg-zinc-800 text-zinc-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-40 hover:bg-zinc-800 text-zinc-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
