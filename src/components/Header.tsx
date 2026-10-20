'use client';

import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Play, RotateCcw, Activity, Cpu, Radio, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    servers,
    requestHistory,
    activeRequests,
    demoState,
    startDemoMode,
    resetSimulation,
    isContinuousTraffic,
  } = useSimulation();

  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toTimeString().split(' ')[0]);
    }, 1000);
    setTimeStr(new Date().toTimeString().split(' ')[0]);
    return () => clearInterval(timer);
  }, []);

  const totalRequests = requestHistory.length + activeRequests.length;
  const onlineCount = servers.filter((s) => s.status === 'ONLINE').length;
  const totalSuccess = requestHistory.filter((r) => r.status === 'COMPLETED').length;
  const totalFailed = requestHistory.filter((r) => r.status === 'FAILED').length;

  return (
    <header className="glass-panel border-b border-slate-800/80 px-6 py-3.5 sticky top-0 z-40 backdrop-blur-xl shadow-2xl">
      <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title and Logo Badge */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
            <div className="relative p-2.5 bg-slate-950 rounded-xl text-cyan-400 border border-slate-800">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg font-extrabold tracking-tight text-white font-mono bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                NETWORK LOAD BALANCER & SERVER SELECTION SIMULATOR
              </h1>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 glow-text-cyan">
                L4/L7 NOC V3.0
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
              <span>Computer Networks Project &bull; Algorithmic Server Routing &amp; Failover Simulation</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-cyan-400 font-mono text-[11px]">{timeStr} UTC</span>
            </p>
          </div>
        </div>

        {/* Live Status Summary Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Cluster Health Pill */}
          <div className="flex items-center space-x-2 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
            <Radio className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Cluster Status:</span>
            <span className="flex items-center font-semibold font-mono">
              <span
                className={`w-2 h-2 rounded-full mr-1.5 shadow-sm ${
                  onlineCount === 3
                    ? 'bg-emerald-400 shadow-emerald-500/50 animate-pulse'
                    : onlineCount > 0
                    ? 'bg-amber-400 shadow-amber-500/50 animate-pulse'
                    : 'bg-red-500 shadow-red-500/50'
                }`}
              />
              <span className={onlineCount === 3 ? 'text-emerald-400' : 'text-amber-400'}>
                {onlineCount}/3 Online
              </span>
            </span>
          </div>

          {/* Traffic Pill */}
          <div className="flex items-center space-x-2 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Total Requests:</span>
            <span className="font-mono text-white font-bold">{totalRequests}</span>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400 font-mono font-medium">{totalSuccess} OK</span>
            {totalFailed > 0 && <span className="text-red-400 font-mono font-medium">{totalFailed} ERR</span>}
          </div>

          {/* Action Buttons */}
          <button
            onClick={startDemoMode}
            disabled={demoState.active}
            className={`relative group overflow-hidden flex items-center space-x-2 px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
              demoState.active
                ? 'bg-purple-950/60 text-purple-400 border border-purple-800/60 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-purple-950/50 border border-purple-400/30 hover:scale-[1.02]'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="font-mono tracking-wide">
              {demoState.active ? 'DEMO RUNNING...' : 'PRESENTATION DEMO MODE'}
            </span>
          </button>

          <button
            onClick={resetSimulation}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>RESET</span>
          </button>
        </div>
      </div>
    </header>
  );
};
