export const maxDuration = 300;
import { NextResponse } from "next/server";
import { getASIClient, ASI_MODEL } from "@/lib/asi/client";
import { IncidentAnalysis } from "@/lib/schemas/incident";
import { AgentContribution } from "@/lib/asi/analyze";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, incident, agentContributions } = body as {
      question: string;
      incident: IncidentAnalysis;
      agentContributions: AgentContribution[];
    };

    if (!question || !incident) {
      return NextResponse.json({ error: "Missing question or incident" }, { status: 400 });
    }

    const client = getASIClient();

    const agentSummary = agentContributions
      .map((a) => `${a.role}: ${a.analysis.slice(0, 400)}`)
      .join("\n\n");

    const systemPrompt = `You are ASI-1, the AI copilot for SentinelMesh — a cyber-physical security platform. You have just analyzed a security incident and your specialist agents have produced findings. Answer the operator's question concisely, accurately, and with the confidence of an expert security analyst. Be direct, actionable, and specific to this incident. Keep answers under 150 words.

ACTIVE INCIDENT:
Title: ${incident.title}
Severity: ${incident.severity.toUpperCase()}
Confidence: ${(incident.confidence * 100).toFixed(0)}%
Summary: ${incident.summary}
Affected Assets: ${incident.affected_assets.join(", ")}
Root Cause: ${incident.probable_root_cause}

AGENT FINDINGS:
${agentSummary}`;

    const response = await client.chat.completions.create({
      model: ASI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      max_tokens: 300,
    });

    const answer = response.choices[0]?.message?.content ?? "No response from ASI-1.";

    return NextResponse.json({ answer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Copilot request failed";
    console.error("Copilot error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
