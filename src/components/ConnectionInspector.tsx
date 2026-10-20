'use client';

import React from 'react';
import { Activity, ArrowRight, Check, Copy, GitBranch, Hash, Radio, RotateCcw, Timer, X } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { ALGORITHM_LABELS, TCP_PHASE_LABELS } from '../lib/simulationEngine';
import { NetworkRequest } from '../types/simulation';

const phaseDescription: Record<string, string> = {
  SYN_SENT: 'The client is asking the load balancer to open a connection.',
  ROUTING: 'The load balancer is choosing one available server.',
  SYN_ACK: 'The chosen server has replied to the connection request.',
  ACK: 'The client is confirming the three-way handshake.',
  ESTABLISHED: 'The connection is active and stays associated with this server.',
  FIN_WAIT: 'One side sent FIN. The connection is closing normally.',
  TIME_WAIT: 'TCP waits briefly so delayed old messages cannot cause confusion.',
  CLOSED: 'No active connection state remains.',
  FAILED: 'No server was available to accept a new connection.',
};

const phaseTone = (phase: string) => {
  if (phase === 'FAILED' || phase === 'RST') return 'text-[#ff7d79]';
  if (phase === 'ESTABLISHED') return 'text-[#73e2ad]';
  if (phase === 'TIME_WAIT' || phase === 'FIN_WAIT') return 'text-[#f5c76f]';
  return 'text-[#8ee8ff]';
};

const statusLabels: Record<string, string> = {
  CONNECTING: 'setting up',
  ESTABLISHED: 'connected',
  CLOSING: 'closing',
  COMPLETED: 'closed normally',
  FAILED: 'refused',
  RESET: 'reset',
};

const Detail = ({ label, value, tone = 'text-[#dbe9ee]' }: { label: string; value: React.ReactNode; tone?: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-[#b1ddea]/10 py-2 last:border-0">
    <span className="text-[10px] uppercase tracking-[0.13em] text-[#6f8994]">{label}</span>
    <span className={`text-right font-mono text-[11px] ${tone}`}>{value}</span>
  </div>
);

export const ConnectionInspector: React.FC = () => {
  const { featuredRequest, selectedRequest, setSelectedRequest, lastRouteDecision, algorithm } = useSimulation();
  const request: NetworkRequest | null = selectedRequest ?? featuredRequest;
  const decision = request && lastRouteDecision?.requestId === request.requestId ? lastRouteDecision : null;

  return (
    <aside className="lab-panel flex min-h-[430px] flex-col p-5">
      <div className="flex items-start justify-between border-b border-[#b1ddea]/15 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8ee8ff]">
            <Activity className="h-3.5 w-3.5" />
            Connection trace
          </div>
          <h2 className="mt-2 font-headline text-xl tracking-[-0.04em] text-[#e8f1f5]">Connection details</h2>
        </div>
        {selectedRequest && (
          <button onClick={() => setSelectedRequest(null)} className="text-[#6f8994] transition hover:text-[#e8f1f5]" aria-label="Show live connection">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {request ? (
        <div className="flex flex-1 flex-col">
          <div className="py-5">
            <div className="flex items-end justify-between gap-3">
              <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6f8994]">Connection</div>
                <div className="mt-1 font-mono text-3xl tracking-[-0.06em] text-[#e8f1f5]">#{request.requestId}</div>
              </div>
              <div className={`text-right font-mono text-xs uppercase tracking-[0.12em] ${phaseTone(request.phase)}`}><span className="block">{TCP_PHASE_LABELS[request.phase]}</span><span className="mt-1 block text-[9px] text-[#6f8994]">{request.phase.replace('_', ' ')}</span></div>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#90a8b2]">{phaseDescription[request.phase] ?? phaseDescription.FAILED}</p>
          </div>

          <div className="border-y border-[#b1ddea]/12 bg-[#07131d] px-3">
            <Detail label="client address + port" value={`${request.clientIp}:${request.sourcePort}`} tone="text-[#8ee8ff]" />
            <Detail label="load-balancer address" value={`${request.destinationIp}:${request.destinationPort}`} />
            <Detail label="TCP message" value={request.currentFlag} tone={phaseTone(request.phase)} />
            <Detail label="sequence + acknowledgement" value={`${request.sequenceNumber} / ${request.acknowledgementNumber}`} />
            <Detail label="chosen server" value={request.selectedServerIp ?? 'not chosen yet'} tone={request.selectedServerIp ? 'text-[#73e2ad]' : 'text-[#f5c76f]'} />
          </div>

          <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-[#6f8994]">
            <span className="h-px flex-1 bg-[#b1ddea]/15" />
            <ArrowRight className="h-3 w-3 text-[#8ee8ff]" />
            CLIENT → LOAD BALANCER → SERVER
            <span className="h-px flex-1 bg-[#b1ddea]/15" />
          </div>

          <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#6f8994]">
              <GitBranch className="h-3.5 w-3.5 text-[#8ee8ff]" />
                Why this server?
            </div>
            <div className="border border-[#8ee8ff]/20 bg-[#081722] p-3 text-xs leading-5 text-[#d4e5eb]">
              {decision ? (
                <>
                  <div><span className="text-[#6f8994]">Selection rule: </span><span className="text-[#8ee8ff]">{ALGORITHM_LABELS[decision.algorithm]}</span></div>
                  <div className="mt-1"><span className="text-[#6f8994]">Chosen server: </span><span className="font-mono text-[#73e2ad]">{request.selectedServerIp ?? 'none'}</span></div>
                  <div className="mt-1"><span className="text-[#6f8994]">Why: </span>{decision.rationale}.</div>
                </>
              ) : (
                <>The current rule is <span className="text-[#8ee8ff]">{ALGORITHM_LABELS[algorithm]}</span>. Create a connection to see why a server was chosen.</>
              )}
            </div>
          </div>

          <div className="mt-auto grid grid-cols-3 gap-2 pt-5 font-mono text-[10px]">
            <div className="border border-[#b1ddea]/12 bg-[#0a151e] p-2.5">
              <Timer className="mb-1 h-3.5 w-3.5 text-[#f5c76f]" />
              <span className="text-[#6f8994]">setup time</span>
              <div className="mt-1 text-[#f5c76f]">{request.handshakeMs || '—'} ms</div>
            </div>
            <div className="border border-[#b1ddea]/12 bg-[#0a151e] p-2.5">
              <Hash className="mb-1 h-3.5 w-3.5 text-[#8ee8ff]" />
              <span className="text-[#6f8994]">TCP message</span>
              <div className="mt-1 text-[#8ee8ff]">{request.currentFlag}</div>
            </div>
            <div className="border border-[#b1ddea]/12 bg-[#0a151e] p-2.5">
              {request.status === 'COMPLETED' ? <Check className="mb-1 h-3.5 w-3.5 text-[#73e2ad]" /> : <RotateCcw className="mb-1 h-3.5 w-3.5 text-[#f5c76f]" />}
              <span className="text-[#6f8994]">result</span>
              <div className={`mt-1 ${request.status === 'COMPLETED' ? 'text-[#73e2ad]' : 'text-[#f5c76f]'}`}>{statusLabels[request.status] ?? request.status}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Radio className="h-7 w-7 text-[#8ee8ff] opacity-70" />
          <p className="mt-4 font-headline text-lg text-[#dbe9ee]">No connection yet.</p>
          <p className="mt-2 max-w-[24ch] text-xs leading-5 text-[#78919c]">Click “Create 1 connection” to see the request, server choice, setup, and close.</p>
          <Copy className="mt-6 h-4 w-4 text-[#46616d]" />
        </div>
      )}
    </aside>
  );
};
