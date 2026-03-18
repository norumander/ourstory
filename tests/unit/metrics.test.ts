import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before importing metrics
vi.mock("@/lib/prisma", () => ({
  prisma: {
    metricEvent: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
  },
}));

import { logEvent } from "@/lib/metrics";
import { prisma } from "@/lib/prisma";

describe("logEvent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a MetricEvent record with correct data", async () => {
    await logEvent("page_load" as never, { pageType: "fundraiser", durationMs: 150 });

    expect(prisma.metricEvent.create).toHaveBeenCalledWith({
      data: {
        eventType: "page_load",
        payload: { pageType: "fundraiser", durationMs: 150 },
      },
    });
  });

  it("does not throw on database error", async () => {
    vi.mocked(prisma.metricEvent.create).mockRejectedValueOnce(
      new Error("DB connection failed")
    );

    // Should not throw
    await expect(
      logEvent("auth" as never, { action: "login_success" })
    ).resolves.toBeUndefined();
  });

  it("accepts different event types", async () => {
    await logEvent("ai_invocation" as never, {
      featureType: "impact_story",
      latencyMs: 2500,
      success: true,
    });

    expect(prisma.metricEvent.create).toHaveBeenCalledWith({
      data: {
        eventType: "ai_invocation",
        payload: expect.objectContaining({
          featureType: "impact_story",
          latencyMs: 2500,
          success: true,
        }),
      },
    });
  });
});
