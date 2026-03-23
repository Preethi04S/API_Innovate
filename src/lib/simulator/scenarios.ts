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
    name: "Rogue IoT Camera Exfiltration",
    description:
      "An IoT camera in Lab 1 begins transferring large volumes of data to an external IP after a firmware anomaly. Correlated with a USB insertion event and unknown device on the network.",
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
    name: "Server Room Overheating + Unauthorized Access",
    description:
      "HVAC failure leads to rising server room temperatures while an unauthorized badge swipe grants access during off-hours.",
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
    name: "Smart-Lock Abuse After Badge Anomaly",
    description:
      "A cloned or stolen badge is used to access multiple zones in rapid succession during off-hours, triggering failed logins and multiple door events.",
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
    name: "Cold-Storage Temperature Drift + Suspicious Entry",
    description:
      "Clinic cold-storage temperatures rise above safe limits while an unauthorized individual accesses the area and the backup sensor goes offline.",
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
