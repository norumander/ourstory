# ARCHITECTURE.md

## Overview

ourstory is an AI-enhanced crowdfunding platform — a Next.js monolith deployed to Vercel with a Supabase-hosted PostgreSQL database. It comprises three interconnected page types (Profile, Fundraiser, Community) faithful to GoFundMe's UX patterns with original visual design. AI features transform raw crowdfunding data into narrative insights: contextualizing donations on fundraiser pages, synthesizing community giving stories, and surfacing personalized giving patterns on profiles. The application uses server-side rendering with progressive loading, NextAuth.js for email/password authentication, and a provider-agnostic AI service layer with caching and graceful degradation.

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│                                                          │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐            │
│  │ Profile  │  │ Fundraiser│  │ Community │  + Auth,    │
│  │   Page   │  │   Page    │  │   Page    │  Landing,   │
│  └────┬─────┘  └─────┬─────┘  └─────┬─────┘  Metrics   │
│       └───────────────┼──────────────┘                   │
│               ┌───────┴────────┐                         │
│               │  Layout &      │                         │
│               │  Navigation    │                         │
│               └───────┬────────┘                         │
└───────────────────────┼──────────────────────────────────┘
                        │ HTTP
┌───────────────────────┼──────────────────────────────────┐
│               Next.js Server (Vercel)                     │
│                                                           │
│  ┌────────────────────┴────────────────────────┐          │
│  │              API Routes / Server Actions     │          │
│  │  /api/auth/*    /api/fundraisers/*           │          │
│  │  /api/communities/*   /api/profiles/*        │          │
│  │  /api/metrics                                │          │
│  └───┬──────────────┬──────────────┬────────────┘          │
│      │              │              │                       │
│  ┌───┴───┐    ┌─────┴─────┐  ┌────┴──────┐               │
│  │ Auth  │    │    AI     │  │ Instrumen-│               │
│  │ Layer │    │  Service  │  │  tation   │               │
│  │(Next  │    │  Layer    │  │  Layer    │               │
│  │ Auth) │    │(cached)   │  │(DB-backed)│               │
│  └───┬───┘    └─────┬─────┘  └────┬──────┘               │
│      │              │              │                       │
│  ┌───┴──────────────┴──────────────┴───────┐              │
│  │              Prisma ORM                  │              │
│  │         (connection pooling)             │              │
│  └──────────────────┬──────────────────────┘              │
└─────────────────────┼─────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │                           │
┌───────┴──────────┐    ┌───────────┴──────┐
│   PostgreSQL     │    │    LLM API       │
│   (Supabase)     │    │ (OpenAI-compat   │
│                  │    │  or Anthropic)   │
│  User            │    │                  │
│  Fundraiser      │    │  Impact Story    │
│  Donation        │    │  Community Narr. │
│  Community       │    │  Giving Insights │
│  UserFollow      │    └──────────────────┘
│  CommunityFollow │
│  MetricEvent     │
└──────────────────┘
```

## Components

### Pages (Next.js App Router)

| Component | Location | Responsibility | Dependencies |
|---|---|---|---|
| Root Layout | `src/app/layout.tsx` | HTML shell, providers (session, theme), persistent header | Auth, Design system |
| Landing Page | `src/app/page.tsx` | Entry point showing featured fundraisers and communities | Prisma |
| Login Page | `src/app/login/page.tsx` | Email/password login form | Auth Layer |
| Register Page | `src/app/register/page.tsx` | Registration form (email, password, displayName) | Auth Layer |
| Fundraiser Page | `src/app/fundraiser/[id]/page.tsx` | Fundraiser display with donations, AI Impact Story | Prisma, AI Service |
| Fundraiser Creation | `src/app/fundraiser/new/page.tsx` | Multi-field creation form with validation | Auth, Prisma |
| Community Page | `src/app/community/[slug]/page.tsx` | Community display with leaderboard, AI Narrative | Prisma, AI Service |
| Profile Page | `src/app/profile/[username]/page.tsx` | User profile with activity feed, AI Insights | Prisma, AI Service |
| Metrics Dashboard | `src/app/admin/metrics/page.tsx` | Aggregated instrumentation data display | Auth, Prisma |

### API Routes

| Route | Method | Auth | Responsibility |
|---|---|---|---|
| `/api/auth/[...nextauth]` | * | No | NextAuth.js handler (login, logout, session) |
| `/api/auth/register` | POST | No | User registration with bcrypt hashing |
| `/api/fundraisers` | POST | Yes | Create fundraiser |
| `/api/fundraisers/[id]` | GET | No | Fetch fundraiser with donations and AI story |
| `/api/fundraisers/[id]/donate` | POST | Yes | Create mock donation |
| `/api/communities/[slug]` | GET | No | Fetch community with stats and AI narrative |
| `/api/communities/[slug]/follow` | POST | Yes | Toggle community follow |
| `/api/profiles/[username]` | GET | No | Fetch user profile and activity |
| `/api/profiles/[username]/insights` | GET | Yes (owner) | Fetch AI giving insights |
| `/api/profiles/[username]/follow` | POST | Yes | Toggle user follow |
| `/api/metrics` | GET | Yes | Aggregated metrics data |

### Service Layers

| Service | Location | Responsibility | Interface |
|---|---|---|---|
| Auth Layer | `src/lib/auth.ts` | NextAuth.js config, credentials provider, JWT strategy | NextAuth config object |
| AI Service | `src/lib/ai/service.ts` | Provider-agnostic LLM abstraction | `generateCompletion(prompt, options): Promise<string>` |
| Impact Story | `src/lib/ai/impact-story.ts` | Generates fundraiser impact narratives | `generateImpactStory(fundraiserData): Promise<string \| null>` |
| Community Narrative | `src/lib/ai/community-narrative.ts` | Generates community giving stories | `generateCommunityNarrative(communityData): Promise<string \| null>` |
| Giving Insights | `src/lib/ai/giving-insights.ts` | Generates personalized donor insights | `generateGivingInsights(donationHistory): Promise<InsightsResult \| null>` |
| Cache | `src/lib/cache.ts` | In-memory TTL cache (15-min default) | `get<T>(key): T \| null`, `set<T>(key, value, ttlMs)` |
| Metrics | `src/lib/metrics.ts` | Structured event logging to MetricEvent table | `logEvent(type, payload): Promise<void>` |
| Prisma Client | `src/lib/prisma.ts` | Singleton Prisma client with connection pooling | PrismaClient instance |

### UI Components

| Category | Location | Contents |
|---|---|---|
| UI Primitives | `src/components/ui/` | Button, Input, Card, Badge, ProgressBar, Toast, etc. |
| Layout | `src/components/layout/` | Header, MobileMenu, Footer |
| Fundraiser | `src/components/fundraiser/` | DonationList, DonateForm, ImpactStory, ProgressBar, ShareButton |
| Community | `src/components/community/` | Leaderboard, CommunityStats, CommunityNarrative, FollowButton |
| Profile | `src/components/profile/` | ActivityFeed, Highlights, GivingInsights, Avatar, FollowButton |
| Skeletons | `src/components/skeletons/` | FundraiserSkeleton, CommunitySkeleton, ProfileSkeleton |

## Directory Structure

```
ourstory/
├── CLAUDE.md
├── PRD.md
├── GOLDEN.md
├── METRICS.md                      # Instrumentation documentation (Req 17)
├── .env.example                    # Placeholder env vars
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── postcss.config.js
├── docs/
│   ├── ARCHITECTURE.md
│   ├── IMPLEMENTATION.md
│   ├── DECISIONS.md
│   └── TESTING.md
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Landing page
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── fundraiser/
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── community/
│   │   │   └── [slug]/page.tsx
│   │   ├── profile/
│   │   │   └── [username]/page.tsx
│   │   ├── admin/
│   │   │   └── metrics/page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts
│   │       │   └── register/route.ts
│   │       ├── fundraisers/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── donate/route.ts
│   │       ├── communities/
│   │       │   └── [slug]/
│   │       │       ├── route.ts
│   │       │       └── follow/route.ts
│   │       ├── profiles/
│   │       │   └── [username]/
│   │       │       ├── route.ts
│   │       │       ├── insights/route.ts
│   │       │       └── follow/route.ts
│   │       └── metrics/route.ts
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── fundraiser/
│   │   ├── community/
│   │   ├── profile/
│   │   └── skeletons/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── cache.ts
│   │   ├── metrics.ts
│   │   ├── utils.ts
│   │   └── ai/
│   │       ├── service.ts
│   │       ├── impact-story.ts
│   │       ├── community-narrative.ts
│   │       └── giving-insights.ts
│   └── types/
│       └── index.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── public/
```

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Language | TypeScript | End-to-end type safety, Prisma codegen, IDE support |
| Framework | Next.js 15 (App Router) | Server Components for progressive loading, file-based routing, API routes, Vercel-optimized |
| Styling | Tailwind CSS v4 | Utility-first, mobile-responsive, custom design tokens |
| Database | PostgreSQL (Supabase free tier) | Relational model fits entities; managed hosting; connection pooling via Prisma |
| ORM | Prisma | Type-safe queries, schema-driven migrations, seed scripts |
| Auth | NextAuth.js (Auth.js v5) | Credentials provider, JWT sessions, route protection middleware |
| AI | Provider-agnostic service layer | `AI_PROVIDER` env var selects OpenAI-compatible (default) or Anthropic; swappable without code changes |
| Caching | In-memory TTL cache | 15-min cache for AI responses; keyed by input data hash |
| Unit Tests | Vitest | Fast, TypeScript-native, compatible with Next.js |
| E2E Tests | Playwright | Multi-browser, mobile viewport testing, auth flow verification |
| Deployment | Vercel | Zero-config Next.js, HTTPS, preview deploys, serverless functions |

## Data Models

```
┌──────────┐       ┌────────────┐       ┌───────────┐
│   User   │──1:N──│ Fundraiser │──1:N──│  Donation │
│          │       │            │       │           │
│ id       │  ┌────│ organizerId│       │ donorId ──│──┐
│ email    │  │    │ communityId│───┐   │fundraiserId│  │
│ password │  │    └────────────┘   │   └───────────┘  │
│ Hash     │  │                    │                   │
│ display  │  │    ┌───────────┐   │                   │
│ Name     │──┘    │ Community │───┘   ┌───────────┐  │
│ username │       │           │       │ UserFollow │  │
│ avatarUrl│       │ id        │       │           │  │
└──────┬───┘       │ name      │       │followerId │──┘
       │           │ slug      │       │followingId│
       │           └───────────┘       └───────────┘
       │
       │           ┌───────────────┐   ┌─────────────┐
       └───────────│CommunityFollow│   │ MetricEvent │
                   │               │   │             │
                   │ userId        │   │ eventType   │
                   │ communityId   │   │ payload (J) │
                   └───────────────┘   │ timestamp   │
                                       └─────────────┘
```

**Key rules:**
- All monetary amounts stored as integer cents (no floating point)
- Community aggregate stats (totalRaised, totalDonations, fundraiserCount) are computed, not stored
- UserFollow has unique constraint on (followerId, followingId) and prevents self-follows
- CommunityFollow has unique constraint on (userId, communityId)
- User.username is unique, derived from email prefix at registration
- MetricEvent.payload is a JSON column containing event-specific data

## Boundaries & Constraints

### Golden Requirements Enforcement

| Requirement | Architectural Enforcement |
|---|---|
| **GR-SEC-1**: No plaintext passwords | Auth layer uses bcrypt with cost ≥10. `passwordHash` field name signals intent. Unit tests assert hash format. No logging of password values. |
| **GR-SEC-2**: No secrets in client/VCS | All secrets via env vars. `.env.example` with placeholders committed. `.gitignore` covers `.env*`. No `NEXT_PUBLIC_` prefix on secrets. Server-only imports for sensitive modules. |
| **GR-SEC-3**: Mock payments obvious | DonateForm component renders a prominent, non-dismissible banner. No payment provider SDK installed. No credit card fields in schema or UI. E2E test verifies banner visibility. |
| **GR-ARCH-1**: Three distinct pages | File-based routing: `/fundraiser/[id]`, `/community/[slug]`, `/profile/[username]` — each a separate route file, not tabs or modals. |
| **GR-ARCH-2**: Interconnected navigation | Cross-page links are part of each page component's acceptance criteria. E2E test navigates full circuit: Fundraiser → Profile → Community → Fundraiser. |
| **GR-ARCH-3**: Progressive loading | Suspense boundaries wrap every data-dependent section. Skeleton components render immediately. AI sections are independent Suspense boundaries that cannot block page shell. |
| **GR-PERF-1**: Public HTTPS deployment | Vercel deployment as final task. Verified by accessing live URL. |
| **GR-QUAL-1**: Core logic tested | ≥80% coverage on auth, AI service, donation logic. Vitest for unit/integration. Playwright for E2E auth and navigation flows. |
| **GR-QUAL-2**: Instrumentation documented | MetricEvent model in DB. METRICS.md in repo root. Both must be present and consistent. |
| **GR-SCOPE-1**: GoFundMe UX, original visual | Page structure mirrors GoFundMe (SM-2, SM-3, SM-4). Custom color palette (non-green), original typography. Design system tokens in Tailwind config. |
| **GR-SCOPE-2**: Mobile-responsive | Tailwind responsive utilities. All pages tested at 375px viewport. 44px minimum touch targets. 16px minimum body text. |
| **GR-AC-1**: AI feels natural | Prompts instruct against templated language. AI outputs are narrative text, not bullet-point stat dumps. Cached to prevent repetitive regeneration. |
| **GR-AC-2**: Real auth | NextAuth.js credentials provider with bcrypt. JWT sessions with 7-day sliding expiry. E2E tests for full register → login → protected route flow. |

### External Dependencies

- **Supabase PostgreSQL**: Free tier, ~20 concurrent connections max. Prisma `connection_limit` parameter set accordingly.
- **LLM API**: External dependency. 10-second timeout. 15-minute response cache. Graceful degradation — AI sections hidden if provider is unavailable. No application functionality blocked by AI outage.
- **Vercel**: Deployment target. Serverless function limits apply (10s default timeout, 4.5MB request size). Ephemeral filesystem — all persistent data in PostgreSQL.
