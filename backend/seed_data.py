import json
from datetime import datetime, timezone, timedelta
from database import SessionLocal, Server, ServerMetricHistory, Incident, GuardianMemory, AIInvestigation, init_db

def seed_database():
    init_db()
    db = SessionLocal()

    # Only seed if no servers exist
    if db.query(Server).count() > 0:
        db.close()
        return

    now = datetime.now(timezone.utc)

    # 1. Seed Servers
    servers_data = [
        {
            "server_id": "DC-SRV-001",
            "zone": "Rack A-01",
            "role": "General Purpose Compute",
            "status": "HEALTHY",
            "cpu": 34.5,
            "ram": 52.0,
            "gpu": 18.0,
            "temperature": 58.2,
            "network": 4.1,
            "power": 380.0,
            "cooling": 92.0,
            "water_usage": 11.2,
            "risk_score": 8.0,
            "uptime_days": 184,
            "last_incident": "None in last 60 days"
        },
        {
            "server_id": "DC-SRV-002",
            "zone": "Rack A-02",
            "role": "Edge Gateway & Ingress",
            "status": "HEALTHY",
            "cpu": 42.0,
            "ram": 61.5,
            "gpu": 24.0,
            "temperature": 61.4,
            "network": 8.6,
            "power": 415.0,
            "cooling": 88.5,
            "water_usage": 12.8,
            "risk_score": 12.0,
            "uptime_days": 210,
            "last_incident": "NIC packet drop warning (Resolved)"
        },
        {
            "server_id": "DC-SRV-009",
            "zone": "Rack B-01",
            "role": "Microservices Host A",
            "status": "WARNING",
            "cpu": 89.4,
            "ram": 84.2,
            "gpu": 45.0,
            "temperature": 74.8,
            "network": 6.8,
            "power": 540.0,
            "cooling": 78.0,
            "water_usage": 16.4,
            "risk_score": 68.0,
            "uptime_days": 42,
            "last_incident": "Runaway process detected (Resolved)"
        },
        {
            "server_id": "DC-SRV-017",
            "zone": "Rack B-03",
            "role": "High-Throughput Database",
            "status": "WARNING",
            "cpu": 78.2,
            "ram": 91.8,
            "gpu": 32.0,
            "temperature": 76.5,
            "network": 11.4,
            "power": 590.0,
            "cooling": 72.0,
            "water_usage": 18.2,
            "risk_score": 79.0,
            "uptime_days": 65,
            "last_incident": "Database connection timeout (Resolved)"
        },
        {
            "server_id": "DC-SRV-024",
            "zone": "Rack C-02",
            "role": "AI Model Training Node",
            "status": "CRITICAL",
            "cpu": 88.6,
            "ram": 88.0,
            "gpu": 92.5,
            "temperature": 82.4,
            "network": 9.2,
            "power": 675.0,
            "cooling": 54.0,
            "water_usage": 24.5,
            "risk_score": 91.0,
            "uptime_days": 18,
            "last_incident": "Cooling anomaly & thermal spike (Investigating)"
        },
        {
            "server_id": "DC-SRV-031",
            "zone": "Rack C-04",
            "role": "Cold Storage & Archive",
            "status": "HEALTHY",
            "cpu": 28.5,
            "ram": 44.0,
            "gpu": 10.0,
            "temperature": 55.1,
            "network": 3.2,
            "power": 310.0,
            "cooling": 95.0,
            "water_usage": 9.8,
            "risk_score": 6.0,
            "uptime_days": 312,
            "last_incident": "None in last 90 days"
        },
        {
            "server_id": "DC-SRV-042",
            "zone": "Rack D-01",
            "role": "GPU Cluster Primary",
            "status": "WARNING",
            "cpu": 74.0,
            "ram": 79.5,
            "gpu": 88.0,
            "temperature": 73.2,
            "network": 12.1,
            "power": 685.0,
            "cooling": 76.0,
            "water_usage": 21.0,
            "risk_score": 58.0,
            "uptime_days": 94,
            "last_incident": "Transient power surge detected (Resolved)"
        },
        {
            "server_id": "DC-SRV-055",
            "zone": "Rack D-03",
            "role": "API Management Gateway",
            "status": "HEALTHY",
            "cpu": 45.2,
            "ram": 56.4,
            "gpu": 20.0,
            "temperature": 63.1,
            "network": 7.4,
            "power": 430.0,
            "cooling": 89.0,
            "water_usage": 13.5,
            "risk_score": 15.0,
            "uptime_days": 140,
            "last_incident": "None in last 45 days"
        },
        {
            "server_id": "DC-SRV-068",
            "zone": "Rack E-01",
            "role": "Real-time Stream Processor",
            "status": "HEALTHY",
            "cpu": 38.6,
            "ram": 50.2,
            "gpu": 25.0,
            "temperature": 59.8,
            "network": 5.8,
            "power": 395.0,
            "cooling": 91.0,
            "water_usage": 11.9,
            "risk_score": 10.0,
            "uptime_days": 275,
            "last_incident": "None in last 60 days"
        },
        {
            "server_id": "DC-SRV-077",
            "zone": "Rack E-02",
            "role": "Distributed Vector Indexer",
            "status": "WARNING",
            "cpu": 69.8,
            "ram": 76.0,
            "gpu": 94.0,
            "temperature": 73.8,
            "network": 10.5,
            "power": 640.0,
            "cooling": 75.0,
            "water_usage": 19.5,
            "risk_score": 62.0,
            "uptime_days": 53,
            "last_incident": "GPU VRAM allocation high (Monitoring)"
        },
        {
            "server_id": "DC-SRV-089",
            "zone": "Rack F-01",
            "role": "Analytical Query Worker",
            "status": "HEALTHY",
            "cpu": 51.0,
            "ram": 62.0,
            "gpu": 35.0,
            "temperature": 65.4,
            "network": 6.2,
            "power": 460.0,
            "cooling": 86.0,
            "water_usage": 14.1,
            "risk_score": 20.0,
            "uptime_days": 110,
            "last_incident": "None in last 30 days"
        },
        {
            "server_id": "DC-SRV-094",
            "zone": "Rack F-03",
            "role": "Authentication & IAM Node",
            "status": "HEALTHY",
            "cpu": 31.8,
            "ram": 48.0,
            "gpu": 12.0,
            "temperature": 57.0,
            "network": 3.9,
            "power": 330.0,
            "cooling": 94.0,
            "water_usage": 10.5,
            "risk_score": 9.0,
            "uptime_days": 320,
            "last_incident": "None in last 90 days"
        }
    ]

    for s in servers_data:
        server = Server(**s)
        db.add(server)

    # 2. Seed Historic Metric Points for each server (last 12 points, 5 min intervals)
    for s in servers_data:
        srv_id = s["server_id"]
        base_cpu = s["cpu"]
        base_temp = s["temperature"]
        base_power = s["power"]
        base_cooling = s["cooling"]
        base_net = s["network"]

        for i in range(12, 0, -1):
            t_str = (now - timedelta(minutes=i * 5)).strftime("%H:%M")
            # generate small realistic historical wave
            factor = 1.0 - (i * 0.015) if srv_id == "DC-SRV-024" else 1.0
            db.add(ServerMetricHistory(
                server_id=srv_id,
                timestamp=t_str,
                cpu=round(max(10.0, min(99.0, base_cpu * factor - (i * 0.5))), 1),
                ram=round(max(20.0, min(99.0, s["ram"] - (i * 0.2))), 1),
                gpu=round(max(5.0, min(99.0, s["gpu"] * factor)), 1),
                temperature=round(max(40.0, min(90.0, base_temp * factor - (i * 0.8))), 1),
                network=round(max(1.0, base_net + (i % 3) * 0.4), 1),
                power=round(max(200.0, base_power * factor - (i * 5.0)), 1),
                cooling=round(max(40.0, min(99.0, base_cooling + (i * 1.5 if srv_id == "DC-SRV-024" else 0))), 1)
            ))

    # 3. Seed Incidents
    incidents_data = [
        {
            "incident_id": "INC-8924",
            "server_id": "DC-SRV-024",
            "severity": "CRITICAL",
            "incident_type": "Cooling anomaly",
            "description": "Temperature increased from 68°C to 82.4°C while cooling system efficiency decreased to 54%. High thermal shutdown risk.",
            "root_cause": "Cooling system degradation causing thermal risk",
            "recommended_action": "Moved workload and increased cooling capacity",
            "status": "ACTIVE",
            "timestamp": (now - timedelta(minutes=24)).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "affected_resources": "Chilled-water Loop A, Heatsink Module 2, CPU Socket 0",
            "symptoms": "Temperature increased from 68°C to 82°C while cooling efficiency decreased below 60%.",
            "impact": "Thermal throttling active; potential failover required if temp > 85°C.",
            "resolution_notes": "Automated throttling engaged; awaiting manual migration confirmation."
        },
        {
            "incident_id": "INC-7412",
            "server_id": "DC-SRV-024",
            "severity": "CRITICAL",
            "incident_type": "Cooling anomaly",
            "description": "Chamber temperature rose abruptly under sustained ML training epoch with valve flow resistance.",
            "root_cause": "Cooling system degradation causing thermal risk",
            "recommended_action": "Moved workload and increased cooling capacity",
            "status": "RESOLVED",
            "timestamp": "2026-09-28 14:22:10 UTC",
            "affected_resources": "Liquid loop pump 2, Heat exchanger plenum B",
            "symptoms": "Intake delta > 14°C; Fan RPM dropping under safety threshold.",
            "impact": "Slight latency degradation during peak traffic.",
            "resolution_notes": "Moved workload and increased cooling capacity. Workload redistribution prevented thermal shutdown."
        },
        {
            "incident_id": "INC-6819",
            "server_id": "DC-SRV-009",
            "severity": "HIGH",
            "incident_type": "Runaway process detected",
            "description": "CPU saturation caused by runaway background telemetry daemon consuming 100% of core threads.",
            "root_cause": "CPU saturation caused by runaway background service",
            "recommended_action": "Restarted affected service",
            "status": "RESOLVED",
            "timestamp": "2026-09-27 09:45:33 UTC",
            "affected_resources": "CPU Cores 0-15, Systemd scheduler",
            "symptoms": "CPU spike to 98% sustained across 15 minutes with zero user transactions.",
            "impact": "Response times escalated to 450ms across service endpoints.",
            "resolution_notes": "Restarted affected service. Restarting the service resolved the recurring CPU spike."
        },
        {
            "incident_id": "INC-5901",
            "server_id": "DC-SRV-017",
            "severity": "CRITICAL",
            "incident_type": "Database connection timeout",
            "description": "Database pool starvation leading to cascaded gateway 504 timeouts across client applications.",
            "root_cause": "Connection-pool exhaustion after traffic spike",
            "recommended_action": "Increased connection pool and restarted database",
            "status": "RESOLVED",
            "timestamp": "2026-09-26 21:10:45 UTC",
            "affected_resources": "PostgreSQL PgBouncer pooler, Max socket descriptors",
            "symptoms": "Active connections reached 500/500 max cap; connection wait queue exceeded 120s.",
            "impact": "Temporary database degradation lasting 4 minutes.",
            "resolution_notes": "Increased connection pool and restarted database service. Restart alone was insufficient; pool tuning resolved the incident."
        },
        {
            "incident_id": "INC-4802",
            "server_id": "DC-SRV-042",
            "severity": "HIGH",
            "incident_type": "Power surge alert",
            "description": "Transient power draw crossed 680W limit during joint checkpoint dump and inference burst.",
            "root_cause": "PDU circuit threshold strain due to synchronized cron job scheduling",
            "recommended_action": "Rescheduled checkpoint intervals and enabled power capping policy",
            "status": "RESOLVED",
            "timestamp": "2026-09-25 03:14:02 UTC",
            "affected_resources": "Rack PDU Phase B, Power Supply Unit 1",
            "symptoms": "Power draw peaked at 122% of nominal operating rating.",
            "impact": "Potential circuit breaker trip avoided by proactive governor.",
            "resolution_notes": "Staggered asynchronous batch jobs across alternate phase rails."
        },
        {
            "incident_id": "INC-3940",
            "server_id": "DC-SRV-002",
            "severity": "MEDIUM",
            "incident_type": "Network packet drop",
            "description": "Packet transmission dropped by 4.2% during storage replication sync across gateway.",
            "root_cause": "Interface MTU mismatch and Top-of-Rack buffer saturation",
            "recommended_action": "Reconfigured MTU to 9000 (Jumbo frames) and enabled link aggregation",
            "status": "RESOLVED",
            "timestamp": "2026-09-24 16:50:00 UTC",
            "affected_resources": "100GbE Dual Port NIC, Switch port 14",
            "symptoms": "RX/TX buffer drop counter incrementing rapidly.",
            "impact": "Replication job duration increased by 8 minutes.",
            "resolution_notes": "Enabled jumbo frames and prioritized QoS replication channel."
        }
    ]

    for inc in incidents_data:
        db.add(Incident(**inc))

    # 4. Seed Guardian Memory
    memories_data = [
        {
            "memory_num": 3,
            "title": "Cooling anomaly",
            "incident_type": "Cooling anomaly",
            "category": "Cooling",
            "server_id": "DC-SRV-024",
            "action": "Moved workload and increased cooling capacity",
            "outcome": "RESOLVED",
            "lesson": "Workload redistribution prevented thermal shutdown.",
            "date": "2026-09-28",
            "tags": json.dumps(["Cooling", "Thermal", "Migration", "DC-SRV-024"])
        },
        {
            "memory_num": 2,
            "title": "Runaway process detected",
            "incident_type": "Runaway process detected",
            "category": "CPU",
            "server_id": "DC-SRV-009",
            "action": "Restarted affected service",
            "outcome": "RESOLVED",
            "lesson": "Restarting the service resolved the recurring CPU spike.",
            "date": "2026-09-27",
            "tags": json.dumps(["CPU", "Runaway Process", "Service Restart", "DC-SRV-009"])
        },
        {
            "memory_num": 1,
            "title": "Database connection timeout",
            "incident_type": "Database connection timeout",
            "category": "Database",
            "server_id": "DC-SRV-017",
            "action": "Increased connection pool and restarted database service",
            "outcome": "RESOLVED",
            "lesson": "Restart alone was insufficient; pool tuning resolved the incident.",
            "date": "2026-09-26",
            "tags": json.dumps(["Database", "Connection Pool", "PgBouncer", "DC-SRV-017"])
        },
        {
            "memory_num": 4,
            "title": "Network buffer dropouts during replication",
            "incident_type": "Network packet drop",
            "category": "Network",
            "server_id": "DC-SRV-002",
            "action": "Reconfigured MTU to 9000 (Jumbo frames) and enabled link aggregation",
            "outcome": "RESOLVED",
            "lesson": "Packet fragmentation caused severe buffer dropouts during high throughput transfers.",
            "date": "2026-09-24",
            "tags": json.dumps(["Network", "Jumbo Frames", "Buffer", "DC-SRV-002"])
        },
        {
            "memory_num": 5,
            "title": "Power distribution unit phase imbalance",
            "incident_type": "Power surge alert",
            "category": "Power",
            "server_id": "DC-SRV-042",
            "action": "Staggered asynchronous batch workloads across alternate phase rails",
            "outcome": "RESOLVED",
            "lesson": "Concurrent GPU tensor operations on the same rack circuit caused phase imbalance.",
            "date": "2026-09-25",
            "tags": json.dumps(["Power", "PDU", "Phase Balancing", "DC-SRV-042"])
        }
    ]

    for mem in memories_data:
        db.add(GuardianMemory(**mem))

    # 5. Pre-seed default AI Investigation
    db.add(AIInvestigation(
        query="Why is DC-SRV-024 overheating?",
        server_id="DC-SRV-024",
        finding="Temperature increased from 68°C to 82.4°C while cooling efficiency decreased to 54%. Thermal threshold alert active.",
        similar_memory="Memory #3 — Cooling anomaly",
        recommendation="Redistribute non-critical workloads to Cluster B and increase chilled-loop cooling capacity by +25%.",
        risk="CRITICAL",
        confidence=92
    ))

    db.commit()
    db.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed_database()
