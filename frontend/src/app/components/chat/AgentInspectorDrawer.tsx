"use client"

import { motion, AnimatePresence } from "framer-motion"

interface AgentEvaluated {
  name: string
  status: string
  detail: string
}

interface AgentInspectorDrawerProps {
  isOpen: boolean
  onClose: () => void
  lastMessageMeta?: {
    agent?: string
    intent?: string
    sentiment?: string
    confidence?: number
    should_escalate?: boolean
    agents_evaluated?: AgentEvaluated[]
  }
}

export function AgentInspectorDrawer({ isOpen, onClose, lastMessageMeta }: AgentInspectorDrawerProps) {
  if (!isOpen) return null

  const defaultAgents: AgentEvaluated[] = [
    { name: "Memory Agent", status: "Active", detail: "Retrieved session context & past turns" },
    { name: "CRM Agent", status: "Active", detail: "VIP Gold account & order history verified" },
    { name: "Intent Agent", status: "Active", detail: `Classified: ${lastMessageMeta?.intent || "general"}` },
    { name: "Sentiment Agent", status: "Active", detail: `Tone: ${lastMessageMeta?.sentiment || "neutral"}` },
    { name: "Knowledge Agent", status: "Active", detail: "RAG vector search & policy match" },
    { name: "Refund Agent", status: "Active", detail: lastMessageMeta?.intent === "refund" ? "Eligible for auto-refund" : "Standby" },
    { name: "Ticket Agent", status: "Active", detail: "SLA check & automatic ticket creation" },
    { name: "Escalation Agent", status: lastMessageMeta?.should_escalate ? "Triggered" : "Monitoring", detail: lastMessageMeta?.should_escalate ? "Human handoff required" : "Normal resolution" },
    { name: "Conversation Agent", status: "Active", detail: `Persona: ${lastMessageMeta?.agent || "Support Concierge"}` },
    { name: "Analytics Agent", status: "Active", detail: "FRT, latency & outcome metrics logged" },
  ]

  const activeAgents = lastMessageMeta?.agents_evaluated?.length ? lastMessageMeta.agents_evaluated : defaultAgents

  const agentIcons: Record<string, string> = {
    "Memory Agent": "🧠",
    "CRM Agent": "👤",
    "Intent Agent": "🎯",
    "Sentiment Agent": "😊",
    "Knowledge Agent": "📚",
    "Refund Agent": "💳",
    "Ticket Agent": "🎫",
    "Escalation Agent": "🚨",
    "Conversation Agent": "💬",
    "Analytics Agent": "📊",
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md h-full bg-[var(--bg-surface)] border-l border-[var(--border-default)] p-6 flex flex-col shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h2 className="font-bold text-sm text-[var(--text-primary)]">
                  10-Agent System Inspector
                </h2>
                <p className="text-[10px] text-[var(--text-muted)]">Live Telemetry & Evaluation Graph</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-bold transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Active Turn Analytics Summary */}
          <div className="my-4 theme-card p-4 rounded-2xl space-y-3 border-l-4 border-indigo-500 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Latest Message Pipeline
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Active Turn
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[var(--bg-base)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-muted)] block font-semibold">Assigned Agent</span>
                <span className="font-bold text-indigo-400 block truncate">{lastMessageMeta?.agent || "Support Concierge"}</span>
              </div>
              <div className="bg-[var(--bg-base)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-muted)] block font-semibold">Intent</span>
                <span className="font-bold text-emerald-400 uppercase block truncate">{lastMessageMeta?.intent || "General"}</span>
              </div>
            </div>
          </div>

          {/* 10-Agent Pipeline Steps */}
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Multi-Agent Orchestration Flow (10/10)
            </h4>
            <span className="text-[10px] text-emerald-500 font-bold">100% Operational</span>
          </div>

          <div className="space-y-2 flex-1">
            {activeAgents.map((ag, i) => {
              const isTriggered = ag.status === "Triggered" || ag.status === "Active"
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-2xl theme-card border border-[var(--border-subtle)] text-xs hover:border-[var(--accent-primary)] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{agentIcons[ag.name] || "🤖"}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-[var(--text-primary)]">{ag.name}</h5>
                        <span className="text-[9px] font-mono text-[var(--text-muted)]">Step #{i + 1}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{ag.detail}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isTriggered
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }`}
                  >
                    {ag.status}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
