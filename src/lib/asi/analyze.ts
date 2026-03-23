import { getASIClient, ASI_MODEL } from "./client";
import { TelemetryEvent } from "@/lib/schemas/events";
import { IncidentAnalysis } from "@/lib/schemas/incident";
import { executeTool, ToolCallRecord } from "@/lib/tools/executor";
import OpenAI from "openai";
import { v4 as uuid } from "uuid";

export interface AgentContribution {
  agent: string;
  role: string;
  analysis: string;
  recommendations: string[];
}

export interface AnalysisResult {
  incident: IncidentAnalysis;
  toolCalls: ToolCallRecord[];
  agentContributions: AgentContribution[];
  rawResponses: string[];
}

const AGENT_PROMPTS: Record<string, string> = {
  cyber_analyst: `You are the Cyber Analyst agent within SentinelMesh. Your specialty is network security, data exfiltration detection, and digital forensics. Analyze the following events focusing on:
- Network traffic anomalies and data flow patterns
- Failed authentication attempts and credential abuse
- Unknown devices and unauthorized network access
- Potential malware indicators and C2 communication
- Digital evidence preservation priorities

Provide your analysis as a brief expert assessment with specific technical findings and recommendations.`,

  facility_safety: `You are the Facility Safety agent within SentinelMesh. Your specialty is physical security, environmental monitoring, and occupant safety. Analyze the following events focusing on:
- Environmental readings (temperature, humidity, smoke) and their safety implications
- Physical access patterns and badge anomalies
- Equipment failures and their cascading effects
- Evacuation or containment needs
- Regulatory compliance implications (OSHA, fire codes, cold chain)

Provide your analysis as a brief expert assessment with specific safety findings and recommendations.`,

  incident_commander: `You are the Incident Commander agent within SentinelMesh. You synthesize findings from the Cyber Analyst and Facility Safety agents to create a unified incident response plan. Your role:
- Prioritize actions based on combined cyber and physical risk
- Resolve conflicts between cyber containment and physical safety
- Determine escalation paths and notification requirements
- Assign responsibilities and set timelines
- Ensure evidence preservation while maintaining safety

You will be given the findings from both specialist agents. Synthesize them into a final coordinated plan.`,
};

async function runSpecialistAgent(
  agentName: string,
  events: TelemetryEvent[],
  additionalContext?: string
): Promise<AgentContribution> {
  const client = getASIClient();

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: AGENT_PROMPTS[agentName] },
    {
      role: "user",
      content: `Analyze these facility telemetry events:\n\n${JSON.stringify(events, null, 2)}${additionalContext ? `\n\nAdditional context from other agents:\n${additionalContext}` : ""}`,
    },
  ];

  const response = await client.chat.completions.create({
    model: ASI_MODEL,
    messages,
  });

  const content = response.choices[0]?.message?.content || "";

  const roleLabels: Record<string, string> = {
    cyber_analyst: "Cyber Analyst",
    facility_safety: "Facility Safety Specialist",
    incident_commander: "Incident Commander",
  };

  const recLines = content
    .split("\n")
    .filter((line) => /^\s*[-•*\d]/.test(line) && line.length > 10)
    .slice(0, 5)
    .map((line) => line.replace(/^\s*[-•*\d.)\]]+\s*/, "").trim());

  return {
    agent: agentName,
    role: roleLabels[agentName] || agentName,
    analysis: content,
    recommendations: recLines.length > 0 ? recLines : ["See full analysis above"],
  };
}

/**
 * Pre-runs all relevant tools based on event analysis and returns
 * tool call records plus context string to inject into the final prompt.
 */
