'use client';

import React, { useMemo, useState } from 'react';
import { ArrowRight, CircleDot, FileSearch, Search, Terminal, Trash2, X } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { NetworkRequest } from '../types/simulation';

export const EventLogPanel: React.FC = () => {
  const { eventLogs, requestHistory, activeRequests, clearLogs, selectedRequest, setSelectedRequest } = useSimulation();
  const [tab, setTab] = useState<'EVENTS' | 'FLOWS'>('EVENTS');
  const [searchTerm, setSearchTerm] = useState('');
  const needle = searchTerm.toLowerCase();
  const filteredLogs = useMemo(() => eventLogs.filter((entry) => entry.message.toLowerCase().includes(needle)), [eventLogs, needle]);
  const allFlows = [...activeRequests, ...requestHistory];
  const filteredFlows = useMemo(() => allFlows.filter((flow) => `${flow.requestId} ${flow.clientIp} ${flow.selectedServerIp ?? ''} ${flow.currentFlag} ${flow.phase}`.toLowerCase().includes(needle)), [allFlows, needle]);

  return (
    <section id="recorder" className="lab-panel flex min-h-[460px] flex-col p-5" aria-labelledby="recorder-title">
      <div className="flex flex-col gap-4 border-b border-[#b1ddea]/15 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8ee8ff]"><Terminal className="h-3.5 w-3.5" /> Flight recorder</div>
          <h2 id="recorder-title" className="mt-2 font-headline text-xl tracking-[-0.04em] text-[#e8f1f5]">Every flag has a timestamp.</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="relative block">
            <span className="sr-only">Search the TCP flight recorder</span>
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#597682]" />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="search flow / flag" className="w-40 border border-[#b1ddea]/15 bg-[#071019] py-2 pl-8 pr-2 font-mono text-[10px] text-[#dbe9ee] placeholder:text-[#526e79] focus:border-[#8ee8ff]/55 focus:outline-none sm:w-48" />
          </label>
          <button onClick={clearLogs} title="Clear recorder" className="border border-[#b1ddea]/15 bg-[#0a151e] p-2 text-[#78929d] transition hover:border-[#ff7d79]/35 hover:text-[#ffaaa0]"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 border-b border-[#b1ddea]/12 pb-2">
        <button onClick={() => setTab('EVENTS')} aria-pressed={tab === 'EVENTS'} className={`px-3 py-2 font-mono text-[10px] uppercase tracking-[0.13em] transition ${tab === 'EVENTS' ? 'bg-[#8ee8ff] text-[#071019]' : 'text-[#78929d] hover:text-[#dbe9ee]'}`}>system events · {eventLogs.length}</button>
        <button onClick={() => setTab('FLOWS')} aria-pressed={tab === 'FLOWS'} className={`px-3 py-2 font-mono text-[10px] uppercase tracking-[0.13em] transition ${tab === 'FLOWS' ? 'bg-[#8ee8ff] text-[#071019]' : 'text-[#78929d] hover:text-[#dbe9ee]'}`}>TCP flows · {allFlows.length}</button>
      </div>

      <div className="quiet-scrollbar mt-3 max-h-[355px] flex-1 overflow-y-auto bg-[#050c12] p-2">
        {tab === 'EVENTS' ? (
          filteredLogs.length ? filteredLogs.map((entry) => (
            <div key={entry.id} className="flex gap-3 border-b border-[#b1ddea]/8 px-2 py-2.5 font-mono text-[10px] leading-5 last:border-0">
              <span className="shrink-0 text-[#506d78]">{entry.timestamp}</span>
              <span className={entry.type === 'ERROR' ? 'text-[#ff7d79]' : entry.type === 'WARNING' ? 'text-[#f5c76f]' : entry.type === 'SUCCESS' ? 'text-[#73e2ad]' : 'text-[#9eb8c2]'}>{entry.message}</span>
              {entry.flag && <span className="ml-auto shrink-0 border border-[#b1ddea]/15 px-1.5 py-0.5 text-[9px] text-[#8ee8ff]">{entry.flag}</span>}
            </div>
          )) : <EmptyState label="No matching events." />
        ) : filteredFlows.length ? filteredFlows.map((flow) => <FlowRow key={flow.id} flow={flow} onSelect={setSelectedRequest} />) : <EmptyState label="No matching TCP flows." />}
      </div>

      {selectedRequest && (
        <div className="mt-3 flex items-center justify-between border border-[#8ee8ff]/20 bg-[#091722] px-3 py-2 text-[10px] text-[#8ba5af]">
          <span className="flex items-center gap-2"><FileSearch className="h-3.5 w-3.5 text-[#8ee8ff]" /> Inspecting flow #{selectedRequest.requestId} in the trace panel.</span>
          <button onClick={() => setSelectedRequest(null)} className="text-[#6f8994] hover:text-[#e8f1f5]" aria-label="Close flow selection"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}
    </section>
  );
};

const FlowRow = ({ flow, onSelect }: { flow: NetworkRequest; onSelect: (flow: NetworkRequest) => void }) => (
  <button onClick={() => onSelect(flow)} className="group flex w-full items-center justify-between gap-3 border-b border-[#b1ddea]/8 px-2 py-3 text-left transition hover:bg-[#0b202b] last:border-0">
    <span className="flex min-w-0 items-center gap-2 font-mono text-[10px]">
      <span className="text-[#8ee8ff]">#{flow.requestId}</span>
      <span className="border border-[#8ee8ff]/20 bg-[#0b202b] px-1.5 py-0.5 text-[#8ee8ff]">{flow.currentFlag}</span>
      <span className="truncate text-[#76919c]">{flow.clientIp}:{flow.sourcePort}</span>
      <ArrowRight className="h-3 w-3 shrink-0 text-[#476572]" />
      <span className="hidden truncate text-[#73e2ad] sm:inline">{flow.selectedServerIp ?? 'no target'}</span>
    </span>
    <span className="flex shrink-0 items-center gap-2 font-mono text-[9px] uppercase tracking-[0.1em]">
      <span className={flow.status === 'COMPLETED' ? 'text-[#73e2ad]' : flow.status === 'FAILED' ? 'text-[#ff7d79]' : 'text-[#f5c76f]'}>{flow.phase.replace('_', ' ')}</span>
      <CircleDot className="h-3 w-3 text-[#597682] transition group-hover:text-[#8ee8ff]" />
    </span>
  </button>
);

const EmptyState = ({ label }: { label: string }) => <div className="flex h-32 items-center justify-center font-mono text-xs text-[#5c7884]">{label}</div>;
