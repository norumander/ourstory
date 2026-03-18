# GOLDEN.md — Non-Negotiable Requirements

> These are hard constraints extracted from the original project source materials.
> The agent must verify compliance before every commit, every architecture decision,
> and every task completion. Violating any of these is a stop-the-line event —
> revert and escalate to the user.

## Project Identity

An AI-enhanced, publicly deployed crowdfunding web application comprising three interconnected pages — Profile, Fundraiser, and Community — faithful to GoFundMe's UX patterns with original visual design, demonstrating meaningful AI integration that augments the human experience without feeling machine-generated.

## Source Materials

| ID | Document | Description |
|----|----------|-------------|
| SM-1 | Assignment Brief | Challenge prompt specifying three GoFundMe-inspired pages, AI mandate, functional requirements, and language flexibility |
| SM-2 | GoFundMe Fundraiser Page (reference) | https://www.gofundme.com/f/realtime-alerts-for-wildfire-safety-r5jkk — progress bar, donation list, organizer info, story, share/donate CTAs |
| SM-3 | GoFundMe Community Page (reference) | https://www.gofundme.com/communities/watch-duty — header image, follower count, aggregate stats, leaderboard, follow CTA |
| SM-4 | GoFundMe Profile Page (reference) | https://www.gofundme.com/u/janahan — user identity, follower/following counts, activity feed, highlights, top causes |
| SM-5 | User Decisions | Scoping decisions made during requirements hardening (auth scope, deployment target, AI philosophy, performance strategy, etc.) |

## Hard Constraints

### Data & Security

- **GR-SEC-1: No plaintext passwords.** All user passwords must be hashed using a modern algorithm (bcrypt, scrypt, or argon2) before storage. No plaintext passwords in the database, logs, or any persistent store — ever.
  - *Source: SM-5 (user decision — real auth with email/password implies industry-standard credential handling)*

- **GR-SEC-2: No secrets in client-side code or version control.** API keys (especially AI service keys), database credentials, and auth secrets must be managed via environment variables or a secrets manager. No secrets committed to the repository. No secrets embedded in client-side JavaScript bundles.
  - *Source: SM-5 (user decision — elevated to golden given public deployment and AI API key exposure risk)*

- **GR-SEC-3: Mock payments must be visually unambiguous.** Any donation/payment UI must make it unmistakably clear that no real money is being transacted. No connection to real payment processors. No forms that collect real payment card details.
  - *Source: SM-5 (user decision — public deployment with payment-adjacent UX demands explicit safeguarding)*

### Architecture

- **GR-ARCH-1: Three distinct pages must exist — Profile, Fundraiser, and Community.** Each page must be a discrete, navigable route, not collapsed into a single-page layout or tabbed interface. The page structure must mirror the GoFundMe reference examples (SM-2, SM-3, SM-4).
  - *Source: SM-1 ("This is an example of a Profile... Fundraiser... Community page... build your own version")*

- **GR-ARCH-2: Pages must be interconnected with seamless navigation.** A user must be able to navigate between all three page types through in-context links (e.g., clicking an organizer name on a Fundraiser page navigates to their Profile; a Profile links to their Fundraisers; a Community page links to member Fundraisers). No dead-end pages.
  - *Source: SM-1 ("Tie them together to make an engaging experience"), SM-1 Functional Requirements ("seamlessly integrated and intuitive")*

- **GR-ARCH-3: Progressive loading strategy required.** Pages must implement partial/progressive rendering (skeleton screens, lazy loading, streaming, or equivalent) so users see meaningful content before all data resolves. No full-page loading spinners blocking the entire viewport.
  - *Source: SM-1 Functional Requirements ("fast response times"), SM-5 (user decision — no hard latency number, but progressive loading is the architectural commitment)*

### Performance

- **GR-PERF-1: Application must be deployed to a publicly accessible URL over HTTPS.** The final deliverable is not a localhost demo. It must be deployed (Vercel, Netlify, or equivalent) and reachable via a public HTTPS URL.
  - *Source: SM-5 (user decision — deployed to public URL)*

