import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      displayName: true,
      username: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: { followers: true, following: true },
      },
      fundraisers: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          category: true,
          raisedAmount: true,
          goalAmount: true,
          createdAt: true,
        },
      },
      donations: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          amount: true,
          message: true,
          createdAt: true,
          fundraiser: {
            select: { id: true, title: true },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: user });
}
