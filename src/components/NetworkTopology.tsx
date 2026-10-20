'use client';

import React, { useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Globe, Cpu, Server as ServerIcon, Radio, ShieldAlert } from 'lucide-react';

interface NodePosition {
  x: number;
  y: number;
}

export const NetworkTopology: React.FC = () => {
  const { servers, clients, algorithm, protocol, activeRequests } = useSimulation();

  // Coordinates for canvas layout (SVG 800x420)
  const clientCoords: Record<string, NodePosition> = useMemo(
    () => ({
      'client-1': { x: 95, y: 80 },
      'client-2': { x: 95, y: 210 },
      'client-3': { x: 95, y: 340 },
    }),
    []
  );

  const lbCoord: NodePosition = useMemo(() => ({ x: 395, y: 210 }), []);

  const serverCoords: Record<string, NodePosition> = useMemo(
    () => ({
      'server-1': { x: 695, y: 80 },
      'server-2': { x: 695, y: 210 },
      'server-3': { x: 695, y: 340 },
    }),
    []
  );

  return (
    <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col h-full">
      {/* Canvas Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-cyan-950/80 border border-cyan-500/40 rounded-lg text-cyan-400">
            <Globe className="w-4 h-4 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Interactive Topology & Datagram Flow Map
            </h2>
            <p className="text-[11px] text-slate-400">
              Live Layer 4 / Layer 7 Packet Switching & Routing Simulation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono text-cyan-300 text-[11px] font-bold">
              In-Flight: {activeRequests.length}
            </span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-purple-300 font-mono text-[11px] border border-purple-800/50">
            {protocol} Datagrams
          </span>
        </div>
      </div>

      {/* Main Interactive SVG Canvas */}
      <div className="relative flex-1 w-full bg-slate-950/90 rounded-xl border border-slate-800/90 overflow-hidden flex items-center justify-center min-h-[380px] shadow-inner">
        {/* Subtle high-tech grid background pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #06b6d4 1px, transparent 0), radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)',
            backgroundSize: '24px 24px, 12px 12px',
          }}
        />

        <svg viewBox="0 0 800 420" className="w-full h-full max-h-[440px] select-none">
          <defs>
            {/* Soft Glow Filters */}
            <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-red" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-purple" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Linear Cable Gradients */}
            <linearGradient id="cable-cyan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="cable-emerald-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Connection Lines: Clients -> Load Balancer */}
          {clients.map((client) => {
            const pos = clientCoords[client.id];
            if (!pos) return null;
            return (
              <g key={`cable-c-${client.id}`}>
                {/* Background cable shadow */}
                <path
                  d={`M ${pos.x + 40} ${pos.y} C ${pos.x + 170} ${pos.y}, ${lbCoord.x - 170} ${lbCoord.y}, ${lbCoord.x - 55} ${lbCoord.y}`}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="5"
                />
                <path
                  d={`M ${pos.x + 40} ${pos.y} C ${pos.x + 170} ${pos.y}, ${lbCoord.x - 170} ${lbCoord.y}, ${lbCoord.x - 55} ${lbCoord.y}`}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3"
                />
                <path
                  d={`M ${pos.x + 40} ${pos.y} C ${pos.x + 170} ${pos.y}, ${lbCoord.x - 170} ${lbCoord.y}, ${lbCoord.x - 55} ${lbCoord.y}`}
                  fill="none"
                  stroke="url(#cable-cyan-grad)"
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                  className="animate-dash"
                />
              </g>
            );
          })}

          {/* Connection Lines: Load Balancer -> Servers */}
          {servers.map((server) => {
            const pos = serverCoords[server.id];
            if (!pos) return null;
            const isOnline = server.status === 'ONLINE';

            return (
              <g key={`cable-s-${server.id}`}>
                <path
                  d={`M ${lbCoord.x + 55} ${lbCoord.y} C ${lbCoord.x + 170} ${lbCoord.y}, ${pos.x - 170} ${pos.y}, ${pos.x - 50} ${pos.y}`}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="5"
                />
                <path
                  d={`M ${lbCoord.x + 55} ${lbCoord.y} C ${lbCoord.x + 170} ${lbCoord.y}, ${pos.x - 170} ${pos.y}, ${pos.x - 50} ${pos.y}`}
                  fill="none"
                  stroke={isOnline ? '#1e293b' : '#3d1212'}
                  strokeWidth="3"
                />
                {isOnline ? (
                  <path
                    d={`M ${lbCoord.x + 55} ${lbCoord.y} C ${lbCoord.x + 170} ${lbCoord.y}, ${pos.x - 170} ${pos.y}, ${pos.x - 50} ${pos.y}`}
                    fill="none"
                    stroke="url(#cable-emerald-grad)"
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                    className="animate-dash"
                  />
                ) : (
                  <path
                    d={`M ${lbCoord.x + 55} ${lbCoord.y} C ${lbCoord.x + 170} ${lbCoord.y}, ${pos.x - 170} ${pos.y}, ${pos.x - 50} ${pos.y}`}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    strokeOpacity="0.8"
                  />
                )}
              </g>
            );
          })}

          {/* Animated In-Flight Packets */}
          {activeRequests.map((req) => {
            const clientObj = clients.find((c) => c.ip === req.clientIp) || clients[0];
            const startPos = clientCoords[clientObj.id] || { x: 95, y: 210 };
            const destServer = servers.find((s) => s.id === req.selectedServerId);
            const targetPos = destServer ? serverCoords[destServer.id] : null;

            // Path 1: Client -> LB
            const pathClientToLb = `M ${startPos.x + 40} ${startPos.y} C ${startPos.x + 170} ${startPos.y}, ${lbCoord.x - 170} ${lbCoord.y}, ${lbCoord.x - 55} ${lbCoord.y}`;

            // Path 2: LB -> Server
            const pathLbToServer = targetPos
              ? `M ${lbCoord.x + 55} ${lbCoord.y} C ${lbCoord.x + 170} ${lbCoord.y}, ${targetPos.x - 170} ${targetPos.y}, ${targetPos.x - 50} ${targetPos.y}`
              : null;

            return (
              <g key={`packet-${req.id}`}>
                {/* Packet Client -> LB */}
                <circle r="6" fill="#38bdf8" filter="url(#glow-cyan)">
                  <animateMotion path={pathClientToLb} dur="0.38s" repeatCount="1" fill="freeze" />
                </circle>

                {/* Packet LB -> Server */}
                {pathLbToServer && (
                  <circle r="7" fill="#34d399" filter="url(#glow-emerald)">
                    <animateMotion
                      path={pathLbToServer}
                      begin="0.32s"
                      dur="0.42s"
                      repeatCount="1"
                      fill="freeze"
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* CLIENT NODES */}
          {clients.map((client) => {
            const pos = clientCoords[client.id];
            if (!pos) return null;
            return (
              <g key={`node-c-${client.id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                <rect
                  x="-42"
                  y="-26"
                  width="84"
                  height="52"
                  rx="12"
                  fill="#0b1120"
                  stroke="#1e293b"
                  strokeWidth="2"
                  className="hover:stroke-cyan-400 transition-colors cursor-pointer"
                />
                <rect
                  x="-42"
                  y="-26"
                  width="84"
                  height="52"
                  rx="12"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />

                <circle cx="-24" cy="-8" r="4" fill="#38bdf8" />
                <text x="0" y="8" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">
                  {client.name.split(' ')[2] || client.name}
                </text>
                <text x="0" y="20" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="Fira Code, monospace">
                  {client.ip}
                </text>
              </g>
            );
          })}

          {/* LOAD BALANCER VIP NODE */}
          <g transform={`translate(${lbCoord.x}, ${lbCoord.y})`}>
            {/* Outer aura glow ring */}
            <rect
              x="-62"
              y="-42"
              width="124"
              height="84"
              rx="18"
              fill="#06b6d4"
              fillOpacity="0.08"
              filter="url(#glow-purple)"
            />

            <rect
              x="-58"
              y="-38"
              width="116"
              height="76"
              rx="16"
              fill="#090d16"
              stroke="#06b6d4"
              strokeWidth="2.5"
              filter="url(#glow-cyan)"
            />

            {/* Algorithm Pill */}
            <rect x="-48" y="-30" width="96" height="18" rx="6" fill="#082f49" stroke="#0284c7" strokeWidth="0.8" />
            <text x="0" y="-17" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="Fira Code">
              {algorithm.replace('_', ' ')}
            </text>

            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="800">
              LOAD BALANCER
            </text>
            <text x="0" y="16" textAnchor="middle" fill="#06b6d4" fontSize="9" fontFamily="Fira Code, monospace">
              192.168.1.100:443
            </text>

            {/* Queue Badge */}
            <rect x="-40" y="22" width="80" height="13" rx="4" fill="#1e293b" />
            <text x="0" y="31" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontFamily="Fira Code, monospace">
              In-flight: {activeRequests.length}
            </text>
          </g>

          {/* BACKEND SERVER NODES */}
          {servers.map((server) => {
            const pos = serverCoords[server.id];
            if (!pos) return null;
            const isOnline = server.status === 'ONLINE';

            return (
              <g key={`node-s-${server.id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                <rect
                  x="-52"
                  y="-32"
                  width="104"
                  height="64"
                  rx="12"
                  fill={isOnline ? '#0b1120' : '#221010'}
                  stroke={isOnline ? '#10b981' : '#ef4444'}
                  strokeWidth="2"
                  filter={isOnline ? 'url(#glow-emerald)' : 'url(#glow-red)'}
                  className="transition-all"
                />

                {/* Status Dot */}
                <circle
                  cx="-38"
                  cy="-18"
                  r="5"
                  fill={isOnline ? '#10b981' : '#ef4444'}
                  className={isOnline ? 'animate-pulse' : ''}
                />

                <text x="4" y="-14" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                  {server.name}
                </text>
                <text x="0" y="0" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="Fira Code, monospace">
                  {server.ip}:{server.port}
                </text>

                {/* Status / Active conns */}
                {isOnline ? (
                  <>
                    <text x="0" y="13" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="Fira Code">
                      Conns: {server.activeConnections} | {server.cpuLoad}% CPU
                    </text>
                    {/* CPU Load bar */}
                    <rect x="-42" y="18" width="84" height="4" rx="2" fill="#1e293b" />
                    <rect
                      x="-42"
                      y="18"
                      width={Math.min(84, (server.cpuLoad / 100) * 84)}
                      height="4"
                      rx="2"
                      fill={server.cpuLoad > 85 ? '#ef4444' : server.cpuLoad > 50 ? '#f59e0b' : '#10b981'}
                    />
                  </>
                ) : (
                  <text x="0" y="14" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">
                    🚫 SERVER OFFLINE
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
