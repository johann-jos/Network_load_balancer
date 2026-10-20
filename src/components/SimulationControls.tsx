'use client';

import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { AlgorithmType, ProtocolType } from '../types/simulation';
import { Send, Zap, Play, Square, Settings2, Sliders, ShieldCheck } from 'lucide-react';

export const SimulationControls: React.FC = () => {
  const {
    algorithm,
    protocol,
    setAlgorithm,
    setProtocol,
    sendSingleRequest,
    sendBatchRequests,
    isContinuousTraffic,
    trafficRateRps,
    setTrafficRate,
    startContinuousTraffic,
    stopContinuousTraffic,
  } = useSimulation();

  return (
    <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2.5 border-b border-slate-800/80 pb-3">
        <div className="p-1.5 bg-cyan-950/80 border border-cyan-500/40 rounded-lg text-cyan-400">
          <Settings2 className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Control Center
          </h2>
          <p className="text-[11px] text-slate-400">Traffic Generation & Routing Policies</p>
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-widest block font-mono">
          1. Load Balancing Algorithm
        </label>
        <div className="grid grid-cols-1 gap-2">
          {[
            {
              id: 'ROUND_ROBIN' as AlgorithmType,
              name: 'Round Robin (RR)',
              desc: 'Sequential cyclic request distribution',
              color: 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300',
            },
            {
              id: 'LEAST_CONNECTIONS' as AlgorithmType,
              name: 'Least Connections (LC)',
              desc: 'Dynamic routing to server with lowest conns',
              color: 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300',
            },
            {
              id: 'WEIGHTED_ROUND_ROBIN' as AlgorithmType,
              name: 'Weighted Round Robin (WRR)',
              desc: 'Proportional routing based on server weights',
              color: 'border-purple-500/60 bg-purple-950/30 text-purple-300',
            },
          ].map((algo) => {
            const isSelected = algorithm === algo.id;
            return (
              <button
                key={algo.id}
                onClick={() => setAlgorithm(algo.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all relative ${
                  isSelected
                    ? `${algo.color} shadow-lg shadow-black/40`
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs font-mono">{algo.name}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{algo.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Protocol Selection */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-widest block font-mono">
          2. Transport Protocol
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'TCP' as ProtocolType, label: 'TCP', sub: 'Connection-Oriented' },
            { id: 'UDP' as ProtocolType, label: 'UDP', sub: 'Connectionless' },
          ].map((proto) => {
            const isSelected = protocol === proto.id;
            return (
              <button
                key={proto.id}
                onClick={() => setProtocol(proto.id)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-purple-950/50 border-purple-500 text-purple-300 font-bold shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold font-mono">{proto.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{proto.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Request Dispatcher */}
      <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-widest block font-mono">
          3. Manual Datagram Dispatcher
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => sendSingleRequest()}
            className="flex items-center justify-center space-x-1.5 p-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-xs font-bold transition-all font-mono"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send 1 Req</span>
          </button>

          <button
            onClick={() => sendBatchRequests(10)}
            className="flex items-center justify-center space-x-1.5 p-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-xs font-bold transition-all font-mono"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Send 10 Req</span>
          </button>

          <button
            onClick={() => sendBatchRequests(50)}
            className="flex items-center justify-center space-x-1.5 p-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-xs font-bold transition-all font-mono"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Send 50 Req</span>
          </button>

          <button
            onClick={() => sendBatchRequests(100)}
            className="flex items-center justify-center space-x-1.5 p-2.5 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 text-cyan-300 border border-cyan-500/50 rounded-xl text-xs font-bold transition-all shadow-md font-mono"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Send 100 Req</span>
          </button>
        </div>
      </div>

      {/* Continuous Traffic Generator */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-widest block font-mono">
            4. Continuous Workload Engine
          </label>
          {isContinuousTraffic && (
            <span className="text-[10px] font-mono text-emerald-400 animate-pulse flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>LIVE TRAFFIC</span>
            </span>
          )}
        </div>

        {/* Rate selection chips */}
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 5, 10, 20].map((rate) => (
            <button
              key={rate}
              onClick={() => setTrafficRate(rate)}
              className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                trafficRateRps === rate
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {rate} rps
            </button>
          ))}
        </div>

        {/* Start / Stop Toggle Button */}
        {isContinuousTraffic ? (
          <button
            onClick={stopContinuousTraffic}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-red-950/60 font-mono"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>STOP TRAFFIC GENERATOR</span>
          </button>
        ) : (
          <button
            onClick={() => startContinuousTraffic(trafficRateRps)}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-950/60 font-mono"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START TRAFFIC ({trafficRateRps} RPS)</span>
          </button>
        )}
      </div>
    </div>
  );
};
