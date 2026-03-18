export const revalidate = 60;

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency, calculateProgress } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Medical",
  "Emergency",
  "Education",
  "Community",
  "Animals",
  "Environment",
  "Memorial",
  "Other",
];

interface BrowsePageProps {
  searchParams: Promise<{ category?: string }>;
}

async function getFundraisers(category?: string) {
  return prisma.fundraiser.findMany({
    where: category && category !== "All" ? { category: category as never } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      organizer: { select: { displayName: true, username: true } },
      community: { select: { name: true, slug: true } },
    },
  });
}

export default async function BrowseFundraisersPage({
  searchParams,
}: BrowsePageProps) {
  const { category } = await searchParams;
  const activeCategory = category || "All";
  const fundraisers = await getFundraisers(activeCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl font-bold text-warm-900">
        Browse fundraisers
      </h1>
      <p className="mt-2 text-warm-600">
        Discover causes that matter and make an impact
      </p>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={cat === "All" ? "/fundraisers" : `/fundraisers?category=${cat}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary-600 text-white"
                : "border border-warm-300 text-warm-600 hover:border-primary-500 hover:text-primary-600"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Results */}
      {fundraisers.length === 0 ? (
        <p className="mt-12 text-center font-serif text-lg italic text-warm-500">
          No fundraisers found in this category.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fundraisers.map((f) => (
            <Link key={f.id} href={`/fundraiser/${f.id}`}>
              <Card className="h-full border-warm-300 bg-white transition-shadow hover:shadow-md">
                <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
                  {f.imageUrl ? (
                    <img
                      src={f.imageUrl}
                      alt={f.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-warm-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <Badge variant="primary">{f.category}</Badge>
                    <h3 className="mt-2 line-clamp-2 font-serif text-lg font-semibold text-white drop-shadow-sm">
                      {f.title}
                    </h3>
                  </div>
                </div>
                <CardContent className="space-y-3">
                  <ProgressBar
                    value={calculateProgress(f.raisedAmount, f.goalAmount)}
                    showPercentage={false}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-warm-900">
                      {formatCurrency(f.raisedAmount)}
                    </span>
                    <span className="text-warm-500">
                      of {formatCurrency(f.goalAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-warm-500">
                    <span>
                      by{" "}
                      <span className="text-primary-600">
                        {f.organizer.displayName}
                      </span>
                    </span>
                    {f.community && (
                      <span className="text-primary-600">
                        {f.community.name}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
