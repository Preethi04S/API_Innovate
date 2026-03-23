import { Asset } from "@/lib/schemas/events";

export const FACILITY_ASSETS: Asset[] = [
  // Server Room
  { id: "temp-sr-01", name: "Server Room Temp Sensor", type: "sensor", zone: "server_room", status: "online" },
  { id: "hum-sr-01", name: "Server Room Humidity Sensor", type: "sensor", zone: "server_room", status: "online" },
  { id: "cam-sr-01", name: "Server Room Camera", type: "camera", zone: "server_room", status: "online", ip: "10.0.1.10" },
  { id: "ac-sr-01", name: "Server Room Access Panel", type: "access_control", zone: "server_room", status: "online" },
  { id: "hvac-sr-01", name: "Server Room HVAC", type: "hvac", zone: "server_room", status: "online" },
  { id: "srv-01", name: "Primary App Server", type: "server", zone: "server_room", status: "online", ip: "10.0.1.100" },
  { id: "srv-02", name: "Database Server", type: "server", zone: "server_room", status: "online", ip: "10.0.1.101" },

  // Lobby
  { id: "cam-lb-01", name: "Lobby Camera", type: "camera", zone: "lobby", status: "online", ip: "10.0.2.10" },
  { id: "ac-lb-01", name: "Main Entrance Access", type: "access_control", zone: "lobby", status: "online" },
  { id: "mot-lb-01", name: "Lobby Motion Sensor", type: "sensor", zone: "lobby", status: "online" },

  // Lab 1
  { id: "cam-l1-01", name: "Lab 1 Camera", type: "camera", zone: "lab_1", status: "online", ip: "10.0.3.10" },
  { id: "ac-l1-01", name: "Lab 1 Door Control", type: "access_control", zone: "lab_1", status: "online" },
  { id: "net-l1-01", name: "Lab 1 Switch", type: "network", zone: "lab_1", status: "online", ip: "10.0.3.1" },

  // Lab 2
  { id: "cam-l2-01", name: "Lab 2 Camera", type: "camera", zone: "lab_2", status: "online", ip: "10.0.4.10" },
  { id: "ac-l2-01", name: "Lab 2 Door Control", type: "access_control", zone: "lab_2", status: "online" },

  // Cold Storage
  { id: "temp-cs-01", name: "Cold Storage Temp Sensor A", type: "sensor", zone: "cold_storage", status: "online" },
  { id: "temp-cs-02", name: "Cold Storage Temp Sensor B", type: "sensor", zone: "cold_storage", status: "online" },
  { id: "hum-cs-01", name: "Cold Storage Humidity Sensor", type: "sensor", zone: "cold_storage", status: "online" },
  { id: "ac-cs-01", name: "Cold Storage Access Panel", type: "access_control", zone: "cold_storage", status: "online" },
  { id: "cam-cs-01", name: "Cold Storage Camera", type: "camera", zone: "cold_storage", status: "online", ip: "10.0.5.10" },

  // Office Wing
  { id: "cam-ow-01", name: "Office Wing Camera", type: "camera", zone: "office_wing", status: "online", ip: "10.0.6.10" },
  { id: "ac-ow-01", name: "Office Wing Access", type: "access_control", zone: "office_wing", status: "online" },
  { id: "net-ow-01", name: "Office Switch", type: "network", zone: "office_wing", status: "online", ip: "10.0.6.1" },

  // Parking Garage
  { id: "cam-pg-01", name: "Parking Camera", type: "camera", zone: "parking_garage", status: "online", ip: "10.0.7.10" },
  { id: "mot-pg-01", name: "Parking Motion Sensor", type: "sensor", zone: "parking_garage", status: "online" },
];
