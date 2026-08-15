"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar, SidebarPage } from "@/components/dashboard/Sidebar"
import { TeamPerformanceView } from "@/components/dashboard/TeamPerformanceView"
import { useAuth, isStaffUser } from "@/lib/AuthContext"
import { AccessDenied } from "@/components/auth/AccessDenied"

export default function TeamPage() {
  const [currentPage, setCurrentPage] = useState<SidebarPage>("team")
  const { user } = useAuth()
  const isStaff = isStaffUser(user)

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans">
      <Navbar hideMiddleNav={true} />
      <div className="flex-1 flex relative">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="ml-[256px] flex-1 p-6 overflow-y-auto">
          {!isStaff ? (
            <AccessDenied title="Team Leaderboard Restricted: Staff Only" description="Team metrics, agent rankings, and CSAT scores are restricted to Support Staff." />
          ) : (
            <TeamPerformanceView />
          )}
        </main>
      </div>
    </div>
  )
}
