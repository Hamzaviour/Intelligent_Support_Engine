"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { useAuth, isStaffUser } from "@/lib/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const { login, user, logout } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const success = await login({
      email: email || "alex.morgan@example.com",
      password: password || "password123",
      name: tab === "signup" ? name : undefined,
      role: "VIP Gold",
    })

    setLoading(false)
    if (success) {
      setMessage("Authenticated successfully! Redirecting...")
      setTimeout(() => {
        router.push("/")
      }, 600)
    } else {
      setMessage("Login failed. Please try again.")
    }
  }

  const handleQuickPreset = async (preset: { name: string; email: string; role: string }) => {
    setLoading(true)
    setEmail(preset.email)
    const success = await login({
      email: preset.email,
      name: preset.name,
      role: preset.role,
    })
    setLoading(false)
    if (success) {
      const isStaff = isStaffUser({ user_id: "", email: preset.email, name: preset.name, role: preset.role, tier: preset.role })
      router.push(isStaff ? "/dashboard" : "/")
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between z-10 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-[var(--text-primary)]">
              Intelligent Support Engine
            </h1>
            <p className="text-[11px] text-[var(--text-muted)]">Multi-Agent Concierge Authentication</p>
          </div>
        </Link>

        <Link
          href="/"
          className="px-3.5 py-1.5 rounded-xl theme-card text-xs font-semibold hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-default)] flex items-center gap-1.5"
        >
          <span>← Back to Support Chat</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md theme-card rounded-3xl p-8 shadow-2xl relative border border-[var(--border-default)] bg-[var(--bg-surface)]/90 backdrop-blur-xl"
        >
          {/* Currently logged in alert */}
          {user && (
            <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-indigo-400 font-bold uppercase block">Currently Signed In</span>
                <span className="font-bold text-[var(--text-primary)]">{user.name}</span> ({user.role})
              </div>
              <button
                onClick={logout}
                className="px-3 py-1 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-lg text-xs font-bold transition-colors"
              >
                Log Out
              </button>
            </div>
          )}

          {/* Title Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl gradient-btn flex items-center justify-center mx-auto mb-3 shadow-xl">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {tab === "login" ? "Welcome Back to Concierge" : "Create Support Account"}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              Access 10-Agent Multi-Agent Support, Ticket History & Order Concierge.
            </p>
          </div>

          {/* Preset 1-Click Login Accounts */}
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-2 text-center">
              ⚡ 1-Click Quick Demo Login
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset({ name: "Alex Morgan", email: "alex.morgan@example.com", role: "VIP Gold" })}
                className="p-2.5 rounded-xl theme-card border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)] text-center transition-all group"
              >
                <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
                  👑
                </div>
                <span className="text-[11px] font-bold block text-[var(--text-primary)]">VIP Customer</span>
                <span className="text-[9px] text-[var(--text-muted)]">Alex Morgan</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset({ name: "Sarah Connor", email: "sarah.support@company.com", role: "Support Agent" })}
                className="p-2.5 rounded-xl theme-card border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)] text-center transition-all group"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-500 font-bold text-xs flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
                  🎧
                </div>
                <span className="text-[11px] font-bold block text-[var(--text-primary)]">Support Agent</span>
                <span className="text-[9px] text-[var(--text-muted)]">Sarah Connor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset({ name: "David Tech", email: "david.admin@company.com", role: "System Admin" })}
                className="p-2.5 rounded-xl theme-card border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)] text-center transition-all group"
              >
                <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-500 font-bold text-xs flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
                  ⚙️
                </div>
                <span className="text-[11px] font-bold block text-[var(--text-primary)]">System Admin</span>
                <span className="text-[9px] text-[var(--text-muted)]">David Admin</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-[var(--border-subtle)] w-full" />
            <span className="bg-[var(--bg-surface)] px-3 text-[10px] uppercase font-bold text-[var(--text-muted)] absolute">
              or enter custom credentials
            </span>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-[var(--bg-base)] p-1 rounded-xl mb-5 border border-[var(--border-subtle)]">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === "login"
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-md"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === "signup"
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-md"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "signup" && (
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex.morgan@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
              />
            </div>

            {message && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-btn text-xs font-bold shadow-lg flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>{tab === "login" ? "Sign In & Open Chat" : "Create Account & Start"}</span>
              )}
            </button>
          </form>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/40 z-10">
        Intelligent Support Engine Multi-Agent System &copy; 2026. All Rights Reserved.
      </footer>
    </div>
  )
}
