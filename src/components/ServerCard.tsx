'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, CircleDot, Gauge, Power, Scale, Server as ServerIcon } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { Server } from '../types/simulation';

export const ServerCard: React.FC<{ server: Server }> = ({ server }) => {
  const { algorithm, toggleServerStatus, updateServerWeight } = useSimulation();
  const online = server.status === 'ONLINE';
  const draining = server.status === 'DRAINING';
  const capacity = Math.min(100, Math.round((server.activeConnections / server.maxCapacity) * 100));
  const tone = online ? '#73e2ad' : draining ? '#f5c76f' : '#ff7d79';

  return (
    <motion.article layout className="lab-panel p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center border" style={{ borderColor: `${tone}55`, backgroundColor: `${tone}12`, color: tone }}>
            <ServerIcon className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full" style={{ backgroundColor: tone, boxShadow: `0 0 0 4px ${tone}18` }} />
          </div>
          <div>
            <h3 className="font-headline text-base tracking-[-0.035em] text-[#e8f1f5]">{server.name}</h3>
            <p className="font-mono text-[10px] text-[#708b96]">{server.ip}:{server.port} · {server.zone}</p>
          </div>
        </div>
        <span className="border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em]" style={{ borderColor: `${tone}55`, color: tone, backgroundColor: `${tone}0d` }}>{server.status}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 font-mono">
        <div className="border border-[#b1ddea]/12 bg-[#08131b] p-2.5">
          <Activity className="h-3.5 w-3.5 text-[#8ee8ff]" />
          <div className="mt-2 text-[9px] uppercase tracking-[0.12em] text-[#68838e]">open TCP</div>
          <div className="mt-0.5 text-lg text-[#d9ebf0]">{server.activeConnections}</div>
        </div>
        <div className="border border-[#b1ddea]/12 bg-[#08131b] p-2.5">
          <Gauge className="h-3.5 w-3.5 text-[#f5c76f]" />
          <div className="mt-2 text-[9px] uppercase tracking-[0.12em] text-[#68838e]">capacity</div>
          <div className="mt-0.5 text-lg text-[#f5c76f]">{capacity}%</div>
        </div>
        <div className="border border-[#b1ddea]/12 bg-[#08131b] p-2.5">
          <CircleDot className="h-3.5 w-3.5 text-[#73e2ad]" />
          <div className="mt-2 text-[9px] uppercase tracking-[0.12em] text-[#68838e]">latency</div>
          <div className="mt-0.5 text-lg text-[#73e2ad]">{online || draining ? `${server.responseTimeMs}ms` : '—'}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-[#68838e]">
          <span>socket pressure</span>
          <span style={{ color: tone }}>{server.activeConnections}/{server.maxCapacity}</span>
        </div>
        <div className="h-1.5 overflow-hidden bg-[#071019]">
          <motion.div className="h-full" animate={{ width: `${capacity}%` }} transition={{ type: 'spring', stiffness: 100, damping: 20 }} style={{ backgroundColor: tone }} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#b1ddea]/12 pt-3 font-mono text-[10px] text-[#78929d]">
        <span>{server.totalConnectionsHandled} accepted</span>
        <span>{server.halfOpenConnections} half-open · {server.timeWaitConnections} TIME-WAIT</span>
      </div>

      {algorithm === 'WEIGHTED_ROUND_ROBIN' && (
        <div className="mt-3 border border-[#b1ddea]/12 bg-[#08131b] p-3">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-[#78929d]">
            <span className="flex items-center gap-2"><Scale className="h-3.5 w-3.5 text-[#8ee8ff]" /> configured weight</span>
            <span className="text-[#8ee8ff]">{server.weight}</span>
          </div>
          <input aria-label={`${server.name} weighted round robin weight`} type="range" min="1" max="20" value={server.weight} onChange={(event) => updateServerWeight(server.id, Number(event.target.value))} className="h-1.5 w-full cursor-pointer accent-[#8ee8ff]" />
        </div>
      )}

      <button onClick={() => toggleServerStatus(server.id)} className={`mt-3 flex w-full items-center justify-center gap-2 border py-2.5 font-mono text-[10px] uppercase tracking-[0.13em] transition ${online ? 'border-[#ff7d79]/35 bg-[#271619] text-[#ffaaa0] hover:bg-[#3a1d20]' : 'border-[#73e2ad]/35 bg-[#0d2d25] text-[#9bf0c4] hover:bg-[#123f32]'}`}>
        <Power className="h-3.5 w-3.5" />
        {online ? 'stop accepting SYNs' : draining ? 'recover listener' : 'recover listener'}
      </button>
    </motion.article>
  );
};
