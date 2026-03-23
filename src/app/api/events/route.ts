import { NextResponse } from "next/server";
import {
  createInitialState,
  startScenario,
  emitNextBatch,
  resetSimulator,
  getAllEventsForScenario,
  SimulatorState,
} from "@/lib/simulator/engine";
import { FACILITY_ASSETS } from "@/lib/simulator/assets";

// Use globalThis to persist state across hot reloads and module re-evaluations
const globalStore = globalThis as unknown as {
  __sentinelSimulator?: SimulatorState;
};

function getState(): SimulatorState {
  if (!globalStore.__sentinelSimulator) {
    globalStore.__sentinelSimulator = createInitialState();
  }
  return globalStore.__sentinelSimulator;
}

function setState(s: SimulatorState) {
  globalStore.__sentinelSimulator = s;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const state = getState();

  switch (action) {
    case "scenarios":
      return NextResponse.json({
        scenarios: state.scenarios.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          expectedSeverity: s.expectedSeverity,
          eventCount: s.events.length,
        })),
      });

    case "assets":
      return NextResponse.json({ assets: FACILITY_ASSETS });

    case "state":
      return NextResponse.json({
        activeScenarioId: state.activeScenarioId,
        emittedEvents: state.emittedEvents,
        eventIndex: state.eventIndex,
        isRunning: state.isRunning,
        totalEvents: state.activeScenarioId
          ? getAllEventsForScenario(state, state.activeScenarioId).length
          : 0,
      });

    default:
      return NextResponse.json({
        status: "ok",
        activeScenario: state.activeScenarioId,
        eventsEmitted: state.emittedEvents.length,
        isRunning: state.isRunning,
      });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, scenarioId } = body;

  switch (action) {
    case "start": {
      if (!scenarioId) {
        return NextResponse.json(
          { error: "scenarioId is required" },
          { status: 400 }
        );
      }
      const current = getState();
      const newState = startScenario(current, scenarioId);
      setState(newState);
      return NextResponse.json({
        status: "started",
        scenarioId,
        totalEvents: getAllEventsForScenario(newState, scenarioId).length,
      });
    }

    case "next": {
      const batchSize = body.batchSize || 2;
      const current = getState();
      const { state: newState, newEvents } = emitNextBatch(current, batchSize);
      setState(newState);
      return NextResponse.json({
        newEvents,
        totalEmitted: newState.emittedEvents.length,
        isRunning: newState.isRunning,
      });
    }

    case "all": {
      const current = getState();
      if (current.activeScenarioId) {
        const all = getAllEventsForScenario(current, current.activeScenarioId);
        const newState: SimulatorState = {
          ...current,
          emittedEvents: all,
          eventIndex: all.length,
          isRunning: false,
        };
        setState(newState);
        return NextResponse.json({
          events: all,
          totalEmitted: all.length,
          isRunning: false,
        });
      }
      return NextResponse.json({ error: "No active scenario" }, { status: 400 });
    }

    case "reset": {
      setState(resetSimulator());
      return NextResponse.json({ status: "reset" });
    }

    default:
      return NextResponse.json(
        { error: `Unknown action: ${action}` },
        { status: 400 }
      );
  }
}
