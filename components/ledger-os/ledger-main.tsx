"use client"

import React from "react"
import { useFinance } from "@/lib/context/finance-context"
import HeaderNav from "./header-nav"
import ActiveAccountHero from "./active-account-hero"
import FastLogCard from "./home-tab/fast-log-card"
import QuickPresetsCard from "./home-tab/quick-presets-card"
import CustodialFundsCard from "./home-tab/custodial-funds-card"
import ConsolidatedNetWorth from "./analysis-tab/consolidated-net-worth"
import SpendDistribution from "./analysis-tab/spend-distribution"
import SearchableLedger from "./analysis-tab/searchable-ledger"
import WeeklyBudgetCard from "./control-tab/weekly-budget-card"
import AlertThresholdCard from "./control-tab/alert-threshold-card"
import AccountManagerCard from "./control-tab/account-manager-card"
import SavingsGoalsCard from "./control-tab/savings-goals-card"
import CalendarPlannerView from "./sub-views/calendar-planner-view"
import PlannedPaymentsView from "./sub-views/planned-payments-view"
import MasterModalContainer from "./modals/master-modal-container"

export default function LedgerMain() {
  const { activeTab, subView } = useFinance()

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header Navigation */}
      <HeaderNav />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Render Sub-Views if active */}
        {subView === "calendar" && <CalendarPlannerView />}
        {subView === "planned_payments" && <PlannedPaymentsView />}

        {/* Primary Tabs */}
        {!subView && (
          <>
            {/* 1. HOME TAB */}
            {activeTab === "home" && (
              <div className="space-y-6">
                {/* Active Account Hero Banner with Multi-Currency Matrix & Live Sparkline */}
                <ActiveAccountHero />

                {/* 3-Column Operations Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  {/* Col 1: Fast Log */}
                  <FastLogCard />

                  {/* Col 2: Quick Actions & Presets */}
                  <QuickPresetsCard />

                  {/* Col 3: Held Funds & Custodial Balances */}
                  <CustodialFundsCard />
                </div>
              </div>
            )}

            {/* 2. ANALYSIS TAB */}
            {activeTab === "analysis" && (
              <div className="space-y-6">
                {/* Consolidated Net Worth Multi-Currency Card */}
                <ConsolidatedNetWorth />

                {/* Monthly Summary & Spend Bars */}
                <SpendDistribution />

                {/* Searchable & Filterable Ledger Table */}
                <SearchableLedger />
              </div>
            )}

            {/* 3. CONTROL TAB */}
            {activeTab === "control" && (
              <div className="space-y-6">
                {/* Weekly Spending Limit & Burn-Down Projection Table */}
                <WeeklyBudgetCard />

                {/* Alert Threshold Slider Card */}
                <AlertThresholdCard />

                {/* Account Ordering & Workspace Priority Manager */}
                <AccountManagerCard />

                {/* Savings Goals & Target Milestone Funders */}
                <SavingsGoalsCard />
              </div>
            )}
          </>
        )}
      </main>

      {/* Mount All State Modals */}
      <MasterModalContainer />
    </div>
  )
}
