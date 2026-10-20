'use client';

import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { NetworkRequest, LogEntry } from '../types/simulation';
import { Terminal, List, Trash2, Eye, X, Network, Server, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';

export const EventLogPanel: React.FC = () => {
  const { eventLogs, requestHistory, clearLogs, selectedRequest, setSelectedRequest } = useSimulation();
  const [activeTab, setActiveTab] = useState<'EVENTS' | 'REQUESTS'>('EVENTS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = eventLogs.filter((log) =>
    log.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = requestHistory.filter(
    (req) =>
      req.requestId.toString().includes(searchTerm) ||
      req.clientIp.includes(searchTerm) ||
      (req.selectedServerIp && req.selectedServerIp.includes(searchTerm))
  );

  return (
    <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 shadow-2xl flex flex-col h-full">
      {/* Header with Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-3 mb-3 gap-2">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-cyan-950/80 border border-cyan-500/40 rounded-lg text-cyan-400">
            <Terminal className="w-4 h-4" />
          </div>

          <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('EVENTS')}
              className={`px-3 py-1 rounded-lg font-bold font-mono transition-all ${
                activeTab === 'EVENTS'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              System Events ({eventLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('REQUESTS')}
              className={`px-3 py-1 rounded-lg font-bold font-mono transition-all ${
                activeTab === 'REQUESTS'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Datagram Log ({requestHistory.length})
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-36 md:w-48 font-mono"
          />
          <button
            onClick={clearLogs}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors border border-slate-800"
            title="Clear Log"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log Terminal Window */}
      <div className="flex-1 bg-slate-950/95 rounded-xl border border-slate-800/90 overflow-y-auto max-h-[340px] font-mono text-xs p-3.5 space-y-1.5 shadow-inner">
        {activeTab === 'EVENTS' ? (
          filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-2 leading-relaxed border-b border-slate-900/60 pb-1">
                <span className="text-slate-600 select-none text-[11px]">[{log.timestamp}]</span>
                <span
                  className={
                    log.type === 'ERROR'
                      ? 'text-red-400 font-bold glow-text-cyan'
                      : log.type === 'WARNING'
                      ? 'text-amber-400 font-semibold'
                      : log.type === 'SUCCESS'
                      ? 'text-emerald-400 font-semibold'
                      : 'text-cyan-300'
                  }
                >
                  {log.message}
                </span>
              </div>
            ))
          ) : (
            <div className="text-slate-500 text-center py-8">No system event logs recorded.</div>
          )
        ) : filteredRequests.length > 0 ? (
          <div className="space-y-1.5">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer transition-all hover:border-cyan-500/40"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-bold">#{req.requestId}</span>
                  <span className="text-purple-300 font-bold px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800/50 text-[10px]">
                    {req.protocol}
                  </span>
                  <span className="text-cyan-300">{req.clientIp}:{req.sourcePort}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-emerald-400 font-bold">{req.selectedServerIp || 'None'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-amber-300 font-bold">{req.responseTimeMs} ms</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.status === 'COMPLETED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                        : 'bg-red-950 text-red-400 border border-red-800/50'
                    }`}
                  >
                    {req.status}
                  </span>
                  <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-center py-8">No datagram logs generated yet.</div>
        )}
      </div>

      {/* Detailed Request Modal Inspector */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Datagram Inspector #{selectedRequest.requestId}
                  </h3>
                  <p className="text-xs text-slate-400">Layer 4 / Layer 7 Packet Details</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800 pb-1">
                  1. Source Socket Header
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Client Source IP:</span>
                  <span className="text-cyan-300 font-bold">{selectedRequest.clientIp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ephemeral Source Port:</span>
                  <span className="text-white">{selectedRequest.sourcePort}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800 pb-1">
                  2. Load Balancer VIP Target
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VIP Destination IP:</span>
                  <span className="text-cyan-300 font-bold">{selectedRequest.destinationIp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target VIP Port:</span>
                  <span className="text-white">{selectedRequest.destinationPort} (HTTPS)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transport Protocol:</span>
                  <span className="text-purple-300 font-bold">{selectedRequest.protocol}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800 pb-1">
                  3. Assigned Backend Socket
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Selected Server Node:</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedRequest.selectedServerIp || 'None (503 Service Unavailable)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Execution Status:</span>
                  <span
                    className={
                      selectedRequest.status === 'COMPLETED' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'
                    }
                  >
                    {selectedRequest.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Round Trip Latency:</span>
                  <span className="text-amber-300 font-bold">{selectedRequest.responseTimeMs} ms</span>
                </div>
                {selectedRequest.failureReason && (
                  <div className="text-red-400 pt-1 border-t border-slate-800">
                    Reason: {selectedRequest.failureReason}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedRequest(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold font-mono transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
