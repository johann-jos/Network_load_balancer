import {
  AlgorithmBenchmarkResult,
  AlgorithmType,
  Client,
  NetworkRequest,
  ProtocolType,
  RouteDecision,
  Server,
} from '../types/simulation';

export const DEFAULT_SERVERS: Server[] = [
  {
    id: 'server-1',
    name: 'ORBIT / 01',
    ip: '192.168.1.101',
    port: 8080,
    protocol: 'TCP',
    status: 'ONLINE',
    activeConnections: 0,
    halfOpenConnections: 0,
    timeWaitConnections: 0,
    totalConnectionsHandled: 0,
    failedConnections: 0,
    cpuLoad: 12,
    responseTimeMs: 35,
    weight: 5,
    maxCapacity: 50,
    zone: 'us-east / blue',
  },
  {
    id: 'server-2',
    name: 'ORBIT / 02',
    ip: '192.168.1.102',
    port: 8080,
    protocol: 'TCP',
    status: 'ONLINE',
    activeConnections: 0,
    halfOpenConnections: 0,
    timeWaitConnections: 0,
    totalConnectionsHandled: 0,
    failedConnections: 0,
    cpuLoad: 8,
    responseTimeMs: 28,
    weight: 3,
    maxCapacity: 50,
    zone: 'us-east / green',
  },
  {
    id: 'server-3',
    name: 'ORBIT / 03',
    ip: '192.168.1.103',
    port: 8080,
    protocol: 'TCP',
    status: 'ONLINE',
    activeConnections: 0,
    halfOpenConnections: 0,
    timeWaitConnections: 0,
    totalConnectionsHandled: 0,
    failedConnections: 0,
    cpuLoad: 15,
    responseTimeMs: 42,
    weight: 2,
    maxCapacity: 50,
    zone: 'us-east / amber',
  },
];

export const DEFAULT_CLIENTS: Client[] = [
  { id: 'client-1', name: 'CLIENT / A', ip: '192.168.1.10', activeConnections: 0 },
  { id: 'client-2', name: 'CLIENT / B', ip: '192.168.1.11', activeConnections: 0 },
  { id: 'client-3', name: 'CLIENT / C', ip: '192.168.1.12', activeConnections: 0 },
];

export const LOAD_BALANCER_IP = '192.168.1.100';
export const LOAD_BALANCER_PORT = 443;

export interface LoadBalancerState {
  rrIndex: number;
  wrrCurrentWeights: Record<string, number>;
}

export const ALGORITHM_LABELS: Record<AlgorithmType, string> = {
  ROUND_ROBIN: 'Round robin',
  LEAST_CONNECTIONS: 'Least connections',
  WEIGHTED_ROUND_ROBIN: 'Weighted round robin',
};

const onlineServers = (servers: Server[]) => servers.filter((server) => server.status === 'ONLINE');

export function selectServerRoundRobin(
  servers: Server[],
  currentState: LoadBalancerState,
): { selectedServer: Server | null; nextState: LoadBalancerState } {
  const eligible = onlineServers(servers);
  if (eligible.length === 0) return { selectedServer: null, nextState: currentState };

  const nextIndex = (currentState.rrIndex + 1) % eligible.length;
  return {
    selectedServer: eligible[nextIndex],
    nextState: { ...currentState, rrIndex: nextIndex },
  };
}

export function selectServerLeastConnections(
  servers: Server[],
  currentState: LoadBalancerState,
): { selectedServer: Server | null; nextState: LoadBalancerState } {
  const eligible = onlineServers(servers);
  if (eligible.length === 0) return { selectedServer: null, nextState: currentState };

  const selectedServer = eligible.reduce((best, candidate) => {
    if (candidate.activeConnections < best.activeConnections) return candidate;
    if (candidate.activeConnections === best.activeConnections && candidate.cpuLoad < best.cpuLoad) return candidate;
    return best;
  }, eligible[0]);

  return { selectedServer, nextState: currentState };
}

