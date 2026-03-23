export type EventType =
  | "temperature"
  | "humidity"
  | "motion"
  | "door_open"
  | "door_close"
  | "power_anomaly"
  | "smoke_alert"
  | "badge_swipe"
  | "failed_login"
  | "unknown_device"
  | "network_spike"
  | "badge_denied"
  | "camera_offline"
  | "usb_insert"
  | "data_transfer";

export type Zone =
  | "server_room"
  | "lobby"
  | "lab_1"
  | "lab_2"
  | "cold_storage"
  | "office_wing"
  | "parking_garage"
  | "rooftop"
  | "corridor_a"
  | "corridor_b";

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: EventType;
  zone: Zone;
  device_id: string;
  value: number | string | boolean;
  unit?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface Asset {
  id: string;
  name: string;
  type: "sensor" | "camera" | "access_control" | "network" | "hvac" | "server";
  zone: Zone;
  status: "online" | "offline" | "warning" | "critical";
  ip?: string;
  firmware?: string;
}

export const ZONE_LABELS: Record<Zone, string> = {
  server_room: "Server Room",
  lobby: "Main Lobby",
  lab_1: "Research Lab 1",
  lab_2: "Research Lab 2",
  cold_storage: "Cold Storage",
  office_wing: "Office Wing",
  parking_garage: "Parking Garage",
  rooftop: "Rooftop",
  corridor_a: "Corridor A",
  corridor_b: "Corridor B",
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  temperature: "Temperature Reading",
  humidity: "Humidity Reading",
  motion: "Motion Detected",
  door_open: "Door Opened",
  door_close: "Door Closed",
  power_anomaly: "Power Anomaly",
  smoke_alert: "Smoke Alert",
  badge_swipe: "Badge Swipe",
  failed_login: "Failed Login",
  unknown_device: "Unknown Device",
  network_spike: "Network Spike",
  badge_denied: "Badge Denied",
  camera_offline: "Camera Offline",
  usb_insert: "USB Inserted",
  data_transfer: "Data Transfer",
};
