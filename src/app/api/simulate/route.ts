import { NextResponse } from "next/server";
import { simulateCounterfactual } from "@/lib/asi/analyze";
import { IncidentAnalysis } from "@/lib/schemas/incident";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { incident, action, target } = body as {
      incident: IncidentAnalysis;
      action: string;
      target: string;
    };

    if (!incident || !action || !target) {
      return NextResponse.json(
        { error: "incident, action, and target are required" },
        { status: 400 }
      );
    }

    const result = await simulateCounterfactual(incident, action, target);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Simulation failed";
    console.error("Simulation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