/** Smooth weighted round robin, the same family of algorithm used by NGINX stream upstreams. */
export function selectServerWeightedRoundRobin(
  servers: Server[],
  currentState: LoadBalancerState,
): { selectedServer: Server | null; nextState: LoadBalancerState } {
  const eligible = onlineServers(servers);
  if (eligible.length === 0) return { selectedServer: null, nextState: currentState };

  const currentWeights = { ...currentState.wrrCurrentWeights };
  let totalWeight = 0;
  let selectedServer = eligible[0];
  let highestWeight = Number.NEGATIVE_INFINITY;

  eligible.forEach((server) => {
    const weight = Math.max(1, server.weight);
    currentWeights[server.id] = (currentWeights[server.id] ?? 0) + weight;
    totalWeight += weight;
    if (currentWeights[server.id] > highestWeight) {
      highestWeight = currentWeights[server.id];
      selectedServer = server;
    }
  });

  currentWeights[selectedServer.id] -= totalWeight;

  return {
    selectedServer,
    nextState: { ...currentState, wrrCurrentWeights: currentWeights },
  };
}

export function routeRequest(
  algorithm: AlgorithmType,
  servers: Server[],
  state: LoadBalancerState,
): { selectedServer: Server | null; nextState: LoadBalancerState } {
  switch (algorithm) {
    case 'LEAST_CONNECTIONS':
      return selectServerLeastConnections(servers, state);
    case 'WEIGHTED_ROUND_ROBIN':
      return selectServerWeightedRoundRobin(servers, state);
    case 'ROUND_ROBIN':
    default:
      return selectServerRoundRobin(servers, state);
  }
}

export function buildRouteDecision(
  requestId: number,
  algorithm: AlgorithmType,
  servers: Server[],
  state: LoadBalancerState,
): { decision: RouteDecision; nextState: LoadBalancerState } {
  const eligible = onlineServers(servers);
  const { selectedServer, nextState } = routeRequest(algorithm, servers, state);
  const scores: Record<string, number> = {};

  eligible.forEach((server) => {
    if (algorithm === 'ROUND_ROBIN') scores[server.id] = server.id === selectedServer?.id ? 1 : 0;
    if (algorithm === 'LEAST_CONNECTIONS') scores[server.id] = -server.activeConnections;
    if (algorithm === 'WEIGHTED_ROUND_ROBIN') scores[server.id] = server.weight;
  });

  const rationale = selectedServer
    ? algorithm === 'ROUND_ROBIN'
      ? 'next eligible target in the rotation'
      : algorithm === 'LEAST_CONNECTIONS'
        ? `${selectedServer.activeConnections} active socket${selectedServer.activeConnections === 1 ? '' : 's'} at decision time`
        : `weight ${selectedServer.weight} wins the smooth weighted score`
    : 'no healthy TCP target is accepting new connections';

  return {
    decision: {
      requestId,
      algorithm,
      candidateServerIds: eligible.map((server) => server.id),
      selectedServerId: selectedServer?.id ?? null,
      rationale,
      scores,
    },
    nextState,
  };
}

export function calculateServerMetrics(
  server: Server,
  baseLatencyMs = 25,
): { responseTime: number; cpuLoad: number } {
  if (server.status === 'OFFLINE') return { responseTime: 0, cpuLoad: 0 };

  const loadFactor = Math.min(1.25, server.activeConnections / server.maxCapacity);
  const deterministicJitter = ((server.totalConnectionsHandled * 7 + server.activeConnections * 3) % 9) - 4;
  const responseTime = Math.min(
    1000,
    Math.max(15, Math.round(baseLatencyMs + Math.pow(loadFactor, 1.35) * 150 + deterministicJitter)),
  );
  const cpuLoad = Math.min(99, Math.max(5, Math.round(10 + loadFactor * 78 + deterministicJitter / 2)));

  return { responseTime, cpuLoad };
}

export function getRandomClientPort(): number {
  return Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152;
}

