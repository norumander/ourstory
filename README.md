# ourstory

An AI-enhanced crowdfunding platform that weaves individual acts of giving into a collective narrative — three interconnected pages (Profile, Fundraiser, Community) faithful to GoFundMe's UX patterns, with an original warm editorial visual design and AI features that surface impact insights, community stories, and personalized giving intelligence.

**Live:** [https://ourstory-theta.vercel.app](https://ourstory-theta.vercel.app)

## Features

### Three Core Pages
- **Fundraiser Page** (`/fundraiser/[id]`) — Hero image with cinematic title overlay, progress bar, donation list ("Words of support"), organizer info, share button, AI Impact Snapshot
- **Community Page** (`/community/[slug]`) — Header image overlay, aggregate stats, fundraiser leaderboard, follow toggle, AI Community Story
- **Profile Page** (`/profile/[username]`) — Avatar with gold ring, activity feed, top-supported fundraisers, followed users/communities, AI Giving Insights (owner-only)

### AI Features
- **Impact Snapshot** — Contextualizes fundraised amounts into tangible, real-world outcomes (generated per fundraiser, persisted in DB, regenerated after donations)
- **Community Story** — Synthesizes a community's collective giving into a narrative (not a stat dump)
- **Giving Insights** — Personalized analysis of a donor's giving patterns with specific observations
- **Story Coach** — "Help me write" button on fundraiser creation that generates a polished story from rough notes
- Provider-agnostic: supports OpenAI and Anthropic with automatic fallback

### Authentication
- Email/password registration and login (NextAuth.js v5, bcrypt)
- Google OAuth (supplemental — both methods work independently)
- JWT sessions with 7-day expiry

### Additional Features
- Browse all fundraisers with category filtering (`/fundraisers`)
- Fundraiser creation and editing (organizer-only)
- Mock donation flow with prominent "no real money" banner
- User and community follow system with follower/following pages
- Web Share API on mobile, clipboard fallback on desktop
- Metrics dashboard (`/admin/metrics`) with admin-only access
- ISR caching (30-60s) with on-demand revalidation after mutations

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | NextAuth.js v5 (Credentials + Google OAuth) |
| AI | Provider-agnostic (OpenAI / Anthropic with fallback) |
| Tests | Vitest (55 unit tests) |
| Deployment | Vercel |

## Design System

Warm editorial design — not a typical SaaS template.

- **Palette:** Warm Plum (#5c3d6e) primary, Terracotta (#c47d3c) secondary, Cream (#faf7f2) canvas
- **Typography:** Lora (serif) for headlines, AI narratives, and pull-quotes; Inter for functional UI
- **Signature elements:** Cinematic hero image overlays, editorial AI pull-quotes with terracotta accent tabs, italic serif donation messages, gold avatar rings, warm borders throughout

## Getting Started

### Prerequisites
- Node.js 22+
- A Supabase project (free tier works)
- OpenAI and/or Anthropic API key (optional — AI features degrade gracefully)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in: DATABASE_URL, AUTH_SECRET, API keys

# Push schema to database
npx prisma db push

# Seed with demo data
npx prisma db seed

# Start development server
npm run dev
```

### Demo Account
- **Email:** `demo@ourstory.app`
- **Password:** `demodemo123`

### Environment Variables

See `.env.example` for the full list. Required:
- `DATABASE_URL` — Supabase PostgreSQL connection string
- `AUTH_SECRET` — Generate with `openssl rand -base64 32`

Optional:
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` — For AI features
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — For Google OAuth
- `AI_PROVIDER` — `openai` (default) or `anthropic`

## Project Structure

```
ourstory/
├── docs/
│   ├── ARCHITECTURE.md          # System design and component diagram
│   ├── IMPLEMENTATION.md        # Task tracking and session log
│   ├── DECISIONS.md             # 13 Architecture Decision Records
│   └── TESTING.md               # Test strategy and conventions
├── prisma/
│   ├── schema.prisma            # 7 models, 2 enums
│   └── seed.ts                  # Demo data (6 users, 9 fundraisers, 33 donations)
├── src/
│   ├── app/                     # Next.js App Router pages and API routes
│   ├── components/              # UI primitives + domain components
│   ├── lib/                     # Auth, AI service, Prisma, utilities
│   └── types/                   # TypeScript type augmentations
├── tests/unit/                  # 55 Vitest unit tests
├── CLAUDE.md                    # Agent operating manual
├── PRD.md                       # Product requirements
├── GOLDEN.md                    # Non-negotiable constraints
└── METRICS.md                   # Instrumentation documentation
```

## Architecture Decisions

Key decisions documented in `docs/DECISIONS.md`:

- **ADR-001:** Next.js 15 + Prisma + Supabase + NextAuth.js stack
- **ADR-004:** Provider-agnostic AI with env-var switching
- **ADR-009:** AI content persisted in DB (not Redis) — zero extra infrastructure
- **ADR-013:** ISR caching with on-demand revalidation — sub-100ms page loads

See all 13 ADRs for the full rationale behind each architectural choice.

## Golden Requirements

All 13 non-negotiable requirements from `GOLDEN.md` are satisfied:

| Requirement | Status |
|---|---|
| GR-SEC-1: No plaintext passwords | ✅ bcrypt, cost ≥ 10 |
| GR-SEC-2: No secrets in client/VCS | ✅ env vars only |
| GR-SEC-3: Mock payments obvious | ✅ Prominent banner |
| GR-ARCH-1: Three distinct pages | ✅ Profile, Fundraiser, Community |
| GR-ARCH-2: Interconnected navigation | ✅ Cross-links, no dead ends |
| GR-ARCH-3: Progressive loading | ✅ Suspense boundaries |
| GR-PERF-1: Public HTTPS deployment | ✅ Vercel |
| GR-QUAL-1: Core logic tested | ✅ 55 unit tests |
| GR-QUAL-2: Instrumentation documented | ✅ METRICS.md + MetricEvent |
| GR-SCOPE-1: GoFundMe UX, original visual | ✅ Warm editorial design |
| GR-SCOPE-2: Mobile-responsive | ✅ 360-428px tested |
| GR-AC-1: AI feels natural | ✅ Editorial pull-quotes |
| GR-AC-2: Real auth | ✅ Email/password + Google OAuth |
