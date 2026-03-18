export const revalidate = 60;

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";

interface ConnectionsPageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ tab?: string }>;
}

async function getConnections(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      displayName: true,
      username: true,
      followers: {
        include: {
          follower: {
            select: { id: true, displayName: true, username: true, avatarUrl: true },
          },
        },
      },
      following: {
        include: {
          following: {
            select: { id: true, displayName: true, username: true, avatarUrl: true },
          },
        },
      },
      communityFollows: {
        include: {
          community: {
            select: { id: true, name: true, slug: true, imageUrl: true },
          },
        },
      },
    },
  });

  return user;
}

export default async function ConnectionsPage({
  params,
  searchParams,
}: ConnectionsPageProps) {
  const { username } = await params;
  const { tab } = await searchParams;
  const activeTab = tab || "followers";

  const user = await getConnections(username);
  if (!user) notFound();

  const tabs = [
    { key: "followers", label: "Followers", count: user.followers.length },
    {
      key: "following",
      label: "Following",
      count: user.following.length + user.communityFollows.length,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/profile/${username}`}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          ← Back to {user.displayName}&apos;s profile
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-bold text-warm-900">
          {user.displayName}
        </h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-warm-300">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/profile/${username}/connections?tab=${t.key}`}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-warm-500 hover:border-warm-300 hover:text-warm-700"
            }`}
          >
            {t.label}{" "}
            <span className="ml-1 text-warm-400">{t.count}</span>
          </Link>
        ))}
      </div>

      {/* Content */}
      {activeTab === "followers" && (
        <div>
          {user.followers.length === 0 ? (
            <p className="py-8 text-center font-serif italic text-warm-500">
              No followers yet.
            </p>
          ) : (
            <div className="space-y-2">
              {user.followers.map((f) => (
                <Link
                  key={f.follower.id}
                  href={`/profile/${f.follower.username}`}
                  className="flex items-center gap-3 rounded-lg border border-warm-200 p-3 transition-colors hover:bg-warm-100"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white ring-2 ring-accent-400">
                    {f.follower.avatarUrl ? (
                      <img
                        src={f.follower.avatarUrl}
                        alt={f.follower.displayName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(f.follower.displayName)
                    )}
                  </span>
                  <div>
                    <p className="font-medium text-warm-900">
                      {f.follower.displayName}
                    </p>
                    <p className="text-xs text-warm-500">
                      @{f.follower.username}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "following" && (
        <div>
          {user.following.length === 0 && user.communityFollows.length === 0 ? (
            <p className="py-8 text-center font-serif italic text-warm-500">
              Not following anyone yet.
            </p>
          ) : (
            <div className="space-y-6">
              {/* Users */}
              {user.following.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-warm-500">
                    People
                  </h3>
                  <div className="space-y-2">
                    {user.following.map((f) => (
                      <Link
                        key={f.following.id}
                        href={`/profile/${f.following.username}`}
                        className="flex items-center gap-3 rounded-lg border border-warm-200 p-3 transition-colors hover:bg-warm-100"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white ring-2 ring-accent-400">
                          {f.following.avatarUrl ? (
                            <img
                              src={f.following.avatarUrl}
                              alt={f.following.displayName}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(f.following.displayName)
                          )}
                        </span>
                        <div>
                          <p className="font-medium text-warm-900">
                            {f.following.displayName}
                          </p>
                          <p className="text-xs text-warm-500">
                            @{f.following.username}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Communities */}
              {user.communityFollows.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-warm-500">
                    Communities
                  </h3>
                  <div className="space-y-2">
                    {user.communityFollows.map((cf) => (
                      <Link
                        key={cf.community.id}
                        href={`/community/${cf.community.slug}`}
                        className="flex items-center gap-3 rounded-lg border border-warm-200 p-3 transition-colors hover:bg-warm-100"
                      >
                        {cf.community.imageUrl ? (
                          <img
                            src={cf.community.imageUrl}
                            alt={cf.community.name}
                            className="h-10 w-10 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warm-200 text-sm font-semibold text-warm-600">
                            {cf.community.name[0]}
                          </div>
                        )}
                        <p className="font-medium text-warm-900">
                          {cf.community.name}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
