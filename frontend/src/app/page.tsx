"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ChatWindow from "./components/chat/ChatWindow"
import { useAuth, isStaffUser } from "@/lib/AuthContext"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const isStaff = isStaffUser(user)

  const [userId] = useState(() =>
    typeof window !== "undefined"
      ? (localStorage.getItem("ise_user_id") ?? (() => {
          const id = "user-" + Math.random().toString(36).slice(2, 10)
          localStorage.setItem("ise_user_id", id)
          return id
        })())
      : "guest"
  )

  useEffect(() => {
    setMounted(true)
    if (isStaff) {
      router.push("/dashboard")
    }
  }, [isStaff, router])

  if (!mounted || isStaff) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-base)]">
        <div className="w-10 h-10 rounded-xl gradient-btn animate-pulse" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] flex flex-col overflow-hidden transition-colors font-sans">
      <main className="flex-1 flex flex-col min-h-0">
        <ChatWindow userId={userId} />
      </main>
    </div>
  )
}
