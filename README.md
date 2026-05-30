# 💜 LAMAANE DOORE
### *Find Your Perfect Somali Match*

> **The world's most premium Somali dating & matchmaking platform** — AI-powered compatibility, real-time encrypted messaging, luxury UX, and enterprise-grade architecture.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-green?style=flat-square&logo=prisma)](https://prisma.io)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-purple?style=flat-square)](https://clerk.com)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-blue?style=flat-square&logo=stripe)](https://stripe.com)

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| **State** | Zustand, TanStack Query |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | Clerk (email, phone, Google, Apple OTP) |
| **Payments** | Stripe (subscriptions, webhooks, portal) |
| **Realtime** | Socket.io |
| **Media** | Cloudinary |
| **Email** | Resend |
| **Analytics** | PostHog |
| **AI** | Rule-based engine + OpenAI GPT-4o (optional) |
| **Deployment** | Vercel (web) + Railway/Docker (API) |

---

## 📁 Project Structure

```
lamaane-doore/
├── apps/
│   ├── web/              # Next.js 15 App Router frontend
│   │   ├── app/
│   │   │   ├── (auth)/   # Clerk sign-in/sign-up pages
│   │   │   ├── (app)/    # Protected app pages
│   │   │   │   ├── discover/   # Swipe engine
│   │   │   │   ├── matches/    # Match list
│   │   │   │   ├── messages/   # Real-time chat
│   │   │   │   ├── profile/    # User profile
│   │   │   │   └── premium/    # Subscription page
│   │   │   ├── admin/    # Admin dashboard
│   │   │   └── page.tsx  # Landing page
│   │   └── components/
│   │       ├── swipe/    # SwipeCard, SwipeStack, MatchCelebration
│   │       ├── landing/  # HeroSection, Features, Pricing, FAQ, etc.
│   │       ├── layout/   # AppShell (sidebar + bottom nav)
│   │       └── providers/ # Clerk, PostHog, QueryClient, Theme
│   └── api/              # Express.js REST + WebSocket API
│       └── src/
│           ├── routes/   # users, matches, messages, subscriptions, admin, ai, upload
│           ├── services/ # matching engine, geolocation, email, cloudinary
│           ├── socket/   # Socket.io real-time chat
│           ├── middleware/ # auth (Clerk JWT), errorHandler, notFound
│           └── lib/      # Prisma client, logger
├── packages/
│   └── db/
│       └── prisma/schema.prisma  # 15-model PostgreSQL schema
├── docker-compose.yml    # Local dev: Postgres + Redis + API
├── vercel.json           # Frontend deployment config
├── .env.example          # All required environment variables
└── turbo.json            # Turborepo pipeline
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop (for local Postgres + Redis)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/yourorg/lamaane-doore.git
cd lamaane-doore
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local

# Fill in your API keys (see Environment Variables section below)
```

### 3. Start Database

```bash
# Start PostgreSQL + Redis with Docker
docker-compose up -d postgres redis
```

### 4. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 5. Start Development

```bash
# Start both frontend and API in parallel
npm run dev

# Or individually:
npm run dev:web    # http://localhost:3000
npm run dev:api    # http://localhost:3001
```

---

## 🔑 Environment Variables

Copy `.env.example` and fill in the values:

### Required Services

