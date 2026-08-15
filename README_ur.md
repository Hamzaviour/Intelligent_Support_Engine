# 🚀 Intelligent Support Engine (ISE) — Complete Multi-Agent System Guide (Roman Urdu)

Welcome! Yeh **Intelligent Support Engine (ISE)** ki mukammal documentation hai jo **Roman Urdu** mein likhi gayi hai taakay aap pure system ko asani se samajh sakein aur run kar sakein.

---

## 📌 Yeh System Kya Hai?

Yeh ek high-performance **10-Agent Multi-Agent Customer Support Engine** hai. Iska matlab yeh hai ke jab bhi koi customer support chat par message bhejta hai, toh **10 mukhtalif AI agents** mil kar us request ko process karte hain aur instant, accurate response dete hain.

---

## 🌟 Major Highlights & Updates

1. **📦 Global CLI Installation**:
   - Application mein global tool `ui-ux-pro-max-cli` install kar diya gaya hai.
2. **🔑 Dedicated Login Page & Easy Logout Option**:
   - Ab aap easily `/login` page par ja sakte hain (`http://localhost:3000/login`).
   - Yahan **1-Click Demo Login** presets diye gaye hain (VIP Customer, Support Agent, Tech Lead).
   - Top Navigation bar mein user profile dropdown ke andar **Log Out** ka explicit button majood hai jo session ko instantly clear kar deta hai.
3. **🤖 10 Active Multi-Agents**:
   - Tamam 10 agents backend pipeline aur frontend **10-Agent Inspector Drawer** ke saath fully connected hain.
4. **🎨 Advanced UI/UX & Themes**:
   - Modern Glassmorphism layout.
   - 4 Beautiful Themes: *Indigo Electric*, *Emerald Care*, *Sunset Coral*, *Sapphire Corporate*.
   - Dark mode aur Light mode switch karne ka option.

---

## 🤖 10 Agents Ka Kaam Kaise Hota Hai?

Har user message par yeh 10 agents line se execute hotay hain:

1. **Memory Agent 🧠**:
   - Purani chat history aur customer context ko memory se load karta hai.
2. **CRM Agent 👤**:
   - Customer ka VIP Tier, order history aur account details retrieve karta hai.
3. **Intent Agent 🎯**:
   - User ki baat ka maqsad (Intent) pehchanta hai (jaise refund, technical query, shipping, ya complaint).
4. **Sentiment Agent 😊**:
   - User ke mood aur emotions ko analyze karta hai (Neutral, Happy, Angry, Frustrated).
5. **Knowledge Agent 📚**:
   - Support policy aur documents se Vector Search (RAG) karke accurate jawab dhundta hai.
6. **Refund Agent 💳**:
   - Agar refund manga ho toh order eligibility check karke automated refund status deta hai.
7. **Ticket Agent 🎫**:
   - Urgent masle ya complaint par support ticket create karta hai.
8. **Escalation Agent 🚨**:
   - Agar banda ziada gussa ho toh human handoff (Escalation) trigger karta hai.
9. **Conversation Agent 💬**:
   - Final jawab ki tone set karta hai taakay response friendly aur clear ho.
10. **Analytics Agent 📊**:
    - System Response Time (Latency), First Response Time aur resolution status record karta hai.

---

## 📦 Global CLI Package Install Karne Ka Tariqa

Aap terminal ya PowerShell par yeh command chala kar CLI install kar sakte hain:

```bash
npm install -g ui-ux-pro-max-cli
```

Install check karne ke liye yeh run karein:

```bash
ui-ux-pro-max-cli --version
```

---

## ⚡ System Ko Setup Aur Run Karne Ka Tariqa

### Step 1: Backend Setup (Python FastAPI)

1. Backend folder mein jayein:
   ```bash
   cd backend
   ```
2. Virtual Environment banayein aur activate karein:
   ```bash
   python -m venv venv
   # Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   ```
3. Packages install karein:
   ```bash
   pip install -r requirements.txt
   ```
4. Backend server start karein:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *Backend address*: `http://localhost:8000`

---

### Step 2: Frontend Setup (Next.js 14)

1. Frontend folder mein jayein:
   ```bash
   cd frontend
   ```
2. Dependencies install karein:
   ```bash
   npm install
   ```
3. Development Server start karein:
   ```bash
   npm run dev
   ```
   *Frontend address*: `http://localhost:3000`

---

## 🔑 Login aur Logout Kaise Karein?

- **Direct Login Link**: Aap browser mein `http://localhost:3000/login` khol kar login kar sakte hain.
- **1-Click Demo Accounts**: Login page par 3 Quick Buttons diye gaye hain:
  - 👑 **VIP Customer** (Alex Morgan)
  - 🎧 **Support Agent** (Sarah Connor)
  - 🛠️ **Tech Lead** (David Tech)
- **Log Out Option**: Screen ke top-right corner mein user avatar par click karein. Dropdown menu mein sab se neeche **Log Out** button par click karein, aapka session instantly logout ho jayega.

---

## 📊 Live System Inspection

Chat karte waqt top right par **🤖 10-Agent Inspector** button par click karein.
Aap ko screen par ek side drawer nazar ayega jisme har ek single agent ki live status, step-by-step reasoning aur active evaluation live update hogi.

---

## 🤝 Support & Contribution

Yeh project modern Next.js 14, Tailwind CSS, FastAPI aur LangGraph par built hai. Agar aapko koi issue aaye toh `README.md` (English) bhi check kar sakte hain.
