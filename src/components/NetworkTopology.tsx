'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CircleDot, Network, Radio, Server as ServerIcon, ShieldCheck } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { NetworkRequest, Server } from '../types/simulation';

type Point = { x: number; y: number };

const clientPoints: Record<string, Point> = {
  'client-1': { x: 115, y: 82 },
  'client-2': { x: 115, y: 235 },
  'client-3': { x: 115, y: 388 },
};

const serverPoints: Record<string, Point> = {
  'server-1': { x: 882, y: 82 },
  'server-2': { x: 882, y: 235 },
  'server-3': { x: 882, y: 388 },
};

const loadBalancerPoint = { x: 500, y: 235 };

const routePath = (from: Point, to: Point) => `M ${from.x + 52} ${from.y} C ${from.x + 210} ${from.y}, ${to.x - 215} ${to.y}, ${to.x - 58} ${to.y}`;

const packetPoint = (request: NetworkRequest, clientPoint: Point, targetPoint: Point): Point => {
  switch (request.phase) {
    case 'SYN_SENT':
      return clientPoint;
    case 'ROUTING':
    case 'ACK':
      return loadBalancerPoint;
    case 'SYN_ACK':
    case 'ESTABLISHED':
    case 'FIN_WAIT':
    case 'TIME_WAIT':
      return targetPoint;
    default:
      return loadBalancerPoint;
  }
};

const serverTone = (server: Server) => {
  if (server.status === 'OFFLINE') return { stroke: '#ff7d79', fill: '#261519', text: '#ffaaa0' };
  if (server.status === 'DRAINING') return { stroke: '#f5c76f', fill: '#282116', text: '#f5c76f' };
  return { stroke: '#73e2ad', fill: '#0c2421', text: '#9bf0c4' };
};

