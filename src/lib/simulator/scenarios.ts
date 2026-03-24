import { TelemetryEvent } from "@/lib/schemas/events";
import { v4 as uuid } from "uuid";

export interface Scenario {
  id: string;
  name: string;
  description: string;
  expectedSeverity: "critical" | "high" | "medium";
  events: TelemetryEvent[];
}

function ts(baseTime: Date, offsetSeconds: number): string {
  return new Date(baseTime.getTime() + offsetSeconds * 1000).toISOString();
}

export function buildScenarios(baseTime: Date = new Date()): Scenario[] {
  return [
    buildRogueCameraExfiltration(baseTime),
    buildServerRoomOverheat(baseTime),
    buildSmartLockAbuse(baseTime),
    buildColdStorageDrift(baseTime),
  ];
}

function buildRogueCameraExfiltration(base: Date): Scenario {
  return {
    id: "scenario-rogue-camera",
    name: "Rogue IoT Camera — Active Data Exfiltration",
    description:
      "A compromised IoT camera in Lab 1 receives a malicious firmware update via USB, silently drops off the camera feed, then establishes an encrypted TLS tunnel to an external C2 server at 203.0.113.77. Over 2.4 GB of data is exfiltrated in under 60 seconds — 35x above the network baseline. Correlated with an unrecognized MAC address joining the segment and three failed admin login attempts on the managed switch.",
    expectedSeverity: "critical",
    events: [
      {
        id: uuid(), timestamp: ts(base, 0), type: "unknown_device",
        zone: "lab_1", device_id: "net-l1-01", value: "MAC: aa:bb:cc:dd:ee:01",
        metadata: { mac: "aa:bb:cc:dd:ee:01", vendor: "Unknown" },
      },
      {
        id: uuid(), timestamp: ts(base, 5), type: "usb_insert",
        zone: "lab_1", device_id: "cam-l1-01", value: "USB mass storage connected",
        metadata: { usb_class: "mass_storage" },
      },
      {
        id: uuid(), timestamp: ts(base, 15), type: "camera_offline",
        zone: "lab_1", device_id: "cam-l1-01", value: true,
        metadata: { last_firmware: "1.2.3", reason: "firmware_update_in_progress" },
      },
      {
        id: uuid(), timestamp: ts(base, 45), type: "network_spike",
        zone: "lab_1", device_id: "net-l1-01", value: 4200,
        unit: "Mbps", metadata: { baseline: "120", destination_ip: "203.0.113.77", protocol: "TLS" },
      },
      {
        id: uuid(), timestamp: ts(base, 50), type: "data_transfer",
        zone: "lab_1", device_id: "cam-l1-01", value: "2.4 GB",
        metadata: { destination: "203.0.113.77", port: "443", direction: "outbound" },
      },
      {
        id: uuid(), timestamp: ts(base, 55), type: "motion",
        zone: "lab_1", device_id: "mot-lb-01", value: true,
        metadata: { area: "near_network_rack" },
      },
      {
        id: uuid(), timestamp: ts(base, 60), type: "failed_login",
        zone: "lab_1", device_id: "net-l1-01", value: "admin",
        metadata: { attempts: "3", source_ip: "10.0.3.55", service: "switch_mgmt" },
      },
    ],
  };
}

function buildServerRoomOverheat(base: Date): Scenario {
  return {
    id: "scenario-server-overheating",
    name: "Server Room Meltdown — HVAC Failure & After-Hours Breach",
    description:
      "Cooling unit compressor failure causes server room temperature to spike from 24°C to 34°C in under 80 seconds — well past the 22°C operational threshold. Humidity simultaneously breaches 68%. Mid-crisis, a visitor-level badge (BADGE-0042) swipes into the restricted server room after hours and motion is detected near Rack Row 3. The convergence of physical and environmental failures suggests a deliberate sabotage attempt.",
    expectedSeverity: "critical",
    events: [
      {
        id: uuid(), timestamp: ts(base, 0), type: "temperature",
        zone: "server_room", device_id: "temp-sr-01", value: 24,
        unit: "°C", metadata: { threshold: "22" },
      },
      {
        id: uuid(), timestamp: ts(base, 30), type: "temperature",
        zone: "server_room", device_id: "temp-sr-01", value: 28,
        unit: "°C", metadata: { threshold: "22", trend: "rising" },
      },
      {
        id: uuid(), timestamp: ts(base, 45), type: "humidity",
        zone: "server_room", device_id: "hum-sr-01", value: 68,
        unit: "%", metadata: { threshold: "55" },
      },
      {
        id: uuid(), timestamp: ts(base, 50), type: "power_anomaly",
        zone: "server_room", device_id: "hvac-sr-01", value: "compressor_failure",
        metadata: { subsystem: "cooling_unit_a" },
      },
      {
        id: uuid(), timestamp: ts(base, 60), type: "temperature",
        zone: "server_room", device_id: "temp-sr-01", value: 34,
        unit: "°C", metadata: { threshold: "22", trend: "rising_fast" },
      },
      {
        id: uuid(), timestamp: ts(base, 70), type: "badge_swipe",
        zone: "server_room", device_id: "ac-sr-01", value: "BADGE-0042",
        metadata: { employee: "unknown", access_level: "visitor", time_context: "after_hours" },
      },
      {
        id: uuid(), timestamp: ts(base, 75), type: "door_open",
        zone: "server_room", device_id: "ac-sr-01", value: true,
      },
      {
        id: uuid(), timestamp: ts(base, 80), type: "motion",
        zone: "server_room", device_id: "cam-sr-01", value: true,
        metadata: { area: "rack_row_3" },
      },
    ],
  };
}

