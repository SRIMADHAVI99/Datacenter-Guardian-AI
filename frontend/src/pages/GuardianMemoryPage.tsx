import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Search, 
  Database, 
  CheckCircle2, 
  Calendar, 
  Server, 
  Sparkles, 
  ArrowRight, 
  X,
  Bot,
  Tag
} from 'lucide-react';
import { GuardianMemoryItem } from '../types';
import { api } from '../api';

interface GuardianMemoryPageProps {
  onInvestigateAI: (query: string, serverId?: string) => void;
  onSelectServer: (serverId: string) => void;
  selectedMemoryNum?: number | null;
}

export const GuardianMemoryPage: React.FC<GuardianMemoryPageProps> = ({
  onInvestigateAI,
  onSelectServer,
  selectedMemoryNum
}) => {
  const [memories, setMemories] = useState<GuardianMemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMemory, setSelectedMemory] = useState<GuardianMemoryItem | null>(null);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const data = await api.getMemory(
        activeCategory === 'ALL' ? undefined : activeCategory,
        searchQuery || undefined
      );
      setMemories(data);

      if (selectedMemoryNum) {
        const target = data.find(m => m.memory_num === selectedMemoryNum);
        if (target) setSelectedMemory(target);
      }
    } catch (err) {
      console.error('Failed to load memory records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [activeCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMemories();
  };

  const categories = ['ALL', 'Cooling', 'CPU', 'Database', 'Network', 'Power'];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-[#14233c] gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Guardian Memory</span>
              <BrainCircuit className="w-5 h-5 text-cyan-400" />
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              {memories.length} Stored Cases
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            The agent stores previous incidents, actions and outcomes so future investigations can use past experience.
          </p>
        </div>

        <button
          onClick={() => onInvestigateAI('Have we seen a similar cooling anomaly before?')}
          className="px-3.5 py-2 rounded-lg bg-[#0e172a] hover:bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-medium transition-all flex items-center space-x-1.5 self-start md:self-auto"
        >
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ask AI from Memory</span>
        </button>
      </div>

      {/* Filter Category Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap rounded-lg bg-[#09101d] border border-[#14233c] p-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded text-[11px] font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memory..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#09101d] border border-[#14233c] focus:border-cyan-500 rounded-lg text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none"
          />
        </form>
      </div>

      {/* Memory Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          Querying Guardian Memory Store...
        </div>
      ) : memories.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs bg-[#09101d] rounded-xl border border-[#14233c]">
          No historical memory cards found for the selected query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => setSelectedMemory(mem)}
              className="p-5 rounded-xl bg-[#09101d] border border-cyan-900/40 hover:border-cyan-500/60 shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
            >
              <div>
                {/* Top Badge: Memory # + Category */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                      Memory #{mem.memory_num}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase">
                      {mem.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{mem.date}</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors mb-2">
                  {mem.title}
                </h3>

                {/* Server Tag */}
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-3 font-mono">
                  <Server className="w-3.5 h-3.5 text-slate-500" />
                  <span>Server: <b className="text-cyan-300">{mem.server_id}</b></span>
                </div>

                {/* Action Box */}
                <div className="p-2.5 rounded-lg bg-[#0c1424] border border-[#14233c] text-xs space-y-1 mb-2.5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Action Taken:</div>
                  <div className="text-slate-200 font-mono text-[11px]">{mem.action}</div>
                </div>

                {/* Outcome */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Outcome:</span>
                  <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center space-x-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{mem.outcome}</span>
                  </span>
                </div>

                {/* Lesson Learned */}
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-900/50 text-xs space-y-1">
                  <div className="text-[10px] text-cyan-400 font-bold uppercase flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Operational Lesson:</span>
                  </div>
                  <div className="text-slate-300 italic text-[11px] leading-relaxed">
                    "{mem.lesson}"
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-[#14233c] flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">Historical Precedent</span>
                <span className="text-cyan-400 group-hover:text-cyan-300 font-medium text-[11px] flex items-center space-x-1">
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#09101d] border border-cyan-800/60 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#14233c]">
              <div className="flex items-center space-x-2.5">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-700/50">
                  Memory #{selectedMemory.memory_num}
                </span>
                <h3 className="text-base font-bold text-white">{selectedMemory.title}</h3>
              </div>
              <button
                onClick={() => setSelectedMemory(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#0c1424] border border-[#14233c]">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Target Node</span>
                  <div className="text-sm font-mono font-bold text-cyan-300 mt-0.5">
                    {selectedMemory.server_id}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0c1424] border border-[#14233c]">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Incident Category</span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {selectedMemory.category}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0c1424] border border-[#14233c] space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Action Taken</span>
                <p className="text-slate-200 text-xs font-mono">{selectedMemory.action}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 space-y-1.5">
                <span className="text-[10px] text-cyan-300 uppercase font-bold flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Synthesized Agent Lesson</span>
                </span>
                <p className="text-slate-200 leading-relaxed font-medium">
                  {selectedMemory.lesson}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
                <span>Date Logged: {selectedMemory.date}</span>
                <span className="text-emerald-400 font-bold">Status: {selectedMemory.outcome}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#14233c] flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedMemory(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onInvestigateAI(
                    `How does Memory #${selectedMemory.memory_num} apply to our current operations?`,
                    selectedMemory.server_id
                  );
                  setSelectedMemory(null);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center space-x-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Investigate with AI</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
