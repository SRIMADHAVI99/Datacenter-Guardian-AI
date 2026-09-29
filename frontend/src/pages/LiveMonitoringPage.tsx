import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Thermometer, 
  Wifi, 
  Zap, 
  Droplet, 
  ShieldAlert, 
  Server, 
  Filter, 
  RefreshCw,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  BarChart, 
  Bar 
} from 'recharts';
import { MonitoringData, ServerItem } from '../types';

interface LiveMonitoringPageProps {
  data: MonitoringData | null;
  loading: boolean;
  onSelectServer: (serverId: string) => void;
  onNavigateTab: (tab: string) => void;
  onRefresh: () => void;
}

export const LiveMonitoringPage: React.FC<LiveMonitoringPageProps> = ({
  data,
  loading,
  onSelectServer,
  onNavigateTab,
  onRefresh
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HEALTHY' | 'WARNING' | 'CRITICAL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const kpi = data?.kpi || {
    cpu: 52.4,
    ram: 68.1,
    temperature: 66.8,
    network: 7.8,
    gpu: 44.5,
    power: 495.0,
    cooling: 82.0,
    water: 168.0
  };

  const charts = data?.charts || {
    activity: [],
    temperature: [],
    power: [],
    network: []
  };

  const allServers = data?.servers || [];
  const filteredServers = allServers.filter((s) => {
    const matchesFilter = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesSearch = s.server_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-[#14233c] gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">Live Monitoring</h1>
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-green"></span>
              <span>4s Telemetry Pulse</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time infrastructure telemetry and AI health analysis.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-[#0e172a] hover:bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 transition-all text-xs flex items-center space-x-1.5"
            title="Force Telemetry Sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => onNavigateTab('simulator')}
            className="px-3.5 py-2 rounded-lg bg-[#0c1424] hover:bg-cyan-950 border border-cyan-700/50 text-cyan-300 text-xs font-semibold flex items-center space-x-2"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulate Stress Load</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Primary 4 + Secondary 4 Live Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* CPU */}
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
            <span>CPU</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono text-cyan-300">{kpi.cpu}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Fleet Core Load</div>
        </div>

        {/* RAM */}
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
            <span>RAM</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono text-cyan-300">{kpi.ram}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Memory Pool</div>
        </div>

        {/* Temperature */}
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
            <span>Temp</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className={`mt-1 text-xl font-bold font-mono ${kpi.temperature >= 75 ? 'text-rose-400' : 'text-amber-300'}`}>
            {kpi.temperature}°C
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Intake Baseline</div>
        </div>

        {/* Network */}
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
            <span>Network</span>
            <Wifi className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono text-blue-300">{kpi.network} Gbps</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Port Ingress/Egress</div>
        </div>

        {/* GPU */}
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
            <span>GPU</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono text-purple-300">{kpi.gpu}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Tensor Engines</div>
        </div>

        {/* Power */}
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
            <span>Power</span>
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono text-yellow-300">{kpi.power} W</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Avg Node Draw</div>
        </div>

        {/* Cooling */}
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
            <span>Cooling</span>
            <Droplet className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono text-teal-300">{kpi.cooling}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Chiller Loop Flow</div>
        </div>

        {/* Water */}
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
            <span>Water</span>
            <Droplet className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-1 text-xl font-bold font-mono text-sky-300">{kpi.water} L/h</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Total Loop Con.</div>
        </div>
      </div>

      {/* 4 Telemetry Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chart 1: Infrastructure Activity Chart */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Infrastructure Activity Chart</span>
            </h3>
            <div className="flex items-center space-x-3 text-[10px] text-slate-400">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-cyan-400 rounded-sm"></span><span>CPU</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-blue-500 rounded-sm"></span><span>RAM</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-purple-500 rounded-sm"></span><span>GPU</span></span>
            </div>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.activity}>
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 9 }} />
                <YAxis domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0c1424', borderColor: '#1e345b', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="cpu" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.15} />
                <Area type="monotone" dataKey="ram" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.10} />
                <Area type="monotone" dataKey="gpu" stroke="#a855f7" fill="#a855f7" fillOpacity={0.10} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Temperature Chart */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Temperature Chart</span>
            </h3>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              Limit: 80.0°C
            </span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.temperature}>
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 9 }} />
                <YAxis domain={[45, 95]} stroke="#475569" tick={{ fontSize: 9 }} unit="°C" />
                <Tooltip contentStyle={{ backgroundColor: '#0c1424', borderColor: '#1e345b', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Power Usage Chart */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Power Usage Chart</span>
            </h3>
            <span className="text-[10px] font-mono text-yellow-400">Watts per Rack</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.power}>
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 9 }} />
                <YAxis domain={[200, 800]} stroke="#475569" tick={{ fontSize: 9 }} unit="W" />
                <Tooltip contentStyle={{ backgroundColor: '#0c1424', borderColor: '#1e345b', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="power" fill="#38bdf8" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Network Throughput Chart */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Wifi className="w-3.5 h-3.5 text-blue-400" />
              <span>Network Throughput Chart</span>
            </h3>
            <span className="text-[10px] font-mono text-blue-400">Gbps Link Speed</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.network}>
                <defs>
                  <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 9 }} />
                <YAxis domain={[0, 20]} stroke="#475569" tick={{ fontSize: 9 }} unit="G" />
                <Tooltip contentStyle={{ backgroundColor: '#0c1424', borderColor: '#1e345b', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="throughput" stroke="#3b82f6" fill="url(#netGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Server Grid Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Data Center Compute Fleet</span>
              <span className="text-xs font-mono text-slate-400">({filteredServers.length} nodes)</span>
            </h2>
            <p className="text-xs text-slate-400">Click any server card to open comprehensive diagnostics</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Pills */}
            <div className="flex rounded-lg bg-[#09101d] border border-[#14233c] p-1 text-xs">
              {(['ALL', 'HEALTHY', 'WARNING', 'CRITICAL'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded text-[11px] font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Quick search input */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter node ID..."
              className="px-3 py-1.5 bg-[#09101d] border border-[#14233c] focus:border-cyan-500 rounded-lg text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none w-36"
            />
          </div>
        </div>

        {/* Server Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredServers.map((srv) => (
            <div
              key={srv.id}
              onClick={() => onSelectServer(srv.server_id)}
              className={`p-4 rounded-xl bg-[#09101d] border transition-all duration-200 hover:shadow-xl cursor-pointer group flex flex-col justify-between ${
                srv.status === 'CRITICAL'
                  ? 'border-rose-700/60 hover:border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.12)]'
                  : srv.status === 'WARNING'
                  ? 'border-amber-700/60 hover:border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  : 'border-[#15233e] hover:border-cyan-500/50 shadow-md'
              }`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {srv.server_id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{srv.zone}</span>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      srv.status === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : srv.status === 'WARNING'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {srv.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mb-3">{srv.role}</div>

                {/* Metrics 2x3 Grid */}
                <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-[#0c1424] border border-[#14233c] text-center mb-3">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">CPU</div>
                    <div className="text-xs font-mono font-bold text-cyan-300">{srv.cpu}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">RAM</div>
                    <div className="text-xs font-mono font-bold text-cyan-300">{srv.ram}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">GPU</div>
                    <div className="text-xs font-mono font-bold text-purple-300">{srv.gpu}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">Temp</div>
                    <div className={`text-xs font-mono font-bold ${srv.temperature >= 80 ? 'text-rose-400' : srv.temperature >= 70 ? 'text-amber-300' : 'text-slate-300'}`}>
                      {srv.temperature}°C
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">Net</div>
                    <div className="text-xs font-mono font-bold text-blue-300">{srv.network}G</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase">Power</div>
                    <div className="text-xs font-mono font-bold text-yellow-300">{srv.power}W</div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-[#14233c] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Risk:</span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      srv.risk_score >= 80
                        ? 'text-rose-400'
                        : srv.risk_score >= 50
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {srv.risk_score} / 100
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-cyan-400 group-hover:text-cyan-300 text-[11px] font-medium">
                  <span>Diagnostics</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
