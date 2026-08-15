# UI/UX Design Brief — Intelligent Support Engine

**Version:** 0.1.0
**Last Updated:** 2026-08-07
**Design System:** shadcn/ui + Tailwind CSS (Bootstrap-free)

---

## 1. Visual Identity

### 1.1 Color Palette
Primary:
- Background: `#0a0a0a` (Deep black, very dark grey)
- Card: `#121212`
- Border: `#27272a` (dark grey)

Accent (Brand):
- Brand Blue: `#3b82f6` (Interaction color, for primary buttons/tags)
- Brand Purple: `#8b5cf6` (AI/Magic visualization)
- Success: `#22c55e`
- Warning: `#eab308`
- Error: `#ef4444`
- Info: `#06b6d4`

Text:
- Primary: `#f4f4f5`
- Secondary/Gray: `#a1a1aa`
- Disabled: `#52525b`

### 1.2 Typography
Font Family: `system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, sans-serif.

Scale:
- Headline: `text-4xl font-bold sans-serif`
- Large: `text-2xl font-600 sans-serif`
- Body: `text-base font-normal` (leading: 1.5)
- Small/Help: `text-sm font-normal` (color: gray-500)
- Caption: `text-xs font-normal` (color: gray-600)

### 1.3 Spacing Scale (4px base unit)
- xs: `4px`
- sm: `8px`
- base: `16px`
- md: `24px`
- lg: `32px`
- xl: `48px`
- 2xl: `64px`

---

## 2. Component Library (shadcn/ui)

### 2.1 Chat Interface

| Component | Props | Styling |
|---|---|---|
| **Chat Window** | `max-width: 768px`, `min-height: 500px` | Scrollable, dark mode, custom scrollbar |
| **Chat Message** | `gap: 16px`, `padding: 16px 0`, `border-bottom: 1px solid border` | Avatar (Left for user, Right for AI), bubble with `rounded-tr-none` for user, `rounded-tl-none` for AI |
| **User Bubble** | `bg-primary`, `text-primary-foreground` | Flex row-direction, justify-end |
| **AI Bubble** | `bg-card`, `border border-border` | Structured content: Text $\rightarrow$ Links $\rightarrow$ Code blocks $\rightarrow$ Entities |
| **Typing Indicator** | `3 dots` animating | `space-x: 2px`, `animate-pulse` |
| **Attachment Input** | `flex`, `items-center`, `gap: 12px` | Plus icon button, drag-over state (`border-color: brand-blue`) |
| **File Preview** | Thumbnail, name, remove button | Max-width: 64px, max-height: 64px |

### 2.2 Layout

| Component | Props | Styling |
|---|---|---|
| **App Shell** | `flex`, `direction-col`, `min-h-screen` | Sidebar (collapsible), Main Content |
| **Sidebar** | `w: 256px`, `border-r: border`, `bg-card` | Navigation links, customer profile summary at bottom |
| **Main Container** | `flex-1`, `p: md` | Centered chat view for customer, dashboard view for agents |
| **Header** | `flex`, `justify-between`, `items-center`, `padding: x-l` | Brand, customer name, support status |

### 2.3 Feedback Components

| Component | Props | Styling |
|---|---|---|
| **Loading State** | Skeleton cards, skeleton text lines | `animate-pulse`, background light |
| **Modal Overlay** | `fixed`, `inset-0`, `bg-black/50` | Centered dialog, blur backdrop |
| **Toast Notification** | Position: `top-16 right-16` | Auto-dismiss, close button, icon-based |

### 2.4 Micro-interactions

| Action | Animation | Easing |
|---|---|---|
| Message bubble appearance | `scale-0` $\rightarrow$ `scale-100`, opacity 0→1 | `spring` (tight bounce) |
| Button hover | `scale-105` (scale: 1.05), shadow-amber | `ease-out`, duration: 150ms |
| Sidebar toggle | Width transition 250ms | `ease-in-out` |
| Modal fade-in | Opacity 0→1 | `ease-out`, duration: 200ms |
| Typing indicator | 3 dots stagger: 100ms delay between dots | `ease-in-out` |

### 2.5 Layout & Responsiveness

Breakpoints:
- `sm` (640px): Show chat history on side, main chat on hover.
- `md` (768px): Full stack layout, chat on left, metadata on right.
- `lg` (1024px+): Show analytics/reports in dashboard view.

---

## 3. Customer Experience

### 3.1 Onboarding
1. **Auth Screen** (Clerk):
   - Simple, centered form.
   - Graceful error state.
   - Forgot password link.

2. ** Welcome Screen** (Chat):
   - Greeting from AI.
   - Quick action chips: "Refund", "Track Order", "Technical Help", "Account Login".
   - Voice hint: "You can also speak to me."

### 3.2 Conversation Flow
1. User inputs message.
2. Show typing indicator within 200ms of receipt (even if LLM is processing).
3. Stream responses token-by-token (stream: `true` on LLM API).

### 3.3 Escalation / Transfer
- Alert toasts: "Connecting you to a human specialist."
- Show a "You're now chatting with [Name]" component.
- Translucent background blur during transfer (wait for human).

### 3.4 Post-Resolution
- After AI resolves, show a floating CSAT button:
  - 5 stars, animated.
  - "Rate your experience" question, text input optional.
- Record CSAT and sentiment in Postgres + Analytics.

---

## 4. Human Agent Dashboard

### 4.1 Overview Screen
- Top: Customer profile card (name, email, VIP status, last 3 tickets).
- Middle Left: Full conversation transcript (searchable).
- Middle Right: AI summary, suggested actions, ticket timeline.
- Bottom: Quick action buttons (Reopen, Close, Escalate).

### 4.2 Component Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Customer Info + Status                              │
├──────────────────────────┬──────────────────────────────────┤
│ Conversation History     │ AI Summary & Ticket Details      │
│ - User: "I want..."     │ • Confident score: 85%            │
│   AI: "Let me help..."  │ • Confidence issues: Policy       │
│ - User: "Here's photo"  │ • Suggested action: Approve Refund│
│   AI: "Processing..."   │                                  │
├──────────────────────────┴──────────────────────────────────┤
│ Quick Actions: Reopen | Close | Escalate | Export           │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Accessibility

### 5.1 Contrast
- Minimum 4.5:1 for body text, 3:1 for large text.
- Focus rings: `ring-offset-2`, `ring-brand-blue`, `outline-none`.

### 5.2 Focus Management
- When modal opens, trap focus inside modal.
- When modal closes, restore focus to triggering element.
- Skip links for screen readers: "Skip to content".

### 5.3 Error Handling
- Input validation labels with `aria-describedby`.
- Error messages with `aria-live="polite"`.
- No empty text inputs when form submitted.

---

## 6. Motion & Animation Principles

### 6.1 Easing Curves (Emil-inspired)
```css
/* Spring-like bounce */
@keyframes bounce {
  from { transform: translateY(0) scale(0.95); opacity: 0; }
  50% { transform: translateY(-10px) scale(1.02); }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

/* Subtle fade-up */
@keyframes fade-up {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

### 6.2 Scroll Animations
- Scroll to bottom triggers `fade-up` animation for messages.
- Smooth scroll behavior with CSS `scroll-behavior: smooth`.

### 6.3 State Transitions
- Loading vs. Active state: Scaling opacity (0.7 → 1.0).
- Attachment: `scale-110` when selected.

---

## 7. Framework Implementation Notes

### 7.1 shadcn/ui Component Mapping
- `Button`: Base for all interactive elements.
- `Card`: For chat bubbles, AI summary.
- `Badge`: For tags, VIP status, intent classification.
- `Input`: For feedback CSAT.
- `Avatar`: User and AI avatars.
- `Dialog`: For modal overlays, ticket details view.
- `Skeleton`: For loading states.

### 7.2 Using Framer Motion
- For message bubbles: `AnimatePresence` within `Stack`.
- For sidebar: `motion.div` with `width` transition.
- For transitions: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`.

---

## 8. Example Screenshots (Textual Layout)

### 8.1 Customer Chat (Light vs. Dark)
**Dark Mode (Default):**
- Background: `#0a0a0a`
- Bubble (User): Background `#3b82f6` (blue text)
- Bubble (AI): Background `#121212`, border `#27272a`

**Light Mode (Toggle):**
- Background: `#ffffff`
- Bubble (User): Background `#f1f5f9` (slate-100)
- Bubble (AI): Background `#ffffff`, border `#e4e4e7`

### 8.2 Human Agent Dashboard
- Panel layout: `grid-cols-12`.
- Profile card: `col-span-3`.
- Conversation: `col-span-6`.
- Summary: `col-span-3`.

---

## 9. Glossary

| Term | Definition |
|---|---|
| **Design tokens** | CSS variables, theme setting entries |
| **Micro-interaction** | Small, swift animations (button hover, message appear) |
| **Utility-first** | CSS utility classes for rapid layout |
| **Accessible** | Meets WCAG contrast and focus management standards |