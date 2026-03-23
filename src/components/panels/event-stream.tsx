"use client";

import { TelemetryEvent, EVENT_TYPE_LABELS, ZONE_LABELS } from "@/lib/schemas/events";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Thermometer, Droplets, Activity, DoorOpen, DoorClosed,
  Zap, Flame, CreditCard, ShieldAlert, Wifi, Network,
  Camera, Usb, ArrowUpDown, Radio,
} from "lucide-react";
import { useEffect, useRef } from "react";

interface EventStreamProps {
  events: TelemetryEvent[];
  isSimulating: boolean;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  temperature: <Thermometer className="h-3.5 w-3.5" />,
  humidity: <Droplets className="h-3.5 w-3.5" />,
  motion: <Activity className="h-3.5 w-3.5" />,
  door_open: <DoorOpen className="h-3.5 w-3.5" />,
  door_close: <DoorClosed className="h-3.5 w-3.5" />,
  power_anomaly: <Zap className="h-3.5 w-3.5" />,
  smoke_alert: <Flame className="h-3.5 w-3.5" />,
  badge_swipe: <CreditCard className="h-3.5 w-3.5" />,
  failed_login: <ShieldAlert className="h-3.5 w-3.5" />,
  unknown_device: <Wifi className="h-3.5 w-3.5" />,
  network_spike: <Network className="h-3.5 w-3.5" />,
  badge_denied: <ShieldAlert className="h-3.5 w-3.5" />,
  camera_offline: <Camera className="h-3.5 w-3.5" />,
  usb_insert: <Usb className="h-3.5 w-3.5" />,
  data_transfer: <ArrowUpDown className="h-3.5 w-3.5" />,
};

const ALERT_TYPES = new Set([
  "failed_login", "unknown_device", "network_spike", "badge_denied",
  "camera_offline", "smoke_alert", "power_anomaly", "data_transfer",
]);

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatValue(event: TelemetryEvent): string {
  if (typeof event.value === "boolean") return event.value ? "YES" : "NO";
  if (event.unit) return `${event.value}${event.unit}`;
  return String(event.value).slice(0, 40);
}

export function EventStream({ events, isSimulating }: EventStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Radio className={`h-3.5 w-3.5 ${isSimulating ? "text-emerald-400 animate-pulse" : "text-zinc-600"}`} />
          <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Event Stream
          </h2>
        </div>
        <Badge variant="outline" className="text-[10px] border-zinc-700/50 text-zinc-500 font-mono">
          {events.length}
        </Badge>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <Activity className="h-8 w-8 mb-3 opacity-30" />
              <p className="text-xs">Waiting for telemetry signals...</p>
            </div>
          )}
          {events.map((event) => {
            const isAlert = ALERT_TYPES.has(event.type);
            return (
              <div
                key={event.id}
                className={`flex items-start gap-2.5 rounded-lg px-3 py-2 text-xs animate-fade-up ${
                  isAlert
                    ? "bg-red-500/5 border border-red-500/10"
                    : "hover:bg-zinc-800/30"
                }`}
              >
                <span className={`mt-0.5 shrink-0 ${isAlert ? "text-red-400" : "text-zinc-500"}`}>
                  {EVENT_ICONS[event.type] || <Activity className="h-3.5 w-3.5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-medium ${isAlert ? "text-red-300" : "text-zinc-300"}`}>
                      {EVENT_TYPE_LABELS[event.type] || event.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-zinc-500">
                      {ZONE_LABELS[event.zone] || event.zone}
                    </span>
                    <span className="text-zinc-800">|</span>
                    <span className="text-[10px] text-zinc-400 font-mono truncate">
                      {formatValue(event)}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-700 font-mono shrink-0 mt-0.5">
                  {formatTime(event.timestamp)}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
