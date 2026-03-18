import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

const VALID_CATEGORIES = Object.values(Category);

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: {
    title?: string;
    story?: string;
    goalAmount?: number;
    category?: string;
    imageUrl?: string;
    communityId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { title, story, goalAmount, category, imageUrl, communityId } = body;

  // Validation
  if (!title || title.length < 5 || title.length > 100) {
    return NextResponse.json(
      { error: "Title must be 5–100 characters", field: "title" },
      { status: 400 }
    );
  }

  if (!story || story.length < 50 || story.length > 5000) {
    return NextResponse.json(
      { error: "Story must be 50–5000 characters", field: "story" },
      { status: 400 }
    );
  }

  if (
    typeof goalAmount !== "number" ||
    goalAmount < 5000 ||
    goalAmount > 100000000
  ) {
    return NextResponse.json(
      { error: "Goal must be between $50 and $1,000,000", field: "goalAmount" },
      { status: 400 }
    );
  }

  if (!category || !VALID_CATEGORIES.includes(category as Category)) {
    return NextResponse.json(
      { error: "Invalid category", field: "category" },
      { status: 400 }
    );
  }

  if (imageUrl && !/^https?:\/\/.+/.test(imageUrl)) {
    return NextResponse.json(
      { error: "Invalid image URL", field: "imageUrl" },
      { status: 400 }
    );
  }

  if (communityId) {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });
    if (!community) {
      return NextResponse.json(
        { error: "Community not found", field: "communityId" },
        { status: 400 }
      );
    }
  }

  const fundraiser = await prisma.fundraiser.create({
    data: {
      title,
      story,
      goalAmount,
      category: category as Category,
      imageUrl: imageUrl || null,
      organizerId: session.user.id,
      communityId: communityId || null,
    },
  });

  revalidatePath("/");
  if (communityId) {
    // Revalidate the community page if fundraiser is associated
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { slug: true },
    });
    if (community) revalidatePath(`/community/${community.slug}`);
  }

  return NextResponse.json({ fundraiser: { id: fundraiser.id } }, { status: 201 });
}
