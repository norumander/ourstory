import { generateCompletion } from "./service";

interface FundraiserData {
  goalAmount: number;
  raisedAmount: number;
  donationCount: number;
  category: string;
  story: string;
}

/**
 * Generate an AI Impact Story for a fundraiser page.
 * Returns 2-4 sentences contextualizing donations into real-world impact.
 * Returns null if AI is unavailable — caller should hide the section gracefully.
 *
 * Results are persisted to the database by the ImpactStory component.
 * This function is only called when no cached story exists.
 */
export async function generateImpactStory(
  data: FundraiserData
): Promise<string | null> {
  const goalDollars = (data.goalAmount / 100).toLocaleString();
  const raisedDollars = (data.raisedAmount / 100).toLocaleString();
  const percentage = Math.round((data.raisedAmount / data.goalAmount) * 100);

  const prompt = `You are a compassionate storyteller for a crowdfunding platform. Write a brief impact snapshot (2-4 sentences) that contextualizes what the money raised so far means in real, tangible terms.

Fundraiser category: ${data.category}
Goal: $${goalDollars}
Raised so far: $${raisedDollars} (${percentage}% of goal)
Number of donors: ${data.donationCount}
Organizer's story excerpt: "${data.story.slice(0, 300)}"

Guidelines:
- Translate the dollar amount into concrete, relatable outcomes specific to this category
- Be warm and human, not robotic or formulaic
- Don't repeat the exact dollar figures — interpret what they mean
- Don't use phrases like "This fundraiser has raised" or "With X donors" — those are visible elsewhere on the page
- Write as if you're explaining the impact to a friend, not generating a report
- Vary your sentence structure and word choice — avoid templates`;

  return generateCompletion(prompt, {
    maxTokens: 200,
    temperature: 0.8,
  });
}
