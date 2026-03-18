import { generateCompletion } from "./service";
import { cache, hashKey } from "../cache";

interface CommunityData {
  name: string;
  description: string;
  totalRaised: number;
  totalDonations: number;
  fundraiserCount: number;
  topCategories: string[];
}

/**
 * Generate an AI Community Narrative.
 * Returns 3-5 sentences synthesizing collective giving into a story.
 * Returns null if AI is unavailable.
 */
export async function generateCommunityNarrative(
  data: CommunityData
): Promise<string | null> {
  const cacheKey = hashKey({ type: "community-narrative", ...data });
  const cached = cache.get<string>(cacheKey);
  if (cached) return cached;

  const totalDollars = (data.totalRaised / 100).toLocaleString();

  const prompt = `You are a community storyteller for a crowdfunding platform. Write a brief community narrative (3-5 sentences) that weaves the community's collective giving activity into a compelling, human story.

Community: ${data.name}
About: ${data.description.slice(0, 200)}
Total raised across all fundraisers: $${totalDollars}
Total individual donations: ${data.totalDonations}
Number of active fundraisers: ${data.fundraiserCount}
Most common cause areas: ${data.topCategories.join(", ") || "various"}

Guidelines:
- Tell the story of this community's generosity — not a stat dump
- Highlight patterns, momentum, or collective achievement
- Be warm, specific, and genuine — not corporate or generic
- Don't just restate the numbers — interpret what they reveal about the community
- Vary your phrasing — avoid starting with "This community" or "The members"
- Write as a narrator, not a data analyst`;

  const result = await generateCompletion(prompt, {
    maxTokens: 300,
    temperature: 0.8,
  });

  if (result) {
    cache.set(cacheKey, result);
  }

  return result;
}
