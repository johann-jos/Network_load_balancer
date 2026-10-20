'use client';

import React, { useState } from 'react';
import { BarChart3, Check, Info, Play, Scale, Timer } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { simulateAlgorithmComparison } from '../lib/simulationEngine';
import { AlgorithmBenchmarkResult } from '../types/simulation';

export const AlgorithmComparison: React.FC = () => {
  const { servers } = useSimulation();
  const [results, setResults] = useState<AlgorithmBenchmarkResult[] | null>(null);
  const [running, setRunning] = useState(false);

  const runBenchmark = () => {
    setRunning(true);
    window.setTimeout(() => {
      setResults(simulateAlgorithmComparison(servers, 100));
      setRunning(false);
    }, 500);
  };

  return (
    <section className="lab-panel p-5 sm:p-6" aria-labelledby="benchmark-title">
      <div className="flex flex-col gap-4 border-b border-[#b1ddea]/15 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8ee8ff]"><BarChart3 className="h-3.5 w-3.5" /> Controlled experiment</div>
          <h2 id="benchmark-title" className="mt-2 font-headline text-2xl tracking-[-0.045em] text-[#e8f1f5]">Same 100 SYNs. Three different instincts.</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#8099a4]">A repeatable synthetic run makes the routing policy visible. It measures selection distribution, not real server throughput.</p>
        </div>
        <button onClick={runBenchmark} disabled={running} className="inline-flex items-center justify-center gap-2 border border-[#8ee8ff]/35 bg-[#0f3542] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.13em] text-[#b9f3ff] transition hover:bg-[#16495a] disabled:cursor-wait disabled:opacity-60"><Play className="h-3.5 w-3.5 fill-current" />{running ? 'running experiment' : 'run 100-flow test'}</button>
      </div>

      {results ? (
        <div className="mt-5 overflow-x-auto border border-[#b1ddea]/12 bg-[#050c12]">
          <table className="w-full min-w-[780px] border-collapse text-left font-mono text-[10px]">
            <thead className="border-b border-[#b1ddea]/12 bg-[#0a151e] text-[#6e8994]">
              <tr>{['policy', 'distribution', '01', '02', '03', 'mean latency', 'cluster load', 'failures'].map((heading) => <th key={heading} className="px-3 py-3 font-normal uppercase tracking-[0.12em]">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.algorithm} className="border-b border-[#b1ddea]/8 last:border-0 hover:bg-[#0b202b]">
                  <td className="px-3 py-3 font-semibold text-[#8ee8ff]">{result.algorithmName}</td>
                  <td className="px-3 py-3 text-[#90aab4]">{result.targetDistribution}</td>
                  <td className="px-3 py-3 text-[#73e2ad]">{result.requestsPerServer['ORBIT / 01'] ?? 0}</td>
                  <td className="px-3 py-3 text-[#73e2ad]">{result.requestsPerServer['ORBIT / 02'] ?? 0}</td>
                  <td className="px-3 py-3 text-[#73e2ad]">{result.requestsPerServer['ORBIT / 03'] ?? 0}</td>
                  <td className="px-3 py-3 text-[#f5c76f]">{result.averageResponseTimeMs}ms</td>
                  <td className="px-3 py-3 text-[#d7b8ff]">{result.averageServerLoadPercent}%</td>
                  <td className="px-3 py-3 text-[#73e2ad]">{result.failedRequests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5 flex min-h-[150px] flex-col items-center justify-center border border-dashed border-[#b1ddea]/15 bg-[#08131b] text-center">
          <Scale className="h-6 w-6 text-[#52727e]" />
          <p className="mt-3 font-mono text-xs text-[#78929d]">Run the experiment to compare how each policy sees the same pool.</p>
        </div>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="flex items-start gap-2 border border-[#b1ddea]/10 bg-[#08131b] p-3 text-[10px] leading-5 text-[#7f99a4]"><Timer className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f5c76f]" /><span><strong className="text-[#d9e9ee]">Round robin</strong> is predictable, not capacity-aware.</span></div>
        <div className="flex items-start gap-2 border border-[#b1ddea]/10 bg-[#08131b] p-3 text-[10px] leading-5 text-[#7f99a4]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#73e2ad]" /><span><strong className="text-[#d9e9ee]">Least connections</strong> reacts to concurrency.</span></div>
        <div className="flex items-start gap-2 border border-[#b1ddea]/10 bg-[#08131b] p-3 text-[10px] leading-5 text-[#7f99a4]"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8ee8ff]" /><span><strong className="text-[#d9e9ee]">Weights</strong> are a long-run expectation, not a per-burst promise.</span></div>
      </div>
    </section>
  );
};
