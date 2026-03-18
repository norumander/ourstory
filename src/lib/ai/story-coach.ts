import { generateCompletion } from "./service";

/**
 * AI Story Coach — generates a polished fundraiser story draft
 * from a title and rough notes.
 * Returns null if AI is unavailable.
 */
export async function generateStoryDraft(
  title: string,
  notes: string
): Promise<string | null> {
  if (!title || !notes || notes.length < 20) {
    return null;
  }

  const prompt = `You are a writing coach for a crowdfunding platform called ourstory. A fundraiser organizer needs help turning their rough notes into a compelling fundraiser story.

Title: "${title}"
Their rough notes: "${notes}"

Write a polished fundraiser story (150-400 words) based on their notes. The story should:
- Open with an emotional hook that draws readers in
- Explain the situation clearly and specifically
- Describe what the funds will be used for
- End with a call to action that feels personal, not generic
- Sound like a real person wrote it, not a marketing team
- Preserve the organizer's voice and key details from their notes
- Be written in first or third person depending on what fits the notes

Do NOT include the title in the story. Do NOT add headers or formatting — just flowing paragraphs. Do NOT use phrases like "any amount helps" or "every dollar counts" — be more specific and original.`;

  return generateCompletion(prompt, {
    maxTokens: 600,
    temperature: 0.8,
  });
}
