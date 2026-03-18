import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

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

  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const stats = await prisma.fundraiser.aggregate({
    where: { communityId: community.id },
    _sum: { raisedAmount: true, donationCount: true },
    _count: true,
  });

  return NextResponse.json({
    data: {
      ...community,
      stats: {
        totalRaised: stats._sum.raisedAmount || 0,
        totalDonations: stats._sum.donationCount || 0,
        fundraiserCount: stats._count,
      },
    },
  });
}
