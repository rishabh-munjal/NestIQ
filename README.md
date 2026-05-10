# NestIQ — Hackathon Project Submission

## 🏠 Project Title
**NestIQ: AI-Powered Bangalore Real Estate Intelligence Platform**

---

## 🎯 Problem Statement

Buying property in Bangalore is one of the most financially consequential — and confusing — decisions a person can make. Yet the ecosystem is deeply broken:

- **Opacity**: Prices vary wildly across localities with zero transparency on fair value
- **Brokerage exploitation**: Buyers pay 1–2% brokerage on crores of rupees for information that should be free
- **No AI-driven insight**: Existing portals (MagicBricks, 99acres) show listings but offer zero analytical intelligence
- **Government process maze**: RERA verification, Khata transfer, stamp duty, sale deed — most first-time buyers have no idea what these mean or how to navigate them
- **Information asymmetry**: Institutional investors and developers have access to data that retail buyers don't — NestIQ closes that gap

---

## 💡 The Solution

NestIQ is a **full-stack real estate intelligence platform** built specifically for Bangalore. It transforms raw market data into **actionable decisions** using:

1. **Live price heat maps** across 30+ localities
2. **Gemini AI investment picks** with quantitative ROI projections
3. **Zero-brokerage marketplace** with verified sellers
4. **Step-by-step government formalities wizard** with a built-in stamp duty calculator
5. **AI market intelligence** — sentiment analysis, area impact scoring, and infrastructure news feed

---

## 🔑 Key Features

### 1. 🗺️ Map Explorer — Live Price Overlay
An interactive **Leaflet.js** heat map of Bangalore with color-coded price zones across 30+ localities. Users can:
- See live ₹/sqft pricing per area at a glance
- Filter by metro corridors, IT hubs, and emerging zones
- Identify undervalued vs. overheated micro-markets instantly

### 2. 🤖 AI Investment Advisor — Powered by Gemini 2.0 Flash
The core differentiator. Users submit a natural-language query ("Best area for ₹50L?" or "Impact of metro Phase 3?") and get:
- **AI-ranked top 5 investment opportunities** with confidence scores
- **ROI projections** (20–50% over 3–5 year horizons)
- **Radar chart factor analysis** — ROI, Safety, Momentum, Price Value, Confidence
- **Gemini-generated narrative insight** per locality with key drivers, risks, and infrastructure catalysts
- **Price target visualization** (entry → target ₹/sqft bar chart)

Sample AI Output:
> *"Devanahalli sits at the nexus of three mega-infrastructure projects. The BIAL IT Investment Region alone has potential to house 5 lakh+ jobs over 10 years. Entry prices at ₹3,800/sqft are the lowest in any growth micro-market in Bangalore — a classic early-mover play."*

### 3. 🏪 Zero-Brokerage Marketplace
A clean, data-rich property listings board where:
- **Sellers list for free** — no brokerage, no middlemen
- All listings show **₹/sqft**, possession date, RERA status, floor, BHK
- **Price distribution bar chart** updates dynamically with filters
- Built-in **contact modal** connects buyers directly to verified sellers
- Filter by area, BHK type, property type, and price

### 4. 📋 Government Formalities Wizard
India's most intimidating part of buying property — demystified. A **7-step interactive checklist** covering:

| Step | What it covers |
|------|---------------|
| RERA Verification | Check developer registration, project compliance |
| Title Search (EC) | Encumbrance Certificate via Kaveri Online |
| Sale Agreement | Token, negotiation, legal clauses |
| Home Loan | Pre-approval, comparison tips |
| Stamp Duty & Registration | IGR Karnataka portal walkthrough |
| Khata Transfer | BBMP citizen portal guide |
| Possession | Completion certificate, OC, handover |

Plus a **built-in stamp duty calculator** that computes:
- Stamp duty (5.6% standard / 4.6% female buyer concession)
- Registration charges (1%)
- BBMP/BBMP betterment charges
- Total outgo with formatted Indian rupee values

