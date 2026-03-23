import { NextResponse } from "next/server";
import { analyzeEvents } from "@/lib/asi/analyze";
import { TelemetryEvent } from "@/lib/schemas/events";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const events: TelemetryEvent[] = body.events;

    if (!events || events.length === 0) {
      return NextResponse.json(
        { error: "No events provided for analysis" },
        { status: 400 }
      );
    }

    const result = await analyzeEvents(events);

    return NextResponse.json({
      incident: result.incident,
      toolCalls: result.toolCalls,
      agentContributions: result.agentContributions,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    console.error("Analysis error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
