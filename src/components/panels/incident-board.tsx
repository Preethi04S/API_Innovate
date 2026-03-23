"use client";

import { IncidentAnalysis } from "@/lib/schemas/incident";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, ShieldAlert, TrendingUp } from "lucide-react";

interface IncidentBoardProps {
  incident: IncidentAnalysis | null;
  isAnalyzing: boolean;
  hasEvents: boolean;
  onAnalyze: () => void;
  error: string | null;
}

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  critical: { bg: "bg-red-500/8", text: "text-red-400", border: "border-red-500/20", glow: "shadow-red-500/5" },
  high: { bg: "bg-orange-500/8", text: "text-orange-400", border: "border-orange-500/20", glow: "shadow-orange-500/5" },
  medium: { bg: "bg-yellow-500/8", text: "text-yellow-400", border: "border-yellow-500/20", glow: "shadow-yellow-500/5" },
  low: { bg: "bg-blue-500/8", text: "text-blue-400", border: "border-blue-500/20", glow: "shadow-blue-500/5" },
  info: { bg: "bg-zinc-800/50", text: "text-zinc-400", border: "border-zinc-700", glow: "" },
};

export function IncidentBoard({
  incident,
  isAnalyzing,
  hasEvents,
  onAnalyze,
  error,
}: IncidentBoardProps) {
  if (!incident && !isAnalyzing) {
    return (
      <div className={`rounded-xl border border-zinc-800/60 ${hasEvents ? "bg-gradient-to-br from-emerald-500/5 via-zinc-900/50 to-zinc-900/50 border-emerald-500/20" : "bg-zinc-900/30"} p-8 flex flex-col items-center justify-center gap-4`}>
        <div className="relative">
          <div className={`absolute inset-0 rounded-full blur-xl ${hasEvents ? "bg-emerald-500/10" : "bg-zinc-700/10"}`} />
          <div className={`relative p-4 rounded-2xl border ${hasEvents ? "border-emerald-500/20 bg-emerald-500/5" : "border-zinc-800 bg-zinc-900/50"}`}>
            <Brain className={`h-8 w-8 ${hasEvents ? "text-emerald-400" : "text-zinc-700"}`} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-zinc-400 mb-1">
            {hasEvents
              ? "Events collected and ready for analysis"
              : "Select a threat scenario above to begin"}
          </p>
          <p className="text-[11px] text-zinc-600">
            {hasEvents
              ? "ASI-1 will correlate signals, run specialist agents, and identify incidents"
              : "Telemetry events will stream into the system for ASI-1 to analyze"}
          </p>
        </div>
        {hasEvents && (
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 mt-1"
          >
            <Brain className="h-4 w-4 mr-2" />
            Analyze with ASI-1
          </Button>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 mt-1">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-zinc-900/50 p-8 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <Loader2 className="relative h-10 w-10 text-emerald-400 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-zinc-200">ASI-1 Reasoning Engine Active</p>
          <div className="flex flex-col gap-0.5 text-[11px] text-zinc-500">
            <span>Running Cyber Analyst + Facility Safety agents...</span>
            <span>Executing tool calls for context enrichment...</span>
            <span>Synthesizing incident analysis...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!incident) return null;

  const style = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.info;

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-5 shadow-lg ${style.glow} animate-fade-up`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className={`h-4 w-4 ${style.text}`} />
            <Badge className={`${style.text} bg-transparent border ${style.border} text-[10px] font-bold uppercase tracking-wider`}>
              {incident.severity}
            </Badge>
            <Badge variant="outline" className="text-[10px] border-zinc-700/50 text-zinc-400 font-normal">
              {incident.category.replace(/_/g, " ")}
            </Badge>
            <span className="text-[10px] text-zinc-600 font-mono">
              {incident.incident_id}
            </span>
          </div>
          <h3 className="text-lg font-bold text-zinc-100 leading-tight">
            {incident.title}
          </h3>
        </div>

        {/* Confidence gauge */}
        <div className="text-center ml-4 shrink-0">
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-zinc-800" />
              <circle
                cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                strokeDasharray={`${incident.confidence * 175.9} 175.9`}
                strokeLinecap="round"
                className={style.text}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-zinc-100">
                {(incident.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Confidence</span>
        </div>
      </div>

      <p className="text-sm text-zinc-300 mb-4 leading-relaxed">{incident.summary}</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Root Cause
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed">{incident.probable_root_cause}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Business / Safety Impact
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed">{incident.business_or_safety_impact}</p>
        </div>
      </div>

      {/* Escalation */}
      <div className="mt-4 pt-3 border-t border-zinc-800/50">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3 w-3 text-zinc-500" />
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Escalation:</span>
          <div className="flex items-center gap-1">
            {incident.escalation_path.map((step, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-[10px] text-zinc-400">{step}</span>
                {i < incident.escalation_path.length - 1 && (
                  <span className="text-zinc-700 text-[10px]">→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
