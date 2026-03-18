import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

const VALID_CATEGORIES = Object.values(Category);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;

  const fundraiser = await prisma.fundraiser.findUnique({
    where: { id },
    select: { organizerId: true },
  });

  if (!fundraiser) {
    return NextResponse.json({ error: "Fundraiser not found" }, { status: 404 });
  }

  if (fundraiser.organizerId !== session.user.id) {
    return NextResponse.json({ error: "Only the organizer can edit this fundraiser" }, { status: 403 });
  }

  let body: {
    title?: string;
    story?: string;
    goalAmount?: number;
    category?: string;
    imageUrl?: string | null;
    communityId?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) {
    if (body.title.length < 5 || body.title.length > 100) {
      return NextResponse.json({ error: "Title must be 5–100 characters", field: "title" }, { status: 400 });
    }
    updates.title = body.title;
  }

  if (body.story !== undefined) {
    if (body.story.length < 50 || body.story.length > 5000) {
      return NextResponse.json({ error: "Story must be 50–5000 characters", field: "story" }, { status: 400 });
    }
    updates.story = body.story;
  }

  if (body.goalAmount !== undefined) {
    if (body.goalAmount < 5000 || body.goalAmount > 100000000) {
      return NextResponse.json({ error: "Goal must be between $50 and $1,000,000", field: "goalAmount" }, { status: 400 });
    }
    updates.goalAmount = body.goalAmount;
  }

  if (body.category !== undefined) {
    if (!VALID_CATEGORIES.includes(body.category as Category)) {
      return NextResponse.json({ error: "Invalid category", field: "category" }, { status: 400 });
    }
    updates.category = body.category;
  }

  if (body.imageUrl !== undefined) {
    if (body.imageUrl !== null && body.imageUrl !== "" && !/^https?:\/\/.+/.test(body.imageUrl)) {
      return NextResponse.json({ error: "Invalid image URL", field: "imageUrl" }, { status: 400 });
    }
    updates.imageUrl = body.imageUrl || null;
  }

  if (body.communityId !== undefined) {
    updates.communityId = body.communityId || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await prisma.fundraiser.update({
    where: { id },
    data: updates,
  });

  revalidatePath(`/fundraiser/${id}`);
  revalidatePath("/");

  return NextResponse.json({ fundraiser: { id: updated.id } });
}
