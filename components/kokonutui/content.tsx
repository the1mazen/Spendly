"use client"

import React from "react"
import { Calendar, CreditCard, Wallet, BarChart2, Sliders, Receipt, Settings, Sparkles } from "lucide-react"
import List01 from "./list-01"
import List02 from "./list-02"
import List03 from "./list-03"
import ConsolidatedNetWorth from "@/components/ledger-os/analysis-tab/consolidated-net-worth"
import SpendDistribution from "@/components/ledger-os/analysis-tab/spend-distribution"
import SearchableLedger from "@/components/ledger-os/analysis-tab/searchable-ledger"
import WeeklyBudgetCard from "@/components/ledger-os/control-tab/weekly-budget-card"
import AlertThresholdCard from "@/components/ledger-os/control-tab/alert-threshold-card"
import AccountManagerCard from "@/components/ledger-os/control-tab/account-manager-card"
import PlannedPaymentsView from "@/components/ledger-os/sub-views/planned-payments-view"
import { useFinance } from "@/lib/context/finance-context"
import { useRouter } from "next/navigation"

interface ContentProps {
  currentView?: string
  onSelectView?: (view: string) => void
}

export default function Content({ currentView = "dashboard", onSelectView }: ContentProps) {
  const router = useRouter()
  const { userProfile, openModal } = useFinance()

  // 1. ANALYTICS VIEW
  if (currentView === "analytics") {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <ConsolidatedNetWorth />
        <SpendDistribution />
      </div>
    )
  }

  // 2. TRANSACTIONS VIEW
  if (currentView === "transactions") {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <SearchableLedger />
      </div>
    )
  }

  // 3. ACCOUNTS VIEW
  if (currentView === "accounts") {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <AccountManagerCard />
      </div>
    )
  }

  // 4. BUDGETS VIEW
  if (currentView === "budgets") {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <WeeklyBudgetCard />
        <AlertThresholdCard />
      </div>
    )
  }

  // 5. PLANNED PAYMENTS VIEW
  if (currentView === "planned") {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <PlannedPaymentsView />
      </div>
    )
  }

  // 6. SETTINGS & PREFERENCES VIEW
  if (currentView === "settings") {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="rounded-xl border border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#0F0F12] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">User Preferences</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage account identity and system setup</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-xs font-semibold"
            >
              Re-run Onboarding
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800/60">
              <span className="text-gray-500 dark:text-gray-400">Full Name</span>
              <span className="font-semibold text-gray-900 dark:text-white">{userProfile?.fullName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800/60">
              <span className="text-gray-500 dark:text-gray-400">Username</span>
              <span className="font-semibold text-gray-900 dark:text-white">@{userProfile?.username}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800/60">
              <span className="text-gray-500 dark:text-gray-400">Email Address</span>
              <span className="font-semibold text-gray-900 dark:text-white">{userProfile?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-zinc-800/60">
              <span className="text-gray-500 dark:text-gray-400">Home Base Currency</span>
              <span className="font-semibold text-emerald-500 font-mono">{userProfile?.baseCurrency}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // DEFAULT DASHBOARD VIEW (Clean KokonutUI Cards Layout)
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top 2 Cards: Accounts (Left) & Recent Transactions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left: Accounts Card */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 sm:p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23] shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
            <Wallet className="w-4 h-4 text-zinc-900 dark:text-zinc-50" />
            Accounts
          </h2>
          <div className="flex-1">
            <List01 className="h-full border-none shadow-none p-0 bg-transparent dark:bg-transparent" />
          </div>
        </div>

        {/* Right: Recent Transactions Card */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 sm:p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23] shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-zinc-900 dark:text-zinc-50" />
            Recent Transactions
          </h2>
          <div className="flex-1">
            <List02
              className="h-full border-none shadow-none p-0 bg-transparent dark:bg-transparent"
              onViewAll={() => onSelectView && onSelectView("transactions")}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Events / Savings Goals */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-5 sm:p-6 flex flex-col items-start justify-start border border-gray-200 dark:border-[#1F1F23] shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-900 dark:text-zinc-50" />
          Upcoming Events & Goals
        </h2>
        <List03 />
      </div>
    </div>
  )
}
