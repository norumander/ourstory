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
| ADR-007 | No rate limiting for MVP | Accepted | 2026-03-18 |
| ADR-008 | No pagination for MVP | Accepted | 2026-03-18 |
| ADR-009 | AI content persisted in database, not Redis | Accepted | 2026-03-18 |
| ADR-010 | Admin access via email allowlist, not RBAC | Accepted | 2026-03-18 |
| ADR-011 | No API route integration tests for MVP | Accepted | 2026-03-18 |
| ADR-012 | FundraiserCard duplication accepted for MVP | Accepted | 2026-03-18 |
| ADR-013 | ISR caching over force-dynamic | Accepted | 2026-03-18 |

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

---

## ADR-007: No Rate Limiting for MVP

- **Status**: Accepted
- **Date**: 2026-03-18
- **Context**: Code review identified that no API routes implement rate limiting. The AI endpoints (`/api/fundraisers/story-coach`, `/api/profiles/[username]/insights`) call external LLM APIs that cost money per request. The donation and registration endpoints are also unprotected against abuse.
- **Decision**: Defer rate limiting to post-MVP. The app is a portfolio demonstration with limited public traffic, not a production service under real load. Adding rate limiting properly requires either Upstash Redis (`@upstash/ratelimit`) or Vercel Edge Config — both add infrastructure dependencies and cost beyond the Supabase free tier this project is built on.
- **Golden Requirements Impact**: None directly — the PRD does not specify rate limiting. GR-SEC-2 (no secrets) is unaffected since rate limiting config would use env vars.
- **Consequences**:
  - Positive: No additional infrastructure cost or dependency. Simpler deployment.
  - Negative: AI endpoints could be abused to drain API budgets. Registration endpoint is open to credential stuffing attempts.
  - **Migration path**: When ready, add `@upstash/ratelimit` with a Redis store. Apply to AI endpoints first (highest cost risk), then auth endpoints. Estimated effort: 2-3 hours.

---

## ADR-008: No Pagination for MVP

- **Status**: Accepted
- **Date**: 2026-03-18
- **Context**: The browse fundraisers page (`/fundraisers`) fetches all fundraisers without `take`/`skip` limits. The profile page eagerly loads all of a user's fundraisers, donations, and follows in a single query. Code review flagged this as a performance concern.
- **Decision**: Defer pagination to post-MVP. The seed dataset is ~50 records total (9 fundraisers, 33 donations, 6 users). Even with user-created content, the dataset will remain small during the portfolio demonstration period. The ISR caching layer (30-60s revalidation) means the database is queried infrequently regardless.
- **Golden Requirements Impact**: GR-ARCH-3 (progressive loading) is satisfied by Suspense boundaries — the page shell renders immediately while data loads. Pagination would improve data-fetching efficiency but is not required for progressive rendering.
- **Consequences**:
  - Positive: Simpler page components. No pagination UI to design. No cursor/offset state to manage.
  - Negative: Performance degrades linearly with data growth. Browse page will slow down after ~100+ fundraisers.
  - **Migration path**: Add cursor-based pagination using Prisma's `cursor`/`take` pattern. Add "Load more" buttons or infinite scroll to browse and profile pages. Estimated effort: 3-4 hours.

---

## ADR-009: AI Content Persisted in Database, Not Redis

- **Status**: Accepted
- **Date**: 2026-03-18
- **Context**: AI-generated content (Impact Stories, Community Narratives) was initially cached in an in-memory TTL map with a 15-minute expiry. On Vercel's serverless platform, each function invocation can be a cold start — the in-memory cache was effectively useless. Options: (A) Redis/Upstash for distributed caching, (B) persist directly in the database alongside the entity, (C) keep in-memory cache and accept cache misses.
- **Decision**: Persist AI content as nullable columns on the Fundraiser (`aiImpactStory`) and Community (`aiNarrative`) models. Generated on first access when null, cleared (set to null) when underlying data changes (e.g., after a new donation). This makes the database the single source of truth for both the entity and its AI-generated content.
- **Golden Requirements Impact**: GR-AC-1 (AI feels natural) — AI content updates when data changes, so narratives stay relevant. GR-ARCH-3 (progressive loading) — AI content loads with the main query, no separate async fetch.
- **Consequences**:
  - Positive: Zero additional infrastructure. No Redis dependency or cost. AI content loads in the same query as the entity — no extra round trip. Cache survives deploys and cold starts. Simple invalidation: `UPDATE SET aiImpactStory = NULL` after a donation.
  - Negative: Database rows are slightly larger. AI content generation blocks the first page render after invalidation (subsequent renders read from DB).
  - **Why not Redis**: Adds a dependency (Upstash), a billing dimension, and operational complexity for a feature that works perfectly well in PostgreSQL. The AI content is tightly coupled to specific entities — storing it on the entity row is the natural data model. Redis would be the right choice if we needed sub-millisecond reads or cross-request deduplication, neither of which applies here.

---

## ADR-010: Admin Access via Email Allowlist, Not RBAC