function preRunTools(events: TelemetryEvent[]): { toolCalls: ToolCallRecord[]; context: string } {
  const toolCalls: ToolCallRecord[] = [];
  const contextParts: string[] = [];

  const hasNetwork = events.some((e) => ["network_spike", "data_transfer", "unknown_device"].includes(e.type));
  const hasAccess = events.some((e) => ["badge_swipe", "badge_denied", "failed_login"].includes(e.type));
  const hasEnv = events.some((e) => ["temperature", "humidity", "smoke_alert", "power_anomaly"].includes(e.type));
  const hasCamera = events.some((e) => ["camera_offline", "usb_insert"].includes(e.type));

  // Determine categories
  let category = "multi_vector";
  if (hasNetwork && !hasEnv) category = "data_exfiltration";
  else if (hasAccess && !hasNetwork) category = "unauthorized_access";
  else if (hasEnv && !hasNetwork) category = "environmental_hazard";

  // Tool 1: Lookup playbook
  {
    const args = { category, severity: "critical" };
    const result = executeTool("lookup_playbook", args);
    const record: ToolCallRecord = {
      id: uuid(),
      name: "lookup_playbook",
      arguments: args,
      result,
      timestamp: new Date().toISOString(),
    };
    toolCalls.push(record);
    contextParts.push(`[Tool: lookup_playbook(${JSON.stringify(args)})]\n${JSON.stringify(result, null, 2)}`);
  }

  // Tool 2: Query asset inventory for affected zones
  const affectedZones = [...new Set(events.map((e) => e.zone))];
  for (const zone of affectedZones.slice(0, 2)) {
    const args = { zone };
    const result = executeTool("query_asset_inventory", args);
    const record: ToolCallRecord = {
      id: uuid(),
      name: "query_asset_inventory",
      arguments: args,
      result,
      timestamp: new Date().toISOString(),
    };
    toolCalls.push(record);
    contextParts.push(`[Tool: query_asset_inventory(${JSON.stringify(args)})]\n${JSON.stringify(result, null, 2)}`);
  }

  // Tool 3: Check vulnerabilities for relevant device types
  if (hasCamera) {
    const args = { device_type: "ip_camera", firmware_version: "1.2.3" };
    const result = executeTool("check_known_vulns", args);
    const record: ToolCallRecord = {
      id: uuid(),
      name: "check_known_vulns",
      arguments: args,
      result,
      timestamp: new Date().toISOString(),
    };
    toolCalls.push(record);
    contextParts.push(`[Tool: check_known_vulns(${JSON.stringify(args)})]\n${JSON.stringify(result, null, 2)}`);
  }

  if (hasNetwork) {
    const args = { device_type: "network_switch" };
    const result = executeTool("check_known_vulns", args);
    const record: ToolCallRecord = {
      id: uuid(),
      name: "check_known_vulns",
      arguments: args,
      result,
      timestamp: new Date().toISOString(),
    };
    toolCalls.push(record);
    contextParts.push(`[Tool: check_known_vulns(${JSON.stringify(args)})]\n${JSON.stringify(result, null, 2)}`);
  }

  // Tool 4: Draft alert message
  {
    const affectedDevices = [...new Set(events.map((e) => e.device_id))];
    const args = {
      audience: "security_team",
      severity: "critical",
      incident_summary: `Suspicious activity detected across ${affectedZones.join(", ")} involving ${affectedDevices.length} device(s). Immediate investigation required.`,
      recommended_actions: ["Isolate affected devices", "Review access logs", "Alert on-call SOC analyst"],
    };
    const result = executeTool("draft_alert_message", args);
    const record: ToolCallRecord = {
      id: uuid(),
      name: "draft_alert_message",
      arguments: args,
      result,
      timestamp: new Date().toISOString(),
    };
    toolCalls.push(record);
    contextParts.push(`[Tool: draft_alert_message(${JSON.stringify(args)})]\n${JSON.stringify(result, null, 2)}`);
  }

  // Tool 5: Simulate primary containment action
  {
    const primaryDevice = events.find((e) =>
      ["network_spike", "data_transfer", "unknown_device", "camera_offline"].includes(e.type)
    )?.device_id || events[0]?.device_id || "unknown";

    const args = {
      action: hasNetwork ? "isolate_device" : hasAccess ? "revoke_badge" : "shutdown_hvac",
      target: primaryDevice,
      incident_context: `${category} incident in ${affectedZones.join(", ")}`,
    };
    const result = executeTool("simulate_containment_action", args);
    const record: ToolCallRecord = {
      id: uuid(),
      name: "simulate_containment_action",
      arguments: args,
      result,
      timestamp: new Date().toISOString(),
    };
    toolCalls.push(record);
    contextParts.push(`[Tool: simulate_containment_action(${JSON.stringify(args)})]\n${JSON.stringify(result, null, 2)}`);
  }

  return { toolCalls, context: contextParts.join("\n\n") };
}

