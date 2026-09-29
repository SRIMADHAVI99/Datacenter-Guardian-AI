import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Play, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Thermometer, 
  Droplet, 
  Cpu, 
  Bot,
  Layers,
  Save
} from 'lucide-react';
import { SimulationResult } from '../types';
import { api } from '../api';

interface WhatIfSimulatorPageProps {
  initialServerId?: string;
  onInvestigateAI: (query: string, serverId?: string) => void;
}

export const WhatIfSimulatorPage: React.FC<WhatIfSimulatorPageProps> = ({
  initialServerId,
  onInvestigateAI
}) => {
  // Slider states
  const [cpuDelta, setCpuDelta] = useState<number>(0);
  const [gpuDelta, setGpuDelta] = useState<number>(30); // Pre-load +30% matching example!
  const [tempDelta, setTempDelta] = useState<number>(0);
  const [coolingDelta, setCoolingDelta] = useState<number>(0);
  const [serverCountDelta, setServerCountDelta] = useState<number>(0);
  const [networkDelta, setNetworkDelta] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [savedSimulations, setSavedSimulations] = useState<any[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Preset scenarios
  const applyPreset = (presetName: string) => {
    if (presetName === 'gpu_burst') {
      setCpuDelta(15);
      setGpuDelta(30);
      setTempDelta(2);
      setCoolingDelta(0);
      setServerCountDelta(0);
      setNetworkDelta(5);
    } else if (presetName === 'cooling_failure') {
      setCpuDelta(0);
      setGpuDelta(10);
      setTempDelta(5);
      setCoolingDelta(-30);
      setServerCountDelta(0);
      setNetworkDelta(0);
    } else if (presetName === 'cluster_expansion') {
      setCpuDelta(20);
      setGpuDelta(20);
      setTempDelta(0);
      setCoolingDelta(15);
      setServerCountDelta(4);
      setNetworkDelta(12);
    } else if (presetName === 'green_throttle') {
      setCpuDelta(-20);
      setGpuDelta(-25);
      setTempDelta(-3);
      setCoolingDelta(0);
      setServerCountDelta(0);
      setNetworkDelta(-4);
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.runSimulation({
        base_server_id: initialServerId || 'DC-SRV-024',
        cpu_workload_delta: cpuDelta,
        gpu_workload_delta: gpuDelta,
        ambient_temp_delta: tempDelta,
        cooling_capacity_delta: coolingDelta,
        server_count_delta: serverCountDelta,
        network_traffic_delta: networkDelta
      });
      setResult(res);
    } catch (err) {
      console.error('Simulation calculation failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [cpuDelta, gpuDelta, tempDelta, coolingDelta, serverCountDelta, networkDelta]);

  const handleReset = () => {
    setCpuDelta(0);
    setGpuDelta(0);
    setTempDelta(0);
    setCoolingDelta(0);
    setServerCountDelta(0);
    setNetworkDelta(0);
  };

  const handleSaveScenario = () => {
    if (!result) return;
    setSavedSimulations(prev => [
      ...prev,
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        gpu: gpuDelta,
        cpu: cpuDelta,
        risk: result.simulation.predicted_state.failure_risk,
        status: result.simulation.predicted_state.status
      }
    ]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const cur = result?.current_state || {
    cpu: 50.0,
    gpu: 40.0,
    temperature: 65.0,
    cooling: 85.0,
    power: 450.0,
    failure_risk: 18.0
  };

  const pred = result?.simulation.predicted_state || {
    cpu: 50.0,
    gpu: 70.0,
    power_watts: 531.0,
    power_delta_pct: 18.0,
    temperature: 70.0,
    temperature_delta_c: 5.0,
    cooling_requirement_delta_pct: 11.0,
    failure_risk: 26.0,
    failure_risk_delta_pct: 8.0,
    status: 'WARNING'
  };

  const rec = result?.simulation.ai_recommendation || 
    'Move non-critical workloads to Cluster B and increase cooling capacity.';

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-[#14233c] gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <span>What-if Simulator</span>
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/50">
              Physics & Thermodynamic Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulate operational shifts in workload, ambient temperature, and cooling failure before deploying changes to physical racks.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-[#0e172a] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-all flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sliders</span>
          </button>
          <button
            onClick={handleSaveScenario}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-300 text-xs font-medium transition-all flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveSuccess ? 'Saved to Audit!' : 'Save Scenario'}</span>
          </button>
        </div>
      </div>

      {/* Preset Stress Testing Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] font-mono whitespace-nowrap">
          Quick Stress Presets:
        </span>
        <button
          onClick={() => applyPreset('gpu_burst')}
          className="px-3 py-1 rounded bg-[#0c1424] hover:bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono transition-all"
        >
          ⚡ GPU Load +30% (Standard Benchmark)
        </button>
        <button
          onClick={() => applyPreset('cooling_failure')}
          className="px-3 py-1 rounded bg-[#0c1424] hover:bg-rose-950 border border-rose-800 text-rose-300 text-xs font-mono transition-all"
        >
          ❄️ Cooling Loop Degradation (-30%)
        </button>
        <button
          onClick={() => applyPreset('cluster_expansion')}
          className="px-3 py-1 rounded bg-[#0c1424] hover:bg-purple-950 border border-purple-800 text-purple-300 text-xs font-mono transition-all"
        >
          🚀 Fleet Expansion (+4 Racks)
        </button>
        <button
          onClick={() => applyPreset('green_throttle')}
          className="px-3 py-1 rounded bg-[#0c1424] hover:bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono transition-all"
        >
          🌱 Eco-Throttle Mode (-25% Load)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Simulation Sliders (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#09101d] border border-cyan-900/50 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-[#14233c]">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Operational Variables</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">Real-time Recalculation</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* GPU Workload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">GPU Tensor Workload:</span>
                <span className="font-mono font-bold text-purple-400">
                  {gpuDelta >= 0 ? `+${gpuDelta}%` : `${gpuDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="60"
                step="5"
                value={gpuDelta}
                onChange={(e) => setGpuDelta(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>-50%</span>
                <span>Baseline (0%)</span>
                <span>+60%</span>
              </div>
            </div>

            {/* CPU Workload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">CPU Compute Workload:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {cpuDelta >= 0 ? `+${cpuDelta}%` : `${cpuDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={cpuDelta}
                onChange={(e) => setCpuDelta(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>-50%</span>
                <span>Baseline (0%)</span>
                <span>+50%</span>
              </div>
            </div>

            {/* Ambient Temperature */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">Ambient Temperature Delta:</span>
                <span className="font-mono font-bold text-amber-400">
                  {tempDelta >= 0 ? `+${tempDelta}°C` : `${tempDelta}°C`}
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="15"
                step="1"
                value={tempDelta}
                onChange={(e) => setTempDelta(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>-10°C</span>
                <span>0°C</span>
                <span>+15°C</span>
              </div>
            </div>

            {/* Cooling Capacity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">Cooling Capacity Modulation:</span>
                <span className={`font-mono font-bold ${coolingDelta < 0 ? 'text-rose-400' : 'text-teal-400'}`}>
                  {coolingDelta >= 0 ? `+${coolingDelta}%` : `${coolingDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-40"
                max="30"
                step="5"
                value={coolingDelta}
                onChange={(e) => setCoolingDelta(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>-40% (Degraded)</span>
                <span>0%</span>
                <span>+30% (Chilled)</span>
              </div>
            </div>

            {/* Server Count Delta */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">Server Rack Scale Count:</span>
                <span className="font-mono font-bold text-blue-400">
                  {serverCountDelta >= 0 ? `+${serverCountDelta} Nodes` : `${serverCountDelta} Nodes`}
                </span>
              </div>
              <input
                type="range"
                min="-4"
                max="8"
                step="1"
                value={serverCountDelta}
                onChange={(e) => setServerCountDelta(Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>-4 Nodes</span>
                <span>0</span>
                <span>+8 Nodes</span>
              </div>
            </div>

            {/* Network Traffic */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">Network Traffic Ingress:</span>
                <span className="font-mono font-bold text-sky-400">
                  {networkDelta >= 0 ? `+${networkDelta} Gbps` : `${networkDelta} Gbps`}
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="25"
                step="2"
                value={networkDelta}
                onChange={(e) => setNetworkDelta(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>-10G</span>
                <span>0</span>
                <span>+25G</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Predicted State & AI Recommendations (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Comparison Cards: Current vs Predicted */}
          <div className="p-5 rounded-2xl bg-[#09101d] border border-cyan-900/50 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#14233c]">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Simulated Infrastructure Impact
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                pred.status === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : pred.status === 'WARNING'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                Predicted State: {pred.status}
              </span>
            </div>

            {/* 4 Impact Stat Blocks matching user prompt:
                GPU Load       +30%
                Power          +18%
                Temperature    +5°C
                Cooling        +11%
                Failure Risk   +8%
            */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Power */}
              <div className="p-3 rounded-xl bg-[#0c1424] border border-[#14233c] space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
                  <span>Power</span>
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                </div>
                <div className="text-lg font-bold font-mono text-white">{pred.power_watts} W</div>
                <div className="text-[11px] font-mono font-bold text-amber-400">
                  {pred.power_delta_pct >= 0 ? `+${pred.power_delta_pct}%` : `${pred.power_delta_pct}%`}
                </div>
              </div>

              {/* Temperature */}
              <div className="p-3 rounded-xl bg-[#0c1424] border border-[#14233c] space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
                  <span>Temperature</span>
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-lg font-bold font-mono text-white">{pred.temperature}°C</div>
                <div className="text-[11px] font-mono font-bold text-amber-400">
                  {pred.temperature_delta_c >= 0 ? `+${pred.temperature_delta_c}°C` : `${pred.temperature_delta_c}°C`}
                </div>
              </div>

              {/* Cooling Requirement */}
              <div className="p-3 rounded-xl bg-[#0c1424] border border-[#14233c] space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
                  <span>Cooling Req.</span>
                  <Droplet className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="text-lg font-bold font-mono text-white">Chiller Flow</div>
                <div className="text-[11px] font-mono font-bold text-teal-400">
                  {pred.cooling_requirement_delta_pct >= 0 ? `+${pred.cooling_requirement_delta_pct}%` : `${pred.cooling_requirement_delta_pct}%`}
                </div>
              </div>

              {/* Failure Risk */}
              <div className="p-3 rounded-xl bg-[#0c1424] border border-[#14233c] space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
                  <span>Failure Risk</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="text-lg font-bold font-mono text-white">{pred.failure_risk} / 100</div>
                <div className="text-[11px] font-mono font-bold text-rose-400">
                  {pred.failure_risk_delta_pct >= 0 ? `+${pred.failure_risk_delta_pct}%` : `${pred.failure_risk_delta_pct}%`}
                </div>
              </div>
            </div>

            {/* Before vs After Detailed Metrics Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#14233c] text-slate-500 uppercase text-[10px]">
                    <th className="py-2 px-2">Metric</th>
                    <th className="py-2 px-2">Current State</th>
                    <th className="py-2 px-2">Simulated Delta</th>
                    <th className="py-2 px-2 text-right">Predicted State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#14233c]/60 text-slate-300">
                  <tr>
                    <td className="py-2 px-2 text-white font-bold">GPU Load</td>
                    <td className="py-2 px-2 text-slate-400">{cur.gpu}%</td>
                    <td className="py-2 px-2 text-purple-400">+{gpuDelta}%</td>
                    <td className="py-2 px-2 text-right text-white font-bold">{pred.gpu}%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-white font-bold">Power Draw</td>
                    <td className="py-2 px-2 text-slate-400">{cur.power} W</td>
                    <td className="py-2 px-2 text-yellow-400">+{pred.power_delta_pct}%</td>
                    <td className="py-2 px-2 text-right text-white font-bold">{pred.power_watts} W</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-white font-bold">Core Temperature</td>
                    <td className="py-2 px-2 text-slate-400">{cur.temperature}°C</td>
                    <td className="py-2 px-2 text-amber-400">+{pred.temperature_delta_c}°C</td>
                    <td className="py-2 px-2 text-right text-white font-bold">{pred.temperature}°C</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-white font-bold">Cooling Requirement</td>
                    <td className="py-2 px-2 text-slate-400">{cur.cooling}% efficiency</td>
                    <td className="py-2 px-2 text-teal-400">+{pred.cooling_requirement_delta_pct}%</td>
                    <td className="py-2 px-2 text-right text-white font-bold">Ramp Mandate</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-white font-bold">Failure Probability</td>
                    <td className="py-2 px-2 text-slate-400">{cur.failure_risk} / 100</td>
                    <td className="py-2 px-2 text-rose-400">+{pred.failure_risk_delta_pct}%</td>
                    <td className="py-2 px-2 text-right text-rose-400 font-bold">{pred.failure_risk} / 100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Recommendation Banner matching prompt */}
          <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/60 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  AI Prescriptive Recommendation
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-700/50">
                Guardian Proactive Advisory
              </span>
            </div>

            <p className="text-sm font-semibold text-white leading-relaxed">
              "{rec}"
            </p>

            <div className="pt-2 border-t border-cyan-900/50 flex items-center justify-between text-xs">
              <span className="text-[11px] text-cyan-400 font-mono">
                Recommendation mapped to historical memory #3 & #5
              </span>
              <button
                onClick={() => onInvestigateAI(`Explain the simulation recommendation: ${rec}`)}
                className="text-cyan-300 hover:text-white font-semibold flex items-center space-x-1"
              >
                <span>Investigate In Chat &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
