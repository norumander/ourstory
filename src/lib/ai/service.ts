const AI_TIMEOUT_MS = 10_000;

interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
}

/**
 * Provider-agnostic AI service abstraction.
 * Supports OpenAI-compatible APIs (default) and Anthropic.
 * Selected via AI_PROVIDER env var.
 *
 * Returns null on any failure — callers should handle graceful degradation.
 */
export async function generateCompletion(
  prompt: string,
  options: CompletionOptions = {}
): Promise<string | null> {
  const provider = process.env.AI_PROVIDER || "openai";

  try {
    if (provider === "anthropic") {
      return await callAnthropic(prompt, options);
    }
    return await callOpenAI(prompt, options);
  } catch (error) {
    console.error("[AI Service] Completion failed:", {
      provider,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

async function callOpenAI(
  prompt: string,
  options: CompletionOptions
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[AI Service] OPENAI_API_KEY not configured");
    return null;
  }

  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature ?? 0.7,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("[AI Service] OpenAI API error:", response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } finally {
    clearTimeout(timeout);
  }
}

async function callAnthropic(
  prompt: string,
  options: CompletionOptions
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("[AI Service] ANTHROPIC_API_KEY not configured");
    return null;
  }

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: options.maxTokens || 500,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("[AI Service] Anthropic API error:", response.status);
      return null;
    }

    const data = await response.json();
    const textBlock = data.content?.find(
      (block: { type: string }) => block.type === "text"
    );
    return textBlock?.text?.trim() || null;
  } finally {
    clearTimeout(timeout);
  }
}
