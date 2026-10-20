'use client';

import React from 'react';
import { GraduationCap, Network, Cpu, ShieldCheck, Zap, Activity } from 'lucide-react';

export const NetworkingConcepts: React.FC = () => {
  const concepts = [
    {
      title: '1. Client-Server Architecture',
      tag: 'OSI Model',
      desc: 'Centralized computing model where client endpoints initiate service requests (HTTP/HTTPS) and specialized backend server nodes process and return responses.',
    },
    {
      title: '2. IP Addressing (IPv4)',
      tag: 'Network Layer',
      desc: '32-bit logical network layer addresses (e.g., 192.168.1.100) used by routers and load balancers for routing packets across local networks and internetworks.',
    },
    {
      title: '3. Port Numbers',
      tag: 'Transport Layer',
      desc: '16-bit transport layer socket identifiers (e.g., Port 8080, Port 443) that multiplex network traffic to specific process endpoints on a host.',
    },
    {
      title: '4. TCP vs UDP Protocol',
      tag: 'Transport Layer',
      desc: 'TCP provides reliable connection-oriented transport with 3-way handshakes and flow control, whereas UDP offers connectionless, low-latency datagram transmission.',
    },
    {
      title: '5. Multiplexing & Demultiplexing',
      tag: 'Socket API',
      desc: 'Gathering data from multiple sockets with port headers at source (multiplexing) and inspecting headers at destination to deliver to correct sockets (demultiplexing).',
    },
    {
      title: '6. Load Distribution',
      tag: 'Routing Algorithm',
      desc: 'Algorithmic allocation of network throughput across multiple servers to prevent single-node CPU saturation and maximize total cluster capacity.',
    },
    {
      title: '7. Network Availability & Fault Tolerance',
      tag: 'High Availability',
      desc: 'Design property ensuring continuous system operation despite individual node crashes by dynamically removing dead servers from routing pools.',
    },
    {
      title: '8. Server Failure & Recovery',
      tag: 'Health Check Probe',
      desc: 'Active health-check monitoring that reroutes incoming traffic away from failed nodes and restores traffic flow automatically upon server node recovery.',
    },
    {
      title: '9. Quality of Service (QoS) & Response Latency',
      tag: 'Performance Metric',
      desc: 'Performance metric measuring request round-trip time (RTT) and processing delay to ensure predictable user experience under heavy traffic load.',
    },
  ];

  return (
    <div className="glass-panel border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center space-x-2.5 border-b border-slate-800/80 pb-3">
        <div className="p-1.5 bg-cyan-950/80 border border-cyan-500/40 rounded-lg text-cyan-400">
          <GraduationCap className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Networking Concepts Demonstrated (Viva Voce Reference Guide)
          </h2>
          <p className="text-[11px] text-slate-400">Key Computer Networks Theory for Engineering Defense</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {concepts.map((item, index) => (
          <div
            key={index}
            className="bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/40 p-4 rounded-xl transition-all glass-panel-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-bold text-cyan-300 font-mono">{item.title}</h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {item.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
