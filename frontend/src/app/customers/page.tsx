"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar, SidebarPage } from "@/components/dashboard/Sidebar"
import { CustomerDirectoryView } from "@/components/dashboard/CustomerDirectoryView"
import { useAuth, isStaffUser } from "@/lib/AuthContext"
import { AccessDenied } from "@/components/auth/AccessDenied"

export default function CustomersPage() {
  const [currentPage, setCurrentPage] = useState<SidebarPage>("customers")
  const { user } = useAuth()
  const isStaff = isStaffUser(user)

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans">
      <Navbar hideMiddleNav={true} />
      <div className="flex-1 flex relative">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="ml-[256px] flex-1 p-6 overflow-y-auto">
          {!isStaff ? (
            <AccessDenied title="Customer Directory Restricted: Staff Only" description="Customer CRM profiles, lifetime value metrics, and order histories are restricted to Support Staff." />
          ) : (
            <CustomerDirectoryView />
          )}
        </main>
      </div>
    </div>
  )
}
