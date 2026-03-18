import { generateCommunityNarrative } from "@/lib/ai/community-narrative";
import { Badge } from "@/components/ui/badge";

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
    <div className="mb-8 rounded-lg border border-primary-100 bg-primary-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">📖</span>
        <h3 className="text-sm font-semibold text-primary-700">
          Community Story
        </h3>
        <Badge variant="outline" className="text-xs">
          AI-generated narrative
        </Badge>
      </div>
      <p className="text-sm leading-relaxed text-gray-700">{narrative}</p>
    </div>
  );
}
