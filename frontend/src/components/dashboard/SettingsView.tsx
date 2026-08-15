"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Settings as SettingsIcon,
  Sliders,
  Bot,
  Shield,
  Palette,
  Bell,
  Save,
  Check,
  Zap,
} from "lucide-react"
import { useTheme, ColorTheme } from "@/app/lib/ThemeContext"
import { useAuth, isAdminUser } from "@/lib/AuthContext"
import { Key, UserPlus, Copy, CheckCircle2 } from "lucide-react"

interface AgentCredential {
  id: string
  name: string
  email: string
  role: string
  passKey: string
  createdAt: string
}

export function SettingsView() {
  const { user } = useAuth()
  const isAdmin = isAdminUser(user)
  const { mode, theme, toggleMode, setTheme } = useTheme()
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  // Created Agent Credentials state
  const [agentList, setAgentList] = useState<AgentCredential[]>([
    { id: "AGT-001", name: "Sarah Connor", email: "sarah.support@company.com", role: "Support Agent", passKey: "AgentPass-2026!", createdAt: "2026-08-01" },
    { id: "AGT-002", name: "Michael Vance", email: "michael.vance@company.com", role: "Support Lead", passKey: "LeadPass-8871#", createdAt: "2026-08-05" },
  ])

  // New Credential Form state
  const [newAgentName, setNewAgentName] = useState("")
  const [newAgentEmail, setNewAgentEmail] = useState("")
  const [newAgentRole, setNewAgentRole] = useState("Support Agent")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCreateAgentCredentials = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAgentName.trim() || !newAgentEmail.trim()) return

    const randomPass = `Pass-${Math.random().toString(36).slice(-6)}!`
    const newCred: AgentCredential = {
      id: `AGT-00${agentList.length + 1}`,
      name: newAgentName,
      email: newAgentEmail,
      role: newAgentRole,
      passKey: randomPass,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setAgentList([newCred, ...agentList])
    setNewAgentName("")
    setNewAgentEmail("")

    setSavedMessage(`✅ Credentials created for Agent: ${newCred.name} (${newCred.email})`)
    setTimeout(() => setSavedMessage(null), 3000)
  }

  const handleCopyPass = (pass: string, id: string) => {
    navigator.clipboard.writeText(pass)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Agent toggles
  const [agentToggles, setAgentToggles] = useState({
    intent: true,
    sentiment: true,
    memory: true,
    crm: true,
    knowledge: true,
    refund: true,
    ticket: true,
    escalation: true,
    analytics: true,
  })

  // System thresholds
  const [autoRefundMax, setAutoRefundMax] = useState(100)
  const [sentimentEscalateThreshold, setSentimentEscalateThreshold] = useState("frustrated")
  const [llmModel, setLlmModel] = useState("llama3-70b-8192")
  const [autoTicketIntent, setAutoTicketIntent] = useState(true)

  const handleSave = () => {
    setSavedMessage("Configuration saved successfully!")
    setTimeout(() => setSavedMessage(null), 3000)
  }

  const toggleAgent = (key: keyof typeof agentToggles) => {
    setAgentToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6 font-sans relative">
      {/* Save Notification */}
      <AnimatePresence>
        {savedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-500 text-white text-xs font-bold shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{savedMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Engine Settings & Control</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Configure 10-Agent orchestra thresholds, LLM parameters, and UI themes</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl gradient-btn shadow-md hover:scale-105 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Agent & LLM Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Orchestra Toggles */}
          <div className="theme-card rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[var(--border-subtle)]">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">Autonomous Multi-Agent Activation</h2>
                <p className="text-[11px] text-[var(--text-muted)]">Enable or disable specialized agents in the LangGraph graph</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "intent", name: "IntentAgent", desc: "Few-shot classification & intent routing" },
                { key: "sentiment", name: "SentimentAgent", desc: "Real-time tone & frustration detection" },
                { key: "memory", name: "MemoryAgent", desc: "Session history & turn context recall" },
                { key: "crm", name: "CRMAgent", desc: "Customer tier & order history lookup" },
                { key: "knowledge", name: "KnowledgeAgent", desc: "Qdrant vector RAG policy retrieval" },
                { key: "refund", name: "RefundAgent", desc: "Automated refund eligibility & execution" },
                { key: "ticket", name: "TicketAgent", desc: "Automatic ticket queue generation" },
                { key: "escalation", name: "EscalationAgent", desc: "Urgency trigger & human handoff" },
                { key: "analytics", name: "AnalyticsAgent", desc: "FRT, latency & outcome metrics" },
              ].map(agent => (
                <div
                  key={agent.key}
                  onClick={() => toggleAgent(agent.key as keyof typeof agentToggles)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/40 transition-all cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] block">{agent.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{agent.desc}</span>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                      agentToggles[agent.key as keyof typeof agentToggles]
                        ? "bg-indigo-600"
                        : "bg-[var(--bg-hover)]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        agentToggles[agent.key as keyof typeof agentToggles] ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LLM Model & Execution Parameters */}
          <div className="theme-card rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[var(--border-subtle)]">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">LLM & Policy Thresholds</h2>
                <p className="text-[11px] text-[var(--text-muted)]">Set refund caps, sentiment triggers, and LLM model</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[var(--text-primary)] mb-1">
                  Primary Model Engine
                </label>
                <select
                  value={llmModel}
                  onChange={e => setLlmModel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-xs"
                >
                  <option value="llama3-70b-8192">Groq LLaMA 3 70B (High Accuracy — Recommended)</option>
                  <option value="llama3-8b-8192">Groq LLaMA 3 8B (Ultra Fast)</option>
                  <option value="mixtral-8x7b-32768">Mixtral 8x7B (Large Context Window)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-[var(--text-primary)]">
                    Auto-Refund Ceiling Amount
                  </label>
                  <span className="font-bold text-emerald-500">${autoRefundMax}.00</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={autoRefundMax}
                  onChange={e => setAutoRefundMax(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                  Refunds above this threshold will require explicit Staff Approval.
                </span>
              </div>

              <div>
                <label className="block font-bold text-[var(--text-primary)] mb-1">
                  Escalation Sentiment Trigger
                </label>
                <select
                  value={sentimentEscalateThreshold}
                  onChange={e => setSentimentEscalateThreshold(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-xs"
                >
                  <option value="angry">Escalate on "Angry" sentiment only</option>
                  <option value="frustrated">Escalate on "Frustrated" or "Angry" sentiment</option>
                  <option value="neutral">Aggressive Escalation (All Negative Sentiment)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Theme, Palette & Role Info */}
        <div className="space-y-6">
          {/* Appearance & Themes */}
          <div className="theme-card rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[var(--border-subtle)]">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">Theme & Visual Style</h2>
                <p className="text-[11px] text-[var(--text-muted)]">Customize workspace accent color & mode</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">
                  Appearance Mode
                </label>
                <button
                  onClick={toggleMode}
                  className="w-full py-2.5 px-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-between"
                >
                  <span>Active Mode: {mode === "dark" ? "Dark Mode 🌙" : "Bright / Light Mode ☀️"}</span>
                  <span className="text-[10px] text-indigo-500 underline">Switch</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">
                  Accent Color Palette
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "indigo" as ColorTheme, name: "Indigo", color: "#6366f1" },
                    { id: "emerald" as ColorTheme, name: "Emerald", color: "#10b981" },
                    { id: "sunset" as ColorTheme, name: "Sunset", color: "#f43f5e" },
                    { id: "sapphire" as ColorTheme, name: "Sapphire", color: "#0284c7" },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        theme === t.id
                          ? "bg-[var(--bg-hover)] text-[var(--text-primary)] font-bold border-[var(--accent-primary)] shadow-xs"
                          : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: t.color }} />
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security & Access Info */}
          <div className="theme-card rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <Shield className="w-5 h-5 text-indigo-500" />
              <h3 className="text-xs font-bold text-[var(--text-primary)]">Role Authorization Status</h3>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              RBAC enforcement is active. Settings modifications and credential creation are restricted to System Admins.
            </p>
          </div>

          {/* Support Agent Credential Generator (Admin Only) */}
          {isAdmin && (
            <div className="theme-card rounded-2xl bg-[var(--bg-surface)] border border-purple-500/30 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">Agent Credential Generator</h2>
                    <p className="text-[11px] text-purple-400 font-bold">Admin Exclusive Privileges</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateAgentCredentials} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">Agent Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={newAgentName}
                    onChange={e => setNewAgentName(e.target.value)}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">Agent Email / Username</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah.support@company.com"
                    value={newAgentEmail}
                    onChange={e => setNewAgentEmail(e.target.value)}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text-secondary)] mb-1">Assigned Support Role</label>
                  <select
                    value={newAgentRole}
                    onChange={e => setNewAgentRole(e.target.value)}
                    className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                  >
                    <option value="Support Agent">Support Agent</option>
                    <option value="Support Lead">Support Lead</option>
                    <option value="Logistics Specialist">Logistics Specialist</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl gradient-btn text-white font-bold shadow-md hover:scale-[1.02] transition-transform"
                >
                  ⚡ Generate Agent Credentials
                </button>
              </form>

              {/* Roster Table */}
              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block">Active Agent Credentials ({agentList.length})</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {agentList.map(agent => (
                    <div key={agent.id} className="p-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[var(--text-primary)]">{agent.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{agent.email} • <span className="text-purple-400 font-bold">{agent.role}</span></p>
                      </div>
                      <button
                        onClick={() => handleCopyPass(agent.passKey, agent.id)}
                        className="px-2 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] font-mono text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === agent.id ? (
                          <span className="text-emerald-500 font-bold">Copied!</span>
                        ) : (
                          <>
                            <Key className="w-3 h-3" />
                            <span>Copy Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
