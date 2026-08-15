"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "up" | "down" | "neutral"
  icon: React.ReactNode
  iconColor?: string
}

function MetricCard({ title, value, change, changeType = "neutral", icon, iconColor = "text-indigo-500" }: MetricCardProps) {
  const changeColors = {
    up: "text-emerald-500",
    down: "text-rose-500",
    neutral: "text-[var(--text-muted)]",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="theme-card rounded-2xl p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm font-sans"
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



const sentimentData = [
  { name: "Positive", value: 45, color: "#10b981" },
  { name: "Neutral", value: 35, color: "#6366f1" },
  { name: "Negative", value: 20, color: "#f43f5e" },
]

const intentData = [
  { name: "Refund", value: 25 },
  { name: "Tracking", value: 30 },
  { name: "Technical", value: 20 },
  { name: "General", value: 15 },
  { name: "Complaint", value: 10 },
]

export function MetricsDashboard() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "90d">("7d")

  const rangeMultiplier = timeRange === "24h" ? 0.2 : timeRange === "7d" ? 1 : timeRange === "30d" ? 4.2 : 12

  const stats = {
    totalConversations: Math.round(333 * (rangeMultiplier / 1)),
    avgResponseTime: timeRange === "24h" ? "1.1 min" : timeRange === "7d" ? "1.8 min" : "2.3 min",
    satisfactionScore: timeRange === "24h" ? "4.9/5" : timeRange === "7d" ? "4.6/5" : "4.7/5",
    resolutionRate: timeRange === "24h" ? "96.4%" : timeRange === "7d" ? "94.2%" : "92.8%",
    firstContactResolution: timeRange === "24h" ? "82%" : timeRange === "7d" ? "78%" : "75%",
    escalationRate: timeRange === "24h" ? "1.8%" : timeRange === "7d" ? "3.2%" : "4.1%",
  }

  const conversationData = [
    { name: "Mon", conversations: Math.round(45 * rangeMultiplier), resolved: Math.round(42 * rangeMultiplier) },
    { name: "Tue", conversations: Math.round(52 * rangeMultiplier), resolved: Math.round(48 * rangeMultiplier) },
    { name: "Wed", conversations: Math.round(38 * rangeMultiplier), resolved: Math.round(35 * rangeMultiplier) },
    { name: "Thu", conversations: Math.round(65 * rangeMultiplier), resolved: Math.round(60 * rangeMultiplier) },
    { name: "Fri", conversations: Math.round(71 * rangeMultiplier), resolved: Math.round(68 * rangeMultiplier) },
    { name: "Sat", conversations: Math.round(34 * rangeMultiplier), resolved: Math.round(32 * rangeMultiplier) },
    { name: "Sun", conversations: Math.round(28 * rangeMultiplier), resolved: Math.round(26 * rangeMultiplier) },
  ]

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">System Analytics & CSAT</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Performance telemetry across 10 autonomous agents</p>
        </div>
        <div className="flex gap-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-1 shadow-xs">
          {(["24h", "7d", "30d", "90d"] as const).map((range) => (
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
          title="Conversations"
          value={stats.totalConversations}
          change="+12%"
          changeType="up"
          icon={<MessageSquare className="w-4 h-4" />}
          iconColor="text-indigo-500"
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
          title="Resolution"
          value={stats.resolutionRate}
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconColor="text-emerald-500"
        />
        <MetricCard
          title="FCR Rate"
          value={stats.firstContactResolution}
          icon={<Users className="w-4 h-4" />}
          iconColor="text-cyan-500"
        />
        <MetricCard
          title="Escalation"
          value={stats.escalationRate}
          change="-0.5%"
          changeType="down"
          icon={<AlertCircle className="w-4 h-4" />}
          iconColor="text-rose-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Trend */}
        <div className="theme-card rounded-2xl p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Conversations Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={conversationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "12px", color: "var(--text-primary)", fontSize: "12px" }}
                labelStyle={{ color: "var(--text-muted)", fontWeight: "bold" }}
              />
              <Legend />
              <Line type="monotone" dataKey="conversations" stroke="#6366f1" strokeWidth={2.5} name="Total" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2.5} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Distribution */}
        <div className="theme-card rounded-2xl p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={6}
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "12px", color: "var(--text-primary)", fontSize: "12px" }}
                labelStyle={{ color: "var(--text-muted)" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Intent Breakdown */}
        <div className="theme-card rounded-2xl p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Intent Classification Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={intentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "12px", color: "var(--text-primary)", fontSize: "12px" }}
                labelStyle={{ color: "var(--text-muted)" }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Inquiries" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Support Staff */}
        <div className="theme-card rounded-2xl p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Top Agent Performance</h3>
          <div className="space-y-3">
            {[
              { name: "Sarah Connor", role: "Support Lead", conversations: 142, satisfaction: 4.9, resolved: "98%" },
              { name: "KnowledgeAgent", role: "RAG AI Agent", conversations: 128, satisfaction: 4.7, resolved: "96%" },
              { name: "David Tech", role: "Lead Engineer", conversations: 115, satisfaction: 4.8, resolved: "97%" },
              { name: "RefundAgent", role: "Automation AI", conversations: 98, satisfaction: 4.6, resolved: "95%" },
            ].map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-subtle)] bg-[var(--bg-base)]/40"
              >
                <span className="text-xs font-bold text-[var(--text-muted)] w-4 text-center">{i + 1}</span>
                <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center text-xs font-bold text-white shadow-xs">
                  {agent.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">{agent.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{agent.conversations} conversations • {agent.role}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">{agent.satisfaction}</span>
                  </div>
                  <p className="text-[10px] text-emerald-500 font-bold">{agent.resolved} resolved</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
