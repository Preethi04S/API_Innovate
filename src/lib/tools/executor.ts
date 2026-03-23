import { FACILITY_ASSETS } from "@/lib/simulator/assets";
import { Asset } from "@/lib/schemas/events";

export interface ToolCallRecord {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result: unknown;
  timestamp: string;
}

type ToolHandler = (args: Record<string, unknown>) => unknown;

const PLAYBOOKS: Record<string, object> = {
  data_exfiltration: {
    title: "Data Exfiltration Response",
    steps: [
      "Isolate the suspected device from the network immediately",
      "Capture network traffic logs for the last 24 hours",
      "Identify the destination IP and determine if it is a known threat",
      "Preserve forensic evidence on the device",
      "Notify the CISO and legal team",
      "Initiate full network scan for lateral movement indicators",
    ],
    responsible: ["SOC Analyst", "Network Engineer", "CISO"],
    escalation: "If data volume exceeds 1 GB or destination is in a sanctioned country, escalate to legal and executive leadership within 1 hour.",
  },
  unauthorized_access: {
    title: "Unauthorized Access Response",
    steps: [
      "Revoke the badge or credential immediately",
      "Lock down the affected zone",
      "Review access logs for the last 48 hours",
      "Dispatch security personnel to the area",
      "Check for tailgating or cloned badge indicators",
      "Interview badge holder if identity is known",
    ],
    responsible: ["Security Operations", "Facility Manager", "HR"],
    escalation: "If the access was to a restricted zone (server room, lab), escalate to CISO within 30 minutes.",
  },
  environmental_hazard: {
    title: "Environmental Hazard Response",
    steps: [
      "Verify sensor readings with secondary sensors",
      "Activate backup environmental controls",
      "If temperature exceeds safe limits, initiate controlled shutdown of sensitive equipment",
      "Notify facility maintenance for immediate repair",
      "Evacuate personnel if smoke or chemical readings are detected",
      "Document timeline and readings for incident report",
    ],
    responsible: ["Facility Manager", "IT Operations", "Safety Officer"],
    escalation: "If temperature exceeds 40°C in server room or smoke is detected, evacuate and call fire department.",
  },
  network_intrusion: {
    title: "Network Intrusion Response",
    steps: [
      "Isolate affected network segment",
      "Block suspicious IP addresses at the firewall",
      "Capture and analyze network traffic",
      "Check for indicators of compromise across all endpoints",
      "Reset credentials for potentially compromised accounts",
      "Engage incident response retainer if needed",
    ],
    responsible: ["SOC Analyst", "Network Engineer", "CISO"],
    escalation: "If command-and-control traffic is confirmed, activate full incident response within 15 minutes.",
  },
  physical_breach: {
    title: "Physical Breach Response",
    steps: [
      "Dispatch security to the breached zone",
      "Lock all access points in the affected area",
      "Review camera footage from the last 2 hours",
      "Identify and detain the individual if possible",
      "Check for any removed or tampered equipment",
      "File a police report if warranted",
    ],
    responsible: ["Security Operations", "Facility Manager"],
    escalation: "If breach is to a restricted area, notify executive team immediately.",
  },
};

const KNOWN_VULNS: Record<string, object[]> = {
  ip_camera: [
    {
      cve: "CVE-2024-3721",
      severity: "critical",
      description: "Remote code execution via firmware update endpoint. Allows unauthenticated attackers to upload and execute arbitrary firmware.",
      affected_versions: ["1.0.0 - 1.3.5"],
      mitigation: "Update firmware to version 1.4.0 or later. Restrict management interface to VLAN.",
    },
    {
      cve: "CVE-2024-2198",
      severity: "high",
      description: "Default credentials allow administrative access. Many deployments ship with admin/admin.",
      affected_versions: ["all"],
      mitigation: "Change default credentials immediately. Enforce credential rotation policy.",
    },
  ],
  network_switch: [
    {
      cve: "CVE-2024-5501",
      severity: "high",
      description: "SNMP community string disclosure allows network reconnaissance.",
      affected_versions: ["2.x - 3.1"],
      mitigation: "Disable SNMPv1/v2. Use SNMPv3 with authentication.",
    },
  ],
  hvac_controller: [
    {
      cve: "CVE-2024-4102",
      severity: "medium",
      description: "BACnet service exposes device configuration without authentication.",
      affected_versions: ["all"],
      mitigation: "Segment HVAC network. Apply access controls to BACnet service.",
    },
  ],
};

function lookupPlaybook(args: Record<string, unknown>): unknown {
  const category = args.category as string;
  const playbook = PLAYBOOKS[category];
  if (playbook) return playbook;

  // Fall back to closest match
  const key = Object.keys(PLAYBOOKS).find((k) => category.includes(k));
  return key
    ? PLAYBOOKS[key]
    : { title: "General Incident Response", steps: ["Assess the situation", "Contain the threat", "Notify stakeholders", "Document findings"], responsible: ["SOC Analyst"], escalation: "Escalate based on severity." };
}

