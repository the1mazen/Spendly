"use client"

import React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { Bell, ChevronRight, Plus, ArrowRightLeft, UserCheck, LogOut } from "lucide-react"
import { ThemeToggle } from "../theme-toggle"
import { useFinance } from "@/lib/context/finance-context"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface TopNavProps {
  currentView?: string
}

export default function TopNav({ currentView = "dashboard" }: TopNavProps) {
  const router = useRouter()
  const { openModal } = useFinance()
  const { user, logout } = useAuth()

  const viewTitles: Record<string, string> = {
    dashboard: "Dashboard",
    analytics: "Analytics",
    transactions: "Transactions",
    accounts: "Accounts",
    budgets: "Budgets & Limits",
    settings: "Preferences",
    planned: "Planned Bills",
  }

  const breadcrumbCurrent = viewTitles[currentView] || "Dashboard"

  return (
    <nav className="px-4 sm:px-6 flex items-center justify-between bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#1F1F23] h-full w-full">
      {/* Clean Breadcrumbs (KokonutUI / Active View) */}
      <div className="font-medium text-sm flex items-center space-x-1.5 truncate">
        <span className="text-gray-500 dark:text-gray-400 text-xs hidden sm:inline">KokonutUI</span>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400 dark:text-gray-600 hidden sm:inline" />
        <span className="text-gray-900 dark:text-gray-100 text-xs font-semibold">{breadcrumbCurrent}</span>
      </div>

      {/* Right Controls: Quick Action Buttons, Notification Bell, ThemeToggle, User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Button: + Log */}
        <button
          type="button"
          onClick={() => openModal("log_transaction")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-medium transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log</span>
        </button>

        {/* Quick Action Button: Transfer */}
        <button
          type="button"
          onClick={() => openModal("transfer_modal")}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#1F1F23] hover:bg-gray-100 dark:hover:bg-[#1F1F23] text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-gray-500" />
          <span>Transfer</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => toast.info("No new notifications")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors text-gray-600 dark:text-gray-400"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="relative">
              <Image
                src={user?.avatar || "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"}
                alt="User avatar"
                width={28}
                height={28}
                className="rounded-full ring-2 ring-gray-200 dark:ring-[#2B2B30] sm:w-8 sm:h-8 cursor-pointer object-cover"
              />
              <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-zinc-900" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[280px] bg-white dark:bg-[#0F0F12] border-gray-200 dark:border-[#1F1F23] rounded-xl shadow-lg p-2 text-zinc-200"
          >
            <DropdownMenuLabel className="px-2 py-1.5">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">{user?.fullName || "User Profile"}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">@{user?.username || "user"} • {user?.email || "user@spendly.os"}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-800" />
            <DropdownMenuItem
              onClick={() => openModal("account_modal")}
              className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 rounded-md"
            >
              + Add New Account
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => openModal("budget_caps")}
              className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 rounded-md"
            >
              Category Budget Caps
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-100 dark:bg-zinc-800" />
            <DropdownMenuItem
              onClick={logout}
              className="text-xs text-rose-500 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
