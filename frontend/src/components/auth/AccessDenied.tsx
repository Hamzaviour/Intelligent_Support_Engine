"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShieldAlert, ArrowLeft, Lock, MessageSquare } from "lucide-react"

interface AccessDeniedProps {
  title?: string
  description?: string
}

export function AccessDenied({
  title = "Access Restricted: Staff Only",
  description = "Support Dashboards, Ticket Management, and System Metrics are reserved for Internal Support Leads, Engineers, and Support Agents. Customers are limited to the AI Support Chat Console.",
}: AccessDeniedProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full theme-card rounded-3xl p-8 border border-[var(--border-default)] shadow-2xl bg-[var(--bg-surface)]"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[11px] font-bold border border-amber-500/20 mb-3">
          <Lock className="w-3.5 h-3.5" />
          <span>Role Authorization Protection</span>
        </div>

        <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
          {title}
        </h2>

        <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
          {description}
        </p>

        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] flex flex-col gap-2.5">
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-xl gradient-btn text-xs font-bold shadow-md flex items-center justify-center gap-2 group"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Return to AI Support Chat</span>
          </Link>

          <Link
            href="/login"
            className="w-full py-2.5 px-4 rounded-xl theme-card text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-subtle)] flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Support Staff Account</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
