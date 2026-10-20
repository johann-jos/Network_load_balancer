# TCP/04 — Connection Lab

> A visual, story-driven TCP load-balancing simulator for Computer Networks study.

TCP/04 turns one connection into a live narrative: a client opens a socket, the virtual IP chooses an eligible backend, the handshake completes, the stream becomes established, and the connection closes through FIN and TIME-WAIT. The surrounding telemetry shows what the routing decision changed in the cluster.

This is an educational browser simulation. It is deliberately not a production load balancer and it does not send packets onto the network.

## Why this project exists

The original idea — “show Round Robin, Least Connections, and Weighted Round Robin” — is useful but generic. The redesigned project makes the **TCP connection life cycle** the main character:

```text
client socket
    │
    ├── SYN ───────────────► virtual IP :443
    │                         │
    │                         ├── route one new flow
    │                         │
    │                         └──► selected target :8080
    │                              SYN-ACK → ACK
    │
    └──────────── ESTABLISHED / ordered byte stream ────────────┘
                              FIN → TIME-WAIT → CLOSED
```

The interface is organized like a **connection flight recorder** rather than a collection of disconnected cards. The user can watch the same flow in four places at once:

1. the topology stage,
2. the TCP phase timeline,
3. the connection inspector,
4. the event and flow recorder.

## What the simulator demonstrates

### TCP connection story

- Client ephemeral source ports in the dynamic range `49152–65535`.
- A virtual listener at `192.168.1.100:443`.
- Backend TCP listeners at `192.168.1.101–103:8080`.
- A visible three-way handshake: `SYN → SYN-ACK → ACK`.
- A visible `ESTABLISHED` phase for the active byte stream.
- Graceful teardown with `FIN` and `TIME-WAIT`.
- A transport-level refused/reset path when no target is accepting new connections.
- Sequence and acknowledgement numbers in the inspector to make TCP state concrete.

### TCP load-balancing policies

The load balancer selects a backend for a **new TCP connection/flow**. It does not independently reroute packets from an already-established stream.

| Policy | What it demonstrates |
| --- | --- |
| **Round Robin** | Select the next eligible target in sequence. |
| **Least Connections** | Select the eligible target with the fewest active TCP sockets. |
| **Weighted Round Robin** | Use smooth weighted selection to express relative capacity, initially `5:3:2`. |

### Failover and draining

Taking a target offline removes it from new-flow selection. If it already has open sockets, it enters **DRAINING** first so the existing flows can finish. Recovery returns the listener to the eligible pool. This makes the difference between “stop accepting new connections” and “destroy every current connection” visible.

### Operational telemetry

- Active TCP connections
- SYN backlog / half-open connection count
- TIME-WAIT count
- Per-target accepted connections
- Synthetic CPU pressure and service latency
- Average handshake time
- Recent observed close rate
- Target distribution and policy comparison

### Guided presentation mode

The **Play story** control walks through eight chapters:

1. Open the first TCP flow with Round Robin.
2. Switch to Least Connections while sockets are active.
3. Drain `ORBIT / 02`.
4. Fail over new SYNs to the remaining eligible targets.
5. Recover the listener.
6. Switch to Weighted Round Robin.
7. Stress the visual handshake queue.
8. Pause on the completed story for inspection.

The story uses the same actions as the manual controls; it is not a separate fake animation.

## Research-grounded design decisions

The simulator uses a simplified TCP proxy model, but its vocabulary follows the current TCP standard and implementation documentation.

### TCP is a reliable byte stream, not a request queue

RFC 9293 describes TCP as a reliable, in-order byte-stream service. The application data is carried in TCP segments, while the connection is identified by endpoint addresses and ports. That is why the interface uses **flow**, **socket**, **segment**, and **connection** deliberately instead of treating every packet as an independent request.

### The handshake is a state transition

The opening sequence is represented as:

```text
SYN       client → listener      synchronize initial sequence number
SYN-ACK   listener → client      acknowledge and offer the listener's sequence
ACK       client → listener      confirm the listener's sequence
```

The final ACK moves the story into `ESTABLISHED`. The simulation exposes the phase, flag, sequence number, and acknowledgement number so the visual state has a protocol reason behind it.

### A Layer 4 target is selected for the connection

Network load balancers generally use transport metadata such as protocol, source address, source port, destination address, and destination port. A target selection is associated with the TCP connection for its lifetime. This simulator presents that as a two-leg proxy story:

```text
client ↔ TCP gateway
TCP gateway ↔ selected backend
```

Production products may use different proxy, pass-through, source-preservation, hashing, or failover designs. TCP/04 is a visual teaching model, not a vendor implementation.

### Health and production traffic are separate concerns

The UI labels health as simulated. A real TCP health check can show that a port accepts a connection; it does not automatically prove that the application, database, or dependency behind the port is ready. Production systems add thresholds, timeouts, draining, slow start, and product-specific all-targets-unhealthy behavior.

