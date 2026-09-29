import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  X, 
  Bot, 
  Search, 
  Filter, 
  ArrowRight,
  HardDrive,
  Cpu,
  Layers,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { IncidentItem, GuardianMemoryItem } from '../types';
import { api } from '../api';

interface IncidentCenterPageProps {
  onInvestigateAI: (query: string, serverId?: string) => void;
  onSelectServer: (serverId: string) => void;
}

export const IncidentCenterPage: React.FC<IncidentCenterPageProps> = ({
  onInvestigateAI,
  onSelectServer
}) => {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'RESOLVED'>('ALL');
  const [search, setSearch] = useState('');
  
  // Drawer state
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [drawerData, setDrawerData] = useState<{
    incident: IncidentItem;
    timeline: { time: string; event: string }[];
    similar_memories: GuardianMemoryItem[];
    affected_resources?: string;
    symptoms?: string;
    impact?: string;
    root_cause: string;
    recommended_action: string;
    resolution_notes?: string;
  } | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const openDrawer = async (id: string) => {
    setSelectedIncidentId(id);
    setDrawerLoading(true);
    try {
      const data = await api.getIncidentDetail(id);
      setDrawerData(data);
    } catch (err) {
      console.error('Failed to fetch incident details', err);
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setSelectedIncidentId(null);
    setDrawerData(null);
  };

  const handleResolve = async () => {
    if (!selectedIncidentId) return;
    setIsResolving(true);
    try {
      await api.resolveIncident(
        selectedIncidentId, 
        'Manually validated and resolved by operator', 
        'Action executed successfully via Incident Center.'
      );
      await fetchIncidents();
      if (drawerData) {
        setDrawerData({
          ...drawerData,
          incident: { ...drawerData.incident, status: 'RESOLVED' }
        });
      }
    } catch (err) {
      console.error('Failed to resolve incident', err);
    } finally {
      setIsResolving(false);
    }
  };

  const filteredIncidents = incidents.filter((item) => {
    let matchesFilter = true;
    if (filter === 'RESOLVED') {
      matchesFilter = item.status === 'RESOLVED';
    } else if (filter !== 'ALL') {
      matchesFilter = item.severity === filter;
    }
    const matchesSearch = item.server_id.toLowerCase().includes(search.toLowerCase()) ||
                          item.incident_type.toLowerCase().includes(search.toLowerCase()) ||
                          item.root_cause.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-[#14233c] gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">Incident Center</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
              {incidents.filter(i => i.status !== 'RESOLVED').length} Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated anomaly detection log, root-cause correlation, and remediation audit trail.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchIncidents}
            className="p-2 rounded-lg bg-[#0e172a] hover:bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 transition-all text-xs flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex rounded-lg bg-[#09101d] border border-[#14233c] p-1 text-xs">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'RESOLVED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded text-[11px] font-medium transition-all ${
                filter === tab
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incident or cause..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#09101d] border border-[#14233c] focus:border-cyan-500 rounded-lg text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none"
          />
        </div>
      </div>

      {/* Incident Table */}
      <div className="rounded-xl bg-[#09101d] border border-cyan-900/40 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#14233c] bg-[#0c1424] text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Server ID</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-4">Incident</th>
                <th className="py-3 px-4">Root Cause</th>
                <th className="py-3 px-4">Recommended Action</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14233c]/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading incident registry...
                  </td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No incidents matching selected filter.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => openDrawer(inc.incident_id || inc.id.toString())}
                    className="hover:bg-[#0c1424] transition-colors cursor-pointer group"
                  >
                    {/* Server ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300 group-hover:text-cyan-200">
                      {inc.server_id}
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          inc.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : inc.severity === 'HIGH'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>

                    {/* Incident */}
                    <td className="py-3.5 px-4 font-medium text-white group-hover:text-cyan-100">
                      {inc.incident_type}
                    </td>

                    {/* Root Cause */}
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                      {inc.root_cause}
                    </td>

                    {/* Recommended Action */}
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate font-mono text-[11px]">
                      {inc.recommended_action}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          inc.status === 'RESOLVED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {inc.timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Investigation Drawer */}
      {selectedIncidentId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-xl bg-[#09101d] border-l border-cyan-800/50 h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#14233c]">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center space-x-2">
                      <span>Incident Investigation</span>
                      <span className="text-xs font-mono text-cyan-400">
                        [{drawerData?.incident.incident_id || selectedIncidentId}]
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Target Node: {drawerData?.incident.server_id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {drawerLoading ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  Loading incident diagnostics...
                </div>
              ) : drawerData ? (
                <div className="mt-5 space-y-5 text-xs">
                  {/* Status & Severity Bar */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#0c1424] border border-[#14233c]">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 uppercase font-mono">Severity:</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        drawerData.incident.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {drawerData.incident.severity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 uppercase font-mono">Status:</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        drawerData.incident.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      }`}>
                        {drawerData.incident.status}
                      </span>
                    </div>
                  </div>

                  {/* Incident Summary */}
                  <div className="space-y-1.5">
                    <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      Incident Summary
                    </div>
                    <p className="p-3 rounded-lg bg-[#0c1424] border border-[#14233c] text-slate-200 leading-relaxed">
                      {drawerData.incident.description}
                    </p>
                  </div>

                  {/* Detected Symptoms & Impact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[#0c1424] border border-[#14233c] space-y-1">
                      <div className="text-[10px] text-amber-400 font-bold uppercase">Detected Symptoms</div>
                      <div className="text-slate-300 text-[11px]">{drawerData.symptoms || 'Sensor threshold exceeded'}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0c1424] border border-[#14233c] space-y-1">
                      <div className="text-[10px] text-rose-400 font-bold uppercase">Operational Impact</div>
                      <div className="text-slate-300 text-[11px]">{drawerData.impact || 'Service latency degradation'}</div>
                    </div>
                  </div>

                  {/* Affected Resources */}
                  <div className="p-3 rounded-lg bg-[#0c1424] border border-[#14233c] space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1.5">
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <span>Affected Resources</span>
                    </div>
                    <div className="text-slate-200 font-mono text-[11px]">{drawerData.affected_resources}</div>
                  </div>

                  {/* Root-cause analysis */}
                  <div className="p-3.5 rounded-lg bg-[#0c1424] border border-cyan-900/60 space-y-1.5">
                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      Root-Cause Analysis
                    </div>
                    <div className="text-slate-200 font-medium">{drawerData.root_cause}</div>
                  </div>

                  {/* AI Recommendation */}
                  <div className="p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-500/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-cyan-300 font-bold uppercase flex items-center space-x-1.5">
                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                        <span>AI Remediation Recommendation</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-900 text-cyan-200 font-mono">
                        94% Match
                      </span>
                    </div>
                    <div className="text-white font-medium">{drawerData.recommended_action}</div>
                  </div>

                  {/* Incident Timeline */}
                  <div className="space-y-2">
                    <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Incident Timeline</span>
                    </div>
                    <div className="space-y-2 border-l-2 border-cyan-800/60 ml-2 pl-3">
                      {drawerData.timeline?.map((step, idx) => (
                        <div key={idx} className="relative text-[11px]">
                          <span className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-cyan-400"></span>
                          <span className="font-mono text-cyan-400 mr-2">{step.time}</span>
                          <span className="text-slate-300">{step.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Previous Similar Incidents / Guardian Memory */}
                  {drawerData.similar_memories && drawerData.similar_memories.length > 0 && (
                    <div className="p-3 rounded-lg bg-[#0c1424] border border-blue-900/40 space-y-2">
                      <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                        Guardian Memory Correlated Record
                      </div>
                      {drawerData.similar_memories.map((m) => (
                        <div key={m.id} className="text-[11px] p-2 rounded bg-[#080d18] border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-slate-200 font-bold">
                            <span>Memory #{m.memory_num} — {m.title}</span>
                            <span className="text-cyan-400 font-mono">{m.server_id}</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">Lesson: {m.lesson}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resolution Notes */}
                  {drawerData.incident.status === 'RESOLVED' && (
                    <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                      <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolution Details</span>
                      </div>
                      <div className="text-slate-300 text-[11px]">{drawerData.resolution_notes}</div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-[#14233c] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (drawerData) {
                    onInvestigateAI(
                      `Why is ${drawerData.incident.server_id} experiencing ${drawerData.incident.incident_type}?`,
                      drawerData.incident.server_id
                    );
                    closeDrawer();
                  }
                }}
                className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              >
                <Bot className="w-4 h-4" />
                <span>Investigate with AI</span>
              </button>

              {drawerData?.incident.status !== 'RESOLVED' && (
                <button
                  onClick={handleResolve}
                  disabled={isResolving}
                  className="px-4 py-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-500/50 text-emerald-300 font-medium text-xs transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isResolving ? 'Resolving...' : 'Mark Resolved'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
