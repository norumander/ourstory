import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateGivingInsights } from "@/lib/ai/giving-insights";
import { cache } from "@/lib/cache";
import * as service from "@/lib/ai/service";

vi.mock("@/lib/ai/service", () => ({
  generateCompletion: vi.fn(),
}));

describe("generateGivingInsights", () => {
  const mockDonations = [
    { amount: 5000, category: "Education", fundraiserTitle: "STEM Scholarships", createdAt: new Date("2026-02-01") },
    { amount: 10000, category: "Emergency", fundraiserTitle: "Wildfire Relief", createdAt: new Date("2026-02-15") },
    { amount: 7500, category: "Education", fundraiserTitle: "Laptops for Students", createdAt: new Date("2026-03-01") },
  ];

  beforeEach(() => {
    cache.clear();
    vi.restoreAllMocks();
  });

  it("returns null when fewer than 2 donations", async () => {
    const result = await generateGivingInsights([mockDonations[0]]);
    expect(result).toBeNull();
    expect(service.generateCompletion).not.toHaveBeenCalled();
  });

  it("returns null when zero donations", async () => {
    const result = await generateGivingInsights([]);
    expect(result).toBeNull();
  });

  it("parses valid JSON response into InsightsResult", async () => {
    vi.mocked(service.generateCompletion).mockResolvedValue(
      JSON.stringify({
        summary: "You're drawn to education causes.",
        observations: [
          "Two of your three donations support education.",
          "Your average donation is $75.",
        ],
      })
    );

    const result = await generateGivingInsights(mockDonations);
    expect(result).toEqual({
      summary: "You're drawn to education causes.",
      observations: [
        "Two of your three donations support education.",
        "Your average donation is $75.",
      ],
    });
  });

  it("handles markdown-wrapped JSON response", async () => {
    vi.mocked(service.generateCompletion).mockResolvedValue(
      '```json\n{"summary": "Test summary", "observations": ["Obs 1"]}\n```'
    );

    const result = await generateGivingInsights(mockDonations);
    expect(result?.summary).toBe("Test summary");
  });

  it("limits observations to 3", async () => {
    vi.mocked(service.generateCompletion).mockResolvedValue(
      JSON.stringify({
        summary: "Summary",
        observations: ["1", "2", "3", "4", "5"],
      })
    );

    const result = await generateGivingInsights(mockDonations);
    expect(result?.observations).toHaveLength(3);
  });

  it("returns null on invalid JSON response", async () => {
    vi.mocked(service.generateCompletion).mockResolvedValue("Not valid JSON");

    const result = await generateGivingInsights(mockDonations);
    expect(result).toBeNull();
  });

  it("returns null when AI service fails", async () => {
    vi.mocked(service.generateCompletion).mockResolvedValue(null);

    const result = await generateGivingInsights(mockDonations);
    expect(result).toBeNull();
  });

  it("caches results and returns cached value on second call", async () => {
    vi.mocked(service.generateCompletion).mockResolvedValue(
      JSON.stringify({ summary: "Cached", observations: [] })
    );

    await generateGivingInsights(mockDonations);
    const result2 = await generateGivingInsights(mockDonations);

    expect(service.generateCompletion).toHaveBeenCalledOnce();
    expect(result2?.summary).toBe("Cached");
  });
});
