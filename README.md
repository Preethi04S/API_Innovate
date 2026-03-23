# SentinelMesh

**An ASI-powered cyber-physical defense copilot for smart spaces.**

SentinelMesh fuses IoT telemetry, access-control events, and security signals to detect, explain, and contain incidents in real time. It is built for campus IT teams, server-room operators, lab managers, and smart-building administrators who need a single command center for both cyber and physical threats.

---

## Problem Statement

Modern smart buildings generate thousands of signals per hour across sensors, access systems, cameras, and network infrastructure. When a security incident spans both the digital and physical domain — such as a rogue IoT camera exfiltrating data while someone enters the server room with a stolen badge — no single tool correlates these signals fast enough to act.

Existing solutions are siloed: network security tools miss physical events, building management systems ignore cyber threats, and manual correlation takes hours instead of seconds.

## Why SentinelMesh Matters

SentinelMesh closes the gap between cyber and physical security by treating a smart space as a unified threat surface. It automatically correlates events from different domains, identifies multi-vector incidents, and recommends concrete containment actions — all powered by ASI-1 as the reasoning engine.

## Why ASI-1 Is Essential

ASI-1 is the core intelligence behind SentinelMesh. It is not a wrapper or a chatbot — it is the reasoning engine that:

1. **Correlates cross-domain events** — ASI-1 receives raw telemetry from sensors, access logs, and network devices, then identifies patterns that span physical and digital systems.

2. **Produces structured incident analyses** — Every response follows a strict JSON schema with severity ratings, evidence chains, root cause hypotheses, and confidence scores.

3. **Calls tools autonomously** — ASI-1 decides when to look up playbooks, query asset inventories, check vulnerability databases, draft alerts, and simulate containment outcomes.

4. **Runs a multi-agent workflow** — Three specialist agents (Cyber Analyst, Facility Safety, Incident Commander) each analyze events through their domain lens, and ASI-1 synthesizes their findings into a coordinated plan.

5. **Simulates counterfactual outcomes** — ASI-1 projects the risk impact of different containment actions, enabling operators to compare "isolate device now" vs "delay containment" with supporting data.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Next.js Frontend                    │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌────────┐ │
│  │ Event    │ │ Incident  │ │ What-If  │ │ Report │ │
│  │ Stream   │ │ Board     │ │ Simulator│ │ Export │ │
│  └────┬─────┘ └─────┬─────┘ └────┬─────┘ └───┬────┘ │
│       │             │            │            │      │
│  ┌────┴─────────────┴────────────┴────────────┴────┐ │
│  │              React State (useSentinel)            │ │
│  └──────────────────────┬───────────────────────────┘ │
└─────────────────────────┼───────────────────────────┘
                          │ API Routes
┌─────────────────────────┼───────────────────────────┐
│  ┌──────────────────────┴───────────────────────┐   │
│  │           Telemetry Simulator Engine          │   │
│  │  (Seeded scenarios, deterministic playback)   │   │
│  └──────────────────────┬───────────────────────┘   │
│                         │                            │
│  ┌──────────────────────┴───────────────────────┐   │
│  │           ASI-1 Analysis Engine               │   │
│  │  ┌─────────────┐ ┌──────────┐ ┌───────────┐  │   │
│  │  │Cyber Analyst│ │ Facility │ │ Incident  │  │   │
│  │  │   Agent     │ │ Safety   │ │ Commander │  │   │
│  │  └──────┬──────┘ └────┬─────┘ └─────┬─────┘  │   │
│  │         └─────────────┴─────────────┘         │   │
│  │                  ↓ Synthesize                  │   │
│  │         ┌────────────────────┐                │   │
│  │         │  Tool-Calling Loop │                │   │
│  │         │  • lookup_playbook │                │   │
│  │         │  • query_asset_inv │                │   │
│  │         │  • check_vulns     │                │   │
│  │         │  • draft_alert     │                │   │
│  │         │  • sim_containment │                │   │
│  │         └────────────────────┘                │   │
│  └──────────────────────────────────────────────┘   │
│                     Next.js API Layer                 │
└──────────────────────────────────────────────────────┘
```

### Data Flow

1. User selects a demo scenario → Simulator emits telemetry events one by one
2. User clicks "Analyze with ASI-1" → Events are sent to the analysis engine
3. Three specialist agents analyze events in parallel through ASI-1
4. ASI-1 synthesizes agent findings and enters a tool-calling loop
5. Tools return playbook data, asset info, vulnerability checks, and containment simulations
6. Final structured incident analysis is rendered in the dashboard
7. User can run counterfactual simulations and export an incident report

---

## Key Features

### Live Telemetry Simulator
Four deterministic scenarios that simulate realistic cyber-physical events across a smart facility with multiple zones.

### ASI-Powered Incident Analysis
Structured JSON output from ASI-1 with severity, root cause, evidence chain, confidence score, and actionable recommendations.

### Tool-Calling Layer
Five tools that ASI-1 calls autonomously during analysis. The UI shows every tool call, its arguments, and results.

### Multi-Agent Specialist Workflow
Three visible specialist agents — Cyber Analyst, Facility Safety, Incident Commander — each contribute findings that are synthesized into a unified plan.

### Counterfactual What-If Simulator
Compare containment actions side by side: isolate device, revoke badge, delay containment, or ignore the event. See projected risk impact.

### Incident Report Export
Generate and download a comprehensive markdown report with evidence, ASI findings, agent contributions, and tool call history.

---

## Demo Scenarios

| Scenario | Description | Expected Severity |
|----------|-------------|-------------------|
| Rogue IoT Camera Exfiltration | Camera firmware compromised, large data transfer to external IP, USB insertion, network spike | Critical |
| Server Room Overheating + Unauthorized Access | HVAC failure, rising temperatures, unknown badge swipe during off-hours | Critical |
| Smart-Lock Abuse After Badge Anomaly | Rapid badge swipes across multiple zones during off-hours, failed login attempts | High |
| Cold-Storage Temperature Drift + Suspicious Entry | Temperatures rising above safe limits, temporary badge access, camera offline | High |

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm
- An ASI-1 API key from [ASI](https://asi1.ai)

### Installation

```bash
git clone <repo-url>
cd sentinel-mesh
npm install
cp .env.example .env.local
# Edit .env.local with your ASI-1 API key
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ASI_API_KEY` | Your ASI-1 API key | (required) |
| `ASI_BASE_URL` | ASI API base URL | `https://api.asi1.ai/v1` |
| `ASI_MODEL` | Model identifier | `asi1-mini` |

