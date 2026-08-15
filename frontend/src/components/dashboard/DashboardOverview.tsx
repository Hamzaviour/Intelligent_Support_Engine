"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Ticket,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
} from "lucide-react"
import { useTickets, Ticket as TicketItem } from "@/lib/TicketContext"

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "up" | "down" | "neutral"
  icon: React.ReactNode
  iconColor?: string
}

function MetricCard({ title, value, change, changeType = "neutral", icon, iconColor = "text-[var(--accent-primary)]" }: MetricCardProps) {
  const changeColors = {
    up: "text-emerald-500",
    down: "text-rose-500",
    neutral: "text-[var(--text-muted)]",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="theme-card rounded-2xl p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[var(--text-muted)]">{title}</span>
        <div className={`w-8 h-8 bg-[var(--bg-elevated)] rounded-xl flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-[var(--text-primary)]">{value}</span>
        {change && (
          <span className={`text-[11px] font-bold mb-1 ${changeColors[changeType]}`}>
            {changeType === "up" ? <TrendingUp className="w-3 h-3 inline mr-0.5" /> :
             changeType === "down" ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : null}
            {change}
          </span>
        )}
      </div>
    </motion.div>
  )
}



export function DashboardOverview() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d")
  const { tickets } = useTickets()

  const getTimeCutoff = (range: "24h" | "7d" | "30d") => {
    const now = Date.now()
    if (range === "24h") return now - 1000 * 60 * 60 * 24
    if (range === "7d") return now - 1000 * 60 * 60 * 24 * 7
    return now - 1000 * 60 * 60 * 24 * 30
  }

  const cutoff = getTimeCutoff(timeRange)
  const rangeTickets = tickets.filter(t => t.createdAt.getTime() >= cutoff)
  const activeTickets = rangeTickets.length > 0 ? rangeTickets : tickets

  const openTicketsCount = activeTickets.filter(t => t.status === "open").length
  const resolvedCount = activeTickets.filter(t => t.status === "resolved" || t.status === "closed").length
  const escalatedCount = activeTickets.filter(t => t.status === "in_progress" || t.priority === "urgent").length

  const avgResponseMap = { "24h": "1.1 min", "7d": "1.8 min", "30d": "2.4 min" }
  const csatMap = { "24h": "4.9", "7d": "4.8", "30d": "4.7" }

  const stats = {
    totalTickets: activeTickets.length,
    openTickets: openTicketsCount,
    avgResponseTime: avgResponseMap[timeRange],
    satisfactionScore: csatMap[timeRange],
    resolvedToday: resolvedCount,
    escalationRate: `${((escalatedCount / Math.max(activeTickets.length, 1)) * 100).toFixed(1)}%`,
  }

  const recentTickets = activeTickets.slice(0, 5)

  const statusColors = {
    open: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    in_progress: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
    resolved: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    closed: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]",
  }

  const priorityColors = {
    low: "bg-[var(--bg-elevated)] text-[var(--text-muted)]",
    medium: "bg-indigo-500/10 text-indigo-500",
    high: "bg-amber-500/10 text-amber-500",
    urgent: "bg-rose-500/10 text-rose-500 font-bold",
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Operations Dashboard</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Real-time support telemetry & 10-Agent orchestra overview</p>
        </div>
        <div className="flex gap-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-1 shadow-xs">
          {(["24h", "7d", "30d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === range
                  ? "gradient-btn shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Tickets"
          value={stats.totalTickets}
          change="+12%"
          changeType="up"
          icon={<Ticket className="w-4 h-4" />}
          iconColor="text-indigo-500"
        />
        <MetricCard
          title="Open"
          value={stats.openTickets}
          change="-3"
          changeType="down"
          icon={<AlertCircle className="w-4 h-4" />}
          iconColor="text-amber-500"
        />
        <MetricCard
          title="Avg Response"
          value={stats.avgResponseTime}
          change="-0.3 min"
          changeType="up"
          icon={<Clock className="w-4 h-4" />}
          iconColor="text-purple-500"
        />
        <MetricCard
          title="Satisfaction"
          value={stats.satisfactionScore}
          change="+0.2"
          changeType="up"
          icon={<Star className="w-4 h-4" />}
          iconColor="text-amber-400"
        />
        <MetricCard
          title="Resolved Today"
          value={stats.resolvedToday}
          change="+5"
          changeType="up"
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconColor="text-emerald-500"
        />
        <MetricCard
          title="Escalation"
          value={stats.escalationRate}
          icon={<AlertCircle className="w-4 h-4" />}
          iconColor="text-rose-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <div className="lg:col-span-2 theme-card rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Recent Live Tickets</h2>
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">Auto-Categorized</span>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {recentTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[var(--text-muted)] font-mono font-bold">{ticket.id}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{ticket.subject}</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">{ticket.customerName} • {ticket.createdAt.toLocaleTimeString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${statusColors[ticket.status]}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="theme-card rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Multi-Agent Activity Feed</h2>
          </div>
          <div className="p-4 space-y-4">
            {[
              { action: "Ticket Created", detail: "Refund request from Alex Morgan", time: "2 min ago", type: "ticket" },
              { action: "Agent Escalation Triggered", detail: "TKT-002 transferred to Support Lead", time: "15 min ago", type: "escalation" },
              { action: "Session Resolved", detail: "Order tracking inquiry answered by KnowledgeAgent", time: "32 min ago", type: "resolved" },
              { action: "CSAT Rating Submitted", detail: "5-star rating recorded on turn", time: "1 hour ago", type: "feedback" },
              { action: "Agent Joined", detail: "Support lead Sarah Connor active", time: "2 hours ago", type: "agent" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-3"
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  item.type === "ticket" ? "bg-indigo-500" :
                  item.type === "escalation" ? "bg-rose-500" :
                  item.type === "resolved" ? "bg-emerald-500" :
                  item.type === "feedback" ? "bg-amber-400" :
                  "bg-purple-500"
                }`} />
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">{item.action}</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">{item.detail}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
