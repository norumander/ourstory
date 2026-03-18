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
  formatRelativeTime,
  calculateProgress,
  getInitials,
} from "@/lib/utils";
import { DonationList } from "@/components/fundraiser/donation-list";
import { ShareButton } from "@/components/fundraiser/share-button";

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
      {/* Hero Image */}
      {fundraiser.imageUrl && (
        <div className="mb-6 aspect-video w-full overflow-hidden rounded-xl">
          <img
            src={fundraiser.imageUrl}
            alt={fundraiser.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900">{fundraiser.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <Badge variant="primary">{fundraiser.category}</Badge>
            {fundraiser.community && (
              <Link
                href={`/community/${fundraiser.community.slug}`}
                className="text-primary-600 hover:underline"
              >
                {fundraiser.community.name}
              </Link>
            )}
            <span>Created {formatDate(fundraiser.createdAt)}</span>
          </div>

          {/* Organizer */}
          <div className="mt-6 flex items-center gap-3">
            <Link href={`/profile/${fundraiser.organizer.username}`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                {getInitials(fundraiser.organizer.displayName)}
              </span>
            </Link>
            <div>
              <Link
                href={`/profile/${fundraiser.organizer.username}`}
                className="font-medium text-gray-900 hover:text-primary-600"
              >
                {fundraiser.organizer.displayName}
              </Link>
              <p className="text-xs text-gray-500">Organizer</p>
            </div>
          </div>

          {/* Story */}
          <div className="mt-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Story</h2>
            <div className="whitespace-pre-wrap text-gray-700">
              {fundraiser.story}
            </div>
          </div>

          {/* AI Impact Story placeholder — TASK-015 */}

          {/* Donations */}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Donations ({fundraiser.donationCount})
            </h2>
            <Suspense
              fallback={
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-lg bg-gray-100"
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
          <Card className="sticky top-20">
            <CardContent className="space-y-4 py-6">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(fundraiser.raisedAmount)}
                </p>
                <p className="text-sm text-gray-500">
                  raised of {formatCurrency(fundraiser.goalAmount)} goal
                </p>
              </div>

              <ProgressBar value={progress} showPercentage />

              <p className="text-sm text-gray-500">
                {fundraiser.donationCount} donation
                {fundraiser.donationCount !== 1 ? "s" : ""}
              </p>

              <div className="space-y-2">
                <Link href={`/fundraiser/${fundraiser.id}/donate`} className="block">
                  <Button className="w-full" size="lg">
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
