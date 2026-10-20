'use client';

import React, { useEffect, useState } from 'react';
import { Activity, BookOpen, Play, RotateCcw, Waypoints } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export const Header: React.FC = () => {
  const { servers, demoState, startDemoMode, resetSimulation, tcpMetrics } = useSimulation();
  const [time, setTime] = useState('');
  const onlineCount = servers.filter((server) => server.status === 'ONLINE').length;
  const drainingCount = servers.filter((server) => server.status === 'DRAINING').length;

  useEffect(() => {
    const update = () => setTime(new Date().toTimeString().split(' ')[0]);
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-[#b1ddea]/15 bg-[#071019]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-4">
        <a href="#top" className="group flex items-center gap-3" aria-label="TCP connection lab home">
          <div className="relative flex h-9 w-9 items-center justify-center border border-[#8ee8ff]/40 bg-[#0a202a] text-[#8ee8ff] transition-transform group-hover:-rotate-6">
            <Waypoints className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#73e2ad]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline text-lg font-semibold tracking-[-0.045em] text-[#e8f1f5]">TCP/04</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6f8994]">connection lab</span>
            </div>
            <p className="mt-0.5 text-[10px] text-[#78919c]">See how a TCP load balancer chooses a server</p>
          </div>
        </a>

        <nav className="order-3 flex items-center gap-4 overflow-x-auto whitespace-nowrap text-[10px] font-mono uppercase tracking-[0.14em] text-[#708b96] lg:order-none" aria-label="Page sections">
          <a className="transition hover:text-[#8ee8ff]" href="#story">start</a>
          <a className="transition hover:text-[#8ee8ff]" href="#metrics">results</a>
          <a className="transition hover:text-[#8ee8ff]" href="#recorder">connection log</a>
          <a className="transition hover:text-[#8ee8ff]" href="#tcp-notes">key ideas</a>
        </nav>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.12em]">
          <div className="border border-[#b1ddea]/15 bg-[#0a151e] px-3 py-2 text-[#78919c]">
            <span className={onlineCount === 3 ? 'text-[#73e2ad]' : onlineCount > 0 ? 'text-[#f5c76f]' : 'text-[#ff7d79]'}>{onlineCount}/3 servers accepting connections</span>
            {drainingCount > 0 && <span className="ml-2 text-[#f5c76f]">{drainingCount} draining</span>}
          </div>
          <div className="border border-[#b1ddea]/15 bg-[#0a151e] px-3 py-2 text-[#78919c]">
            <span className="text-[#8ee8ff]">{tcpMetrics.totalConnections}</span> connections · <span className="text-[#73e2ad]">{tcpMetrics.closedConnections}</span> finished
          </div>
          <span className="hidden border-l border-[#b1ddea]/15 pl-3 text-[#5f7b86] xl:inline">{time} local</span>
          <button
            onClick={startDemoMode}
            disabled={demoState.active}
            className="inline-flex items-center gap-2 border border-[#8ee8ff]/35 bg-[#0f3542] px-3 py-2 text-[#b9f3ff] transition hover:bg-[#16495a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-3 w-3 fill-current" />
            {demoState.active ? 'walkthrough running' : 'start walkthrough'}
          </button>
          <button onClick={resetSimulation} className="inline-flex items-center gap-2 border border-[#b1ddea]/15 bg-[#0a151e] px-3 py-2 text-[#9bb0b9] transition hover:border-[#b1ddea]/35 hover:text-[#e8f1f5]">
            <RotateCcw className="h-3 w-3" /> start over
          </button>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1800px] items-center gap-4 border-t border-[#b1ddea]/10 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.15em] text-[#587480] sm:px-6">
        <span className="flex items-center gap-2 text-[#8ee8ff]"><Activity className="h-3 w-3" /> TCP connection simulator</span>
        <span className="hidden h-3 w-px bg-[#b1ddea]/15 sm:block" />
        <span className="hidden items-center gap-2 sm:flex"><BookOpen className="h-3 w-3" /> classroom demo based on TCP standards</span>
        <span className="ml-auto">client → load balancer :443 → server :8080</span>
      </div>
    </header>
  );
};
