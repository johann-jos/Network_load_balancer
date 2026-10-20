# TCP/04 — Connection Lab

> A visual, story-driven TCP load-balancing simulator for Computer Networks study.

TCP/04 turns one connection into a live lesson: a client asks to connect, the virtual IP chooses an online server, the handshake completes, the connection carries data, and it closes through FIN and TIME-WAIT. The surrounding results show what the selection decision changed in the server pool.

This is an educational browser simulation. It is deliberately not a production load balancer and it does not send packets onto the network.

## In one sentence

The client connects to one shared address, the load balancer chooses one online server, and that TCP connection stays with the chosen server until it closes.

## The simple mental model

Think of the load balancer as the **front desk** of a small server room:

```text
Client
  │  “I want to connect.”
  ▼
Load balancer / shared address (VIP)
  │  “Server 2 is available; use that one.”
  ▼
One backend server
```

The connection then follows this simple life cycle:

```text
SYN → SYN-ACK → ACK → CONNECTED → FIN → TIME-WAIT → CLOSED
```

### What to say in class

1. The client sends a TCP connection request to the load balancer’s shared address.
2. The load balancer checks the online servers and chooses one using a selection rule.
3. TCP completes its three-way handshake: SYN, SYN-ACK, and ACK.
4. The connection is now established and stays with the chosen server.
5. If a server is removed, new connections avoid it while existing connections finish.
6. FIN starts a normal close, and TIME-WAIT is a short safety period before the connection disappears.

That is the whole project in six sentences.

## 30-second viva answer

> This project is a browser-based simulation of a TCP load balancer. A client connects to a virtual IP instead of choosing a backend server directly. When a new TCP connection arrives, the load balancer chooses one online server using Round Robin, Least Connections, or Weighted Round Robin. The connection is opened with SYN, SYN-ACK, and ACK, remains associated with that server while data is transferred, and closes with FIN and TIME-WAIT. If a server is taken offline, new connections are sent to other online servers while existing connections are allowed to finish. The project uses simulated values and does not send real network packets.

## Easiest classroom demonstration

1. Click **Start walkthrough**.
2. Use **Next step** until the client sends one connection request.
3. Point to the highlighted path: **Client → Load balancer → Server**.
4. Explain the timeline: **SYN → SYN-ACK → ACK → Connected**.
5. Create a second connection and explain that each new connection gets its own server-selection decision.
6. Remove Server 2 from new connections. Explain that current connections can finish, but new connections avoid Server 2.
7. Create one more connection to show failover.
8. Bring Server 2 online again and point out FIN, TIME-WAIT, and CLOSED.

For the first explanation, use **Take turns (Round Robin)**. Explain the other two rules only after the teacher understands the basic connection story.

## Key terms in plain English

| Term | Plain meaning |
| --- | --- |
| Shared address / VIP | The address clients use to reach the load balancer. |
| Backend / server | A server that can receive a connection. |
| SYN | The client’s request to start a TCP connection. |
| SYN-ACK | The server’s reply to that request. |
| ACK | The client’s confirmation. |
| FIN | A normal request to close the connection. |
| RST | An immediate refusal or abort. |
| Draining | No new connections are sent to the server, but current ones can finish. |
| TIME-WAIT | A short safety wait after closing. |
| Simulated delay | A teaching value, not a measurement from a real server. |

## Why this project exists

The original idea — “show Round Robin, Least Connections, and Weighted Round Robin” — is useful but generic. The project now makes the **TCP connection life cycle** the main lesson:

```text
client socket
    │
    ├── SYN ───────────────► virtual IP :443
    │                         │
    │                         ├── choose one server for this connection
    │                         │
    │                         └──► selected target :8080
    │                              SYN-ACK → ACK
    │
    └──────────── ESTABLISHED / ordered byte stream ────────────┘
                              FIN → TIME-WAIT → CLOSED
```

The interface is organized as a guided classroom story. The user can watch the same connection in four places at once:

1. the topology stage,
2. the TCP phase timeline,
3. the connection inspector,
4. the connection log.

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
| **Round Robin** | Take turns: choose the next available server. |
| **Least Connections** | Choose the available server with the fewest active connections. |
| **Weighted Round Robin** | Use smooth weighted selection to express relative capacity, initially `5:3:2`. |

### Failover and draining

