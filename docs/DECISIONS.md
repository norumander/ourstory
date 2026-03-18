# DECISIONS.md

## ADR Index

| # | Title | Status | Date |
|---|---|---|---|
| ADR-001 | Primary tech stack selection | Accepted | 2026-03-17 |
| ADR-002 | Username derivation from email | Accepted | 2026-03-17 |
| ADR-003 | Metrics storage in PostgreSQL | Accepted | 2026-03-17 |
| ADR-004 | AI provider abstraction and default | Accepted | 2026-03-17 |
| ADR-005 | Landing page as entry point | Accepted | 2026-03-17 |
| ADR-006 | Share CTA as clipboard copy in core | Accepted | 2026-03-17 |

---

## ADR-001: Primary Tech Stack Selection

- **Status**: Accepted
- **Date**: 2026-03-17
- **Context**: The PRD specifies a tech stack. Phase 0 confirmed these choices with the user. The stack must support three interconnected pages with progressive loading, real auth, AI integration, and Vercel deployment.
- **Decision**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Prisma ORM, Supabase PostgreSQL, NextAuth.js (Auth.js v5), Vitest + Playwright. AI via provider-agnostic service layer. Deploy to Vercel.
- **Golden Requirements Impact**:
  - GR-ARCH-1: Next.js file-based routing naturally creates distinct page routes. Compliant.
  - GR-ARCH-3: Next.js Server Components + Suspense enable progressive loading. Compliant.
  - GR-PERF-1: Vercel deployment provides public HTTPS. Compliant.
  - GR-QUAL-1: Vitest + Playwright provide comprehensive test coverage. Compliant.
  - GR-SEC-1: NextAuth.js credentials provider with bcrypt. Compliant.
  - GR-AC-2: NextAuth.js provides real email/password auth. Compliant.
- **Consequences**:
  - Positive: Type safety end-to-end, excellent DX, zero-config deployment, mature ecosystem.
  - Negative: Supabase free tier has connection limits (~20 concurrent). Mitigated by Prisma connection pooling.
  - Neutral: Next.js 15 is stable but not bleeding-edge. Avoids risk of Next.js 16 API changes.

---

## ADR-002: Username Derivation from Email

- **Status**: Accepted
- **Date**: 2026-03-17
- **Context**: PRD specifies User.username as "derived from email or set during registration." The registration form collects only email, password, and displayName — no username field. Profile pages route to `/profile/[username]`.
- **Decision**: Derive username from the email prefix (part before `@`). If a duplicate exists, append a numeric suffix (e.g., `john`, `john2`, `john3`). This happens server-side during registration. Users cannot change their username after creation.
- **Golden Requirements Impact**: None affected.
- **Consequences**:
  - Positive: No extra form field. Deterministic, simple to implement.
  - Negative: Usernames may be ugly (e.g., `john.doe2024`). Acceptable for MVP — not a user-facing brand concern.
  - Neutral: Unique constraint on username column handles race conditions.

---

## ADR-003: Metrics Storage in PostgreSQL

- **Status**: Accepted
- **Date**: 2026-03-17
- **Context**: PRD says metrics log store can be "file-based or in-memory for MVP." Vercel has an ephemeral filesystem — file-based logging would be lost on every deploy and between serverless function invocations. In-memory would be lost on cold starts.
- **Decision**: Store MetricEvent records in PostgreSQL via the MetricEvent Prisma model. This works reliably in production, persists across deploys, and adds negligible load to the free-tier database given the small event volume.
- **Golden Requirements Impact**:
  - GR-QUAL-2: Persistent metrics storage ensures instrumentation data survives deploys. Compliant and stronger than PRD minimum.
- **Consequences**:
  - Positive: Reliable, queryable, works in production.
  - Negative: Slightly increases database row count. Negligible at MVP scale.
  - Neutral: Aggregation queries for the dashboard are straightforward SQL.

---

## ADR-004: AI Provider Abstraction and Default

- **Status**: Accepted
- **Date**: 2026-03-17
- **Context**: PRD requires a provider-agnostic AI service layer that accepts "any OpenAI-compatible or Anthropic API" and can be swapped via environment variable.
- **Decision**: Default to OpenAI-compatible API (`OPENAI_API_KEY` env var) as it's the most common. Support Anthropic as an alternative via `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY`. The service layer exposes a single `generateCompletion(prompt, options)` function. Provider selection happens at initialization, not per-call.
- **Golden Requirements Impact**:
  - GR-SEC-2: API keys are environment variables, never in client code or VCS. Compliant.
  - GR-AC-1: Provider abstraction doesn't affect AI output quality — prompts are the same regardless of provider. Compliant.
- **Consequences**:
  - Positive: Simple to switch providers. No code changes needed — just env var change.
  - Negative: Feature parity between providers may vary (e.g., system prompts, token limits). The abstraction uses the common denominator.
  - Neutral: Three AI generators (Impact Story, Community Narrative, Giving Insights) consume the same interface.

---

## ADR-005: Landing Page as Entry Point

- **Status**: Accepted
- **Date**: 2026-03-17
- **Context**: PRD Requirement 11g mentions "a home/browse page" in the navigation header but does not specify its content. Search and discovery are explicitly out of scope.
- **Decision**: Create a simple landing page at `/` that displays featured fundraisers (highest activity) and community links. Not a discovery engine — just an entry point to the three core page types. Minimal implementation.
- **Golden Requirements Impact**:
  - GR-ARCH-2: Landing page provides navigation entry points to all three page types. Supports interconnection requirement.
- **Consequences**:
  - Positive: Users have a starting point. Navigation header has a "home" link.
  - Negative: Without search, users rely on direct links or the landing page's curated content.
  - Neutral: Content is server-rendered from existing data — no new API endpoints needed.

---

## ADR-006: Share CTA as Clipboard Copy in Core

- **Status**: Accepted
- **Date**: 2026-03-17
- **Context**: PRD Requirement 4 includes a "Share" CTA on the Fundraiser page, but the full share functionality (clipboard + Web Share API) is listed as Stretch Goal 3.
- **Decision**: In core MVP, the Share button copies the fundraiser URL to the clipboard and shows a brief toast notification. Web Share API support is deferred to stretch.
- **Golden Requirements Impact**: None affected.
- **Consequences**:
  - Positive: Satisfies Req 4's Share CTA without stretch scope. Simple to implement.
  - Negative: No native mobile share sheet in core. Acceptable — clipboard copy works on all platforms.
  - Neutral: Stretch Goal 3 adds Web Share API on top of this without replacing it.
