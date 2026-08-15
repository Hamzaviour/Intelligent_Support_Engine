"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Ticket as TicketIcon,
  Search,
  Plus,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react"

interface Ticket {
  id: string
  subject: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  createdAt: Date
  updatedAt: Date
  customerName: string
  customerEmail: string
  assignedAgent?: string
  sentiment?: "positive" | "neutral" | "negative"
  aiSummary?: string
}

interface TicketListProps {
  tickets?: Ticket[]
  onSelect?: (ticket: Ticket) => void
}

const defaultTickets: Ticket[] = [
  {
    id: "TKT-001",
    subject: "Refund request for order #12345",
    description: "I would like to request a refund for my recent order. The product was damaged during shipping.",
    status: "open",
    priority: "high",
    category: "Refund",
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
    customerName: "Alex Morgan",
    customerEmail: "alex.morgan@example.com",
    sentiment: "negative",
    aiSummary: "Customer requesting refund for damaged item. Order #12345.",
  },
  {
    id: "TKT-002",
    subject: "Technical issue with login",
    description: "I cannot log into my account. Getting error code 500.",
    status: "in_progress",
    priority: "urgent",
    category: "Technical",
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    updatedAt: new Date(Date.now() - 1000 * 60 * 3),
    customerName: "Sarah Smith",
    customerEmail: "sarah@example.com",
    assignedAgent: "Sarah Connor (Support Lead)",
    sentiment: "negative",
    aiSummary: "Login issue with error code 500. Needs technical investigation.",
  },
  {
    id: "TKT-003",
    subject: "Track my order #98765",
    description: "When will my order be delivered?",
    status: "resolved",
    priority: "low",
    category: "Order Status",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10),
    customerName: "Mike Johnson",
    customerEmail: "mike@example.com",
    assignedAgent: "KnowledgeAgent (AI)",
    sentiment: "neutral",
    aiSummary: "Customer inquiring about order delivery status. Answered by AI.",
  },
  {
    id: "TKT-004",
    subject: "Product quality complaint",
    description: "The product quality does not match the description.",
    status: "open",
    priority: "medium",
    category: "Quality",
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45),
    customerName: "Emily Davis",
    customerEmail: "emily@example.com",
    sentiment: "negative",
    aiSummary: "Customer complaint about product quality not matching description.",
  },
]

import { useTickets, Ticket as TicketType } from "@/lib/TicketContext"
import { CreateTicketModal } from "./CreateTicketModal"

