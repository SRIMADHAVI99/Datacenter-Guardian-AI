import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Activity, 
  Cpu, 
  Thermometer, 
  Zap, 
  Droplet, 
  Wifi, 
  AlertTriangle, 
  Bot, 
  Sliders, 
  Clock, 
  ArrowLeft,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck
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
import { ServerItem, IncidentItem } from '../types';
import { api } from '../api';

interface ServerDetailsPageProps {
  serverId: string;
  onSelectServer: (id: string) => void;
  onInvestigateAI: (query: string, serverId?: string) => void;
  onRunSimulation: (serverId: string) => void;
  onViewIncidents: () => void;
}

export const ServerDetailsPage: React.FC<ServerDetailsPageProps> = ({
  serverId,
  onSelectServer,
  onInvestigateAI,
  onRunSimulation,
  onViewIncidents
}) => {
  const [server, setServer] = useState<ServerItem | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [allServers, setAllServers] = useState<ServerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllServers = async () => {
      try {
        const list = await api.getServers();
        setAllServers(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllServers();
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await api.getServerDetail(serverId || 'DC-SRV-024');
        setServer(data.server);
        setHistory(data.history);
        setIncidents(data.incidents);
        setAiAnalysis(data.ai_analysis);
      } catch (err) {
        console.error('Failed to load server details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [serverId]);

  if (loading && !server) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Loading server diagnostics for {serverId}...
      </div>
    );
  }

  const s = server || {
    id: 1,
    server_id: serverId || 'DC-SRV-024',
    zone: 'Rack C-02',
    role: 'AI Model Training Node',
    status: 'CRITICAL',
    cpu: 88.6,
    ram: 88.0,
    gpu: 92.5,
    temperature: 82.4,
    network: 9.2,
    power: 675.0,
    cooling: 54.0,
    water_usage: 24.5,
    risk_score: 91.0,
    uptime_days: 18,
    last_incident: 'Cooling anomaly & thermal spike'
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header with Server Switcher Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-[#14233c] gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <span>Node Diagnostics: {s.server_id}</span>
            </h1>

            {/* Server Selector Dropdown */}
            <div className="relative">
              <select
                value={s.server_id}
                onChange={(e) => onSelectServer(e.target.value)}
                className="bg-[#0c1424] border border-cyan-800/60 rounded-lg px-3 py-1 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {allServers.map((srv) => (
                  <option key={srv.id} value={srv.server_id} className="bg-[#09101d] text-white">
                    {srv.server_id} ({srv.status})
                  </option>
                ))}
              </select>
            </div>

            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
              s.status === 'CRITICAL'
                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                : s.status === 'WARNING'
                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {s.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Location: {s.zone} | Role: {s.role} | Uptime: {s.uptime_days || 120} days
          </p>
        </div>

        {/* Action Buttons: Investigate, View Incident History, Run What-if Simulation */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onInvestigateAI(`Why is ${s.server_id} operating in ${s.status} state?`, s.server_id)}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center space-x-1.5"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Investigate</span>
          </button>

          <button
            onClick={onViewIncidents}
            className="px-3.5 py-2 rounded-lg bg-[#0c1424] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-all flex items-center space-x-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>View Incident History</span>
          </button>

          <button
            onClick={() => onRunSimulation(s.server_id)}
            className="px-3.5 py-2 rounded-lg bg-[#0c1424] hover:bg-cyan-950 border border-cyan-800/60 text-cyan-300 text-xs font-medium transition-all flex items-center space-x-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Run What-if Simulation</span>
          </button>
        </div>
      </div>

      {/* AI Analysis Card */}
      {aiAnalysis && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-[#09101d] to-[#09101d] border border-cyan-500/50 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                AI Guardian Automated Health Evaluation
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/40">
              Confidence 94%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#0c1424] border border-[#14233c] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Current Condition</span>
              <p className="text-slate-200 text-[11px] leading-relaxed">{aiAnalysis.current_condition}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0c1424] border border-[#14233c] space-y-1">
              <span className="text-[10px] text-amber-400 uppercase font-mono font-bold">Predicted Issue</span>
              <p className="text-slate-200 text-[11px] leading-relaxed">{aiAnalysis.predicted_issue}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0c1424] border border-[#14233c] space-y-1">
              <span className="text-[10px] text-rose-400 uppercase font-mono font-bold">Root Cause</span>
              <p className="text-slate-200 text-[11px] leading-relaxed">{aiAnalysis.root_cause}</p>
            </div>
            <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-600/40 space-y-1">
              <span className="text-[10px] text-cyan-300 uppercase font-mono font-bold">Recommended Action</span>
              <p className="text-white text-[11px] leading-relaxed font-semibold">{aiAnalysis.recommended_action}</p>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Overview Numbers (CPU, RAM, GPU, Temp, Net, Power, Cooling, Uptime, Last Incident, Risk) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="text-[10px] text-slate-400 uppercase font-mono">CPU Utilization</div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">{s.cpu}%</div>
          <div className="text-[10px] text-slate-500">Dual Xeon 64-Core</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="text-[10px] text-slate-400 uppercase font-mono">RAM Memory</div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">{s.ram}%</div>
          <div className="text-[10px] text-slate-500">512 GB ECC DDR5</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="text-[10px] text-slate-400 uppercase font-mono">GPU Tensor Load</div>
          <div className="text-xl font-bold font-mono text-purple-300 mt-1">{s.gpu}%</div>
          <div className="text-[10px] text-slate-500">4x H100 SXM5</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Core Temperature</div>
          <div className={`text-xl font-bold font-mono mt-1 ${s.temperature >= 80 ? 'text-rose-400' : 'text-amber-300'}`}>
            {s.temperature}°C
          </div>
          <div className="text-[10px] text-slate-500">Thermal Limit: 85°C</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Network Bandwidth</div>
          <div className="text-xl font-bold font-mono text-blue-300 mt-1">{s.network} Gbps</div>
          <div className="text-[10px] text-slate-500">400G ConnectX-7</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Power Draw</div>
          <div className="text-xl font-bold font-mono text-yellow-300 mt-1">{s.power} W</div>
          <div className="text-[10px] text-slate-500">Nominal: 450W</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Cooling Loop Flow</div>
          <div className={`text-xl font-bold font-mono mt-1 ${s.cooling < 65 ? 'text-rose-400' : 'text-teal-300'}`}>
            {s.cooling}%
          </div>
          <div className="text-[10px] text-slate-500">Liquid chilled loop</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Uptime</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{s.uptime_days || 18} d</div>
          <div className="text-[10px] text-slate-500">Zero unhandled crashes</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Risk Score</div>
          <div className={`text-xl font-bold font-mono mt-1 ${s.risk_score >= 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {s.risk_score} / 100
          </div>
          <div className="text-[10px] text-slate-500">ML failure index</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Last Incident</div>
          <div className="text-xs font-bold text-amber-300 mt-1 truncate" title={s.last_incident}>
            {s.last_incident}
          </div>
          <div className="text-[10px] text-slate-500">Active Monitoring</div>
        </div>
      </div>

      {/* 3 History Charts: CPU History, Temperature History, Power History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CPU History */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>CPU History</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">{s.cpu}% Current</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="cpuHistGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 9 }} />
                <YAxis domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0c1424', borderColor: '#1e345b', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="cpu" stroke="#00f0ff" fill="url(#cpuHistGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature History */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Temperature History</span>
            </h3>
            <span className="text-[10px] font-mono text-amber-400">{s.temperature}°C Current</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 9 }} />
                <YAxis domain={[40, 95]} stroke="#475569" tick={{ fontSize: 9 }} unit="°C" />
                <Tooltip contentStyle={{ backgroundColor: '#0c1424', borderColor: '#1e345b', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Power History */}
        <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Power History</span>
            </h3>
            <span className="text-[10px] font-mono text-yellow-400">{s.power}W Current</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history}>
                <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 9 }} />
                <YAxis domain={[200, 800]} stroke="#475569" tick={{ fontSize: 9 }} unit="W" />
                <Tooltip contentStyle={{ backgroundColor: '#0c1424', borderColor: '#1e345b', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="power" fill="#38bdf8" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Incident History Table for This Server */}
      <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-lg">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
          Recorded Incidents for {s.server_id}
        </h3>
        {incidents.length === 0 ? (
          <div className="text-xs text-slate-500 py-3">No active or historical incidents recorded for this node.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#14233c] text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-2 px-3">Severity</th>
                  <th className="py-2 px-3">Incident</th>
                  <th className="py-2 px-3">Root Cause</th>
                  <th className="py-2 px-3">Action Taken</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14233c]/60">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-[#0c1424]">
                    <td className="py-2 px-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        inc.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-white font-medium">{inc.incident_type}</td>
                    <td className="py-2 px-3 text-slate-400">{inc.root_cause}</td>
                    <td className="py-2 px-3 font-mono text-cyan-300">{inc.recommended_action}</td>
                    <td className="py-2 px-3">
                      <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500">{inc.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
