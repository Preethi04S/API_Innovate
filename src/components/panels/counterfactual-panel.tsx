"use client";

import { useState } from "react";
import { IncidentAnalysis } from "@/lib/schemas/incident";
import { SimulationResult } from "@/lib/hooks/use-sentinel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlaskConical, Loader2, TrendingDown, TrendingUp, ArrowRight } from "lucide-react";

interface CounterfactualPanelProps {
  incident: IncidentAnalysis | null;
  results: SimulationResult[];
  onSimulate: (action: string, target: string) => void;
}

const ACTIONS = [
  { value: "isolate_device", label: "Isolate Device", desc: "Network quarantine" },
  { value: "revoke_badge", label: "Revoke Badge", desc: "Disable access credential" },
  { value: "delay_containment", label: "Delay 30 min", desc: "Wait and observe" },
  { value: "ignore_event", label: "Ignore Event", desc: "No action taken" },
];

export function CounterfactualPanel({
  incident,
  results,
  onSimulate,
}: CounterfactualPanelProps) {
  const [selectedAction, setSelectedAction] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600">
        <FlaskConical className="h-8 w-8 mb-3 opacity-30" />
        <p className="text-xs text-center px-6">
          What-if simulator compares containment strategies after analysis
        </p>
      </div>
    );
  }

  const target =
    incident.affected_assets[0] || incident.immediate_actions[0]?.target || "facility";

  const handleSimulate = async () => {
    if (!selectedAction) return;
    setIsLoading(true);
    await onSimulate(selectedAction, target);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
        <FlaskConical className="h-4 w-4 text-zinc-500" />
        <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
          What-If Simulator
        </h2>
      </div>

      <div className="p-4 border-b border-zinc-800/40">
        <div className="flex gap-2">
          <Select value={selectedAction} onValueChange={(v) => setSelectedAction(v ?? "")}>
            <SelectTrigger className="h-10 text-sm bg-zinc-900/50 border-zinc-700/50 flex-1">
              <SelectValue placeholder="Choose action..." />
            </SelectTrigger>
            <SelectContent>
              {ACTIONS.map((a) => (
                <SelectItem key={a.value} value={a.value} className="text-sm">
                  <span className="font-semibold">{a.label}</span>
                  <span className="text-zinc-500 ml-1.5">— {a.desc}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={handleSimulate}
            disabled={!selectedAction || isLoading}
            style={{
              height: "40px",
              padding: "0 20px",
              borderRadius: "8px",
              border: "none",
              cursor: selectedAction && !isLoading ? "pointer" : "not-allowed",
              background: selectedAction && !isLoading ? "#7c3aed" : "#27272a",
              color: selectedAction && !isLoading ? "#ffffff" : "#71717a",
              fontWeight: 700,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <FlaskConical className="h-4 w-4" />
                Run
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-2 font-mono font-semibold">
          Target: {target}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[11px] text-zinc-600">
                Select an action and run to see projected outcomes
              </p>
            </div>
          )}
          {results.map((result, i) => {
            const riskDelta = result.risk_before - result.risk_after;
            const isPositive = riskDelta > 0;

            return (
              <div
                key={i}
                className={`rounded-xl border p-4 animate-fade-up ${
                  isPositive
                    ? "bg-emerald-500/5 border-emerald-500/15"
                    : "bg-red-500/5 border-red-500/15"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-xs border-zinc-700/50 text-zinc-300 font-semibold px-2 py-0.5">
                    {result.action.replace(/_/g, " ")}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    {isPositive ? (
                      <TrendingDown className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-red-400" />
                    )}
                    <span className={`text-2xl font-black ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                      {isPositive ? "-" : "+"}
                      {Math.abs(riskDelta)}%
                    </span>
                  </div>
                </div>

                {/* Risk comparison */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Before</span>
                      <span className="text-xs text-zinc-300 font-mono font-bold">{result.risk_before}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-zinc-800/60 overflow-hidden">
                      <div
                        className="h-full bg-red-500/70 rounded-full transition-all duration-500"
                        style={{ width: `${result.risk_before}%` }}
                      />
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-600 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">After</span>
                      <span className="text-xs text-zinc-300 font-mono font-bold">{result.risk_after}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-zinc-800/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPositive ? "bg-emerald-500/70" : "bg-red-500/70"
                        }`}
                        style={{ width: `${result.risk_after}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 mb-3 font-medium">
                  Effect timeline: <span className="text-zinc-300 font-semibold">{result.timeline}</span>
                </div>

                <div className="space-y-1.5 mb-3">
                  {result.consequences.slice(0, 3).map((c, j) => (
                    <p key={j} className="text-xs text-zinc-400 flex items-start gap-2">
                      <span className="text-zinc-600 mt-0.5 shrink-0">•</span>
                      {c}
                    </p>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-zinc-800/40">
                  <p className="text-sm text-zinc-200 font-semibold">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
