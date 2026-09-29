import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Cpu, 
  Zap, 
  Thermometer, 
  Droplet, 
  Wifi, 
  ShieldCheck, 
  TrendingUp, 
  ArrowUpRight,
  HardDrive
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  BarChart, 
  Bar 
} from 'recharts';
import { DashboardData } from '../types';

interface OverviewPageProps {
  data: DashboardData | null;
  loading: boolean;
  onSelectServer: (serverId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ 
  data, 
  loading, 
  onSelectServer, 
  onNavigateTab 
}) => {
  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh] text-cyan-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Loading Telemetry Overview...</span>
        </div>
      </div>
    );
  }

  const kpi = data?.kpi || {
    infrastructure_health: 92.5,
    active_incidents: 1,
    predicted_failures: 2,
    energy_efficiency: 58.2,
    cpu: 54.2,
    ram: 68.4,
    gpu: 46.8,
    temperature: 68.5,
    network: 86.4,
    power: 512.0,
    cooling: 80.5,
    water_usage: 184.2,
  };

  const riskForecast = data?.risk_forecast || { low: 7, medium: 3, high: 1, critical: 1 };
  const healthDistribution = data?.health_distribution || [
    { name: 'Healthy', value: 7, color: '#10b981' },
    { name: 'Warning', value: 3, color: '#f59e0b' },
    { name: 'Critical', value: 1, color: '#ef4444' }
  ];
  const topRisky = data?.top_risky_servers || [];
  const trendData = data?.trend_data || [];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-[#14233c] gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Data Center Overview</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              CLUSTER EAST-01
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            AI-powered infrastructure intelligence and operational health.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onNavigateTab('simulator')}
            className="px-3.5 py-1.5 rounded-lg bg-[#0e172a] hover:bg-cyan-950/60 border border-cyan-700/40 text-cyan-300 text-xs font-medium transition-all flex items-center space-x-1.5"
          >
            <span>Run What-if Simulation</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => onNavigateTab('ai-guardian')}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          >
            Investigate with AI
          </button>
        </div>
      </div>

      {/* Top 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Infrastructure Health */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 relative overflow-hidden shadow-lg group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Infrastructure Health</span>
            <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">{kpi.infrastructure_health}%</span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
              ● NOMINAL
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, kpi.infrastructure_health)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: Active Incidents */}
        <div 
          onClick={() => onNavigateTab('incidents')}
          className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 relative overflow-hidden shadow-lg group hover:border-rose-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Incidents</span>
            <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">{kpi.active_incidents}</span>
            <span className="text-[11px] font-semibold text-rose-400">
              {kpi.active_incidents > 0 ? 'CRITICAL DETECTED' : 'ALL CLEAR'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>DC-SRV-024 Cooling Alert</span>
            <span className="text-cyan-400 group-hover:underline">View Center &rarr;</span>
          </div>
        </div>

        {/* Card 3: Predicted Failures */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 relative overflow-hidden shadow-lg group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Predicted Failures</span>
            <div className="p-2 rounded-lg bg-amber-950/50 border border-amber-500/30 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">{kpi.predicted_failures}</span>
            <span className="text-[11px] font-semibold text-amber-400">72-HR RISK WINDOW</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Node DC-SRV-024 & DC-SRV-017
          </div>
        </div>

        {/* Card 4: Energy Efficiency */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 relative overflow-hidden shadow-lg group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Energy Efficiency</span>
            <div className="p-2 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">1.18 PUE</span>
            <span className="text-[11px] font-semibold text-cyan-400">ASHRAE CLASS A1</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Power index: {kpi.power} W / rack avg
          </div>
        </div>
      </div>

      {/* 8 Resource Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="p-2.5 rounded-lg bg-[#09101d] border border-[#14233c] text-center hover:border-cyan-500/30 transition-all">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">CPU</div>
          <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">{kpi.cpu}%</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#09101d] border border-[#14233c] text-center hover:border-cyan-500/30 transition-all">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">RAM</div>
          <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">{kpi.ram}%</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#09101d] border border-[#14233c] text-center hover:border-cyan-500/30 transition-all">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">GPU</div>
          <div className="text-base font-bold font-mono text-purple-300 mt-0.5">{kpi.gpu}%</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#09101d] border border-[#14233c] text-center hover:border-cyan-500/30 transition-all">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Temperature</div>
          <div className={`text-base font-bold font-mono mt-0.5 ${kpi.temperature > 75 ? 'text-rose-400' : 'text-amber-300'}`}>
            {kpi.temperature}°C
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#09101d] border border-[#14233c] text-center hover:border-cyan-500/30 transition-all">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Network</div>
          <div className="text-base font-bold font-mono text-blue-300 mt-0.5">{kpi.network} Gbps</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#09101d] border border-[#14233c] text-center hover:border-cyan-500/30 transition-all">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Power</div>
          <div className="text-base font-bold font-mono text-yellow-300 mt-0.5">{kpi.power} W</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#09101d] border border-[#14233c] text-center hover:border-cyan-500/30 transition-all">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Cooling</div>
          <div className="text-base font-bold font-mono text-teal-300 mt-0.5">{kpi.cooling}%</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#09101d] border border-[#14233c] text-center hover:border-cyan-500/30 transition-all">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Water Usage</div>
          <div className="text-base font-bold font-mono text-sky-300 mt-0.5">{kpi.water_usage} L/h</div>
        </div>
      </div>

      {/* Row 1 Charts: CPU Utilization Over Time & Temperature Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU Utilization Over Time */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>CPU Utilization Over Time</span>
              </h3>
              <p className="text-[11px] text-slate-500">Fleet average compute saturation</p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              Live Feed
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#475569" tick={{ fontSize: 10 }} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c1424', borderColor: '#1e345b', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#cpuGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature Trend */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>Temperature Trend</span>
              </h3>
              <p className="text-[11px] text-slate-500">Thermal sensor readings with 80°C threshold</p>
            </div>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              Critical at 80°C
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis domain={[40, 95]} stroke="#475569" tick={{ fontSize: 10 }} unit="°C" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c1424', borderColor: '#1e345b', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="temperature" stroke="#fbbf24" strokeWidth={2} fillOpacity={1} fill="url(#tempGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Power Consumption, Cooling Efficiency & Health Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Power Consumption */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>Power Consumption</span>
              </h3>
              <p className="text-[11px] text-slate-500">Watts per compute node</p>
            </div>
            <span className="text-[11px] font-mono text-yellow-400">Avg {kpi.power}W</span>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 9 }} />
                <YAxis domain={[200, 750]} stroke="#475569" tick={{ fontSize: 9 }} unit="W" />
                <Tooltip contentStyle={{ backgroundColor: '#0c1424', borderColor: '#1e345b', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="power" fill="#38bdf8" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cooling Efficiency */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Droplet className="w-3.5 h-3.5 text-teal-400" />
                <span>Cooling Efficiency</span>
              </h3>
              <p className="text-[11px] text-slate-500">Chilled coolant circuit performance</p>
            </div>
            <span className="text-[11px] font-mono text-teal-400">Flow Index</span>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 9 }} />
                <YAxis domain={[40, 100]} stroke="#475569" tick={{ fontSize: 9 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0c1424', borderColor: '#1e345b', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="cooling" stroke="#2dd4bf" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Server Health Distribution */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Server Health Distribution</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">12 Nodes</span>
          </div>
          <div className="h-32 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={52}
                  paddingAngle={4}
                >
                  {healthDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0c1424', borderColor: '#1e345b', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-around pt-2 border-t border-[#14233c] text-[11px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400">Healthy: <b className="text-white">{healthDistribution[0]?.value}</b></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-400">Warning: <b className="text-white">{healthDistribution[1]?.value}</b></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-400">Critical: <b className="text-white">{healthDistribution[2]?.value}</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Forecast Section */}
      <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Risk Forecast (Next 72 Hours)
            </h3>
            <p className="text-[11px] text-slate-500">
              ML heuristic failure probability estimation across all operational zones
            </p>
          </div>
          <div className="text-[11px] font-mono text-cyan-400">
            Model: Guardian-Predictive-v2
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-[#0c1424] border border-emerald-500/20">
            <div className="text-[10px] text-emerald-400 font-semibold uppercase">Low Risk (&lt;30)</div>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{riskForecast.low} Nodes</div>
            <div className="text-[10px] text-slate-500 mt-1">Normal operating margins</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0c1424] border border-blue-500/20">
            <div className="text-[10px] text-blue-400 font-semibold uppercase">Medium Risk (30-59)</div>
            <div className="text-2xl font-bold font-mono text-blue-300 mt-1">{riskForecast.medium} Nodes</div>
            <div className="text-[10px] text-slate-500 mt-1">Slight workload drift</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0c1424] border border-amber-500/20">
            <div className="text-[10px] text-amber-400 font-semibold uppercase">High Risk (60-79)</div>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{riskForecast.high} Nodes</div>
            <div className="text-[10px] text-slate-500 mt-1">Approaching thermal/CPU limits</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0c1424] border border-rose-500/30 bg-rose-950/10">
            <div className="text-[10px] text-rose-400 font-semibold uppercase">Critical Risk (&gt;=80)</div>
            <div className="text-2xl font-bold font-mono text-rose-300 mt-1">{riskForecast.critical} Nodes</div>
            <div className="text-[10px] text-rose-400/80 mt-1">Thermal failover mitigation recommended</div>
          </div>
        </div>
      </div>

      {/* Top Risky Servers Table */}
      <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Top Risky Servers
            </h3>
            <p className="text-[11px] text-slate-500">Nodes sorted by predictive risk score</p>
          </div>
          <button
            onClick={() => onNavigateTab('monitoring')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            View all servers &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#14233c] text-slate-500 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Server ID</th>
                <th className="py-2.5 px-3">Location / Zone</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Health</th>
                <th className="py-2.5 px-3">CPU</th>
                <th className="py-2.5 px-3">Temperature</th>
                <th className="py-2.5 px-3 text-right">Risk Score</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14233c]/60">
              {topRisky.map((srv) => (
                <tr 
                  key={srv.id} 
                  className="hover:bg-[#0c1424]/80 transition-colors cursor-pointer group"
                  onClick={() => onSelectServer(srv.server_id)}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-300 group-hover:text-cyan-200">
                    {srv.server_id}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{srv.zone}</td>
                  <td className="py-2.5 px-3 text-slate-300">{srv.role}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      srv.health === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : srv.health === 'WARNING'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {srv.health}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-200">{srv.cpu}%</td>
                  <td className="py-2.5 px-3 font-mono">
                    <span className={srv.temperature >= 80 ? 'text-rose-400 font-bold' : srv.temperature >= 70 ? 'text-amber-300' : 'text-slate-300'}>
                      {srv.temperature}°C
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    <span className={srv.risk_score >= 80 ? 'text-rose-400' : srv.risk_score >= 50 ? 'text-amber-400' : 'text-emerald-400'}>
                      {srv.risk_score} / 100
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectServer(srv.server_id);
                      }}
                      className="px-2.5 py-1 text-[10px] rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 font-mono transition-colors"
                    >
                      Inspect Node
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
