"use client";

import { TelemetryEvent, Zone, ZONE_LABELS } from "@/lib/schemas/events";
import { useMemo } from "react";

interface ZoneMapProps {
  events: TelemetryEvent[];
  affectedAssets?: string[];
}

interface ZoneConfig {
  id: Zone;
  x: number;
  y: number;
  w: number;
  h: number;
  floor: string;
}

const ZONES: ZoneConfig[] = [
  { id: "lobby", x: 10, y: 10, w: 180, h: 80, floor: "Ground" },
  { id: "office_wing", x: 200, y: 10, w: 160, h: 80, floor: "Ground" },
  { id: "corridor_a", x: 10, y: 100, w: 350, h: 30, floor: "Ground" },
  { id: "server_room", x: 10, y: 140, w: 120, h: 100, floor: "Ground" },
  { id: "lab_1", x: 140, y: 140, w: 110, h: 100, floor: "Ground" },
  { id: "lab_2", x: 260, y: 140, w: 100, h: 100, floor: "Ground" },
  { id: "corridor_b", x: 10, y: 250, w: 350, h: 30, floor: "Ground" },
  { id: "cold_storage", x: 10, y: 290, w: 140, h: 70, floor: "Basement" },
  { id: "parking_garage", x: 160, y: 290, w: 200, h: 70, floor: "Basement" },
  { id: "rooftop", x: 370, y: 10, w: 100, h: 120, floor: "Roof" },
];

const ALERT_TYPES = new Set([
  "failed_login", "unknown_device", "network_spike", "badge_denied",
  "camera_offline", "smoke_alert", "power_anomaly", "data_transfer",
]);

export function ZoneMap({ events }: ZoneMapProps) {
  const zoneStatus = useMemo(() => {
    const status: Record<string, { total: number; alerts: number; latest?: string }> = {};
    for (const event of events) {
      if (!status[event.zone]) {
        status[event.zone] = { total: 0, alerts: 0 };
      }
      status[event.zone].total++;
      status[event.zone].latest = event.type;
      if (ALERT_TYPES.has(event.type)) {
        status[event.zone].alerts++;
      }
    }
    return status;
  }, [events]);

  function getZoneColor(zone: Zone): { fill: string; stroke: string; text: string } {
    const s = zoneStatus[zone];
    if (!s) return { fill: "fill-zinc-900/40", stroke: "stroke-zinc-700/30", text: "text-zinc-600" };
    if (s.alerts > 2) return { fill: "fill-red-500/10", stroke: "stroke-red-500/40", text: "text-red-400" };
    if (s.alerts > 0) return { fill: "fill-amber-500/8", stroke: "stroke-amber-500/30", text: "text-amber-400" };
    return { fill: "fill-emerald-500/5", stroke: "stroke-emerald-500/20", text: "text-emerald-500" };
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60">
        <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Facility Map
        </h2>
        <div className="flex items-center gap-3 text-[9px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500/60" /> Normal</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500/60" /> Warning</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500/60 animate-pulse" /> Alert</span>
        </div>
      </div>
      <div className="flex-1 p-3 flex items-center justify-center">
        <svg viewBox="0 0 480 370" className="w-full h-full max-h-[280px]">
          {/* Grid pattern */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="480" height="370" fill="url(#grid)" />

          {/* Zones */}
          {ZONES.map((zone) => {
            const colors = getZoneColor(zone.id);
            const s = zoneStatus[zone.id];
            const hasAlerts = s && s.alerts > 0;

            return (
              <g key={zone.id}>
                {/* Zone rectangle */}
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  rx={4}
                  className={`${colors.fill} ${colors.stroke} stroke-[1.5] transition-all duration-500`}
                />

                {/* Pulse effect for alert zones */}
                {hasAlerts && (
                  <rect
                    x={zone.x}
                    y={zone.y}
                    width={zone.w}
                    height={zone.h}
                    rx={4}
                    className="fill-none stroke-red-500/30 stroke-[2]"
                    style={{
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                )}

                {/* Zone label */}
                <text
                  x={zone.x + zone.w / 2}
                  y={zone.y + zone.h / 2 - 6}
                  textAnchor="middle"
                  className={`text-[8px] font-semibold fill-current ${colors.text}`}
                >
                  {ZONE_LABELS[zone.id]?.toUpperCase() || zone.id}
                </text>

                {/* Event count */}
                {s && (
                  <text
                    x={zone.x + zone.w / 2}
                    y={zone.y + zone.h / 2 + 8}
                    textAnchor="middle"
                    className="text-[7px] fill-zinc-500"
                  >
                    {s.total} events{s.alerts > 0 ? ` · ${s.alerts} alerts` : ""}
                  </text>
                )}

                {/* Alert indicator dot */}
                {hasAlerts && (
                  <circle
                    cx={zone.x + zone.w - 8}
                    cy={zone.y + 8}
                    r={4}
                    className={`${s.alerts > 2 ? "fill-red-500" : "fill-amber-500"}`}
                    style={{ animation: "pulse 1.5s ease-in-out infinite" }}
                  />
                )}
              </g>
            );
          })}

          {/* Connection lines between zones */}
          <line x1="100" y1="90" x2="100" y2="100" className="stroke-zinc-700/30 stroke-[1]" strokeDasharray="3,3" />
          <line x1="280" y1="90" x2="280" y2="100" className="stroke-zinc-700/30 stroke-[1]" strokeDasharray="3,3" />
          <line x1="60" y1="240" x2="60" y2="250" className="stroke-zinc-700/30 stroke-[1]" strokeDasharray="3,3" />
          <line x1="260" y1="240" x2="260" y2="250" className="stroke-zinc-700/30 stroke-[1]" strokeDasharray="3,3" />
        </svg>
      </div>
    </div>
  );
}
