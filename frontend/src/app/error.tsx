"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application Error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-4 text-2xl shadow-lg">
        ⚠️
      </div>
      <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-xs text-[var(--text-muted)] max-w-md mb-6 leading-relaxed">
        {error.message || "An unexpected error occurred in the support engine client."}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 text-xs font-bold rounded-xl gradient-btn shadow-md hover:scale-105 transition-transform"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-4 py-2 text-xs font-semibold rounded-xl theme-card border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
