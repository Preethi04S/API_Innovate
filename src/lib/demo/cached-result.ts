import { IncidentAnalysis } from "@/lib/schemas/incident";
import { ToolCallRecord } from "@/lib/tools/executor";
import { AgentContribution } from "@/lib/asi/analyze";

const NOW = new Date("2026-03-23T09:15:00Z").toISOString();
const T = (minAgo: number) => new Date(Date.parse(NOW) - minAgo * 60000).toISOString();

export const DEMO_INCIDENT: IncidentAnalysis = {
  incident_id: "INC-2026-0323-001",
  timestamp: NOW,
  severity: "critical",
  category: "multi_vector",
  title: "Coordinated Physical-Cyber Breach: Rogue IoT Device with Active Data Exfiltration in Lab 1",
  summary:
    "An unauthorized IoT device (MAC: aa:bb:cc:dd:ee:01, vendor unknown/spoofed) was physically connected to the Research Lab 1 network rack, injected malware into camera cam-l1-01 exploiting CVE-2024-3721, disabled surveillance, and exfiltrated 2.4 GB of sensitive research data to external IP 203.0.113.77 via encrypted TLS. Simultaneous off-hours motion detection and failed credential attacks confirm a premeditated, multi-stage intrusion by a skilled threat actor.",
  probable_root_cause:
    "Physical security bypass allowed an unauthorized individual to access the Research Lab 1 network rack and deploy a rogue IoT device with pre-loaded malware. The device exploited CVE-2024-3721 (CVSS 9.1) in camera firmware 1.2.3 to disable surveillance, establish a persistent foothold, and exfiltrate data via a TLS-encrypted covert channel to a known APT-linked IP range.",
  business_or_safety_impact:
    "CRITICAL dual impact: (1) 2.4 GB of potentially sensitive research data exfiltrated to a suspicious external destination; (2) Complete surveillance loss in Research Lab 1 creates a physical safety blindspot for personnel, hazardous materials, and equipment; (3) Potential regulatory compliance violations (data breach notification laws, NFPA 101) due to impaired safety monitoring systems.",
  evidence: [
    {
      source: "net-monitor-l1",
      event_type: "unknown_device",
      timestamp: T(62),
      detail: "Unknown device detected — MAC: aa:bb:cc:dd:ee:01, vendor: Unknown (likely spoofed), IP assigned: 10.0.1.99 via DHCP",
      relevance: "primary",
    },
    {
      source: "cam-l1-01",
      event_type: "usb_inserted",
      timestamp: T(61),
      detail: "USB mass storage device inserted into cam-l1-01 at 08:44:17 — potential malware staging or data exfiltration vector",
      relevance: "primary",
    },
    {
      source: "cam-l1-01",
      event_type: "camera_offline",
      timestamp: T(58),
      detail: "cam-l1-01 went offline unexpectedly — creates surveillance blackout in Research Lab 1, consistent with deliberate sabotage",
      relevance: "primary",
    },
    {
      source: "net-monitor-l1",
      event_type: "network_spike",
      timestamp: T(55),
      detail: "Outbound traffic spike to 203.0.113.77:443 — 4200 Mbps sustained over 8 minutes via TLS (encrypted exfiltration channel)",
      relevance: "primary",
    },
    {
      source: "net-monitor-l1",
      event_type: "data_transfer",
      timestamp: T(52),
      detail: "2.4 GB data transfer completed to external IP 203.0.113.77 — confirmed exfiltration; destination IP flagged in threat intelligence",
      relevance: "primary",
    },
    {
      source: "motion-sensor-l1",
      event_type: "motion_detected",
      timestamp: T(50),
      detail: "Motion detected in Research Lab 1 during exact camera blackout window — unauthorized physical presence confirmed",
      relevance: "supporting",
    },
    {
      source: "switch-mgmt",
      event_type: "failed_login",
      timestamp: T(48),
      detail: "3 failed admin login attempts on switch-mgmt from 10.0.3.55 — credential stuffing attack, possible privilege escalation attempt",
      relevance: "supporting",
    },
  ],
  affected_assets: ["cam-l1-01", "switch-l1-01", "net-monitor-l1", "Research Lab 1"],
  confidence: 0.96,
  immediate_actions: [
    {
      action: "Network isolate VLAN segment — quarantine all devices on 10.0.1.x",
      target: "switch-l1-01",
      urgency: "immediate",
      estimated_impact: "Stops active exfiltration and prevents lateral movement to other lab segments",
    },
    {
      action: "Block outbound traffic to 203.0.113.77 at perimeter firewall",
      target: "perimeter-fw-01",
      urgency: "immediate",
      estimated_impact: "Terminates the active TLS exfiltration channel immediately",
    },
    {
      action: "Revoke all active sessions and rotate credentials for Research Lab 1 systems",
      target: "Research Lab 1 — all systems",
      urgency: "immediate",
      estimated_impact: "Prevents attacker from re-establishing authenticated access",
    },
    {
      action: "Restore cam-l1-01 from clean firmware image (patch CVE-2024-3721)",
      target: "cam-l1-01",
      urgency: "short_term",
      estimated_impact: "Restores physical surveillance coverage and closes the primary exploitation vector",
    },
    {
      action: "Initiate forensic preservation — capture network logs, USB device, and endpoint memory",
      target: "Research Lab 1 — all endpoints",
      urgency: "short_term",
      estimated_impact: "Preserves legally admissible evidence chain for investigation and regulatory reporting",
    },
  ],
  escalation_path: ["CISO", "Facility Director", "Legal Counsel", "Executive Leadership"],
  alternative_hypotheses: [
    {
      hypothesis: "Insider threat — authorized employee conducting targeted data theft",
      confidence: 0.32,
      supporting_evidence: [
        "Physical access to restricted area required — badge or keys",
        "USB insertion requires hands-on presence",
        "Off-hours timing suggests knowledge of patrol schedules",
      ],
      contradicting_evidence: [
        "Spoofed MAC address indicates premeditated evasion beyond typical insider capability",
        "Failed login attempts suggest unfamiliarity with actual credentials",
      ],
    },
    {
      hypothesis: "Supply chain compromise — malware pre-installed on vendor IoT device",
      confidence: 0.22,
      supporting_evidence: [
        "Unknown vendor MAC address consistent with counterfeit hardware",
        "Pre-loaded malware on USB storage device",
      ],
      contradicting_evidence: [
        "Targeted exfiltration to known threat actor IP suggests active C2, not automated supply chain attack",
        "Credential stuffing indicates live operator involvement",
      ],
    },
  ],
};

