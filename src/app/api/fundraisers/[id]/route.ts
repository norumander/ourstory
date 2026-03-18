import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const fundraiser = await prisma.fundraiser.findUnique({
    where: { id },
    include: {
      organizer: {
        select: { id: true, displayName: true, username: true, avatarUrl: true },
      },
      community: {
        select: { id: true, name: true, slug: true },
      },
      donations: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          donor: {
            select: { displayName: true, username: true },
          },
        },
      },
    },
  });

  if (!fundraiser) {
    return NextResponse.json({ error: "Fundraiser not found" }, { status: 404 });
  }

  return NextResponse.json({ data: fundraiser });
}
