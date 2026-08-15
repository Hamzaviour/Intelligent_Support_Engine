"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Ticket } from "lucide-react"
import { useTickets, Ticket as TicketType } from "@/lib/TicketContext"

interface CreateTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (ticket: TicketType) => void
}

export function CreateTicketModal({ isOpen, onClose, onCreated }: CreateTicketModalProps) {
  const { addTicket } = useTickets()
  const [subject, setSubject] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [category, setCategory] = useState("Technical")
  const [priority, setPriority] = useState<TicketType["priority"]>("medium")
  const [description, setDescription] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !customerName.trim()) return

    addTicket({
      subject: subject.trim(),
      description: description.trim() || "No description provided.",
      status: "open",
      priority,
      category,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || `${customerName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      sentiment: priority === "urgent" ? "negative" : "neutral",
      aiSummary: `New ticket created for ${category.toLowerCase()} inquiry.`,
    })

    // Reset form & close
    setSubject("")
    setCustomerName("")
    setCustomerEmail("")
    setDescription("")
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg theme-card rounded-3xl p-6 bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl relative"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl gradient-btn flex items-center justify-center text-white shadow-md">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">Create Support Ticket</h2>
                <p className="text-xs text-[var(--text-muted)]">Log a new customer issue into the support queue</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[var(--text-primary)] mb-1">
                Ticket Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Cannot complete checkout / Refund request"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[var(--text-primary)] mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text-primary)] mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="alex.morgan@example.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[var(--text-primary)] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-xs"
                >
                  <option value="Refund">Refund Request</option>
                  <option value="Technical">Technical Issue</option>
                  <option value="Order Status">Order Status & Tracking</option>
                  <option value="Billing">Billing & Subscription</option>
                  <option value="Quality">Product Quality</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[var(--text-primary)] mb-1">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as TicketType["priority"])}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-xs"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Priority</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[var(--text-primary)] mb-1">
                Description / Customer Statement
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the issue reported by the customer..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-xs resize-none"
              />
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl theme-card text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-subtle)]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create & Log Ticket</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