export const DEMO_TOOL_CALLS: ToolCallRecord[] = [
  {
    tool: "lookup_playbook",
    input: { incident_type: "multi_vector", severity: "critical" },
    output: {
      playbook: "MULTI-VECTOR-CRITICAL-001",
      steps: [
        "Isolate affected network segment immediately",
        "Preserve forensic evidence before any remediation",
        "Notify CISO and initiate IR team activation",
        "Block known C2 IPs at perimeter",
        "Conduct parallel physical and digital investigation",
      ],
      escalation_sla: "15 minutes to CISO notification",
    },
  },
  {
    tool: "query_asset_inventory",
    input: { asset_ids: ["cam-l1-01", "switch-l1-01", "net-monitor-l1"] },
    output: {
      assets: [
        { id: "cam-l1-01", name: "Lab 1 Camera", zone: "Research Lab 1", firmware: "1.2.3", cves: ["CVE-2024-3721"], criticality: "high" },
        { id: "switch-l1-01", name: "Lab 1 Switch", zone: "Research Lab 1", firmware: "IOS-15.2", cves: [], criticality: "critical" },
        { id: "net-monitor-l1", name: "Lab 1 Network Monitor", zone: "Research Lab 1", firmware: "3.1.0", cves: [], criticality: "medium" },
      ],
    },
  },
  {
    tool: "check_known_vulns",
    input: { asset_id: "cam-l1-01", firmware_version: "1.2.3" },
    output: {
      vulnerabilities: [
        {
          cve: "CVE-2024-3721",
          cvss: 9.1,
          description: "Remote code execution via crafted USB firmware update — allows attacker to gain root shell and disable surveillance",
          patch_available: true,
          patch_version: "1.3.0",
        },
      ],
    },
  },
  {
    tool: "draft_alert_message",
    input: { severity: "critical", incident_type: "multi_vector", affected_zones: ["Research Lab 1"] },
    output: {
      message: "CRITICAL SECURITY ALERT: Coordinated cyber-physical breach detected in Research Lab 1. Active data exfiltration in progress. Network segment isolation required immediately. All personnel: do not access Research Lab 1 until cleared by Security.",
      recipients: ["CISO", "Facility Director", "Security Operations", "Executive Leadership"],
    },
  },
  {
    tool: "simulate_containment_action",
    input: { action: "isolate_device", target: "switch-l1-01", incident_id: "INC-2026-0323-001" },
    output: {
      success: true,
      estimated_risk_reduction: 0.72,
      side_effects: ["Research Lab 1 loses network connectivity temporarily", "Remote monitoring disabled for isolated segment"],
      estimated_duration: "2-4 hours for full remediation",
    },
  },
];

