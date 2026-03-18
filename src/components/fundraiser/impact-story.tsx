import { prisma } from "@/lib/prisma";
import { generateImpactStory } from "@/lib/ai/impact-story";

interface ImpactStoryProps {
  fundraiserId: string;
  goalAmount: number;
  raisedAmount: number;
  donationCount: number;
  category: string;
  story: string;
  cachedStory: string | null;
}

export async function ImpactStory({
  fundraiserId,
  goalAmount,
  raisedAmount,
  donationCount,
  category,
  story,
  cachedStory,
}: ImpactStoryProps) {
  let impactStory = cachedStory;

  // Generate and persist if not cached
  if (!impactStory) {
    impactStory = await generateImpactStory({
      goalAmount,
      raisedAmount,
      donationCount,
      category,
      story,
    });

    if (impactStory) {
      try {
        await prisma.fundraiser.update({
          where: { id: fundraiserId },
          data: { aiImpactStory: impactStory },
        });
      } catch {
        // Non-critical — story still renders, just won't persist
      }
    }
  }

  if (!impactStory) return null;

  return (
    <div className="mt-8 relative rounded-xl bg-gradient-to-br from-warm-100 to-warm-200 p-6">
      <div className="absolute -top-px left-6 rounded-b-md bg-accent-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
        ✦ Impact Snapshot
      </div>
      <p className="mt-2 font-serif text-lg italic leading-relaxed text-warm-800">
        {impactStory}
      </p>
      <div className="mt-3 flex items-center gap-2 text-xs text-warm-500">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-400 text-[8px] text-white">
          ✦
        </span>
        AI-generated insight
      </div>
    </div>
  );
}
