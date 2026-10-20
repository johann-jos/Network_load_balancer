'use client';

import React from 'react';
import { Check, Circle, Clock3, Flag, Radio, RotateCcw, X } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { TcpPhase } from '../types/simulation';

const phases: { id: TcpPhase; flag: string; title: string; note: string }[] = [
  { id: 'SYN_SENT', flag: 'SYN', title: 'Ask', note: 'client opens' },
  { id: 'ROUTING', flag: 'VIP', title: 'Choose', note: 'eligible target' },
  { id: 'SYN_ACK', flag: 'SYN-ACK', title: 'Answer', note: 'target listens' },
  { id: 'ACK', flag: 'ACK', title: 'Confirm', note: 'handshake done' },
  { id: 'ESTABLISHED', flag: 'DATA', title: 'Carry', note: 'ordered stream' },
  { id: 'FIN_WAIT', flag: 'FIN', title: 'Close', note: 'graceful finish' },
  { id: 'TIME_WAIT', flag: '2MSL', title: 'Protect', note: 'old segments expire' },
];

const phaseIndex = (phase: TcpPhase | undefined) => {
  if (!phase) return -1;
  if (phase === 'FAILED' || phase === 'RST' || phase === 'CLOSED') return phase === 'CLOSED' ? phases.length : -1;
  return phases.findIndex((item) => item.id === phase);
};

export const TcpTimeline: React.FC = () => {
  const { featuredRequest, tcpMetrics } = useSimulation();
  const currentIndex = phaseIndex(featuredRequest?.phase);
  const failed = featuredRequest?.phase === 'FAILED' || featuredRequest?.phase === 'RST';

  return (
    <section className="lab-panel p-5 sm:p-6" aria-labelledby="tcp-timeline-title">
      <div className="flex flex-col justify-between gap-4 border-b border-[#b1ddea]/15 pb-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8ee8ff]">
            <Radio className="h-3.5 w-3.5" />
            The wire, slowed down
          </div>
          <h2 id="tcp-timeline-title" className="mt-2 font-headline text-2xl tracking-[-0.045em] text-[#e8f1f5]">Three packets to open. Four signals to close.</h2>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.13em] text-[#6f8994]">
          <span className="text-[#73e2ad]">{tcpMetrics.establishedConnections} established</span>
          <span className="h-3 w-px bg-[#b1ddea]/20" />
          <span>{tcpMetrics.timeWaitConnections} time-wait</span>
        </div>
      </div>

      <div className="relative mt-7">
        <div className="absolute left-5 right-5 top-5 hidden h-px bg-[#b1ddea]/15 md:block" />
        <div
          className="absolute left-5 top-5 hidden h-px bg-[#8ee8ff] transition-all duration-500 md:block"
          style={{ width: `${Math.max(0, Math.min(100, currentIndex / (phases.length - 1) * 100))}%` }}
        />
        <div className="grid gap-4 md:grid-cols-7 md:gap-2">
          {phases.map((item, index) => {
            const isCurrent = index === currentIndex;
            const isDone = currentIndex > index;
            return (
              <div key={item.id} className="relative flex items-center gap-3 md:block md:text-center">
                <div className={`relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center border transition-all md:mx-auto ${
                  isCurrent ? 'border-[#8ee8ff] bg-[#123342] text-[#8ee8ff] shadow-[0_0_0_5px_rgba(142,232,255,0.08)]' : isDone ? 'border-[#73e2ad]/60 bg-[#0c2823] text-[#73e2ad]' : 'border-[#b1ddea]/18 bg-[#0a151e] text-[#5d7782]'
                }`}>
                  {isDone ? <Check className="h-4 w-4" /> : isCurrent ? <Flag className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                </div>
                <div className="mt-0 md:mt-3">
                  <div className={`font-mono text-[10px] uppercase tracking-[0.14em] ${isCurrent ? 'text-[#8ee8ff]' : isDone ? 'text-[#73e2ad]' : 'text-[#718994]'}`}>{item.flag}</div>
                  <div className="mt-1 text-xs text-[#d3e3e8]">{item.title}</div>
                  <div className="mt-1 text-[10px] text-[#69848f]">{item.note}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`mt-6 flex items-start gap-3 border p-3 text-xs leading-5 ${failed ? 'border-[#ff7d79]/30 bg-[#2b1719] text-[#ffb1a9]' : 'border-[#8ee8ff]/15 bg-[#091722] text-[#9db4bd]'}`}>
        {failed ? <X className="mt-0.5 h-4 w-4 shrink-0 text-[#ff7d79]" /> : featuredRequest?.phase === 'TIME_WAIT' ? <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#f5c76f]" /> : <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-[#8ee8ff]" />}
        <span>
          {failed
            ? 'A TCP reset/refusal is a transport outcome; this lab stops before application-level status codes.'
            : featuredRequest
              ? `Flow #${featuredRequest.requestId} is currently ${featuredRequest.phase.replace('_', ' ').toLowerCase()}. The animation follows state, not a decorative timer.`
              : 'Open a flow to see the same state machine that powers the topology above.'}
        </span>
      </div>
    </section>
  );
};
