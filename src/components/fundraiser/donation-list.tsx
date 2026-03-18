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
      <p className="font-serif text-sm italic text-warm-500">
        No donations yet. Be the first to contribute!
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {donations.map((donation) => (
        <div
          key={donation.id}
          className="flex items-start gap-3 border-b border-warm-200 py-4 last:border-0"
        >
          <Link href={`/profile/${donation.donor.username}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warm-200 text-xs font-semibold text-warm-700">
              {getInitials(donation.donor.displayName)}
            </span>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${donation.donor.username}`}
                className="font-medium text-warm-900 hover:text-primary-600"
              >
                {donation.donor.displayName}
              </Link>
              <span className="text-sm font-semibold text-accent-500">
                {formatCurrency(donation.amount)}
              </span>
            </div>
            {donation.message && (
              <p className="mt-1 font-serif text-sm italic text-warm-600">
                &ldquo;{donation.message}&rdquo;
              </p>
            )}
            <p className="mt-1 text-xs text-warm-500">
              {formatRelativeTime(donation.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
