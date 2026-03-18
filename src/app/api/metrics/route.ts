import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const ADMIN_EMAILS = ["demo@ourstory.app", "norman.peter@challenger.gauntletai.com"];
  if (!session.user.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    pageLoadCount,
    aiInvocationCount,
    donationCount,
    navigationCount,
    authCount,
    recentEvents,
  ] = await Promise.all([
    prisma.metricEvent.count({ where: { eventType: "page_load" } }),
    prisma.metricEvent.count({ where: { eventType: "ai_invocation" } }),
    prisma.metricEvent.count({ where: { eventType: "donation" } }),
    prisma.metricEvent.count({ where: { eventType: "navigation" } }),
    prisma.metricEvent.count({ where: { eventType: "auth" } }),
    prisma.metricEvent.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
    }),
  ]);

  return NextResponse.json({
    data: {
      summary: {
        page_load: pageLoadCount,
        ai_invocation: aiInvocationCount,
        donation: donationCount,
        navigation: navigationCount,
        auth: authCount,
        total: pageLoadCount + aiInvocationCount + donationCount + navigationCount + authCount,
      },
      recentEvents,
    },
  });
}
