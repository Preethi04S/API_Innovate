"use client";

import { useEffect, useState, useRef } from "react";
import { useSentinel } from "@/lib/hooks/use-sentinel";
import { Header } from "@/components/dashboard/header";
import { ScenarioSelector } from "@/components/panels/scenario-selector";
import { KpiRow } from "@/components/panels/kpi-row";
import { EventStream } from "@/components/panels/event-stream";
import { AssetList } from "@/components/panels/asset-list";
import { ZoneMap } from "@/components/panels/zone-map";
import { ThreatChart } from "@/components/panels/threat-chart";
import { IncidentBoard } from "@/components/panels/incident-board";
import { EvidencePanel } from "@/components/panels/evidence-panel";
import { ActionsPanel } from "@/components/panels/actions-panel";
import { ToolCallsPanel } from "@/components/panels/tool-calls-panel";
import { AgentPanel } from "@/components/panels/agent-panel";
import { CounterfactualPanel } from "@/components/panels/counterfactual-panel";
import { ReportPanel } from "@/components/panels/report-panel";
import { CopilotPanel } from "@/components/panels/copilot-panel";
import { KillChainPanel } from "@/components/panels/killchain-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSearch, CheckCircle2, Bot, Wrench, Sparkles } from "lucide-react";
import { DEMO_SIMULATION_RESULTS, DEMO_REPORT_MARKDOWN } from "@/lib/demo/cached-result";

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-white/[0.12] bg-[#0f1724] overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

/** Flashing critical alert overlay — shown briefly on new CRITICAL incident */
function CriticalAlert({ show, title }: { show: boolean; title: string }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Red pulse border */}
      <div className="absolute inset-0 border-4 border-red-500/70 rounded-none animate-pulse" />
      {/* Top banner */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-600/95 border border-red-400/50 rounded-xl px-6 py-3 shadow-2xl shadow-red-500/30 flex items-center gap-3 backdrop-blur-sm">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <div>
          <p className="text-xs font-black text-white uppercase tracking-widest">Critical Incident Detected</p>
          <p className="text-[10px] text-red-200 mt-0.5 max-w-sm truncate">{title}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const {
    state,
    fetchScenarios,
    fetchAssets,
    startScenario,
    loadAllEvents,
    analyzeEvents,
    runCounterfactual,
    generateReport,
    loadDemoResult,
    askCopilot,
    resetAll,
  } = useSentinel();

  const [showCriticalAlert, setShowCriticalAlert] = useState(false);
  const prevIncidentId = useRef<string | null>(null);

  useEffect(() => {
    fetchScenarios();
    fetchAssets();
    // Pre-load demo events on mount so EventStream is populated
    loadAllEvents();
  }, [fetchScenarios, fetchAssets, loadAllEvents]);

  // Trigger critical alert when a new CRITICAL incident is detected
  useEffect(() => {
    if (
      state.incident &&
      state.incident.severity === "critical" &&
      state.incident.incident_id !== prevIncidentId.current
    ) {
      prevIncidentId.current = state.incident.incident_id;
      setShowCriticalAlert(true);
      setTimeout(() => setShowCriticalAlert(false), 4000);
    }
  }, [state.incident]);

  // Auto-run simulation once after demo loads — only in demo mode
  const autoSimRan = useRef(false);
  useEffect(() => {
    if (state.isDemoMode && state.incident && state.simulationResults.length === 0 && !autoSimRan.current) {
      autoSimRan.current = true;
      const timer = setTimeout(() => {
        runCounterfactual("isolate_device", state.incident?.affected_assets[0] || "cam-l1-01");
      }, 800);
      return () => clearTimeout(timer);
    }
    if (!state.isDemoMode) autoSimRan.current = false;
  }, [state.isDemoMode, state.incident, state.simulationResults.length, runCounterfactual]);

  // Auto-generate report once after demo loads — only in demo mode
  const autoReportRan = useRef(false);
  useEffect(() => {
    if (state.isDemoMode && state.incident && !state.reportMarkdown && !autoReportRan.current) {
      autoReportRan.current = true;
      const timer = setTimeout(() => {
        generateReport();
      }, 2500);
      return () => clearTimeout(timer);
    }
    if (!state.isDemoMode) autoReportRan.current = false;
  }, [state.isDemoMode, state.incident, state.reportMarkdown, generateReport]);

  const isCritical = state.incident?.severity === "critical";

  // Demo mode is true if the flag is set OR if the incident is the pre-loaded demo incident
  const isDemoActive = state.isDemoMode || state.incident?.incident_id === "INC-2026-0323-001";
  const effectiveSimResults = state.simulationResults.length > 0
    ? state.simulationResults
    : (isDemoActive ? DEMO_SIMULATION_RESULTS : []);
  const effectiveReport = state.reportMarkdown ?? (isDemoActive ? DEMO_REPORT_MARKDOWN : null);

  return (
    <div className={`min-h-screen overflow-auto bg-[#060a14] transition-all duration-1000 ${isCritical && !state.isAnalyzing ? "bg-[#0a0508]" : ""}`}>
      {/* Critical alert overlay */}
      <CriticalAlert show={showCriticalAlert} title={state.incident?.title ?? ""} />

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/[0.03] rounded-full blur-[100px]" />
        {isCritical && (
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-red-500/[0.04] rounded-full blur-[120px] animate-pulse" />
        )}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen overflow-x-auto">
        <Header
          onReset={resetAll}
          onInstantDemo={loadDemoResult}
          activeScenario={state.activeScenarioId}
          eventCount={state.events.length}
          isAnalyzing={state.isAnalyzing}
          isDemoMode={state.isDemoMode}
        />

        <div className="flex-1">
          <div className="max-w-[1920px] mx-auto px-4 py-3 space-y-3 min-w-[1200px]">
            <ScenarioSelector
              scenarios={state.scenarios}
              activeScenarioId={state.activeScenarioId}
              isSimulating={state.isSimulating}
              onStart={startScenario}
              onLoadAll={loadAllEvents}
            />

            <KpiRow
              events={state.events}
              incident={state.incident}
              isSimulating={state.isSimulating}
              isAnalyzing={state.isAnalyzing}
            />

            {/* Main Grid: 3 columns */}
            <div className="grid grid-cols-12 gap-3">
              {/* LEFT COLUMN */}
              <div className="col-span-3 space-y-3">
                <Panel className="h-[400px]">
                  <EventStream events={state.events} isSimulating={state.isSimulating} />
                </Panel>
                <Panel className="h-[240px]">
                  <AssetList
                    assets={state.assets}
                    affectedAssets={state.incident?.affected_assets}
                  />
                </Panel>
              </div>

              {/* CENTER COLUMN */}
              <div className="col-span-5 space-y-3">
                {/* Zone Map + Kill Chain side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <Panel className="h-[240px]">
                    <ZoneMap events={state.events} />
                  </Panel>
                  <Panel className={`h-[240px] transition-all duration-500 ${isCritical ? "border-red-500/25" : ""}`}>
                    {state.incident || state.events.length > 0 ? (
                      <KillChainPanel incident={state.incident} events={state.events} />
                    ) : (
                      <ThreatChart events={state.events} />
                    )}
                  </Panel>
                </div>

                {/* Threat Chart (always visible below maps when incident active) */}
                {state.incident && (
                  <Panel className="h-[120px]">
                    <ThreatChart events={state.events} />
                  </Panel>
                )}

                {/* Incident Board */}
                <IncidentBoard
                  incident={state.incident}
                  isAnalyzing={state.isAnalyzing}
                  isSimulating={state.isSimulating}
                  hasEvents={state.events.length > 0 && !state.isSimulating}
                  onAnalyze={analyzeEvents}
                  error={state.error}
                />

                {/* Detail Tabs */}
                <Panel className="h-[420px]">
                  <Tabs defaultValue="agents" className="h-full flex flex-col">
                    <TabsList className="bg-transparent border-b border-white/[0.06] rounded-none px-3 h-12 shrink-0 gap-1">
                      <TabsTrigger
                        value="agents"
                        className="text-xs font-semibold data-[state=active]:bg-white/[0.06] data-[state=active]:text-zinc-100 rounded-lg px-3 gap-2 h-8"
                      >
                        <Bot className="h-3.5 w-3.5" />
                        Agents
                        {state.agentContributions.length > 0 && (
                          <span className="ml-1 h-5 min-w-5 rounded-full bg-emerald-500/25 text-emerald-400 text-[10px] font-bold flex items-center justify-center px-1">
                            {state.agentContributions.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="copilot"
                        className="text-xs font-semibold data-[state=active]:bg-white/[0.06] data-[state=active]:text-zinc-100 rounded-lg px-3 gap-2 h-8"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                        Ask ASI-1
                        {state.chatMessages.length > 0 && (
                          <span className="ml-1 h-5 min-w-5 rounded-full bg-violet-500/25 text-violet-400 text-[10px] font-bold flex items-center justify-center px-1">
                            {state.chatMessages.filter(m => m.role === "assistant").length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="evidence"
                        className="text-xs font-semibold data-[state=active]:bg-white/[0.06] data-[state=active]:text-zinc-100 rounded-lg px-3 gap-2 h-8"
                      >
                        <FileSearch className="h-3.5 w-3.5" />
                        Evidence
                      </TabsTrigger>
                      <TabsTrigger
                        value="actions"
                        className="text-xs font-semibold data-[state=active]:bg-white/[0.06] data-[state=active]:text-zinc-100 rounded-lg px-3 gap-2 h-8"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Actions
                      </TabsTrigger>
                      <TabsTrigger
                        value="tools"
                        className="text-xs font-semibold data-[state=active]:bg-white/[0.06] data-[state=active]:text-zinc-100 rounded-lg px-3 gap-2 h-8"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        Tools
                        {state.toolCalls.length > 0 && (
                          <span className="ml-1 h-5 min-w-5 rounded-full bg-blue-500/25 text-blue-400 text-[10px] font-bold flex items-center justify-center px-1">
                            {state.toolCalls.length}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="agents" className="flex-1 min-h-0 overflow-auto mt-0">
                      <AgentPanel contributions={state.agentContributions} />
                    </TabsContent>
                    <TabsContent value="copilot" className="flex-1 min-h-0 overflow-auto mt-0">
                      <CopilotPanel
                        incident={state.incident}
                        messages={state.chatMessages}
                        isLoading={state.isChatLoading}
                        onAsk={askCopilot}
                      />
                    </TabsContent>
                    <TabsContent value="evidence" className="flex-1 min-h-0 overflow-auto mt-0">
                      <EvidencePanel incident={state.incident} />
                    </TabsContent>
                    <TabsContent value="actions" className="flex-1 min-h-0 overflow-auto mt-0">
                      <ActionsPanel incident={state.incident} />
                    </TabsContent>
                    <TabsContent value="tools" className="flex-1 min-h-0 overflow-auto mt-0">
                      <ToolCallsPanel toolCalls={state.toolCalls} />
                    </TabsContent>
                  </Tabs>
                </Panel>
              </div>

              {/* RIGHT COLUMN */}
              <div className="col-span-4 space-y-3">
                <Panel className="h-[480px]">
                  <CounterfactualPanel
                    incident={state.incident}
                    results={effectiveSimResults}
                    onSimulate={runCounterfactual}
                  />
                </Panel>
                <Panel className="h-[340px]">
                  <ReportPanel
                    markdown={effectiveReport}
                    hasIncident={!!state.incident}
                    onGenerate={generateReport}
                  />
                </Panel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
