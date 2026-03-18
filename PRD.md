# PRD.md — ourstory

> **Development Methodology**: This project is built using agentic development (Claude Code).
> All requirements must be unambiguous and testable by automated tests.
> The agent follows strict TDD, makes atomic commits, and uses the CLAUDE.md bootstrap protocol.
> If a requirement can't be verified with a test, the agent can't know when to stop.

## Project Name

ourstory

## One-Liner

An AI-enhanced crowdfunding platform that weaves individual acts of giving into a collective narrative — three interconnected pages (Profile, Fundraiser, Community) faithful to GoFundMe's UX patterns, with original visual design and AI features that surface impact insights, community stories, and personalized giving intelligence.

## Problem Statement

Crowdfunding platforms show you *what* happened (donation amounts, progress bars, donor lists) but not *what it means*. A fundraiser hits 70% of its goal — but what does that money translate to in real-world impact? A community rallies around wildfire relief — but what's the collective story of that movement? A donor gives to three causes — but what patterns emerge in their generosity?

GoFundMe's own AI investment (80M+ tool uses, a Smart Fundraising Coach launched March 2026) is almost entirely supply-side: helping organizers create and manage campaigns. The demand side — the donor and community experience — remains un-augmented by AI. Donors see raw numbers; communities see leaderboards; profiles show activity logs. None of it is synthesized into meaning.

**ourstory** fills this gap. It builds three GoFundMe-inspired pages where AI transforms raw crowdfunding data into narrative insight: contextualizing donations into real-world impact on fundraiser pages, generating living community narratives from aggregate giving data, and surfacing personalized giving patterns on profile pages. The AI enhances the human story — it doesn't replace it.

