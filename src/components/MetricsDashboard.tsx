'use client';

import React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { Activity, BarChart3, Clock3, Gauge, Layers3, Radio, ShieldAlert, Timer } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

const tooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-[#8ee8ff]/25 bg-[#071019]/95 p-3 font-mono text-[10px] shadow-2xl">
      <div className="mb-2 text-[#8ee8ff]">{label}</div>
      {payload.map((entry, index) => <div key={`${entry.name ?? 'value'}-${index}`} className="flex justify-between gap-6 py-0.5"><span style={{ color: entry.color ?? '#8ee8ff' }}>{entry.name ?? 'value'}</span><span className="text-[#e8f1f5]">{String(entry.value ?? '—')}</span></div>)}
    </div>
  );
};

const MetricTile = ({ icon: Icon, label, value, note, tone }: { icon: React.ElementType; label: string; value: string | number; note: string; tone: string }) => (
  <div className="border border-[#b1ddea]/12 bg-[#0a151e] p-4">
    <div className="flex items-start justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#69848f]">{label}</span>
      <Icon className="h-4 w-4" style={{ color: tone }} />
    </div>
    <div className="mt-3 font-mono text-2xl tracking-[-0.05em]" style={{ color: tone }}>{value}</div>
    <div className="mt-1 text-[10px] text-[#68828d]">{note}</div>
  </div>
);

export const MetricsDashboard: React.FC = () => {
  const { servers, requestHistory, timeSeriesData, isContinuousTraffic, trafficRateRps, tcpMetrics } = useSimulation();
  const completed = requestHistory.filter((request) => request.status === 'COMPLETED');
  const failed = requestHistory.filter((request) => request.status !== 'COMPLETED');
  const averageLatency = completed.length ? Math.round(completed.reduce((sum, request) => sum + request.responseTimeMs, 0) / completed.length) : 0;
  const distribution = servers.map((server) => ({ name: server.name, connections: server.totalConnectionsHandled, status: server.status }));
  const outcomes = [
    { name: 'closed', value: completed.length, color: '#73e2ad' },
    { name: 'refused / reset', value: failed.length, color: '#ff7d79' },
  ].filter((item) => item.value > 0);

  return (
    <section id="metrics" className="space-y-4" aria-labelledby="telemetry-title">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8ee8ff]"><Activity className="h-3.5 w-3.5" />
            Results from the connections
          </div>
          <h2 id="telemetry-title" className="mt-2 font-headline text-2xl tracking-[-0.05em] text-[#e8f1f5]">See what the connections changed.</h2>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.13em] text-[#6b8792]">last {timeSeriesData.length} seconds sampled</div>
      </div>

      <div className="grid grid-cols-2 gap-px border border-[#b1ddea]/12 bg-[#b1ddea]/12 md:grid-cols-4 xl:grid-cols-8">
        <MetricTile icon={Layers3} label="total connections" value={tcpMetrics.totalConnections} note="created in this run" tone="#8ee8ff" />
        <MetricTile icon={Radio} label="active connections" value={tcpMetrics.activeConnections} note="currently open" tone="#73e2ad" />
        <MetricTile icon={ShieldAlert} label="being set up" value={tcpMetrics.synBacklog} note="SYN handshake in progress" tone="#f5c76f" />
        <MetricTile icon={Timer} label="waiting to close" value={tcpMetrics.timeWaitConnections} note="short TCP safety wait" tone="#f5c76f" />
        <MetricTile icon={Clock3} label="setup time" value={`${tcpMetrics.averageHandshakeMs}ms`} note="SYN to ACK average" tone="#8ee8ff" />
        <MetricTile icon={Gauge} label="simulated delay" value={`${averageLatency}ms`} note="teaching value, not real RTT" tone="#73e2ad" />
        <MetricTile icon={BarChart3} label="finished / sec" value={`${tcpMetrics.observedRps}/s`} note="recently closed" tone="#8ee8ff" />
        <MetricTile icon={Activity} label="new / sec" value={isContinuousTraffic ? `${trafficRateRps}/s` : 'idle'} note="continuous connection rate" tone="#b4c8cf" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="lab-panel min-h-[300px] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between border-b border-[#b1ddea]/12 pb-3">
            <div><h3 className="font-headline text-base text-[#e8f1f5]">How many connections did each server receive?</h3><p className="mt-1 text-[10px] text-[#6e8994]">Connections routed to each server</p></div>
            <BarChart3 className="h-4 w-4 text-[#8ee8ff]" />
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="#1a3440" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="name" stroke="#78929d" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#78929d" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={tooltip} />
                <Bar dataKey="connections" radius={[2, 2, 0, 0]}>
                  {distribution.map((entry) => <Cell key={entry.name} fill={entry.status === 'OFFLINE' ? '#ff7d79' : entry.status === 'DRAINING' ? '#f5c76f' : '#8ee8ff'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lab-panel min-h-[300px] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between border-b border-[#b1ddea]/12 pb-3">
            <div><h3 className="font-headline text-base text-[#e8f1f5]">Connections during setup and close</h3><p className="mt-1 text-[10px] text-[#6e8994]">Active connections, setup requests, and safety waits</p></div>
            <Radio className="h-4 w-4 text-[#73e2ad]" />
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="#1a3440" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#78929d" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#78929d" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={tooltip} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#78929d' }} />
                <Line type="monotone" dataKey="activeConnections" name="active" stroke="#73e2ad" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="synBacklog" name="SYN backlog" stroke="#8ee8ff" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="timeWaitConnections" name="TIME-WAIT" stroke="#f5c76f" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lab-panel min-h-[300px] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between border-b border-[#b1ddea]/12 pb-3">
            <div><h3 className="font-headline text-base text-[#e8f1f5]">Simulated server load</h3><p className="mt-1 text-[10px] text-[#6e8994]">This teaching value rises as active connections rise</p></div>
            <Gauge className="h-4 w-4 text-[#f5c76f]" />
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="#1a3440" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#78929d" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#78929d" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={tooltip} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#78929d' }} />
                {servers.map((server, index) => <Line key={server.id} type="monotone" dataKey={`${server.name} CPU`} name={server.name} stroke={['#8ee8ff', '#73e2ad', '#f5c76f'][index]} strokeWidth={2} dot={false} />)}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lab-panel min-h-[300px] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between border-b border-[#b1ddea]/12 pb-3">
            <div><h3 className="font-headline text-base text-[#e8f1f5]">How connections ended</h3><p className="mt-1 text-[10px] text-[#6e8994]">Connection results, not web-page status codes</p></div>
            <ShieldAlert className="h-4 w-4 text-[#ff7d79]" />
          </div>
          <div className="flex h-56 items-center justify-center">
            {outcomes.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={outcomes} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={4}>
                    {outcomes.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={tooltip} />
                  <Legend wrapperStyle={{ fontSize: 10, color: '#78929d' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="text-center font-mono text-xs text-[#66818d]">No finished connections yet.<br /><span className="text-[#8ee8ff]">Create one connection to populate the results.</span></div>}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-l-2 border-[#8ee8ff]/50 bg-[#091722] px-4 py-3 text-[10px] leading-5 text-[#78929d]">
        <span><strong className="text-[#dbe9ee]">Reading the chart:</strong> active connections are connections open at the same time, not packets per second.</span>
        <span><strong className="text-[#dbe9ee]">Waiting to close:</strong> a short safety period after a normal TCP close.</span>
      </div>
    </section>
  );
};
