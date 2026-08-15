"use client"

import { useState } from "react"
import { Sidebar, SidebarPage } from "@/components/dashboard/Sidebar"
import ChatWindow from "../components/chat/ChatWindow"

export default function ChatPage() {
  const [currentPage, setCurrentPage] = useState<SidebarPage>("chat")

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="ml-[256px] p-6">
        <div className="max-w-3xl mx-auto">
          <ChatWindow userId="demo-user-123" />
        </div>
      </main>
    </div>
  )
}
