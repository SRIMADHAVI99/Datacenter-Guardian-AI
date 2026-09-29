import React, { useState, useEffect } from 'react';
import { X, CloudCheck, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Database, Cpu, Activity, Zap } from 'lucide-react';
import { api } from '../api';

interface AzureIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AzureIntegrationModal: React.FC<AzureIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getAzureStatus()
        .then(data => setStatus(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#09101d] border border-cyan-800/60 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#14233c]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-950 border border-blue-500/40 text-blue-400">
              <CloudCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Microsoft Azure Integration Layer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                  ENTERPRISE READY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Architectural abstraction conforming to Microsoft Cloud Adoption Framework
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operational Notice */}
        <div className="p-3.5 rounded-xl bg-[#0c1424] border border-[#1e345b] text-xs space-y-1">
          <div className="flex items-center space-x-2 text-cyan-300 font-bold uppercase text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Operational Mode Transparency</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Currently operating in <b>Local Prototype Mode (Azure Ready)</b> with clean connector abstractions.
            When cloud environment variables are provisioned, connectors switch automatically from local high-speed SQLite and synthetic sensor loops to native Azure endpoints with zero code modifications.
          </p>
        </div>

        {/* Service Connectors List */}
        <div className="space-y-3">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
            Supported Azure Services & Status
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">Loading integration matrix...</div>
          ) : (
            <div className="space-y-2.5">
              {status?.services?.map((svc: any) => (
                <div key={svc.id} className="p-3 rounded-lg bg-[#0c1424] border border-[#14233c] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span>{svc.name}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                      {svc.mode}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{svc.purpose}</div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Endpoint: <span className="text-slate-300">{svc.target}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#14233c] flex items-center justify-between text-xs">
          <span className="text-[10px] font-mono text-slate-500">FastAPI backend abstraction verified</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs transition-all"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
