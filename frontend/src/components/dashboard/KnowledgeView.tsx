"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  Search,
  Copy,
  Check,
  Shield,
  Truck,
  CreditCard,
  Wrench,
  Sparkles,
} from "lucide-react"

interface PolicyArticle {
  id: string
  title: string
  category: "Refunds" | "Shipping" | "Technical" | "Account"
  summary: string
  fullContent: string
  templateSnippet: string
  updatedAt: string
}

const POLICIES: PolicyArticle[] = [
  {
    id: "POL-001",
    title: "Standard 30-Day Return & Refund Policy",
    category: "Refunds",
    summary: "Customers may request a full refund within 30 days of delivery if items are undamaged or arrive defective.",
    fullContent: "All products purchased directly are eligible for full monetary refund within 30 calendar days of confirmed delivery. Defective or shipping-damaged items qualify for immediate 100% refund without return shipping fees.",
    templateSnippet: "Per our 30-Day Guarantee policy, your purchase is eligible for a full refund. I have initiated this transaction to your original payment method.",
    updatedAt: "2026-08-01",
  },
  {
    id: "POL-002",
    title: "Damaged Package Photo Inspection SLA",
    category: "Refunds",
    summary: "Claims above $100 require a photo of the damaged box for logistics carrier insurance.",
    fullContent: "For order claims exceeding $100.00, customer service agents must request photo proof of package damage prior to high-value manual refund override.",
    templateSnippet: "To finalize your package damage claim with carrier logistics, please reply with a clear photo of the shipping box.",
    updatedAt: "2026-08-05",
  },
  {
    id: "POL-003",
    title: "Expedited Shipping & International Delivery SLAs",
    category: "Shipping",
    summary: "Standard shipping takes 3-5 business days. Express shipping delivers in 1-2 business days.",
    fullContent: "Orders placed before 2 PM EST ship same-day. International orders clear customs within 2-4 business days. Tracking updates emit automatically via logistics API.",
    templateSnippet: "Your package is currently in transit with express carrier tracking. Estimated delivery is within 24-48 business hours.",
    updatedAt: "2026-07-28",
  },
  {
    id: "POL-004",
    title: "Account Security & Password Reset Protocol",
    category: "Account",
    summary: "Agents must verify customer identity before changing primary account email or shipping addresses.",
    fullContent: "Security protocol requires 2FA or email verification link dispatch prior to performing account credentials or primary email updates.",
    templateSnippet: "For your account security, I have dispatched a secure password reset link to your verified email address.",
    updatedAt: "2026-08-08",
  },
]

import { Plus, X, CheckCircle2 } from "lucide-react"
import { useAuth, isTechLeadUser } from "@/lib/AuthContext"

export function KnowledgeView() {
  const { user } = useAuth()
  const isTechLead = isTechLeadUser(user)

  const [policies, setPolicies] = useState<PolicyArticle[]>(POLICIES)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // New Policy Form state
  const [newTitle, setNewTitle] = useState("")
  const [newCategory, setNewCategory] = useState<"Refunds" | "Shipping" | "Technical" | "Account">("Refunds")
  const [newContent, setNewContent] = useState("")
  const [newSnippet, setNewSnippet] = useState("")

  const filteredArticles = policies.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                          p.summary.toLowerCase().includes(search.toLowerCase()) ||
                          p.fullContent.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === "all" || p.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const handleCopySnippet = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleAddPolicy = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    const newArticle: PolicyArticle = {
      id: `POL-00${policies.length + 1}`,
      title: newTitle,
      category: newCategory,
      summary: newContent.slice(0, 100) + "...",
      fullContent: newContent,
      templateSnippet: newSnippet || newContent,
      updatedAt: new Date().toISOString().split("T")[0],
    }

    setPolicies([newArticle, ...policies])
    setIsAddModalOpen(false)
    setNewTitle("")
    setNewContent("")
    setNewSnippet("")

    setToastMessage(`⚡ Policy "${newArticle.id}" created & indexed into Vector RAG engine!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="space-y-6 font-sans relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Agent Knowledge Base & Policy Hub</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Instant company policy search, Qdrant vector RAG rules, & response templates</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4" />
            <span>Vector RAG Active</span>
          </div>

          {isTechLead && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl gradient-btn shadow-md hover:scale-105 transition-all cursor-pointer text-white"
            >
              <Plus className="w-4 h-4" />
              <span>➕ Add Policy / Rule (Admin Only)</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Policy Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg theme-card rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Add New Policy / SOP Rule</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPolicy} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">Policy Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Customer Express Replacement Guarantee"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                >
                  <option value="Refunds">Refunds</option>
                  <option value="Shipping">Shipping</option>
                  <option value="Technical">Technical</option>
                  <option value="Account">Account</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">Full Policy & SOP Guidance</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the policy rule, eligibility criteria, and operational guidelines..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl p-3 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text-secondary)] mb-1">Copyable Agent Response Template</label>
                <textarea
                  rows={2}
                  placeholder="Standardized customer response template for agents to copy/paste..."
                  value={newSnippet}
                  onChange={e => setNewSnippet(e.target.value)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl p-3 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] font-bold hover:bg-[var(--bg-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl gradient-btn text-white font-bold shadow-md"
                >
                  ⚡ Save & Index Policy
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search company policies, refund terms, shipping SLAs..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all shadow-xs"
          />
        </div>

        <div className="flex gap-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-1 rounded-xl shadow-xs">
          {["all", "Refunds", "Shipping", "Account"].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                activeCategory === cat
                  ? "gradient-btn shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.map(article => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="theme-card rounded-2xl p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[var(--text-muted)] font-mono">{article.id}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {article.category}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1.5">{article.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{article.fullContent}</p>
            </div>

            {/* Template Snippet Box */}
            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">Copyable Agent Response Template</span>
                <button
                  onClick={() => handleCopySnippet(article.templateSnippet, article.id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-[var(--accent-primary)] hover:underline"
                >
                  {copiedId === article.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] italic bg-[var(--bg-base)] p-2.5 rounded-xl border border-[var(--border-subtle)] font-mono leading-relaxed">
                "{article.templateSnippet}"
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
