import { generateGivingInsights } from "@/lib/ai/giving-insights";
import { Badge } from "@/components/ui/badge";

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
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-500">
          Make a few donations to unlock your personalized giving insights.
        </p>
      </div>
    );
  }

  const insights = await generateGivingInsights(donations);

  if (!insights) return null;

  return (
    <div className="mb-6 rounded-lg border border-primary-100 bg-primary-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🔍</span>
        <h3 className="text-sm font-semibold text-primary-700">
          Impact Overview
        </h3>
        <Badge variant="outline" className="text-xs">
          AI-generated insights
        </Badge>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-gray-700">
        {insights.summary}
      </p>
      {insights.observations.length > 0 && (
        <ul className="space-y-1">
          {insights.observations.map((obs, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-gray-600"
            >
              <span className="mt-0.5 text-primary-500">•</span>
              {obs}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
