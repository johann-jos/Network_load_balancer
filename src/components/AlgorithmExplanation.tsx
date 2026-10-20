'use client';

import React from 'react';
import { ArrowDown, CheckCircle2, GitBranch, Info, Scale, Waypoints } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { ALGORITHM_LABELS } from '../lib/simulationEngine';

const explanation: Record<string, { formula: string; description: string }> = {
  ROUND_ROBIN: { formula: 'next = eligible[(pointer + 1) mod N]', description: 'Every new flow takes the next healthy listener in the rotation.' },
  LEAST_CONNECTIONS: { formula: 'target = arg min(active TCP sockets)', description: 'The live socket table matters more than a fixed turn order.' },
  WEIGHTED_ROUND_ROBIN: { formula: 'score += weight; winner -= Σ weights', description: 'Capacity is expressed as a long-run ratio without starving smaller nodes.' },
};

export const AlgorithmExplanation: React.FC = () => {
  const { algorithm, servers, lastRouteDecision } = useSimulation();
  const activeExplanation = explanation[algorithm];

  return (
    <section className="lab-panel p-5" aria-labelledby="decision-title">
      <div className="flex items-start justify-between gap-4 border-b border-[#b1ddea]/15 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8ee8ff]"><GitBranch className="h-3.5 w-3.5" /> Decision trace</div>
          <h2 id="decision-title" className="mt-2 font-headline text-xl tracking-[-0.04em] text-[#e8f1f5]">Why this target?</h2>
          <p className="mt-1 text-xs text-[#79939e]">The policy is only useful when you can see the evidence it used.</p>
        </div>
        <Waypoints className="h-5 w-5 text-[#8ee8ff]" />
      </div>

      <div className="mt-4 border border-[#8ee8ff]/20 bg-[#091722] p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6e8994]">active policy</span>
          <span className="border border-[#8ee8ff]/35 bg-[#10313d] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#b9f3ff]">{ALGORITHM_LABELS[algorithm]}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#d7e7ec]">{activeExplanation.description}</p>
        <div className="mt-3 flex items-start gap-2 border-t border-[#b1ddea]/12 pt-3 font-mono text-[10px] leading-5 text-[#8ee8ff]"><Scale className="mt-0.5 h-3.5 w-3.5 shrink-0" />{activeExplanation.formula}</div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-[#6e8994]"><span>last candidate set</span><span>{lastRouteDecision ? `flow #${lastRouteDecision.requestId}` : 'waiting'}</span></div>
        <div className="space-y-2">
          {servers.map((server) => {
            const selected = server.id === lastRouteDecision?.selectedServerId;
            const eligible = lastRouteDecision?.candidateServerIds.includes(server.id) ?? server.status === 'ONLINE';
            return (
              <div key={server.id} className={`flex items-center gap-3 border p-3 transition ${selected ? 'border-[#73e2ad]/45 bg-[#0d2923]' : 'border-[#b1ddea]/10 bg-[#08131b]'}`}>
                <div className={`flex h-7 w-7 items-center justify-center font-mono text-[10px] ${selected ? 'bg-[#73e2ad] text-[#071019]' : 'bg-[#10232c] text-[#75909b]'}`}>{server.name.slice(-2)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-[#d7e7ec]"><span>{server.name}</span>{selected && <CheckCircle2 className="h-3.5 w-3.5 text-[#73e2ad]" />}</div>
                  <div className="mt-1 font-mono text-[10px] text-[#69848f]">{server.activeConnections} sockets · {server.weight} weight · {server.status.toLowerCase()}</div>
                </div>
                <div className={`font-mono text-[10px] ${eligible ? selected ? 'text-[#73e2ad]' : 'text-[#8ee8ff]' : 'text-[#5b717b]'}`}>
                  {lastRouteDecision ? `score ${lastRouteDecision.scores[server.id] ?? '—'}` : eligible ? 'eligible' : 'excluded'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 border-l-2 border-[#f5c76f]/55 bg-[#211a10] px-3 py-2 text-[10px] leading-5 text-[#bda16a]"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />A Layer 4 policy selects a connection/flow. It does not inspect an HTTP path or distribute individual packets from an established TCP stream.</div>
      <div className="mt-3 flex items-center justify-center text-[#52717c]"><ArrowDown className="h-4 w-4" /></div>
    </section>
  );
};
