"use client"

import React, { useState, useEffect } from "react"
import Sidebar from "./sidebar"
import TopNav from "./top-nav"
import MasterModalContainer from "@/components/ledger-os/modals/master-modal-container"

interface LayoutProps {
  children: React.ReactNode
  currentView?: string
  onSelectView?: (view: string) => void
}

export default function Layout({ children, currentView = "dashboard", onSelectView }: LayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#0F0F12] text-gray-900 dark:text-zinc-100 overflow-hidden font-sans">
      {/* Collapsible / Mobile Drawer Sidebar */}
      <Sidebar currentView={currentView} onSelectView={onSelectView} />

      {/* Main Column */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 border-b border-gray-200 dark:border-[#1F1F23] bg-white dark:bg-[#0F0F12]">
          <TopNav currentView={currentView} />
        </header>

        {/* Scrollable Dashboard View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50/50 dark:bg-[#09090b]">
          {children}
        </main>
      </div>

      {/* Mount All Modal Dialogs */}
      <MasterModalContainer />
    </div>
  )
}
