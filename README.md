<div align="center">

<img src="https://img.shields.io/badge/ASI--1-Powered-8b5cf6?style=for-the-badge&logo=sparkles&logoColor=white" />
<img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4.0-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Multi--Agent_AI-3_Specialists-10b981?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge" />

<br/><br/>

# 🛡️ SentinelMesh

### Cyber-Physical Defense Copilot — Powered by ASI-1

> *The world's first multi-agent AI security operations platform that fuses cyber and physical threat intelligence into a single, real-time decision support system.*

<br/>

[![▶ Watch Demo](https://img.shields.io/badge/▶_Watch_Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](#)
[![🚀 Live Demo](https://img.shields.io/badge/🚀_Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](#)
[![🏗 Architecture](https://img.shields.io/badge/🏗_Architecture_Diagram_(Interactive)-1e293b?style=for-the-badge)](./docs/architecture.html)

</div>

---

## 🎯 The Problem

Modern smart spaces — laboratories, data centers, manufacturing plants — face attacks that span **both cyber and physical domains simultaneously**:

- A rogue IoT device is plugged into the network rack **while** a camera is taken offline
- An attacker exploits a firmware CVE **while** motion sensors detect unauthorized presence
- 2.4 GB of research data is exfiltrated **while** credentials are being brute-forced

Today's security tools treat these as **separate problems**. SIEM systems see the network spike but miss the camera blackout. Physical security teams see the badge anomaly but miss the data transfer. **No existing tool correlates these signals in real-time.**

---

## 💡 The Solution

**SentinelMesh** is an AI-powered cyber-physical security copilot that:

| Step | What Happens |
|---|---|
| **① Ingest** | Collects telemetry from cameras, motion sensors, network monitors, access control, HVAC |
| **② Analyze** | Runs 3 specialist ASI-1 agents **in parallel** — Cyber Analyst, Facility Safety, Incident Commander |
| **③ Enrich** | Pre-executes 5 security tools and injects results as context into ASI-1 |
| **④ Synthesize** | Produces a unified incident report with confidence score in under 90 seconds |
| **⑤ Act** | Enables counterfactual simulation, natural language Q&A, and one-click report generation |

---

## ✨ Key Features

<table>
<tr>
<td width="50%" valign="top">

**🤖 Multi-Agent AI Pipeline**

Three specialist agents run in parallel:
- 🔵 **Cyber Analyst** — Network forensics, data exfiltration, C2 detection
- 🟡 **Facility Safety** — Physical access, environmental hazards, OSHA
- 🟢 **Incident Commander** — Cross-agent synthesis, executive IR briefing

Each agent produces structured findings + recommendations that feed the final incident synthesis.

</td>
<td width="50%" valign="top">

**⚡ Instant Demo Mode**

One click loads a full CRITICAL incident in 3 seconds:
- Pre-cached real-world attack scenario
- 7 correlated telemetry events
- 3 agent reports + 5 tool results
- 96% confidence incident card
- Kill chain, copilot, report — all ready

</td>
</tr>
<tr>
<td valign="top">

**🔗 MITRE ATT&CK Kill Chain**

Real-time attack stage visualization:
- Events mapped to ATT&CK tactics automatically
- Stages animate as events are detected
- `Recon → Initial Access → Execution → Persistence → Exfiltration`
- Switches from chart view when incident is active

</td>
<td valign="top">

**💬 Ask ASI-1 Copilot**

Natural language Q&A about any active incident:
- *"What should I do first?"*
- *"Is the exfiltration still active?"*
- *"How did the attacker get in?"*
- Full incident context + agent findings injected
- Live response with typing animation

</td>
</tr>
<tr>
<td valign="top">

**⚗️ What-If Counterfactual Simulator**

Test containment strategies before executing:

| Action | Risk Delta |
|---|---|
| `isolate_device` | **-72%** ✅ |
| `revoke_badge` | -45% |
| `delay_containment` | +2% ⚠ |
| `ignore_event` | +18% ❌ |

</td>
<td valign="top">

**📄 Auto-Generated Incident Reports**

One-click professional documentation:
- Executive summary + evidence chain
- Agent findings + tool outputs
- Escalation path + regulatory notes
- Downloadable `.md` for compliance filing
- Rendered markdown with proper formatting

</td>
</tr>
</table>

---

## 🏗 Architecture

> ### 📐 [Open Interactive Architecture Diagram →](./docs/architecture.html)
> *Zoomable · Pannable · Click any node for detailed description*

```
╔═══════════════════════════════════════════════════════════════╗
║  ① DATA SOURCES — Cyber-Physical Sensors                     ║
║  📷 Cameras  🚶 Motion  🔐 Access  🌐 Network  🌡 HVAC  🛰 Intel║
╚══════════════════════════╦════════════════════════════════════╝
                           ║ Telemetry Events
╔══════════════════════════▼════════════════════════════════════╗
║  ② TELEMETRY EVENT STREAM                                    ║
║  Schema normalization · Zone mapping · Timestamp correlation  ║
╚══════════════════════════╦════════════════════════════════════╝
                           ║
╔══════════════════════════▼════════════════════════════════════╗
║  ③ ASI-1 REASONING ENGINE (asi1-mini)                        ║
║  ┌──────────────┐  ┌───────────────────┐  ┌───────────────┐  ║
║  │🔵 Cyber      │  │ 🟡 Facility Safety│  │🟢 Incident Cmd│  ║
║  │   Analyst    │  │   Physical · OSHA │  │  Synthesis·IR │  ║
║  └──────┬───────┘  └────────┬──────────┘  └──────┬────────┘  ║
╚═════════╬═══════════════════╬═════════════════════╬══════════╝
          ║                   ║                     ║
╔═════════▼═══════════════════▼═════════════════════▼══════════╗
║  ④ TOOL EXECUTION LAYER (5 Tools Pre-Executed)               ║
║  📋 lookup_playbook    🗃 query_asset_inventory               ║
║  🔍 check_known_vulns  📨 draft_alert_message                ║
║  ⚗️  simulate_containment_action                              ║
╚══════════════════════════╦════════════════════════════════════╝
                           ║
╔══════════════════════════▼════════════════════════════════════╗
║  ⑤ INTELLIGENCE OUTPUT                                       ║
║  🚨 Incident(96%)  ⛓ Kill Chain  ⚗ What-If Sim              ║
║  💬 Ask Copilot    📄 Report      🚨 Critical Alert           ║
╚═══════════════════════════════════════════════════════════════╝
```

### 🔧 The ASI-1 Tool-Calling Workaround

ASI-1 does not support the `tools` parameter (returns `422`). SentinelMesh solves this with a **prompt-injection workaround**:

```typescript
// ❌ Native tool calling (ASI-1 returns 422)
// client.chat({ tools: [...] })

// ✅ SentinelMesh workaround
function preRunTools(events: TelemetryEvent[]) {
  // 1. Pre-execute all 5 tools based on event analysis
  const playbook = lookupPlaybook(detectIncidentType(events));
  const assets   = queryAssetInventory(extractAssetIds(events));
  const vulns    = checkKnownVulns(assets);
  const alert    = draftAlertMessage(severity, zones);
  const sim      = simulateContainment(primaryAction, target);

  // 2. Inject all results as structured context into ASI-1 prompt
  return buildContextString({ playbook, assets, vulns, alert, sim });
}

// 3. ASI-1 reasons with full tool context — zero native tool support needed
const response = await asi1.chat({ messages: [{ role: "system", content: promptWithContext }] });
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- ASI-1 API key from [asi1.ai](https://asi1.ai)

### Installation

```bash
git clone https://github.com/yourusername/sentinel-mesh.git
cd sentinel-mesh
npm install
```

### Environment

```bash
# .env.local
ASI_API_KEY=your_asi1_api_key_here
ASI_BASE_URL=https://api.asi1.ai/v1
ASI_MODEL=asi1-mini
```

### Run

```bash
npm run dev
# Open http://localhost:3000
```

### ⚡ No API Key? Use Instant Demo
Click **`⚡ Instant Demo`** in the header — loads a full CRITICAL incident analysis in 3 seconds with pre-cached results. No API key required.

---

## 🎬 Demo Scenarios

| Scenario | Severity | Events | Attack Vector |
|---|---|---|---|
| 🎥 **Rogue IoT Camera Exfiltration** | `CRITICAL` | 7 | Rogue device + USB malware + 2.4GB theft |
| 🔥 **Server Room Overheating + Breach** | `HIGH` | 5 | HVAC failure + unauthorized access |
| 🔐 **Smart-Lock Badge Abuse** | `HIGH` | 5 | Stolen credential + off-hours access |
| 🌡 **Cold Storage Temperature Drift** | `HIGH` | 5 | Environmental anomaly + suspicious entry |

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16.2 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **AI Model** | ASI-1 (asi1-mini) via OpenAI-compatible SDK |
| **Charts** | Recharts (area chart, threat timeline) |
| **Icons** | Lucide React |
| **State** | React hooks (useState, useCallback, useRef) |
| **API** | Next.js App Router API routes |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
sentinel-mesh/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/    # Multi-agent ASI-1 analysis
│   │   │   ├── copilot/    # Ask ASI-1 Q&A endpoint
│   │   │   ├── events/     # Telemetry event simulation
│   │   │   ├── report/     # Incident report generation
│   │   │   └── simulate/   # What-If counterfactual
│   │   └── page.tsx        # Main dashboard
│   ├── components/
│   │   ├── dashboard/      # Header
│   │   └── panels/         # All dashboard panels
│   └── lib/
│       ├── asi/            # ASI-1 client + multi-agent logic
│       ├── demo/           # Instant demo cached result
│       ├── hooks/          # useSentinel state hook
│       ├── schemas/        # TypeScript schemas
│       ├── simulator/      # Event simulation engine
│       └── tools/          # 5 security tool implementations
└── docs/
    └── architecture.html   # Interactive architecture diagram
```

---

## 🏆 Hackathon: API Innovate 2026

Built for **API Innovate 2026** on Devpost · ₹10,000 Prize · 375 Participants

**Key innovations:**
- ✅ First project to use ASI-1 for multi-agent security orchestration
- ✅ Novel prompt-injection workaround for ASI-1's tool-calling limitation
- ✅ Cyber-physical threat fusion — first-of-its-kind sensor correlation
- ✅ Real-time counterfactual simulation with risk quantification
- ✅ Interactive MITRE ATT&CK kill chain visualization

---

## 📄 License

MIT © 2026 SentinelMesh

---

<div align="center">

**Built with ❤️ and ASI-1**

*Securing Smart Spaces with Superintelligent AI*

</div>
