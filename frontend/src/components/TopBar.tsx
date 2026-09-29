import React, { useState, useEffect, useRef } from 'react';
import { Search, ShieldAlert, CheckCircle, Database, Server, RefreshCw, X } from 'lucide-react';
import { api } from '../api';

interface TopBarProps {
  onSelectServer: (serverId: string) => void;
  onSelectIncident: (incidentId: string) => void;
  onSelectMemory: (memoryNum: number) => void;
  openAzureModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onSelectServer,
  onSelectIncident,
  onSelectMemory,
  openAzureModal
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    servers: any[];
    incidents: any[];
    memories: any[];
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await api.search(query);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-[#15233e] bg-[#070b14]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input Bar */}
      <div className="relative w-96" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-cyan-400/80 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results) setIsOpen(true);
            }}
            placeholder="Search server or incident..."
            className="w-full pl-9 pr-8 py-2 bg-[#0c1424] border border-[#1e345b] focus:border-cyan-500/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all font-mono"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="absolute right-2.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Autocomplete Dropdown */}
        {isOpen && results && (
          <div className="absolute top-11 left-0 w-full bg-[#0c1424] border border-cyan-800/60 rounded-xl shadow-2xl p-2 z-50 text-xs max-h-96 overflow-y-auto">
            {/* Servers Section */}
            {results.servers && results.servers.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1">
                  <Server className="w-3 h-3" />
                  <span>Servers</span>
                </div>
                {results.servers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectServer(s.server_id);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-cyan-950/50 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div className="font-mono font-medium">{s.server_id}</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400">{s.zone}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          s.status === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : s.status === 'WARNING'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Incidents Section */}
            {results.incidents && results.incidents.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Incidents</span>
                </div>
                {results.incidents.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => {
                      onSelectIncident(inc.incident_id || inc.id.toString());
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-amber-950/40 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-cyan-400 mr-2">{inc.server_id}</span>
                      <span className="text-slate-300">{inc.type}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded uppercase">
                      {inc.severity}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Memory Section */}
            {results.memories && results.memories.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1">
                  <Database className="w-3 h-3" />
                  <span>Guardian Memory</span>
                </div>
                {results.memories.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectMemory(m.memory_num);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-blue-950/40 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <span className="truncate pr-2">Memory #{m.memory_num} — {m.title}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">{m.server_id}</span>
                  </button>
                ))}
              </div>
            )}

            {(!results.servers?.length && !results.incidents?.length && !results.memories?.length) && (
              <div className="p-3 text-center text-slate-500">
                No matching telemetry or records found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side Status & Security Badges */}
      <div className="flex items-center space-x-4">
        {/* System Operational Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide shadow-[0_0_12px_rgba(16,185,129,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-green"></span>
          <span>SYSTEM OPERATIONAL</span>
        </div>

        {/* Separator Pipe */}
        <span className="text-slate-600 font-light">|</span>

        {/* Security Operations Badge */}
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-300">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-cyan-800/60 flex items-center justify-center text-cyan-400 text-[11px] font-bold">
            SO
          </div>
          <span className="hidden sm:inline">Security Operations</span>
        </div>

        {/* Azure Stack Quick Button */}
        <button
          onClick={openAzureModal}
          className="text-xs px-2.5 py-1 bg-[#101b30] hover:bg-cyan-950 border border-cyan-800/40 hover:border-cyan-500/60 text-cyan-300 rounded-md transition-all font-mono"
        >
          Azure Stack
        </button>
      </div>
    </header>
  );
};
