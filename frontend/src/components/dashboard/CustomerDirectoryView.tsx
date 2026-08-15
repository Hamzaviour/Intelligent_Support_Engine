"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Search,
  Crown,
  Mail,
  ShoppingBag,
  DollarSign,
  Clock,
  Ticket,
} from "lucide-react"

interface CustomerProfile {
  id: string
  name: string
  email: string
  tier: "VIP Gold" | "VIP Silver" | "Standard Customer"
  totalOrders: number
  lifetimeValue: number
  totalTickets: number
  lastContact: string
  sentiment: "positive" | "neutral" | "negative"
}

const CUSTOMERS: CustomerProfile[] = [
  {
    id: "CUST-101",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    tier: "VIP Gold",
    totalOrders: 14,
    lifetimeValue: 5420.00,
    totalTickets: 3,
    lastContact: "23 min ago",
    sentiment: "negative",
  },
  {
    id: "CUST-102",
    name: "Sarah Smith",
    email: "sarah@example.com",
    tier: "VIP Silver",
    totalOrders: 8,
    lifetimeValue: 2150.00,
    totalTickets: 2,
    lastContact: "45 min ago",
    sentiment: "negative",
  },
  {
    id: "CUST-103",
    name: "Mike Johnson",
    email: "mike@example.com",
    tier: "Standard Customer",
    totalOrders: 5,
    lifetimeValue: 890.00,
    totalTickets: 1,
    lastContact: "2 hours ago",
    sentiment: "positive",
  },
  {
    id: "CUST-104",
    name: "Emily Davis",
    email: "emily@example.com",
    tier: "Standard Customer",
    totalOrders: 3,
    lifetimeValue: 420.00,
    totalTickets: 2,
    lastContact: "3 hours ago",
    sentiment: "neutral",
  },
]

export function CustomerDirectoryView() {
  const [search, setSearch] = useState("")
  const [tierFilter, setTierFilter] = useState<string>("all")

  const filteredCustomers = CUSTOMERS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.email.toLowerCase().includes(search.toLowerCase()) ||
                          c.id.toLowerCase().includes(search.toLowerCase())
    const matchesTier = tierFilter === "all" || c.tier === tierFilter
    return matchesSearch && matchesTier
  })

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Customer Directory & CRM Profiles</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Lookup customer tiers, lifetime order value, and ticket history</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customers by name, email, or customer ID..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-xs"
          />
        </div>

        <div className="flex gap-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-1 rounded-xl shadow-xs">
          {["all", "VIP Gold", "VIP Silver", "Standard Customer"].map(tier => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                tierFilter === tier
                  ? "gradient-btn shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Directory Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.map(cust => (
          <motion.div
            key={cust.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="theme-card rounded-2xl p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-btn flex items-center justify-center text-white font-bold text-base shadow-md">
                {cust.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{cust.name}</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    {cust.tier}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] truncate">{cust.email} • {cust.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border-subtle)] text-center text-xs">
              <div className="bg-[var(--bg-base)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Orders</span>
                <span className="font-bold text-[var(--text-primary)]">{cust.totalOrders} placed</span>
              </div>

              <div className="bg-[var(--bg-base)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Lifetime Value</span>
                <span className="font-bold text-emerald-500">${cust.lifetimeValue.toFixed(2)}</span>
              </div>

              <div className="bg-[var(--bg-base)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Total Tickets</span>
                <span className="font-bold text-indigo-400">{cust.totalTickets} logged</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
