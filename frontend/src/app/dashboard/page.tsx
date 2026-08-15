"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { DashboardOverview } from "@/components/dashboard/DashboardOverview"
import { TicketList } from "@/components/dashboard/TicketList"
import { MetricsDashboard } from "@/components/dashboard/MetricsDashboard"
import { ConversationView } from "@/components/dashboard/ConversationView"
import { SettingsView } from "@/components/dashboard/SettingsView"
import { useAuth, isStaffUser } from "@/lib/AuthContext"
import { AccessDenied } from "@/components/auth/AccessDenied"

import { KnowledgeView } from "@/components/dashboard/KnowledgeView"
import { CustomerDirectoryView } from "@/components/dashboard/CustomerDirectoryView"
import { TeamPerformanceView } from "@/components/dashboard/TeamPerformanceView"

type Page = "chat" | "dashboard" | "tickets" | "metrics" | "settings" | "knowledge" | "customers" | "team"

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const { user } = useAuth()
  const isStaff = isStaffUser(user)

  const renderPage = () => {
    if (!isStaff) {
      return <AccessDenied title="Dashboard Restricted: Staff Only" />
    }

    if (selectedConversation) {
      return (
        <ConversationView
          conversationId={selectedConversation}
          onBack={() => setSelectedConversation(null)}
        />
      )
    }

    switch (currentPage) {
      case "dashboard":
        return <DashboardOverview />
      case "tickets":
        return <TicketList onSelect={(ticket) => setSelectedConversation(ticket.id)} />
      case "metrics":
        return <MetricsDashboard />
      case "knowledge":
        return <KnowledgeView />
      case "customers":
        return <CustomerDirectoryView />
      case "team":
        return <TeamPerformanceView />
      case "settings":
        return <SettingsView />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex relative">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="ml-[256px] flex-1 p-6 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