- **Status**: Accepted
- **Date**: 2026-03-18
- **Context**: Code review identified that the metrics dashboard (`/admin/metrics`) was accessible to any authenticated user. Options: (A) add a `role` enum to the User model with proper RBAC, (B) maintain a hardcoded list of admin email addresses, (C) check against an environment variable.
- **Decision**: Hardcoded email allowlist (`ADMIN_EMAILS`) checked in both the metrics page and API route. The list currently includes `demo@ourstory.app` and `norman.peter@challenger.gauntletai.com`.
- **Golden Requirements Impact**: GR-QUAL-2 (instrumentation documented) — admin-only access ensures metrics data isn't exposed to all users, which is better than the original design.
- **Consequences**:
  - Positive: Zero schema changes. No migration needed. Simple to understand and audit.
  - Negative: Adding a new admin requires a code change and redeploy. Doesn't scale beyond a handful of admins.
  - **Migration path**: When needed, add a `role` enum (`USER`, `ADMIN`) to the User model. Seed the demo user as ADMIN. Check `session.user.role === "ADMIN"` instead of email matching. Estimated effort: 1-2 hours.

---

## ADR-011: No API Route Integration Tests for MVP

- **Status**: Accepted
- **Date**: 2026-03-18
- **Context**: Code review identified that none of the 13 API route handlers have integration tests. The project has 55 unit tests covering auth validation, password hashing, AI service behavior, utility functions, and metrics logging. The testing strategy in `docs/TESTING.md` specifies 100% endpoint coverage as a target.
- **Decision**: Defer API route integration tests to post-MVP. The unit tests cover the core business logic (validation, hashing, AI service). The API routes are thin wrappers that parse requests, call business logic, and return responses — the risk surface is in the business logic, which is tested. E2E tests (Playwright, not yet written) would cover the full request path more effectively than mocked integration tests.
- **Golden Requirements Impact**: GR-QUAL-1 (core logic tested) — core logic IS tested (auth, AI, utilities). The gap is in the HTTP layer (status codes, request parsing, error responses).
- **Consequences**:
  - Positive: Faster development velocity. Avoids complex test setup (mocking NextRequest/NextResponse, Prisma, auth sessions).
  - Negative: Request parsing errors, incorrect status codes, and missing auth checks are untested. The donation transaction logic is only indirectly validated.
  - **Migration path**: Use `next/test-utils` (if available) or a lightweight integration test helper that creates real NextRequest objects. Mock Prisma with `prisma-mock` or a test database. Priority endpoints: donate, register, follow toggle. Estimated effort: 4-6 hours.

---

## ADR-012: FundraiserCard Duplication Accepted for MVP

- **Status**: Accepted
- **Date**: 2026-03-18
- **Context**: Code review identified ~40 lines of identical fundraiser card JSX duplicated between the landing page (`src/app/page.tsx`) and the browse page (`src/app/fundraisers/page.tsx`). Both render the same cinematic card with gradient overlay, badge, title, progress bar, and organizer info.
- **Decision**: Accept the duplication for now. The CLAUDE.md anti-patterns section says "Extract shared code only when duplication actually exists in two or more places" — which it does. However, the two instances are in Server Components with slightly different data shapes (landing page includes community count, browse page includes community name/slug), making extraction non-trivial without a generic props interface.
- **Golden Requirements Impact**: None.
- **Consequences**:
  - Positive: Each page can evolve its card design independently if needed.
  - Negative: Design changes to the card require updating two files.
  - **Migration path**: Create `src/components/fundraiser/fundraiser-card.tsx` with a unified props interface. Both pages import and use it. Estimated effort: 30 minutes.

---

## ADR-013: ISR Caching Over Force-Dynamic

- **Status**: Accepted
- **Date**: 2026-03-18
- **Context**: Initial implementation used `export const dynamic = "force-dynamic"` on all data-dependent pages to ensure fresh data after mutations. This disabled all caching, causing every page load to query Supabase — resulting in slow page loads and connection pool exhaustion on the free tier.
- **Decision**: Replace `force-dynamic` with ISR (Incremental Static Regeneration) using `export const revalidate = N`. Landing/community/profile pages revalidate every 60 seconds. Fundraiser pages revalidate every 30 seconds. Mutation API routes call `revalidatePath()` to bust the cache immediately after donations, follows, and fundraiser creation.
- **Golden Requirements Impact**: GR-ARCH-3 (progressive loading) — ISR is complementary to Suspense-based progressive loading. Pages render from cache almost instantly, with Suspense handling the transition between cached and fresh content.
- **Consequences**:
  - Positive: Sub-100ms page loads on cache hits. Drastically fewer database queries. Eliminates connection pool exhaustion on Supabase free tier.
  - Negative: Up to 30-60 seconds of staleness for data that changes without a tracked mutation (e.g., if someone modifies the database directly). `revalidatePath` adds a small overhead to mutation endpoints.
  - Neutral: The combination of ISR (time-based background refresh) + on-demand revalidation (mutation-triggered cache busting) is the standard Next.js pattern for this use case.
