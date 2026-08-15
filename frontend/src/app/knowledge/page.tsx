"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar, SidebarPage } from "@/components/dashboard/Sidebar"
import { KnowledgeView } from "@/components/dashboard/KnowledgeView"
import { useAuth, isStaffUser } from "@/lib/AuthContext"
import { AccessDenied } from "@/components/auth/AccessDenied"

export default function KnowledgePage() {
  const [currentPage, setCurrentPage] = useState<SidebarPage>("knowledge")
  const { user } = useAuth()
  const isStaff = isStaffUser(user)

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans">
      <Navbar hideMiddleNav={true} />
      <div className="flex-1 flex relative">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="ml-[256px] flex-1 p-6 overflow-y-auto">
          {!isStaff ? (
            <AccessDenied title="Knowledge Base Restricted: Staff Only" description="Company policy documents and resolution templates are restricted to Support Agents and Staff." />
          ) : (
            <KnowledgeView />
          )}
        </main>
      </div>
    </div>
  )
}
