import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ following: false });
  }

  const { username } = await params;
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUser.id,
      },
    },
  });

  return NextResponse.json({ following: !!existing });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { username } = await params;
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Prevent self-follow
  if (targetUser.id === session.user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const existing = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUser.id,
      },
    },
  });

  if (existing) {
    await prisma.userFollow.delete({ where: { id: existing.id } });
    revalidatePath(`/profile/${username}`);
    return NextResponse.json({ following: false });
  }

  await prisma.userFollow.create({
    data: {
      followerId: session.user.id,
      followingId: targetUser.id,
    },
  });

  revalidatePath(`/profile/${username}`);
  return NextResponse.json({ following: true });
}
