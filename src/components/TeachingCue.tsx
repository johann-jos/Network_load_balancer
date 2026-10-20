'use client';

import React from 'react';
import { ArrowRight, BookOpen, MessageCircle } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { TCP_PHASE_LABELS } from '../lib/simulationEngine';

const cueForPhase = (phase: string, serverName?: string) => {
  switch (phase) {
    case 'SYN_SENT':
      return {
        title: 'The client is asking to connect.',
        explanation: 'A SYN travels from the client to the load balancer’s shared address. The client does not choose a backend directly.',
        say: 'The client sends a connection request to the load balancer.',
      };
    case 'ROUTING':
      return {
        title: 'The load balancer is choosing one server.',
        explanation: 'It checks the current selection rule and the servers that are available for new connections.',
        say: 'The load balancer makes the server-selection decision here.',
      };
    case 'SYN_ACK':
      return {
        title: `${serverName ?? 'The chosen server'} replied.`,
        explanation: 'The selected server answered with SYN-ACK. The connection setup is moving forward.',
        say: 'The chosen server confirms that it can accept the connection.',
      };
    case 'ACK':
      return {
        title: 'The client confirmed the connection.',
        explanation: 'The final ACK completes the three-way handshake.',
        say: 'SYN, SYN-ACK, and ACK complete the TCP handshake.',
      };
    case 'ESTABLISHED':
      return {
        title: `${serverName ?? 'The server'} is carrying the connection.`,
        explanation: 'The connection is now established. Later data from this connection stays associated with this server.',
        say: 'The load balancer chose once, and this connection stays with that server.',
      };
    case 'FIN_WAIT':
      return {
        title: 'The connection is closing normally.',
        explanation: 'FIN says that one side has finished sending data. This is a graceful close, not a failure.',
        say: 'FIN starts the normal TCP closing process.',
      };
    case 'TIME_WAIT':
      return {
        title: 'TCP is waiting briefly before removing the connection.',
        explanation: 'TIME-WAIT helps prevent delayed old segments from being confused with a new connection.',
        say: 'TIME-WAIT is a short safety period after closing.',
      };
    case 'CLOSED':
      return {
        title: 'The connection is closed.',
        explanation: 'No active connection state remains. A future connection will go through the selection process again.',
        say: 'The life cycle is complete.',
      };
    case 'FAILED':
      return {
        title: 'The connection was refused.',
        explanation: 'No server was available to accept a new connection. Existing connections are a separate question.',
        say: 'If every server is unavailable, a new connection cannot be opened.',
      };
    default:
      return {
        title: 'Start with one connection.',
        explanation: 'Click “Create 1 connection” to watch the client, load balancer, and server act in order.',
        say: 'The load balancer is the front door to the server pool.',
      };
  }
};

export const TeachingCue: React.FC = () => {
  const { featuredRequest, demoState } = useSimulation();
  const cue = cueForPhase(featuredRequest?.phase ?? 'IDLE', featuredRequest?.selectedServerId ? `Server ${featuredRequest.selectedServerId.replace('server-', '')}` : undefined);
  const technicalPhase = featuredRequest?.phase ?? 'IDLE';

  return (
    <section className="lab-panel border-l-2 border-l-[#8ee8ff] p-4 sm:p-5" aria-labelledby="teaching-cue-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-[#10313d] text-[#8ee8ff]"><MessageCircle className="h-4 w-4" /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8ee8ff]">
              <span>{demoState.active ? `Walkthrough step ${demoState.currentStep}` : 'Simple explanation'}</span>
              <span className="text-[#52717c]">/</span>
              <span className="text-[#6f8994]">{TCP_PHASE_LABELS[technicalPhase]}</span>
            </div>
            <h2 id="teaching-cue-title" className="mt-2 font-headline text-xl tracking-[-0.04em] text-[#e8f1f5]">{cue.title}</h2>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-[#9cb4bd]">{cue.explanation}</p>
          </div>
        </div>
        <a href="#tcp-notes" className="inline-flex shrink-0 items-center gap-2 text-[11px] text-[#8ba5af] transition hover:text-[#8ee8ff]"><BookOpen className="h-3.5 w-3.5" /> key ideas <ArrowRight className="h-3.5 w-3.5" /></a>
      </div>
      <div className="mt-4 flex items-start gap-2 border-t border-[#b1ddea]/12 pt-3 text-xs leading-5 text-[#d7e7ec]"><span className="font-mono text-[10px] uppercase tracking-[0.13em] text-[#73e2ad]">Say this:</span><span>{cue.say}</span></div>
    </section>
  );
};
