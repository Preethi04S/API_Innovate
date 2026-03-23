import OpenAI from "openai";

export const TOOL_DEFINITIONS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "lookup_playbook",
      description:
        "Look up the standard response playbook for a given incident category. Returns step-by-step procedures, responsible parties, and escalation criteria.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "The incident category to look up (e.g., 'data_exfiltration', 'environmental_hazard')",
          },
          severity: {
            type: "string",
            enum: ["critical", "high", "medium", "low"],
            description: "Severity level to scope the playbook",
          },
        },
        required: ["category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_asset_inventory",
      description:
        "Query the facility's asset inventory to find devices, their locations, firmware versions, network configuration, and current status.",
      parameters: {
        type: "object",
        properties: {
          zone: {
            type: "string",
            description: "Filter by facility zone (e.g., 'server_room', 'lab_1')",
          },
          asset_type: {
            type: "string",
            enum: ["sensor", "camera", "access_control", "network", "hvac", "server"],
            description: "Filter by asset type",
          },
          asset_id: {
            type: "string",
            description: "Look up a specific asset by ID",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_known_vulns",
      description:
        "Check for known vulnerabilities affecting a specific device or firmware version. Returns CVEs, risk ratings, and recommended mitigations.",
      parameters: {
        type: "object",
        properties: {
          device_type: {
            type: "string",
            description: "Type of device (e.g., 'ip_camera', 'network_switch', 'hvac_controller')",
          },
          firmware_version: {
            type: "string",
            description: "Firmware version to check",
          },
          vendor: {
            type: "string",
            description: "Device vendor/manufacturer",
          },
        },
        required: ["device_type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "draft_alert_message",
      description:
        "Draft an alert notification message suitable for sending to the security team, facility management, or executive stakeholders.",
      parameters: {
        type: "object",
        properties: {
          audience: {
            type: "string",
            enum: ["security_team", "facility_management", "executive", "all_staff"],
            description: "Target audience for the alert",
          },
          severity: {
            type: "string",
            enum: ["critical", "high", "medium", "low"],
          },
          incident_summary: {
            type: "string",
            description: "Brief summary of the incident",
          },
          recommended_actions: {
            type: "array",
            items: { type: "string" },
            description: "List of recommended immediate actions",
          },
        },
        required: ["audience", "severity", "incident_summary"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "simulate_containment_action",
      description:
        "Simulate the projected outcome of a containment action to estimate risk reduction, potential side effects, and time to resolution.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            description: "The containment action to simulate (e.g., 'isolate_device', 'revoke_badge', 'shutdown_hvac')",
          },
          target: {
            type: "string",
            description: "The target of the action (device ID, badge ID, zone, etc.)",
          },
          incident_context: {
            type: "string",
            description: "Brief context about the current incident",
          },
        },
        required: ["action", "target"],
      },
    },
  },
];
