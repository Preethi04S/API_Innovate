"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Zap, AlertTriangle, Flame, Wifi, Thermometer } from "lucide-react";

interface ScenarioInfo {
  id: string;
  name: string;
  description: string;
  expectedSeverity: string;
  eventCount: number;
}

interface ScenarioSelectorProps {
  scenarios: ScenarioInfo[];
  activeScenarioId: string | null;
  isSimulating: boolean;
  onStart: (id: string) => void;
  onLoadAll: () => void;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
};

const SEVERITY_GRADIENT: Record<string, string> = {
  critical: "bg-gradient-to-br from-red-900/20 via-zinc-900/50 to-zinc-900/30",
  high: "bg-gradient-to-br from-orange-900/15 via-zinc-900/50 to-zinc-900/30",
  medium: "bg-gradient-to-br from-yellow-900/15 via-zinc-900/50 to-zinc-900/30",
};

const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  "scenario-rogue-camera": <Wifi className="h-5 w-5" />,
  "scenario-server-overheating": <Flame className="h-5 w-5" />,
  "scenario-smart-lock-abuse": <AlertTriangle className="h-5 w-5" />,
  "scenario-cold-storage-drift": <Thermometer className="h-5 w-5" />,
};

const SCENARIO_COLORS: Record<string, string> = {
  "scenario-rogue-camera": "from-red-500/10 to-transparent border-red-500/20 hover:border-red-500/40",
  "scenario-server-overheating": "from-orange-500/10 to-transparent border-orange-500/20 hover:border-orange-500/40",
  "scenario-smart-lock-abuse": "from-amber-500/10 to-transparent border-amber-500/20 hover:border-amber-500/40",
  "scenario-cold-storage-drift": "from-blue-500/10 to-transparent border-blue-500/20 hover:border-blue-500/40",
};

const SCENARIO_ICON_COLORS: Record<string, string> = {
  "scenario-rogue-camera": "text-red-400",
  "scenario-server-overheating": "text-orange-400",
  "scenario-smart-lock-abuse": "text-amber-400",
  "scenario-cold-storage-drift": "text-blue-400",
};

export function ScenarioSelector({
  scenarios,
  activeScenarioId,
  isSimulating,
  onStart,
  onLoadAll,
}: ScenarioSelectorProps) {
  if (scenarios.length === 0) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl border border-zinc-800/50 bg-zinc-900/30 shimmer-loading" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
          Threat Scenarios
        </h2>
        <div className="flex-1 h-px bg-zinc-800/60" />
        <span className="text-[10px] text-zinc-600">Select a scenario to begin simulation</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {scenarios.map((scenario) => {
          const isActive = scenario.id === activeScenarioId;
          const colors = SCENARIO_COLORS[scenario.id] || "from-zinc-500/10 to-transparent border-zinc-700 hover:border-zinc-600";
          const iconColor = SCENARIO_ICON_COLORS[scenario.id] || "text-zinc-400";

          const severityGradient = SEVERITY_GRADIENT[scenario.expectedSeverity] || "";

          return (
            <div
              key={scenario.id}
              className={`group relative rounded-xl border transition-all duration-300 cursor-pointer ${
                isActive
                  ? "border-emerald-500/50 bg-gradient-to-br from-emerald-900/20 via-zinc-900/50 to-zinc-900/30 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/5"
                  : `${severityGradient} ${colors} hover:shadow-lg`
              }`}
              onClick={() => !isSimulating && onStart(scenario.id)}
            >
              {isActive && (
                <div className="absolute top-2 right-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className={`mt-0.5 ${isActive ? "text-emerald-400" : iconColor}`}>
                    {SCENARIO_ICONS[scenario.id] || <AlertTriangle className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-200 leading-tight mb-1">
                      {scenario.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {scenario.description.slice(0, 80)}{scenario.description.length > 80 ? "…" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-semibold uppercase tracking-wider ${SEVERITY_STYLES[scenario.expectedSeverity] || ""}`}
                    >
                      {scenario.expectedSeverity}
                    </Badge>
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                      {scenario.eventCount} events
                    </span>
                  </div>

                  {isActive && isSimulating ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadAll();
                      }}
                      className="h-6 text-[10px] border-zinc-700 bg-zinc-800/50"
                    >
                      <Zap className="h-2.5 w-2.5 mr-1" />
                      Skip
                    </Button>
                  ) : !isActive ? (
                    <div className="text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors flex items-center gap-1">
                      <Play className="h-2.5 w-2.5" />
                      Run
                    </div>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-medium">Active</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
