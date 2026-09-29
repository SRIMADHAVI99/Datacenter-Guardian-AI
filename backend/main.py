"""
DataCenter Guardian AI - FastAPI Application
Enterprise backend with real-time telemetry, anomaly detection,
Guardian Memory retrieval, and What-if simulation.
"""

import asyncio
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from database import get_db, init_db, Server, ServerMetricHistory, Incident, GuardianMemory, AIInvestigation, SimulationRecord, SessionLocal
from seed_data import seed_database
from simulator import simulator
from anomaly_engine import anomaly_detector
from ai_engine import ai_engine
from azure_integration import azure_manager

# Background task for periodic telemetry simulation
simulation_task = None

async def run_telemetry_loop():
    while True:
        try:
            await asyncio.sleep(4) # Tick every 4 seconds for a dynamic feel
            db = SessionLocal()
            try:
                simulator.tick(db)
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error in telemetry loop: {e}")
            await asyncio.sleep(5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and seed demo data on startup
    init_db()
    seed_database()
    global simulation_task
    simulation_task = asyncio.create_task(run_telemetry_loop())
    yield
    if simulation_task:
        simulation_task.cancel()

app = FastAPI(
    title="DataCenter Guardian AI API",
    description="AI-powered predictive monitoring, incident response and infrastructure intelligence",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request / Response Pydantic Schemas ---
class AIInvestigateRequest(BaseModel):
    query: str
    server_id: Optional[str] = None

class SimulationRequest(BaseModel):
    base_server_id: Optional[str] = None
    cpu_workload_delta: float = 0.0 # e.g. +30%
    gpu_workload_delta: float = 0.0 # e.g. +30%
    ambient_temp_delta: float = 0.0 # e.g. +5°C
    cooling_capacity_delta: float = 0.0 # e.g. -15%
    server_count_delta: int = 0
    network_traffic_delta: float = 0.0

class ResolveIncidentRequest(BaseModel):
    action_taken: str
    resolution_notes: Optional[str] = None

# --- API Endpoints ---

@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "monitoring_engine": "online",
        "memory_store": "connected",
        "guardian_agent": "ready",
        "system_operational": True
    }

@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    servers = db.query(Server).all()
    incidents = db.query(Incident).all()

    total_servers = len(servers)
    active_incidents = [i for i in incidents if i.status in ["ACTIVE", "INVESTIGATING"]]
    critical_count = sum(1 for s in servers if s.status == "CRITICAL")
    warning_count = sum(1 for s in servers if s.status == "WARNING")
    healthy_count = sum(1 for s in servers if s.status == "HEALTHY")

    # Averages
    avg_cpu = round(sum(s.cpu for s in servers) / max(1, total_servers), 1)
    avg_ram = round(sum(s.ram for s in servers) / max(1, total_servers), 1)
    avg_gpu = round(sum(s.gpu for s in servers) / max(1, total_servers), 1)
    avg_temp = round(sum(s.temperature for s in servers) / max(1, total_servers), 1)
    avg_power = round(sum(s.power for s in servers) / max(1, total_servers), 1)
    avg_cooling = round(sum(s.cooling for s in servers) / max(1, total_servers), 1)
    total_water = round(sum(s.water_usage for s in servers), 1)
    total_network = round(sum(s.network for s in servers), 1)

    # Health %
    overall_health = round(((healthy_count + warning_count * 0.5) / max(1, total_servers)) * 100, 1)

    # Risk forecast distribution
    risk_low = sum(1 for s in servers if s.risk_score < 30)
    risk_medium = sum(1 for s in servers if 30 <= s.risk_score < 60)
    risk_high = sum(1 for s in servers if 60 <= s.risk_score < 80)
    risk_critical = sum(1 for s in servers if s.risk_score >= 80)

    # Top risky servers
    risky_servers = sorted(servers, key=lambda s: s.risk_score, reverse=True)[:5]
    top_risky = [
        {
            "id": s.id,
            "server_id": s.server_id,
            "zone": s.zone,
            "role": s.role,
            "health": s.status,
            "cpu": s.cpu,
            "ram": s.ram,
            "temperature": s.temperature,
            "risk_score": s.risk_score
        }
        for s in risky_servers
    ]

    # Time series data for executive charts
    # Aggregate from ServerMetricHistory for the last 10 points
    history_points = db.query(ServerMetricHistory).filter(ServerMetricHistory.server_id == "DC-SRV-024").order_by(ServerMetricHistory.id.desc()).limit(10).all()
    history_points.reverse()

    trend_data = [
        {
            "time": hp.timestamp,
            "cpu": hp.cpu,
            "temperature": hp.temperature,
            "power": hp.power,
            "cooling": hp.cooling
        }
        for hp in history_points
    ]

    return {
        "kpi": {
            "infrastructure_health": overall_health,
            "active_incidents": len(active_incidents),
            "predicted_failures": risk_critical + (1 if risk_high > 1 else 0),
            "energy_efficiency": round(100.0 - (avg_power / 10.0), 1),
            "cpu": avg_cpu,
            "ram": avg_ram,
            "gpu": avg_gpu,
            "temperature": avg_temp,
            "network": total_network,
            "power": avg_power,
            "cooling": avg_cooling,
            "water_usage": total_water
        },
        "risk_forecast": {
            "low": risk_low,
            "medium": risk_medium,
            "high": risk_high,
            "critical": risk_critical
        },
        "health_distribution": [
            {"name": "Healthy", "value": healthy_count, "color": "#10b981"},
            {"name": "Warning", "value": warning_count, "color": "#f59e0b"},
            {"name": "Critical", "value": critical_count, "color": "#ef4444"}
        ],
        "top_risky_servers": top_risky,
        "trend_data": trend_data
    }

@app.get("/api/monitoring")
def get_monitoring(db: Session = Depends(get_db)):
    servers = db.query(Server).all()
    total = len(servers)

    avg_cpu = round(sum(s.cpu for s in servers) / max(1, total), 1)
    avg_ram = round(sum(s.ram for s in servers) / max(1, total), 1)
    avg_gpu = round(sum(s.gpu for s in servers) / max(1, total), 1)
    avg_temp = round(sum(s.temperature for s in servers) / max(1, total), 1)
    avg_net = round(sum(s.network for s in servers) / max(1, total), 1)
    avg_power = round(sum(s.power for s in servers) / max(1, total), 1)
    avg_cooling = round(sum(s.cooling for s in servers) / max(1, total), 1)
    total_water = round(sum(s.water_usage for s in servers), 1)

    # 4 distinct telemetry activity charts (recent 12 points)
    h_points = db.query(ServerMetricHistory).filter(ServerMetricHistory.server_id == "DC-SRV-024").order_by(ServerMetricHistory.id.desc()).limit(12).all()
    h_points.reverse()

    activity_chart = [
        {"time": h.timestamp, "cpu": h.cpu, "ram": h.ram, "gpu": h.gpu}
        for h in h_points
    ]
    temperature_chart = [
        {"time": h.timestamp, "temperature": h.temperature, "threshold": 80.0}
        for h in h_points
    ]
    power_chart = [
        {"time": h.timestamp, "power": h.power, "baseline": 420.0}
        for h in h_points
    ]
    network_chart = [
        {"time": h.timestamp, "throughput": h.network}
        for h in h_points
    ]

    server_grid = [
        {
            "id": s.id,
            "server_id": s.server_id,
            "zone": s.zone,
            "role": s.role,
            "status": s.status,
            "cpu": s.cpu,
            "ram": s.ram,
            "gpu": s.gpu,
            "temperature": s.temperature,
            "network": s.network,
            "power": s.power,
            "cooling": s.cooling,
            "water_usage": s.water_usage,
            "risk_score": s.risk_score
        }
        for s in servers
    ]

    return {
        "kpi": {
            "cpu": avg_cpu,
            "ram": avg_ram,
            "temperature": avg_temp,
            "network": avg_net,
            "gpu": avg_gpu,
            "power": avg_power,
            "cooling": avg_cooling,
            "water": total_water
        },
        "charts": {
            "activity": activity_chart,
            "temperature": temperature_chart,
            "power": power_chart,
            "network": network_chart
        },
        "servers": server_grid
    }

@app.get("/api/servers")
def get_servers(db: Session = Depends(get_db)):
    servers = db.query(Server).all()
    return servers

@app.get("/api/servers/{server_id}")
def get_server_detail(server_id: str, db: Session = Depends(get_db)):
    server = db.query(Server).filter(or_(Server.server_id == server_id, Server.id == server_id)).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    # Fetch last 15 historical metric points
    history = db.query(ServerMetricHistory).filter(ServerMetricHistory.server_id == server.server_id).order_by(ServerMetricHistory.id.desc()).limit(15).all()
    history.reverse()

    # Find incidents for this server
    incidents = db.query(Incident).filter(Incident.server_id == server.server_id).all()

    # Synthesize AI Analysis card for this server
    anomalies = anomaly_detector.calculate_risk_score(
        cpu=server.cpu, ram=server.ram, gpu=server.gpu, temp=server.temperature, power=server.power, cooling=server.cooling
    )

    if server.status == "CRITICAL":
        condition = f"Thermal degradation detected. Chassis operating at {server.temperature}°C."
        predicted_issue = "Component thermal throttling leading to failover within 45 minutes."
        root_cause = "Cooling system efficiency loss (currently 54%) combined with high GPU workload."
        recommended_action = "Drain incoming workloads to Cluster B and increase chilled coolant pressure."
    elif server.status == "WARNING":
        condition = f"Elevated resource utilization. Risk score elevated to {server.risk_score}/100."
        predicted_issue = "Resource bottleneck may cause connection latency spikes under burst."
        root_cause = "Sustained high compute saturation and localized temperature rise."
        recommended_action = "Apply workload throttling and verify cooling fan intake."
    else:
        condition = "Nominal operation. All telemetry parameters within ASHRAE enterprise tolerances."
        predicted_issue = "No predicted failure in the next 72 hours."
        root_cause = "None detected."
        recommended_action = "Maintain standard automated polling."

    return {
        "server": server,
        "history": [
            {
                "time": h.timestamp,
                "cpu": h.cpu,
                "ram": h.ram,
                "gpu": h.gpu,
                "temperature": h.temperature,
                "power": h.power,
                "network": h.network
            }
            for h in history
        ],
        "incidents": incidents,
        "ai_analysis": {
            "current_condition": condition,
            "predicted_issue": predicted_issue,
            "root_cause": root_cause,
            "recommended_action": recommended_action,
            "risk_score": server.risk_score,
            "anomalies": anomalies["anomalies"]
        }
    }

@app.get("/api/servers/{server_id}/metrics")
def get_server_metrics(server_id: str, db: Session = Depends(get_db)):
    history = db.query(ServerMetricHistory).filter(ServerMetricHistory.server_id == server_id).order_by(ServerMetricHistory.id.desc()).limit(20).all()
    history.reverse()
    return history

@app.get("/api/incidents")
def get_incidents(severity: Optional[str] = None, status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Incident)
    if severity and severity.upper() != "ALL":
        query = query.filter(Incident.severity == severity.upper())
    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(Incident.status == status_filter.upper())
    return query.order_by(Incident.id.desc()).all()

@app.get("/api/incidents/{incident_id}")
def get_incident_detail(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(or_(Incident.incident_id == incident_id, Incident.id == incident_id)).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Find previous similar incidents and Guardian Memory
    similar_memories = ai_engine.find_similar_memories(incident.incident_type, incident.server_id, db)

    # Timeline simulation
    timeline = [
        {"time": "T-30m", "event": "Telemetry detected initial variance from normal operating envelope."},
        {"time": "T-15m", "event": f"Symptom triggered alert: {incident.symptoms}"},
        {"time": "T-05m", "event": "Guardian AI automated diagnosis confirmed root-cause hypothesis."},
        {"time": "Now", "event": f"Status is {incident.status} with recommendation: {incident.recommended_action}"}
    ]

    return {
        "incident": incident,
        "timeline": timeline,
        "similar_memories": similar_memories[:2],
        "affected_resources": incident.affected_resources,
        "symptoms": incident.symptoms,
        "impact": incident.impact,
        "root_cause": incident.root_cause,
        "recommended_action": incident.recommended_action,
        "resolution_notes": incident.resolution_notes
    }

@app.post("/api/incidents/{incident_id}/resolve")
def resolve_incident(incident_id: str, req: ResolveIncidentRequest, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(or_(Incident.incident_id == incident_id, Incident.id == incident_id)).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = "RESOLVED"
    incident.resolution_notes = req.resolution_notes or f"Action taken: {req.action_taken}"

    # Also normalize server status if it was DC-SRV-024
    server = db.query(Server).filter(Server.server_id == incident.server_id).first()
    if server:
        server.cooling = 85.0
        server.temperature = 65.0
        server.status = "HEALTHY"
        server.risk_score = 15.0

    db.commit()
    return {"message": "Incident resolved successfully", "incident": incident}

@app.get("/api/memory")
def get_memory(category: Optional[str] = None, q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(GuardianMemory)
    if category and category.lower() != "all":
        query = query.filter(func.lower(GuardianMemory.category) == category.lower())
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            or_(
                GuardianMemory.title.ilike(search_pattern),
                GuardianMemory.lesson.ilike(search_pattern),
                GuardianMemory.action.ilike(search_pattern),
                GuardianMemory.server_id.ilike(search_pattern)
            )
        )
    return query.order_by(GuardianMemory.memory_num.desc()).all()

@app.get("/api/memory/{memory_id}")
def get_single_memory(memory_id: int, db: Session = Depends(get_db)):
    memory = db.query(GuardianMemory).filter(or_(GuardianMemory.memory_num == memory_id, GuardianMemory.id == memory_id)).first()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory record not found")
    return memory

@app.post("/api/ai/investigate")
def investigate_ai(req: AIInvestigateRequest, db: Session = Depends(get_db)):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    result = ai_engine.investigate(req.query, req.server_id, db)
    return result

@app.post("/api/simulation")
def run_simulation(req: SimulationRequest, db: Session = Depends(get_db)):
    # Baseline server metrics or datacenter averages
    if req.base_server_id:
        srv = db.query(Server).filter(Server.server_id == req.base_server_id).first()
        base_cpu = srv.cpu if srv else 50.0
        base_gpu = srv.gpu if srv else 40.0
        base_temp = srv.temperature if srv else 65.0
        base_cooling = srv.cooling if srv else 85.0
        base_power = srv.power if srv else 450.0
    else:
        base_cpu = 50.0
        base_gpu = 40.0
        base_temp = 65.0
        base_cooling = 85.0
        base_power = 450.0

    prediction = anomaly_detector.predict_what_if(
        base_cpu=base_cpu,
        base_gpu=base_gpu,
        base_temp=base_temp,
        base_cooling=base_cooling,
        base_power=base_power,
        cpu_delta=req.cpu_workload_delta,
        gpu_delta=req.gpu_workload_delta,
        temp_delta=req.ambient_temp_delta,
        cooling_delta=req.cooling_capacity_delta,
        server_count_delta=req.server_count_delta,
        network_delta=req.network_traffic_delta
    )

    # Persist simulation result for audit
    sim_record = SimulationRecord(
        cpu_delta=req.cpu_workload_delta,
        gpu_delta=req.gpu_workload_delta,
        temp_delta=req.ambient_temp_delta,
        cooling_delta=req.cooling_capacity_delta,
        server_count_delta=req.server_count_delta,
        network_delta=req.network_traffic_delta,
        predicted_power=prediction["predicted_state"]["power_watts"],
        predicted_temp=prediction["predicted_state"]["temperature"],
        predicted_cooling=prediction["predicted_state"]["cooling_requirement_delta_pct"],
        predicted_risk=prediction["predicted_state"]["failure_risk"],
        recommendation=prediction["ai_recommendation"]
    )
    db.add(sim_record)
    db.commit()

    return {
        "current_state": {
            "cpu": base_cpu,
            "gpu": base_gpu,
            "temperature": base_temp,
            "cooling": base_cooling,
            "power": base_power,
            "failure_risk": 18.0
        },
        "simulation": prediction
    }

@app.get("/api/search")
def search_all(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    search_pat = f"%{q}%"
    servers = db.query(Server).filter(
        or_(
            Server.server_id.ilike(search_pat),
            Server.zone.ilike(search_pat),
            Server.role.ilike(search_pat)
        )
    ).limit(5).all()

    incidents = db.query(Incident).filter(
        or_(
            Incident.incident_id.ilike(search_pat),
            Incident.incident_type.ilike(search_pat),
            Incident.server_id.ilike(search_pat),
            Incident.description.ilike(search_pat)
        )
    ).limit(5).all()

    memories = db.query(GuardianMemory).filter(
        or_(
            GuardianMemory.title.ilike(search_pat),
            GuardianMemory.lesson.ilike(search_pat),
            GuardianMemory.server_id.ilike(search_pat),
            GuardianMemory.action.ilike(search_pat)
        )
    ).limit(5).all()

    return {
        "query": q,
        "servers": [{"id": s.id, "server_id": s.server_id, "zone": s.zone, "status": s.status, "risk_score": s.risk_score} for s in servers],
        "incidents": [{"id": i.id, "incident_id": i.incident_id, "server_id": i.server_id, "severity": i.severity, "type": i.incident_type, "status": i.status} for i in incidents],
        "memories": [{"id": m.id, "memory_num": m.memory_num, "title": m.title, "server_id": m.server_id, "category": m.category} for m in memories]
    }

@app.get("/api/azure/status")
def get_azure_status():
    return azure_manager.get_integration_status()

class RemediationRequest(BaseModel):
    server_id: str
    playbook_id: Optional[str] = "PB-COOL-904"

@app.get("/api/floorplan")
def get_floorplan(db: Session = Depends(get_db)):
    servers = db.query(Server).all()
    server_map = {s.server_id: s for s in servers}

    rows = [
        {
            "row_id": "Row-A",
            "name": "Row A — Edge Gateway & Ingress",
            "aisle_type": "Cold Aisle",
            "racks": [
                {
                    "rack_id": "Rack A-01",
                    "server_id": "DC-SRV-001",
                    "server": server_map.get("DC-SRV-001"),
                    "temp": server_map.get("DC-SRV-001").temperature if "DC-SRV-001" in server_map else 58.0,
                    "status": server_map.get("DC-SRV-001").status if "DC-SRV-001" in server_map else "HEALTHY",
                    "flow_cfm": 820,
                    "u_height": 42
                },
                {
                    "rack_id": "Rack A-02",
                    "server_id": "DC-SRV-002",
                    "server": server_map.get("DC-SRV-002"),
                    "temp": server_map.get("DC-SRV-002").temperature if "DC-SRV-002" in server_map else 61.0,
                    "status": server_map.get("DC-SRV-002").status if "DC-SRV-002" in server_map else "HEALTHY",
                    "flow_cfm": 840,
                    "u_height": 42
                }
            ]
        },
        {
            "row_id": "Row-B",
            "name": "Row B — Microservices & Relational DB",
            "aisle_type": "Hot Aisle Exhaust",
            "racks": [
                {
                    "rack_id": "Rack B-01",
                    "server_id": "DC-SRV-009",
                    "server": server_map.get("DC-SRV-009"),
                    "temp": server_map.get("DC-SRV-009").temperature if "DC-SRV-009" in server_map else 74.0,
                    "status": server_map.get("DC-SRV-009").status if "DC-SRV-009" in server_map else "WARNING",
                    "flow_cfm": 760,
                    "u_height": 42
                },
                {
                    "rack_id": "Rack B-03",
                    "server_id": "DC-SRV-017",
                    "server": server_map.get("DC-SRV-017"),
                    "temp": server_map.get("DC-SRV-017").temperature if "DC-SRV-017" in server_map else 76.0,
                    "status": server_map.get("DC-SRV-017").status if "DC-SRV-017" in server_map else "WARNING",
                    "flow_cfm": 740,
                    "u_height": 42
                }
            ]
        },
        {
            "row_id": "Row-C",
            "name": "Row C — High-Density AI Training",
            "aisle_type": "Liquid Loop Containment",
            "racks": [
                {
                    "rack_id": "Rack C-02",
                    "server_id": "DC-SRV-024",
                    "server": server_map.get("DC-SRV-024"),
                    "temp": server_map.get("DC-SRV-024").temperature if "DC-SRV-024" in server_map else 82.4,
                    "status": server_map.get("DC-SRV-024").status if "DC-SRV-024" in server_map else "CRITICAL",
                    "flow_cfm": 610,
                    "u_height": 42
                },
                {
                    "rack_id": "Rack C-04",
                    "server_id": "DC-SRV-031",
                    "server": server_map.get("DC-SRV-031"),
                    "temp": server_map.get("DC-SRV-031").temperature if "DC-SRV-031" in server_map else 55.0,
                    "status": server_map.get("DC-SRV-031").status if "DC-SRV-031" in server_map else "HEALTHY",
                    "flow_cfm": 910,
                    "u_height": 42
                }
            ]
        },
        {
            "row_id": "Row-D",
            "name": "Row D — Distributed GPU Clusters",
            "aisle_type": "Cold Aisle",
            "racks": [
                {
                    "rack_id": "Rack D-01",
                    "server_id": "DC-SRV-042",
                    "server": server_map.get("DC-SRV-042"),
                    "temp": server_map.get("DC-SRV-042").temperature if "DC-SRV-042" in server_map else 73.0,
                    "status": server_map.get("DC-SRV-042").status if "DC-SRV-042" in server_map else "WARNING",
                    "flow_cfm": 780,
                    "u_height": 42
                },
                {
                    "rack_id": "Rack D-03",
                    "server_id": "DC-SRV-055",
                    "server": server_map.get("DC-SRV-055"),
                    "temp": server_map.get("DC-SRV-055").temperature if "DC-SRV-055" in server_map else 63.0,
                    "status": server_map.get("DC-SRV-055").status if "DC-SRV-055" in server_map else "HEALTHY",
                    "flow_cfm": 860,
                    "u_height": 42
                }
            ]
        },
        {
            "row_id": "Row-E",
            "name": "Row E — Vector Database & Search",
            "aisle_type": "Hot Aisle Exhaust",
            "racks": [
                {
                    "rack_id": "Rack E-01",
                    "server_id": "DC-SRV-068",
                    "server": server_map.get("DC-SRV-068"),
                    "temp": server_map.get("DC-SRV-068").temperature if "DC-SRV-068" in server_map else 59.0,
                    "status": server_map.get("DC-SRV-068").status if "DC-SRV-068" in server_map else "HEALTHY",
                    "flow_cfm": 890,
                    "u_height": 42
                },
                {
                    "rack_id": "Rack E-02",
                    "server_id": "DC-SRV-077",
                    "server": server_map.get("DC-SRV-077"),
                    "temp": server_map.get("DC-SRV-077").temperature if "DC-SRV-077" in server_map else 73.0,
                    "status": server_map.get("DC-SRV-077").status if "DC-SRV-077" in server_map else "WARNING",
                    "flow_cfm": 770,
                    "u_height": 42
                }
            ]
        },
        {
            "row_id": "Row-F",
            "name": "Row F — Analytical & IAM Core",
            "aisle_type": "Cold Aisle",
            "racks": [
                {
                    "rack_id": "Rack F-01",
                    "server_id": "DC-SRV-089",
                    "server": server_map.get("DC-SRV-089"),
                    "temp": server_map.get("DC-SRV-089").temperature if "DC-SRV-089" in server_map else 65.0,
                    "status": server_map.get("DC-SRV-089").status if "DC-SRV-089" in server_map else "HEALTHY",
                    "flow_cfm": 870,
                    "u_height": 42
                },
                {
                    "rack_id": "Rack F-03",
                    "server_id": "DC-SRV-094",
                    "server": server_map.get("DC-SRV-094"),
                    "temp": server_map.get("DC-SRV-094").temperature if "DC-SRV-094" in server_map else 57.0,
                    "status": server_map.get("DC-SRV-094").status if "DC-SRV-094" in server_map else "HEALTHY",
                    "flow_cfm": 930,
                    "u_height": 42
                }
            ]
        }
    ]

    total_power = sum(s.power for s in servers)
    hourly_co2 = round((total_power / 1000.0) * 0.385, 2)

    return {
        "room_name": "Data Hall Alpha (East-01)",
        "facility_status": "MONITORING ACTIVE",
        "rows": rows,
        "esg_sustainability": {
            "pue": 1.18,
            "target_pue": 1.15,
            "total_facility_power_kw": round(total_power / 1000.0, 2),
            "carbon_emissions_kg_hr": hourly_co2,
            "water_consumption_liters_hr": round(sum(s.water_usage for s in servers), 1),
            "renewable_energy_mix_pct": 68.4,
            "green_score": 91.5
        }
    }

@app.post("/api/remediation/execute")
def execute_remediation(req: RemediationRequest, db: Session = Depends(get_db)):
    server = db.query(Server).filter(Server.server_id == req.server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server node not found")

    # Record pre-remediation metrics
    pre_temp = server.temperature
    pre_cooling = server.cooling
    pre_risk = server.risk_score

    # Apply remediation in database
    server.cooling = 91.5
    server.temperature = 63.8
    server.status = "HEALTHY"
    server.risk_score = 12.0
    server.cpu = max(25.0, server.cpu * 0.65)
    server.power = max(380.0, server.power * 0.72)

    # Resolve related active incidents
    active_incidents = db.query(Incident).filter(Incident.server_id == req.server_id, Incident.status != "RESOLVED").all()
    for inc in active_incidents:
        inc.status = "RESOLVED"
        inc.resolution_notes = f"Auto-remediation playbook {req.playbook_id} executed successfully. Workload re-routed; valve modulated to 91%."

    # Commit changes
    db.commit()

    steps = [
        {"step": 1, "name": "Telemetry Health Check", "status": "COMPLETED", "detail": f"BMC Diagnostics confirmed thermal resistance on {req.server_id}."},
        {"step": 2, "name": "Workload Re-Route", "status": "COMPLETED", "detail": "Drained 40% active tensor pods to Cluster B (Rack A-01 and Rack C-04)."},
        {"step": 3, "name": "Coolant Pump Override", "status": "COMPLETED", "detail": "Modulated secondary chilled loop valve flow rate from 54% to 91.5%."},
        {"step": 4, "name": "Dynamic Power Capping", "status": "COMPLETED", "detail": f"Enforced wattage cap to 480W on {req.server_id} chassis."},
        {"step": 5, "name": "Thermal Stabilization Verified", "status": "COMPLETED", "detail": f"Temperature dropped from {pre_temp:.1f}°C to 63.8°C. Cooling efficiency restored to 91.5%."},
        {"step": 6, "name": "Guardian Memory Record Logged", "status": "COMPLETED", "detail": "New remediation playbook execution stored in persistent memory store."}
    ]

    return {
        "success": True,
        "playbook_id": req.playbook_id,
        "server_id": req.server_id,
        "execution_summary": f"Autonomous remediation executed for {req.server_id}. All thermal and compute vectors normalized.",
        "pre_state": {
            "temperature": pre_temp,
            "cooling": pre_cooling,
            "risk_score": pre_risk,
            "status": "CRITICAL"
        },
        "post_state": {
            "temperature": 63.8,
            "cooling": 91.5,
            "risk_score": 12.0,
            "status": "HEALTHY"
        },
        "steps": steps
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

