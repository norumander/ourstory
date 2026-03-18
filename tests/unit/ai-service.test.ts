import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateCompletion } from "@/lib/ai/service";

describe("generateCompletion", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns null when OPENAI_API_KEY is not set", async () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_PROVIDER;
    const result = await generateCompletion("test prompt");
    expect(result).toBeNull();
  });

  it("returns null when ANTHROPIC_API_KEY is not set and provider is anthropic", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    process.env.AI_PROVIDER = "anthropic";
    const result = await generateCompletion("test prompt");
    expect(result).toBeNull();
  });

  it("returns null on fetch failure", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    const result = await generateCompletion("test prompt");
    expect(result).toBeNull();
  });

  it("returns null on non-OK response", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Rate limited", { status: 429 })
    );

    const result = await generateCompletion("test prompt");
    expect(result).toBeNull();
  });

  it("returns completion text on success (OpenAI)", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Generated response" } }],
        }),
        { status: 200 }
      )
    );

    const result = await generateCompletion("test prompt");
    expect(result).toBe("Generated response");
  });

  it("returns completion text on success (Anthropic)", async () => {
    process.env.AI_PROVIDER = "anthropic";
    process.env.ANTHROPIC_API_KEY = "test-key";
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          content: [{ type: "text", text: "Anthropic response" }],
        }),
        { status: 200 }
      )
    );

    const result = await generateCompletion("test prompt");
    expect(result).toBe("Anthropic response");
  });

  it("defaults to openai provider when AI_PROVIDER is not set", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    delete process.env.AI_PROVIDER;

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "OpenAI response" } }],
        }),
        { status: 200 }
      )
    );

    await generateCompletion("test prompt");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("openai.com"),
      expect.any(Object)
    );
  });
});
