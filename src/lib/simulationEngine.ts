import {
  Server,
  Client,
  NetworkRequest,
  AlgorithmType,
  ProtocolType,
  RequestStatus,
  LogEntry,
  AlgorithmBenchmarkResult
} from '../types/simulation';

export const DEFAULT_SERVERS: Server[] = [
  {
    id: 'server-1',
    name: 'Server 1',
    ip: '192.168.1.101',
    port: 8080,
    protocol: 'TCP',
    status: 'ONLINE',
    activeConnections: 0,
    totalRequestsHandled: 0,
    failedRequests: 0,
    cpuLoad: 12,
    responseTimeMs: 35,
    weight: 5,
    maxCapacity: 50,
  },
  {
    id: 'server-2',
    name: 'Server 2',
    ip: '192.168.1.102',
    port: 8080,
    protocol: 'TCP',
    status: 'ONLINE',
    activeConnections: 0,
    totalRequestsHandled: 0,
    failedRequests: 0,
    cpuLoad: 8,
    responseTimeMs: 28,
    weight: 3,
    maxCapacity: 50,
  },
  {
    id: 'server-3',
    name: 'Server 3',
    ip: '192.168.1.103',
    port: 8080,
    protocol: 'TCP',
    status: 'ONLINE',
    activeConnections: 0,
    totalRequestsHandled: 0,
    failedRequests: 0,
    cpuLoad: 15,
    responseTimeMs: 42,
    weight: 2,
    maxCapacity: 50,
  },
];

export const DEFAULT_CLIENTS: Client[] = [
  { id: 'client-1', name: 'Client Workstation A', ip: '192.168.1.10', activeRequests: 0 },
  { id: 'client-2', name: 'Client Workstation B', ip: '192.168.1.11', activeRequests: 0 },
  { id: 'client-3', name: 'Client Workstation C', ip: '192.168.1.12', activeRequests: 0 },
];

export const LOAD_BALANCER_IP = '192.168.1.100';
export const LOAD_BALANCER_PORT = 443;

/**
 * State container for algorithm routing pointers
 */
export interface LoadBalancerState {
  rrIndex: number;
  wrrCurrentWeights: Record<string, number>;
}

/**
 * Select server using Round Robin
 */
export function selectServerRoundRobin(
  servers: Server[],
  currentState: LoadBalancerState
): { selectedServer: Server | null; nextState: LoadBalancerState } {
  const onlineServers = servers.filter((s) => s.status === 'ONLINE');
  if (onlineServers.length === 0) {
    return { selectedServer: null, nextState: currentState };
  }

  const nextIndex = (currentState.rrIndex + 1) % onlineServers.length;
  const selectedServer = onlineServers[nextIndex];

  return {
    selectedServer,
    nextState: { ...currentState, rrIndex: nextIndex },
  };
}

/**
 * Select server using Least Connections
 * Deterministic tie-breaker: index in server list, then lowest cpuLoad
 */
export function selectServerLeastConnections(
  servers: Server[],
  currentState: LoadBalancerState
): { selectedServer: Server | null; nextState: LoadBalancerState } {
  const onlineServers = servers.filter((s) => s.status === 'ONLINE');
  if (onlineServers.length === 0) {
    return { selectedServer: null, nextState: currentState };
  }

  let minConnServer = onlineServers[0];

  for (let i = 1; i < onlineServers.length; i++) {
    const candidate = onlineServers[i];
    if (candidate.activeConnections < minConnServer.activeConnections) {
      minConnServer = candidate;
    } else if (candidate.activeConnections === minConnServer.activeConnections) {
      // Tie-breaker: lower CPU load or earlier registration
      if (candidate.cpuLoad < minConnServer.cpuLoad) {
        minConnServer = candidate;
      }
    }
  }

  return {
    selectedServer: minConnServer,
    nextState: currentState,
  };
}

/**
 * Select server using NGINX Smooth Weighted Round Robin
 * Algorithm:
 * 1. For each online server: current_weight += weight
 * 2. Find server with max current_weight
 * 3. Selected server's current_weight -= total_weight_sum
 */
export function selectServerWeightedRoundRobin(
  servers: Server[],
  currentState: LoadBalancerState
): { selectedServer: Server | null; nextState: LoadBalancerState } {
  const onlineServers = servers.filter((s) => s.status === 'ONLINE');
  if (onlineServers.length === 0) {
    return { selectedServer: null, nextState: currentState };
  }

  const currentWeights = { ...currentState.wrrCurrentWeights };

  // Ensure all online servers are initialized in weight map
  let totalWeightSum = 0;
  onlineServers.forEach((s) => {
    if (currentWeights[s.id] === undefined) {
      currentWeights[s.id] = 0;
    }
    const weight = Math.max(1, s.weight);
    currentWeights[s.id] += weight;
    totalWeightSum += weight;
  });

  // Pick server with highest current weight
  let bestServer = onlineServers[0];
  let maxWeight = currentWeights[bestServer.id];

  for (let i = 1; i < onlineServers.length; i++) {
    const s = onlineServers[i];
    if (currentWeights[s.id] > maxWeight) {
      maxWeight = currentWeights[s.id];
      bestServer = s;
    }
  }

  // Deduct total weight sum from selected server
  currentWeights[bestServer.id] -= totalWeightSum;

  return {
    selectedServer: bestServer,
    nextState: {
      ...currentState,
      wrrCurrentWeights: currentWeights,
    },
  };
}

/**
 * Master server selection dispatch
 */
