'use client';

import React from 'react';
import { Pause, Play, Radio, Send, SlidersHorizontal, Sparkles, Square, Terminal } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { ALGORITHM_LABELS } from '../lib/simulationEngine';
import { AlgorithmType } from '../types/simulation';

const algorithmInfo: { id: AlgorithmType; short: string; description: string }[] = [
  { id: 'ROUND_ROBIN', short: 'RR', description: 'next eligible socket in sequence' },
  { id: 'LEAST_CONNECTIONS', short: 'LC', description: 'lowest active connection count' },
  { id: 'WEIGHTED_ROUND_ROBIN', short: 'WRR', description: 'smooth 5 : 3 : 2 capacity ratio' },
];

export const SimulationControls: React.FC = () => {
  const {
    algorithm,
    setAlgorithm,
    sendSingleRequest,
    sendBatchRequests,
    isContinuousTraffic,
    trafficRateRps,
    setTrafficRate,
    startContinuousTraffic,
    stopContinuousTraffic,
    demoState,
    toggleDemoPlayback,
    nextDemoStep,
    startDemoMode,
  } = useSimulation();

  return (
    <section className="lab-panel p-5" aria-labelledby="control-title">
      <div className="flex flex-col gap-4 border-b border-[#b1ddea]/15 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8ee8ff]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Operator controls
          </div>
          <h2 id="control-title" className="mt-2 font-headline text-xl tracking-[-0.04em] text-[#e8f1f5]">Open pressure on the cluster</h2>
          <p className="mt-1 text-xs text-[#79939e]">Every click opens a TCP socket. The story stage follows its flags.</p>
        </div>
        <div className="flex items-center gap-2 border border-[#73e2ad]/20 bg-[#0a211d] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#73e2ad]">
          <Radio className="h-3 w-3" /> TCP only
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1.45fr_1fr]">
        <div>
          <label className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#6c8792]">01 / routing policy</label>
          <div className="mt-2 grid gap-2">
            {algorithmInfo.map((item) => {
              const selected = algorithm === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAlgorithm(item.id)}
                  aria-pressed={selected}
                  className={`group flex items-center gap-3 border px-3 py-2.5 text-left transition active:translate-y-px ${selected ? 'border-[#8ee8ff]/65 bg-[#10313d] text-[#e8f1f5]' : 'border-[#b1ddea]/12 bg-[#0a151e] text-[#88a0aa] hover:border-[#8ee8ff]/35 hover:text-[#d7e8ed]'}`}
                >
                  <span className={`flex h-7 w-8 items-center justify-center font-mono text-[10px] font-bold ${selected ? 'bg-[#8ee8ff] text-[#071019]' : 'bg-[#10232c] text-[#6f9eaa]'}`}>{item.short}</span>
                  <span>
                    <span className="block text-xs font-semibold">{ALGORITHM_LABELS[item.id]}</span>
                    <span className="mt-0.5 block text-[10px] text-[#6d8792]">{item.description}</span>
                  </span>
                  {selected && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#8ee8ff] shadow-[0_0_0_4px_rgba(142,232,255,0.1)]" />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#6c8792]">02 / inject new flows</label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <button onClick={() => sendSingleRequest()} className="flex min-h-[70px] flex-col items-start justify-between border border-[#8ee8ff]/35 bg-[#0f303d] p-3 text-left text-[#b9f3ff] transition hover:-translate-y-0.5 hover:bg-[#154658] active:translate-y-px">
              <Send className="h-4 w-4" />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em]">open one</span>
            </button>
            <button onClick={() => sendBatchRequests(10)} className="flex min-h-[70px] flex-col items-start justify-between border border-[#b1ddea]/14 bg-[#0a151e] p-3 text-left text-[#d5e5ea] transition hover:-translate-y-0.5 hover:border-[#8ee8ff]/35 active:translate-y-px">
              <span className="font-mono text-2xl text-[#8ee8ff]">10</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#78929d]">burst</span>
            </button>
            <button onClick={() => sendBatchRequests(50)} className="flex min-h-[70px] flex-col items-start justify-between border border-[#b1ddea]/14 bg-[#0a151e] p-3 text-left text-[#d5e5ea] transition hover:-translate-y-0.5 hover:border-[#8ee8ff]/35 active:translate-y-px">
              <span className="font-mono text-2xl text-[#8ee8ff]">50</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#78929d]">burst</span>
            </button>
            <button onClick={() => sendBatchRequests(100)} className="flex min-h-[70px] flex-col items-start justify-between border border-[#f5c76f]/35 bg-[#251e11] p-3 text-left text-[#f7d99a] transition hover:-translate-y-0.5 hover:bg-[#332715] active:translate-y-px">
              <span className="font-mono text-2xl text-[#f5c76f]">100</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#b99a5e]">stress burst</span>
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#6c8792]">03 / sustained pressure</label>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {[1, 5, 10, 20].map((rate) => (
              <button key={rate} onClick={() => setTrafficRate(rate)} aria-pressed={trafficRateRps === rate} className={`border py-2 font-mono text-[10px] transition ${trafficRateRps === rate ? 'border-[#8ee8ff] bg-[#8ee8ff] text-[#071019]' : 'border-[#b1ddea]/12 bg-[#0a151e] text-[#78929d] hover:border-[#8ee8ff]/35'}`}>
                {rate}/s
              </button>
            ))}
          </div>
          {isContinuousTraffic ? (
            <button onClick={stopContinuousTraffic} className="mt-2 flex w-full items-center justify-center gap-2 border border-[#ff7d79]/45 bg-[#32191b] py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#ffaaa0] transition hover:bg-[#482023]">
              <Square className="h-3.5 w-3.5 fill-current" /> stop sustained traffic
            </button>
          ) : (
            <button onClick={() => startContinuousTraffic(trafficRateRps)} className="mt-2 flex w-full items-center justify-center gap-2 border border-[#73e2ad]/35 bg-[#0d2d25] py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#9bf0c4] transition hover:bg-[#123f32]">
              <Play className="h-3.5 w-3.5 fill-current" /> start at {trafficRateRps}/s
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-[#b1ddea]/12 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[11px] text-[#78929d]">
          <Terminal className="h-3.5 w-3.5 text-[#8ee8ff]" />
          {demoState.active ? `Chapter ${demoState.currentStep}/${demoState.totalSteps}: ${demoState.stepTitle}` : 'Tip: take a server offline while flows are open to watch drain behavior.'}
        </div>
        <div className="flex items-center gap-2">
          {demoState.active ? (
            <>
              <button onClick={toggleDemoPlayback} className="inline-flex items-center gap-2 border border-[#b1ddea]/18 bg-[#0a151e] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#b6cbd2] transition hover:border-[#8ee8ff]/35">
                {demoState.isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}{demoState.isPaused ? 'resume' : 'pause'}
              </button>
              <button onClick={nextDemoStep} className="inline-flex items-center gap-2 border border-[#8ee8ff]/30 bg-[#0f303d] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#b9f3ff] transition hover:bg-[#154658]">next chapter</button>
            </>
          ) : (
            <button onClick={startDemoMode} className="inline-flex items-center gap-2 border border-[#8ee8ff]/30 bg-[#0f303d] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#b9f3ff] transition hover:bg-[#154658]"><Sparkles className="h-3 w-3" /> run guided story</button>
          )}
        </div>
      </div>
    </section>
  );
};
