import { NextResponse } from "next/server";
import { analyzeEvents } from "@/lib/asi/analyze";
import { TelemetryEvent } from "@/lib/schemas/events";
import { DEMO_INCIDENT, DEMO_TOOL_CALLS, DEMO_AGENT_CONTRIBUTIONS } from "@/lib/demo/cached-result";

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

    try {
      const result = await analyzeEvents(events);
      return NextResponse.json({
        incident: result.incident,
        toolCalls: result.toolCalls,
        agentContributions: result.agentContributions,
        source: "live",
      });
    } catch (apiError) {
      // ASI-1 API unavailable — return demo analysis so UI always works
      console.error("ASI-1 API error, using fallback:", apiError instanceof Error ? apiError.message : apiError);
      return NextResponse.json({
        incident: DEMO_INCIDENT,
        toolCalls: DEMO_TOOL_CALLS,
        agentContributions: DEMO_AGENT_CONTRIBUTIONS,
        source: "fallback",
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    console.error("Analysis error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
