'use client';

import React from 'react';
import { ArrowUpRight, BookOpen, CheckCircle2, CircleDot, ExternalLink, ShieldAlert, Wifi } from 'lucide-react';

const lessons = [
  { number: '01', title: 'Sockets identify the flow', text: 'A TCP connection is identified by the endpoint pair: source IP/port and destination IP/port. The client’s ephemeral port makes concurrent flows distinct.', icon: CircleDot },
  { number: '02', title: 'SYN reserves attention', text: 'The initial SYN moves an endpoint from CLOSED toward SYN-SENT. A listener may hold incomplete state in SYN-RECEIVED while it waits for the final ACK.', icon: Wifi },
  { number: '03', title: 'The VIP chooses a target', text: 'A Layer 4 load balancer uses transport metadata to select a backend for the life of a TCP connection. It is not choosing each packet independently.', icon: ArrowUpRight },
  { number: '04', title: 'SYN-ACK and ACK establish', text: 'The three-way handshake synchronizes sequence numbers. Once the final ACK arrives, the connection is ESTABLISHED and can carry an ordered byte stream.', icon: CheckCircle2 },
  { number: '05', title: 'Backlog is not active load', text: 'Half-open SYN state, established sockets waiting for accept, and active application connections are different queues. This lab keeps them visually separate.', icon: BookOpen },
  { number: '06', title: 'Failover protects new flows', text: 'A target taken out of service stops receiving new handshakes. Existing connections can drain, reset, or time out depending on the real product policy.', icon: ShieldAlert },
  { number: '07', title: 'FIN is not RST', text: 'FIN starts a graceful close. RST aborts a connection. TIME-WAIT prevents delayed segments from colliding with a new incarnation of the same socket pair.', icon: CircleDot },
  { number: '08', title: 'Health checks are separate', text: 'A TCP health check proves that a port accepts a connection; it does not prove that the application behind that port is healthy.', icon: CheckCircle2 },
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
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8ee8ff]"><BookOpen className="h-3.5 w-3.5" /> Field notes / sources</div>
        <h2 id="notes-title" className="mt-2 font-headline text-2xl tracking-[-0.05em] text-[#e8f1f5]">What the animation is trying to teach.</h2>
        <p className="mt-1 max-w-2xl text-xs leading-5 text-[#8099a4]">The lab is intentionally simplified, but the vocabulary and boundaries are anchored in standards and implementation documentation.</p>
      </div>
      <a href="https://www.rfc-editor.org/rfc/rfc9293.html" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 self-start border border-[#b1ddea]/15 bg-[#0a151e] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8ee8ff] transition hover:border-[#8ee8ff]/45 sm:self-auto">open TCP standard <ExternalLink className="h-3 w-3" /></a>
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
      <div className="flex items-center gap-2 border-b border-[#b1ddea]/15 pb-3 text-[10px] font-mono uppercase tracking-[0.18em] text-[#8ee8ff]"><ExternalLink className="h-3.5 w-3.5" /> Reading list used for this simulator</div>
      <div className="mt-2 divide-y divide-[#b1ddea]/10">
        {references.map(([source, title, url]) => (
          <a key={url} href={url} target="_blank" rel="noreferrer" className="group flex flex-col gap-1 py-3 transition sm:flex-row sm:items-center sm:gap-4">
            <span className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-[#73e2ad]">{source}</span>
            <span className="flex-1 text-xs text-[#b9cbd1] group-hover:text-[#8ee8ff]">{title}</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#587580] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#8ee8ff]" />
          </a>
        ))}
      </div>
      <p className="mt-4 border-l-2 border-[#f5c76f]/55 bg-[#211a10] px-3 py-2 text-[10px] leading-5 text-[#bda16a]">Research boundary: this browser app models a TCP proxy story; it does not bind sockets, implement a kernel TCP state machine, or claim to reproduce any vendor’s production failover semantics.</p>
    </div>
  </section>
);