Taking a server offline removes it from new-connection selection. If it already has open connections, it enters **DRAINING** first so those connections can finish. Recovery makes the server available again. This makes the difference between “stop accepting new connections” and “destroy every current connection” visible.

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

The **Start walkthrough** control walks through eight teacher-friendly steps:

1. Meet the client, shared address, and three servers.
2. Create one TCP connection request.
3. Show the server-selection decision.
4. Complete the three-way handshake.
5. Create a second connection and compare its new decision.
6. Remove Server 2 from new connections.
7. Create a new connection and show failover.
8. Recover Server 2 and finish with normal TCP closing.

The walkthrough uses the same actions as the manual controls; it is not a separate fake animation. It starts paused so a student can explain one step at a time.

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
│   ├── StoryIntro.tsx            # simple story and current step
│   ├── TeachingCue.tsx           # plain-English explanation and “Say this” line
│   ├── NetworkTopology.tsx       # animated client → VIP → server diagram
│   ├── ConnectionInspector.tsx   # connection details and selection reason
│   ├── TcpTimeline.tsx            # SYN → Connected → FIN → TIME-WAIT rail
│   ├── SimulationControls.tsx    # selection rules and connection buttons
│   ├── ServerCard.tsx             # server status, capacity, and failover control
│   ├── MetricsDashboard.tsx      # results for connections, queues, CPU, outcomes
│   ├── EventLogPanel.tsx          # readable TCP connection log
│   ├── AlgorithmExplanation.tsx  # live server-selection explanation
│   ├── AlgorithmComparison.tsx   # repeatable 100-connection comparison
│   ├── NetworkingConcepts.tsx    # researched teaching notes and source links
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

The context uses a generation token and tracked timers so reset/unmount does not allow stale connection callbacks to repopulate a new run. Metrics are sampled on a stable one-second interval instead of restarting every time the active-connection count changes.

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

1. Start with **Create 1 connection** and watch the highlighted connection travel from a client to the load balancer and then to a server.
2. Read the phase rail while the connection moves through `SYN`, `SYN-ACK`, `ACK`, and `Connected`.
3. Open **Connection details** to inspect the client address, shared address, chosen server, TCP message, and reason for the choice.
4. Create a few more connections, then compare the three server-selection rules.
5. Remove a server from new connections while a connection is open. It becomes `Draining` when current connections remain.
6. Use the **connections** tab in the connection log to select an active or finished connection.
7. Run the 100-connection comparison after explaining the basic story.
8. Use **Start walkthrough** for the step-by-step classroom demonstration.

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
| Create one TCP connection | The selected connection appears in the topology and progresses through SYN → SYN-ACK → ACK → Connected → FIN → TIME-WAIT → Closed. |
| Create 10/50/100 connections | The connection log, server distribution, and results update while keeping transport and application concerns separate. |
| Switch to Least Connections | The explanation says which server had fewer active connections. |
| Switch to Weighted Round Robin | The server weight controls appear and the benchmark shows the configured long-run ratio. |
| Remove a server from new connections | New connections avoid that server; existing connections can finish. |
| Take every server offline | New connection requests are recorded as refused at the TCP boundary. |
| Bring a server online | The server becomes available for new connections again. |
| Reset during a busy test | Old timers do not repopulate the new run with stale connections or logs. |
| Run guided walkthrough | The eight steps can be paused, advanced one at a time, replayed, or exited. |
| Reduced motion | CSS motion is disabled while the phase and state information remain available. |

There is currently no dedicated test runner in the repository. `npm run build` is the primary automated check; manual interaction with the checklist above is the visual/integration verification layer.

## Viva prompts

### What is the project in one line?

It is a browser simulation that shows how a TCP load balancer chooses one server for each new connection and avoids failed servers.

### What happens first when the client connects?

The client sends SYN to the load balancer’s shared address. The load balancer chooses an online server, and then TCP completes SYN, SYN-ACK, and ACK.

### Why does the connection stay with one server?

TCP is an ordered, stateful connection. Keeping the connection with one server avoids breaking its transport state.

### What happens when a server fails?

The server stops receiving new connections. Existing connections can drain, and new connections are sent to another online server.

### What are the three algorithms in simple words?

- Round Robin: take turns.
- Least Connections: choose the server with fewer active connections.
- Weighted Round Robin: give larger servers more turns.

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
