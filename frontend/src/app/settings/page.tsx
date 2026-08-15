"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar, SidebarPage } from "@/components/dashboard/Sidebar"
import { SettingsView } from "@/components/dashboard/SettingsView"
import { useAuth, isTechLeadUser } from "@/lib/AuthContext"
import { AccessDenied } from "@/components/auth/AccessDenied"

export default function SettingsPage() {
  const [currentPage, setCurrentPage] = useState<SidebarPage>("settings")
  const { user } = useAuth()
  const isTechLead = isTechLeadUser(user)

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans">
      <Navbar hideMiddleNav={true} />
      <div className="flex-1 flex relative">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="ml-[256px] flex-1 p-6 overflow-y-auto">
          {!isTechLead ? (
            <AccessDenied
              title="Engine Control Restricted: Tech Leads & Admins Only"
              description="LLM model selection, auto-refund caps, and multi-agent orchestra graph thresholds are restricted to Tech Leads, Lead Engineers, and System Admins."
            />
          ) : (
            <SettingsView />
          )}
        </main>
      </div>
    </div>
  )
}
