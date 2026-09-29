import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  Database, 
  CheckCircle2, 
  TrendingUp, 
  Cpu, 
  Layers, 
  ChevronRight,
  ArrowUpRight,
  Terminal,
  RefreshCw,
  Server
} from 'lucide-react';
import { AIInvestigationResponse } from '../types';
import { api } from '../api';

interface AIGuardianPageProps {
  initialQuery?: string;
  initialServerId?: string;
  onSelectServer: (serverId: string) => void;
  onSelectMemory: (memoryNum: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  timestamp: string;
  text?: string;
  investigation?: AIInvestigationResponse;
}

export const AIGuardianPage: React.FC<AIGuardianPageProps> = ({
  initialQuery,
  initialServerId,
  onSelectServer,
  onSelectMemory
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      timestamp: 'Just now',
      text: 'Hello. I can investigate incidents, recall similar historical cases, and recommend actions.'
    }
  ]);
  const [inputQuery, setInputQuery] = useState(initialQuery || '');
  const [targetServer, setTargetServer] = useState(initialServerId || '');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'Why is DC-SRV-024 overheating?',
    'Have we seen a similar cooling incident?',
    'What caused the CPU spike?',
    'What should we do if power consumption increases by 20%?',
    'Which server has the highest failure risk?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery) {
      handleInvestigate(initialQuery, initialServerId);
    }
  }, [initialQuery]);

  const handleInvestigate = async (queryText?: string, srvId?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await api.investigateAI(q, srvId || targetServer || undefined);
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        investigation: response
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Telemetry query error: Unable to synthesize live investigation. Please check backend connection.'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="pb-3 border-b border-[#14233c] shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>AI Guardian</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700/50 uppercase">
                Cognitive Investigation Agent
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Ask the AI about infrastructure incidents.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="shrink-0 flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 text-[11px] font-mono whitespace-nowrap flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Suggestions:</span>
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleInvestigate(prompt)}
            className="px-3 py-1.5 rounded-full bg-[#0c1424] hover:bg-cyan-950/80 border border-cyan-900/60 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-200 text-[11px] whitespace-nowrap transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'user' ? (
              <div className="max-w-xl bg-cyan-950/80 border border-cyan-600/40 rounded-2xl rounded-tr-sm p-4 text-xs text-white shadow-lg space-y-1">
                <div className="text-[10px] font-mono text-cyan-300 font-bold uppercase">Operator Inquiry</div>
                <div className="text-sm font-medium">{msg.text}</div>
                <div className="text-[10px] font-mono text-cyan-500 text-right">{msg.timestamp}</div>
              </div>
            ) : msg.investigation ? (
              /* Structured AI Investigation Card matching prompt specifications */
              <div className="w-full max-w-3xl bg-[#09101d] border border-cyan-800/60 rounded-2xl rounded-tl-sm p-5 space-y-4 shadow-2xl">
                {/* Header bar of response */}
                <div className="flex items-center justify-between pb-3 border-b border-[#14233c]">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        INVESTIGATION REPORT
                      </div>
                      <div className="text-[11px] text-cyan-400 font-mono">
                        TARGET: {msg.investigation.server_id || 'FLEET OVERVIEW'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Risk Badge */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] text-slate-400 font-mono uppercase">RISK:</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        msg.investigation.risk_assessment === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : msg.investigation.risk_assessment === 'HIGH'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {msg.investigation.risk_assessment}
                      </span>
                    </div>

                    {/* Confidence Meter */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] text-slate-400 font-mono uppercase">CONFIDENCE:</span>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {msg.investigation.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1. Incident Summary */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    1. INCIDENT SUMMARY
                  </div>
                  <div className="p-3 rounded-lg bg-[#0c1424] border border-[#14233c] text-xs text-white font-medium">
                    {msg.investigation.incident_summary}
                  </div>
                </div>

                {/* 2. Evidence */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    2. TELEMETRY EVIDENCE
                  </div>
                  <div className="p-3 rounded-lg bg-[#0c1424] border border-[#14233c] space-y-1 text-xs text-slate-300">
                    <p className="font-semibold text-cyan-200 mb-1">FINDING: {msg.investigation.finding}</p>
                    {msg.investigation.evidence.map((point, i) => (
                      <div key={i} className="flex items-start space-x-2 text-[11px] font-mono text-slate-300">
                        <span className="text-cyan-400">›</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Historical Similar Cases (Guardian Memory) */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>3. HISTORICAL SIMILAR CASES (GUARDIAN MEMORY)</span>
                  </div>
                  <div className="space-y-2">
                    {msg.investigation.historical_similar_cases && msg.investigation.historical_similar_cases.length > 0 ? (
                      msg.investigation.historical_similar_cases.map((mem, i) => (
                        <div
                          key={i}
                          onClick={() => onSelectMemory(mem.memory_num)}
                          className="p-3 rounded-lg bg-[#080d18] border border-blue-900/50 hover:border-blue-500/60 transition-all cursor-pointer group space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-cyan-300 group-hover:underline">
                              Memory #{mem.memory_num} — {mem.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{mem.server_id}</span>
                          </div>
                          <div className="text-[11px] text-slate-300">
                            <b>Action:</b> {mem.action}
                          </div>
                          <div className="text-[11px] text-emerald-400">
                            <b>Outcome:</b> {mem.outcome} | <i>Lesson: {mem.lesson}</i>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-lg bg-[#0c1424] border border-[#14233c] text-slate-400 text-xs font-mono">
                        SIMILAR MEMORY: {msg.investigation.similar_memory || 'No exact prior incident recorded'}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Recommended Action */}
                <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>4. RECOMMENDED ACTION</span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">Actionable Remediation</span>
                  </div>
                  <div className="text-white font-semibold text-xs leading-relaxed">
                    {msg.investigation.recommended_action}
                  </div>
                </div>

                {/* Interactive Footer Links */}
                <div className="pt-2 border-t border-[#14233c] flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">Confidence Level: {msg.investigation.confidence}%</span>
                  {msg.investigation.server_id && (
                    <button
                      onClick={() => {
                        if (msg.investigation?.server_id) {
                          onSelectServer(msg.investigation.server_id);
                        }
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                    >
                      <span>Open {msg.investigation.server_id} Diagnostics</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Plain text message (e.g. welcome) */
              <div className="max-w-xl bg-[#09101d] border border-cyan-900/50 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-200 shadow-md">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-[11px] mb-1">
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Guardian</span>
                </div>
                <div className="leading-relaxed">{msg.text}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-2">{msg.timestamp}</div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="p-4 rounded-xl bg-[#09101d] border border-cyan-800/60 text-xs text-cyan-300 flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-mono">Synthesizing telemetry streams & querying Guardian Memory...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="shrink-0 pt-2 border-t border-[#14233c]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleInvestigate();
          }}
          className="flex items-center space-x-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="e.g. Have we seen a similar CPU incident before?"
              className="w-full pl-4 pr-10 py-3 bg-[#0c1424] border border-cyan-900/60 focus:border-cyan-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/50 shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center space-x-2"
          >
            <span>Investigate</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
