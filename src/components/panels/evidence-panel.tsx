"use client";

import { IncidentAnalysis } from "@/lib/schemas/incident";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSearch, Link } from "lucide-react";

interface EvidencePanelProps {
  incident: IncidentAnalysis | null;
}

const RELEVANCE_CONFIG: Record<string, { color: string; dot: string }> = {
  primary: { color: "text-red-400 bg-red-500/10 border-red-500/20", dot: "bg-red-400" },
  supporting: { color: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  contextual: { color: "text-blue-400 bg-blue-500/10 border-blue-500/20", dot: "bg-blue-400" },
};

export function EvidencePanel({ incident }: EvidencePanelProps) {
  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600">
        <FileSearch className="h-8 w-8 mb-3 opacity-30" />
        <p className="text-xs">Evidence chain populates after ASI-1 analysis</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {/* Evidence timeline */}
          <div className="relative">
            <div className="absolute left-[7px] top-4 bottom-4 w-px bg-zinc-800/60" />
            {incident.evidence.map((e, i) => {
              const config = RELEVANCE_CONFIG[e.relevance] || RELEVANCE_CONFIG.contextual;
              return (
                <div key={i} className="relative flex gap-3 pb-3">
                  <div className={`relative z-10 mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-zinc-900 ${config.dot} shrink-0`} />
                  <div className="flex-1 rounded-lg border border-zinc-800/40 bg-zinc-900/30 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="outline" className={`text-[9px] ${config.color}`}>
                        {e.relevance}
                      </Badge>
                      <span className="text-[10px] text-zinc-600 font-mono">{e.source}</span>
                      <span className="text-[10px] text-zinc-700 ml-auto">
                        {new Date(e.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{e.detail}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Link className="h-2.5 w-2.5 text-zinc-600" />
                      <span className="text-[10px] text-zinc-600">{e.event_type}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alternative hypotheses */}
          {(incident.alternative_hypotheses?.length ?? 0) > 0 && (
            <div className="mt-2 pt-3 border-t border-zinc-800/40">
              <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-1">
                Alternative Hypotheses
              </h3>
              {incident.alternative_hypotheses.map((h, i) => {
                const text = typeof h === "string" ? h : h.hypothesis;
                const conf = typeof h === "object" && h.confidence ? h.confidence : null;
                const sup = typeof h === "object" ? (h.supporting_evidence ?? []) : [];
                const con = typeof h === "object" ? (h.contradicting_evidence ?? []) : [];
                return (
                  <div key={i} className="rounded-lg border border-zinc-800/40 bg-zinc-900/20 p-3 mb-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-zinc-300 font-medium">{text}</span>
                      {conf !== null && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {(conf * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    {sup.length > 0 && (
                      <p className="text-[10px] text-zinc-500">
                        <span className="text-emerald-500/80">+</span> {sup.join("; ")}
                      </p>
                    )}
                    {con.length > 0 && (
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        <span className="text-red-400/80">-</span> {con.join("; ")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
