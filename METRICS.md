# METRICS.md — Instrumentation Documentation

## Overview

ourstory captures five categories of structured metrics via server-side logging to a PostgreSQL-backed `MetricEvent` table. Each event is stored as a JSON payload with an event type and timestamp. The metrics dashboard is accessible at `/admin/metrics` (authentication required).

## Metrics Captured

### 1. Page Load Events (`page_load`)

| Field | Type | Description |
|---|---|---|
| `pageType` | string | Page type: `fundraiser`, `community`, `profile`, `landing`, `admin` |
| `durationMs` | number | Server-side render duration in milliseconds |
| `timestamp` | ISO string | When the page load occurred |

**How captured**: Server Components log page load events during SSR. Duration measured from request start to render completion.

**Why chosen**: Answers "Which pages are most visited?" and "Are any pages slow to render?" Identifies performance bottlenecks and usage patterns across the three core page types.

### 2. AI Feature Invocations (`ai_invocation`)

| Field | Type | Description |
|---|---|---|
| `featureType` | string | AI feature: `impact_story`, `community_narrative`, `giving_insights` |
| `latencyMs` | number | Time to receive AI response in milliseconds |
| `success` | boolean | Whether the AI call succeeded |
| `timestamp` | ISO string | When the invocation occurred |

**How captured**: The AI service layer wraps each `generateCompletion` call with timing and success/failure tracking. Logged after each AI call completes (or times out).

**Why chosen**: Answers "How reliable is the AI service?" and "How fast are AI responses?" Critical for monitoring the 10-second timeout threshold, cache hit rates (no AI invocation logged on cache hit), and provider health.

### 3. Donation Events (`donation`)

| Field | Type | Description |
|---|---|---|
| `fundraiserId` | string | UUID of the fundraiser receiving the donation |
| `amount` | number | Donation amount in cents |
| `timestamp` | ISO string | When the donation was made |

**How captured**: Logged in the `POST /api/fundraisers/[id]/donate` route handler after successful donation creation.

**Why chosen**: Answers "How many donations are happening?" and "What's the average donation size?" Tracks engagement with the core crowdfunding action. Amount distribution reveals whether users donate small or large amounts.

### 4. Navigation Events (`navigation`)

| Field | Type | Description |
|---|---|---|
| `sourcePageType` | string | Page type the user navigated from |
| `destPageType` | string | Page type the user navigated to |
| `timestamp` | ISO string | When the navigation occurred |

**How captured**: Client-side navigation tracking logs source and destination page types on route transitions.

**Why chosen**: Answers "How do users move between the three page types?" Validates the interconnected navigation requirement (GR-ARCH-2) with real data. Reveals which cross-page links are most used and whether any pages are dead ends.

### 5. Auth Events (`auth`)

| Field | Type | Description |
|---|---|---|
| `action` | string | One of: `registration`, `login_success`, `login_failure`, `logout` |
| `timestamp` | ISO string | When the auth event occurred |

**How captured**: Logged in auth route handlers — registration endpoint, NextAuth.js callbacks (sign-in success/failure), and sign-out callback.

**Why chosen**: Answers "How many users are registering?" and "What's the login failure rate?" A high failure rate may indicate UX issues with the login form. Registration vs. active login ratio reveals retention patterns.

## Accessing the Dashboard

1. Log in to the application with any authenticated account
2. Navigate to `/admin/metrics`
3. The dashboard displays:
   - Summary cards with total counts per event type
   - Recent events list with payload details and timestamps

## Implementation Details

- **Storage**: `MetricEvent` model in PostgreSQL (via Prisma ORM)
- **Schema**: `id` (auto-increment), `eventType` (enum), `payload` (JSON), `timestamp` (datetime)
- **Indexes**: On `eventType` and `timestamp` for efficient dashboard queries
- **API**: `GET /api/metrics` returns aggregated counts and recent events (auth required)
- **Logging function**: `logEvent(type, payload)` in `src/lib/metrics.ts` — fire-and-forget, errors logged but not propagated
