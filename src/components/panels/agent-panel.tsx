"use client";

import { AgentContribution } from "@/lib/asi/analyze";
import { Bot, Shield, AlertTriangle, Crown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

function stripMd(text: string): string {
  return text
    .replace(/#{1,4}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/gs, "$1")
    .replace(/\*(.+?)\*/gs, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^[-*]\s+/gm, "• ")
    .replace(/^\d+\.\s+/gm, "")
    .trim();
}

interface AgentPanelProps {
  contributions: AgentContribution[];
}

const AGENT_CONFIG: Record<string, { icon: React.ReactNode; gradient: string; border: string; accent: string }> = {
  cyber_analyst: {
    icon: <Shield className="h-4 w-4" />,
    gradient: "from-blue-500/10 to-transparent",
    border: "border-blue-500/30",
    accent: "text-blue-400",
  },
  facility_safety: {
    icon: <AlertTriangle className="h-4 w-4" />,
    gradient: "from-amber-500/10 to-transparent",
    border: "border-amber-500/30",
    accent: "text-amber-400",
  },
  incident_commander: {
    icon: <Crown className="h-4 w-4" />,
    gradient: "from-emerald-500/10 to-transparent",
    border: "border-emerald-500/30",
    accent: "text-emerald-400",
  },
};

export function AgentPanel({ contributions }: AgentPanelProps) {
  if (contributions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-600">
        <Bot className="h-8 w-8 mb-3 opacity-30" />
        <p className="text-xs">Specialist agents activate during analysis</p>
        <div className="flex gap-4 mt-4">
          {Object.entries(AGENT_CONFIG).map(([key, config]) => (
            <div key={key} className="flex flex-col items-center gap-1 opacity-30">
              <div className={config.accent}>{config.icon}</div>
              <span className="text-[9px] text-zinc-600">
                {key.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScrollArea className="flex-1 min-h-0 h-full">
        <div className="p-3 space-y-3">
          {contributions.map((agent, i) => {
            const config = AGENT_CONFIG[agent.agent] || {
              icon: <Bot className="h-4 w-4" />,
              gradient: "from-zinc-500/8 to-transparent",
              border: "border-zinc-700/30",
              accent: "text-zinc-400",
            };
            return (
              <div
                key={i}
                className={`rounded-xl border bg-gradient-to-br ${config.gradient} ${config.border} p-4 animate-fade-up`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`p-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 ${config.accent}`}>
                    {config.icon}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-zinc-200">{agent.role}</span>
                    <span className="text-[9px] text-zinc-600 ml-2 uppercase tracking-wider">Agent</span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                  {stripMd(agent.analysis).slice(0, 600)}
                  {agent.analysis.length > 600 && (
                    <span className="text-zinc-600">...</span>
                  )}
                </div>

                {agent.recommendations.length > 0 && (
                  <div className="border-t border-zinc-800/30 pt-2.5">
                    <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Recommendations
                    </span>
                    <ul className="mt-1.5 space-y-1">
                      {agent.recommendations.slice(0, 4).map((rec, j) => (
                        <li key={j} className="text-[11px] text-zinc-300 flex items-start gap-1.5">
                          <span className={`mt-1 h-1 w-1 rounded-full shrink-0 ${config.accent.replace("text-", "bg-")}`} />
                          {stripMd(rec)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
