"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth, isStaffUser } from "@/lib/AuthContext"
import { useTheme, ColorTheme } from "@/app/lib/ThemeContext"

interface NavbarProps {
  hideMiddleNav?: boolean
}

export function Navbar({ hideMiddleNav = false }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const { mode, theme, toggleMode, setTheme } = useTheme()
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  const isStaff = isStaffUser(user)
  const isStaffRoute = pathname === "/dashboard" || pathname === "/tickets" || pathname === "/metrics"

  const navLinks = [
    { href: "/", label: "Chat Console", icon: "💬" },
    ...(isStaff
      ? [
          { href: "/dashboard", label: "Dashboard", icon: "📊" },
          { href: "/tickets", label: "Tickets Queue", icon: "🎫" },
          { href: "/knowledge", label: "Knowledge Hub", icon: "📚" },
          { href: "/customers", label: "Customer CRM", icon: "👥" },
          { href: "/team", label: "Team & CSAT", icon: "🏆" },
          { href: "/metrics", label: "Metrics", icon: "📈" },
        ]
      : []),
  ]

  const showNav = !hideMiddleNav && !isStaffRoute

  const themes: { id: ColorTheme; name: string; color: string }[] = [
    { id: "indigo", name: "Indigo Electric", color: "#6366f1" },
    { id: "emerald", name: "Emerald Care", color: "#10b981" },
    { id: "sunset", name: "Sunset Coral", color: "#f43f5e" },
    { id: "sapphire", name: "Sapphire Corporate", color: "#0284c7" },
  ]

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shadow-sm z-30 relative sticky top-0 backdrop-blur-md">
      {/* Left: Brand logo & Live status */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">
                Support Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                10-Agent System
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Multi-Agent Engine Active</span>
            </p>
          </div>
        </Link>

        {/* Navigation Tabs (Only rendered when sidebar is NOT active) */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-[var(--border-subtle)]">
            {navLinks.map(link => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[var(--bg-hover)] text-[var(--text-primary)] shadow-xs font-bold border border-[var(--border-default)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]/50"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        )}
      </div>

      {/* Right Toolbar: Theme + Auth controls */}
      <div className="flex items-center gap-2.5">
        {/* Theme Color Selector */}
        <div className="relative">
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="p-2 rounded-xl theme-card hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] border border-[var(--border-default)]"
            title="Change Theme Palette"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>

          {showThemePicker && (
            <div className="absolute right-0 mt-2 w-48 p-2 rounded-2xl theme-card shadow-2xl z-50 flex flex-col gap-1 border border-[var(--border-default)] bg-[var(--bg-surface)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-2 py-1">
                Select Accent Palette
              </span>
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id)
                    setShowThemePicker(false)
                  }}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    theme === t.id ? "bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold" : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: t.color }} />
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Light / Dark Mode Switcher */}
        <button
          onClick={toggleMode}
          className="p-2 rounded-xl theme-card hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] border border-[var(--border-default)]"
          title={`Switch to ${mode === "dark" ? "Bright (Light)" : "Dark"} Mode`}
        >
          {mode === "dark" ? (
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* User Auth Controls (Avatar / Login / Logout) */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl theme-card border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)] hidden sm:inline">{user.name}</span>
              <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl theme-card shadow-2xl z-50 flex flex-col gap-1 border border-[var(--border-default)] bg-[var(--bg-surface)]">
                <div className="px-3 py-2.5 border-b border-[var(--border-subtle)]">
                  <p className="text-xs font-bold text-[var(--text-primary)]">{user.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {user.tier || user.role}
                  </span>
                </div>

                {isStaff && (
                  <Link
                    href="/dashboard"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-xl font-medium transition-colors"
                  >
                    <span>📊 Staff Dashboard</span>
                  </Link>
                )}

                <Link
                  href="/login"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-xl font-medium transition-colors"
                >
                  <span>🔑 Switch / Login Account</span>
                </Link>

                {/* Explicit Logout Option */}
                <button
                  onClick={() => {
                    logout()
                    setShowUserDropdown(false)
                    router.push("/login")
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-xl font-bold transition-colors mt-1 border-t border-[var(--border-subtle)] cursor-pointer"
                >
                  <span>🚪 Log Out</span>
                  <span className="text-[10px] opacity-75">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-bold rounded-xl gradient-btn shadow-md hover:scale-105 transition-transform flex items-center gap-1.5"
          >
            <span>🔑 Sign In / Login</span>
          </Link>
        )}
      </div>
    </header>
  )
}
