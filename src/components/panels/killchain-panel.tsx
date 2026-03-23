"use client";

import { IncidentAnalysis } from "@/lib/schemas/incident";
import { TelemetryEvent } from "@/lib/schemas/events";
import { Shield } from "lucide-react";

interface KillChainPanelProps {
  incident: IncidentAnalysis | null;
  events: TelemetryEvent[];
}

const KILL_CHAIN_STAGES = [
  {
    id: "recon",
    label: "Recon",
    mitre: "TA0043",
    color: "text-zinc-400",
    activeBg: "bg-purple-500/15 border-purple-500/40",
    activeText: "text-purple-300",
    dot: "bg-purple-500",
    triggers: ["failed_login", "network_scan", "port_scan"],
    icon: "🔍",
  },
  {
    id: "initial_access",
    label: "Initial Access",
    mitre: "TA0001",
    color: "text-zinc-400",
    activeBg: "bg-red-500/15 border-red-500/40",
    activeText: "text-red-300",
    dot: "bg-red-500",
    triggers: ["unknown_device", "unauthorized_access", "badge_anomaly"],
    icon: "🔓",
  },
  {
    id: "execution",
    label: "Execution",
    mitre: "TA0002",
    color: "text-zinc-400",
    activeBg: "bg-orange-500/15 border-orange-500/40",
    activeText: "text-orange-300",
    dot: "bg-orange-500",
    triggers: ["usb_inserted", "malware", "script_exec", "firmware_update"],
    icon: "⚙️",
  },
  {
    id: "persistence",
    label: "Persistence",
    mitre: "TA0003",
    color: "text-zinc-400",
    activeBg: "bg-yellow-500/15 border-yellow-500/40",
    activeText: "text-yellow-300",
    dot: "bg-yellow-500",
    triggers: ["camera_offline", "service_stopped", "config_change"],
    icon: "🔧",
  },
  {
    id: "exfiltration",
    label: "Exfiltration",
    mitre: "TA0010",
    color: "text-zinc-400",
    activeBg: "bg-red-600/20 border-red-600/50",
    activeText: "text-red-200",
    dot: "bg-red-600",
    triggers: ["data_transfer", "network_spike", "large_upload"],
    icon: "📤",
  },
];

function getActiveStages(events: TelemetryEvent[], incident: IncidentAnalysis | null): Set<string> {
  const active = new Set<string>();
  const eventTypes = events.map((e) => (e.type as string)?.toLowerCase() ?? "");

  for (const stage of KILL_CHAIN_STAGES) {
    if (stage.triggers.some((t) => eventTypes.some((et) => et.includes(t)))) {
      active.add(stage.id);
    }
  }

  // If incident is detected, ensure relevant stages are lit
  if (incident) {
    const summary = (incident.summary + incident.probable_root_cause).toLowerCase();
    if (summary.includes("reconnaissance") || summary.includes("recon")) active.add("recon");
    if (summary.includes("access") || summary.includes("intrusion") || summary.includes("rogue")) active.add("initial_access");
    if (summary.includes("malware") || summary.includes("usb") || summary.includes("exploit")) active.add("execution");
    if (summary.includes("persist") || summary.includes("offline") || summary.includes("disable")) active.add("persistence");
    if (summary.includes("exfiltrat") || summary.includes("transfer") || summary.includes("data")) active.add("exfiltration");
  }

  return active;
}

export function KillChainPanel({ incident, events }: KillChainPanelProps) {
  const activeStages = getActiveStages(events, incident);
  const activeCount = activeStages.size;

  return (
    <div className="flex flex-col h-full p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-zinc-600" />
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            ATT&CK Kill Chain
          </span>
        </div>
        {activeCount > 0 && (
          <span className="text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.5 uppercase tracking-wider">
            {activeCount}/{KILL_CHAIN_STAGES.length} Stages
          </span>
        )}
      </div>

      {/* Kill Chain Stages */}
      <div className="flex-1 flex flex-col justify-between gap-1.5">
        {KILL_CHAIN_STAGES.map((stage, idx) => {
          const isActive = activeStages.has(stage.id);
          const isLast = idx === KILL_CHAIN_STAGES.length - 1;

          return (
            <div key={stage.id} className="relative">
              <div
                className={`flex items-center gap-2.5 rounded-lg border p-2 transition-all duration-500 ${
                  isActive
                    ? `${stage.activeBg} ${isLast ? "ring-1 ring-red-500/30" : ""}`
                    : "bg-zinc-900/20 border-zinc-800/40"
                }`}
              >
                <div className={`text-base w-6 text-center shrink-0 ${isActive ? "" : "opacity-30 grayscale"}`}>
                  {stage.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-semibold ${isActive ? stage.activeText : "text-zinc-600"}`}>
                      {stage.label}
                    </span>
                    <span className={`text-[9px] font-mono ${isActive ? "text-zinc-500" : "text-zinc-700"}`}>
                      {stage.mitre}
                    </span>
                  </div>
                </div>
                <div className={`shrink-0 h-2 w-2 rounded-full transition-all duration-500 ${
                  isActive ? `${stage.dot} shadow-lg` : "bg-zinc-800"
                } ${isActive && isLast ? "animate-pulse" : ""}`} />
              </div>

              {/* Connector arrow */}
              {idx < KILL_CHAIN_STAGES.length - 1 && (
                <div className={`absolute left-[1.15rem] -bottom-1.5 flex flex-col items-center z-10`}>
                  <div className={`w-px h-1.5 ${isActive && activeStages.has(KILL_CHAIN_STAGES[idx + 1].id) ? "bg-zinc-500" : "bg-zinc-800"}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className={`mt-2 pt-2 border-t border-zinc-800/40 text-center text-[10px] ${activeCount >= 4 ? "text-red-400" : activeCount >= 2 ? "text-amber-400" : "text-zinc-600"}`}>
        {activeCount === 0
          ? "No attack stages detected"
          : activeCount >= 4
          ? `⚠ Advanced persistent threat — ${activeCount} stages confirmed`
          : `${activeCount} attack stage${activeCount > 1 ? "s" : ""} detected`}
      </div>
    </div>
  );
}
