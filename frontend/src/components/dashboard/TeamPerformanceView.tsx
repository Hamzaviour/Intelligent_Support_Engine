"use client"

import { motion } from "framer-motion"
import {
  Trophy,
  Star,
  Clock,
  CheckCircle2,
  Users,
  Shield,
  Zap,
} from "lucide-react"

interface AgentMetric {
  id: string
  name: string
  role: string
  avatar: string
  resolvedCount: number
  csatScore: number
  avgFrt: string
  status: "Online" | "In Ticket" | "Offline"
  badge: string
}

const AGENTS: AgentMetric[] = [
  {
    id: "AGT-01",
    name: "Sarah Connor",
    role: "Support Lead",
    avatar: "SC",
    resolvedCount: 142,
    csatScore: 4.9,
    avgFrt: "1.2 min",
    status: "Online",
    badge: "🥇 Top Specialist",
  },
  {
    id: "AGT-02",
    name: "KnowledgeAgent (RAG AI)",
    role: "Multi-Agent Engine",
    avatar: "KA",
    resolvedCount: 128,
    csatScore: 4.8,
    avgFrt: "< 0.5 sec",
    status: "Online",
    badge: "⚡ AI Leader",
  },
  {
    id: "AGT-03",
    name: "David Tech",
    role: "Lead Engineer",
    avatar: "DT",
    resolvedCount: 115,
    csatScore: 4.8,
    avgFrt: "1.4 min",
    status: "In Ticket",
    badge: "🛠️ Escalation Lead",
  },
  {
    id: "AGT-04",
    name: "RefundAgent (Auto AI)",
    role: "Automation Specialist",
    avatar: "RA",
    resolvedCount: 98,
    csatScore: 4.7,
    avgFrt: "< 0.2 sec",
    status: "Online",
    badge: "💳 Refund Express",
  },
]

export function TeamPerformanceView() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Team Performance & CSAT Leaderboard</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Live agent resolution counts, First Response Times (FRT), and CSAT rankings</p>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AGENTS.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="theme-card rounded-2xl p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-btn flex items-center justify-center text-white font-bold text-base shadow-md">
                {agent.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{agent.name}</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {agent.badge}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{agent.role} • Status: <span className="text-emerald-500 font-bold">{agent.status}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border-subtle)] text-center text-xs">
              <div className="bg-[var(--bg-base)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Resolved</span>
                <span className="font-bold text-emerald-500">{agent.resolvedCount} tickets</span>
              </div>

              <div className="bg-[var(--bg-base)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Avg FRT</span>
                <span className="font-bold text-indigo-400">{agent.avgFrt}</span>
              </div>

              <div className="bg-[var(--bg-base)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-muted)] block">CSAT Rating</span>
                <span className="font-bold text-amber-400 flex items-center justify-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {agent.csatScore}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
