import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateStoryDraft } from "@/lib/ai/story-coach";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: { title?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { title, notes } = body;

  if (!title || !notes) {
    return NextResponse.json(
      { error: "Title and notes are required" },
      { status: 400 }
    );
  }

  if (notes.length < 20) {
    return NextResponse.json(
      { error: "Please write at least 20 characters of notes" },
      { status: 400 }
    );
  }

  const draft = await generateStoryDraft(title, notes);

  if (!draft) {
    return NextResponse.json(
      { error: "AI assistant is temporarily unavailable. Please try again or write your story manually." },
      { status: 503 }
    );
  }

  return NextResponse.json({ draft });
}
