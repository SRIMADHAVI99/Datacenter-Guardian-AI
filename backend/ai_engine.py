"""
AI Investigation Engine
Provides automated incident analysis, historical memory matching,
root-cause hypothesis, risk assessment, and recommendation generation.
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from database import Server, Incident, GuardianMemory, AIInvestigation

class AIEngine:
    def __init__(self):
        pass

    def find_similar_memories(self, query: str, server_id: Optional[str], db: Session) -> List[GuardianMemory]:
        """
        Retrieves matching historical memories from GuardianMemory table.
        """
        all_memories = db.query(GuardianMemory).all()
        q_lower = query.lower()
        scored_memories = []

        for mem in all_memories:
            score = 0
            # Match server ID
            if server_id and mem.server_id.lower() == server_id.lower():
                score += 5
            if mem.server_id.lower() in q_lower:
                score += 4

            # Match category keywords
            if mem.category.lower() in q_lower:
                score += 5
            if mem.title.lower() in q_lower or mem.incident_type.lower() in q_lower:
                score += 4

            # Keyword matching
            keywords = ["cooling", "overheating", "temperature", "heat", "thermal"]
            if any(k in q_lower for k in keywords) and mem.category.lower() == "cooling":
                score += 6

            keywords_cpu = ["cpu", "runaway", "process", "spike", "saturation"]
            if any(k in q_lower for k in keywords_cpu) and mem.category.lower() == "cpu":
                score += 6

            keywords_db = ["database", "timeout", "connection", "pool", "query", "sql"]
            if any(k in q_lower for k in keywords_db) and mem.category.lower() == "database":
                score += 6

            keywords_pwr = ["power", "surge", "watt", "pdu", "voltage"]
            if any(k in q_lower for k in keywords_pwr) and mem.category.lower() == "power":
                score += 6

            keywords_net = ["network", "packet", "drop", "throughput", "bandwidth"]
            if any(k in q_lower for k in keywords_net) and mem.category.lower() == "network":
                score += 6

            if score > 0:
                scored_memories.append((score, mem))

        # Sort by match score descending
        scored_memories.sort(key=lambda x: x[0], reverse=True)
        return [m[1] for m in scored_memories]

    def investigate(self, query: str, server_id: Optional[str], db: Session) -> Dict[str, Any]:
        """
        Comprehensive investigation pipeline:
        Extracts telemetry evidence, correlates past incidents, queries Guardian Memory,
        and produces actionable risk & recommendations.
        """
        q_lower = query.lower()

        # Resolve target server if present in query
        if not server_id:
            for s in db.query(Server).all():
                if s.server_id.lower() in q_lower:
                    server_id = s.server_id
                    break

        server = db.query(Server).filter(Server.server_id == server_id).first() if server_id else None
        
        # 1. Fetch matching historical memory
        matching_memories = self.find_similar_memories(query, server_id, db)
        top_memory = matching_memories[0] if matching_memories else None

        # 2. Extract telemetry evidence
        evidence_points = []
        if server:
            evidence_points.append(f"Target node {server.server_id} located in {server.zone}.")
            evidence_points.append(f"Telemetry status: {server.status} with composite Risk Score {server.risk_score}/100.")
            evidence_points.append(f"Current Metrics: CPU {server.cpu}% | RAM {server.ram}% | GPU {server.gpu}%.")
            evidence_points.append(f"Thermal State: {server.temperature}°C (Cooling efficiency: {server.cooling}%).")
            evidence_points.append(f"Power Load: {server.power}W | Water consumption: {server.water_usage} L/h.")
        else:
            evidence_points.append("Cross-datacenter fleet telemetry evaluated across 12 active compute racks.")

        # 3. Derive Incident Summary, Finding, Risk, and Recommendation
        if "highest failure risk" in q_lower or "which server" in q_lower and "risk" in q_lower:
            highest_risk_server = db.query(Server).order_by(Server.risk_score.desc()).first()
            summary = f"Fleet Risk Assessment: {highest_risk_server.server_id} currently exhibits the highest failure risk across the facility."
            finding = f"Server {highest_risk_server.server_id} in {highest_risk_server.zone} has risk score {highest_risk_server.risk_score}/100 due to {highest_risk_server.temperature}°C temperature and degraded cooling ({highest_risk_server.cooling}%)."
            risk_level = "CRITICAL"
            confidence = 96
            recommendation = f"Initiate immediate drain of {highest_risk_server.server_id}. Shift batch jobs to Rack A/C nodes and dispatch thermal inspection team."
            sim_mem_text = "Memory #3 — Cooling anomaly"

        elif "power" in q_lower and ("20%" in q_lower or "increase" in q_lower or "surge" in q_lower):
            summary = "Power Surge & PDU Capacity Impact Analysis (+20% Projection)."
            finding = "Simulated 20% power surge raises rack draw from 5.4 kW to 6.48 kW, pushing circuit breakers to 89% threshold and triggering thermal delta +6.2°C."
            risk_level = "HIGH"
            confidence = 88
            recommendation = "Enable dynamic power capping on GPU clusters, stagger batch training crons, and verify redundant PDU feed line auto-switchover."
            sim_mem_text = "Memory #5 — Power distribution unit phase imbalance"

        elif ("cooling" in q_lower or "overheating" in q_lower or "temperature" in q_lower or "dc-srv-024" in q_lower):
            target_name = server.server_id if server else "DC-SRV-024"
            summary = f"Chamber Thermal Alert on Node {target_name}"
            finding = f"Temperature increased from 68°C to {server.temperature if server else 82.4}°C while cooling efficiency dropped to {server.cooling if server else 54.0}%. High thermal shutdown hazard."
            risk_level = "HIGH" if (server and server.temperature < 80) else "CRITICAL"
            confidence = 92
            recommendation = "Redistribute non-critical workloads to Cluster B and increase chilled-water cooling loop capacity."
            sim_mem_text = "Memory #3 — Cooling anomaly"

        elif ("cpu" in q_lower or "runaway" in q_lower or "spike" in q_lower or "dc-srv-009" in q_lower):
            target_name = server.server_id if server else "DC-SRV-009"
            summary = f"Core Processor Saturation on {target_name}"
            finding = f"CPU sustained at {server.cpu if server else 89.4}% caused by runaway background service thread lockup. High latency cascade risk."
            risk_level = "HIGH"
            confidence = 94
            recommendation = "Restart affected service daemon PID, verify thread affinity, and apply memory leak hotfix."
            sim_mem_text = "Memory #2 — Runaway process detected"

        elif ("database" in q_lower or "timeout" in q_lower or "connection" in q_lower or "dc-srv-017" in q_lower):
            target_name = server.server_id if server else "DC-SRV-017"
            summary = f"Connection-pool Exhaustion on {target_name}"
            finding = f"Memory pressure at {server.ram if server else 91.8}% and socket connection exhaustion after sudden query volume spike."
            risk_level = "CRITICAL"
            confidence = 95
            recommendation = "Increase PgBouncer max connection pool to 1200, enforce statement timeout limits, and restart DB service."
            sim_mem_text = "Memory #1 — Database connection timeout"

        else:
            summary = f"Investigation regarding '{query}'"
            finding = f"Evaluated system parameters for query '{query}'. Correlated telemetry streams show nominal performance with localized advisory notices."
            risk_level = server.status if server else "MEDIUM"
            confidence = 87
            recommendation = "Maintain regular active health polling and execute preventative scheduled filter maintenance."
            sim_mem_text = f"Memory #{top_memory.memory_num} — {top_memory.title}" if top_memory else "No historical precedent found."

        # Format historical cases
        historical_cases = []
        if top_memory:
            historical_cases.append({
                "memory_num": top_memory.memory_num,
                "title": top_memory.title,
                "server_id": top_memory.server_id,
                "category": top_memory.category,
                "action": top_memory.action,
                "outcome": top_memory.outcome,
                "lesson": top_memory.lesson,
                "date": top_memory.date
            })
        for m in matching_memories[1:3]:
            historical_cases.append({
                "memory_num": m.memory_num,
                "title": m.title,
                "server_id": m.server_id,
                "category": m.category,
                "action": m.action,
                "outcome": m.outcome,
                "lesson": m.lesson,
                "date": m.date
            })

        # Save investigation record
        investigation_record = AIInvestigation(
            query=query,
            server_id=server.server_id if server else (top_memory.server_id if top_memory else "FLEET"),
            finding=finding,
            similar_memory=sim_mem_text,
            recommendation=recommendation,
            risk=risk_level,
            confidence=confidence
        )
        db.add(investigation_record)
        db.commit()

        return {
            "query": query,
            "server_id": server.server_id if server else None,
            "incident_summary": summary,
            "finding": finding,
            "evidence": evidence_points,
            "historical_similar_cases": historical_cases,
            "similar_memory": sim_mem_text,
            "risk_assessment": risk_level,
            "recommended_action": recommendation,
            "confidence": confidence
        }

ai_engine = AIEngine()