export function routeRequest(
  algorithm: AlgorithmType,
  servers: Server[],
  state: LoadBalancerState
): { selectedServer: Server | null; nextState: LoadBalancerState } {
  switch (algorithm) {
    case 'ROUND_ROBIN':
      return selectServerRoundRobin(servers, state);
    case 'LEAST_CONNECTIONS':
      return selectServerLeastConnections(servers, state);
    case 'WEIGHTED_ROUND_ROBIN':
      return selectServerWeightedRoundRobin(servers, state);
    default:
      return selectServerRoundRobin(servers, state);
  }
}

/**
 * Calculate dynamic realistic response time and CPU load based on active connections
 */
export function calculateServerMetrics(
  server: Server,
  baseLatencyMs: number = 25
): { responseTime: number; cpuLoad: number } {
  if (server.status === 'OFFLINE') {
    return { responseTime: 0, cpuLoad: 0 };
  }

  // Latency increases exponentially with load factor
  const loadFactor = server.activeConnections / server.maxCapacity;
  const loadJitter = Math.floor(Math.random() * 8) - 4; // +/- 4ms jitter
  const responseTime = Math.min(
    1000,
    Math.max(15, Math.round(baseLatencyMs + Math.pow(loadFactor, 1.5) * 150 + loadJitter))
  );

  // CPU load proportional to active connections + base load
  const baseCpu = 10;
  const cpuLoad = Math.min(99, Math.max(5, Math.round(baseCpu + loadFactor * 85 + (Math.random() * 6 - 3))));

  return { responseTime, cpuLoad };
}

/**
 * Helper to generate random client port in dynamic range (49152 - 65535)
 */
export function getRandomClientPort(): number {
  return Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152;
}

/**
 * Format timestamp nicely (HH:MM:SS)
 */
export function formatTimestamp(date: Date = new Date()): string {
  return date.toTimeString().split(' ')[0];
}

/**
 * Create a new NetworkRequest object
 */
export function createNetworkRequest(
  requestId: number,
  clientIp: string,
  protocol: ProtocolType
): NetworkRequest {
  const now = new Date();
  return {
    id: `req-${requestId}-${Date.now()}`,
    requestId,
    clientIp,
    sourcePort: getRandomClientPort(),
    destinationIp: LOAD_BALANCER_IP,
    destinationPort: LOAD_BALANCER_PORT,
    protocol,
    timestamp: formatTimestamp(now),
    startTime: now.getTime(),
    durationMs: 0,
    selectedServerId: null,
    selectedServerIp: null,
    status: 'PROCESSING',
    responseTimeMs: 0,
  };
}

/**
 * Run a multi-workload benchmark for algorithm comparison
 */
export function simulateAlgorithmComparison(
  servers: Server[],
  totalRequests: number = 100
): AlgorithmBenchmarkResult[] {
  const algorithms: { type: AlgorithmType; name: string }[] = [
    { type: 'ROUND_ROBIN', name: 'Round Robin' },
    { type: 'LEAST_CONNECTIONS', name: 'Least Connections' },
    { type: 'WEIGHTED_ROUND_ROBIN', name: 'Weighted Round Robin' },
  ];

  const clients = ['192.168.1.10', '192.168.1.11', '192.168.1.12'];

  return algorithms.map((algo) => {
    // Clone servers for isolated simulation
    let simServers: Server[] = servers.map((s) => ({
      ...s,
      activeConnections: 0,
      totalRequestsHandled: 0,
      failedRequests: 0,
    }));

    let lbState: LoadBalancerState = { rrIndex: -1, wrrCurrentWeights: {} };
    let totalSuccess = 0;
    let totalFailed = 0;
    let totalResponseTime = 0;
    const reqPerServer: Record<string, number> = {};
    const serverLoadSum: Record<string, number> = {};

    simServers.forEach((s) => {
      reqPerServer[s.name] = 0;
      serverLoadSum[s.name] = 0;
    });

    for (let reqNum = 1; reqNum <= totalRequests; reqNum++) {
      const { selectedServer, nextState } = routeRequest(algo.type, simServers, lbState);
      lbState = nextState;

      if (!selectedServer) {
        totalFailed++;
      } else {
        totalSuccess++;
        // Update server stats in sim
        simServers = simServers.map((s) => {
          if (s.id === selectedServer.id) {
            const newActive = s.activeConnections + 1;
            const metrics = calculateServerMetrics({ ...s, activeConnections: newActive });
            reqPerServer[s.name] = (reqPerServer[s.name] || 0) + 1;
            totalResponseTime += metrics.responseTime;
            serverLoadSum[s.name] += metrics.cpuLoad;

            return {
              ...s,
              activeConnections: Math.max(0, newActive - 1), // quick simulated completion
              totalRequestsHandled: s.totalRequestsHandled + 1,
              cpuLoad: metrics.cpuLoad,
              responseTimeMs: metrics.responseTime,
            };
          }
          return s;
        });
      }
    }

    const avgResponseTime = totalSuccess > 0 ? Math.round(totalResponseTime / totalSuccess) : 0;
    const avgServerLoads: Record<string, number> = {};
    let loadSumTotal = 0;

    simServers.forEach((s) => {
      const handled = reqPerServer[s.name] || 1;
      avgServerLoads[s.name] = Math.round(serverLoadSum[s.name] / handled);
      loadSumTotal += avgServerLoads[s.name];
    });

    const avgOverallLoad = Math.round(loadSumTotal / simServers.length);

    return {
      algorithm: algo.type,
      algorithmName: algo.name,
      totalRequests,
      successfulRequests: totalSuccess,
      failedRequests: totalFailed,
      averageResponseTimeMs: avgResponseTime,
      averageServerLoadPercent: avgOverallLoad,
      requestsPerServer: reqPerServer,
      serverLoads: avgServerLoads,
    };
  });
}
