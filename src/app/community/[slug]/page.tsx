export const revalidate = 60;

import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { FollowCommunityButton } from "@/components/community/follow-button";
import { CommunityNarrative } from "@/components/community/community-narrative";

interface CommunityPageProps {
  params: Promise<{ slug: string }>;
}

async function getCommunity(slug: string) {
  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      _count: { select: { followers: true } },
      fundraisers: {
        orderBy: { raisedAmount: "desc" },
        take: 10,
        include: {
          organizer: {
            select: { displayName: true, username: true },
          },
        },
      },
    },
  });

  if (!community) return null;

  // Compute aggregate stats
  const stats = await prisma.fundraiser.aggregate({
    where: { communityId: community.id },
    _sum: { raisedAmount: true, donationCount: true },
    _count: true,
  });

  return {
    ...community,
    stats: {
      totalRaised: stats._sum.raisedAmount || 0,
      totalDonations: stats._sum.donationCount || 0,
      fundraiserCount: stats._count,
    },
  };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { slug } = await params;

  let community: Awaited<ReturnType<typeof getCommunity>>;
  try {
    community = await getCommunity(slug);
  } catch {
    notFound();
  }

  if (!community) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header Image with Community Name Overlay */}
      <div className="relative aspect-[3/1] w-full overflow-hidden">
        {community.imageUrl ? (
          <img
            src={community.imageUrl}
            alt={community.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-warm-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="mx-auto max-w-5xl">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl">
              {community.name}
            </h1>
            <p className="mt-1 text-sm text-white/80">
              {community._count.followers} follower
              {community._count.followers !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Community Info & Actions */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="max-w-2xl text-warm-600">{community.description}</p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Suspense>
              <FollowCommunityButton slug={community.slug} communityId={community.id} />
            </Suspense>
            <Link href={`/fundraiser/new?communityId=${community.id}`}>
              <Button>Start a Fundraiser</Button>
            </Link>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Card className="border-warm-300 bg-white">
            <CardContent className="py-4 text-center">
              <p className="font-serif text-2xl font-bold text-primary-600">
                {formatCurrency(community.stats.totalRaised)}
              </p>
              <p className="text-sm text-warm-500">Total raised</p>
            </CardContent>
          </Card>
          <Card className="border-warm-300 bg-white">
            <CardContent className="py-4 text-center">
              <p className="font-serif text-2xl font-bold text-primary-600">
                {community.stats.totalDonations}
              </p>
              <p className="text-sm text-warm-500">Donations</p>
            </CardContent>
          </Card>
          <Card className="border-warm-300 bg-white">
            <CardContent className="py-4 text-center">
              <p className="font-serif text-2xl font-bold text-primary-600">
                {community.stats.fundraiserCount}
              </p>
              <p className="text-sm text-warm-500">Fundraisers</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Community Narrative */}
        <Suspense>
          <CommunityNarrative
            name={community.name}
            description={community.description}
            totalRaised={community.stats.totalRaised}
            totalDonations={community.stats.totalDonations}
            fundraiserCount={community.stats.fundraiserCount}
            topCategories={[
              ...new Set(community.fundraisers.map((f) => f.category)),
            ]}
          />
        </Suspense>

        {/* Leaderboard */}
        <section>
          <h2 className="mb-4 font-serif text-xl font-bold text-warm-900">
            Top Fundraisers
          </h2>
          {community.fundraisers.length === 0 ? (
            <p className="text-sm text-warm-500">No fundraisers yet.</p>
          ) : (
            <div className="space-y-3">
              {community.fundraisers.map((f, idx) => (
                <Card key={f.id} className="border-warm-300 bg-white">
                  <CardContent className="flex items-center gap-4 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/fundraiser/${f.id}`}
                        className="font-medium text-warm-900 hover:text-primary-600"
                      >
                        {f.title}
                      </Link>
                      <p className="text-sm text-warm-500">
                        by{" "}
                        <Link
                          href={`/profile/${f.organizer.username}`}
                          className="text-primary-600 hover:underline"
                        >
                          {f.organizer.displayName}
                        </Link>
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold text-warm-900">
                      {formatCurrency(f.raisedAmount)}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
