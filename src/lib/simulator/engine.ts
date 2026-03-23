import { TelemetryEvent } from "@/lib/schemas/events";
import { Scenario, buildScenarios } from "./scenarios";

export interface SimulatorState {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  emittedEvents: TelemetryEvent[];
  eventIndex: number;
  isRunning: boolean;
  startedAt: string | null;
}

export function createInitialState(): SimulatorState {
  return {
    scenarios: buildScenarios(new Date()),
    activeScenarioId: null,
    emittedEvents: [],
    eventIndex: 0,
    isRunning: false,
    startedAt: null,
  };
}

export function startScenario(
  state: SimulatorState,
  scenarioId: string
): SimulatorState {
  const scenario = state.scenarios.find((s) => s.id === scenarioId);
  if (!scenario) return state;

  return {
    ...state,
    activeScenarioId: scenarioId,
    emittedEvents: [],
    eventIndex: 0,
    isRunning: true,
    startedAt: new Date().toISOString(),
  };
}

export function emitNextBatch(
  state: SimulatorState,
  batchSize: number = 2
): { state: SimulatorState; newEvents: TelemetryEvent[] } {
  if (!state.isRunning || !state.activeScenarioId) {
    return { state, newEvents: [] };
  }

  const scenario = state.scenarios.find(
    (s) => s.id === state.activeScenarioId
  );
  if (!scenario) return { state, newEvents: [] };

  const end = Math.min(state.eventIndex + batchSize, scenario.events.length);
  const newEvents = scenario.events.slice(state.eventIndex, end);

  const isComplete = end >= scenario.events.length;

  return {
    state: {
      ...state,
      emittedEvents: [...state.emittedEvents, ...newEvents],
      eventIndex: end,
      isRunning: !isComplete,
    },
    newEvents,
  };
}

export function resetSimulator(): SimulatorState {
  return createInitialState();
}

export function getAllEventsForScenario(
  state: SimulatorState,
  scenarioId: string
): TelemetryEvent[] {
  const scenario = state.scenarios.find((s) => s.id === scenarioId);
  return scenario?.events ?? [];
}
