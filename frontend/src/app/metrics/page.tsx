"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar, SidebarPage } from "@/components/dashboard/Sidebar"
import { MetricsDashboard } from "@/components/dashboard/MetricsDashboard"
import { useAuth, isStaffUser } from "@/lib/AuthContext"
import { AccessDenied } from "@/components/auth/AccessDenied"

export default function MetricsPage() {
  const [currentPage, setCurrentPage] = useState<SidebarPage>("metrics")
  const { user } = useAuth()
  const isStaff = isStaffUser(user)

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex relative">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="ml-[256px] flex-1 p-6 overflow-y-auto">
          {!isStaff ? (
            <AccessDenied title="System Analytics Restricted" description="Multi-agent performance analytics, latency charts, and CSAT reports are strictly accessible to Support Leads, System Engineers, and Admins." />
          ) : (
            <MetricsDashboard />
          )}
        </main>
      </div>
    </div>
  )
}