export function TicketList({ tickets: propTickets, onSelect }: TicketListProps) {
  const { tickets: contextTickets, updateTicketStatus } = useTickets()
  const tickets = propTickets || contextTickets
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"newest" | "priority">("newest")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredTickets = tickets
    .filter(t => {
      const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
                           t.id.toLowerCase().includes(search.toLowerCase()) ||
                           t.customerName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || t.status === statusFilter
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return b.createdAt.getTime() - a.createdAt.getTime()
    })

  const statusConfig = {
    open: { label: "Open", color: "bg-amber-500/10 text-amber-500 border border-amber-500/20", icon: AlertCircle },
    in_progress: { label: "In Progress", color: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20", icon: Clock },
    resolved: { label: "Resolved", color: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20", icon: CheckCircle2 },
    closed: { label: "Closed", color: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]", icon: CheckCircle2 },
  }

  const priorityConfig = {
    low: { label: "Low", color: "bg-[var(--bg-elevated)] text-[var(--text-muted)]" },
    medium: { label: "Medium", color: "bg-indigo-500/10 text-indigo-500" },
    high: { label: "High", color: "bg-amber-500/10 text-amber-500" },
    urgent: { label: "Urgent", color: "bg-rose-500/10 text-rose-500 font-bold" },
  }

  return (
    <div className="space-y-4 font-sans relative">
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Ticket Queue Management</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{tickets.length} total customer tickets logged</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl gradient-btn shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by subject, ID, or customer..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-xs"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-xs"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "newest" | "priority")}
          className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-xs"
        >
          <option value="newest">Newest First</option>
          <option value="priority">Highest Priority</option>
        </select>
      </div>

      {/* Support Agent Quick Presets */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mr-1">Agent Presets:</span>
        <button
          onClick={() => { setStatusFilter("all"); setPriorityFilter("all"); setSearch("") }}
          className="px-3 py-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] font-semibold transition-colors"
        >
          All Tickets
        </button>
        <button
          onClick={() => { setPriorityFilter("urgent"); setStatusFilter("all") }}
          className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold hover:bg-rose-500/20 transition-colors flex items-center gap-1"
        >
          <span>🚨 Urgent Queue</span>
        </button>
        <button
          onClick={() => { setSearch("refund") }}
          className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
        >
          <span>💳 Refund Requests</span>
        </button>
        <button
          onClick={() => { setStatusFilter("open") }}
          className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold hover:bg-amber-500/20 transition-colors flex items-center gap-1"
        >
          <span>⚠️ Unresolved Open</span>
        </button>
      </div>

      {/* Tickets Container */}
      <div className="theme-card rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden shadow-sm">
        <div className="divide-y divide-[var(--border-subtle)]">
          <AnimatePresence>
            {filteredTickets.map((ticket, index) => {
              const StatusIcon = statusConfig[ticket.status].icon
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => onSelect?.(ticket)}
                  className="p-4 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer flex items-center gap-4 group"
                >
                  {/* Priority Indicator Pill */}
                  <div className={`w-1.5 h-10 rounded-full ${
                    ticket.priority === "urgent" ? "bg-rose-500" :
                    ticket.priority === "high" ? "bg-amber-500" :
                    ticket.priority === "medium" ? "bg-indigo-500" :
                    "bg-[var(--text-disabled)]"
                  }`} />

                  {/* Main Ticket Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[var(--text-muted)] font-mono font-bold">{ticket.id}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${priorityConfig[ticket.priority].color}`}>
                        {ticket.priority}
                      </span>
                      {ticket.sentiment && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          ticket.sentiment === "negative" ? "bg-rose-500/10 text-rose-500" :
                          ticket.sentiment === "positive" ? "bg-emerald-500/10 text-emerald-500" :
                          "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                        }`}>
                          {ticket.sentiment} sentiment
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-primary)] transition-colors">{ticket.subject}</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{ticket.customerName} ({ticket.customerEmail}) • {ticket.category}</p>
                    {ticket.aiSummary && (
                      <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-1 italic bg-[var(--bg-base)] px-2 py-1 rounded-lg border border-[var(--border-subtle)] inline-block">
                        AI Summary: {ticket.aiSummary}
                      </p>
                    )}
                  </div>

                  {/* Status, Reopen Button & Timestamp */}
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full ${statusConfig[ticket.status].color}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusConfig[ticket.status].label}</span>
                      </div>

                      {(ticket.status === "closed" || ticket.status === "resolved") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateTicketStatus(ticket.id, "open", { aiSummary: "Reopened from Ticket Queue by staff." })
                          }}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 transition-all flex items-center gap-1 hover:scale-105 shadow-xs"
                          title="Reopen Ticket & Move to Open Queue"
                        >
                          <span>🔓 Reopen</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
                      {ticket.createdAt.toLocaleDateString()} {ticket.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {ticket.assignedAgent && (
                      <p className="text-[10px] text-purple-500 font-bold mt-0.5">{ticket.assignedAgent}</p>
                    )}
                  </div>

                  {/* Action Icon */}
                  <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-[var(--bg-elevated)]">
                    <Eye className="w-4 h-4" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {filteredTickets.length === 0 && (
          <div className="p-10 text-center">
            <TicketIcon className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3 opacity-60" />
            <p className="text-xs font-bold text-[var(--text-primary)]">No tickets match your filters</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Try adjusting your search criteria or resetting filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
