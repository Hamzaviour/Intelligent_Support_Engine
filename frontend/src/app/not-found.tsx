import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 text-2xl shadow-lg">
        🔍
      </div>
      <h2 className="text-2xl font-bold mb-2">404 — Page Not Found</h2>
      <p className="text-xs text-[var(--text-muted)] max-w-md mb-6 leading-relaxed">
        The requested support page or resource could not be found.
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="px-4 py-2 text-xs font-bold rounded-xl gradient-btn shadow-md hover:scale-105 transition-transform"
        >
          Return to Chat Console
        </Link>
        <Link
          href="/login"
          className="px-4 py-2 text-xs font-semibold rounded-xl theme-card border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          Go to Login Page
        </Link>
      </div>
    </div>
  )
}
