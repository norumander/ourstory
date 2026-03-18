import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

export default async function MetricsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/metrics");
  }

  const ADMIN_EMAILS = ["demo@ourstory.app", "norman.peter@challenger.gauntletai.com"];
  if (!ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/");
  }

  let summary = {
    page_load: 0,
    ai_invocation: 0,
    donation: 0,
    navigation: 0,
    auth: 0,
  };
  let recentEvents: { id: number; eventType: string; payload: unknown; timestamp: Date }[] = [];

  try {
    const [pl, ai, don, nav, au, events] = await Promise.all([
      prisma.metricEvent.count({ where: { eventType: "page_load" } }),
      prisma.metricEvent.count({ where: { eventType: "ai_invocation" } }),
      prisma.metricEvent.count({ where: { eventType: "donation" } }),
      prisma.metricEvent.count({ where: { eventType: "navigation" } }),
      prisma.metricEvent.count({ where: { eventType: "auth" } }),
      prisma.metricEvent.findMany({
        orderBy: { timestamp: "desc" },
        take: 30,
      }),
    ]);
    summary = { page_load: pl, ai_invocation: ai, donation: don, navigation: nav, auth: au };
    recentEvents = events;
  } catch {
    // Database not available
  }

  const total = Object.values(summary).reduce((a, b) => a + b, 0);

  const eventTypeColors: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
    page_load: "default",
    ai_invocation: "primary",
    donation: "success",
    navigation: "warning",
    auth: "error",
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-warm-900">
        Metrics Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-warm-900">{total}</p>
            <p className="text-xs text-warm-500">Total Events</p>
          </CardContent>
        </Card>
        {Object.entries(summary).map(([type, count]) => (
          <Card key={type}>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-warm-900">{count}</p>
              <p className="text-xs text-warm-500">{type.replace("_", " ")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-warm-900">
            Recent Events
          </h2>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-warm-500">No events recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-lg border border-warm-100 p-3 text-sm"
                >
                  <Badge variant={eventTypeColors[event.eventType] || "default"}>
                    {event.eventType}
                  </Badge>
                  <pre className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-warm-600">
                    {JSON.stringify(event.payload)}
                  </pre>
                  <span className="shrink-0 text-xs text-warm-400">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
