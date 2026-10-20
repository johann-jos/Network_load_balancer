'use client';

import React from 'react';
import { ArrowUpRight, BookOpen, CheckCircle2, CircleDot, ExternalLink, ShieldAlert, Wifi } from 'lucide-react';

const lessons = [
  { number: '01', title: 'A connection has two addresses', text: 'A TCP connection uses a client address and port plus a server address and port. The temporary client port lets several connections exist at the same time.', icon: CircleDot },
  { number: '02', title: 'SYN starts the connection', text: 'The client sends SYN to ask to connect. The server replies with SYN-ACK, and the client confirms with ACK.', icon: Wifi },
  { number: '03', title: 'The load balancer chooses once', text: 'The load balancer chooses one available server when the connection starts. It does not move later messages from that connection to random servers.', icon: ArrowUpRight },
  { number: '04', title: 'Connected means data can flow', text: 'After the final ACK, the connection is established and can carry an ordered stream of data.', icon: CheckCircle2 },
  { number: '05', title: 'A server can drain', text: 'A draining server receives no new connections, but connections that already exist can finish.', icon: BookOpen },
  { number: '06', title: 'New connections can fail over', text: 'If a server is removed, new connections avoid it and use another online server.', icon: ShieldAlert },
  { number: '07', title: 'FIN closes normally', text: 'FIN starts a normal close. TIME-WAIT is a short safety wait before the connection disappears completely.', icon: CircleDot },
  { number: '08', title: 'This is a classroom model', text: 'The app uses simulated timing and status values. It sends no real packets and is not a production load balancer.', icon: CheckCircle2 },
];

const references = [
  ['RFC 9293', 'Transmission Control Protocol (TCP)', 'https://www.rfc-editor.org/rfc/rfc9293.html'],
  ['RFC 4987', 'TCP SYN Flooding Attacks and Common Mitigations', 'https://www.rfc-editor.org/rfc/rfc4987.html'],
  ['AWS', 'Network Load Balancer overview', 'https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html'],
  ['NGINX', 'TCP load balancing and stream proxy guide', 'https://docs.nginx.com/nginx/admin-guide/load-balancer/tcp-udp-load-balancer/'],
  ['Linux', 'listen(2): backlog and pending connections', 'https://man7.org/linux/man-pages/man2/listen.2.html'],
];

export const NetworkingConcepts: React.FC = () => (
  <section id="tcp-notes" className="space-y-5" aria-labelledby="notes-title">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8ee8ff]"><BookOpen className="h-3.5 w-3.5" /> Key ideas and sources</div>
        <h2 id="notes-title" className="mt-2 font-headline text-2xl tracking-[-0.05em] text-[#e8f1f5]">What to remember.</h2>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-[#8099a4]">Run one connection first. Then use these cards for the explanation and the links for deeper study.</p>
      </div>
      <a href="https://www.rfc-editor.org/rfc/rfc9293.html" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 self-start border border-[#b1ddea]/15 bg-[#0a151e] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8ee8ff] transition hover:border-[#8ee8ff]/45 sm:self-auto">open TCP reference <ExternalLink className="h-3 w-3" /></a>
    </div>

    <div className="grid gap-px border border-[#b1ddea]/12 bg-[#b1ddea]/12 md:grid-cols-2 xl:grid-cols-4">
      {lessons.map((lesson) => {
        const Icon = lesson.icon;
        return (
          <article key={lesson.number} className="bg-[#0a151e] p-4 transition hover:bg-[#0d202b]">
            <div className="flex items-center justify-between"><span className="font-mono text-[10px] text-[#587680]">{lesson.number}</span><Icon className="h-4 w-4 text-[#8ee8ff]" /></div>
            <h3 className="mt-6 font-headline text-base tracking-[-0.03em] text-[#dcebef]">{lesson.title}</h3>
            <p className="mt-2 text-[11px] leading-5 text-[#819aa5]">{lesson.text}</p>
          </article>
        );
      })}
    </div>

    <div className="lab-panel p-5">
      <div className="flex items-center gap-2 border-b border-[#b1ddea]/15 pb-3 text-[10px] font-mono uppercase tracking-[0.18em] text-[#8ee8ff]"><ExternalLink className="h-3.5 w-3.5" /> For teachers and deeper study</div>
      <div className="mt-2 divide-y divide-[#b1ddea]/10">
        {references.map(([source, title, url]) => (
          <a key={url} href={url} target="_blank" rel="noreferrer" className="group flex flex-col gap-1 py-3 transition sm:flex-row sm:items-center sm:gap-4">
            <span className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-[#73e2ad]">{source}</span>
            <span className="flex-1 text-xs text-[#b9cbd1] group-hover:text-[#8ee8ff]">{title}</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#587580] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#8ee8ff]" />
          </a>
        ))}
      </div>
      <p className="mt-4 border-l-2 border-[#f5c76f]/55 bg-[#211a10] px-3 py-2 text-[10px] leading-5 text-[#bda16a]">Important limitation: this browser app models a TCP proxy story. It does not open real sockets, send real packets, or reproduce one vendor’s exact failover behavior.</p>
    </div>
  </section>
);
