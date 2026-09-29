import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Activity, 
  AlertTriangle, 
  BrainCircuit, 
  Bot, 
  Sliders, 
  Server,
  CloudCheck,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedServerId: string;
  openAzureModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  openAzureModal 
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
    { id: 'incidents', label: 'Incident Center', icon: AlertTriangle, badge: '1 Active' },
    { id: 'memory', label: 'Guardian Memory', icon: BrainCircuit },
    { id: 'ai-guardian', label: 'AI Guardian', icon: Bot },
    { id: 'simulator', label: 'What-if Simulator', icon: Sliders },
    { id: 'server-details', label: 'Server Details', icon: Server },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#070b14] border-r border-[#15233e] flex flex-col justify-between shrink-0 select-none z-20">
      <div>
        {/* Header / Brand Logo */}
        <div className="p-5 border-b border-[#15233e] flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[12px] font-bold tracking-widest text-cyan-400 uppercase leading-none">
              DATACENTER
            </div>
            <div className="text-[15px] font-extrabold tracking-tight text-white leading-tight">
              GUARDIAN AI
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Operations & Control
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-[inset_0_0_12px_rgba(6,182,212,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1424] border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Enterprise Cloud
          </div>
          <button
            onClick={openAzureModal}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-[#0c1424] border border-transparent transition-all"
          >
            <div className="flex items-center space-x-3">
              <CloudCheck className="w-4 h-4 text-blue-400" />
              <span>Azure Ready Stack</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/30 text-blue-400 border border-blue-500/30 rounded">
              Ready
            </span>
          </button>
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div className="p-4 border-t border-[#15233e]">
        <div className="p-3.5 rounded-xl bg-[#09101d] border border-cyan-900/40 space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 border-b border-slate-800/80 pb-1.5">
            <span className="flex items-center space-x-1.5">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>SYSTEM AGENTS</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded">
              LIVE
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-green"></span>
              <span>Monitoring Engine Online</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Memory Store Connected</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Guardian Agent Ready</span>
            </div>
          </div>
        </div>

        <div className="mt-2 text-center text-[10px] text-slate-600 font-mono">
          v2.4.0-enterprise | DC-EAST-01
        </div>
      </div>
    </aside>
  );
};
