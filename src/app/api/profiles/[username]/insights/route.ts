import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateGivingInsights } from "@/lib/ai/giving-insights";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Only the profile owner can view insights
  if (user.id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const donations = await prisma.donation.findMany({
    where: { donorId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      fundraiser: {
        select: { title: true, category: true },
      },
    },
  });

  if (donations.length < 2) {
    return NextResponse.json({
      data: null,
      message: "Make a few donations to unlock your personalized giving insights.",
    });
  }

  const insights = await generateGivingInsights(
    donations.map((d) => ({
      amount: d.amount,
      category: d.fundraiser.category,
      fundraiserTitle: d.fundraiser.title,
      createdAt: d.createdAt,
    }))
  );

  return NextResponse.json({ data: insights });
}
