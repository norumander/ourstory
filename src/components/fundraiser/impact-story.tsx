import { generateImpactStory } from "@/lib/ai/impact-story";
import { Badge } from "@/components/ui/badge";

interface ImpactStoryProps {
  goalAmount: number;
  raisedAmount: number;
  donationCount: number;
  category: string;
  story: string;
}

export async function ImpactStory(props: ImpactStoryProps) {
  const impactStory = await generateImpactStory(props);

  if (!impactStory) return null;

  return (
    <div className="mt-6 rounded-lg border border-primary-100 bg-primary-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">✨</span>
        <h3 className="text-sm font-semibold text-primary-700">
          Impact Snapshot
        </h3>
        <Badge variant="outline" className="text-xs">
          AI-generated insight
        </Badge>
      </div>
      <p className="text-sm leading-relaxed text-gray-700">{impactStory}</p>
    </div>
  );
}
