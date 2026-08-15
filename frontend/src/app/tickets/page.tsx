"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar, SidebarPage } from "@/components/dashboard/Sidebar"
import { TicketList } from "@/components/dashboard/TicketList"
import { ConversationView } from "@/components/dashboard/ConversationView"
import { useAuth, isStaffUser } from "@/lib/AuthContext"
import { AccessDenied } from "@/components/auth/AccessDenied"

export default function TicketsPage() {
  const [currentPage, setCurrentPage] = useState<SidebarPage>("tickets")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const { user } = useAuth()
  const isStaff = isStaffUser(user)

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex relative">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="ml-[256px] flex-1 p-6 overflow-y-auto">
          {!isStaff ? (
            <AccessDenied title="Tickets Restricted: Staff Only" description="All-ticket management and support queues are reserved for Internal Support Leads, Engineers, and Support Agents. Customers may view personal resolution status in Chat Console." />
          ) : selectedConversation ? (
            <ConversationView
              conversationId={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
          ) : (
            <TicketList onSelect={(ticket) => setSelectedConversation(ticket.id)} />
          )}
        </main>
      </div>
    </div>
  )
}