### Backlog, active sockets, and TIME-WAIT are different things

The lab keeps these counters distinct:

- **SYN backlog / half-open:** the handshake has not completed.
- **Active sockets:** the connection is established and consuming a backend connection slot.
- **TIME-WAIT:** a closed flow is temporarily retained to protect against delayed segments.

Linux documents separate behavior for the established accept queue and the incomplete SYN queue. The exact queue sizes and overflow behavior are operating-system implementation details, so the values in this app are clearly synthetic.

## Project structure

```text
src/
├── app/
│   ├── globals.css              # design tokens, grid, route motion, reduced-motion rules
│   ├── layout.tsx               # metadata, fonts, global simulation provider
│   └── page.tsx                 # story-first page composition
├── components/
│   ├── StoryIntro.tsx           # narrative rail and current chapter
│   ├── NetworkTopology.tsx      # animated SVG TCP topology
│   ├── ConnectionInspector.tsx  # selected flow, socket header, route rationale
│   ├── TcpTimeline.tsx           # SYN → ESTABLISHED → FIN → TIME-WAIT rail
│   ├── SimulationControls.tsx   # policy, flow bursts, sustained traffic, story controls
│   ├── ServerCard.tsx            # listener health, capacity, sockets, weights
│   ├── MetricsDashboard.tsx     # charts for sockets, queues, CPU, outcomes
│   ├── EventLogPanel.tsx         # accessible TCP flight recorder
│   ├── AlgorithmExplanation.tsx # live candidate and score explanation
│   ├── AlgorithmComparison.tsx  # repeatable 100-flow policy experiment
│   ├── NetworkingConcepts.tsx   # researched teaching notes and source links
│   ├── Header.tsx
│   └── DemoBanner.tsx
├── context/
│   └── SimulationContext.tsx    # in-memory state machine, timers, story mode
├── lib/
│   └── simulationEngine.ts      # routing algorithms, metrics, benchmark model
└── types/
    └── simulation.ts            # TCP phases, flow records, metrics, logs
```

## Architecture

The app is a client-side Next.js App Router page. There is no API route or persistence layer.

```text
React components
       │ useSimulation()
       ▼
SimulationContext
  ├── connection lifecycle timers
  ├── server/client state
  ├── event recorder
  ├── story-mode orchestration
  └── derived TCP metrics
       │
       ▼
simulationEngine
  ├── RR / LC / smooth WRR selection
  ├── route decision explanation
  ├── synthetic server pressure
  └── benchmark workload
```

The context uses a generation token and tracked timers so reset/unmount does not allow stale connection callbacks to repopulate a new run. Metrics are sampled on a stable one-second interval instead of restarting every time the active-flow count changes.

## Running locally

### Requirements

- Node.js 18.18+ (Node.js 20+ recommended)
- npm

### Install and start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

### Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Type-check and produce the optimized production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Existing Next.js lint entry point; Next.js 15 may prompt for ESLint setup on a fresh checkout. |

## How to use the lab

1. Start with **Open one** and watch the highlighted flow travel from a client to the VIP and then to a backend.
2. Read the phase rail while the connection moves through `SYN`, `SYN-ACK`, `ACK`, and `ESTABLISHED`.
3. Open the **Connection trace** panel to inspect the source port, VIP, backend leg, flags, sequence values, and routing rationale.
4. Open several flows, then switch between RR, LC, and WRR to see the decision evidence change.
5. Take a target offline while flows are open. It becomes `DRAINING` when existing sockets remain and is excluded from new selection.
6. Run sustained traffic at `1/s`, `5/s`, `10/s`, or `20/s` to populate the telemetry charts.
7. Use the **TCP flows** tab in the flight recorder to select any active or completed flow.
8. Run the controlled 100-flow experiment to compare policy distribution.
9. Use **Play story** for the guided eight-chapter walkthrough.

## Limitations and model boundaries

This project does **not**:

- bind a real TCP socket;
- send or receive live network traffic;
- implement a kernel TCP state machine;
- perform real health probes;
- model retransmission, congestion control, packet loss, MSS negotiation, window scaling, SACK, or real TCP timers;
- reproduce a specific AWS, NGINX, Linux, or other vendor's failover policy;
- persist state after a page refresh;
- claim that synthetic latency equals network RTT;
- route application requests inside an established byte stream.

The simulated `responseTimeMs` is synthetic service delay. The UI keeps it separate from the handshake phase and connection state, but it is not a packet capture measurement.

The failover story uses a safe educational default: stop new handshakes and allow existing connections to drain. Real systems can instead reset connections, time them out, or fail open depending on configuration and product semantics.

## References

These are the primary sources used to revise the simulator's terminology, lifecycle story, and research notes. Links are also available in the application under **Field notes / sources**.

