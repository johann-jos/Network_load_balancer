'use client';

import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { BookOpen, RefreshCw, Layers, Scale } from 'lucide-react';

export const AlgorithmExplanation: React.FC = () => {
  const { algorithm } = useSimulation();

  return (
    <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center space-x-2.5 border-b border-slate-800/80 pb-3">
        <div className="p-1.5 bg-cyan-950/80 border border-cyan-500/40 rounded-lg text-cyan-400">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Load Balancing Algorithms Theory & Logic
          </h2>
          <p className="text-[11px] text-slate-400">Algorithmic Routing Principles & Viva Reference</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Round Robin */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            algorithm === 'ROUND_ROBIN'
              ? 'bg-cyan-950/40 border-cyan-500 shadow-xl shadow-cyan-950/50 glow-border-cyan'
              : 'bg-slate-900/60 border-slate-800 opacity-85'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-mono font-bold text-xs">
              <RefreshCw className="w-4 h-4" />
              <span>1. Round Robin (RR)</span>
            </div>
            {algorithm === 'ROUND_ROBIN' && (
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500 text-slate-950 uppercase">
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Distributes incoming client requests sequentially in a cyclic loop among all available online backend servers.
          </p>
          <div className="mt-3 bg-slate-950 p-2.5 rounded-xl text-[11px] font-mono text-cyan-300 border border-slate-800">
            Formula: Target = Servers[(Index + 1) % ActiveCount]
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Best when backend servers have identical compute hardware and processing capacities.
          </p>
        </div>

        {/* Least Connections */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            algorithm === 'LEAST_CONNECTIONS'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-950/50 glow-border-cyan'
              : 'bg-slate-900/60 border-slate-800 opacity-85'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-mono font-bold text-xs">
              <Layers className="w-4 h-4" />
              <span>2. Least Connections (LC)</span>
            </div>
            {algorithm === 'LEAST_CONNECTIONS' && (
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950 uppercase">
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Assigns each new request to the online server currently serving the fewest active open TCP/UDP connections.
          </p>
          <div className="mt-3 bg-slate-950 p-2.5 rounded-xl text-[11px] font-mono text-emerald-300 border border-slate-800">
            Selection: min(ActiveConnections(Server_i))
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Ideal for long-lived sessions (e.g., database queries, WebSocket connections, video streams).
          </p>
        </div>

        {/* Weighted Round Robin */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            algorithm === 'WEIGHTED_ROUND_ROBIN'
              ? 'bg-purple-950/40 border-purple-500 shadow-xl shadow-purple-950/50 glow-border-purple'
              : 'bg-slate-900/60 border-slate-800 opacity-85'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-purple-400 font-mono font-bold text-xs">
              <Scale className="w-4 h-4" />
              <span>3. Weighted Round Robin (WRR)</span>
            </div>
            {algorithm === 'WEIGHTED_ROUND_ROBIN' && (
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500 text-white uppercase">
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Distributes requests in proportion to configured numerical weights assigned to each backend server node.
          </p>
          <div className="mt-3 bg-slate-950 p-2.5 rounded-xl text-[11px] font-mono text-purple-300 border border-slate-800">
            Ratio: Traffic_i ∝ Weight_i / Σ Weights
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Essential for heterogeneous clusters where servers possess different CPU, RAM, or network capacities.
          </p>
        </div>
      </div>
    </div>
  );
};
