"use client"

import { motion } from "framer-motion"

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3.5 px-1 py-1.5"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5 relative">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md ring-2 ring-emerald-400/30">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
      </div>

      {/* Indicator Bubble */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 px-1 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Support Specialist</span>
          <span className="text-[10px] text-indigo-500 dark:text-indigo-400 animate-pulse">Checking records & drafting...</span>
        </div>

        <div className="px-4 py-3 rounded-2xl rounded-tl-xs theme-card">
          <div className="flex gap-1.5 items-center">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.16,
                }}
                className="block w-2 h-2 rounded-full bg-[var(--accent-primary)]"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
