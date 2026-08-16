"use client"

import React, { useState } from "react"
import Content from "./content"
import Layout from "./layout"

export default function Dashboard() {
  const [currentView, setCurrentView] = useState("dashboard")

  return (
    <Layout currentView={currentView} onSelectView={setCurrentView}>
      <Content currentView={currentView} onSelectView={setCurrentView} />
    </Layout>
  )
}
