import { generateCommunityNarrative } from "@/lib/ai/community-narrative";

interface CommunityNarrativeProps {
  name: string;
  description: string;
  totalRaised: number;
  totalDonations: number;
  fundraiserCount: number;
  topCategories: string[];
}

export async function CommunityNarrative(props: CommunityNarrativeProps) {
  const narrative = await generateCommunityNarrative(props);

  if (!narrative) return null;

  return (
    <div className="mb-8 relative rounded-xl bg-gradient-to-br from-warm-100 to-warm-200 p-6">
      <div className="absolute -top-px left-6 rounded-b-md bg-accent-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
        ✦ Community Story
      </div>
      <p className="mt-2 font-serif text-lg italic leading-relaxed text-warm-800">
        {narrative}
      </p>
      <div className="mt-3 flex items-center gap-2 text-xs text-warm-500">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-400 text-[8px] text-white">
          ✦
        </span>
        AI-generated narrative
      </div>
    </div>
  );
}
