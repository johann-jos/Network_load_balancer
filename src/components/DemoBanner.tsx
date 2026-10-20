'use client';

import React from 'react';
import { ArrowRight, Pause, Play, RotateCcw, X } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export const DemoBanner: React.FC = () => {
  const { demoState, nextDemoStep, toggleDemoPlayback, stopDemoMode, startDemoMode } = useSimulation();
  if (!demoState.active) return null;
  const progress = Math.round((demoState.currentStep / demoState.totalSteps) * 100);

  return (
    <section className="relative overflow-hidden border border-[#8ee8ff]/30 bg-[#0b202b] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.25)] sm:p-5" aria-label="Guided TCP walkthrough">
      <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#8ee8ff]" />
      <div className="flex flex-col gap-5 pl-3 sm:flex-row sm:items-center sm:justify-between sm:pl-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.17em] text-[#8ee8ff]">
            <span>guided walkthrough</span><span className="text-[#5d7c87]">/</span><span>step {demoState.currentStep} of {demoState.totalSteps}</span>
          </div>
          <h2 className="mt-2 truncate font-headline text-xl tracking-[-0.04em] text-[#e8f1f5] sm:text-2xl">{demoState.stepTitle}</h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-[#9ab4bd]">{demoState.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={toggleDemoPlayback} className="inline-flex items-center gap-2 border border-[#b1ddea]/20 bg-[#071019] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#d5e7ed] transition hover:border-[#8ee8ff]/45">
            {demoState.isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}{demoState.isPaused ? 'play' : 'pause'}
          </button>
          <button onClick={nextDemoStep} disabled={demoState.currentStep >= demoState.totalSteps} className="inline-flex items-center gap-2 border border-[#8ee8ff]/35 bg-[#0f3542] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#b9f3ff] transition hover:bg-[#16495a] disabled:cursor-not-allowed disabled:opacity-40">next <ArrowRight className="h-3.5 w-3.5" /></button>
          <button onClick={startDemoMode} className="border border-[#b1ddea]/15 bg-[#071019] p-2 text-[#78929d] transition hover:text-[#e8f1f5]" aria-label="Replay walkthrough"><RotateCcw className="h-3.5 w-3.5" /></button>
          <button onClick={stopDemoMode} className="border border-[#b1ddea]/15 bg-[#071019] p-2 text-[#78929d] transition hover:text-[#ffaaa0]" aria-label="Exit walkthrough"><X className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="mt-4 h-1 bg-[#071019]">
        <div className="h-full bg-[#8ee8ff] transition-all duration-700" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
};
