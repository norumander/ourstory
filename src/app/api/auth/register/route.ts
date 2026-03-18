import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string; displayName?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { email, password, displayName } = body;

  if (!email || !password || !displayName) {
    return NextResponse.json(
      { error: "Email, password, and display name are required" },
      { status: 400 }
    );
  }

  let result: Awaited<ReturnType<typeof registerUser>>;
  try {
    result = await registerUser({ email, password, displayName });
  } catch (err) {
    console.error("Registration failed:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }

  if ("error" in result) {
    return NextResponse.json(
      { error: result.error, field: result.field },
      { status: 400 }
    );
  }

  return NextResponse.json({ user: result.user }, { status: 201 });
}
