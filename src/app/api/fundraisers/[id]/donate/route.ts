import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;

  let body: { amount?: number; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { amount, message } = body;

  // Validate amount (in cents)
  if (typeof amount !== "number" || amount < 100 || amount > 1000000) {
    return NextResponse.json(
      { error: "Amount must be between $1 and $10,000" },
      { status: 400 }
    );
  }

  if (!Number.isInteger(amount)) {
    return NextResponse.json(
      { error: "Amount must be an integer (cents)" },
      { status: 400 }
    );
  }

  // Validate message
  if (message !== undefined && message !== null) {
    if (typeof message !== "string" || message.length > 500) {
      return NextResponse.json(
        { error: "Message must be 500 characters or fewer" },
        { status: 400 }
      );
    }
  }

  // Verify fundraiser exists
  const fundraiser = await prisma.fundraiser.findUnique({
    where: { id },
  });

  if (!fundraiser) {
    return NextResponse.json({ error: "Fundraiser not found" }, { status: 404 });
  }

  // Create donation and update fundraiser in a transaction
  const donation = await prisma.$transaction(async (tx) => {
    const newDonation = await tx.donation.create({
      data: {
        amount,
        message: message || null,
        donorId: session.user.id,
        fundraiserId: id,
      },
    });

    await tx.fundraiser.update({
      where: { id },
      data: {
        raisedAmount: { increment: amount },
        donationCount: { increment: 1 },
        aiImpactStory: null, // Clear cached AI story so it regenerates with new data
      },
    });

    return newDonation;
  });

  // Clear community narrative if fundraiser belongs to a community
  if (fundraiser.communityId) {
    await prisma.community.update({
      where: { id: fundraiser.communityId },
      data: { aiNarrative: null },
    }).catch(() => {});
  }

  // Bust cache so pages show updated data
  revalidatePath(`/fundraiser/${id}`);
  revalidatePath("/");

  return NextResponse.json({ donation: { id: donation.id } }, { status: 201 });
}
