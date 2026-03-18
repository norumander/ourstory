import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateImpactStory } from "@/lib/ai/impact-story";
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

  it("calls AI service each time (caching is handled at DB level)", async () => {
    vi.mocked(service.generateCompletion).mockResolvedValue("Story text");

    await generateImpactStory(mockData);
    await generateImpactStory(mockData);

    expect(service.generateCompletion).toHaveBeenCalledTimes(2);
  });

  it("returns null when AI service fails", async () => {
    vi.mocked(service.generateCompletion).mockResolvedValue(null);

    const result = await generateImpactStory(mockData);
    expect(result).toBeNull();
  });

  it("returns null without caching on failure", async () => {
    vi.mocked(service.generateCompletion).mockResolvedValue(null);

    const result = await generateImpactStory(mockData);
    expect(result).toBeNull();
  });
});
