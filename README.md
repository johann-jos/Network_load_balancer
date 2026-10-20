

# Network Load Balancing & Server Selection Simulator

> **3rd-Year Computer Networks (CN) Mini-Project**  
> *Department of Computer Science & Engineering*

---

## 📌 Problem Statement

In modern distributed web infrastructure and cloud computing, backend server clusters face unpredictable, high-volume traffic bursts. Directly routing traffic to a single server can cause CPU saturation, high latency, dropped requests, and single points of failure (SPOF). 

A **Network Load Balancer (NLB)** operates at Layer 4 (Transport) and Layer 7 (Application) of the OSI model, acting as a reverse proxy virtual IP (VIP) to distribute client requests across multiple healthy backend server nodes. This project provides a real-time, interactive simulation of load balancing algorithms, failover mechanics, and performance analytics.

---

## 🎯 Objectives

1. **Simulate Algorithmic Selection**: Implement functional **Round Robin**, **Least Connections**, and **Weighted Round Robin** server selection logic.
2. **High Availability & Failover**: Simulate dynamic server failures and automatic traffic re-routing away from offline nodes.
3. **Packet Flow Visualization**: Provide an interactive SVG network topology mapping real-time request datagram paths from client endpoints to backend servers.
4. **Performance Analytics**: Measure and display metrics including active TCP/UDP connections, CPU load percentage, latency round-trip time (RTT), and success/failure rates.
5. **Educational Viva Utility**: Serve as a presentation-ready mini-project for Computer Networks viva voce examinations.

---

## 🏗 System Architecture

```
                       ┌─────────────────────────┐
                       │  CLIENT WORKSTATIONS    │
                       │ 192.168.1.10 - .12      │
                       └────────────┬────────────┘
                                    │  Requests (TCP/UDP)
                                    ▼
                       ┌─────────────────────────┐
                       │   VIRTUAL IP (VIP)      │
                       │   LOAD BALANCER         │
                       │   192.168.1.100:443     │
                       └────────────┬────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           │ (Algorithm Selection)  │ (Algorithm Selection)  │ (Algorithm Selection)
           ▼                        ▼                        ▼
┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
│      SERVER 1      │   │      SERVER 2      │   │      SERVER 3      │
│  192.168.1.101:8080│   │  192.168.1.102:8080│   │  192.168.1.103:8080│
│  (Weight: 5)       │   │  (Weight: 3)       │   │  (Weight: 2)       │
└────────────────────┘   └────────────────────┘   └────────────────────┘
```

---

## 🚀 Key Features

* **Interactive Network Topology**: Dynamic SVG canvas visualizing Client Endpoints, Load Balancer VIP, and Backend Server Nodes with animated packet flows and health indicators.
* **Real Algorithmic Selection**:
  * **Round Robin (RR)**: Cyclic sequential routing with deterministic index pointer tracking.
  * **Least Connections (LC)**: Dynamically selects the server with the lowest active connection count.
  * **Weighted Round Robin (WRR)**: Proportional traffic distribution using NGINX-style smooth weighted selection.
* **Server Failover & Recovery**: Stop (Take Offline) and Recover (Bring Online) servers in real-time. Offline servers are immediately excluded from algorithm routing.
* **Asynchronous Request Generation**: Send 1, 10, 50, 100 requests or activate continuous traffic at configurable rates (1, 5, 10, 20 req/s).
* **Network Log & Request Inspector**: Inspect detailed headers (Source IP, Ephemeral Port, Destination VIP, Target Port, Protocol, Selected Server, Status, Latency).
* **Recharts Real-time Metrics**: Synchronized analytics displaying Request Distribution, CPU Load over time, Response Latency, and Success/Failure ratios.
* **Algorithm Benchmark Tool**: Run identical 100-request synthetic workloads to compare performance across all three algorithms side-by-side.
* **Presentation Demo Mode**: Automated 8-step guided presentation mode for college project demonstrations.

---

## ⚙️ Load Balancing Algorithms Explained

### 1. Round Robin (RR)
Requests are dispatched sequentially among online servers:
$$\text{TargetServer} = \text{OnlineServers}[(i + 1) \pmod N]$$
*When Server 2 goes offline, it is automatically skipped in the cyclic modulo calculation.*

