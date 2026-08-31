# 🟢 WhatsApp Model Context Protocol (MCP) Server & Command Center

Production-ready **WhatsApp MCP Server** featuring **Two-Pass Hybrid LLM Triage**, **Auto-Responder Automation with Deduplication Cooldowns**, **Real-Time SSE Gateway**, **9 Light-Mode NitroStudio Tool Widgets**, and a **Dedicated React 19 + Tailwind CSS Command Center Dashboard**.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![NitroStack](https://img.shields.io/badge/NitroStack-MCP%20Framework-emerald.svg)](https://nitrostack.ai)
[![React](https://img.shields.io/badge/React-19.2+-cyan.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Production%20Ready-blue.svg)](https://docker.com)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Passing-success.svg)](./src/evaluateMock.ts)

---

## 🏗️ Architecture Overview

The system operates on a dual-runtime architecture connecting AI agents (via STDIO Model Context Protocol) with a real-time web command center and background automation workers.

```
                        ┌─────────────────────────────────────────┐
                        │           CLIENT SURFACES               │
                        │  • Claude Desktop / Cursor IDE (STDIO)  │
                        │  • NitroStudio Visual Client            │
                        │  • Dedicated React Dashboard (Port 5173)│
                        │  • Express Web Gateway (Port 3000)      │
                        └────────────────────┬────────────────────┘
                                             │
                                             ▼
                        ┌─────────────────────────────────────────┐
                        │     DUAL-RUNTIME GATEWAY / BACKEND      │
                        │  • STDIO Model Context Protocol (MCP)   │
                        │  • Express REST API (CORS Enabled)      │
                        │  • SSE Real-Time Event Stream           │
                        │  • NitroStack Widget Dev Server (3001)  │
                        └────────────────────┬────────────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
        ┌───────────────────────────┐                 ┌───────────────────────────┐
        │   WHATSAPP SESSION CORE   │                 │    HYBRID TRIAGE ENGINE   │
        │ • whatsapp-web.js (LocalAuth)               │ • Pass 1: Fast-Path Regex │
        │ • Headless Chromium Engine│                 │ • Pass 2: Semantic LLM    │
        │ • Event Bus (src/bus.ts)  │                 │ • Dynamic Context Window  │
        └───────────────────────────┘                 └───────────────────────────┘
```

---

## ⚡ Key Capabilities

### 1. 🧠 Two-Pass Hybrid LLM & Fast-Path Triage Engine
- **Pass 1 (Fast-Path Regex)**: Instant $0\text{ms}$ detection for critical infrastructure outages, OTP authentication codes, and holiday broadcast noise.
- **Pass 2 (Semantic LLM Fallback)**: Evaluates sentiment (`distressed`, `urgent`, `frustrated`, `neutral`, `positive`), intent classification, and urgency scoring ($0.0 - 1.0$).
- **Dynamic Context Injection**: Injects sliding chat history (last 5 messages) into the evaluation context to detect multi-message escalations (e.g. repeated unanswered inquiries).
- **Priority Tiers**:
  - `CRITICAL` — Infrastructure down, OTP authentication, server/database failure, active disaster.
  - `URGENT` — High-stakes time limits ("today", "asap", "call me now", "deadline", repeated unanswered escalations).
  - `VIP` — C-suite executives, enterprise VIP clients, strategic partners (exempt from automated spam).
  - `NORMAL` — Routine transactional queries, pricing requests, general conversation.
  - `NOISE` — Chain forwards, holiday greetings, broadcast promotions.

### 2. 🛡️ Safety Filters & Deduplication
- **VIP Exemption**: VIP contacts are protected from automated bot spam.
- **Group Filter**: Automated replies are suppressed in `@g.us` group chats.
- **Cooldown Deduplication**: Enforces per-sender cooldowns (e.g., 30–60 min) to eliminate reply loops.
- **Human-in-the-Loop (HITL) Staging**: Outbound messages can be staged for manual 1-click review and approval before dispatch.

### 3. 🔌 Complete Model Context Protocol (MCP) Surface
- **9 MCP Tools**:
  1. `send_message` — Dispatch message with optional approval requirement.
  2. `get_urgent_messages` — Query recent high-priority messages with triage radar.
  3. `list_recent_chats` — Filter conversations by priority, groups, or direct chats.
  4. `fetch_chat_history` — Historical message timeline for a chat.
  5. `search_contacts` — Search contacts, phone numbers, and VIP tiers.
  6. `schedule_message` — Queue future timestamped message dispatches.
  7. `configure_auto_reply_rule` — Create exact, contains, or regex automation rules.
  8. `get_active_auto_replies` — List active rules with match execution metrics.
  9. `toggle_auto_responder` — Enable or pause specific automation rules dynamically.
- **4 MCP Resources**: `whatsapp://connection/status`, `whatsapp://contacts/vip-list`, `whatsapp://rules/urgency-keywords`, and `whatsapp://automation/auto-reply-rules`.
- **2 MCP Prompts**: `urgency_triage_assistant` (hybrid scoring) and `auto_reply_rule_generator`.

### 4. 🎨 9 Light-Mode NitroStudio Tool Widgets
Bundled interactive tool widgets optimized for NitroStudio:
- `send-message` — Delivery receipt & approval banner
- `urgent-messages` — Urgency Triage Radar
- `recent-chats` — WhatsApp Inbox Feed
- `chat-history` — Conversation Timeline transcript
- `search-contacts` — Contact & VIP Directory cards
- `schedule-message` — Scheduled Queue Manager
- `configure-auto-reply` — Auto-Reply Rule Builder
- `active-auto-replies` — Automation Rules Console
- `toggle-responder` — Rule State Switcher

### 5. 💻 Dedicated React 19 Command Center Dashboard
Located in `frontend/` (Vite + React 19 + TypeScript + Tailwind CSS v4):
- **3-Pane Split Viewport**: Filterable chat feed (`All`, `Urgent`, `VIPs`, `Staged Approvals`), chronological thread with badge indicators, and right-hand contact dossier inspector.
- **HITL Staging Modal**: 1-click Approve and Reject controls for staged messages.
- **Auto-Reply Rule Studio**: Visual builder for regex and keyword matchers with cooldown sliders.
- **Live Audit Drawer**: Terminal streaming raw MCP tool calls, triage scoring, and event bus telemetry in real time.
- **QR Authentication Modal**: Visual QR code pairing overlay with mobile linking steps.

### 6. 🚨 Automated Webhook Monitoring & Health Probes
- **Automated Webhooks**: Sends Slack / Discord notifications on session drops (`status_change: DISCONNECTED`) and incoming `CRITICAL` messages.
- **Liveness Probe (`/healthz`)**: Process uptime, memory metrics (`heapUsedMB`, `rssMB`), and runtime environment.
- **Readiness Probe (`/readyz`)**: WhatsApp engine state, Chromium process health, and Redis latency.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 22+
- npm 10+

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Run Offline Benchmark Suite
```bash
npm run evaluate
```
Runs the offline triage and auto-reply benchmark suite without needing a live WhatsApp connection, verifying:
- 100% Triage classification accuracy across all 5 priority tiers.
- 100% Auto-reply pattern matching, group safety, VIP protection, and cooldown deduplication.

### 4. Start Local Development Servers
```bash
# Start backend MCP Server + Express REST/SSE Gateway (Port 3000)
npm run dev

# In a separate terminal, start the dedicated Vite React Frontend (Port 5173)
cd frontend
npm run dev
```

### 5. Open in Browser
- **React Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend Live Dashboard**: [http://localhost:3000](http://localhost:3000)
- **NitroStudio Widgets Server**: [http://localhost:3001](http://localhost:3001)

---

## 🤖 Claude Desktop & Cursor MCP Configuration

### For **Claude Desktop**:
Add this configuration to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "whatsapp-triage": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/whatsapp/dist/index.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### For **Cursor IDE**:
A `.cursor/mcp.json` file is automatically provided in the root of the project:

```json
{
  "mcpServers": {
    "whatsapp-triage": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

---

## 🐳 Production Containerization (Docker Compose)

The project includes a multi-stage `Dockerfile` (Node 22 + Chromium + `dumb-init`), Redis 7 Alpine cache, and an Nginx reverse proxy with unbuffered Server-Sent Events (SSE).

```bash
# Build and launch all services in background
docker compose up --build -d

# View live backend logs and QR pairing code
docker compose logs -f whatsapp-backend

# Access production dashboard
http://localhost
```

---

## 📡 REST API & Webhook Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **`GET`** | `/api/stream` | Server-Sent Events (SSE) live bus event stream |
| **`GET`** | `/healthz` | Kubernetes Liveness Probe (Uptime, memory metrics) |
| **`GET`** | `/readyz` | Kubernetes Readiness Probe (WhatsApp state, Chromium health) |
| **`GET`** | `/api/status` | System health, connection status, and state snapshot |
| **`GET`** | `/api/messages` | List message history with priority classifications |
| **`POST`** | `/api/messages/send` | Send WhatsApp message with optional approval staging |
| **`GET`** | `/api/approvals` | List staged human-in-the-loop (HITL) approval messages |
| **`POST`** | `/api/approvals/:id/approve` | Approve and dispatch a staged message |
| **`POST`** | `/api/approvals/:id/reject` | Reject and cancel a staged message |
| **`GET`** | `/api/rules` | List all auto-reply rules (active/paused) |
| **`POST`** | `/api/rules` | Create or update an auto-reply rule |
| **`POST`** | `/api/rules/:id/toggle` | Toggle auto-reply rule state (`active` / `paused`) |
| **`DELETE`**| `/api/rules/:id` | Delete an auto-reply rule |
| **`GET`** | `/api/webhooks` | View active Slack/Discord webhook configuration |
| **`POST`** | `/api/webhooks` | Update alert webhook endpoints |
| **`POST`** | `/api/webhooks/test` | Trigger a test alert to verify webhook delivery |

---

## 🧪 Benchmark Accuracy Metrics

```
========================================================================
  🧪 WHATSAPP MCP HYBRID LLM TRIAGE EVALUATION BENCHMARK
========================================================================

  • Hybrid Classification Accuracy : 100.0% (8/8)  [✅ PASS]
  • Auto-Reply Decision Accuracy   : 100.0% (8/8)  [✅ PASS]
  • VIP Protection Filter          : 100%          [✅ PASS]
  • Group Chat Safety Filter       : 100%          [✅ PASS]
  • Cooldown Deduplication Engine  : 100%          [✅ PASS]
```

---

## 📄 License
MIT © Shreya Kumari