function buildSmartLockAbuse(base: Date): Scenario {
  return {
    id: "scenario-smart-lock-abuse",
    name: "Cloned Badge — Multi-Zone After-Hours Sweep",
    description:
      "Badge BADGE-0099 (assigned to J. Martinez) sweeps through the lobby, office wing, Lab 2, and parking garage in under 30 seconds — a physical impossibility for a single person walking. The badge is denied at the server room due to insufficient clearance, then immediately attempts 5 failed admin logins on Lab 2's camera system from IP 10.0.4.88. The pattern is consistent with a cloned credential used by an intruder conducting reconnaissance.",
    expectedSeverity: "high",
    events: [
      {
        id: uuid(), timestamp: ts(base, 0), type: "badge_swipe",
        zone: "lobby", device_id: "ac-lb-01", value: "BADGE-0099",
        metadata: { employee: "J. Martinez", access_level: "staff", time_context: "after_hours" },
      },
      {
        id: uuid(), timestamp: ts(base, 8), type: "badge_swipe",
        zone: "office_wing", device_id: "ac-ow-01", value: "BADGE-0099",
        metadata: { employee: "J. Martinez", time_context: "after_hours" },
      },
      {
        id: uuid(), timestamp: ts(base, 12), type: "badge_denied",
        zone: "server_room", device_id: "ac-sr-01", value: "BADGE-0099",
        metadata: { reason: "insufficient_clearance" },
      },
      {
        id: uuid(), timestamp: ts(base, 15), type: "badge_swipe",
        zone: "lab_2", device_id: "ac-l2-01", value: "BADGE-0099",
        metadata: { employee: "J. Martinez", time_context: "after_hours" },
      },
      {
        id: uuid(), timestamp: ts(base, 18), type: "door_open",
        zone: "lab_2", device_id: "ac-l2-01", value: true,
      },
      {
        id: uuid(), timestamp: ts(base, 20), type: "failed_login",
        zone: "lab_2", device_id: "cam-l2-01", value: "admin",
        metadata: { attempts: "5", source_ip: "10.0.4.88", service: "camera_admin" },
      },
      {
        id: uuid(), timestamp: ts(base, 25), type: "motion",
        zone: "lab_2", device_id: "cam-l2-01", value: true,
        metadata: { detected_persons: "1" },
      },
      {
        id: uuid(), timestamp: ts(base, 30), type: "badge_swipe",
        zone: "parking_garage", device_id: "cam-pg-01", value: "BADGE-0099",
        metadata: { employee: "J. Martinez", time_context: "after_hours", note: "exit_swipe" },
      },
    ],
  };
}

function buildColdStorageDrift(base: Date): Scenario {
  return {
    id: "scenario-cold-storage-drift",
    name: "Cold-Chain Compromise — Pharma Storage & Blind-Spot Intrusion",
    description:
      "Pharmaceutical cold-storage temperatures climb from -18°C to -8°C over 130 seconds, breaching the -20°C preservation threshold and risking spoilage of temperature-sensitive inventory. A temporary contractor badge (BADGE-TEMP-007) opens the unit mid-drift; humidity soars to 78% against a 40% limit. The surveillance camera then drops offline — eliminating the only visual record of who entered. A coordinated cover-up is suspected.",
    expectedSeverity: "high",
    events: [
      {
        id: uuid(), timestamp: ts(base, 0), type: "temperature",
        zone: "cold_storage", device_id: "temp-cs-01", value: -18,
        unit: "°C", metadata: { threshold: "-20", status: "normal" },
      },
      {
        id: uuid(), timestamp: ts(base, 60), type: "temperature",
        zone: "cold_storage", device_id: "temp-cs-01", value: -14,
        unit: "°C", metadata: { threshold: "-20", trend: "rising" },
      },
      {
        id: uuid(), timestamp: ts(base, 90), type: "temperature",
        zone: "cold_storage", device_id: "temp-cs-02", value: -15,
        unit: "°C", metadata: { threshold: "-20", trend: "rising" },
      },
      {
        id: uuid(), timestamp: ts(base, 95), type: "door_open",
        zone: "cold_storage", device_id: "ac-cs-01", value: true,
        metadata: { duration_open: "prolonged" },
      },
      {
        id: uuid(), timestamp: ts(base, 100), type: "badge_swipe",
        zone: "cold_storage", device_id: "ac-cs-01", value: "BADGE-TEMP-007",
        metadata: { employee: "unknown_contractor", access_level: "temporary" },
      },
      {
        id: uuid(), timestamp: ts(base, 110), type: "humidity",
        zone: "cold_storage", device_id: "hum-cs-01", value: 78,
        unit: "%", metadata: { threshold: "40" },
      },
      {
        id: uuid(), timestamp: ts(base, 120), type: "camera_offline",
        zone: "cold_storage", device_id: "cam-cs-01", value: true,
        metadata: { reason: "connection_lost" },
      },
      {
        id: uuid(), timestamp: ts(base, 130), type: "temperature",
        zone: "cold_storage", device_id: "temp-cs-01", value: -8,
        unit: "°C", metadata: { threshold: "-20", trend: "rising_fast", alarm: "active" },
      },
    ],
  };
}