export async function analyzeEvents(
  events: TelemetryEvent[]
): Promise<AnalysisResult> {
  const client = getASIClient();
  const rawResponses: string[] = [];

  // Phase 1: Run specialist agents in parallel
  const [cyberAnalysis, safetyAnalysis] = await Promise.all([
    runSpecialistAgent("cyber_analyst", events),
    runSpecialistAgent("facility_safety", events),
  ]);

  // Phase 2: Incident Commander synthesizes findings
  const commanderContext = `Cyber Analyst findings:\n${cyberAnalysis.analysis}\n\nFacility Safety findings:\n${safetyAnalysis.analysis}`;
  const commanderAnalysis = await runSpecialistAgent(
    "incident_commander",
    events,
    commanderContext
  );

  const agentContributions = [cyberAnalysis, safetyAnalysis, commanderAnalysis];

  // Phase 3: Pre-run tools (ASI-1 doesn't support native tool calling)
  const { toolCalls, context: toolContext } = preRunTools(events);

  // Phase 4: Final structured analysis with all context injected
  const systemPrompt = `You are SentinelMesh, an AI-powered cyber-physical defense system. You have analyzed telemetry events using specialist agents and security tools. Produce a precise, structured JSON incident report.

IMPORTANT: Respond ONLY with a valid JSON object. Do not include markdown code fences or any text outside the JSON.`;

  const userPrompt = `Telemetry events:
${JSON.stringify(events, null, 2)}

Specialist agent analysis:
[Cyber Analyst]: ${cyberAnalysis.analysis}

[Facility Safety]: ${safetyAnalysis.analysis}

[Incident Commander]: ${commanderAnalysis.analysis}

Tool intelligence gathered:
${toolContext}

Based on all the above, produce a structured incident analysis as a JSON object with exactly these fields:
{
  "incident_id": "INC-XXXXXX",
  "timestamp": "<ISO 8601>",
  "severity": "critical" | "high" | "medium" | "low",
  "category": "data_exfiltration" | "unauthorized_access" | "environmental_hazard" | "network_intrusion" | "physical_breach" | "multi_vector",
  "title": "<concise incident title>",
  "summary": "<2-3 sentence summary of what happened>",
  "probable_root_cause": "<single sentence root cause>",
  "evidence": [
    { "source": "<device_id>", "event_type": "<type>", "timestamp": "<ISO>", "detail": "<what it shows>", "relevance": "primary" | "supporting" | "contextual" }
  ],
  "affected_assets": ["<device_id>", ...],
  "confidence": <0.0-1.0>,
  "immediate_actions": [
    { "action": "<action description>", "target": "<device/zone/person>", "urgency": "immediate" | "within_1h" | "within_4h", "estimated_impact": "<what this achieves>" }
  ],
  "escalation_path": ["<role1>", "<role2>", ...],
  "business_or_safety_impact": "<impact statement>",
  "alternative_hypotheses": ["<alt explanation if any>"]
}`;

  const response = await client.chat.completions.create({
    model: ASI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content || "";
  rawResponses.push(content);

  const incident = parseIncidentFromResponse(content, events);

  return {
    incident,
    toolCalls,
    agentContributions,
    rawResponses,
  };
}

function parseIncidentFromResponse(
  content: string,
  events: TelemetryEvent[]
): IncidentAnalysis {
  // Strip markdown fences if present
  const stripped = content
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/```\s*$/m, "")
    .trim();

  try {
    const parsed = JSON.parse(stripped);
    if (parsed.incident_id) return parsed as IncidentAnalysis;
  } catch {
    // Try to find JSON in the content
  }

  const braceStart = content.indexOf("{");
  const braceEnd = content.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd > braceStart) {
    try {
      const parsed = JSON.parse(content.slice(braceStart, braceEnd + 1));
      if (parsed.incident_id) return parsed as IncidentAnalysis;
    } catch {
      // Fall through to fallback
    }
  }

  return buildFallbackIncident(events);
}

function buildFallbackIncident(events: TelemetryEvent[]): IncidentAnalysis {
  const hasNetworkEvents = events.some((e) =>
    ["network_spike", "data_transfer", "unknown_device"].includes(e.type)
  );
  const hasAccessEvents = events.some((e) =>
    ["badge_swipe", "badge_denied", "failed_login"].includes(e.type)
  );
  const hasEnvEvents = events.some((e) =>
    ["temperature", "humidity", "smoke_alert", "power_anomaly"].includes(e.type)
  );

  let category: IncidentAnalysis["category"] = "multi_vector";
  if (hasNetworkEvents && !hasEnvEvents) category = "data_exfiltration";
  else if (hasAccessEvents && !hasNetworkEvents) category = "unauthorized_access";
  else if (hasEnvEvents && !hasNetworkEvents) category = "environmental_hazard";

  const zones = [...new Set(events.map((e) => e.zone))];
  const devices = [...new Set(events.map((e) => e.device_id))];

  return {
    incident_id: `INC-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    severity: "high",
    category,
    title: "Multi-signal incident detected",
    summary: `Correlated ${events.length} events across ${zones.length} zones involving ${devices.length} devices.`,
    probable_root_cause: "Multiple anomalous signals detected requiring further investigation.",
    evidence: events.slice(0, 5).map((e) => ({
      source: e.device_id,
      event_type: e.type,
      timestamp: e.timestamp,
      detail: `${e.type} event: ${JSON.stringify(e.value)} in ${e.zone}`,
      relevance: "primary" as const,
    })),
    affected_assets: devices,
    confidence: 0.6,
    immediate_actions: [
      {
        action: "Investigate correlated events",
        target: zones.join(", "),
        urgency: "immediate",
        estimated_impact: "Required to determine incident scope",
      },
    ],
    escalation_path: ["SOC Analyst", "Security Manager", "CISO"],
    business_or_safety_impact: "Impact assessment pending full analysis.",
    alternative_hypotheses: [],
  };
}

const SIMULATION_PRESETS: Record<string, { risk_after: number; timeline: string; consequences: string[]; recommendation: string }> = {
  isolate_device:    { risk_after: 18, timeline: "2–5 minutes", consequences: ["Network threat neutralised", "Device quarantined", "Lateral movement stopped", "Exfiltration channel severed"], recommendation: "Execute immediately — highest risk reduction with minimal downtime." },
  revoke_badge:      { risk_after: 35, timeline: "Immediate",   consequences: ["Physical access revoked", "Insider threat contained", "Audit trail preserved", "Backup credentials may still exist"], recommendation: "Proceed — essential for physical containment." },
  delay_containment: { risk_after: 88, timeline: "30+ minutes", consequences: ["Additional data at risk", "Attacker gains persistence", "Forensic window closing", "Regulatory exposure increases"], recommendation: "Not recommended — delay compounds damage significantly." },
  ignore_event:      { risk_after: 96, timeline: "Ongoing",     consequences: ["Full compromise likely", "All data at risk", "No forensic evidence collected", "Regulatory violations probable"], recommendation: "Do not ignore — treat as active breach." },
};

export async function simulateCounterfactual(
  incident: IncidentAnalysis,
  action: string,
  target: string
): Promise<{
  action: string;
  risk_before: number;
  risk_after: number;
  timeline: string;
  consequences: string[];
  recommendation: string;
}> {
  const riskBefore = Math.round((incident.confidence ?? 0.85) * 100);

  // Try live ASI-1 first, fall back to presets if it fails
  try {
    const client = getASIClient();
    const response = await client.chat.completions.create({
      model: ASI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a risk simulation engine. Given an incident and a proposed containment action, project the outcome. Respond with ONLY a JSON object (no markdown fences) with these fields:
- action (string): the action being evaluated
- risk_before (number 0-100): current risk level
- risk_after (number 0-100): projected risk after action
- timeline (string): expected time to see effect
- consequences (string[]): list of 3-4 projected consequences
- recommendation (string): whether to proceed and why`,
        },
        {
          role: "user",
          content: `Incident: ${JSON.stringify(incident)}\n\nProposed action: ${action}\nTarget: ${target}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || "";
    const stripped = content.replace(/^```(?:json)?\s*/m, "").replace(/```\s*$/m, "").trim();
    try { return JSON.parse(stripped); } catch { /* fall through */ }
    const braceStart = content.indexOf("{");
    const braceEnd = content.lastIndexOf("}");
    if (braceStart !== -1 && braceEnd > braceStart) {
      try { return JSON.parse(content.slice(braceStart, braceEnd + 1)); } catch { /* fall through */ }
    }
  } catch {
    // ASI-1 unavailable — use presets below
  }

  // Pre-computed realistic simulation results
  const preset = SIMULATION_PRESETS[action] ?? {
    risk_after: 50,
    timeline: "5–15 minutes",
    consequences: ["Risk partially mitigated", "Monitoring recommended", "Follow-up assessment required"],
    recommendation: "Proceed with caution.",
  };

  return { action, risk_before: riskBefore, ...preset };
}