| Service | How to Get |
|---------|-----------|
| **Clerk** | [clerk.com](https://clerk.com) → Create app → API Keys |
| **Stripe** | [stripe.com](https://stripe.com) → Developers → API keys |
| **PostHog** | [app.posthog.com](https://app.posthog.com) → Project Settings |
| **Resend** | [resend.com](https://resend.com) → API Keys |
| **Cloudinary** | [cloudinary.com](https://cloudinary.com) → Dashboard |
| **OpenAI** (optional) | [platform.openai.com](https://platform.openai.com) → API keys |

### Stripe Setup

1. Create products in Stripe Dashboard:
   - **Premium Monthly**: $19.99/month
   - **Premium Annual**: $149.99/year
   - **Gold Monthly**: $34.99/month

2. Copy Price IDs to `.env`:
   ```
   STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxxxx
   STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_xxxxx
   STRIPE_GOLD_MONTHLY_PRICE_ID=price_xxxxx
   ```

3. Set up webhook endpoint:
   - URL: `https://your-api.railway.app/webhooks/stripe`
   - Events: `customer.subscription.*`, `invoice.*`

### Clerk Setup

1. Create a Clerk application
2. Enable: Email, Phone, Google, Apple sign-in
3. Set webhook URL: `https://your-api.railway.app/webhooks/clerk`
4. Events: `user.created`, `user.deleted`

---

## 🗄️ Database Schema

The Prisma schema includes **15 models**:

| Model | Purpose |
|-------|---------|
| `User` | Full profile with 40+ fields |
| `Swipe` | Left/Right/Super swipe tracking |
| `Match` | Mutual match records |
| `Conversation` | Chat rooms (1:1 per match) |
| `Message` | Messages with reactions, replies |
| `Subscription` | Stripe billing records |
| `Report` | Safety reporting |
| `Block` | User blocking |
| `Story` | 24h ephemeral stories |
| `ProfileVisit` | Who viewed your profile |
| `Notification` | In-app notifications |
| `AIRecommendation` | AI-generated match recommendations |
| `AdminLog` | Admin audit trail |
| `PlatformStat` | Daily platform metrics |

---

## 🧠 AI Matching Engine

The compatibility scoring system (`apps/api/src/services/matching.ts`) uses:

| Factor | Weight | Details |
|--------|--------|---------|
| **Preferences** | 40% | Religion, relationship goals, marital status, education |
| **Interests** | 25% | Jaccard similarity on interest vectors |
| **Activity** | 20% | Profile completion, verification, recency |
| **Proximity** | 15% | Haversine distance formula |

**OpenAI Integration** (optional):
- `POST /api/ai/icebreaker` — Personalized conversation starters
- `POST /api/ai/bio-suggest` — AI-generated profile bios
- Falls back to rule-based system if OpenAI key is not set

---

## 💳 Subscription Plans

| Feature | Free | Premium ($19.99/mo) | Gold ($34.99/mo) |
|---------|------|---------------------|-----------------|
| Daily Likes | 50 | Unlimited | Unlimited |
| See Who Liked You | ❌ | ✅ | ✅ |
| Rewind | ❌ | ✅ | Unlimited |
| Boosts | ❌ | 1/month | 5/month |
| Incognito Mode | ❌ | ✅ | ✅ |
| Passport Mode | ❌ | ❌ | ✅ |
| AI Icebreakers | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |

---

## 🚀 Deployment

### Frontend → Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from apps/web
cd apps/web
vercel --prod
```

### API → Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up --service lamaane-doore-api
```

### Full Docker Setup

```bash
# Build and start everything
docker-compose up --build

# API: http://localhost:3001
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

---

## 📱 Features Overview

### 🔐 Authentication (Clerk)
- Email + password sign-up
- Phone OTP verification
- Google OAuth
- Apple Sign-In
- Multi-session, device management

### 💜 Matching Engine
- Physics-based swipe cards (Framer Motion)
- Super Like (swipe up)
- Rewind last swipe (Premium)
- Match celebration with confetti
- Daily curated AI recommendations

### 💬 Real-time Chat (Socket.io)
- End-to-end encrypted messages
- Typing indicators
- Read receipts (double checkmarks)
- Message reactions (emoji)
- Reply to messages
- Voice notes
- Image sharing
- GIF support

### 🛡️ Safety System
- User reporting
- Profile blocking
- Admin moderation queue
- AI content moderation concepts
- Trust scoring

### 👑 Admin Dashboard
- Real-time platform statistics
- User management (ban/suspend/verify)
- Report moderation queue
- Revenue metrics
- 30-day growth analytics

---

## 🌍 Multilingual Support

The platform supports 3 languages:
- **English** (primary)
- **Somali (af Soomaali)**
- **Arabic (العربية)** with RTL support

---

## 🏗️ Architecture

```
┌──────────────────┐    ┌──────────────────┐
│   Next.js Web    │────│  Express API     │
│   (Vercel)       │    │  (Railway)       │
└──────────────────┘    └────────┬─────────┘
         │                       │
    ┌────┴────┐            ┌─────┴─────┐
    │  Clerk  │            │ PostgreSQL │
    │  Auth   │            │  (Prisma) │
    └─────────┘            └─────┬─────┘
         │                       │
    ┌────┴────┐            ┌─────┴─────┐
    │  Stripe │            │   Redis   │
    │ Payments│            │  (Cache)  │
    └─────────┘            └───────────┘
         │
    ┌────┴─────────────┐
    │  Socket.io       │
    │  (Real-time Chat)│
    └──────────────────┘
```

---

## 📊 Performance Targets

- **Lighthouse Score**: 95+
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s
- **Swipe FPS**: 60fps
- **API Response**: < 200ms p95
- **WebSocket Latency**: < 50ms

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Copyright © 2024 LAMAANE DOORE. All rights reserved.

---

<div align="center">
  <strong>Built with 💜 for the global Somali community</strong>
  <br>
  <em>Wadajir waan xoogaysannahay — Together we are stronger</em>
</div>