export const DEMO_AGENT_CONTRIBUTIONS: AgentContribution[] = [
  {
    agent: "cyber_analyst",
    role: "Cyber Analyst",
    analysis:
      "THREAT LEVEL CRITICAL — Active Data Exfiltration Confirmed.\n\nKey Technical Findings:\n\nUnknown Device (08:44:12): MAC aa:bb:cc:dd:ee:01 — vendor field spoofed using OUI randomization, classic IoT attack staging technique. IP 10.0.1.99 obtained via DHCP within 30 seconds of connection.\n\nUSB Insertion (08:44:17): Five seconds after network registration — consistent with automated malware payload delivery. CVE-2024-3721 in firmware 1.2.3 allows root shell via crafted USB update.\n\nCamera Offline (08:44:31): Deliberate sabotage — surveillance blackout provides operational cover for physical intrusion and data staging.\n\nNetwork Spike to 203.0.113.77 (4200 Mbps via TLS 443): Destination IP flagged in threat intelligence as APT-29 affiliated infrastructure. Encrypted channel evades DLP inspection.\n\nData Transfer Complete (2.4 GB): Transfer duration approximately 4.8 minutes at observed bandwidth — consistent with targeted file exfiltration rather than indiscriminate copying.\n\nCredential Attacks (08:45:12): 3 failed attempts on switch-mgmt from 10.0.3.55 — lateral movement attempt, attacker seeking network control.\n\nCorrelation Assessment: All 7 events form a coherent, sequential kill chain with <30 second gaps between stages, indicating a scripted attack with live operator oversight. Confidence: 96%.",
    recommendations: [
      "Immediately isolate VLAN segment — quarantine all devices on 10.0.1.x subnet",
      "Block 203.0.113.77 and full /24 subnet at perimeter firewall — APT-affiliated IP range",
      "Initiate full packet capture for forensic analysis — preserve evidence before device reboot",
      "Deploy threat hunting rules for CVE-2024-3721 exploitation indicators across all camera assets",
    ],
  },
  {
    agent: "facility_safety",
    role: "Facility Safety",
    analysis:
      "PHYSICAL SECURITY BREACH — Research Lab 1 Compromised.\n\nSurveillance Blackout Analysis: cam-l1-01 offline from 08:44:31 creates a complete physical security blindspot in Research Lab 1. The 14-minute blackout window coincides precisely with the network exfiltration and motion detection events — this is not a coincidence.\n\nPhysical Presence Confirmed: Motion detected at 08:45:50 during the exact camera blackout window. The attacker was physically present in Research Lab 1 during active exfiltration, suggesting data staging from local storage rather than remote-only operation.\n\nAccess Control Implications: Network rack access in Research Lab 1 requires physical access past badge-controlled entry. Either (a) badge credentials were compromised, (b) tailgating occurred, or (c) an insider provided access. Badge audit logs are critical.\n\nSafety Risk Assessment: Research Lab 1 contains sensitive research equipment and materials. Unauthorized physical access during surveillance blackout creates contamination risk and potential regulatory violations under applicable biosafety and laboratory safety protocols.\n\nFacility Damage Assessment: No environmental hazards detected (temperature/humidity nominal). Primary concern is surveillance integrity and physical evidence preservation.",
    recommendations: [
      "Lock down physical access to Research Lab 1 — require dual-factor badge entry effective immediately",
      "Audit all badge access logs for Research Lab 1 in past 72 hours — identify tailgating or unauthorized entry",
      "Activate backup camera coverage from adjacent hallway cameras (cam-corridor-01, cam-corridor-02)",
      "Notify Facility Security Officer and initiate physical walkthrough with security personnel",
    ],
  },
  {
    agent: "incident_commander",
    role: "Incident Commander",
    analysis:
      "COORDINATED MULTI-VECTOR ATTACK — EXECUTIVE BRIEFING REQUIRED.\n\nThis incident represents a sophisticated, premeditated attack combining physical infiltration with advanced cyber exploitation techniques. Threat actor assessment: APT-level capability based on (1) Pre-staged rogue hardware with spoofed MAC, (2) Zero-second delay exploitation of known CVE, (3) Encrypted exfiltration to APT-linked infrastructure, (4) Active operator involvement evidenced by real-time credential attacks during exfiltration.\n\nPriority Sequencing: (1) STOP THE BLEEDING — exfiltration may still be active if firewall block not yet deployed, (2) PRESERVE EVIDENCE — forensic integrity before any system changes, (3) CONTAIN SPREAD — audit all adjacent network segments for lateral movement indicators.\n\nBusiness Risk Matrix: Data breach likely constitutes a reportable incident. Legal counsel notification recommended within 72 hours. Executive team should be briefed on potential PR and regulatory exposure within 1 hour.\n\nThe 96% confidence rating reflects an exceptionally coherent attack signature with clear attribution indicators. This is not a false positive.",
    recommendations: [
      "Activate Incident Response Plan immediately — declare P0 security incident and assemble IR team",
      "Brief CISO and executive team within 30 minutes with this incident summary",
      "Engage external digital forensics firm — preserve chain of custody for potential legal proceedings",
      "Prepare regulatory breach notification — 72-hour reporting window may apply under applicable laws",
    ],
  },
];