This project is built for GoFundMe, a company whose mission is to be "the most helpful place in the world" and whose CPTO is actively investing in agentic AI, social graph infrastructure, and the shift from "coder to orchestrator." It demonstrates AI integration that is strategically aligned with GoFundMe's direction while exploring the demand-side whitespace their current product hasn't addressed.

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Language | TypeScript | End-to-end type safety across frontend and backend |
| Framework | Next.js 14+ (App Router) | Server Components for progressive loading, file-based routing for three distinct pages, API routes for backend logic |
| Styling | Tailwind CSS | Utility-first for rapid mobile-responsive development |
| Database | PostgreSQL (Supabase hosted) | Relational model fits entity relationships; Supabase provides managed hosting with free tier |
| ORM | Prisma | Type-safe schema, migrations, and seed scripts |
| Auth | NextAuth.js (Auth.js) | Credential provider for email/password; JWT sessions |
| AI Provider | LLM API (user's choice — abstracted behind service layer) | Service interface accepts any OpenAI-compatible or Anthropic API. Agent must implement a provider-agnostic abstraction so the LLM can be swapped via environment variable |
| Test Framework | Vitest (unit/integration) + Playwright (E2E) | Vitest for fast unit tests; Playwright for auth flows, navigation, and mobile viewport testing |
| Build Tool | Next.js built-in (Turbopack) | Zero-config, integrated with framework |
| Deployment | Vercel | Zero-config Next.js deployment, HTTPS by default, preview deploys |
| Instrumentation | Custom server-side logging + lightweight metrics dashboard page | No third-party analytics services; self-contained metrics |

## Requirements

### Core (MVP — must ship)

**Authentication**

1. Users can register with email and password. Registration requires email (must be valid format), password (minimum 8 characters), and display name (1–50 characters). Duplicate email registration returns a specific error message. Passwords must be hashed with bcrypt (cost factor ≥10) before storage — no plaintext passwords in the database, logs, or any persistent store.

2. Users can log in with email and password. Successful login creates a session (JWT) and redirects to the user's profile page. Failed login (wrong email or wrong password) returns a generic "invalid credentials" error without revealing which field was wrong. Sessions expire after 7 days of inactivity.

3. Users can log out. Logging out invalidates the session and redirects to the home page. Protected routes (fundraiser creation, donation, follow actions, profile editing) redirect unauthenticated users to the login page with a return URL preserved.

**Fundraiser Page**

4. The Fundraiser page exists at route `/fundraiser/[id]` and displays: fundraiser title, organizer name (links to their Profile page), fundraiser story/description, hero image (URL reference), progress bar showing amount raised vs. goal, donation count, list of recent donations (donor name linking to their Profile, amount, optional message, timestamp), category tag, creation date, and prominent "Donate" and "Share" CTAs. This mirrors GoFundMe's fundraiser page structure (SM-2).

5. The mock donation flow is accessible from the Fundraiser page Donate CTA. The donation form collects only: amount (positive number, max $10,000) and optional message (max 500 characters). The form must display a prominent, visually distinct banner stating "This is a demo — no real money is being charged" that is visible without scrolling. No credit card fields, no payment provider connections, no real financial transactions. Submitting a mock donation creates a Donation record, updates the fundraiser's raised amount, and shows a confirmation. The donor must be logged in.

6. **AI Impact Story**: Each Fundraiser page displays an AI-generated "Impact Snapshot" section below the organizer's story. The AI takes as input the fundraiser's goal, amount raised, donation count, category, and organizer story, then generates a 2–4 sentence narrative that contextualizes the fundraised amount into tangible, real-world terms (e.g., translating dollars into concrete outcomes relevant to the fundraiser's category). The snapshot must include a visible "AI-generated insight" label. The snapshot is generated server-side on page load (not streamed to the client) and cached for 15 minutes to limit API calls. If the AI service is unavailable, the section is hidden gracefully — no error messages shown to the user, no layout shift.

**Community Page**

7. The Community page exists at route `/community/[slug]` and displays: community name, description, header image (URL reference), follower count, aggregate stats (total raised, total donations, number of fundraisers), a leaderboard of top fundraisers ranked by amount raised (showing organizer name linking to Profile, fundraiser title linking to Fundraiser page, amount raised), a "Follow" CTA (toggles to "Following" when active), and a "Start a Fundraiser" CTA that links to fundraiser creation with the community pre-selected. This mirrors GoFundMe's community page structure (SM-3).

8. **AI Community Narrative**: The Community page displays an AI-generated "Community Story" section. The AI takes as input the community's aggregate stats (total raised, donation count, fundraiser count, top causes, recent activity timestamps) and generates a 3–5 sentence narrative that synthesizes the community's collective giving into a readable story — not a stat dump. The narrative updates when underlying data changes (new donations, new fundraisers) by invalidating the cache. Includes a visible "AI-generated narrative" label. Same caching and graceful degradation rules as Requirement 6.

**Profile Page**

9. The Profile page exists at route `/profile/[username]` and displays: user display name, avatar (URL reference or generated initials), follower count, following count, "Follow" CTA (hidden on own profile), activity feed (donations made, fundraisers created — each linking to the relevant Fundraiser page), and a highlights section showing the user's top-supported fundraisers by total donated amount. Organizer names, fundraiser titles, and community names throughout the activity feed are clickable links to their respective pages. This mirrors GoFundMe's profile page structure (SM-4).

10. **AI Giving Insights**: When a logged-in user views their own Profile page, an "Impact Overview" section appears showing AI-generated personalized giving insights. The AI takes as input the user's donation history (amounts, categories, timestamps, fundraisers supported) and generates: (a) a 2–3 sentence summary of their giving patterns, and (b) up to 3 specific observations (e.g., "You've contributed to 3 disaster relief causes since January" or "Your average donation is $45, with a trend toward education-related fundraisers"). This section is only visible to the profile owner (not to other users viewing the profile). Same caching (15 min), labeling ("AI-generated insights"), and graceful degradation rules as Requirement 6. If the user has fewer than 2 donations, display a friendly message instead of AI insights: "Make a few donations to unlock your personalized giving insights."

**Cross-Page Navigation**

11. All three page types are interconnected with in-context navigation links. Specifically: (a) Fundraiser page organizer name links to their Profile page, (b) Fundraiser page donor names link to their Profile pages, (c) Profile page activity feed items link to the relevant Fundraiser pages, (d) Profile page lists communities the user follows with links to Community pages, (e) Community page leaderboard fundraiser titles link to Fundraiser pages, (f) Community page leaderboard organizer names link to Profile pages, (g) a persistent navigation header appears on all pages with links to the logged-in user's profile and a home/browse page. No dead-end pages — every page has at least 2 outbound navigation paths to other page types.

**Fundraiser Creation**

12. Logged-in users can create a fundraiser via a form at route `/fundraiser/new`. The form collects: title (5–100 characters), story/description (50–5000 characters), goal amount ($50–$1,000,000), category (selected from a fixed list of 8 categories: Medical, Emergency, Education, Community, Animals, Environment, Memorial, Other), hero image URL (optional, validated as a URL format), and community association (optional, selected from existing communities). Validation errors display inline next to the relevant field. Successful creation redirects to the new Fundraiser page.

**Progressive Loading**

13. All three page types implement progressive loading using Next.js Suspense boundaries. On initial page load, the page shell (header, navigation, layout structure) renders immediately. Data-dependent sections (donation list, activity feed, AI-generated content, aggregate stats) render skeleton placeholders that are replaced as data resolves. No full-page loading spinner may block the entire viewport at any time. AI-generated sections may take longer to resolve and must not block other content from displaying.

**Mobile Responsive**

14. All three page types and the fundraiser creation form render correctly and are fully interactive on mobile viewports from 360px to 428px width. Specifically: (a) no horizontal scrolling on mobile, (b) all CTAs (Donate, Follow, Share, Create) are tappable with minimum 44x44px touch targets, (c) the donation form is completable on mobile without zooming, (d) navigation is accessible on mobile (hamburger menu or equivalent), (e) text is readable without zooming (minimum 16px body text).

**Seed Data**

15. The database seed script populates: at least 5 users (each with display name, email, hashed password), at least 3 communities (each with name, description, slug, header image URL), at least 8 fundraisers (distributed across communities, varying progress levels from 10% to 95% funded, across at least 4 different categories), and at least 30 donations (distributed across fundraisers and users, with varying amounts and messages, spanning a 60-day date range). Seed data must include follow relationships (users following users and communities) so that Profile and Community pages display non-empty social graphs. One seed user must have predictable credentials (email: `demo@ourstory.app`, password: `demodemo123`) for testing and demo purposes.

**Instrumentation**

16. The application captures the following metrics via server-side logging, with each metric logged as a structured JSON entry: (a) page load events per page type with timestamp and duration, (b) AI feature invocations per feature type (Impact Story, Community Narrative, Giving Insights) with latency in milliseconds and success/failure status, (c) mock donation events with fundraiser ID, amount, and timestamp, (d) navigation events tracking source page type and destination page type, (e) auth events (registration, login success, login failure, logout). A lightweight metrics dashboard page exists at route `/admin/metrics` (accessible only to authenticated users) that displays aggregated counts and averages for each metric category. The dashboard reads from the same server-side log store.

17. A `METRICS.md` documentation file exists in the repository root explaining: (a) each metric captured, (b) how each metric is captured (implementation mechanism), (c) why each metric was chosen (what question it answers about user behavior or system health), and (d) how to access the metrics dashboard. The documentation and the implementation must both be present and consistent with each other.

**Security**

18. All API keys (AI provider key, database connection string, NextAuth secret) are loaded from environment variables. No secrets appear in client-side JavaScript bundles (verified: no `NEXT_PUBLIC_` prefix on secret env vars). No secrets are committed to the repository (a `.env.example` file with placeholder values is committed instead). The `.gitignore` file includes `.env*` patterns (excluding `.env.example`).

**Visual Design**

19. The application's visual design (color palette, typography, spacing, component styling) is original — not a reproduction of GoFundMe's brand colors (green #00b964), typography, or visual identity. The design system must use a distinct primary color that is not green, and original typography choices. The UX structure and information hierarchy match GoFundMe's patterns; the visual skin is entirely the application's own.

### Stretch (nice to have)

1. **AI Story Coach**: On the fundraiser creation form, an optional "Help me write" button invokes an AI assistant that takes the user's title and rough notes (minimum 20 characters of input) and generates a polished fundraiser story draft. The user can accept, edit, or discard the AI suggestion. The generated draft includes a visible "AI-assisted draft — edit to make it yours" label.

2. **Social Login**: Support Google OAuth as a supplemental login method alongside email/password. Google OAuth must not replace email/password — both must work independently.

3. **Share Functionality**: The Share CTA on Fundraiser pages copies the fundraiser URL to the clipboard and shows a brief confirmation toast. On mobile devices that support the Web Share API, use the native share sheet instead.

### Out of Scope

- **Real payment processing.** No Stripe, PayPal, or any real payment provider. No collection of credit card numbers, bank details, or any real financial information. The mock donation flow is the only payment interaction.
- **Email delivery.** No transactional emails, welcome emails, notification emails, or password reset emails. If password reset is needed, it's out of scope for MVP — users who forget their password register a new account.
- **Image upload or hosting.** All images are referenced by URL (external links or placeholder services). No file upload endpoints, no image processing, no cloud storage integration (S3, Cloudinary, etc.).
- **Admin panel or moderation tools.** No ability to flag, remove, or moderate fundraisers or users (except the metrics dashboard at `/admin/metrics`). No content moderation workflows.
- **Internationalization.** English only. No multi-language support, no currency conversion, no locale-aware formatting.
- **Real-time updates via WebSockets.** No live-updating donation feeds, no real-time follower counts. Data refreshes on page load or explicit user action only.
- **Search or discovery.** No search bar, no browse/explore page, no filtering or sorting of fundraisers beyond what appears on Community and Profile pages. AI recommendations on the Profile page reference only the user's own history, not a global recommendation engine.
- **Social login beyond stretch goal.** No GitHub OAuth, no Apple Sign-In, no SSO. Email/password is the only auth method in core MVP.
- **Password reset flow.** No "forgot password" feature. Out of scope for MVP.
- **Comment system.** No comments on fundraisers. Donation messages are the only user-generated text on Fundraiser pages.
- **Fundraiser editing or deletion.** Once a fundraiser is created, it cannot be edited or deleted via the UI. Data corrections happen directly in the database if needed.

## System Overview

The application is a Next.js monolith deployed to Vercel, with a Supabase-hosted PostgreSQL database accessed via Prisma ORM.

**Frontend (Next.js App Router — Server & Client Components):** Three primary page types (Profile, Fundraiser, Community) plus supporting pages (login, register, fundraiser creation, metrics dashboard). Server Components handle data fetching and progressive rendering via Suspense boundaries. Client Components handle interactive elements (donation form, follow toggles, navigation state). Tailwind CSS handles all styling with a custom design token configuration for the original visual identity.

**API Layer (Next.js API Routes / Server Actions):** Handles auth operations (register, login, logout), CRUD for fundraisers and donations, follow/unfollow actions, and AI feature invocations. All mutation endpoints require authentication. AI endpoints call the LLM provider through the AI service abstraction layer.

**AI Service Layer:** A provider-agnostic abstraction with a single interface (`generateCompletion(prompt, options)`) that wraps the configured LLM API. Three specialized modules consume this interface: Impact Story Generator (Fundraiser page), Community Narrative Generator (Community page), and Giving Insights Generator (Profile page). Each module constructs its own prompt from structured data, calls the AI service, and returns formatted output. Responses are cached server-side (15-minute TTL) keyed by a hash of the input data. All AI calls include timeout handling (10-second max) and graceful fallback (hide the AI section, log the failure).

**Instrumentation Layer:** Server-side structured logging captures events to a JSON log store (file-based or in-memory for MVP). The metrics dashboard page reads from this store and renders aggregated views.

**Auth Layer (NextAuth.js):** Credential provider with bcrypt password hashing. JWT-based sessions stored client-side. Middleware protects routes that require authentication. Session data includes user ID, email, and display name.

## Data Model

**User**: id (UUID, PK), email (unique, not null), passwordHash (not null), displayName (not null, 1–50 chars), avatarUrl (nullable), username (unique, not null, derived from email or set during registration), createdAt, updatedAt.

**Fundraiser**: id (UUID, PK), title (not null, 5–100 chars), story (not null, 50–5000 chars), goalAmount (integer cents, not null, min 5000 / max 100000000), raisedAmount (integer cents, not null, default 0), donationCount (integer, not null, default 0), category (enum: Medical, Emergency, Education, Community, Animals, Environment, Memorial, Other), imageUrl (nullable), organizerId (FK → User.id, not null), communityId (FK → Community.id, nullable), createdAt, updatedAt.

**Donation**: id (UUID, PK), amount (integer cents, not null, min 100 / max 1000000), message (nullable, max 500 chars), donorId (FK → User.id, not null), fundraiserId (FK → Fundraiser.id, not null), createdAt.

**Community**: id (UUID, PK), name (not null), slug (unique, not null), description (not null), imageUrl (nullable), createdAt, updatedAt. Aggregate stats (totalRaised, totalDonations, fundraiserCount) are computed from related Fundraisers, not stored as denormalized columns.

**UserFollow**: id (PK), followerId (FK → User.id), followingId (FK → User.id), unique constraint on (followerId, followingId). No self-follows.

**CommunityFollow**: id (PK), userId (FK → User.id), communityId (FK → Community.id), unique constraint on (userId, communityId).

**MetricEvent**: id (PK), eventType (enum: page_load, ai_invocation, donation, navigation, auth), payload (JSON — contains event-specific data per Requirement 16), timestamp (not null, default now).

Relationships: A User has many Fundraisers (as organizer). A User has many Donations (as donor). A Fundraiser has many Donations. A Fundraiser optionally belongs to one Community. A Community has many Fundraisers. Users follow Users (many-to-many via UserFollow). Users follow Communities (many-to-many via CommunityFollow).

## API / Interface Contracts

**Auth**
- `POST /api/auth/register` — body: `{ email, password, displayName }` → `{ user: { id, email, displayName } }` or `{ error: string }`
- `POST /api/auth/[...nextauth]` — handled by NextAuth.js (login, logout, session)
- `GET /api/auth/session` — returns current session or null

**Fundraisers**
- `GET /api/fundraisers/[id]` — returns fundraiser with organizer info, donation list (paginated, 20 per page), and AI impact story
- `POST /api/fundraisers` — (auth required) body: `{ title, story, goalAmount, category, imageUrl?, communityId? }` → created fundraiser
- `POST /api/fundraisers/[id]/donate` — (auth required) body: `{ amount, message? }` → created donation

**Communities**
- `GET /api/communities/[slug]` — returns community with aggregate stats, leaderboard (top 10), follower count, and AI community narrative
- `POST /api/communities/[slug]/follow` — (auth required) toggles follow status → `{ following: boolean }`

**Profiles**
- `GET /api/profiles/[username]` — returns user profile, activity feed (paginated, 20 per page), highlights, follower/following counts
- `GET /api/profiles/[username]/insights` — (auth required, own profile only) returns AI giving insights
- `POST /api/profiles/[username]/follow` — (auth required) toggles follow status → `{ following: boolean }`

**Metrics**
- `GET /api/metrics` — (auth required) returns aggregated metric counts and averages, grouped by event type, for the metrics dashboard

**Common patterns**: All endpoints return `{ error: string }` with appropriate HTTP status codes on failure. All list endpoints return `{ data: T[], total: number, page: number, pageSize: number }`. Amounts in API responses are integer cents; the frontend converts to display format.

## Quality Requirements

- **Test coverage target**: ≥80% line coverage for core logic (auth service, AI service layer, donation logic, API route handlers). ≥60% overall project coverage. Zero untested API endpoints.
- **Performance**: Largest Contentful Paint <2.5s on simulated mobile 4G (Lighthouse). Time to First Byte <800ms for all page routes. AI-generated sections do not block page LCP — they load progressively after the page shell.
- **Security**: Passwords hashed with bcrypt (cost factor ≥10). No secrets in client bundles or git history. `.env.example` committed with placeholder values. All mutation endpoints require valid session. Input validation on all API endpoints (reject malformed requests with 400 status before processing). XSS prevention via React's default escaping — no `dangerouslySetInnerHTML` on user-supplied content. AI-generated content is rendered as text, not as raw HTML.
- **Accessibility**: WCAG 2.1 AA compliance. Semantic HTML (proper heading hierarchy, landmark regions, form labels). Minimum color contrast ratio 4.5:1 for normal text. All interactive elements keyboard-accessible. Focus management on route transitions. ARIA labels on icon-only buttons.

## Known Constraints

- **Development is agentic** (Claude Code with TDD workflow). All requirements must be testable. The agent operates via the CLAUDE.md bootstrap protocol. Requirements are written for automated verification — the agent cannot evaluate subjective criteria.
- **AI API dependency.** The application depends on an external LLM API for three core features. The AI service layer must handle: provider unavailability (graceful degradation — hide AI sections), rate limiting (respect provider limits, cache aggressively), latency (10-second timeout per call), and cost (cache responses for 15 minutes to minimize API calls). All AI features must be functional but the application must remain fully usable if the AI provider is down.
- **Supabase free tier limits.** The database is hosted on Supabase's free tier, which has connection limits (max ~20 concurrent connections) and storage limits. Prisma connection pooling must be configured. The seed dataset is intentionally small (~50 total records across all tables) to stay within limits.
- **Public deployment with mock financial UI.** The app is publicly accessible and displays donation/payment UI. The mock payment safeguard (prominent "no real money" banner) is a hard safety requirement, not a nice-to-have. It must be visually unambiguous and visible without scrolling on both desktop and mobile.
- **GoFundMe UX fidelity with original visual identity.** The three-page structure, information hierarchy, and interaction patterns must follow GoFundMe's conventions. The visual design must be clearly distinct from GoFundMe's brand. This is a dual constraint: the agent must study the reference pages for structure but actively diverge on visual presentation.
- **Seasonal context.** GoFundMe freezes product development October–January for peak giving season. This project, as a demonstration, has no such constraint but should be aware that production GoFundMe PRDs would need to account for this.

## Reference

- **GoFundMe Fundraiser Page (SM-2):** https://www.gofundme.com/f/realtime-alerts-for-wildfire-safety-r5jkk — progress bar, donation list, organizer info, story, share/donate CTAs
- **GoFundMe Community Page (SM-3):** https://www.gofundme.com/communities/watch-duty — header image, follower count, aggregate stats, leaderboard, follow CTA
- **GoFundMe Profile Page (SM-4):** https://www.gofundme.com/u/janahan — user identity, follower/following counts, activity feed, highlights, top causes
- **GoFundMe Smart Fundraising Coach (March 2026):** https://www.businesswire.com/news/home/20260312265664/en/ — AI-powered assistant for campaign creation, 80M+ AI tool uses
- **GoFundMe AI Strategy (CPTO interview):** https://news.darden.virginia.edu/2026/03/02/from-entrepreneur-to-crowdfunding-executive-how-arnie-katz-built-a-career-helping-people-help-each-other/ — agentic AI direction, "coder to orchestrator" philosophy
- **GoFundMe Pro Intelligent Ask Amounts:** https://pro.gofundme.com/c/platform/fundraising-intelligence/ — AI-powered donation optimization for nonprofits (demand-side AI precedent in Pro product)
- **Company Profile:** See `company-gofundme.md` in project knowledge base for full tech stack, engineering standards, and strategic context
- **Golden Requirements:** See `GOLDEN.md` in project knowledge base for non-negotiable constraints that override all other decisions