### 5. 📰 Market Intelligence — Real-Time News + Sentiment
Powered by **Anakin.io web scraping + Gemini AI analysis**:
- **Bullish / Bearish / Neutral** sentiment classification per article
- **Area impact scoring** (0–100) for each news item
- **Hot topics tag cloud** showing trending keywords by frequency
- **Sentiment donut chart** — live market mood indicator
- **Area impact bar chart** — which localities are most affected by current news

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.2 (App Router, Turbopack) |
| **Language** | TypeScript (strict mode) |
| **AI** | Google Gemini 2.0 Flash via `@google/genai` |
| **Web Scraping** | Anakin.io API |
| **Maps** | Leaflet.js + React-Leaflet |
| **Charts** | Recharts (Area, Bar, Radar, Pie charts) |
| **Animations** | Framer Motion |
| **Styling** | Custom Jasper Design System (CSS variables, 0px radius, editorial typography) |
| **Fonts** | Playfair Display (serif headlines) + Inter (body) + DM Mono (data labels) |
| **Deployment** | Vercel (Edge Network) |
| **APIs** | 5 custom Next.js Route Handlers |

### API Architecture
```
/api/ai-invest    → Gemini 2.0 Flash investment report generation
/api/news         → Anakin.io scrape + Gemini sentiment parsing
/api/scrape       → On-demand scraping endpoint
/api/properties   → Property listing CRUD
/api/formalities/stamp-duty → Stamp duty calculation engine
```

---

## 🎨 Design Philosophy

NestIQ uses the **Jasper Design System** — a "marketing billboard meets data dashboard" aesthetic:
- **Jasper Indigo** (`#00063D`) — dominant text, authority, trust
- **Jasper Flame** (`#FA4028`) — CTAs, active states, urgency signals
- **Smoke Gray** (`#F9F9F9`) — card backgrounds, analytical canvas
- **Research Green** (`#E6FFD9`) — RERA badges, positive signals, AI confidence
- **0px border-radius** — sharp, no-nonsense, results-oriented
- **No box-shadows** — depth through color contrast only
- **Playfair Display serif** headlines — authority, editorial intelligence

---

## 📊 Market Opportunity

- Bangalore's real estate market is valued at **₹2.5 lakh crore+**
- **40,000+ units** transacted annually in Bangalore alone
- **65% of first-time buyers** report confusion about the buying process (NHB data)
- India's PropTech sector is projected to reach **$1 billion by 2030**
- Zero existing platforms offer **AI + maps + listings + gov guide** in one place

---

## 🚀 Impact & Innovation

### What makes NestIQ genuinely different:

| Feature | MagicBricks / 99acres | NestIQ |
|---------|----------------------|--------|
| Price heat map | ❌ | ✅ Live Leaflet map |
| AI investment picks | ❌ | ✅ Gemini 2.0 Flash |
| Radar factor analysis | ❌ | ✅ Multi-dimensional |
| Zero brokerage | ❌ (1–2% fee) | ✅ Free |
| Gov formalities guide | ❌ | ✅ 7-step wizard |
| Stamp duty calculator | Basic | ✅ Full breakdown |
| Market sentiment AI | ❌ | ✅ Per-article scoring |
| ROI projections | ❌ | ✅ With confidence % |
| Infrastructure impact | ❌ | ✅ News → area mapping |

---

## 👤 Target Users

1. **First-time homebuyers** in Bangalore — need guidance, transparency, government process help
2. **Real estate investors** — need ROI data, AI signals, and emerging area alerts
3. **NRIs buying remotely** — need trusted intelligence without a local broker
4. **Property sellers** — want direct buyer access without paying brokerage

---

## 🔮 Future Roadmap

- **Voice-first AI query** — "Hey NestIQ, best 2BHK under 80L near Whitefield metro?"
- **Price alert subscriptions** — notify when target area drops below threshold
- **Legal document scanner** — upload sale agreement, AI flags red clauses
- **Pan-India expansion** — Mumbai, Hyderabad, Pune with city-specific AI models
- **Builder scorecard** — AI-aggregated delivery track record from news + RERA data
- **Portfolio tracker** — track owned properties vs. market movement

---

## 🏆 Hackathon Alignment

NestIQ directly addresses the following themes:
- **AI for Good** — Democratizing real estate intelligence for retail buyers vs. institutional players
- **FinTech / PropTech Innovation** — End-to-end data-driven property decision platform
- **Developer & API Integration** — Gemini API + Anakin.io + custom analytics pipeline
- **Social Impact** — Helping middle-class Indians make their biggest financial decision with confidence

---

## 🔗 Links

- **Live App**: [nestiq.vercel.app](https://nestiq.vercel.app)
- **GitHub**: [github.com/rishabh-munjal/NestIQ](https://github.com/rishabh-munjal/NestIQ)
- **Demo Pages**: `/` · `/explore` · `/invest` · `/marketplace` · `/formalities` · `/news`
