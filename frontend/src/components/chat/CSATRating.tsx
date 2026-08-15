"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface CSATRatingProps {
  conversationId: string
  onComplete: (score: number, feedback?: string) => void
}

export function CSATRating({ conversationId, onComplete }: CSATRatingProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (selectedRating === null) return

    try {
      await onComplete(selectedRating, feedback || undefined)
      setSubmitted(true)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 bg-[#121212] border border-[#27272a] rounded-lg p-4 shadow-lg max-w-xs"
      >
        <p className="text-sm text-[#f4f4f5]">Thank you for your feedback! 😊</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-[#121212] border border-[#27272a] rounded-lg p-4 shadow-lg max-w-xs"
    >
      <p className="text-sm text-[#f4f4f5] mb-3">Rate your experience</p>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setSelectedRating(star)}
            className="transition-all duration-150 hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= (selectedRating || 0)
                  ? "text-[#eab308] fill-[#eab308]"
                  : "text-[#52525b]"
              }`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Optional: Tell us more..."
        className="w-full bg-[#1a1a1a] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-[#f4f4f5] placeholder:text-[#52525b] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] resize-none mb-3"
        rows={2}
      />
      <button
        onClick={handleSubmit}
        disabled={selectedRating === null}
        className="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#27272a] disabled:text-[#52525b] text-white text-sm font-medium py-2 rounded-lg transition-colors duration-150"
      >
        Submit Rating
      </button>
    </motion.div>
  )
}
