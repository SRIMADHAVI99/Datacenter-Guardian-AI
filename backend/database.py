from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import create_engine, String, Float, Text, Integer, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Mapped, mapped_column

DATABASE_URL = "sqlite:///./datacenter.db"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Server(Base):
    __tablename__ = "servers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    server_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    zone: Mapped[str] = mapped_column(String(50), default="Rack A-01")
    role: Mapped[str] = mapped_column(String(100), default="High-Density Compute Node")
    status: Mapped[str] = mapped_column(String(20), default="HEALTHY") # HEALTHY, WARNING, CRITICAL
    cpu: Mapped[float] = mapped_column(Float, default=45.0) # Percentage 0-100
    ram: Mapped[float] = mapped_column(Float, default=55.0) # Percentage 0-100
    gpu: Mapped[float] = mapped_column(Float, default=30.0) # Percentage 0-100
    temperature: Mapped[float] = mapped_column(Float, default=65.0) # Celsius
    network: Mapped[float] = mapped_column(Float, default=4.2) # Gbps
    power: Mapped[float] = mapped_column(Float, default=420.0) # Watts
    cooling: Mapped[float] = mapped_column(Float, default=85.0) # Percentage efficiency 0-100
    water_usage: Mapped[float] = mapped_column(Float, default=12.5) # Liters/hour
    risk_score: Mapped[float] = mapped_column(Float, default=14.0) # 0-100
    uptime_days: Mapped[int] = mapped_column(Integer, default=128)
    last_incident: Mapped[str] = mapped_column(String(255), default="None recorded in last 30 days")
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class ServerMetricHistory(Base):
    __tablename__ = "server_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    server_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    timestamp: Mapped[str] = mapped_column(String(50), nullable=False)
    cpu: Mapped[float] = mapped_column(Float, default=0.0)
    ram: Mapped[float] = mapped_column(Float, default=0.0)
    gpu: Mapped[float] = mapped_column(Float, default=0.0)
    temperature: Mapped[float] = mapped_column(Float, default=0.0)
    network: Mapped[float] = mapped_column(Float, default=0.0)
    power: Mapped[float] = mapped_column(Float, default=0.0)
    cooling: Mapped[float] = mapped_column(Float, default=0.0)

class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    incident_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    server_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    incident_type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. Cooling anomaly, Runaway process detected
    description: Mapped[str] = mapped_column(Text, nullable=False)
    root_cause: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_action: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="RESOLVED") # RESOLVED, ACTIVE, INVESTIGATING
    timestamp: Mapped[str] = mapped_column(String(50), nullable=False)
    affected_resources: Mapped[str] = mapped_column(String(255), default="Primary Cooling Fan, BMC Temp Probe 2")
    symptoms: Mapped[str] = mapped_column(Text, default="Sustained thermal spike > 78°C under nominal load")
    impact: Mapped[str] = mapped_column(String(255), default="Elevated thermal throttle risk on CPU package")
    resolution_notes: Mapped[str] = mapped_column(Text, default="Workload re-routed; cooling flow adjusted")

class GuardianMemory(Base):
    __tablename__ = "guardian_memory"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    memory_num: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    incident_type: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False) # Cooling, CPU, Database, Network, Power
    server_id: Mapped[str] = mapped_column(String(50), nullable=False)
    action: Mapped[str] = mapped_column(Text, nullable=False)
    outcome: Mapped[str] = mapped_column(String(50), default="RESOLVED")
    lesson: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[str] = mapped_column(String(50), nullable=False)
    tags: Mapped[str] = mapped_column(String(255), default="[]")

class AIInvestigation(Base):
    __tablename__ = "ai_investigations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    query: Mapped[str] = mapped_column(Text, nullable=False)
    server_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    finding: Mapped[str] = mapped_column(Text, nullable=False)
    similar_memory: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    risk: Mapped[str] = mapped_column(String(20), default="LOW")
    confidence: Mapped[int] = mapped_column(Integer, default=90)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class SimulationRecord(Base):
    __tablename__ = "simulation_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    cpu_delta: Mapped[float] = mapped_column(Float, default=0.0)
    gpu_delta: Mapped[float] = mapped_column(Float, default=0.0)
    temp_delta: Mapped[float] = mapped_column(Float, default=0.0)
    cooling_delta: Mapped[float] = mapped_column(Float, default=0.0)
    server_count_delta: Mapped[int] = mapped_column(Integer, default=0)
    network_delta: Mapped[float] = mapped_column(Float, default=0.0)
    predicted_power: Mapped[float] = mapped_column(Float, default=0.0)
    predicted_temp: Mapped[float] = mapped_column(Float, default=0.0)
    predicted_cooling: Mapped[float] = mapped_column(Float, default=0.0)
    predicted_risk: Mapped[float] = mapped_column(Float, default=0.0)
    recommendation: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
