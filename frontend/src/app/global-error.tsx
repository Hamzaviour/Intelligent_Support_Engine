"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#0a0a0a", color: "#ffffff", fontFamily: "sans-serif", padding: "2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "500px", margin: "4rem auto", textAlign: "center", padding: "2rem", border: "1px solid #27272a", borderRadius: "1rem", backgroundColor: "#121215" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1rem" }}>Global System Error</h2>
          <p style={{ fontSize: "0.875rem", color: "#a1a1aa", marginBottom: "1.5rem" }}>
            {error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: "bold",
              color: "#ffffff",
              backgroundColor: "#6366f1",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            Reset Application
          </button>
        </div>
      </body>
    </html>
  )
}
