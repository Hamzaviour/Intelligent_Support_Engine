"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { motion } from "framer-motion"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSend, isLoading = false }: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend = input.trim().length > 0 && !isLoading

  const handleSubmit = () => {
    if (!canSend) return
    onSend(input.trim())
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 140) + "px"
  }

  return (
    <div className="px-4 py-3 bg-[var(--bg-base)] transition-colors border-t border-[var(--border-subtle)]">
      <div
        className={`flex items-end gap-3 rounded-2xl border px-4 py-3 transition-all duration-200 theme-card ${
          isLoading
            ? "opacity-60 cursor-not-allowed"
            : "focus-within:border-[var(--accent-primary)] focus-within:ring-2 focus-within:ring-[var(--accent-primary)]/20"
        }`}
      >
        {/* Quick attachment / help button */}
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors pb-1 hidden sm:block"
          title="Add context"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={isLoading ? "Specialist is replying…" : "Type your question or request… (Press Enter to send)"}
          disabled={isLoading}
          rows={1}
          className="flex-1 bg-transparent resize-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none disabled:opacity-50 leading-relaxed font-normal"
          style={{ maxHeight: "140px", overflowY: "auto" }}
        />

        {/* Send button */}
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          whileHover={canSend ? { scale: 1.06 } : {}}
          whileTap={canSend ? { scale: 0.94 } : {}}
          className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
            canSend
              ? "gradient-btn cursor-pointer shadow-md"
              : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] px-2 mt-2">
        <span>🔒 Encrypted 256-bit support session</span>
        <span>Average response time: &lt; 2 seconds</span>
      </div>
    </div>
  )
}
