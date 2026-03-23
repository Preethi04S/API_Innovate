"use client";

import { IncidentAnalysis } from "@/lib/schemas/incident";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Clock, AlertTriangle, CalendarClock } from "lucide-react";

interface ActionsPanelProps {
  incident: IncidentAnalysis | null;
}

const URGENCY_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  immediate: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    color: "text-red-400",
    bg: "bg-red-500/5 border-red-500/15",
  },
  short_term: {
    icon: <Clock className="h-3.5 w-3.5" />,
    color: "text-amber-400",
    bg: "bg-amber-500/5 border-amber-500/15",
  },
  scheduled: {
    icon: <CalendarClock className="h-3.5 w-3.5" />,
    color: "text-blue-400",
    bg: "bg-blue-500/5 border-blue-500/15",
  },
};

export function ActionsPanel({ incident }: ActionsPanelProps) {
  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600">
        <CheckCircle2 className="h-8 w-8 mb-3 opacity-30" />
        <p className="text-xs">Containment actions appear after analysis</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {incident.immediate_actions.map((action, i) => {
            const config = URGENCY_CONFIG[action.urgency] || URGENCY_CONFIG.scheduled;
            return (
              <div
                key={i}
                className={`rounded-lg border p-3.5 ${config.bg}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-zinc-500">#{i + 1}</span>
                      <span className={`text-[9px] font-semibold uppercase tracking-wider ${config.color}`}>
                        {action.urgency.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-200 font-medium mb-1.5">{action.action}</p>
                    <div className="space-y-0.5 text-[11px]">
                      <p className="text-zinc-500">
                        <span className="text-zinc-600">Target:</span>{" "}
                        <span className="font-mono text-zinc-400">{action.target}</span>
                      </p>
                      <p className="text-zinc-500">
                        <span className="text-zinc-600">Impact:</span>{" "}
                        <span className="text-zinc-400">{action.estimated_impact}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
