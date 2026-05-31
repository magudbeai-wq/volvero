# 🌍 Velora
**Find Your Perfect Match Worldwide**

The world's most premium international dating & matchmaking platform — AI-powered compatibility, real-time encrypted messaging, luxury UX, and enterprise-grade architecture.

Next.js TypeScript Prisma Supabase Stripe

## 🚀 Tech Stack
| Layer | Technology |
| --- | --- |
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| **State** | Zustand, TanStack Query |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | Supabase Auth (email, phone, Google, Apple) |
| **Payments** | Stripe (subscriptions, webhooks, portal) |
| **Realtime** | Socket.io |
| **Media** | Cloudinary |
| **Email** | Resend |
| **Analytics** | PostHog |
| **AI** | Rule-based engine + OpenAI GPT-4o (optional) |
| **Deployment** | Vercel (web) + Render/Docker (API) |

## ⚡ Quick Start

### 1. Configure Environment
Copy `.env.example` to `apps/api/.env` and `apps/web/.env.local` and fill in your API keys.

### 2. Set Up Database
```bash
npm run db:generate
npm run db:push
```

### 3. Start Development
```bash
npm run dev
```

## 📱 Features Overview
- **Authentication**: Supabase Auth (Email, Google, Apple).
- **Matching Engine**: Physics-based swipe cards, Super Like, Match celebration.
- **Real-time Chat**: End-to-end encrypted messages with Socket.io.
- **Safety System**: User reporting, profile blocking, AI content moderation.
- **Premium Subscriptions**: Stripe billing integration.

## 📄 License
Copyright © 2024 Velora. All rights reserved.
