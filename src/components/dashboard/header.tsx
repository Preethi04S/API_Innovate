"use client";

import { Shield, RotateCcw, Activity, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onReset: () => void;
  activeScenario: string | null;
  eventCount: number;
  isAnalyzing: boolean;
}

export function Header({ onReset, activeScenario, eventCount, isAnalyzing }: HeaderProps) {
  return (
    <header className="border-b border-white/[0.06] bg-[#0a0f1a]/90 backdrop-blur-md px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-lg blur-md" />
            <div className="relative bg-zinc-900 border border-emerald-500/30 rounded-lg p-2">
              <Shield className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-zinc-50 tracking-tight">
                SentinelMesh
              </h1>
              <span className="text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1.5 py-0.5 uppercase tracking-widest">
                Live
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 tracking-wide">
              Cyber-Physical Defense Copilot — Powered by ASI-1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* Status indicators */}
          <div className="hidden md:flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Radio className={`h-3 w-3 ${activeScenario ? "text-emerald-400 animate-pulse-glow" : "text-zinc-600"}`} />
              <span>{activeScenario ? "Scenario Active" : "Standby"}</span>
            </div>
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Activity className={`h-3 w-3 ${isAnalyzing ? "text-amber-400 animate-pulse" : "text-zinc-600"}`} />
              <span>{isAnalyzing ? "Analyzing..." : "Idle"}</span>
            </div>
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">Events:</span>
              <span className="font-mono text-zinc-300">{eventCount}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-zinc-400 border-zinc-700/50 bg-zinc-900/50 hover:bg-zinc-800 hover:text-zinc-200 text-xs h-8"
          >
            <RotateCcw className="h-3 w-3 mr-1.5" />
            Reset Demo
          </Button>
        </div>
      </div>
    </header>
  );
}
