"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface MessageBubbleProps {
  message: {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    agent?: string
    intent?: string
    isStreaming?: boolean
  }
  isLast?: boolean
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const isEmpty = !message.content && message.isStreaming
  const [copied, setCopied] = useState(false)
  const [rating, setRating] = useState<"up" | "down" | null>(null)

  const handleCopy = () => {
    if (!message.content) return
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Get friendly agent display badge
  const getAgentBadge = (intent?: string) => {
    if (!intent) return "Customer Support Specialist"
    switch (intent.toLowerCase()) {
      case "refund":
        return "💳 Refund & Finance Desk"
      case "shipping":
        return "📦 Logistics & Delivery Specialist"
      case "technical":
        return "🛠️ Technical Support Engineer"
      case "complaint":
        return "🤝 Customer Resolution Concierge"
      default:
        return "💬 Customer Care Specialist"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-3.5 px-1 py-1.5 font-sans ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md ring-2 ring-indigo-500/20">
            YOU
          </div>
        ) : (
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md ring-2 ring-emerald-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            {/* Active online pulse dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[var(--bg-base)] rounded-full" />
          </div>
        )}
      </div>

      {/* Bubble Container */}
      <div className={`flex flex-col gap-1.5 max-w-[82%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Support Specialist Header */}
        {!isUser && (
          <div className="flex items-center gap-2 px-1 text-xs">
            <span className="font-bold text-[var(--text-primary)]">
              {message.agent || "Support Concierge"}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              {getAgentBadge(message.intent)}
            </span>
          </div>
        )}

        {/* Content Box */}
        <div
          style={
            isUser
              ? {
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  color: "#ffffff",
                }
              : undefined
          }
          className={`relative px-4.5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-indigo-600 text-white font-medium rounded-tr-xs shadow-indigo-500/20"
              : "theme-card bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-xs"
          }`}
        >
          {isEmpty ? (
            <div className="flex gap-1.5 items-center py-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-[var(--text-muted)] opacity-60"
                  style={{
                    animation: `bounce-dot 0.8s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          ) : (
            <>
              <p className={`whitespace-pre-wrap break-words font-medium ${isUser ? "text-white font-semibold" : "text-[var(--text-primary)]"}`}>
                {message.content}
                {message.isStreaming && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                    className="inline-block ml-1 w-[2.5px] h-[1.1em] bg-[var(--accent-primary)] align-middle rounded-full"
                  />
                )}
              </p>

              {/* Bottom Metadata & Actions */}
              {!message.isStreaming && (
                <div
                  className={`flex items-center justify-between gap-3 mt-2.5 pt-2 border-t text-[11px] ${
                    isUser
                      ? "border-white/20 text-white/90 font-medium"
                      : "border-[var(--border-subtle)] text-[var(--text-muted)]"
                  }`}
                >
                  {/* Timestamp */}
                  <span>
                    {message.timestamp instanceof Date
                      ? message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>

                  {/* Actions for Assistant */}
                  {!isUser && (
                    <div className="flex items-center gap-2">
                      {/* Rating buttons */}
                      <button
                        onClick={() => setRating(rating === "up" ? null : "up")}
                        className={`p-1 rounded transition-colors ${
                          rating === "up" ? "text-emerald-500 bg-emerald-500/10" : "hover:text-[var(--text-primary)] text-[var(--text-muted)]"
                        }`}
                        title="Helpful"
                      >
                        <svg className="w-3.5 h-3.5" fill={rating === "up" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                      </button>

                      <button
                        onClick={() => setRating(rating === "down" ? null : "down")}
                        className={`p-1 rounded transition-colors ${
                          rating === "down" ? "text-rose-500 bg-rose-500/10" : "hover:text-[var(--text-primary)] text-[var(--text-muted)]"
                        }`}
                        title="Not helpful"
                      >
                        <svg className="w-3.5 h-3.5" fill={rating === "down" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-9h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                        </svg>
                      </button>

                      {/* Copy button */}
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <span className="text-emerald-500 font-bold text-[10px]">✓ Copied</span>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
