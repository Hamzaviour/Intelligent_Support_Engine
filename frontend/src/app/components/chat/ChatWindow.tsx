"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageBubble } from "./MessageBubble"
import { TypingIndicator } from "./TypingIndicator"
import { ChatInput } from "./ChatInput"
import { Navbar } from "@/components/layout/Navbar"
import { useAuth, isStaffUser } from "@/lib/AuthContext"
import { AgentInspectorDrawer } from "./AgentInspectorDrawer"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  agent?: string
  intent?: string
  sentiment?: string
  isStreaming?: boolean
}

interface ChatWindowProps {
  userId?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

const SUGGESTIONS = [
  { label: "💳 Request a Refund", value: "I would like to request a refund for order #12345." },
  { label: "📦 Track Package Status", value: "Can you help me check the delivery status of my package?" },
  { label: "🛠️ Technical Troubleshooting", value: "My product is having connection issues, how do I reset it?" },
  { label: "👤 Account & Subscription", value: "I need assistance changing my subscription plan details." },
]

function newSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return "sess-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2)
}

const WELCOME_MESSAGE = (sid: string): Message => ({
  id: "welcome",
  role: "assistant",
  content: "Hello! Welcome to Customer Support Concierge. I'm your dedicated support specialist. How can I assist you with your orders, refunds, billing, or technical queries today?",
  timestamp: new Date(),
  agent: "Support Concierge",
  intent: "general",
})

