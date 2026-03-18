import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { formatCurrency, calculateProgress } from "@/lib/utils";

async function getFeaturedFundraisers() {
  return prisma.fundraiser.findMany({
    take: 6,
    orderBy: { donationCount: "desc" },
    include: {
      organizer: { select: { displayName: true, username: true } },
    },
  });
}

async function getCommunities() {
  return prisma.community.findMany({
    include: {
      _count: { select: { followers: true, fundraisers: true } },
    },
  });
}

export default async function Home() {
  let fundraisers: Awaited<ReturnType<typeof getFeaturedFundraisers>> = [];
  let communities: Awaited<ReturnType<typeof getCommunities>> = [];

  try {
    [fundraisers, communities] = await Promise.all([
      getFeaturedFundraisers(),
      getCommunities(),
    ]);
  } catch {
    // Database not connected — show empty state
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Every donation tells a{" "}
          <span className="text-primary-600">story</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          ourstory uses AI to transform raw crowdfunding data into
          meaningful narratives — surfacing the real impact of your
          generosity.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg">Get started</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Start a fundraiser
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Fundraisers */}
      {fundraisers.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Featured fundraisers
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fundraisers.map((f) => (
              <Link key={f.id} href={`/fundraiser/${f.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  {f.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-xl">
                      <img
                        src={f.imageUrl}
                        alt={f.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="space-y-3">
                    <Badge variant="primary">{f.category}</Badge>
                    <h3 className="line-clamp-2 font-semibold text-gray-900">
                      {f.title}
                    </h3>
                    <ProgressBar
                      value={calculateProgress(f.raisedAmount, f.goalAmount)}
                      showPercentage={false}
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(f.raisedAmount)}
                      </span>
                      <span className="text-gray-500">
                        of {formatCurrency(f.goalAmount)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      by{" "}
                      <span className="text-primary-600">
                        {f.organizer.displayName}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Communities */}
      {communities.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Communities
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((c) => (
              <Link key={c.id} href={`/community/${c.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  {c.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-xl">
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent>
                    <h3 className="mb-2 font-semibold text-gray-900">
                      {c.name}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                      {c.description}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{c._count.followers} followers</span>
                      <span>{c._count.fundraisers} fundraisers</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state when no data */}
      {fundraisers.length === 0 && communities.length === 0 && (
        <section className="py-16 text-center">
          <p className="text-lg text-gray-500">
            No fundraisers yet. Connect a database and run the seed script
            to get started.
          </p>
        </section>
      )}
    </div>
  );
}
