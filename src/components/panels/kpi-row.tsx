"use client";

import { useEffect, useState } from "react";
import { TelemetryEvent } from "@/lib/schemas/events";
import { IncidentAnalysis } from "@/lib/schemas/incident";
import {
  ShieldAlert, Activity, Radio, AlertTriangle, Clock, Cpu,
} from "lucide-react";

interface KpiRowProps {
  events: TelemetryEvent[];
  incident: IncidentAnalysis | null;
  isSimulating: boolean;
  isAnalyzing: boolean;
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;

    const steps = Math.min(Math.abs(diff), 30);
    const stepDuration = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setDisplay(Math.round(start + (diff * step) / steps));
      if (step >= steps) clearInterval(timer);
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{display}</span>;
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  glowColor: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}

function KpiCard({ icon, label, value, suffix, color, glowColor, trend, trendLabel }: KpiCardProps) {
  return (
    <div className={`relative group rounded-xl border border-white/[0.14] bg-[#0f1724] p-5 overflow-hidden transition-all hover:border-white/[0.25] hover:scale-[1.02] duration-200`}>
      {/* Subtle glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowColor}`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.15em] mb-2">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-4xl font-black tracking-tight ${color}`}>
              <AnimatedNumber value={value} />
            </span>
            {suffix && (
              <span className="text-base text-zinc-400 font-semibold">{suffix}</span>
            )}
          </div>
          {trend && trendLabel && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-semibold ${
                trend === "up" ? "text-red-400" : trend === "down" ? "text-emerald-400" : "text-zinc-500"
              }`}>
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendLabel}
              </span>
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function KpiRow({ events, incident, isSimulating, isAnalyzing }: KpiRowProps) {
  const alertEvents = events.filter((e) =>
    ["failed_login", "unknown_device", "network_spike", "badge_denied", "camera_offline", "smoke_alert", "power_anomaly", "data_transfer"].includes(e.type)
  );

  const zones = new Set(events.map((e) => e.zone));
  const threatLevel = incident
    ? incident.severity === "critical" ? 95
    : incident.severity === "high" ? 75
    : incident.severity === "medium" ? 50
    : 25
    : alertEvents.length > 3 ? 60 : alertEvents.length > 0 ? 30 : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      <KpiCard
        icon={<Activity className="h-5 w-5" />}
        label="Events Ingested"
        value={events.length}
        color="text-cyan-400"
        glowColor="bg-gradient-to-br from-cyan-500/5 to-transparent"
        trend={isSimulating ? "up" : "neutral"}
        trendLabel={isSimulating ? "streaming" : "idle"}
      />
      <KpiCard
        icon={<AlertTriangle className="h-4 w-4" />}
        label="Anomalies"
        value={alertEvents.length}
        color="text-red-400"
        glowColor="bg-gradient-to-br from-red-500/5 to-transparent"
        trend={alertEvents.length > 3 ? "up" : "neutral"}
        trendLabel={alertEvents.length > 3 ? "critical" : "monitoring"}
      />
      <KpiCard
        icon={<ShieldAlert className="h-4 w-4" />}
        label="Threat Level"
        value={threatLevel}
        suffix="%"
        color={threatLevel > 70 ? "text-red-400" : threatLevel > 40 ? "text-amber-400" : "text-emerald-400"}
        glowColor={threatLevel > 70 ? "bg-gradient-to-br from-red-500/5 to-transparent" : "bg-gradient-to-br from-emerald-500/5 to-transparent"}
      />
      <KpiCard
        icon={<Radio className="h-4 w-4" />}
        label="Active Zones"
        value={zones.size}
        suffix="/10"
        color="text-violet-400"
        glowColor="bg-gradient-to-br from-violet-500/5 to-transparent"
      />
      <KpiCard
        icon={<Cpu className="h-4 w-4" />}
        label="Devices Online"
        value={25}
        color="text-emerald-400"
        glowColor="bg-gradient-to-br from-emerald-500/5 to-transparent"
        trend="neutral"
        trendLabel="all healthy"
      />
      <KpiCard
        icon={<Clock className="h-4 w-4" />}
        label="ASI Status"
        value={isAnalyzing ? 1 : incident ? 1 : 0}
        suffix={isAnalyzing ? "running" : incident ? "complete" : "standby"}
        color={isAnalyzing ? "text-amber-400" : incident ? "text-emerald-400" : "text-zinc-400"}
        glowColor="bg-gradient-to-br from-amber-500/5 to-transparent"
      />
    </div>
  );
}
