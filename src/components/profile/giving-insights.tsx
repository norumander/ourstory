import { generateGivingInsights } from "@/lib/ai/giving-insights";

interface GivingInsightsProps {
  donations: {
    amount: number;
    category: string;
    fundraiserTitle: string;
    createdAt: Date | string;
  }[];
  donationCount: number;
}

export async function GivingInsights({
  donations,
  donationCount,
}: GivingInsightsProps) {
  if (donationCount < 2) {
    return (
      <div className="mb-6 rounded-xl border border-warm-300 bg-warm-100 p-5 text-center">
        <p className="font-serif text-sm italic text-warm-600">
          Make a few donations to unlock your personalized giving insights.
        </p>
      </div>
    );
  }

  const insights = await generateGivingInsights(donations);

  if (!insights) return null;

  return (
    <div className="mb-6 relative rounded-xl bg-gradient-to-br from-warm-100 to-warm-200 p-6">
      <div className="absolute -top-px left-6 rounded-b-md bg-accent-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
        ✦ Impact Overview
      </div>
      <p className="mt-2 font-serif text-base leading-relaxed text-warm-800">
        {insights.summary}
      </p>
      {insights.observations.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {insights.observations.map((obs, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-warm-700"
            >
              <span className="mt-0.5 text-accent-500">•</span>
              {obs}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs text-warm-500">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-400 text-[8px] text-white">
          ✦
        </span>
        AI-generated insights
      </div>
    </div>
  );
}
