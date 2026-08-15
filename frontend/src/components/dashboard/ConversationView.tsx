"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Clock,
  Paperclip,
  Send,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Check,
} from "lucide-react"
import { MessageBubble } from "@/app/components/chat/MessageBubble"
import { TypingIndicator } from "@/app/components/chat/TypingIndicator"
import { AISummary } from "./AISummary"
import { useTickets } from "@/lib/TicketContext"
import { useAuth, isTechLeadUser } from "@/lib/AuthContext"

interface Message {
  id: string
  role: "user" | "assistant" | "agent"
  content: string
  timestamp: Date
  agent?: string
}

interface ConversationViewProps {
  conversationId: string
  customerId?: string
  onBack?: () => void
}

export function ConversationView({ conversationId, onBack }: ConversationViewProps) {
  const { user } = useAuth()
  const isTechLead = isTechLeadUser(user)
  const { tickets, updateTicketStatus, approveRefund, escalateTicket, closeTicket } = useTickets()
  const targetTicket = tickets.find(t => t.id === conversationId) || tickets[0]

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "user",
      content: targetTicket ? `Hi, I need help regarding: ${targetTicket.subject}` : "Hi, I need help with a refund for my order #12345. The item arrived damaged.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "2",
      role: "assistant",
      content: "I'm sorry to hear about this issue. I'd be happy to help you resolve this right away. Let me look up your order details.",
      timestamp: new Date(Date.now() - 1000 * 60 * 28),
      agent: "Conversation Agent",
    },
    {
      id: "3",
      role: "user",
      content: "Thank you. The product damaged and needs attention.",
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
    },
    {
      id: "4",
      role: "assistant",
      content: "I understand. I've found your account. I can process a full refund or escalate to senior staff. Would you like me to proceed?",
      timestamp: new Date(Date.now() - 1000 * 60 * 22),
      agent: "Refund Agent",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [ticketStatusLabel, setTicketStatusLabel] = useState(targetTicket ? targetTicket.status.toUpperCase() : "OPEN")
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  const showToast = (text: string) => {
    setActionFeedback(text)
    setTimeout(() => setActionFeedback(null), 3500)
  }

  const handleSend = async () => {
    if (!messageInput.trim() || isLoading) return

    const agentMessage: Message = {
      id: Date.now().toString(),
      role: "agent",
      content: messageInput,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, agentMessage])
    setMessageInput("")
    setIsLoading(true)

    // Simulate system/assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Thank you for your update. Your request is logged and updated in the system.",
        timestamp: new Date(),
        agent: "Human Support Agent",
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1200)
  }

  // Quick Action Handlers (modifies global TicketContext state!)
  const handleApproveRefund = () => {
    const targetId = targetTicket?.id || "TKT-001"
    approveRefund(targetId, 89.99)
    setTicketStatusLabel("RESOLVED / REFUND APPROVED")

    const msg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "✅ **Refund Approved**: Full refund of $89.99 has been approved and dispatched. Ticket status set to RESOLVED.",
      timestamp: new Date(),
      agent: "Refund Agent (Action)",
    }
    setMessages(prev => [...prev, msg])
    showToast("✅ Refund approved & ticket status updated to RESOLVED!")
  }

  const handleRequestInfo = () => {
    const targetId = targetTicket?.id || "TKT-001"
    updateTicketStatus(targetId, "in_progress", { aiSummary: "Awaiting customer photos/info." })
    setTicketStatusLabel("IN PROGRESS - INFO REQUESTED")

    const msg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "ℹ️ **Information Requested**: Please provide a photo of the damaged package so our claims team can finalize inspection.",
      timestamp: new Date(),
      agent: "Support Specialist",
    }
    setMessages(prev => [...prev, msg])
    showToast("ℹ️ Information request sent to customer & ticket set to IN PROGRESS.")
  }

  const handleEscalate = () => {
    const targetId = targetTicket?.id || "TKT-001"
    escalateTicket(targetId, "Sarah Connor (Support Lead)")
    setTicketStatusLabel("IN PROGRESS - URGENT ESCALATION")

    const msg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "🚨 **Escalated**: Ticket transferred to Support Lead Sarah Connor for priority resolution.",
      timestamp: new Date(),
      agent: "Escalation Agent",
    }
    setMessages(prev => [...prev, msg])
    showToast("🚨 Ticket escalated to Support Lead & status updated!")
  }

  const handleCloseTicket = () => {
    const targetId = targetTicket?.id || "TKT-001"
    closeTicket(targetId)
    setTicketStatusLabel("CLOSED")

    const msg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "🔒 **Ticket Closed**: Issue marked as fully resolved and archived in system.",
      timestamp: new Date(),
      agent: "Ticket Agent",
    }
    setMessages(prev => [...prev, msg])
    showToast("🔒 Ticket closed & status updated to RESOLVED!")

    // Immediately navigate back to Tickets page
    if (onBack) {
      onBack()
    }
  }

  const handleReopenTicket = () => {
    const targetId = targetTicket?.id || "TKT-001"
    updateTicketStatus(targetId, "open", { aiSummary: "Ticket reopened by staff." })
    setTicketStatusLabel("OPEN")

    const msg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "🔓 **Ticket Reopened**: Ticket has been restored to active queue.",
      timestamp: new Date(),
      agent: "Ticket Agent",
    }
    setMessages(prev => [...prev, msg])
    showToast("🔓 Ticket reopened and status set to OPEN!")
  }

  const handleTechLeadOverride = () => {
    const targetId = targetTicket?.id || "TKT-001"
    updateTicketStatus(targetId, "resolved", {
      priority: "urgent",
      aiSummary: "Tech Lead override: System limits bypassed, executive resolution granted.",
      refundAmount: 250.00,
    })
    setTicketStatusLabel("RESOLVED (TECH LEAD OVERRIDE)")
    const msg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "⚡ **Tech Lead Superuser Override**: Executive resolution granted. System threshold limits bypassed ($250.00 override processed).",
      timestamp: new Date(),
      agent: "David Tech (Tech Lead)",
    }
    setMessages(prev => [...prev, msg])
    showToast("⚡ Tech Lead superuser override applied!")
  }

  const handleAISummaryAction = (action: string) => {
    if (action.includes("Approve")) handleApproveRefund()
    else if (action.includes("Escalate")) handleEscalate()
    else handleRequestInfo()
  }

  const [isInternalNote, setIsInternalNote] = useState(false)

  const smartReplies = [
    { label: "⚡ Apologize & Approve Refund", text: "I'm deeply sorry for the damaged package. I have processed a full refund of $89.99 to your original payment method." },
    { label: "⚡ Request Photo Proof", text: "To finalize your claims request, could you please upload or send a photo showing the package damage?" },
    { label: "⚡ Offer Replacement", text: "We can immediately dispatch a priority replacement item to your address at no extra cost. Would you prefer a replacement?" },
  ]

  const handleSendResponse = async () => {
    if (!messageInput.trim() || isLoading) return

    if (isInternalNote) {
      const internalMsg: Message = {
        id: Date.now().toString(),
        role: "agent",
        content: `🔒 **Internal Staff Note**: ${messageInput}`,
        timestamp: new Date(),
        agent: "Staff Private Note",
      }
      setMessages(prev => [...prev, internalMsg])
      setMessageInput("")
      showToast("🔒 Private internal note saved to ticket history.")
      return
    }

    const agentMessage: Message = {
      id: Date.now().toString(),
      role: "agent",
      content: messageInput,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, agentMessage])
    setMessageInput("")
    setIsLoading(true)

    // Simulate system/assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Thank you for your update. Your request is logged and updated in the system.",
        timestamp: new Date(),
        agent: "Human Support Agent",
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1200)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full font-sans relative">
      {/* Toast Feedback Notification */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{actionFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversation Panel */}
      <div className="lg:col-span-2 flex flex-col theme-card rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-xl hover:bg-[var(--bg-hover)]"
              title="Back to Tickets List"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-btn flex items-center justify-center text-white shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[var(--text-primary)]">Customer Conversation</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  {ticketStatusLabel}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Order #12345 • Ticket ID: TKT-001</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>23 min ago</span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-base)]/50">
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={{
                  ...message,
                  role: message.role === "agent" ? "user" : message.role,
                }}
              />
            ))}
          </AnimatePresence>
          {isLoading && <TypingIndicator />}
          <div ref={(el) => el?.scrollIntoView({ behavior: "smooth" })} />
        </div>

        {/* AI Smart Replies & Reply Input */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
          {/* AI Smart Reply Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px] mr-1">AI Smart Replies:</span>
            {smartReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => setMessageInput(reply.text)}
                className="px-2.5 py-1 rounded-lg theme-card bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all font-medium text-[11px] border border-[var(--border-subtle)]"
              >
                {reply.label}
              </button>
            ))}
          </div>

          {/* Mode Switcher & Input */}
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => setIsInternalNote(false)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                !isInternalNote
                  ? "bg-[var(--accent-primary)] text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              💬 Public Reply
            </button>
            <button
              onClick={() => setIsInternalNote(true)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                isInternalNote
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              🔒 Internal Private Note
            </button>
          </div>

          <div className="flex gap-2.5">
            <button className="p-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-xl hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendResponse()}
              placeholder={isInternalNote ? "Type private internal staff note (visible only to agents)..." : "Type public customer response... (Press Enter to send)"}
              className={`flex-1 border rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition-all shadow-xs ${
                isInternalNote
                  ? "bg-amber-500/10 border-amber-500/30 focus:ring-2 focus:ring-amber-500"
                  : "bg-[var(--bg-base)] border-[var(--border-default)] focus:ring-2 focus:ring-[var(--accent-primary)]"
              }`}
              disabled={isLoading}
            />
            <button
              onClick={handleSendResponse}
              disabled={!messageInput.trim() || isLoading}
              className={`px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 font-bold text-xs ${
                isInternalNote ? "bg-amber-500 hover:bg-amber-600" : "gradient-btn"
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{isInternalNote ? "Save Note" : "Send"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Customer Profile & Quick Actions */}
      <div className="space-y-4">
        {/* Customer Info Card */}
        <div className="theme-card rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full gradient-btn flex items-center justify-center text-white font-bold text-sm shadow-xs">
              AM
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Alex Morgan</h3>
              <p className="text-xs text-[var(--text-muted)]">alex.morgan@example.com</p>
            </div>
          </div>
          <div className="space-y-2 text-xs border-t border-[var(--border-subtle)] pt-3">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Customer Tier</span>
              <span className="text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-[10px]">
                👑 VIP Gold
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Total Orders</span>
              <span className="text-[var(--text-primary)] font-bold">12 orders</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Lifetime Value</span>
              <span className="text-emerald-500 font-bold">$5,420.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Last Contact</span>
              <span className="text-[var(--text-primary)]">23 min ago</span>
            </div>
          </div>
        </div>

        {/* AI Intelligence Summary */}
        <AISummary
          sentiment="negative"
          confidence={94}
          intent="refund"
          escalation={ticketStatusLabel.includes("ESCALAT")}
          onAction={handleAISummaryAction}
        />

        {/* Quick Actions Panel */}
        <div className="theme-card rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 shadow-sm">
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider">
            Staff Quick Actions
          </h3>
          <div className="space-y-2">
            <button
              onClick={handleApproveRefund}
              className="w-full py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded-xl transition-all border border-emerald-500/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Refund ($89.99)</span>
            </button>

            <button
              onClick={handleRequestInfo}
              className="w-full py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold rounded-xl transition-all border border-amber-500/20 flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Request More Info</span>
            </button>

            {isTechLead && (
              <button
                onClick={handleTechLeadOverride}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 text-purple-400 text-xs font-bold rounded-xl transition-all border border-purple-500/30 flex items-center justify-center gap-2 shadow-xs"
              >
                <span>⚡ System Admin Superuser Override ($250+)</span>
              </button>
            )}

            <button
              onClick={handleEscalate}
              className="w-full py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold rounded-xl transition-all border border-rose-500/20 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Escalate to Lead</span>
            </button>

            <button
              onClick={handleCloseTicket}
              className="w-full py-2.5 px-3 bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] text-xs font-bold rounded-xl transition-all border border-[var(--border-subtle)] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Close Ticket & Return to Queue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
