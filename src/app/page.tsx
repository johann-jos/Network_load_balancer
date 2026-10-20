'use client';

import React from 'react';
import { Header } from '../components/Header';
import { SimulationControls } from '../components/SimulationControls';
import { NetworkTopology } from '../components/NetworkTopology';
import { ServerCard } from '../components/ServerCard';
import { MetricsDashboard } from '../components/MetricsDashboard';
import { EventLogPanel } from '../components/EventLogPanel';
import { AlgorithmExplanation } from '../components/AlgorithmExplanation';
import { AlgorithmComparison } from '../components/AlgorithmComparison';
import { NetworkingConcepts } from '../components/NetworkingConcepts';
import { DemoBanner } from '../components/DemoBanner';
import { useSimulation } from '../context/SimulationContext';

export default function Home() {
  const { servers } = useSimulation();

  return (
    <div className="min-h-screen flex flex-col bg-network-bg">
      {/* Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Presentation Demo Mode Banner */}
        <DemoBanner />

        {/* TOP SECTION: Controls | Interactive Topology Canvas | Server Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Simulation Controls (3 cols) */}
          <div className="lg:col-span-3">
            <SimulationControls />
          </div>

          {/* Center Column: Network Topology Visualization (6 cols) */}
          <div className="lg:col-span-6">
            <NetworkTopology />
          </div>

          {/* Right Column: Server Cards (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide px-1">
              Backend Server Nodes Pool
            </h2>
            <div className="space-y-3">
              {servers.map((server) => (
                <ServerCard key={server.id} server={server} />
              ))}
            </div>
          </div>
        </div>

        {/* METRICS & RECHARTS DASHBOARD */}
        <section className="pt-2">
          <MetricsDashboard />
        </section>

        {/* LOGS & ALGORITHM THEORY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <EventLogPanel />
          </div>
          <div className="lg:col-span-6">
            <AlgorithmExplanation />
          </div>
        </div>

        {/* ALGORITHM COMPARISON BENCHMARK */}
        <section>
          <AlgorithmComparison />
        </section>

        {/* EDUCATIONAL NETWORKING CONCEPTS (VIVA GUIDE) */}
        <section className="pb-8">
          <NetworkingConcepts />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-network-border bg-network-card py-4 text-center text-xs text-slate-400 font-mono">
        <p>
          Computer Networks (CN) Mini-Project &bull; &ldquo;Network Load Balancing &amp; Server Selection Simulator&rdquo; &bull; Department of Computer Science &amp; Engineering
        </p>
      </footer>
    </div>
  );
}