export const NetworkTopology: React.FC = () => {
  const { servers, clients, algorithm, activeRequests, featuredRequest } = useSimulation();
  const reduceMotion = useReducedMotion();
  const targetIds = useMemo(() => new Set(activeRequests.map((request) => request.selectedServerId).filter(Boolean)), [activeRequests]);
  const featuredTarget = featuredRequest?.selectedServerId;
  const featuredClient = clients.find((client) => client.ip === featuredRequest?.clientIp);

  return (
    <section className="lab-panel scanline relative overflow-hidden p-4 sm:p-6" aria-labelledby="topology-title">
      <div className="technical-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative z-[1] flex flex-col gap-4 border-b border-[#b1ddea]/15 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8ee8ff]">
            <Network className="h-3.5 w-3.5" />
            How a connection travels
          </div>
          <h2 id="topology-title" className="mt-2 font-headline text-2xl tracking-[-0.05em] text-[#e8f1f5] sm:text-3xl">Client → load balancer → one server</h2>
          <p className="mt-2 max-w-xl text-xs leading-5 text-[#849da8]">The client uses one shared address. The load balancer chooses one online server and keeps this connection with it.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#6f8994]">
          <span className="flex items-center gap-2 border border-[#73e2ad]/20 bg-[#0a201c] px-2.5 py-1.5 text-[#73e2ad]">
            <Radio className="h-3 w-3" /> TCP connections
          </span>
          <span className="border border-[#8ee8ff]/20 bg-[#091722] px-2.5 py-1.5 text-[#8ee8ff]">{activeRequests.length} starting / active</span>
        </div>
      </div>

      <div className="relative z-[1] mt-4 overflow-hidden border border-[#b1ddea]/12 bg-[#050c12]">
        <svg viewBox="0 0 1000 470" className="h-auto min-h-[360px] w-full" role="img" aria-labelledby="topology-svg-title topology-svg-desc">
          <title id="topology-svg-title">TCP client to virtual IP to backend server topology</title>
          <desc id="topology-svg-desc">Three clients connect to a shared load-balancer address. The load balancer chooses one online server while animated TCP messages show the connection step.</desc>
          <defs>
            <filter id="soft-cyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="soft-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="client-route" x1="0" x2="1">
              <stop offset="0" stopColor="#1e9ab8" stopOpacity="0.2" />
              <stop offset="1" stopColor="#8ee8ff" stopOpacity="0.72" />
            </linearGradient>
            <linearGradient id="server-route" x1="0" x2="1">
              <stop offset="0" stopColor="#8ee8ff" stopOpacity="0.7" />
              <stop offset="1" stopColor="#73e2ad" stopOpacity="0.72" />
            </linearGradient>
          </defs>

          <text x="26" y="28" fill="#597480" fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="2">CLIENTS / SOURCE ADDRESS</text>
          <text x="780" y="28" fill="#597480" fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="2">SERVERS / PORT :8080</text>

          {clients.map((client) => {
            const point = clientPoints[client.id];
            return (
              <g key={`client-link-${client.id}`}>
                <path d={routePath(point, loadBalancerPoint)} fill="none" stroke="#0d222c" strokeWidth="7" />
                <path d={routePath(point, loadBalancerPoint)} fill="none" stroke="url(#client-route)" strokeWidth="1.5" className="route-line-slow" />
              </g>
            );
          })}

          {servers.map((server) => {
            const point = serverPoints[server.id];
            const tone = serverTone(server);
            const isTargeted = targetIds.has(server.id) || featuredTarget === server.id;
            return (
              <g key={`server-link-${server.id}`}>
                <path d={routePath(loadBalancerPoint, point)} fill="none" stroke="#0d222c" strokeWidth="8" />
                <path d={routePath(loadBalancerPoint, point)} fill="none" stroke={server.status === 'ONLINE' ? 'url(#server-route)' : tone.stroke} strokeWidth={isTargeted ? 2.5 : 1.2} strokeOpacity={isTargeted ? 0.95 : 0.35} strokeDasharray={server.status === 'ONLINE' ? undefined : '5 7'} className={server.status === 'ONLINE' ? 'route-line' : ''} />
              </g>
            );
          })}

          {activeRequests.map((request) => {
            const client = clients.find((item) => item.ip === request.clientIp) ?? clients[0];
            const target = servers.find((server) => server.id === request.selectedServerId) ?? servers[0];
            if (!client || !target) return null;
            const position = packetPoint(request, clientPoints[client.id], serverPoints[target.id]);
            const color = request.currentFlag === 'RST' ? '#ff7d79' : request.phase === 'ESTABLISHED' ? '#73e2ad' : '#8ee8ff';
            return (
              <g key={request.id}>
                <motion.circle
                  r={request === featuredRequest ? 8 : 5.5}
                  fill={color}
                  filter={request.phase === 'ESTABLISHED' ? 'url(#soft-green)' : 'url(#soft-cyan)'}
                  initial={{ cx: clientPoints[client.id].x, cy: clientPoints[client.id].y, opacity: 0 }}
                  animate={{ cx: position.x, cy: position.y, opacity: 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.48, ease: [0.16, 1, 0.3, 1] }}
                />
                {request === featuredRequest && (
                  <motion.circle cx={position.x} cy={position.y} r="15" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1" animate={reduceMotion ? undefined : { r: [13, 21, 13], opacity: [0.75, 0, 0.75] }} transition={{ duration: 1.8, repeat: Infinity }} />
                )}
              </g>
            );
          })}

          {clients.map((client) => {
            const point = clientPoints[client.id];
            return (
              <g key={client.id} transform={`translate(${point.x} ${point.y})`}>
                <rect x="-52" y="-31" width="104" height="62" fill="#0b1b25" stroke="#2c6476" strokeWidth="1.4" />
                <circle cx="-37" cy="-17" r="4" fill="#8ee8ff" />
                <text x="0" y="-8" textAnchor="middle" fill="#e8f1f5" fontSize="12" fontWeight="700" fontFamily="Space Grotesk, sans-serif">{client.name}</text>
                <text x="0" y="10" textAnchor="middle" fill="#72909c" fontSize="9" fontFamily="JetBrains Mono, monospace">{client.ip}</text>
                <text x="0" y="23" textAnchor="middle" fill="#4e6d78" fontSize="8" fontFamily="JetBrains Mono, monospace">{client.activeConnections} active</text>
              </g>
            );
          })}

          <g transform={`translate(${loadBalancerPoint.x} ${loadBalancerPoint.y})`}>
            <circle r="72" fill="#0c2a36" fillOpacity="0.2" stroke="#8ee8ff" strokeOpacity="0.22" strokeDasharray="2 9" />
            <rect x="-76" y="-51" width="152" height="102" fill="#0b202b" stroke="#8ee8ff" strokeWidth="2" filter="url(#soft-cyan)" />
            <text x="0" y="-25" textAnchor="middle" fill="#8ee8ff" fontSize="9" fontFamily="JetBrains Mono, monospace" letterSpacing="1.5">SHARED ADDRESS / VIP</text>
            <text x="0" y="1" textAnchor="middle" fill="#e8f1f5" fontSize="15" fontWeight="800" fontFamily="Space Grotesk, sans-serif">LOAD BALANCER</text>
            <text x="0" y="20" textAnchor="middle" fill="#7bb9c8" fontSize="10" fontFamily="JetBrains Mono, monospace">192.168.1.100:443</text>
            <rect x="-54" y="30" width="108" height="11" fill="#08131b" />
            <text x="0" y="38" textAnchor="middle" fill="#6b9aa8" fontSize="8" fontFamily="JetBrains Mono, monospace">{algorithm.replaceAll('_', ' ')}</text>
          </g>

          {servers.map((server) => {
            const point = serverPoints[server.id];
            const tone = serverTone(server);
            return (
              <g key={server.id} transform={`translate(${point.x} ${point.y})`}>
                <rect x="-65" y="-35" width="130" height="70" fill={tone.fill} stroke={tone.stroke} strokeWidth={featuredTarget === server.id ? 2.5 : 1.4} />
                <circle cx="-49" cy="-20" r="4.5" fill={tone.stroke} />
                <text x="6" y="-12" textAnchor="middle" fill="#e8f1f5" fontSize="12" fontWeight="700" fontFamily="Space Grotesk, sans-serif">{server.name}</text>
                <text x="0" y="6" textAnchor="middle" fill="#76909a" fontSize="9" fontFamily="JetBrains Mono, monospace">{server.ip}:8080</text>
                <text x="0" y="21" textAnchor="middle" fill={tone.text} fontSize="9" fontWeight="700" fontFamily="JetBrains Mono, monospace">{server.status === 'ONLINE' ? `${server.activeConnections} active · ${server.cpuLoad}%` : server.status === 'DRAINING' ? 'draining · no new' : 'offline · no new'}</text>
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#b1ddea]/10 pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#64818c]">
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#8ee8ff]" /> SYN / connection request</span>
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#73e2ad]" /> connected / data</span>
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#f5c76f]" /> closing / safety wait</span>
        </div>
      </div>

      <div className="relative z-[1] mt-4 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-[0.14em] text-[#6b8792]">
        <span className="flex items-center gap-2"><CircleDot className="h-3.5 w-3.5 text-[#8ee8ff]" /> Selected connection: {featuredRequest ? `#${featuredRequest.requestId} / ${featuredRequest.currentFlag}` : 'create one to begin'}</span>
        <span className="flex items-center gap-2"><ServerIcon className="h-3.5 w-3.5 text-[#73e2ad]" /> New connections use online servers only</span>
        <span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-[#73e2ad]" /> status is simulated</span>
      </div>
    </section>
  );
};
