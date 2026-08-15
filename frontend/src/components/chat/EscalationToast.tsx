"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Clock, AlertCircle, CheckCircle2 } from "lucide-react"

interface EscalationToastProps {
  agentName?: string
  onDismiss: () => void
}

export function EscalationToast({ agentName = "a human specialist", onDismiss }: EscalationToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed top-4 right-4 z-50 bg-[#121212] border border-[#eab308]/30 rounded-lg p-4 shadow-lg max-w-sm"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-[#eab308]/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Users className="w-4 h-4 text-[#eab308]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#f4f4f5]">Connecting you to {agentName}...</p>
          <p className="text-xs text-[#a1a1aa] mt-1">Please wait while we transfer your conversation.</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#52525b] hover:text-[#f4f4f5] transition-colors"
        >
          <AlertCircle className="w-4 h-4" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-1 bg-[#27272a] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="h-full bg-[#eab308] rounded-full"
        />
      </div>
    </motion.div>
  )
}

interface TransferBannerProps {
  agentName: string
}

export function TransferBanner({ agentName }: TransferBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="bg-[#8b5cf6]/10 border-b border-[#8b5cf6]/20 px-4 py-2 flex items-center gap-2"
    >
      <CheckCircle2 className="w-4 h-4 text-[#8b5cf6]" />
      <span className="text-sm text-[#f4f4f5]">
        You're now chatting with <span className="font-medium text-[#8b5cf6]">{agentName}</span>
      </span>
    </motion.div>
  )
}