### Quality

- **GR-QUAL-1: Core logic must have automated tests.** Authentication flows, page navigation/routing, and AI feature logic must be covered by tests (unit, integration, or end-to-end). The agent must not ship these subsystems untested.
  - *Source: SM-5 (user decision — golden requirement on core logic test coverage)*

- **GR-QUAL-2: Instrumentation must exist and be documented.** The application must capture metrics (performance, user engagement, AI feature usage, or equivalent) AND the repository must include documentation explaining what metrics are captured, how they are captured, and why each metric was chosen. The documentation and the implementation must both be present — one without the other fails this requirement.
  - *Source: SM-1 Functional Requirements ("well instrumented, explain what metrics you'll capture and why")*

### Scope Boundaries

- **GR-SCOPE-1: Faithful to GoFundMe's UX patterns.** Page structure, information hierarchy, and core interaction patterns (donate CTA, progress bar, leaderboard, activity feed, follower system) must follow GoFundMe's established conventions as shown in SM-2, SM-3, SM-4. Visual design (colors, typography, branding) must be original — not a GoFundMe skin. The app reimagines the look, not the structure.
  - *Source: SM-5 (user decision — "Faithful to GoFundMe's UX patterns — same page structure, our own visual design")*

- **GR-SCOPE-2: Mobile-responsive design required.** All three pages must render correctly and be fully functional on mobile viewports (360px–428px width). This is not optional — GoFundMe's audience is heavily mobile, and the reference pages are responsive.
  - *Source: SM-5 (user decision — elevated to golden), implied by SM-2/SM-3/SM-4 (all reference pages are mobile-responsive)*

### Acceptance Criteria

- **GR-AC-1: AI integration must deliver genuine utility without feeling machine-generated.** AI features must provide real user value (insights, suggestions, smart tooling, content assistance) rather than serving as a novelty. AI-generated or AI-assisted content must not feel obviously robotic, templated, or boilerplate. The AI enhances the human experience — it doesn't replace or cheapen it.
  - *Source: SM-1 ("Think outside of the box and use AI"), SM-5 (user decision — "meaningful AI experience without taking away from the human element... things don't FEEL AI generated")*

- **GR-AC-2: Real authentication with email/password.** The application must support user registration and login via email and password at minimum. This is working auth — not a mock login screen. Optional social login (Google/GitHub OAuth) may supplement but not replace email/password.
  - *Source: SM-5 (user decision — "Email/password + optional social login")*

---

## Compliance Checklist (for agent self-verification)

Before every commit, architecture decision, or task completion, verify:

| # | Requirement | Check |
|---|-------------|-------|
| GR-SEC-1 | Passwords hashed? | No plaintext in DB, logs, or stores |
| GR-SEC-2 | Secrets secured? | No keys in client JS or git history |
| GR-SEC-3 | Mock payments obvious? | No real payment flow possible |
| GR-ARCH-1 | Three pages exist? | Profile, Fundraiser, Community as distinct routes |
| GR-ARCH-2 | Pages interconnected? | Cross-links between all page types, no dead ends |
| GR-ARCH-3 | Progressive loading? | No full-page spinners, partial content renders first |
| GR-PERF-1 | Deployed publicly? | Live HTTPS URL, not localhost |
| GR-QUAL-1 | Core logic tested? | Auth, navigation, AI features have automated tests |
| GR-QUAL-2 | Instrumentation documented? | Metrics captured AND rationale documented |
| GR-SCOPE-1 | GoFundMe UX patterns? | Structure faithful, visual design original |
| GR-SCOPE-2 | Mobile-responsive? | Functional at 360px–428px width |
| GR-AC-1 | AI feels natural? | Useful AI that doesn't feel machine-generated |
| GR-AC-2 | Real auth works? | Email/password registration and login functional |
