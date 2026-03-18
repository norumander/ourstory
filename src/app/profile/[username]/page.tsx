export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatRelativeTime,
  getInitials,
} from "@/lib/utils";
import { FollowUserButton } from "@/components/profile/follow-button";
import { GivingInsights } from "@/components/profile/giving-insights";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

async function getProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: { followers: true, following: true },
      },
      fundraisers: {
        orderBy: { createdAt: "desc" },
        include: {
          community: { select: { name: true, slug: true } },
        },
      },
      donations: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          fundraiser: {
            select: { id: true, title: true, category: true },
          },
        },
      },
      communityFollows: {
        include: {
          community: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });

  if (!user) return null;

  // Compute highlights: top-supported fundraisers by total donated
  const donationsByFundraiser = new Map<
    string,
    { fundraiserId: string; title: string; total: number }
  >();
  for (const d of user.donations) {
    const key = d.fundraiserId;
    const existing = donationsByFundraiser.get(key);
    if (existing) {
      existing.total += d.amount;
    } else {
      donationsByFundraiser.set(key, {
        fundraiserId: d.fundraiserId,
        title: d.fundraiser.title,
        total: d.amount,
      });
    }
  }
  const highlights = [...donationsByFundraiser.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return { ...user, highlights };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await auth();

  let profile: Awaited<ReturnType<typeof getProfile>>;
  try {
    profile = await getProfile(username);
  } catch {
    notFound();
  }

  if (!profile) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === profile.id;

  // Interleave donations and fundraisers into activity feed
  type ActivityItem =
    | { type: "donation"; data: (typeof profile.donations)[number]; date: Date }
    | { type: "fundraiser"; data: (typeof profile.fundraisers)[number]; date: Date };

  const activityFeed: ActivityItem[] = [
    ...profile.donations.map((d) => ({
      type: "donation" as const,
      data: d,
      date: d.createdAt,
    })),
    ...profile.fundraisers.map((f) => ({
      type: "fundraiser" as const,
      data: f,
      date: f.createdAt,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Profile Header */}
      <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-600 text-2xl font-bold text-white ring-4 ring-accent-400">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            getInitials(profile.displayName)
          )}
        </span>
        <div className="flex-1">
          <h1 className="font-serif text-2xl font-bold text-warm-900">
            {profile.displayName}
          </h1>
          <p className="text-sm text-warm-500">@{profile.username}</p>
          <div className="mt-2 flex gap-4 text-sm text-warm-500">
            <span>
              <strong className="text-warm-900">{profile._count.followers}</strong>{" "}
              follower{profile._count.followers !== 1 ? "s" : ""}
            </span>
            <span>
              <strong className="text-warm-900">{profile._count.following}</strong>{" "}
              following
            </span>
          </div>
        </div>
        {!isOwnProfile && (
          <Suspense>
            <FollowUserButton username={profile.username} userId={profile.id} />
          </Suspense>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* AI Giving Insights — own profile only */}
          {isOwnProfile && (
            <Suspense>
              <GivingInsights
                donations={profile.donations.map((d) => ({
                  amount: d.amount,
                  category: d.fundraiser.category,
                  fundraiserTitle: d.fundraiser.title,
                  createdAt: d.createdAt,
                }))}
                donationCount={profile.donations.length}
              />
            </Suspense>
          )}

          {/* Activity Feed */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-semibold text-warm-900">Activity</h2>
            {activityFeed.length === 0 ? (
              <p className="text-sm text-warm-500">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {activityFeed.map((item) => {
                  if (item.type === "donation") {
                    const d = item.data;
                    return (
                      <Card key={`donation-${d.id}`} className="border-warm-300 bg-white">
                        <CardContent className="flex items-start gap-3 py-3">
                          <span className="mt-0.5 text-xl">💜</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-warm-700">
                              Donated{" "}
                              <strong className="text-accent-500">{formatCurrency(d.amount)}</strong> to{" "}
                              <Link
                                href={`/fundraiser/${d.fundraiser.id}`}
                                className="font-medium text-primary-600 hover:underline"
                              >
                                {d.fundraiser.title}
                              </Link>
                            </p>
                            {d.message && (
                              <p className="mt-1 font-serif text-sm italic text-warm-500">
                                &ldquo;{d.message}&rdquo;
                              </p>
                            )}
                            <p className="mt-1 text-xs text-warm-400">
                              {formatRelativeTime(d.createdAt)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  const f = item.data;
                  return (
                    <Card key={`fundraiser-${f.id}`} className="border-warm-300 bg-white">
                      <CardContent className="flex items-start gap-3 py-3">
                        <span className="mt-0.5 text-xl">🚀</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-warm-700">
                            Created fundraiser{" "}
                            <Link
                              href={`/fundraiser/${f.id}`}
                              className="font-medium text-primary-600 hover:underline"
                            >
                              {f.title}
                            </Link>
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="primary">{f.category}</Badge>
                            {f.community && (
                              <Link
                                href={`/community/${f.community.slug}`}
                                className="text-xs text-primary-600 hover:underline"
                              >
                                {f.community.name}
                              </Link>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-warm-400">
                            {formatRelativeTime(f.createdAt)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          {/* My Fundraisers */}
          {profile.fundraisers.length > 0 && (
            <section>
              <h3 className="mb-3 font-serif text-lg font-semibold text-warm-900">
                {isOwnProfile ? "My Fundraisers" : "Fundraisers"}
              </h3>
              <div className="space-y-2">
                {profile.fundraisers.map((f) => (
                  <Link
                    key={f.id}
                    href={`/fundraiser/${f.id}`}
                    className="block rounded-lg border border-warm-200 p-3 hover:bg-warm-100"
                  >
                    <p className="line-clamp-1 text-sm font-medium text-warm-900">
                      {f.title}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-accent-500">
                        {formatCurrency(f.raisedAmount)} raised
                      </span>
                      <Badge variant="primary" className="text-[10px]">
                        {f.category}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Highlights */}
          {profile.highlights.length > 0 && (
            <section>
              <h3 className="mb-3 font-serif text-lg font-semibold text-warm-900">
                Top Supported
              </h3>
              <div className="space-y-2">
                {profile.highlights.map((h) => (
                  <Link
                    key={h.fundraiserId}
                    href={`/fundraiser/${h.fundraiserId}`}
                    className="block rounded-lg border border-warm-200 p-3 hover:bg-warm-100"
                  >
                    <p className="line-clamp-1 text-sm font-medium text-warm-900">
                      {h.title}
                    </p>
                    <p className="text-xs text-accent-500">
                      {formatCurrency(h.total)} donated
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Communities */}
          {profile.communityFollows.length > 0 && (
            <section>
              <h3 className="mb-3 font-serif text-lg font-semibold text-warm-900">
                Communities
              </h3>
              <div className="space-y-2">
                {profile.communityFollows.map((cf) => (
                  <Link
                    key={cf.community.id}
                    href={`/community/${cf.community.slug}`}
                    className="block rounded-lg border border-warm-200 p-3 text-sm font-medium text-primary-600 hover:bg-warm-100"
                  >
                    {cf.community.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
