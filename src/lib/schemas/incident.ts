export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type IncidentCategory =
  | "unauthorized_access"
  | "data_exfiltration"
  | "environmental_hazard"
  | "equipment_failure"
  | "network_intrusion"
  | "physical_breach"
  | "policy_violation"
  | "multi_vector";

export interface Evidence {
  source: string;
  event_type: string;
  timestamp: string;
  detail: string;
  relevance: "primary" | "supporting" | "contextual";
}

export interface ContainmentAction {
  action: string;
  target: string;
  urgency: "immediate" | "short_term" | "scheduled";
  estimated_impact: string;
}

export interface AlternativeHypothesis {
  hypothesis: string;
  confidence: number;
  supporting_evidence: string[];
  contradicting_evidence: string[];
}

export interface IncidentAnalysis {
  incident_id: string;
  timestamp: string;
  severity: Severity;
  category: IncidentCategory;
  title: string;
  summary: string;
  probable_root_cause: string;
  evidence: Evidence[];
  affected_assets: string[];
  confidence: number;
  immediate_actions: ContainmentAction[];
  escalation_path: string[];
  business_or_safety_impact: string;
  alternative_hypotheses: AlternativeHypothesis[];
}

export const INCIDENT_SCHEMA = {
  type: "object" as const,
  properties: {
    incident_id: { type: "string" as const },
    timestamp: { type: "string" as const },
    severity: {
      type: "string" as const,
      enum: ["critical", "high", "medium", "low", "info"],
    },
    category: {
      type: "string" as const,
      enum: [
        "unauthorized_access",
        "data_exfiltration",
        "environmental_hazard",
        "equipment_failure",
        "network_intrusion",
        "physical_breach",
        "policy_violation",
        "multi_vector",
      ],
    },
    title: { type: "string" as const },
    summary: { type: "string" as const },
    probable_root_cause: { type: "string" as const },
    evidence: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          source: { type: "string" as const },
          event_type: { type: "string" as const },
          timestamp: { type: "string" as const },
          detail: { type: "string" as const },
          relevance: {
            type: "string" as const,
            enum: ["primary", "supporting", "contextual"],
          },
        },
        required: ["source", "event_type", "timestamp", "detail", "relevance"],
      },
    },
    affected_assets: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    confidence: { type: "number" as const, minimum: 0, maximum: 1 },
    immediate_actions: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          action: { type: "string" as const },
          target: { type: "string" as const },
          urgency: {
            type: "string" as const,
            enum: ["immediate", "short_term", "scheduled"],
          },
          estimated_impact: { type: "string" as const },
        },
        required: ["action", "target", "urgency", "estimated_impact"],
      },
    },
    escalation_path: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    business_or_safety_impact: { type: "string" as const },
    alternative_hypotheses: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          hypothesis: { type: "string" as const },
          confidence: { type: "number" as const },
          supporting_evidence: {
            type: "array" as const,
            items: { type: "string" as const },
          },
          contradicting_evidence: {
            type: "array" as const,
            items: { type: "string" as const },
          },
        },
        required: [
          "hypothesis",
          "confidence",
          "supporting_evidence",
          "contradicting_evidence",
        ],
      },
    },
  },
  required: [
    "incident_id",
    "timestamp",
    "severity",
    "category",
    "title",
    "summary",
    "probable_root_cause",
    "evidence",
    "affected_assets",
    "confidence",
    "immediate_actions",
    "escalation_path",
    "business_or_safety_impact",
    "alternative_hypotheses",
  ],
};
