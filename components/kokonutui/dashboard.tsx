"use client"

import React, { useState } from "react"
import Content from "./content"
import Layout from "./layout"
import { useAuth } from "@/lib/auth/auth-context"
import AuthView from "@/components/auth/auth-view"

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth()
  const [currentView, setCurrentView] = useState("dashboard")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <span className="text-xs font-medium">Loading encrypted partition...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthView />
  }

  return (
    <Layout currentView={currentView} onSelectView={setCurrentView}>
      <Content currentView={currentView} onSelectView={setCurrentView} />
    </Layout>
  )
}
