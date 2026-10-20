'use client';

import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { Activity, CheckCircle, AlertTriangle, Clock, Zap, BarChart3, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-cyan-500/40 p-3 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs text-white">
        <p className="text-cyan-400 font-bold border-b border-slate-800 pb-1 mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between space-x-4 my-1">
            <span style={{ color: entry.color }} className="font-semibold">{entry.name}:</span>
            <span className="font-bold text-slate-100">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const MetricsDashboard: React.FC = () => {
  const { servers, requestHistory, activeRequests, isContinuousTraffic, trafficRateRps, timeSeriesData } =
    useSimulation();

  const totalRequests = requestHistory.length + activeRequests.length;
  const successfulRequests = requestHistory.filter((r) => r.status === 'COMPLETED').length;
  const failedRequests = requestHistory.filter((r) => r.status === 'FAILED').length;
  const activeConnectionsCount = servers.reduce((acc, curr) => acc + curr.activeConnections, 0);

  const completedRequests = requestHistory.filter((r) => r.status === 'COMPLETED');
  const avgResponseTime =
    completedRequests.length > 0
      ? Math.round(completedRequests.reduce((acc, r) => acc + r.responseTimeMs, 0) / completedRequests.length)
      : 0;

  // Distribution chart data
  const distributionData = servers.map((s) => ({
    name: s.name,
    requests: s.totalRequestsHandled,
    status: s.status,
  }));

  // Success vs Failure data
  const statusData = [
    { name: 'Successful (200 OK)', value: successfulRequests, color: '#10b981' },
    { name: 'Failed (503 Service Unavailable)', value: failedRequests, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const BAR_COLORS = ['#06b6d4', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Top Summary Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-4 shadow-xl glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase font-semibold text-[11px]">Total Requests</span>
            <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white mt-2">{totalRequests}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Simulated Datagrams</div>
        </div>

        <div className="glass-panel border border-slate-800/80 rounded-2xl p-4 shadow-xl glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase font-semibold text-[11px]">Successful</span>
            <div className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-2">{successfulRequests}</div>
          <div className="text-[10px] text-emerald-400/80 font-mono mt-1">HTTP 200 OK</div>
        </div>

        <div className="glass-panel border border-slate-800/80 rounded-2xl p-4 shadow-xl glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase font-semibold text-[11px]">Failed</span>
            <div className="p-1.5 rounded-lg bg-red-950/60 text-red-400 border border-red-800/40">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-red-400 mt-2">{failedRequests}</div>
          <div className="text-[10px] text-red-400/80 font-mono mt-1">HTTP 503 Service Unavail</div>
        </div>

        <div className="glass-panel border border-slate-800/80 rounded-2xl p-4 shadow-xl glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase font-semibold text-[11px]">Active Conns</span>
            <div className="p-1.5 rounded-lg bg-purple-950/60 text-purple-400 border border-purple-800/40">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple-300 mt-2">{activeConnectionsCount}</div>
          <div className="text-[10px] text-purple-400/80 font-mono mt-1">Open Sockets</div>
        </div>

        <div className="glass-panel border border-slate-800/80 rounded-2xl p-4 shadow-xl glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase font-semibold text-[11px]">Avg Latency</span>
            <div className="p-1.5 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/40">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-300 mt-2">{avgResponseTime} ms</div>
          <div className="text-[10px] text-amber-400/80 font-mono mt-1">Round Trip Time</div>
        </div>

        <div className="glass-panel border border-slate-800/80 rounded-2xl p-4 shadow-xl glass-panel-hover">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase font-semibold text-[11px]">Current Rate</span>
            <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white mt-2">
            {isContinuousTraffic ? `${trafficRateRps} rps` : '0 rps'}
          </div>
          <div className="text-[10px] text-cyan-400/80 font-mono mt-1">Throughput Rate</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Request Distribution */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>1. Request Distribution Per Server Node</span>
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="requests" radius={[8, 8, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.status === 'OFFLINE' ? '#ef4444' : BAR_COLORS[index % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Server CPU Load Over Time */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>2. Real-Time Server CPU Load Curves (%)</span>
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Fira Code' }} />
                <Line type="monotone" dataKey="Server 1 Load" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Server 2 Load" stroke="#10b981" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Server 3 Load" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Response Time Latency */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>3. Cluster Response Latency Timeline (ms)</span>
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="avgResponseTime"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#latencyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Request Outcome */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span>4. Request Outcome Ratio (Success vs Failure)</span>
            </h3>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Fira Code' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 font-mono text-xs">No traffic generated yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
