"use client"

import React, { useState } from "react"
import {
  Home,
  BarChart2,
  Receipt,
  Wallet,
  Sliders,
  Settings,
  HelpCircle,
  Menu,
  X,
  CreditCard,
  CalendarClock,
  Sparkles,
} from "lucide-react"
import Image from "next/image"
import { useFinance } from "@/lib/context/finance-context"

interface SidebarProps {
  currentView?: string
  onSelectView?: (view: string) => void
}

export default function Sidebar({ currentView = "dashboard", onSelectView }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { setActiveTab, setSubView } = useFinance()

  function handleNavigate(view: string) {
    if (onSelectView) {
      onSelectView(view)
    }
    if (view === "dashboard") {
      setSubView(null)
      setActiveTab("home")
    } else if (view === "analytics") {
      setSubView(null)
      setActiveTab("analysis")
    } else if (view === "transactions") {
      setSubView(null)
      setActiveTab("analysis")
    } else if (view === "accounts") {
      setSubView(null)
      setActiveTab("control")
    } else if (view === "budgets") {
      setSubView(null)
      setActiveTab("control")
    } else if (view === "planned") {
      setSubView("planned_payments")
    } else if (view === "settings") {
      setSubView(null)
      setActiveTab("control")
    }
    setIsMobileMenuOpen(false)
  }

  function NavButton({
    viewKey,
    icon: Icon,
    children,
  }: {
    viewKey: string
    icon: any
    children: React.ReactNode
  }) {
    const isActive = currentView === viewKey
    return (
      <button
        type="button"
        onClick={() => handleNavigate(viewKey)}
        className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors text-left ${
          isActive
            ? "bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-white font-medium"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]/60"
        }`}
      >
        <Icon className={`h-4 w-4 mr-3 flex-shrink-0 ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500"}`} />
        <span>{children}</span>
      </button>
    )
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        type="button"
        className="lg:hidden fixed top-3 left-3 z-[70] p-2 rounded-lg bg-white dark:bg-[#0F0F12] border border-gray-200 dark:border-[#1F1F23] shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle Navigation Menu"
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Sidebar navigation container */}
      <nav
        className={`
          fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-[#0F0F12] transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:w-64 border-r border-gray-200 dark:border-[#1F1F23] flex-shrink-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            {/* Top Brand Header */}
            <div className="h-16 px-6 flex items-center border-b border-gray-200 dark:border-[#1F1F23]">
              <div
                onClick={() => handleNavigate("dashboard")}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Image
                  src="https://kokonutui.com/logo.svg"
                  alt="KokonutUI Logo"
                  width={28}
                  height={28}
                  className="flex-shrink-0 hidden dark:block"
                />
                <Image
                  src="https://kokonutui.com/logo-black.svg"
                  alt="KokonutUI Logo"
                  width={28}
                  height={28}
                  className="flex-shrink-0 block dark:hidden"
                />
                <span className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
                  KokonutUI
                </span>
              </div>
            </div>

            {/* Menu Sections */}
            <div className="py-4 px-3 space-y-6 overflow-y-auto">
              {/* SECTION 1: OVERVIEW */}
              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Overview
                </div>
                <div className="space-y-1">
                  <NavButton viewKey="dashboard" icon={Home}>
                    Dashboard
                  </NavButton>
                  <NavButton viewKey="analytics" icon={BarChart2}>
                    Analytics
                  </NavButton>
                </div>
              </div>

              {/* SECTION 2: FINANCE */}
              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Finance
                </div>
                <div className="space-y-1">
                  <NavButton viewKey="transactions" icon={Receipt}>
                    Transactions
                  </NavButton>
                  <NavButton viewKey="accounts" icon={Wallet}>
                    Accounts
                  </NavButton>
                  <NavButton viewKey="budgets" icon={Sliders}>
                    Budgets
                  </NavButton>
                </div>
              </div>

              {/* SECTION 3: SETTINGS */}
              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Settings
                </div>
                <div className="space-y-1">
                  <NavButton viewKey="settings" icon={Settings}>
                    Preferences
                  </NavButton>
                  <NavButton viewKey="planned" icon={CalendarClock}>
                    Planned Bills
                  </NavButton>
                </div>
              </div>
            </div>
          </div>

          {/* Footer help link */}
          <div className="p-4 border-t border-gray-200 dark:border-[#1F1F23]">
            <a
              href="https://kokonutui.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors"
            >
              <HelpCircle className="h-4 w-4 mr-3 flex-shrink-0" />
              <span>Documentation & Help</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
