# DATACENTER GUARDIAN AI

> **AI-powered predictive monitoring, incident response and infrastructure intelligence.**

Enterprise dark-mode datacenter intelligence platform featuring thermodynamic real-time telemetry simulation, rule-based ML-ready anomaly detection, historical incident memory retrieval (Guardian Memory), conversational incident investigation, and physics-correlated What-if simulation.

---

## 📸 Reference Screens & Core Modules

1. **Data Center Overview** (`/overview`): Executive telemetry dashboard, 4 primary KPIs, 8 live resource metrics, 5 Recharts time-series graphs, risk forecast (Low / Medium / High / Critical), and top risky servers.
2. **Live Monitoring** (`/monitoring`): Real-time pulse telemetry (CPU, RAM, Temp, Network, GPU, Power, Cooling, Water), 4 dynamic activity charts, server grid with status indicators (`HEALTHY`, `WARNING`, `CRITICAL`), and one-click diagnostics.
3. **Incident Center** (`/incidents`): Interactive anomaly registry with severity filtering (`ALL`, `CRITICAL`, `HIGH`, `MEDIUM`, `RESOLVED`), incident investigation drawer with timeline, symptoms, affected resources, root cause, resolution notes, and "Investigate with AI" handoff.
4. **Guardian Memory** (`/memory`): Persistent repository of historical incidents, actions, outcomes, and synthesized lessons learned (`Cooling`, `CPU`, `Database`, `Network`, `Power`).
5. **AI Guardian** (`/ai-guardian`): Conversational cognitive agent providing structured investigation reports:
   - Incident summary
   - Telemetry evidence
   - Historical similar cases from Guardian Memory
   - Risk assessment
   - Prescriptive recommended action
   - Confidence percentage
6. **Server Details** (`/server-details`): Detailed node telemetry (e.g. `DC-SRV-024`), 3 historical charts (CPU, Temperature, Power), and an automated AI condition evaluation card.
7. **What-if Simulator** (`/simulator`): Interactive physics & thermodynamic correlation engine with sliders for GPU/CPU workloads, temperature deltas, cooling modulation, server rack scale count, and network traffic.
8. **Microsoft Azure Integration Layer**: Clean abstraction conforming to the Microsoft Cloud Adoption Framework for Azure Monitor, Azure IoT Hub, Azure SQL, Azure Machine Learning, Azure OpenAI, and Power BI.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Python 3.14, FastAPI, SQLAlchemy ORM, Uvicorn.
- **Database**: SQLite (`datacenter.db`) with relational tables for Servers, Metric History, Incidents, Guardian Memory, AI Investigations, and Simulation Records.

---

## 🚀 Quick Start

### 1. Launching Both Services

You can launch both frontend and backend using:
```powershell
.\run.ps1
```
Or double-click `run.bat` on Windows.

### 2. Manual Startup

**Backend:**
```powershell
cd backend
python main.py
```
*Backend runs on `http://127.0.0.1:8000` with Swagger documentation at `http://127.0.0.1:8000/docs`.*

**Frontend:**
```powershell
cd frontend
npm run dev -- --host 127.0.0.1
```
*Frontend runs on `http://127.0.0.1:5173`.*

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check and agent readiness status |
| `GET` | `/api/dashboard` | Aggregated executive KPIs, risk forecast, charts |
| `GET` | `/api/monitoring` | Real-time telemetry pulse and 4 activity charts |
| `GET` | `/api/servers` | Fleet server registry |
| `GET` | `/api/servers/{id}` | Single server diagnostics, history, and AI evaluation |
| `GET` | `/api/servers/{id}/metrics` | Server metric history points |
| `GET` | `/api/incidents` | Incident list with severity/status filters |
| `GET` | `/api/incidents/{id}` | Incident detail with timeline and memory matches |
| `POST` | `/api/incidents/{id}/resolve` | Resolve an active incident |
| `GET` | `/api/memory` | Guardian Memory records with category/query filters |
| `GET` | `/api/memory/{id}` | Single memory record details |
| `POST` | `/api/ai/investigate` | Natural language AI incident investigation |
| `POST` | `/api/simulation` | What-if simulation calculator |
| `GET` | `/api/search` | Global instant search (servers, incidents, memories) |
| `GET` | `/api/azure/status` | Microsoft Azure integration readiness status |
