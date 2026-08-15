"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  Ticket,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  BookOpen,
  Users,
  Trophy,
} from "lucide-react"
import { useAuth, isStaffUser, isTechLeadUser } from "@/lib/AuthContext"
import { useRouter } from "next/navigation"

export type SidebarPage = "chat" | "dashboard" | "tickets" | "metrics" | "settings" | "knowledge" | "customers" | "team"

interface SidebarProps {
  currentPage: SidebarPage
  onNavigate: (page: SidebarPage) => void
  userId?: string
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const isStaff = isStaffUser(user)
  const isTechLead = isTechLeadUser(user)

  const handleNavClick = (id: SidebarPage) => {
    onNavigate(id)
    if (id === "knowledge") router.push("/knowledge")
    else if (id === "customers") router.push("/customers")
    else if (id === "team") router.push("/team")
    else if (id === "dashboard") router.push("/dashboard")
    else if (id === "tickets") router.push("/tickets")
    else if (id === "metrics") router.push("/metrics")
    else if (id === "settings") router.push("/settings")
  }

  const allNavItems = [
    { id: "dashboard" as SidebarPage, label: "Dashboard", icon: Home, techLeadOnly: false },
    { id: "tickets" as SidebarPage, label: "Tickets Queue", icon: Ticket, techLeadOnly: false },
    { id: "knowledge" as SidebarPage, label: "Knowledge Hub", icon: BookOpen, techLeadOnly: false },
    { id: "customers" as SidebarPage, label: "Customer CRM", icon: Users, techLeadOnly: false },
    { id: "team" as SidebarPage, label: "Team & CSAT", icon: Trophy, techLeadOnly: false },
    { id: "metrics" as SidebarPage, label: "Analytics", icon: BarChart3, techLeadOnly: false },
    { id: "settings" as SidebarPage, label: "Engine Settings (Admin)", icon: Settings, techLeadOnly: true },
  ]

  const navItems = isStaff
    ? allNavItems.filter(item => !item.techLeadOnly || isTechLead)
    : [{ id: "chat" as SidebarPage, label: "Chat Console", icon: MessageSquare, techLeadOnly: false }]

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "US"

  return (
    <motion.div
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-full bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] z-40 flex flex-col shadow-md font-sans"
    >
      {/* Logo */}
      <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-btn flex items-center justify-center shadow-md">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-[var(--text-primary)]">ISE Console</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-[var(--bg-hover)]"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-xs font-semibold ${
                isActive
                  ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold border border-[var(--accent-primary)]/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-xs font-semibold truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full" />
              )}
            </button>
          )
        })}
      </nav>

      {/* User Profile Footer */}
      {!collapsed && user && (
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center text-xs font-bold text-white shadow-xs flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user.name}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{user.tier || user.role}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout()
              router.push("/login")
            }}
            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors text-xs font-bold"
            title="Sign Out"
          >
            🚪
          </button>
        </div>
      )}

      {/* Collapsed user avatar */}
      {collapsed && user && (
        <div className="p-3 border-t border-[var(--border-subtle)] flex justify-center">
          <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center text-xs font-bold text-white shadow-xs">
            {initials}
          </div>
        </div>
      )}
    </motion.div>
  )
}
