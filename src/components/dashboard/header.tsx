"use client";

import { Shield, RotateCcw, Activity, Radio, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onReset: () => void;
  onInstantDemo: () => void;
  activeScenario: string | null;
  eventCount: number;
  isAnalyzing: boolean;
  isDemoMode: boolean;
}

export function Header({ onReset, onInstantDemo, activeScenario, eventCount, isAnalyzing, isDemoMode }: HeaderProps) {
  return (
    <header className="border-b border-white/[0.15] bg-[#0c1220] px-6 py-4 sticky top-0 z-50 shadow-lg shadow-black/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/30 rounded-xl blur-lg" />
            <div className="relative bg-zinc-900 border border-emerald-500/40 rounded-xl p-2.5">
              <Shield className="h-7 w-7 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black text-zinc-50 tracking-tight">SentinelMesh</h1>
              <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md px-2 py-0.5 uppercase tracking-widest">
                Live
              </span>
              {isDemoMode && (
                <span className="text-[10px] font-black bg-violet-500/20 text-violet-300 border border-violet-500/40 rounded-md px-2 py-0.5 uppercase tracking-widest animate-pulse">
                  Demo
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 tracking-wide mt-0.5">
              Cyber-Physical Defense Copilot — Powered by ASI-1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status indicators */}
          <div className="hidden md:flex items-center gap-5 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <Radio className={`h-3.5 w-3.5 ${activeScenario ? "text-emerald-400 animate-pulse" : "text-zinc-600"}`} />
              <span className="font-medium">{activeScenario ? "Scenario Active" : "Standby"}</span>
            </div>
            <div className="w-px h-5 bg-zinc-700" />
            <div className="flex items-center gap-2 text-zinc-400">
              <Activity className={`h-3.5 w-3.5 ${isAnalyzing ? "text-amber-400 animate-pulse" : "text-zinc-600"}`} />
              <span className="font-medium">{isAnalyzing ? "Analyzing..." : "Idle"}</span>
            </div>
            <div className="w-px h-5 bg-zinc-700" />
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-medium">Events:</span>
              <span className="font-mono font-bold text-zinc-200 text-sm">{eventCount}</span>
            </div>
          </div>

          {/* ⚡ Instant Demo Button */}
          <Button
            size="sm"
            onClick={onInstantDemo}
            disabled={isAnalyzing}
            className="bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold border-0 h-9 px-4 text-sm gap-2 shadow-lg shadow-violet-500/20"
          >
            <Zap className="h-4 w-4" />
            Instant Demo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-zinc-400 border-zinc-700/60 bg-zinc-900/60 hover:bg-zinc-800 hover:text-zinc-200 text-sm h-9 px-3"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </header>
  );
}