function queryAssetInventory(args: Record<string, unknown>): unknown {
  let assets: Asset[] = [...FACILITY_ASSETS];

  if (args.asset_id) {
    const asset = assets.find((a) => a.id === args.asset_id);
    return asset || { error: "Asset not found", asset_id: args.asset_id };
  }
  if (args.zone) {
    assets = assets.filter((a) => a.zone === args.zone);
  }
  if (args.asset_type) {
    assets = assets.filter((a) => a.type === args.asset_type);
  }
  return { count: assets.length, assets };
}

function checkKnownVulns(args: Record<string, unknown>): unknown {
  const deviceType = args.device_type as string;
  const vulns = KNOWN_VULNS[deviceType];
  if (!vulns) {
    return { device_type: deviceType, vulnerabilities: [], note: "No known vulnerabilities in database for this device type." };
  }

  let filtered = vulns;
  if (args.firmware_version) {
    // For demo, return all vulns for the type
    filtered = vulns;
  }

  return { device_type: deviceType, vulnerabilities: filtered, total: filtered.length };
}

function draftAlertMessage(args: Record<string, unknown>): unknown {
  const audience = args.audience as string;
  const severity = (args.severity as string || "high").toUpperCase();
  const summary = args.incident_summary as string;
  const actions = (args.recommended_actions as string[]) || [];

  const audienceLabels: Record<string, string> = {
    security_team: "Security Operations Center",
    facility_management: "Facility Management Team",
    executive: "Executive Leadership",
    all_staff: "All Staff",
  };

  return {
    to: audienceLabels[audience] || audience,
    subject: `[${severity}] Security Incident Alert`,
    body: `INCIDENT ALERT — SEVERITY: ${severity}\n\n${summary}\n\nRecommended Immediate Actions:\n${actions.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\nPlease acknowledge receipt and follow established protocols. This alert was generated by SentinelMesh automated incident response.`,
    priority: severity === "CRITICAL" ? "urgent" : "high",
  };
}

function simulateContainmentAction(args: Record<string, unknown>): unknown {
  const action = args.action as string;
  const target = args.target as string;

  const simulations: Record<string, object> = {
    isolate_device: {
      action: "isolate_device",
      target,
      projected_risk_reduction: "85%",
      time_to_effect: "< 30 seconds",
      side_effects: [
        "Device will be unreachable for legitimate users",
        "Any ongoing data collection from the device will stop",
        "Dependent automations may trigger fallback behavior",
      ],
      reversibility: "Fully reversible by removing network ACL",
      confidence: 0.9,
    },
    revoke_badge: {
      action: "revoke_badge",
      target,
      projected_risk_reduction: "70%",
      time_to_effect: "< 5 seconds",
      side_effects: [
        "Badge holder will be locked out of all zones",
        "If the badge holder is legitimate, they will need manual escort",
        "Audit log entry will be created",
      ],
      reversibility: "Reversible by security admin",
      confidence: 0.85,
    },
    shutdown_hvac: {
      action: "shutdown_hvac",
      target,
      projected_risk_reduction: "40%",
      time_to_effect: "1-2 minutes",
      side_effects: [
        "Temperature in affected zone will begin rising",
        "Equipment may need emergency cooling within 15 minutes",
        "Alert will be sent to facility maintenance",
      ],
      reversibility: "Reversible but requires physical restart",
      confidence: 0.75,
    },
    delay_containment: {
      action: "delay_containment",
      target,
      projected_risk_reduction: "0%",
      time_to_effect: "N/A",
      side_effects: [
        "Threat actor may escalate activity",
        "Additional data may be exfiltrated",
        "More assets may be compromised",
        "Evidence may be destroyed",
      ],
      reversibility: "N/A — inaction may cause irreversible damage",
      confidence: 0.95,
    },
    ignore_event: {
      action: "ignore_event",
      target,
      projected_risk_reduction: "-15%",
      time_to_effect: "N/A",
      side_effects: [
        "Risk level increases over time",
        "If this is a real incident, damage will compound",
        "Regulatory exposure if incident is later confirmed",
      ],
      reversibility: "Cannot undo damage from uncontained incident",
      confidence: 0.9,
    },
  };

  const result = simulations[action];
  if (result) return result;

  return {
    action,
    target,
    projected_risk_reduction: "60%",
    time_to_effect: "< 1 minute",
    side_effects: ["Standard containment side effects apply"],
    reversibility: "Dependent on action specifics",
    confidence: 0.7,
  };
}

const TOOL_HANDLERS: Record<string, ToolHandler> = {
  lookup_playbook: lookupPlaybook,
  query_asset_inventory: queryAssetInventory,
  check_known_vulns: checkKnownVulns,
  draft_alert_message: draftAlertMessage,
  simulate_containment_action: simulateContainmentAction,
};

export function executeTool(
  name: string,
  args: Record<string, unknown>
): unknown {
  const handler = TOOL_HANDLERS[name];
  if (!handler) {
    return { error: `Unknown tool: ${name}` };
  }
  return handler(args);
}

export function getAvailableToolNames(): string[] {
  return Object.keys(TOOL_HANDLERS);
}
