"use client"

import React from "react"
import { useFinance } from "@/lib/context/finance-context"
import { ALL_CURRENCIES, CURRENCY_CONFIGS, convertCurrency } from "@/lib/currencies"
import { ActiveTab, CurrencyCode } from "@/lib/types"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Wallet,
  TrendingUp,
  Sliders,
  Calendar,
  CalendarClock,
  Plus,
  ArrowRightLeft,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Bell,
  Coins,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Image from "next/image"
import { toast } from "sonner"

export default function HeaderNav() {
  const {
    activeTab,
    setActiveTab,
    subView,
    setSubView,
    baseCurrency,
    setBaseCurrency,
    openModal,
    resetToDemoData,
    plannedPayments,
    transactions,
  } = useFinance()

  const pendingBillsCount = plannedPayments.filter((p) => !p.isPaid).length

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl shadow-lg">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6">
        {/* Left: Brand & Primary Segmented Tab Switcher */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Logo / Brand */}
          <div
            onClick={() => {
              setSubView(null)
              setActiveTab("home")
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-md shadow-emerald-950/50 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Spendly OS
              </span>
              <span className="block text-[10px] text-zinc-500 font-mono leading-none">
                Enterprise Ledger
              </span>
            </div>
          </div>

          {/* Primary Segmented Tabs Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900/90 border border-zinc-800/80 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setSubView(null)
                setActiveTab("home")
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "home" && !subView
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/80 text-emerald-400"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <Wallet className={`w-3.5 h-3.5 ${activeTab === "home" && !subView ? "text-emerald-400" : ""}`} />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubView(null)
                setActiveTab("analysis")
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "analysis" && !subView
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/80 text-cyan-400"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <TrendingUp className={`w-3.5 h-3.5 ${activeTab === "analysis" && !subView ? "text-cyan-400" : ""}`} />
              <span>Analysis</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubView(null)
                setActiveTab("control")
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === "control" && !subView
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/80 text-purple-400"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              <Sliders className={`w-3.5 h-3.5 ${activeTab === "control" && !subView ? "text-purple-400" : ""}`} />
              <span>Control</span>
            </button>
          </div>

          {/* Sub-Views Direct Buttons */}
          <div className="hidden lg:flex items-center gap-1 border-l border-zinc-800 pl-3">
            <button
              type="button"
              onClick={() => setSubView("calendar")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                subView === "calendar"
                  ? "bg-indigo-950/60 text-indigo-300 border border-indigo-700/60"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => setSubView("planned_payments")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors relative ${
                subView === "planned_payments"
                  ? "bg-cyan-950/60 text-cyan-300 border border-cyan-700/60"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Planned Bills</span>
              {pendingBillsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] flex items-center justify-center font-mono">
                  {pendingBillsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Controls: Live Currency Rates Ticker, Base Currency Switcher, + Log Button, Notifications, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Base Currency Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 focus:outline-none transition-colors">
              <span>{CURRENCY_CONFIGS[baseCurrency].flag}</span>
              <span className="font-semibold">{baseCurrency}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-200 w-44">
              <DropdownMenuLabel className="text-[11px] text-zinc-400">Home Base Currency</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              {ALL_CURRENCIES.map((curr) => (
                <DropdownMenuItem
                  key={curr}
                  onClick={() => {
                    setBaseCurrency(curr)
                    toast.success(`Home base currency set to ${curr}`)
                  }}
                  className={`flex items-center justify-between text-xs cursor-pointer ${
                    baseCurrency === curr ? "bg-zinc-800 text-emerald-400 font-semibold" : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{CURRENCY_CONFIGS[curr].flag}</span>
                    <span>{CURRENCY_CONFIGS[curr].code}</span>
                  </span>
                  <span className="text-[10px] text-zinc-400">{CURRENCY_CONFIGS[curr].name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Rates Ticker Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Live FX Rates"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono text-[11px]">1 USD = 48.65 EGP</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 bg-zinc-950 border-zinc-800 p-3 text-zinc-100">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-xs font-semibold text-zinc-300">Live Exchange Rates</span>
                  <span className="text-[10px] text-emerald-400">Real-time Matrix</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-300">
                    <span>1 USD (🇺🇸)</span>
                    <span className="text-emerald-400">48.65 EGP</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>1 EUR (🇪🇺)</span>
                    <span className="text-emerald-400">52.88 EGP</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>1 AED (🇦🇪)</span>
                    <span className="text-emerald-400">13.25 EGP</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>1 GBP (🇬🇧)</span>
                    <span className="text-emerald-400">61.58 EGP</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Glowing "+ Log" Trigger Button */}
          <button
            type="button"
            onClick={() => openModal("log_transaction")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log</span>
          </button>

          {/* Quick Transfer Button */}
          <button
            type="button"
            onClick={() => openModal("transfer_modal")}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            title="Inter-Account Transfer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Transfer</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset all state and data back to pristine demo data?")) {
                resetToDemoData()
                toast.success("State reset to demo data")
              }
            }}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg transition-colors"
            title="Reset Demo Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="relative">
                <Image
                  src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"
                  alt="User avatar"
                  width={30}
                  height={30}
                  className="rounded-full ring-2 ring-zinc-700/80 hover:ring-emerald-500/80 cursor-pointer transition-all"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200">
              <DropdownMenuLabel>
                <p className="text-xs font-semibold text-white">Mazen Al-Ghamdi</p>
                <p className="text-[11px] text-zinc-400">mazen@spendly.os</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem
                onClick={() => openModal("account_modal")}
                className="text-xs cursor-pointer hover:bg-zinc-900"
              >
                + Add New Account
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openModal("budget_caps")}
                className="text-xs cursor-pointer hover:bg-zinc-900"
              >
                Category Caps Planning
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openModal("savings_target")}
                className="text-xs cursor-pointer hover:bg-zinc-900"
              >
                Savings Targets
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem
                onClick={() => {
                  toast.info("Logged out session")
                }}
                className="text-xs text-rose-400 cursor-pointer hover:bg-rose-950/30"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
