"use client";

import { useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSearch, CheckCircle2, Bot, Wrench } from "lucide-react";

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-white/[0.06] bg-[#0d1117]/60 backdrop-blur-sm overflow-hidden ${className}`}>
      {children}
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
    resetAll,
  } = useSentinel();

  useEffect(() => {
    fetchScenarios();
    fetchAssets();
  }, [fetchScenarios, fetchAssets]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#080d16]">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/[0.03] rounded-full blur-[100px]" />
        {/* Bottom corner glow on incident */}
        {state.incident && (
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-red-500/[0.03] rounded-full blur-[80px]" />
        )}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <Header
          onReset={resetAll}
          activeScenario={state.activeScenarioId}
          eventCount={state.events.length}
          isAnalyzing={state.isAnalyzing}
        />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1920px] mx-auto px-4 py-3 space-y-3">
            {/* Scenario Selector */}
            <ScenarioSelector
              scenarios={state.scenarios}
              activeScenarioId={state.activeScenarioId}
              isSimulating={state.isSimulating}
              onStart={startScenario}
              onLoadAll={loadAllEvents}
            />

            {/* KPI Row */}
            <KpiRow
              events={state.events}
              incident={state.incident}
              isSimulating={state.isSimulating}
              isAnalyzing={state.isAnalyzing}
            />

            {/* Main Grid: 3 columns */}
            <div className="grid grid-cols-12 gap-3">
              {/* LEFT COLUMN: Events + Assets */}
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

              {/* CENTER COLUMN: Map + Chart + Incident + Tabs */}
              <div className="col-span-5 space-y-3">
                {/* Zone Map + Threat Chart side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <Panel className="h-[200px]">
                    <ZoneMap events={state.events} />
                  </Panel>
                  <Panel className="h-[200px]">
                    <ThreatChart events={state.events} />
                  </Panel>
                </div>

                {/* Incident Board */}
                <IncidentBoard
                  incident={state.incident}
                  isAnalyzing={state.isAnalyzing}
                  hasEvents={state.events.length > 0 && !state.isSimulating}
                  onAnalyze={analyzeEvents}
                  error={state.error}
                />

                {/* Detail Tabs */}
                <Panel className="h-[300px]">
                  <Tabs defaultValue="agents" className="h-full flex flex-col">
                    <TabsList className="bg-transparent border-b border-white/[0.04] rounded-none px-3 h-10 shrink-0 gap-0">
                      <TabsTrigger
                        value="agents"
                        className="text-[11px] data-[state=active]:bg-white/[0.04] data-[state=active]:text-zinc-200 rounded-md px-3 gap-1.5"
                      >
                        <Bot className="h-3 w-3" />
                        Agents
                        {state.agentContributions.length > 0 && (
                          <span className="ml-1 h-4 min-w-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold flex items-center justify-center px-1">
                            {state.agentContributions.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="evidence"
                        className="text-[11px] data-[state=active]:bg-white/[0.04] data-[state=active]:text-zinc-200 rounded-md px-3 gap-1.5"
                      >
                        <FileSearch className="h-3 w-3" />
                        Evidence
                      </TabsTrigger>
                      <TabsTrigger
                        value="actions"
                        className="text-[11px] data-[state=active]:bg-white/[0.04] data-[state=active]:text-zinc-200 rounded-md px-3 gap-1.5"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Actions
                      </TabsTrigger>
                      <TabsTrigger
                        value="tools"
                        className="text-[11px] data-[state=active]:bg-white/[0.04] data-[state=active]:text-zinc-200 rounded-md px-3 gap-1.5"
                      >
                        <Wrench className="h-3 w-3" />
                        Tools
                        {state.toolCalls.length > 0 && (
                          <span className="ml-1 h-4 min-w-4 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-bold flex items-center justify-center px-1">
                            {state.toolCalls.length}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="agents" className="flex-1 overflow-hidden mt-0">
                      <AgentPanel contributions={state.agentContributions} />
                    </TabsContent>
                    <TabsContent value="evidence" className="flex-1 overflow-hidden mt-0">
                      <EvidencePanel incident={state.incident} />
                    </TabsContent>
                    <TabsContent value="actions" className="flex-1 overflow-hidden mt-0">
                      <ActionsPanel incident={state.incident} />
                    </TabsContent>
                    <TabsContent value="tools" className="flex-1 overflow-hidden mt-0">
                      <ToolCallsPanel toolCalls={state.toolCalls} />
                    </TabsContent>
                  </Tabs>
                </Panel>
              </div>

              {/* RIGHT COLUMN: What-If + Report */}
              <div className="col-span-4 space-y-3">
                <Panel className="h-[480px]">
                  <CounterfactualPanel
                    incident={state.incident}
                    results={state.simulationResults}
                    onSimulate={runCounterfactual}
                  />
                </Panel>
                <Panel className="h-[280px]">
                  <ReportPanel
                    markdown={state.reportMarkdown}
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