1. **Eddy, W. (Ed.). RFC 9293: Transmission Control Protocol (TCP). IETF, August 2022.**
   - TCP's reliable in-order byte stream, endpoint ports, control flags, connection states, handshake, reset, FIN, sequence numbers, and TIME-WAIT.
   - <https://www.rfc-editor.org/rfc/rfc9293.html>

2. **Eddy, W. RFC 4987: TCP SYN Flooding Attacks and Common Mitigations. IETF, August 2007.**
   - Half-open connections, SYN-RECEIVED state, backlog pressure, queue exhaustion, SYN caches, SYN cookies, and the distinction between new connection establishment and existing connections.
   - <https://www.rfc-editor.org/rfc/rfc4987.html>

3. **Amazon Web Services. What is a Network Load Balancer?**
   - Layer 4 listeners, target groups, health checks, flow hashing, and the principle that an individual TCP connection is routed to one target for its lifetime.
   - <https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html>

4. **F5 NGINX. TCP load balancing and stream proxy documentation.**
   - Stream proxying, upstream groups, Round Robin, Least Connections, weights, maximum connections, and health-check integration.
   - <https://docs.nginx.com/nginx/admin-guide/load-balancer/tcp-udp-load-balancer/>

5. **Linux man-pages project. `listen(2)`.**
   - Passive TCP sockets, `listen()` backlog, established sockets waiting for `accept()`, and the Linux distinction between the accept queue and incomplete SYN queue.
   - <https://man7.org/linux/man-pages/man2/listen.2.html>

These sources are educational references, not copied implementation code. Vendor behavior differs; the simulator labels its own assumptions where the sources describe product- or OS-specific behavior.

## Verification checklist

The following checks describe the intended observable behavior:

| Scenario | Expected result |
| --- | --- |
| Open one TCP flow | The selected flow appears in the topology and progresses through SYN → SYN-ACK → ACK → ESTABLISHED → FIN → TIME-WAIT → CLOSED. |
| Open 10/50/100 flows | The flight recorder, target distribution, and telemetry update while keeping transport and application concerns separate. |
| Switch to Least Connections | The route rationale references active socket counts. |
| Switch to Weighted Round Robin | The server weight controls appear and the benchmark shows the configured long-run ratio. |
| Drain a target | New flows avoid the target; existing flows are not silently labeled as successful because the target was toggled. |
| Take every target offline | New SYNs are recorded as refused/failed at the TCP boundary. |
| Recover a target | The listener returns to the eligible pool. |
| Reset during a burst | Old timers do not repopulate the new run with stale flows or logs. |
| Run guided story | The eight chapters use the intended routing policy for each chapter and can be paused, advanced, replayed, or exited. |
| Reduced motion | CSS motion is disabled while the phase and state information remain available. |

There is currently no dedicated test runner in the repository. `npm run build` is the primary automated check; manual interaction with the checklist above is the visual/integration verification layer.

## Viva prompts

### Why does the load balancer choose a server once per TCP connection?

Because a TCP connection is an ordered, stateful byte stream. Moving later segments from the same connection to a different backend would break the transport state unless the architecture has a separate state-sharing or proxy mechanism. A Layer 4 load balancer therefore maintains flow affinity for the connection.

### Why are FIN and RST different?

FIN begins an orderly close: the sender has no more data in that direction. RST aborts or rejects the connection immediately. The simulator uses FIN for the normal story and a refused/reset outcome when there is no eligible listener.

### What does Least Connections miss?

It sees the number of active connections, not their CPU cost, bandwidth, queue depth, or request complexity. It is useful when connection duration varies, but it is still an approximation of workload.

### Why keep TIME-WAIT in the story?

TCP retains TIME-WAIT long enough to prevent delayed segments from an earlier connection incarnation from being confused with a new connection using the same endpoint pair. It is not an active application socket, but it is useful operational evidence.

### Does a TCP health check prove the service is healthy?

No. It can prove that a TCP listener accepts a connection. A production application often needs a protocol-aware or dependency-aware readiness check in addition to transport reachability.

## Design direction

The visual system is intentionally a dark technical field guide rather than a generic “neon NOC” dashboard:

- one route accent (`#8ee8ff`) keeps the wire legible;
- green, amber, and red are reserved for transport/health meaning;
- Space Grotesk provides the narrative hierarchy;
- JetBrains Mono is reserved for addresses, ports, flags, and measurements;
- animation is state-driven: segments move because a phase changed, route lines pulse because a path is live, and charts move because the simulation sampled new telemetry;
- `prefers-reduced-motion` removes movement without removing the story;
- the primary stage comes before the data panels so the connection journey is understandable before the numbers become dense.

## License and academic context

This repository is an educational third-year Computer Networks mini-project. The code is provided for coursework, demonstration, and further experimentation. Confirm the licensing and attribution requirements of any future assets or third-party material before redistribution.