### 2. Least Connections (LC)
Routing target is selected based on active open connections:
$$\text{TargetServer} = \arg\min_{s \in \text{OnlineServers}} \text{ActiveConnections}(s)$$
*Tie-breaker: Resolves ties using lower CPU load or server registration order.*

### 3. Weighted Round Robin (WRR)
Uses NGINX smooth weighted round robin algorithm:
1. Increase each server's current weight by its configured static weight.
2. Select the server with the maximum current weight.
3. Decrement the selected server's current weight by the sum of all online server weights.

---

## 🛠 Technology Stack

* **Framework**: Next.js 14 / React 18
* **Language**: TypeScript (Strict typing for servers, clients, requests, metrics)
* **Styling**: Tailwind CSS (Custom dark cyber-network dashboard theme)
* **Visualization**: SVG Interactive Canvas + Animated Motion Datagrams
* **Charts**: Recharts
* **Icons**: Lucide React

---

## 📖 Computer Networking Concepts Demonstrated

1. **Client-Server Architecture**: Request-response communication paradigm over IPv4 sockets.
2. **Layer 4 vs Layer 7 Routing**: Transport layer (TCP/UDP ports) and Application layer routing choices.
3. **Multiplexing & Demultiplexing**: Mapping client ephemeral ports (49152–65535) to backend service sockets (Port 8080).
4. **Fault Tolerance & Failover**: Automatic health monitoring and removal of unreachable nodes.
5. **Quality of Service (QoS)**: Latency measurement and CPU load protection under heavy concurrency.

---

## 💻 How to Run the Application

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## 🧪 Testing & Verification Checklist

| # | Test Scenario | Steps | Expected Outcome | Status |
|---|---------------|-------|------------------|--------|
| 1 | **Round Robin Distribution** | Select RR, click "Send 10 Req" | Requests alternate sequentially: S1 → S2 → S3 → S1 | PASS |
| 2 | **Server Offline Routing** | Click "STOP SERVER" on Server 2, send 10 req | 0 requests go to S2; traffic routes only to S1 and S3 | PASS |
| 3 | **Least Connections** | Select LC algorithm, generate continuous traffic | Requests dynamically target server with lowest active conns | PASS |
| 4 | **Weighted Round Robin** | Set S1=5, S2=3, S3=2, send 50 req | S1 receives ~50%, S2 ~30%, S3 ~20% of traffic | PASS |
| 5 | **All Servers Offline** | Stop S1, S2, and S3, send requests | Requests fail immediately with `503 Service Unavailable` | PASS |
| 6 | **Server Recovery** | Recover Server 2 | S2 is immediately re-included in routing pool | PASS |
| 7 | **Reset Simulation** | Click "RESET SIMULATION" | All counters, logs, and server states reset to default | PASS |
| 8 | **Continuous Traffic** | Start Continuous Traffic at 10 rps | Real-time charts update continuously | PASS |
| 9 | **Request Inspector** | Click any request in Request Log | Modal displays full IP/port socket details | PASS |
| 10 | **Presentation Demo** | Click "PRESENTATION DEMO MODE" | Automated 8-step guided sequence executes | PASS |

---

## ⚠️ Limitations

* **Software Simulation**: This project is an educational software simulation intended for demonstration and coursework. It does not bind real network socket drivers (e.g., eBPF, DPDK, Linux IPVS) or process live TCP packets.
* **In-Memory State**: State is preserved in local memory during session execution and resets upon page refresh.

---

## 🎓 Viva Questions & Answers

**Q1: What is the difference between Layer 4 and Layer 7 Load Balancing?**  
*Answer*: Layer 4 load balancing routes traffic based on IP addresses and TCP/UDP port headers without inspecting application payload data. Layer 7 load balancing inspects HTTP/HTTPS headers, cookies, and URIs to make content-aware routing decisions.

**Q2: What happens when a server fails in a Weighted Round Robin cluster?**  
*Answer*: The load balancer detects node failure via health-check probes (TCP handshake/HTTP GET `/health`). The failed server's weight is zeroed out and removed from the active pool, redistributing traffic proportionally among remaining online nodes.

---

*Developed for 3rd-Year Computer Networks Mini-Project Submission.*
#   N e t w o r k _ l o a d _ b a l a n c e r  
 