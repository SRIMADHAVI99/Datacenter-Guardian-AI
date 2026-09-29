import { DashboardData, MonitoringData, ServerItem, IncidentItem, GuardianMemoryItem, AIInvestigationResponse, SimulationResult } from './types';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch health');
    return res.json();
  },

  async getDashboard(): Promise<DashboardData> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  },

  async getMonitoring(): Promise<MonitoringData> {
    const res = await fetch(`${API_BASE}/monitoring`);
    if (!res.ok) throw new Error('Failed to fetch monitoring telemetry');
    return res.json();
  },

  async getServers(): Promise<ServerItem[]> {
    const res = await fetch(`${API_BASE}/servers`);
    if (!res.ok) throw new Error('Failed to fetch servers');
    return res.json();
  },

  async getServerDetail(serverId: string): Promise<{
    server: ServerItem;
    history: any[];
    incidents: IncidentItem[];
    ai_analysis: {
      current_condition: string;
      predicted_issue: string;
      root_cause: string;
      recommended_action: string;
      risk_score: number;
      anomalies: string[];
    };
  }> {
    const res = await fetch(`${API_BASE}/servers/${serverId}`);
    if (!res.ok) throw new Error(`Failed to fetch server ${serverId}`);
    return res.json();
  },

  async getIncidents(severity?: string, statusFilter?: string): Promise<IncidentItem[]> {
    const params = new URLSearchParams();
    if (severity && severity !== 'ALL') params.append('severity', severity);
    if (statusFilter && statusFilter !== 'ALL') params.append('status_filter', statusFilter);
    const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async getIncidentDetail(id: string): Promise<{
    incident: IncidentItem;
    timeline: { time: string; event: string }[];
    similar_memories: GuardianMemoryItem[];
    affected_resources?: string;
    symptoms?: string;
    impact?: string;
    root_cause: string;
    recommended_action: string;
    resolution_notes?: string;
  }> {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch incident ${id}`);
    return res.json();
  },

  async resolveIncident(id: string, actionTaken: string, resolutionNotes?: string) {
    const res = await fetch(`${API_BASE}/incidents/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_taken: actionTaken, resolution_notes: resolutionNotes }),
    });
    if (!res.ok) throw new Error('Failed to resolve incident');
    return res.json();
  },

  async getMemory(category?: string, query?: string): Promise<GuardianMemoryItem[]> {
    const params = new URLSearchParams();
    if (category && category !== 'ALL') params.append('category', category);
    if (query) params.append('q', query);
    const res = await fetch(`${API_BASE}/memory?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch memory records');
    return res.json();
  },

  async investigateAI(query: string, serverId?: string): Promise<AIInvestigationResponse> {
    const res = await fetch(`${API_BASE}/ai/investigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, server_id: serverId }),
    });
    if (!res.ok) throw new Error('Failed to execute AI investigation');
    return res.json();
  },

  async runSimulation(payload: {
    base_server_id?: string;
    cpu_workload_delta: number;
    gpu_workload_delta: number;
    ambient_temp_delta: number;
    cooling_capacity_delta: number;
    server_count_delta: number;
    network_traffic_delta: number;
  }): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/simulation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to run what-if simulation');
    return res.json();
  },

  async search(query: string) {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search');
    return res.json();
  },

  async getAzureStatus() {
    const res = await fetch(`${API_BASE}/azure/status`);
    if (!res.ok) throw new Error('Failed to get Azure status');
    return res.json();
  }
};
