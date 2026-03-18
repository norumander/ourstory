# IMPLEMENTATION.md

## Current Focus

TASK-001: Design System & Tailwind Configuration

## Tasks

### TASK-001: Design System & Tailwind Configuration
- **Status**: TODO
- **Priority**: P0
- **Description**: Set up the visual design system — custom color palette (non-green, distinct from GoFundMe), typography choices, spacing scale, and Tailwind CSS v4 configuration. Define design tokens as CSS variables. Establish base component styles (buttons, inputs, cards, badges).
- **Dependencies**: None (foundation)
- **Acceptance Criteria**:
  - [ ] Tailwind config defines a custom primary color (not green, not GoFundMe #00b964)
  - [ ] Typography system uses original font choices (not GoFundMe's)
  - [ ] Design tokens defined as CSS custom properties
  - [ ] Color contrast meets WCAG 2.1 AA (4.5:1 minimum for body text)
  - [ ] Base UI component styles exist (Button, Input, Card, Badge, ProgressBar)
  - [ ] Dark/light theme tokens defined (dark mode not required, but tokens should support it)

### TASK-002: Database Schema & Prisma Setup
- **Status**: TODO
- **Priority**: P0
- **Description**: Define the Prisma schema with all 7 models (User, Fundraiser, Donation, Community, UserFollow, CommunityFollow, MetricEvent). Configure connection pooling for Supabase free tier. Generate and run initial migration.
- **Dependencies**: None (foundation)
- **Acceptance Criteria**:
  - [ ] Prisma schema defines all 7 models matching PRD data model spec
  - [ ] All field constraints enforced (unique, not null, default values, min/max)
  - [ ] Monetary amounts stored as integer cents
  - [ ] UUID primary keys on User, Fundraiser, Donation, Community
  - [ ] Category enum defined with 8 values
  - [ ] MetricEvent.eventType enum defined with 5 values
  - [ ] UserFollow unique constraint on (followerId, followingId)
  - [ ] CommunityFollow unique constraint on (userId, communityId)
  - [ ] Prisma client singleton with connection pooling configured
  - [ ] Migration generates and applies successfully
  - [ ] Tests verify schema constraints

### TASK-003: Seed Data Script
- **Status**: TODO
- **Priority**: P0
- **Description**: Create seed script that populates the database with realistic test data per PRD Requirement 15. Must include the demo user with predictable credentials.
- **Dependencies**: TASK-002
- **Acceptance Criteria**:
  - [ ] At least 5 users with display name, email, bcrypt-hashed password
  - [ ] Demo user: email `demo@ourstory.app`, password `demodemo123`
  - [ ] At least 3 communities with name, description, slug, header image URL
  - [ ] At least 8 fundraisers across communities, 10%–95% funded, 4+ categories
  - [ ] At least 30 donations across fundraisers and users, varying amounts/messages, 60-day span
  - [ ] Follow relationships (UserFollow and CommunityFollow) so pages show social graphs
  - [ ] Seed script is idempotent (can re-run without duplicates)
  - [ ] `npx prisma db seed` executes successfully

### TASK-004: Auth Backend
- **Status**: TODO
- **Priority**: P0
- **Description**: Configure NextAuth.js with credentials provider, JWT session strategy, bcrypt password hashing. Create the registration API route. Set up auth middleware for protected routes.
- **Dependencies**: TASK-002
- **Acceptance Criteria**:
  - [ ] NextAuth.js configured with credentials provider (email/password)
  - [ ] Passwords hashed with bcrypt, cost factor ≥10 (GR-SEC-1)
  - [ ] JWT sessions with 7-day sliding expiry
  - [ ] Session includes user ID, email, displayName, username
  - [ ] `POST /api/auth/register` creates user, derives username from email prefix
  - [ ] Duplicate email returns specific error message
  - [ ] Login failure returns generic "invalid credentials" (no field revelation)
  - [ ] Registration validates: email format, password ≥8 chars, displayName 1–50 chars
  - [ ] No secrets in client bundles or response bodies (GR-SEC-2)
  - [ ] Unit tests for password hashing, username derivation, validation
  - [ ] Integration tests for register and login API routes

### TASK-005: Layout, Navigation & Landing Page
- **Status**: TODO
- **Priority**: P0
- **Description**: Create the root layout with session provider, persistent navigation header (desktop + mobile hamburger menu), and a simple landing page at `/` showing featured fundraisers and communities.
- **Dependencies**: TASK-001, TASK-004
- **Acceptance Criteria**:
  - [ ] Root layout wraps all pages with session provider and design system
  - [ ] Persistent header with: logo/home link, profile link (when logged in), login/register links (when logged out)
  - [ ] Mobile hamburger menu at viewports ≤768px
  - [ ] All nav links have minimum 44x44px touch targets (GR-SCOPE-2)
  - [ ] Landing page displays featured fundraisers and community links
  - [ ] Landing page is server-rendered
  - [ ] Header displays logged-in user's name/avatar when authenticated

### TASK-006: Auth UI — Login & Register Pages
- **Status**: TODO
- **Priority**: P0
- **Description**: Create login page at `/login` and register page at `/register` with form validation, error display, and redirect handling.
- **Dependencies**: TASK-001, TASK-004, TASK-005
- **Acceptance Criteria**:
  - [ ] Login page at `/login` with email and password fields
  - [ ] Register page at `/register` with email, password, and displayName fields
  - [ ] Inline validation errors next to relevant fields
  - [ ] Successful login redirects to user's profile page
  - [ ] Successful registration redirects to login page (or auto-login)
  - [ ] Protected route access redirects to `/login?callbackUrl=<original>`
  - [ ] Return URL preserved after login
  - [ ] Forms are keyboard-accessible and mobile-usable (GR-SCOPE-2)
  - [ ] No password visible in URL, logs, or network responses (GR-SEC-1)

### TASK-007: Fundraiser Page Display
- **Status**: TODO
- **Priority**: P0
- **Description**: Build the Fundraiser page at `/fundraiser/[id]` displaying all required information per PRD Requirement 4 and GoFundMe's structure (SM-2).
- **Dependencies**: TASK-002, TASK-005
- **Acceptance Criteria**:
  - [ ] Page renders at `/fundraiser/[id]` with correct data
  - [ ] Displays: title, organizer name (linked to Profile), story, hero image, progress bar, donation count, category tag, creation date
  - [ ] Progress bar shows amount raised vs. goal with percentage
  - [ ] Recent donations list: donor name (linked to Profile), amount, message, timestamp
  - [ ] Prominent "Donate" and "Share" CTAs visible
  - [ ] Organizer name links to `/profile/[username]` (GR-ARCH-2)
  - [ ] Donor names link to their Profile pages (GR-ARCH-2)
  - [ ] Page is server-rendered with progressive loading (GR-ARCH-3)
  - [ ] 404 page for non-existent fundraiser IDs

### TASK-008: Mock Donation Flow
- **Status**: TODO
- **Priority**: P0
- **Description**: Build the donation form accessible from the Fundraiser page Donate CTA. Implements PRD Requirement 5 with the mandatory mock payment banner.
- **Dependencies**: TASK-004, TASK-007
- **Acceptance Criteria**:
  - [ ] Donation form collects: amount (positive, max $10,000) and optional message (max 500 chars)
  - [ ] Prominent "This is a demo — no real money is being charged" banner visible without scrolling (GR-SEC-3)
  - [ ] Banner is visually distinct (contrasting background, cannot be dismissed)
  - [ ] No credit card fields, no payment provider connections
  - [ ] Donor must be logged in (redirects to login if not)
  - [ ] Successful donation creates Donation record, updates fundraiser raisedAmount and donationCount
  - [ ] Confirmation shown after successful donation
  - [ ] Validation errors display inline
  - [ ] Amount validation: min $1, max $10,000 (100–1000000 cents)
  - [ ] E2E test verifies banner visibility on desktop and mobile viewports

### TASK-009: Community Page Display
- **Status**: TODO
- **Priority**: P0
- **Description**: Build the Community page at `/community/[slug]` displaying all required information per PRD Requirement 7 and GoFundMe's structure (SM-3).
- **Dependencies**: TASK-002, TASK-005
- **Acceptance Criteria**:
  - [ ] Page renders at `/community/[slug]` with correct data
  - [ ] Displays: community name, description, header image, follower count
  - [ ] Aggregate stats: total raised, total donations, number of fundraisers (computed, not stored)
  - [ ] Leaderboard: top fundraisers ranked by amount raised
  - [ ] Leaderboard shows: organizer name (linked to Profile), fundraiser title (linked to Fundraiser page), amount raised
  - [ ] "Follow" CTA toggles to "Following" when active (GR-ARCH-2)
  - [ ] "Start a Fundraiser" CTA links to `/fundraiser/new?communityId=<id>` (pre-selects community)
  - [ ] Page is server-rendered with progressive loading (GR-ARCH-3)
  - [ ] 404 page for non-existent community slugs

### TASK-010: Profile Page Display
- **Status**: TODO
- **Priority**: P0
- **Description**: Build the Profile page at `/profile/[username]` displaying all required information per PRD Requirement 9 and GoFundMe's structure (SM-4).
- **Dependencies**: TASK-002, TASK-005
- **Acceptance Criteria**:
  - [ ] Page renders at `/profile/[username]` with correct data
  - [ ] Displays: display name, avatar (URL or generated initials), follower count, following count
  - [ ] "Follow" CTA visible on other users' profiles, hidden on own profile
  - [ ] Activity feed: donations made and fundraisers created, each linking to relevant Fundraiser page
  - [ ] Highlights: user's top-supported fundraisers by total donated amount
  - [ ] Communities the user follows listed with links to Community pages (GR-ARCH-2)
  - [ ] All names/titles in activity feed are clickable links (GR-ARCH-2)
  - [ ] Page is server-rendered with progressive loading (GR-ARCH-3)
  - [ ] 404 page for non-existent usernames

### TASK-011: Follow System
- **Status**: TODO
- **Priority**: P1
- **Description**: Implement user-follows-user and user-follows-community toggle functionality. Follow buttons on Profile and Community pages.
- **Dependencies**: TASK-004, TASK-009, TASK-010
- **Acceptance Criteria**:
  - [ ] `POST /api/profiles/[username]/follow` toggles follow, returns `{ following: boolean }`
  - [ ] `POST /api/communities/[slug]/follow` toggles follow, returns `{ following: boolean }`
  - [ ] Both endpoints require authentication
  - [ ] Self-follow prevented for users
  - [ ] Follow button updates optimistically in the UI
  - [ ] Follower/following counts update after toggle
  - [ ] Unit tests for toggle logic and self-follow prevention
  - [ ] Integration tests for both API endpoints

### TASK-012: Cross-Page Navigation
- **Status**: TODO
- **Priority**: P0
- **Description**: Verify and complete all cross-page navigation links per PRD Requirement 11. Ensure no dead-end pages exist.
- **Dependencies**: TASK-007, TASK-009, TASK-010
- **Acceptance Criteria**:
  - [ ] Fundraiser → Profile: organizer name links to profile (Req 11a)
  - [ ] Fundraiser → Profile: donor names link to profiles (Req 11b)
  - [ ] Profile → Fundraiser: activity feed items link to fundraisers (Req 11c)
  - [ ] Profile → Community: followed communities listed with links (Req 11d)
  - [ ] Community → Fundraiser: leaderboard titles link to fundraisers (Req 11e)
  - [ ] Community → Profile: leaderboard organizer names link to profiles (Req 11f)
  - [ ] Header: links to user profile and home page (Req 11g)
  - [ ] Every page has ≥2 outbound navigation paths to other page types
  - [ ] E2E test: full navigation circuit Fundraiser → Profile → Community → Fundraiser

### TASK-013: Fundraiser Creation Form
- **Status**: TODO
- **Priority**: P1
- **Description**: Build the fundraiser creation form at `/fundraiser/new` per PRD Requirement 12.
- **Dependencies**: TASK-004, TASK-005, TASK-007
- **Acceptance Criteria**:
  - [ ] Form at `/fundraiser/new` (protected route — requires auth)
  - [ ] Collects: title (5–100 chars), story (50–5000 chars), goal ($50–$1,000,000), category (8 options), image URL (optional, URL format), community (optional, select from existing)
  - [ ] Inline validation errors next to relevant fields
  - [ ] `POST /api/fundraisers` creates fundraiser, returns created ID
  - [ ] Successful creation redirects to the new Fundraiser page
  - [ ] If `communityId` query param present, pre-selects that community
  - [ ] Form is mobile-usable (GR-SCOPE-2)
  - [ ] Integration test for creation API

### TASK-014: AI Service Layer
- **Status**: TODO
- **Priority**: P0
- **Description**: Build the provider-agnostic AI service abstraction per PRD System Overview. Includes caching, timeout handling, and graceful degradation.
- **Dependencies**: None (uses env vars only)
- **Acceptance Criteria**:
  - [ ] `generateCompletion(prompt, options)` function supports OpenAI-compatible and Anthropic APIs
  - [ ] `AI_PROVIDER` env var selects provider (`openai` default, `anthropic` alternative)
  - [ ] 10-second timeout per AI call
  - [ ] Returns `null` on failure (timeout, error, unavailable) — no thrown exceptions to callers
  - [ ] All failures logged with structured error info
  - [ ] API keys loaded from env vars only (GR-SEC-2)
  - [ ] Unit tests for provider selection, timeout, error handling
  - [ ] Unit tests verify graceful null return on all failure modes

### TASK-015: AI Impact Story (Fundraiser Page)
- **Status**: TODO
- **Priority**: P1
- **Description**: Implement the AI Impact Story generator and integrate it into the Fundraiser page per PRD Requirement 6.
- **Dependencies**: TASK-007, TASK-014
- **Acceptance Criteria**:
  - [ ] `generateImpactStory(fundraiserData)` constructs prompt from goal, raised, donationCount, category, story
  - [ ] Returns 2–4 sentence narrative contextualizing donations into real-world impact
  - [ ] Prompt instructs against templated/robotic language (GR-AC-1)
  - [ ] Response cached 15 minutes, keyed by input data hash
  - [ ] "AI-generated insight" label visible on the section
  - [ ] Section hidden gracefully if AI unavailable — no error messages, no layout shift (GR-ARCH-3)
  - [ ] Generated server-side on page load, not streamed to client
  - [ ] Unit tests for prompt construction, cache behavior, graceful degradation

### TASK-016: AI Community Narrative
- **Status**: TODO
- **Priority**: P1
- **Description**: Implement the AI Community Narrative generator and integrate it into the Community page per PRD Requirement 8.
- **Dependencies**: TASK-009, TASK-014
- **Acceptance Criteria**:
  - [ ] `generateCommunityNarrative(communityData)` constructs prompt from aggregate stats
  - [ ] Returns 3–5 sentence narrative synthesizing collective giving — not a stat dump
  - [ ] Prompt instructs against templated/robotic language (GR-AC-1)
  - [ ] Cache invalidated when underlying data changes (new donations, new fundraisers)
  - [ ] "AI-generated narrative" label visible on the section
  - [ ] Section hidden gracefully if AI unavailable (GR-ARCH-3)
  - [ ] Unit tests for prompt construction, cache invalidation, graceful degradation

### TASK-017: AI Giving Insights (Profile Page)
- **Status**: TODO
- **Priority**: P1
- **Description**: Implement the AI Giving Insights generator and integrate it into the Profile page per PRD Requirement 10.
- **Dependencies**: TASK-010, TASK-014
- **Acceptance Criteria**:
  - [ ] `generateGivingInsights(donationHistory)` constructs prompt from user's donations
  - [ ] Returns: 2–3 sentence summary + up to 3 specific observations
  - [ ] Section only visible to the profile owner (not other viewers)
  - [ ] `GET /api/profiles/[username]/insights` requires auth, returns 403 if not owner
  - [ ] "AI-generated insights" label visible on the section
  - [ ] If fewer than 2 donations, shows "Make a few donations to unlock your personalized giving insights"
  - [ ] Cache 15 minutes, keyed by user ID + donation data hash
  - [ ] Section hidden gracefully if AI unavailable (GR-ARCH-3)
  - [ ] Unit tests for prompt construction, <2 donations handling, owner-only access

### TASK-018: Progressive Loading & Skeletons
- **Status**: TODO
- **Priority**: P0
- **Description**: Implement Suspense boundaries and skeleton loading components for all three page types per PRD Requirement 13.
- **Dependencies**: TASK-007, TASK-009, TASK-010
- **Acceptance Criteria**:
  - [ ] Each page type has Suspense boundaries wrapping data-dependent sections
  - [ ] Skeleton components for: donation list, activity feed, AI sections, aggregate stats, leaderboard
  - [ ] Page shell (header, navigation, layout) renders immediately
  - [ ] AI sections are in separate Suspense boundaries — cannot block other content
  - [ ] No full-page loading spinner blocks the viewport (GR-ARCH-3)
  - [ ] Skeletons match the approximate shape of the loaded content
  - [ ] E2E test verifies page shell renders before data sections

### TASK-019: Instrumentation & Metrics Dashboard
- **Status**: TODO
- **Priority**: P1
- **Description**: Implement structured event logging to MetricEvent table and the metrics dashboard at `/admin/metrics` per PRD Requirements 16 and 17.
- **Dependencies**: TASK-002, TASK-004
- **Acceptance Criteria**:
  - [ ] `logEvent(type, payload)` writes MetricEvent records to database
  - [ ] Captures: page_load, ai_invocation, donation, navigation, auth events
  - [ ] Page load events include page type, timestamp, duration
  - [ ] AI invocations include feature type, latency ms, success/failure
  - [ ] Donation events include fundraiser ID, amount, timestamp
  - [ ] Navigation events include source and destination page types
  - [ ] Auth events include: registration, login success, login failure, logout
  - [ ] Dashboard at `/admin/metrics` (auth required) shows aggregated counts and averages
  - [ ] Dashboard groups metrics by event type
  - [ ] `GET /api/metrics` returns aggregated data
  - [ ] Unit tests for logEvent, payload validation
  - [ ] Integration test for metrics API

### TASK-020: METRICS.md, .env.example & Security Hardening
- **Status**: TODO
- **Priority**: P0
- **Description**: Create METRICS.md documentation (PRD Req 17), .env.example with placeholders, and verify no security violations (GR-SEC-2). Final security audit pass.
- **Dependencies**: TASK-019
- **Acceptance Criteria**:
  - [ ] `METRICS.md` in repo root documents each metric: what, how, why, dashboard access
  - [ ] METRICS.md content matches actual implementation (GR-QUAL-2)
  - [ ] `.env.example` lists all required env vars with placeholder values
  - [ ] No `NEXT_PUBLIC_` prefix on secret env vars
  - [ ] `.gitignore` covers `.env*` (excluding `.env.example`)
  - [ ] No secrets in git history
  - [ ] No raw HTML injection on user-supplied or AI-generated content
  - [ ] All mutation endpoints require valid session
  - [ ] Input validation on all API endpoints (400 on malformed requests)

### TASK-021: Mobile Responsiveness Verification
- **Status**: TODO
- **Priority**: P0
- **Description**: Systematic mobile responsiveness pass on all pages per PRD Requirement 14 and GR-SCOPE-2.
- **Dependencies**: TASK-007, TASK-008, TASK-009, TASK-010, TASK-013
- **Acceptance Criteria**:
  - [ ] No horizontal scrolling at 360px–428px width on any page
  - [ ] All CTAs (Donate, Follow, Share, Create) have ≥44x44px touch targets
  - [ ] Donation form completable on mobile without zooming
  - [ ] Navigation accessible on mobile (hamburger menu)
  - [ ] Body text ≥16px on mobile
  - [ ] Playwright tests pass at 375px and 428px viewports

### TASK-022: Deployment to Vercel
- **Status**: TODO
- **Priority**: P0
- **Description**: Deploy the application to Vercel with all environment variables configured. Verify public HTTPS access (GR-PERF-1).
- **Dependencies**: All tasks
- **Acceptance Criteria**:
  - [ ] Application deployed to Vercel with public HTTPS URL
  - [ ] All environment variables configured (database, auth, AI provider)
  - [ ] All three page types accessible at their routes
  - [ ] Auth flow works end-to-end on deployed version
  - [ ] Demo user can log in with seed credentials
  - [ ] AI features functional (or gracefully degraded if no API key)
  - [ ] No secrets exposed in client-side bundles

## Completed

(None yet)

## Backlog

- **STRETCH-001**: AI Story Coach on fundraiser creation form
- **STRETCH-002**: Google OAuth social login
- **STRETCH-003**: Web Share API on mobile (extends TASK-007 Share CTA)

## Session Log

### Checkpoint — 2026-03-17 20:00
- **Phase**: Phase 0 — Init & Plan (COMPLETE)
- **Completed**: Read PRD.md and GOLDEN.md. Identified tech stack (Next.js 15, TypeScript, Tailwind CSS, Prisma, Supabase PostgreSQL, NextAuth.js, Vitest + Playwright). Created .gitignore. Presented planning gate to user with component breakdown (~20-22 tasks), golden requirements enforcement matrix, and 5 assumptions. User confirmed.
- **State**: Repo has CLAUDE.md, PRD.md, GOLDEN.md, README.md, .gitignore. No source code, no docs beyond this checkpoint file. One initial commit + .gitignore commit.
- **Next**: Execute Phase 1 — Generate docs/ARCHITECTURE.md, flesh out docs/IMPLEMENTATION.md with sequenced tasks, generate docs/DECISIONS.md (ADR-001 minimum), generate docs/TESTING.md. All from PRD + confirmed assumptions.
- **Blockers**: None
- **Open Questions**:
  - Username: will derive from email prefix (confirmed by user proceeding)
  - Home page: simple landing page at `/` (confirmed)
  - Metrics storage: PostgreSQL via MetricEvent model (confirmed)
  - Share CTA: clipboard copy in core (confirmed)
  - AI provider: default OpenAI-compatible, Anthropic via env var (confirmed)
  - Next.js version: 15 stable (confirmed)

### Checkpoint — 2026-03-17 20:30
- **Phase**: Phase 1 — Generate Module Files (COMPLETE)
- **Completed**: Generated all four module files from PRD. ARCHITECTURE.md with system diagram, component table, directory structure, tech stack, golden requirements enforcement matrix. IMPLEMENTATION.md with 22 sequenced tasks (dependency-ordered, each with acceptance criteria). DECISIONS.md with 6 ADRs. TESTING.md with Vitest + Playwright strategy and golden requirement verification tests.
- **State**: Repo has all bootstrap inputs + docs/ARCHITECTURE.md, docs/IMPLEMENTATION.md, docs/DECISIONS.md, docs/TESTING.md. No source code yet. 4 commits on main.
- **Next**: Execute Phase 2 — Scaffold. Create directory structure per ARCHITECTURE.md, set up package.json, install dependencies (Next.js 15, Tailwind v4, Prisma, NextAuth, Vitest, Playwright), configure linter/formatter, verify test runner executes.
- **Blockers**: None
- **Open Questions**: None — all assumptions confirmed in Phase 0.

### Checkpoint — 2026-03-17 21:00
- **Phase**: Phase 2 & 3 — Scaffold + Validation (COMPLETE)
- **Completed**: Created full directory structure per ARCHITECTURE.md. Installed all dependencies (Next.js 15, React 19, Tailwind CSS v4, Prisma, NextAuth v5, bcryptjs, Vitest, Playwright). Configured ESLint, PostCSS, TypeScript, Vitest, Playwright. Minimal Prisma schema, root layout, landing page placeholder. Build passes, test runner passes (1/1), linter clean.
- **State**: Project scaffolded and verified. All tooling operational. No production code yet. 6 commits on main. Ready for steady-state development.
- **Next**: Begin TASK-001 (Design System & Tailwind Configuration) followed by TASK-002 (Database Schema & Prisma Setup). These are independent foundation tasks.
- **Blockers**: None
- **Open Questions**: None
