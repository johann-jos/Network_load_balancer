'use client';

import React from 'react';
import { ArrowDown, Server as ServerIcon } from 'lucide-react';
import { AlgorithmComparison } from '../components/AlgorithmComparison';
import { AlgorithmExplanation } from '../components/AlgorithmExplanation';
import { ConnectionInspector } from '../components/ConnectionInspector';
import { DemoBanner } from '../components/DemoBanner';
import { EventLogPanel } from '../components/EventLogPanel';
import { Header } from '../components/Header';
import { MetricsDashboard } from '../components/MetricsDashboard';
import { NetworkTopology } from '../components/NetworkTopology';
import { NetworkingConcepts } from '../components/NetworkingConcepts';
import { ServerCard } from '../components/ServerCard';
import { SimulationControls } from '../components/SimulationControls';
import { StoryIntro } from '../components/StoryIntro';
import { TcpTimeline } from '../components/TcpTimeline';
import { useSimulation } from '../context/SimulationContext';

export default function Home() {
  const { servers } = useSimulation();

  return (
    <div id="top" className="min-h-screen bg-[#071019]">
      <Header />
      <main className="mx-auto max-w-[1800px] space-y-6 px-4 py-6 sm:px-6 lg:space-y-8 lg:py-10">
        <DemoBanner />

        <section id="story" className="grid gap-6 lg:grid-cols-[0.72fr_1.85fr_0.78fr] lg:gap-7">
          <StoryIntro />
          <NetworkTopology />
          <ConnectionInspector />
        </section>

        <div className="flex items-center gap-3 px-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[#54727e]"><span className="h-px flex-1 bg-[#b1ddea]/12" /><ArrowDown className="h-3.5 w-3.5 text-[#8ee8ff]" /><span>now slow it down</span><span className="h-px flex-1 bg-[#b1ddea]/12" /></div>
        <TcpTimeline />
        <SimulationControls />

        <section aria-labelledby="pool-title">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8ee8ff]"><ServerIcon className="h-3.5 w-3.5" /> Listener pool</div>
              <h2 id="pool-title" className="mt-2 font-headline text-2xl tracking-[-0.05em] text-[#e8f1f5]">Three listeners. One decision at a time.</h2>
              <p className="mt-1 text-xs text-[#8099a4]">Stop intake, watch connections drain, then recover a target into the eligible pool.</p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-[#62808b]">TCP :8080 / simulated health</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {servers.map((server) => <ServerCard key={server.id} server={server} />)}
          </div>
        </section>

        <MetricsDashboard />

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <EventLogPanel />
          <AlgorithmExplanation />
        </section>

        <AlgorithmComparison />
        <NetworkingConcepts />
      </main>

      <footer className="border-t border-[#b1ddea]/12 bg-[#050c12] px-4 py-6 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-[#587480] sm:px-6">
        TCP/04 connection lab · educational simulator · built for Computer Networks study and demonstration
      </footer>
    </div>
  );
}