export function formatTimestamp(date: Date = new Date()): string {
  return date.toTimeString().split(' ')[0];
}

export function createNetworkRequest(requestId: number, clientIp: string): NetworkRequest {
  const now = new Date();
  const sequenceNumber = Math.floor(Math.random() * 900000000) + 100000000;

  return {
    id: `tcp-${requestId}-${Date.now()}`,
    requestId,
    clientIp,
    sourcePort: getRandomClientPort(),
    destinationIp: LOAD_BALANCER_IP,
    destinationPort: LOAD_BALANCER_PORT,
    protocol: 'TCP',
    timestamp: formatTimestamp(now),
    startTime: now.getTime(),
    phaseStartedAt: now.getTime(),
    durationMs: 0,
    handshakeMs: 0,
    connectionDurationMs: 0,
    selectedServerId: null,
    selectedServerIp: null,
    phase: 'SYN_SENT',
    currentFlag: 'SYN',
    status: 'CONNECTING',
    sequenceNumber,
    acknowledgementNumber: sequenceNumber + 1,
    responseTimeMs: 0,
  };
}

export function simulateAlgorithmComparison(servers: Server[], totalRequests = 100): AlgorithmBenchmarkResult[] {
  const algorithms: { type: AlgorithmType; name: string; ratio: string }[] = [
    { type: 'ROUND_ROBIN', name: 'Round robin', ratio: '≈ 33 / 33 / 34' },
    { type: 'LEAST_CONNECTIONS', name: 'Least connections', ratio: 'adaptive' },
    { type: 'WEIGHTED_ROUND_ROBIN', name: 'Weighted round robin', ratio: '5 : 3 : 2' },
  ];

  return algorithms.map(({ type, name, ratio }) => {
    let simulatedServers = servers.map((server) => ({ ...server, activeConnections: 0, totalConnectionsHandled: 0 }));
    let state: LoadBalancerState = { rrIndex: -1, wrrCurrentWeights: {} };
    const requestsPerServer: Record<string, number> = Object.fromEntries(servers.map((server) => [server.name, 0]));
    const serverLoadSums: Record<string, number> = Object.fromEntries(servers.map((server) => [server.name, 0]));
    let totalLatency = 0;

    for (let i = 0; i < totalRequests; i += 1) {
      const { selectedServer, nextState } = routeRequest(type, simulatedServers, state);
      state = nextState;
      if (!selectedServer) continue;

      const activeAfterOpen = selectedServer.activeConnections + 1;
      const latency = selectedServer.responseTimeMs + activeAfterOpen * 2;
      const load = Math.min(99, Math.round(10 + (activeAfterOpen / selectedServer.maxCapacity) * 80));
      requestsPerServer[selectedServer.name] += 1;
      serverLoadSums[selectedServer.name] += load;
      totalLatency += latency;

      simulatedServers = simulatedServers.map((server) => {
        if (server.id !== selectedServer.id) return server;
        return {
          ...server,
          activeConnections: i % 4 === 3 ? Math.max(0, activeAfterOpen - 2) : activeAfterOpen,
          totalConnectionsHandled: server.totalConnectionsHandled + 1,
        };
      });
    }

    const serverLoads: Record<string, number> = {};
    let loadTotal = 0;
    servers.forEach((server) => {
      const handled = requestsPerServer[server.name] || 1;
      serverLoads[server.name] = Math.round(serverLoadSums[server.name] / handled);
      loadTotal += serverLoads[server.name];
    });

    return {
      algorithm: type,
      algorithmName: name,
      totalRequests,
      successfulRequests: totalRequests,
      failedRequests: 0,
      averageResponseTimeMs: Math.round(totalLatency / Math.max(1, totalRequests)),
      averageServerLoadPercent: Math.round(loadTotal / Math.max(1, servers.length)),
      requestsPerServer,
      serverLoads,
      targetDistribution: ratio,
    };
  });
}

export function getProtocolLabel(protocol: ProtocolType): string {
  return protocol;
}
