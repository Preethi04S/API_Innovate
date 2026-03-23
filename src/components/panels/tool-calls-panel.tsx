"use client";

import { ToolCallRecord } from "@/lib/tools/executor";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wrench, ChevronRight } from "lucide-react";

interface ToolCallsPanelProps {
  toolCalls: ToolCallRecord[];
}

const TOOL_CONFIG: Record<string, { color: string; label: string }> = {
  lookup_playbook: { color: "text-purple-400 bg-purple-500/10 border-purple-500/20", label: "Playbook" },
  query_asset_inventory: { color: "text-blue-400 bg-blue-500/10 border-blue-500/20", label: "Inventory" },
  check_known_vulns: { color: "text-red-400 bg-red-500/10 border-red-500/20", label: "CVE Check" },
  draft_alert_message: { color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "Alert Draft" },
  simulate_containment_action: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Containment" },
};

export function ToolCallsPanel({ toolCalls }: ToolCallsPanelProps) {
  if (toolCalls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600">
        <Wrench className="h-8 w-8 mb-3 opacity-30" />
        <p className="text-xs">ASI-1 tool calls appear during analysis</p>
        <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-xs">
          {Object.entries(TOOL_CONFIG).map(([, config]) => (
            <Badge key={config.label} variant="outline" className={`text-[9px] opacity-30 ${config.color}`}>
              {config.label}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {toolCalls.map((tc, i) => {
            const config = TOOL_CONFIG[tc.name] || { color: "text-zinc-400 bg-zinc-800/50 border-zinc-700", label: tc.name };
            return (
              <div
                key={tc.id || i}
                className="rounded-lg border border-zinc-800/40 bg-zinc-900/20 overflow-hidden animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Tool header */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800/30">
                  <Wrench className="h-3 w-3 text-zinc-500" />
                  <Badge variant="outline" className={`text-[9px] font-semibold ${config.color}`}>
                    {config.label}
                  </Badge>
                  <span className="text-[9px] text-zinc-600 font-mono">{tc.name}</span>
                  <span className="text-[9px] text-zinc-700 ml-auto">
                    {new Date(tc.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Args & Result */}
                <div className="px-3 py-2 space-y-2">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <ChevronRight className="h-2.5 w-2.5 text-zinc-600" />
                      <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Input</span>
                    </div>
                    <pre className="text-[10px] text-zinc-400 bg-zinc-950/40 rounded-md px-2.5 py-1.5 overflow-x-auto font-mono">
                      {JSON.stringify(tc.arguments, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <ChevronRight className="h-2.5 w-2.5 text-emerald-600" />
                      <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Output</span>
                    </div>
                    <pre className="text-[10px] text-zinc-400 bg-zinc-950/40 rounded-md px-2.5 py-1.5 overflow-x-auto max-h-28 font-mono">
                      {JSON.stringify(tc.result, null, 2).slice(0, 400)}
                    </pre>
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