### Running

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
# Set environment variables in Vercel dashboard
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## ASI-1 Usage Explanation

### Structured Output
Every ASI-1 analysis response follows the `IncidentAnalysis` JSON schema defined in `src/lib/schemas/incident.ts`. The schema enforces fields for incident ID, severity, category, evidence array, affected assets, confidence score, recommended actions, escalation path, and alternative hypotheses. The backend parses and validates this output before rendering.

### Tool Calling
ASI-1 uses five tools during analysis:
- **lookup_playbook** — Retrieves standard response procedures for the incident category
- **query_asset_inventory** — Looks up device details, locations, and status
- **check_known_vulns** — Checks for CVEs affecting the identified device types
- **draft_alert_message** — Composes alert notifications for different stakeholder audiences
- **simulate_containment_action** — Projects the outcome of containment actions

The tool-calling loop runs for up to 5 iterations. Each tool call and its result are captured and displayed in the UI.

### Agent Workflow
Three specialist agents run as separate ASI-1 conversations:
1. **Cyber Analyst** — Focuses on network security, data exfiltration, and digital forensics
2. **Facility Safety** — Focuses on environmental hazards, physical access, and regulatory compliance
3. **Incident Commander** — Synthesizes findings from both specialists into a coordinated response plan

The agents run in parallel (Cyber Analyst + Facility Safety), then the Incident Commander synthesizes their outputs. All agent contributions are visible in the Agents tab.

---

## Tech Stack

- **Next.js 16** — React framework with API routes
- **TypeScript** — Type-safe throughout
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — Component library
- **OpenAI SDK** — ASI-1 API client (OpenAI-compatible)
- **Lucide React** — Icon system

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/     # ASI-1 incident analysis endpoint
│   │   ├── events/      # Telemetry simulator control
│   │   ├── report/      # Report generation
│   │   └── simulate/    # Counterfactual simulation
│   ├── layout.tsx
│   └── page.tsx         # Main dashboard
├── components/
│   ├── dashboard/       # Header, layout
│   ├── panels/          # All dashboard panels
│   └── ui/              # shadcn/ui components
└── lib/
    ├── asi/             # ASI-1 client & analysis engine
    ├── hooks/           # React hooks (useSentinel)
    ├── schemas/         # TypeScript types & JSON schemas
    ├── simulator/       # Telemetry engine & scenarios
    └── tools/           # Tool definitions & executors
```

---

## Future Work

- Real-time WebSocket event streaming
- Persistent incident database with SQLite
- Integration with real SIEM/SOAR platforms
- PDF report export
- Role-based access control
- Mobile responsive layout
- Python uAgents worker for distributed agent execution
- Alert notification via email/Slack webhooks

## Limitations

- Telemetry is simulated, not connected to real IoT devices
- Tool responses use curated reference data, not live vulnerability databases
- Single-instance in-memory state (no persistence across restarts)
- Agent routing is prompt-based, not a separate process runtime

---

*Built for API Innovate 2026*
