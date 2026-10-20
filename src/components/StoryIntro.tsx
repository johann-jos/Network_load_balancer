'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, BookOpen, CircleDot, Radio, ShieldCheck } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { ALGORITHM_LABELS } from '../lib/simulationEngine';

const chapters = [
  ['01', 'A SYN appears'],
  ['02', 'The VIP decides'],
  ['03', 'The socket opens'],
  ['04', 'The flow closes'],
];

export const StoryIntro: React.FC = () => {
  const { algorithm, featuredRequest, tcpMetrics } = useSimulation();
  const phase = featuredRequest?.phase ?? 'IDLE';

  return (
    <motion.aside
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col justify-between border-b border-[#b1ddea]/15 pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8"
    >
      <div>
        <div className="mb-8 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-[#8ee8ff]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#73e2ad] shadow-[0_0_0_4px_rgba(115,226,173,0.12)]" />
          TCP / connection lab
        </div>
        <h2 className="max-w-[12ch] font-headline text-4xl font-semibold leading-[0.97] tracking-[-0.06em] text-[#e8f1f5] sm:text-5xl">
          Follow one connection all the way through.
        </h2>
        <p className="mt-5 max-w-sm text-sm leading-7 text-[#9ab0ba]">
          A transport-layer story: a client opens a socket, the VIP chooses a healthy target, and TCP closes cleanly when the work is done.
        </p>

        <div className="mt-8 grid gap-3">
          {chapters.map(([number, label], index) => (
            <div key={number} className="flex items-center gap-3 text-xs">
              <span className="font-mono text-[10px] text-[#5d7b87]">{number}</span>
              <span className={`h-px w-6 ${index < 2 ? 'bg-[#8ee8ff]/60' : 'bg-[#b1ddea]/20'}`} />
              <span className={index < 2 ? 'text-[#dbe9ee]' : 'text-[#78919c]'}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 space-y-3">
        <div className="border border-[#8ee8ff]/20 bg-[#091722] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-[#6e8b97]">
                <Radio className="h-3.5 w-3.5 text-[#8ee8ff]" />
                Current chapter
              </div>
              <p className="mt-2 font-mono text-lg text-[#8ee8ff]">{phase.replace('_', ' ')}</p>
            </div>
            <CircleDot className="h-5 w-5 text-[#73e2ad] animate-breathe" />
          </div>
          <p className="mt-2 text-[11px] leading-5 text-[#89a3ae]">
            {featuredRequest
              ? `Flow #${featuredRequest.requestId} is the current trace. Select it in the recorder for the full socket header.`
              : 'Press “Open TCP flow” to put a real connection on the stage.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="border border-[#b1ddea]/12 bg-[#0a151e] p-3">
            <div className="text-[#698692]">policy</div>
            <div className="mt-1 truncate text-[#dbe9ee]">{ALGORITHM_LABELS[algorithm]}</div>
          </div>
          <div className="border border-[#b1ddea]/12 bg-[#0a151e] p-3">
            <div className="text-[#698692]">open sockets</div>
            <div className="mt-1 text-[#73e2ad]">{tcpMetrics.activeConnections}</div>
          </div>
        </div>

        <a href="#tcp-notes" className="flex items-center gap-2 pt-2 text-[11px] text-[#8ea6b0] transition-colors hover:text-[#8ee8ff]">
          <BookOpen className="h-3.5 w-3.5" />
          Read the research notes
          <ArrowDownRight className="ml-auto h-3.5 w-3.5" />
        </a>
        <div className="flex items-center gap-2 text-[10px] text-[#68828d]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#73e2ad]" />
          Simulation only · no live packets leave this browser
        </div>
      </div>
    </motion.aside>
  );
};