export default function ChatWindow({ userId: propUserId }: ChatWindowProps) {
  const { user } = useAuth()
  const isStaff = isStaffUser(user)
  const [sessionId, setSessionId] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "online" | "error">("connecting")
  const [isInspectorOpen, setIsInspectorOpen] = useState(false)

  const [lastMeta, setLastMeta] = useState<{
    agent?: string
    intent?: string
    sentiment?: string
    confidence?: number
    should_escalate?: boolean
    agents_evaluated?: any[]
  }>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Compute storage key for persistent customer chat history
  const activeUserId = user?.email || user?.user_id || propUserId || "guest"
  const storageKey = `ise_chat_history_${activeUserId}`

  // Load chat history on mount or when user changes
  useEffect(() => {
    const sid = newSessionId()
    setSessionId(sid)

    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const rehydrated = parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
          setMessages(rehydrated)
        } else {
          setMessages([WELCOME_MESSAGE(sid)])
        }
      } else {
        setMessages([WELCOME_MESSAGE(sid)])
      }
    } catch {
      setMessages([WELCOME_MESSAGE(sid)])
    }

    fetch(`${API_BASE.replace("/api/v1", "")}/health`)
      .then(r => setConnectionStatus(r.ok ? "online" : "error"))
      .catch(() => setConnectionStatus("error"))
  }, [activeUserId, storageKey])

  // Save chat history to localStorage whenever messages update
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages))
      } catch (e) {
        console.warn("Failed to save chat history", e)
      }
    }
  }, [messages, storageKey])

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Session actions
  const handleNewChat = () => {
    const sid = newSessionId()
    setSessionId(sid)
    const initial = [WELCOME_MESSAGE(sid)]
    setMessages(initial)
    try {
      localStorage.setItem(storageKey, JSON.stringify(initial))
    } catch {}
  }

  // Send message with SSE streaming
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !sessionId) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    if (abortControllerRef.current) abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, user_id: activeUserId, session_id: sessionId }),
        signal: abortControllerRef.current.signal,
      })

      if (response.ok && response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ""

        const assistantMsgId = `assistant-${Date.now()}`
        setMessages(prev => [...prev, {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          agent: "Support Concierge",
          isStreaming: true,
        }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const raw = decoder.decode(value, { stream: true })
          for (const line of raw.split("\n\n")) {
            const trimmed = line.trim()
            if (!trimmed) continue
            try {
              const data = JSON.parse(trimmed)

              if (data.type === "meta") {
                setLastMeta(data)
                setMessages(prev => prev.map(m =>
                  m.id === assistantMsgId
                    ? { ...m, agent: data.agent, intent: data.intent, sentiment: data.sentiment }
                    : m
                ))
              } else if (data.token !== undefined) {
                accumulated += data.token
                setMessages(prev => prev.map(m =>
                  m.id === assistantMsgId
                    ? { ...m, content: accumulated }
                    : m
                ))
              } else if (data.type === "done") {
                if (data.agents_evaluated) {
                  setLastMeta(prev => ({ ...prev, agents_evaluated: data.agents_evaluated }))
                }
                setMessages(prev => prev.map(m =>
                  m.id === assistantMsgId
                    ? { ...m, content: data.content ?? accumulated, isStreaming: false, agent: data.agent || m.agent, intent: data.intent || m.intent }
                    : m
                ))
              } else if (data.error) {
                setMessages(prev => prev.map(m =>
                  m.id === assistantMsgId
                    ? { ...m, content: `⚠️ ${data.error}`, isStreaming: false }
                    : m
                ))
              }
            } catch {
              if (trimmed) {
                accumulated += trimmed
                setMessages(prev => prev.map(m =>
                  m.id === assistantMsgId
                    ? { ...m, content: accumulated }
                    : m
                ))
              }
            }
          }
        }
      } else {
        const fallbackRes = await fetch(`${API_BASE}/chat/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, user_id: activeUserId, session_id: sessionId }),
        })
        const data = await fallbackRes.json()
        setLastMeta(data)
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.content || "I apologize, I'm currently unable to retrieve that information. Please try again shortly.",
          timestamp: new Date(),
          agent: data.agent || "Support Concierge",
          intent: data.intent || "general",
          sentiment: data.sentiment || "neutral",
        }])
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "I'm having trouble connecting to support services. Please check your connection.",
          timestamp: new Date(),
          agent: "Support Concierge",
        }])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isChatClosed = messages.length > 0 && messages[messages.length - 1]?.content?.includes("🔒 **Ticket Closed**")

  const handleReopenCustomerChat = () => {
    const reopenedMsg: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "🔓 **Session Reopened**: Your support chat has been reopened. How can we assist you further with your request?",
      timestamp: new Date(),
      agent: "Support Concierge",
      intent: "general",
    }
    setMessages(prev => [...prev, reopenedMsg])
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors font-sans overflow-hidden">
      {/* Top Global Navigation Bar */}
      <Navbar />

      {/* Sub Header Action Bar */}
      <div className="flex items-center justify-between px-6 py-2 bg-[var(--bg-surface)]/80 border-b border-[var(--border-subtle)] text-xs z-10">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connectionStatus === "online" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
          <span className="font-semibold text-[var(--text-secondary)]">
            {connectionStatus === "online" ? "24/7 Support Concierge Active" : "Connecting to Support..."}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">| Support Session</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Reopen Chat Button if closed */}
          {isChatClosed && (
            <button
              onClick={handleReopenCustomerChat}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all shadow-xs"
            >
              <span>🔓 Reopen Chat</span>
            </button>
          )}

          {/* Agent Inspector Toggle (Restricted to Staff Only) */}
          {isStaff && (
            <button
              onClick={() => setIsInspectorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all shadow-xs"
            >
              <span>🤖 Staff Inspector</span>
            </button>
          )}

          {/* Start New Session */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl theme-card border border-[var(--border-default)] hover:bg-[var(--bg-hover)] text-xs font-semibold transition-colors"
          >
            <span>✨ Clear / New Chat</span>
          </button>
        </div>
      </div>

      {/* ---------- Main Workspace ---------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* Customer Chat Feed Workspace */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-4xl w-full mx-auto">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLast={idx === messages.length - 1}
              />
            ))}

            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {!isChatClosed && messages.length <= 2 && (
            <div className="px-4 py-2 max-w-4xl w-full mx-auto">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block px-1">
                Suggested Support Actions:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(sug.value)}
                    className="text-left px-3.5 py-2.5 rounded-xl theme-card text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all font-medium flex items-center justify-between border border-[var(--border-subtle)]"
                  >
                    <span>{sug.label}</span>
                    <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar or Closed Session Reopen Banner */}
          <div className="max-w-4xl w-full mx-auto p-2">
            {isChatClosed ? (
              <div className="p-4 bg-[var(--bg-surface)] border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">This chat session is currently marked as closed</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">Do you need further assistance with your inquiry?</p>
                  </div>
                </div>
                <button
                  onClick={handleReopenCustomerChat}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl gradient-btn shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
                >
                  <span>🔓 Reopen Chat & Resume</span>
                </button>
              </div>
            ) : (
              <ChatInput onSend={sendMessage} isLoading={isLoading} />
            )}
          </div>
        </div>

        {/* Sidebar Multi-Agent Telemetry Panel (Restricted to Staff Only) */}
        {isStaff && (
          <aside className="w-80 border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 hidden lg:flex flex-col gap-5 overflow-y-auto">
            <div className="theme-card p-4 rounded-2xl border border-[var(--border-default)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user ? user.name.slice(0, 2).toUpperCase() : "ST"}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">
                    {user ? user.name : "Staff Operations"}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {user ? user.email : "Staff Member"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)] text-center text-xs">
                <div className="bg-[var(--bg-base)] p-2 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-muted)] block">Role</span>
                  <span className="font-bold text-amber-500">{user?.role || "Staff"}</span>
                </div>
                <div className="bg-[var(--bg-base)] p-2 rounded-xl border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-muted)] block">Telemetry</span>
                  <span className="font-bold text-emerald-500">Active</span>
                </div>
              </div>
            </div>

            {/* Multi-Agent Active Telemetry */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Multi-Agent Engine State
              </h4>
              <div className="theme-card p-4 rounded-2xl space-y-2.5 text-xs border border-[var(--border-default)]">
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span>Active Agent</span>
                  <span className="font-bold text-indigo-400">{lastMeta.agent || "Support Concierge"}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span>Evaluated Intent</span>
                  <span className="font-mono text-emerald-400 font-bold uppercase">{lastMeta.intent || "general"}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span>Sentiment Score</span>
                  <span className="text-slate-300 font-semibold capitalize">{lastMeta.sentiment || "neutral"}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span>Escalation Trigger</span>
                  <span className={`font-bold ${lastMeta.should_escalate ? "text-rose-400" : "text-emerald-400"}`}>
                    {lastMeta.should_escalate ? "Escalated" : "Normal"}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Multi-Agent Inspector Drawer (Restricted to Staff Only) */}
      {isStaff && (
        <AgentInspectorDrawer
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          lastMessageMeta={lastMeta}
        />
      )}
    </div>
  )
}
