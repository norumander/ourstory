export const revalidate = 30;

import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatDate,
  calculateProgress,
  getInitials,
} from "@/lib/utils";
import { DonationList } from "@/components/fundraiser/donation-list";
import { ShareButton } from "@/components/fundraiser/share-button";
import { ImpactStory } from "@/components/fundraiser/impact-story";

interface FundraiserPageProps {
  params: Promise<{ id: string }>;
}

async function getFundraiser(id: string) {
  return prisma.fundraiser.findUnique({
    where: { id },
    include: {
      organizer: {
        select: { id: true, displayName: true, username: true, avatarUrl: true },
      },
      community: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export default async function FundraiserPage({ params }: FundraiserPageProps) {
  const { id } = await params;

  let fundraiser: Awaited<ReturnType<typeof getFundraiser>>;
  try {
    fundraiser = await getFundraiser(id);
  } catch {
    notFound();
  }

  if (!fundraiser) {
    notFound();
  }

  const progress = calculateProgress(fundraiser.raisedAmount, fundraiser.goalAmount);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Hero Image with overlaid title */}
      <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
        {fundraiser.imageUrl ? (
          <img
            src={fundraiser.imageUrl}
            alt={fundraiser.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-warm-200" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Overlaid content */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge variant="primary">{fundraiser.category}</Badge>
            {fundraiser.community && (
              <Link
                href={`/community/${fundraiser.community.slug}`}
                className="text-sm font-medium text-white/90 hover:text-white hover:underline"
              >
                {fundraiser.community.name}
              </Link>
            )}
          </div>
          <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            {fundraiser.title}
          </h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Meta line */}
          <p className="text-sm text-warm-500">
            Created {formatDate(fundraiser.createdAt)}
          </p>

          {/* Organizer */}
          <div className="mt-6 flex items-center gap-3">
            <Link href={`/profile/${fundraiser.organizer.username}`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white ring-2 ring-accent-400">
                {getInitials(fundraiser.organizer.displayName)}
              </span>
            </Link>
            <div>
              <Link
                href={`/profile/${fundraiser.organizer.username}`}
                className="font-medium text-warm-900 hover:text-primary-600"
              >
                {fundraiser.organizer.displayName}
              </Link>
              <p className="text-xs text-warm-500">Organizer</p>
            </div>
          </div>

          {/* Story */}
          <div className="mt-8">
            <h2 className="mb-3 font-serif text-xl font-semibold text-warm-900">
              Story
            </h2>
            <div className="whitespace-pre-wrap font-serif text-warm-700 leading-relaxed">
              {fundraiser.story}
            </div>
          </div>

          {/* AI Impact Story */}
          <Suspense>
            <ImpactStory
              goalAmount={fundraiser.goalAmount}
              raisedAmount={fundraiser.raisedAmount}
              donationCount={fundraiser.donationCount}
              category={fundraiser.category}
              story={fundraiser.story}
            />
          </Suspense>

          {/* Words of support */}
          <div className="mt-8">
            <h2 className="mb-4 font-serif text-xl font-semibold text-warm-900">
              Words of support ({fundraiser.donationCount})
            </h2>
            <Suspense
              fallback={
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-lg bg-warm-100"
                    />
                  ))}
                </div>
              }
            >
              <DonationList fundraiserId={fundraiser.id} />
            </Suspense>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 border-warm-300 bg-white">
            <CardContent className="space-y-4 py-6">
              <div>
                <p className="font-serif text-3xl font-bold text-warm-900">
                  {formatCurrency(fundraiser.raisedAmount)}
                </p>
                <p className="text-sm text-warm-500">
                  raised of {formatCurrency(fundraiser.goalAmount)} goal
                </p>
              </div>

              <div className="w-full">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-warm-600">{progress}%</span>
                </div>
                <div
                  className="h-3 w-full overflow-hidden rounded-full bg-warm-200"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Fundraising progress"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                  />
                </div>
              </div>

              <p className="text-sm text-warm-600">
                {fundraiser.donationCount} donation
                {fundraiser.donationCount !== 1 ? "s" : ""}
              </p>

              <div className="space-y-2">
                <Link href={`/fundraiser/${fundraiser.id}/donate`} className="block">
                  <Button className="w-full bg-primary-600 hover:bg-primary-700" size="lg">
                    Donate
                  </Button>
                </Link>
                <ShareButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
