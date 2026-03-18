import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateImpactStory } from "@/lib/ai/impact-story";
import { cache } from "@/lib/cache";
import * as service from "@/lib/ai/service";

vi.mock("@/lib/ai/service", () => ({
  generateCompletion: vi.fn(),
}));

describe("generateImpactStory", () => {
  const mockData = {
    goalAmount: 5000000,
    raisedAmount: 4250000,
    donationCount: 45,
    category: "Emergency",
    story: "Wildfire recovery fund for affected families.",
  };

  beforeEach(() => {
    cache.clear();
    vi.restoreAllMocks();
  });

  it("calls generateCompletion with a prompt containing fundraiser data", async () => {
    vi.mocked(service.generateCompletion).mockResolvedValue("Impact story text");

    await generateImpactStory(mockData);

    expect(service.generateCompletion).toHaveBeenCalledOnce();
    const prompt = vi.mocked(service.generateCompletion).mock.calls[0][0];
    expect(prompt).toContain("Emergency");
    expect(prompt).toContain("85%");
    expect(prompt).toContain("45");
  });

  it("returns the generated text", async () => {
    vi.mocked(service.generateCompletion).mockResolvedValue(
      "Every dollar brings hope to displaced families."
    );

    const result = await generateImpactStory(mockData);
    expect(result).toBe("Every dollar brings hope to displaced families.");
  });

  it("caches the result and returns cached value on second call", async () => {
    vi.mocked(service.generateCompletion).mockResolvedValue("Cached story");

    await generateImpactStory(mockData);
    const result2 = await generateImpactStory(mockData);

    expect(service.generateCompletion).toHaveBeenCalledOnce();
    expect(result2).toBe("Cached story");
  });

  it("returns null when AI service fails", async () => {
    vi.mocked(service.generateCompletion).mockResolvedValue(null);

    const result = await generateImpactStory(mockData);
    expect(result).toBeNull();
  });

  it("does not cache null results", async () => {
    vi.mocked(service.generateCompletion).mockResolvedValue(null);

    await generateImpactStory(mockData);
    expect(cache.size()).toBe(0);
  });
});
