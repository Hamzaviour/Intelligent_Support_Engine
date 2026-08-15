"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
} from "lucide-react"

interface AISummaryProps {
  conversationId?: string
  sentiment?: "positive" | "neutral" | "negative"
  confidence?: number
  intent?: string
  suggestedActions?: string[]
  escalation?: boolean
  onAction?: (action: string) => void
}

export function AISummary({
  sentiment = "neutral",
  confidence = 85,
  intent = "greeting",
  suggestedActions = ["Acknowledge concern", "Offer solution", "Confirm resolution"],
  escalation = false,
  onAction,
}: AISummaryProps) {
  const [expanded, setExpanded] = useState(false)

  const sentimentColors = {
    positive: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
    neutral: { bg: "bg-indigo-500/10", text: "text-indigo-500", border: "border-indigo-500/20" },
    negative: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
  }

  const confidenceColor = confidence >= 80 ? "text-emerald-500" : confidence >= 60 ? "text-amber-500" : "text-rose-500"

  return (
    <div className="theme-card rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden shadow-sm font-sans">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--text-primary)]">Multi-Agent AI Intelligence Summary</h3>
            <p className="text-[10px] text-[var(--text-muted)]">Real-time LLM telemetry & agent consensus</p>
          </div>
        </div>
        {escalation && (
          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-rose-500/10 text-rose-500 text-[10px] font-bold rounded-full border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" />
            Escalated
          </span>
        )}
      </div>

      {/* Confidence Score */}
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[var(--text-muted)] font-semibold">Classification Confidence</span>
          <span className={`text-xs font-bold ${confidenceColor}`}>{confidence}%</span>
        </div>
        <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${
              confidence >= 80 ? "bg-emerald-500" :
              confidence >= 60 ? "bg-amber-500" :
              "bg-rose-500"
            }`}
          />
        </div>
      </div>

      {/* Sentiment & Intent */}
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-1">Sentiment</span>
            <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              sentimentColors[sentiment].bg} ${sentimentColors[sentiment].text} border ${sentimentColors[sentiment].border}`}>
              {sentiment === "positive" && <CheckCircle2 className="w-3 h-3" />}
              {sentiment === "negative" && <AlertTriangle className="w-3 h-3" />}
              {sentiment}
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-1">Detected Intent</span>
            <p className="text-xs font-bold text-[var(--text-primary)] capitalize">{intent.replace("_", " ")}</p>
          </div>
        </div>
      </div>

      {/* AI Summary Text */}
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-1">Synthesis</span>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
          Customer {sentiment === "negative" ? "expressed urgent frustration regarding" : "inquired about"} their
          {intent === "refund" ? " refund request" : intent === "tracking" ? " order delivery status" : " inquiry"}.
          {confidence >= 80 ? " Multi-agent workflow determined appropriate action." : " Further staff review recommended."}
        </p>
      </div>

    </div>
  )
}
