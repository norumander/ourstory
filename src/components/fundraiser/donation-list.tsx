import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatRelativeTime, getInitials } from "@/lib/utils";

interface DonationListProps {
  fundraiserId: string;
}

export async function DonationList({ fundraiserId }: DonationListProps) {
  const donations = await prisma.donation.findMany({
    where: { fundraiserId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      donor: {
        select: { displayName: true, username: true },
      },
    },
  });

  if (donations.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No donations yet. Be the first to contribute!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {donations.map((donation) => (
        <div
          key={donation.id}
          className="flex items-start gap-3 rounded-lg border border-gray-100 p-3"
        >
          <Link href={`/profile/${donation.donor.username}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
              {getInitials(donation.donor.displayName)}
            </span>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${donation.donor.username}`}
                className="font-medium text-gray-900 hover:text-primary-600"
              >
                {donation.donor.displayName}
              </Link>
              <span className="text-sm font-semibold text-primary-600">
                {formatCurrency(donation.amount)}
              </span>
            </div>
            {donation.message && (
              <p className="mt-1 text-sm text-gray-600">{donation.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              {formatRelativeTime(donation.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
