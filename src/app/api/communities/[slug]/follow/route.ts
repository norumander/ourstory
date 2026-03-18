import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ following: false });
  }

  const { slug } = await params;
  const community = await prisma.community.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const existing = await prisma.communityFollow.findUnique({
    where: {
      userId_communityId: {
        userId: session.user.id,
        communityId: community.id,
      },
    },
  });

  return NextResponse.json({ following: !!existing });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { slug } = await params;
  const community = await prisma.community.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const existing = await prisma.communityFollow.findUnique({
    where: {
      userId_communityId: {
        userId: session.user.id,
        communityId: community.id,
      },
    },
  });

  if (existing) {
    await prisma.communityFollow.delete({ where: { id: existing.id } });
    revalidatePath(`/community/${slug}`);
    return NextResponse.json({ following: false });
  }

  await prisma.communityFollow.create({
    data: {
      userId: session.user.id,
      communityId: community.id,
    },
  });

  revalidatePath(`/community/${slug}`);
  return NextResponse.json({ following: true });
}
