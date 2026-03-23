"use client";

import { TelemetryEvent } from "@/lib/schemas/events";
import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

interface ThreatChartProps {
  events: TelemetryEvent[];
}

const ALERT_TYPES = new Set([
  "failed_login", "unknown_device", "network_spike", "badge_denied",
  "camera_offline", "smoke_alert", "power_anomaly", "data_transfer",
]);

export function ThreatChart({ events }: ThreatChartProps) {
  const chartData = useMemo(() => {
    if (events.length === 0) return [];

    // Group events into time buckets
    const buckets: Record<string, { total: number; alerts: number; time: string }> = {};

    events.forEach((event, i) => {
      const key = `T+${i}`;
      if (!buckets[key]) {
        buckets[key] = {
          total: 0,
          alerts: 0,
          time: key,
        };
      }
      buckets[key].total++;
      if (ALERT_TYPES.has(event.type)) {
        buckets[key].alerts++;
      }
    });

    // Build cumulative threat score
    let cumulativeAlerts = 0;
    let cumulativeTotal = 0;
    return Object.values(buckets).map((b) => {
      cumulativeAlerts += b.alerts;
      cumulativeTotal += b.total;
      return {
        time: b.time,
        threatScore: Math.min(100, Math.round((cumulativeAlerts / Math.max(cumulativeTotal, 1)) * 100 + cumulativeAlerts * 8)),
        events: cumulativeTotal,
        alerts: cumulativeAlerts,
      };
    });
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-600">
        <p className="text-[11px]">Threat timeline renders with event data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60">
        <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Threat Score Timeline
        </h2>
        <div className="flex items-center gap-3 text-[9px]">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-3 rounded-sm bg-cyan-500/60" /> Score
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-3 rounded-sm bg-red-500/40" /> Alerts
          </span>
        </div>
      </div>
      <div className="flex-1 p-2 pb-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fill: "#3f3f46", fontSize: 9 }}
              axisLine={{ stroke: "#27272a" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#3f3f46", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "8px",
                fontSize: "11px",
                color: "#d4d4d8",
              }}
              labelStyle={{ color: "#71717a", fontSize: "10px" }}
            />
            <Area
              type="monotone"
              dataKey="threatScore"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#threatGradient)"
              name="Threat Score"
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="alerts"
              stroke="#ef4444"
              strokeWidth={1.5}
              fill="url(#alertGradient)"
              name="Cumulative Alerts"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
