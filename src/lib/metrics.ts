import { prisma } from "./prisma";
import { EventType, Prisma } from "@prisma/client";

/**
 * Log a structured metric event to the database.
 * Fire-and-forget — errors are logged but not propagated.
 */
export async function logEvent(
  eventType: EventType,
  payload: Prisma.InputJsonValue
): Promise<void> {
  try {
    await prisma.metricEvent.create({
      data: {
        eventType,
        payload,
      },
    });
  } catch (error) {
    console.error("[Metrics] Failed to log event:", {
      eventType,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Log a page load event. */
export function logPageLoad(pageType: string, durationMs?: number) {
  return logEvent("page_load" as EventType, {
    pageType,
    durationMs,
    timestamp: new Date().toISOString(),
  });
}

/** Log an AI feature invocation. */
export function logAiInvocation(
  featureType: string,
  latencyMs: number,
  success: boolean
) {
  return logEvent("ai_invocation" as EventType, {
    featureType,
    latencyMs,
    success,
    timestamp: new Date().toISOString(),
  });
}

/** Log a mock donation event. */
export function logDonation(fundraiserId: string, amount: number) {
  return logEvent("donation" as EventType, {
    fundraiserId,
    amount,
    timestamp: new Date().toISOString(),
  });
}

/** Log a navigation event. */
export function logNavigation(sourcePageType: string, destPageType: string) {
  return logEvent("navigation" as EventType, {
    sourcePageType,
    destPageType,
    timestamp: new Date().toISOString(),
  });
}

/** Log an auth event. */
export function logAuthEvent(
  action: "registration" | "login_success" | "login_failure" | "logout"
) {
  return logEvent("auth" as EventType, {
    action,
    timestamp: new Date().toISOString(),
  });
}
