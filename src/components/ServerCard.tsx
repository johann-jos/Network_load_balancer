'use client';

import React from 'react';
import { Server } from '../types/simulation';
import { useSimulation } from '../context/SimulationContext';
import { Power, Activity, HardDrive, Clock, Scale, Cpu } from 'lucide-react';

interface ServerCardProps {
  server: Server;
}

export const ServerCard: React.FC<ServerCardProps> = ({ server }) => {
  const { toggleServerStatus, updateServerWeight } = useSimulation();

  const isOnline = server.status === 'ONLINE';

  return (
    <div
      className={`glass-panel border rounded-2xl p-4 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between ${
        isOnline
          ? 'border-slate-800/90 hover:border-cyan-500/30'
          : 'border-red-900/60 bg-red-950/20'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isOnline
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40 glow-border-cyan'
                  : 'bg-red-950/60 text-red-400 border-red-800/40'
              }`}
            >
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-mono">{server.name}</h3>
              <p className="text-[11px] font-mono text-slate-400">
                {server.ip}:{server.port}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border flex items-center space-x-1.5 font-mono ${
              isOnline
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60 glow-text-emerald'
                : 'bg-red-950/80 text-red-400 border-red-700/60'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span>{server.status}</span>
          </span>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[10px] uppercase tracking-wider font-mono flex items-center space-x-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>Active Conns</span>
            </div>
            <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
              {server.activeConnections}
            </div>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[10px] uppercase tracking-wider font-mono">Requests Served</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {server.totalRequestsHandled}
              {server.failedRequests > 0 && (
                <span className="text-xs text-red-400 font-normal ml-1">({server.failedRequests} err)</span>
              )}
            </div>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[10px] uppercase tracking-wider font-mono flex items-center justify-between">
              <span>CPU Load</span>
              <span className="text-slate-200 font-bold">{isOnline ? `${server.cpuLoad}%` : '0%'}</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full mt-1.5 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  server.cpuLoad > 85 ? 'bg-red-500' : server.cpuLoad > 50 ? 'bg-amber-500' : 'bg-emerald-400'
                }`}
                style={{ width: isOnline ? `${server.cpuLoad}%` : '0%' }}
              />
            </div>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
            <div className="text-slate-400 text-[10px] uppercase tracking-wider font-mono flex items-center space-x-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Response Latency</span>
            </div>
            <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">
              {isOnline ? `${server.responseTimeMs} ms` : 'N/A'}
            </div>
          </div>
        </div>

        {/* WRR Weight Slider */}
        <div className="mt-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 text-[11px] flex items-center space-x-1 font-mono">
              <Scale className="w-3 h-3 text-purple-400" />
              <span>WRR Configured Weight:</span>
            </span>
            <span className="font-bold font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/50">
              {server.weight}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={server.weight}
            onChange={(e) => updateServerWeight(server.id, parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>

      {/* Action Button: Stop / Recover Server */}
      <div className="mt-3.5 pt-2 border-t border-slate-800/80">
        <button
          onClick={() => toggleServerStatus(server.id)}
          className={`w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold font-mono transition-all shadow-md ${
            isOnline
              ? 'bg-red-950/70 hover:bg-red-900/90 text-red-300 border border-red-800/60 hover:shadow-red-950/50'
              : 'bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800/60 hover:shadow-emerald-950/50'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isOnline ? 'STOP SERVER (Offline)' : 'RECOVER SERVER (Online)'}</span>
        </button>
      </div>
    </div>
  );
};
