"use client";

import { useState, useCallback, useRef } from "react";
import { TelemetryEvent } from "@/lib/schemas/events";
import { IncidentAnalysis } from "@/lib/schemas/incident";
import { ToolCallRecord } from "@/lib/tools/executor";
import { AgentContribution } from "@/lib/asi/analyze";

interface ScenarioInfo {
  id: string;
  name: string;
  description: string;
  expectedSeverity: string;
  eventCount: number;
}

interface Asset {
  id: string;
  name: string;
  type: string;
  zone: string;
  status: string;
  ip?: string;
}

export interface SentinelState {
  scenarios: ScenarioInfo[];
  assets: Asset[];
  events: TelemetryEvent[];
  activeScenarioId: string | null;
  isSimulating: boolean;
  isAnalyzing: boolean;
  incident: IncidentAnalysis | null;
  toolCalls: ToolCallRecord[];
  agentContributions: AgentContribution[];
  reportMarkdown: string | null;
  simulationResults: SimulationResult[];
  error: string | null;
}

export interface SimulationResult {
  action: string;
  risk_before: number;
  risk_after: number;
  timeline: string;
  consequences: string[];
  recommendation: string;
}

export function useSentinel() {
  const [state, setState] = useState<SentinelState>({
    scenarios: [],
    assets: [],
    events: [],
    activeScenarioId: null,
    isSimulating: false,
    isAnalyzing: false,
    incident: null,
    toolCalls: [],
    agentContributions: [],
    reportMarkdown: null,
    simulationResults: [],
    error: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchScenarios = useCallback(async () => {
    const res = await fetch("/api/events?action=scenarios");
    const data = await res.json();
    setState((s) => ({ ...s, scenarios: data.scenarios }));
  }, []);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch("/api/events?action=assets");
      const data = await res.json();
      setState((s) => ({ ...s, assets: data.assets || [] }));
    } catch (e) {
      console.error("Failed to fetch assets:", e);
    }
  }, []);

  const startScenario = useCallback(async (scenarioId: string) => {
    // Reset state
    setState((s) => ({
      ...s,
      events: [],
      incident: null,
      toolCalls: [],
      agentContributions: [],
      reportMarkdown: null,
      simulationResults: [],
      error: null,
      activeScenarioId: scenarioId,
      isSimulating: true,
    }));

    try {
      const startRes = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", scenarioId }),
      });
      const startData = await startRes.json();
      console.log("Scenario started:", startData);
    } catch (e) {
      console.error("Failed to start scenario:", e);
      setState((s) => ({ ...s, isSimulating: false, error: "Failed to start scenario" }));
      return;
    }

    // Stream events with interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "next", batchSize: 1 }),
        });
        const data = await res.json();

        if (data.newEvents && data.newEvents.length > 0) {
          setState((s) => ({
            ...s,
            events: [...s.events, ...data.newEvents],
          }));
        }

        if (!data.isRunning) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setState((s) => ({ ...s, isSimulating: false }));
        }
      } catch (e) {
        console.error("Failed to fetch next events:", e);
      }
    }, 800);
  }, []);

  const loadAllEvents = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "all" }),
    });
    const data = await res.json();

    if (data.events) {
      setState((s) => ({
        ...s,
        events: data.events,
        isSimulating: false,
      }));
    }
  }, []);

  const analyzeEvents = useCallback(async () => {
    setState((s) => ({ ...s, isAnalyzing: true, error: null }));

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: state.events }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      setState((s) => ({
        ...s,
        incident: data.incident,
        toolCalls: data.toolCalls,
        agentContributions: data.agentContributions,
        isAnalyzing: false,
      }));
    } catch (error) {
      setState((s) => ({
        ...s,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      }));
    }
  }, [state.events]);

  const runCounterfactual = useCallback(
    async (action: string, target: string) => {
      if (!state.incident) return;

      try {
        const res = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            incident: state.incident,
            action,
            target,
          }),
        });

        if (!res.ok) throw new Error("Simulation failed");

        const result = await res.json();
        setState((s) => ({
          ...s,
          simulationResults: [...s.simulationResults, result],
        }));
      } catch (error) {
        setState((s) => ({
          ...s,
          error:
            error instanceof Error ? error.message : "Simulation failed",
        }));
      }
    },
    [state.incident]
  );

  const generateReport = useCallback(async () => {
    if (!state.incident) return;

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incident: state.incident,
          toolCalls: state.toolCalls,
          agentContributions: state.agentContributions,
        }),
      });

      if (!res.ok) throw new Error("Report generation failed");

      const data = await res.json();
      setState((s) => ({ ...s, reportMarkdown: data.markdown }));
    } catch (error) {
      setState((s) => ({
        ...s,
        error:
          error instanceof Error ? error.message : "Report generation failed",
      }));
    }
  }, [state.incident, state.toolCalls, state.agentContributions]);

  const resetAll = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });

    setState({
      scenarios: state.scenarios,
      assets: state.assets,
      events: [],
      activeScenarioId: null,
      isSimulating: false,
      isAnalyzing: false,
      incident: null,
      toolCalls: [],
      agentContributions: [],
      reportMarkdown: null,
      simulationResults: [],
      error: null,
    });
  }, [state.scenarios, state.assets]);

  return {
    state,
    fetchScenarios,
    fetchAssets,
    startScenario,
    loadAllEvents,
    analyzeEvents,
    runCounterfactual,
    generateReport,
    resetAll,
  };
}
