import { generateCompletion } from "./service";
import { cache, hashKey } from "../cache";

interface DonationRecord {
  amount: number;
  category: string;
  fundraiserTitle: string;
  createdAt: Date | string;
}

export interface InsightsResult {
  summary: string;
  observations: string[];
}

/**
 * Generate personalized giving insights for a user's profile.
 * Returns a summary and up to 3 observations.
 * Returns null if AI is unavailable or user has fewer than 2 donations.
 */
export async function generateGivingInsights(
  donations: DonationRecord[]
): Promise<InsightsResult | null> {
  if (donations.length < 2) {
    return null;
  }

  const cacheKey = hashKey({
    type: "giving-insights",
    donations: donations.map((d) => ({
      amount: d.amount,
      category: d.category,
      date: new Date(d.createdAt).toISOString().slice(0, 10),
    })),
  });
  const cached = cache.get<InsightsResult>(cacheKey);
  if (cached) return cached;

  const totalCents = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalDollars = (totalCents / 100).toLocaleString();
  const avgDollars = Math.round(totalCents / donations.length / 100);
  const categories = [...new Set(donations.map((d) => d.category))];
  const recentDonations = donations
    .slice(0, 10)
    .map(
      (d) =>
        `$${(d.amount / 100).toFixed(0)} to "${d.fundraiserTitle}" (${d.category}, ${new Date(d.createdAt).toLocaleDateString()})`
    )
    .join("\n");

  const prompt = `You are a personal giving advisor for a crowdfunding platform. Analyze this donor's giving history and provide personalized insights.

Total donated: $${totalDollars} across ${donations.length} donations
Average donation: $${avgDollars}
Categories supported: ${categories.join(", ")}

Recent donations:
${recentDonations}

Respond in this exact JSON format:
{
  "summary": "A 2-3 sentence overview of their giving patterns — warm, personal, not robotic",
  "observations": ["Specific observation 1", "Specific observation 2", "Specific observation 3"]
}

Guidelines:
- The summary should feel like a friend noticing your patterns, not a financial report
- Each observation should be specific and grounded in the actual data
- Reference actual causes, amounts, or timing patterns you see
- Maximum 3 observations, can be fewer if the data doesn't support more
- Don't use generic phrases like "You're a generous person" — be specific
- Don't repeat information that's already visible on the profile page`;

  const result = await generateCompletion(prompt, {
    maxTokens: 400,
    temperature: 0.7,
  });

  if (!result) return null;

  try {
    // Extract JSON from the response (handle markdown code blocks)
    const jsonStr = result.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonStr) as InsightsResult;

    if (!parsed.summary || !Array.isArray(parsed.observations)) {
      return null;
    }

    // Limit to 3 observations
    parsed.observations = parsed.observations.slice(0, 3);

    cache.set(cacheKey, parsed);
    return parsed;
  } catch {
    console.error("[AI Giving Insights] Failed to parse AI response");
    return null;
  }
}
