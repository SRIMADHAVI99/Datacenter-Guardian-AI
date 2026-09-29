export interface ServerItem {
  id: number;
  server_id: string;
  zone: string;
  role: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  cpu: number;
  ram: number;
  gpu: number;
  temperature: number;
  network: number;
  power: number;
  cooling: number;
  water_usage: number;
  risk_score: number;
  uptime_days?: number;
  last_incident?: string;
  last_updated?: string;
}

export interface MetricHistoryPoint {
  time: string;
  cpu: number;
  ram?: number;
  gpu?: number;
  temperature: number;
  network?: number;
  power: number;
  cooling?: number;
  throughput?: number;
  threshold?: number;
  baseline?: number;
}

export interface IncidentItem {
  id: number;
  incident_id: string;
  server_id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  incident_type: string;
  description: string;
  root_cause: string;
  recommended_action: string;
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED';
  timestamp: string;
  affected_resources?: string;
  symptoms?: string;
  impact?: string;
  resolution_notes?: string;
}

export interface GuardianMemoryItem {
  id: number;
  memory_num: number;
  title: string;
  incident_type: string;
  category: 'Cooling' | 'CPU' | 'Database' | 'Network' | 'Power';
  server_id: string;
  action: string;
  outcome: string;
  lesson: string;
  date: string;
  tags?: string;
}

export interface AIInvestigationResponse {
  query: string;
  server_id?: string;
  incident_summary: string;
  finding: string;
  evidence: string[];
  historical_similar_cases: {
    memory_num: number;
    title: string;
    server_id: string;
    category: string;
    action: string;
    outcome: string;
    lesson: string;
    date: string;
  }[];
  similar_memory?: string;
  risk_assessment: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommended_action: string;
  confidence: number;
}

export interface SimulationResult {
  current_state: {
    cpu: number;
    gpu: number;
    temperature: number;
    cooling: number;
    power: number;
    failure_risk: number;
  };
  simulation: {
    inputs: {
      cpu_delta: number;
      gpu_delta: number;
      temp_delta: number;
      cooling_delta: number;
      server_count_delta: number;
      network_delta: number;
    };
    predicted_state: {
      cpu: number;
      gpu: number;
      power_watts: number;
      power_delta_pct: number;
      temperature: number;
      temperature_delta_c: number;
      cooling_requirement_delta_pct: number;
      failure_risk: number;
      failure_risk_delta_pct: number;
      status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    };
    ai_recommendation: string;
  };
}

export interface DashboardData {
  kpi: {
    infrastructure_health: number;
    active_incidents: number;
    predicted_failures: number;
    energy_efficiency: number;
    cpu: number;
    ram: number;
    gpu: number;
    temperature: number;
    network: number;
    power: number;
    cooling: number;
    water_usage: number;
  };
  risk_forecast: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  health_distribution: {
    name: string;
    value: number;
    color: string;
  }[];
  top_risky_servers: {
    id: number;
    server_id: string;
    zone: string;
    role: string;
    health: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    cpu: number;
    ram: number;
    temperature: number;
    risk_score: number;
  }[];
  trend_data: MetricHistoryPoint[];
}

export interface MonitoringData {
  kpi: {
    cpu: number;
    ram: number;
    temperature: number;
    network: number;
    gpu: number;
    power: number;
    cooling: number;
    water: number;
  };
  charts: {
    activity: MetricHistoryPoint[];
    temperature: MetricHistoryPoint[];
    power: MetricHistoryPoint[];
    network: MetricHistoryPoint[];
  };
  servers: ServerItem[];
}
