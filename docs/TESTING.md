# TESTING.md

## Test Commands

```bash
# Run all unit and integration tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run a specific test file
npx vitest run tests/unit/auth.test.ts

# Run E2E tests (requires dev server or build)
npm run test:e2e

# Run E2E tests headed (visible browser)
npx playwright test --headed

# Run a specific E2E test
npx playwright test tests/e2e/auth.spec.ts
```

## Strategy

### Unit Tests (Vitest)

**Scope**: Individual functions, service methods, utility functions, data transformations.

**Coverage targets**:
- Auth service (registration, login, password hashing): ≥90%
- AI service layer (provider abstraction, caching, error handling): ≥80%
- AI generators (prompt construction, response parsing): ≥80%
- Donation logic (validation, amount calculations): ≥90%
- Utility functions (currency formatting, username derivation): ≥90%
- Cache module (TTL behavior, key hashing): ≥80%
- Metrics logging (event creation, payload validation): ≥80%

**What to unit test**:
- All business logic and data transformations
- Input validation functions
- Error handling paths
- Edge cases (empty data, boundary values, null inputs)
- AI prompt construction (verify prompts include correct data)
- Cache hit/miss/expiry behavior

**What NOT to unit test**:
- Next.js framework behavior (routing, SSR)
- Prisma query syntax (trust the ORM)
- Tailwind class generation
- React component rendering (E2E covers this)

### Integration Tests (Vitest)

**Scope**: API route handlers with mocked database, auth flow with mocked bcrypt, AI service with mocked LLM API.

**Coverage targets**:
- All API endpoints: 100% (every route handler has at least one test)
- Auth flow (register → login → session): ≥80%
- Donation flow (validate → create → update fundraiser): ≥80%

**What to integration test**:
- API route handlers (request parsing, response format, status codes, error responses)
- Auth middleware (protected routes reject unauthenticated requests)
- Database queries through Prisma (with test database or mocked client)
- AI service graceful degradation (timeout, error, unavailable provider)

**Mocking rules**:
- Mock at boundaries: LLM API, database (Prisma client), bcrypt for speed
- Never mock the function under test
- Never mock Next.js internals

### E2E Tests (Playwright)

**Scope**: Full user flows through the browser, including navigation, auth, and responsive behavior.

**Test scenarios**:
1. **Auth flow**: Register → Login → Access protected route → Logout → Redirected
2. **Fundraiser flow**: Login → View fundraiser → Donate → See confirmation → See updated progress
3. **Community flow**: View community → See leaderboard → Follow → Navigate to fundraiser
4. **Profile flow**: View own profile → See activity feed → See AI insights section
5. **Navigation circuit**: Fundraiser → Profile (via organizer link) → Community (via followed community) → Fundraiser (via leaderboard)
6. **Mobile responsive**: All three pages render correctly at 375px viewport
7. **Mock payment banner**: Donation form displays "no real money" banner visibly
8. **Progressive loading**: Page shell renders before data sections

**Viewport testing**:
- Desktop: 1280x720
- Mobile: 375x667 (iPhone SE), 428x926 (iPhone 14 Pro Max)

## Coverage Targets

| Scope | Target | Rationale |
|---|---|---|
| Auth service | ≥90% | GR-AC-2, GR-SEC-1 — core security surface |
| AI service layer | ≥80% | GR-AC-1 — graceful degradation is critical |
| Donation logic | ≥90% | GR-SEC-3 — mock payment integrity |
| API route handlers | 100% endpoints | GR-QUAL-1 — zero untested endpoints |
| Overall project | ≥60% | PRD quality requirement |

## Conventions

### File Structure

```
tests/
├── unit/
│   ├── auth.test.ts              # Auth service tests
│   ├── ai-service.test.ts        # AI provider abstraction tests
│   ├── ai-impact-story.test.ts   # Impact Story generator tests
│   ├── ai-community-narrative.test.ts
│   ├── ai-giving-insights.test.ts
│   ├── cache.test.ts             # Cache module tests
│   ├── metrics.test.ts           # Metrics logging tests
│   ├── utils.test.ts             # Utility function tests
│   └── validation.test.ts        # Input validation tests
├── integration/
│   ├── api-auth.test.ts          # Auth API route tests
│   ├── api-fundraisers.test.ts   # Fundraiser API route tests
│   ├── api-communities.test.ts   # Community API route tests
│   ├── api-profiles.test.ts      # Profile API route tests
│   ├── api-metrics.test.ts       # Metrics API route tests
│   └── api-donations.test.ts     # Donation API route tests
└── e2e/
    ├── auth.spec.ts              # Auth flow E2E
    ├── fundraiser.spec.ts        # Fundraiser page + donation E2E
    ├── community.spec.ts         # Community page E2E
    ├── profile.spec.ts           # Profile page E2E
    ├── navigation.spec.ts        # Cross-page navigation E2E
    ├── mobile.spec.ts            # Mobile responsive E2E
    └── fixtures/
        └── test-data.ts          # Shared test data
```

### Naming

Tests describe behavior, not implementation:

```typescript
// Good
describe('registerUser', () => {
  it('hashes password with bcrypt before storing', () => {})
  it('rejects duplicate email with specific error', () => {})
  it('derives username from email prefix', () => {})
  it('appends numeric suffix when username exists', () => {})
})

// Bad
describe('registerUser', () => {
  it('works correctly', () => {})
  it('test register', () => {})
})
```

### Fixtures and Test Data

- Shared test data lives in `tests/e2e/fixtures/test-data.ts` (E2E) or co-located with test files (unit).
- Use factory functions, not raw objects, for test data creation.
- The demo user (`demo@ourstory.app` / `demodemo123`) is available in seeded test databases.
- AI responses are mocked with realistic (not lorem ipsum) text to verify rendering.

### Golden Requirement Verification Tests

Each golden requirement has at least one dedicated test:

| Requirement | Test Location | What It Verifies |
|---|---|---|
| GR-SEC-1 | `tests/unit/auth.test.ts` | Password is bcrypt-hashed, not stored plaintext |
| GR-SEC-2 | `tests/integration/api-auth.test.ts` | No secrets in response bodies or error messages |
| GR-SEC-3 | `tests/e2e/fundraiser.spec.ts` | Mock payment banner is visible without scrolling |
| GR-ARCH-1 | `tests/e2e/navigation.spec.ts` | All three page routes exist and render |
| GR-ARCH-2 | `tests/e2e/navigation.spec.ts` | Navigation circuit completes without dead ends |
| GR-ARCH-3 | `tests/e2e/fundraiser.spec.ts` | Page shell renders before data sections |
| GR-QUAL-1 | Coverage report | ≥80% on core logic, 100% endpoint coverage |
| GR-QUAL-2 | Manual verification | METRICS.md exists and matches implementation |
| GR-SCOPE-2 | `tests/e2e/mobile.spec.ts` | Pages functional at 375px viewport |
| GR-AC-2 | `tests/e2e/auth.spec.ts` | Register + login + protected route flow works |
