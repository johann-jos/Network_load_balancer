'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlgorithmType,
  Client,
  DemoModeState,
  LogEntry,
  NetworkRequest,
  RouteDecision,
  Server,
  TcpFlag,
  TcpMetrics,
  TcpPhase,
  TimeSeriesDataPoint,
} from '../types/simulation';
import {
  buildRouteDecision,
  calculateServerMetrics,
  createNetworkRequest,
  DEFAULT_CLIENTS,
  DEFAULT_SERVERS,
  formatTimestamp,
  LOAD_BALANCER_IP,
  LOAD_BALANCER_PORT,
  LoadBalancerState,
} from '../lib/simulationEngine';

interface SimulationContextType {
  servers: Server[];
  clients: Client[];
  algorithm: AlgorithmType;
  activeRequests: NetworkRequest[];
  requestHistory: NetworkRequest[];
  eventLogs: LogEntry[];
  isContinuousTraffic: boolean;
  trafficRateRps: number;
  observedRps: number;
  timeSeriesData: TimeSeriesDataPoint[];
  demoState: DemoModeState;
  selectedRequest: NetworkRequest | null;
  featuredRequest: NetworkRequest | null;
  lastRouteDecision: RouteDecision | null;
  tcpMetrics: TcpMetrics;

  setAlgorithm: (algo: AlgorithmType) => void;
  setTrafficRate: (rps: number) => void;
  startContinuousTraffic: (rps: number) => void;
  stopContinuousTraffic: () => void;
  sendSingleRequest: (clientIp?: string) => void;
  sendBatchRequests: (count: number, algorithmOverride?: AlgorithmType) => void;
  toggleServerStatus: (serverId: string) => void;
  updateServerWeight: (serverId: string, weight: number) => void;
  clearLogs: () => void;
  resetSimulation: () => void;
  startDemoMode: () => void;
  nextDemoStep: () => void;
  toggleDemoPlayback: () => void;
  stopDemoMode: () => void;
  setSelectedRequest: (req: NetworkRequest | null) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);
type TimerHandle = ReturnType<typeof setTimeout>;

const DEMO_STEPS = 8;

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [servers, setServers] = useState<Server[]>(() => DEFAULT_SERVERS.map((server) => ({ ...server })));
  const [clients, setClients] = useState<Client[]>(() => DEFAULT_CLIENTS.map((client) => ({ ...client })));
  const [algorithm, setAlgorithmState] = useState<AlgorithmType>('ROUND_ROBIN');
  const [activeRequests, setActiveRequests] = useState<NetworkRequest[]>([]);
  const [requestHistory, setRequestHistory] = useState<NetworkRequest[]>([]);
  const [eventLogs, setEventLogs] = useState<LogEntry[]>([]);
  const [isContinuousTraffic, setIsContinuousTraffic] = useState(false);
  const [trafficRateRps, setTrafficRateRps] = useState(5);
  const [observedRps, setObservedRps] = useState(0);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null);
  const [lastRouteDecision, setLastRouteDecision] = useState<RouteDecision | null>(null);
  const [demoState, setDemoState] = useState<DemoModeState>({
    active: false,
    currentStep: 0,
    totalSteps: DEMO_STEPS,
    stepTitle: '',
    description: '',
    isPaused: false,
  });

  const serversRef = useRef(servers);
  const clientsRef = useRef(clients);
  const algorithmRef = useRef<AlgorithmType>(algorithm);
  const activeRequestsRef = useRef<NetworkRequest[]>([]);
  const requestHistoryRef = useRef<NetworkRequest[]>([]);
  const lbStateRef = useRef<LoadBalancerState>({ rrIndex: -1, wrrCurrentWeights: {} });
  const reqIdCounterRef = useRef(1000);
  const generationRef = useRef(0);
  const elapsedSecondsRef = useRef(0);
  const recentCompletionsRef = useRef<number[]>([]);
  const timersRef = useRef<Set<TimerHandle>>(new Set());
  const continuousTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const metricsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoTimerRef = useRef<TimerHandle | null>(null);
  const demoAutoRef = useRef(false);
  const runDemoStepRef = useRef<(step: number) => void>(() => undefined);

  const commitServers = useCallback((nextServers: Server[]) => {
    serversRef.current = nextServers;
    setServers(nextServers);
  }, []);

  const commitClients = useCallback((nextClients: Client[]) => {
    clientsRef.current = nextClients;
    setClients(nextClients);
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const generation = generationRef.current;
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      if (generation !== generationRef.current) return;
      callback();
    }, delay);
    timersRef.current.add(timer);
    return timer;
  }, []);

  const cancelTimer = useCallback((timer: TimerHandle | null) => {
    if (!timer) return;
    clearTimeout(timer);
    timersRef.current.delete(timer);
  }, []);

  const clearScheduledWork = useCallback((includeMetrics = false) => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    if (continuousTimerRef.current) clearInterval(continuousTimerRef.current);
    if (includeMetrics && metricsTimerRef.current) clearInterval(metricsTimerRef.current);
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    continuousTimerRef.current = null;
    if (includeMetrics) metricsTimerRef.current = null;
    demoTimerRef.current = null;
  }, []);

  const logEvent = useCallback((type: LogEntry['type'], message: string, requestId?: number, serverId?: string, phase?: TcpPhase, flag?: TcpFlag) => {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: formatTimestamp(),
      type,
      message,
      requestId,
      serverId,
      phase,
      flag,
    };
    setEventLogs((previous) => [entry, ...previous.slice(0, 249)]);
  }, []);

  const patchActiveRequest = useCallback((id: string, patch: Partial<NetworkRequest>) => {
    const nextRequests = activeRequestsRef.current.map((request) => (request.id === id ? { ...request, ...patch } : request));
    activeRequestsRef.current = nextRequests;
    setActiveRequests(nextRequests);
  }, []);

  const updateServerConnectionMetrics = useCallback((serverId: string, delta: number, phase: TcpPhase) => {
    const nextServers = serversRef.current.map((server) => {
      if (server.id !== serverId) return server;
      const activeConnections = Math.max(0, server.activeConnections + delta);
      const nextStatus = server.status === 'DRAINING' && activeConnections === 0 ? 'OFFLINE' : server.status;
      const metrics = calculateServerMetrics({ ...server, activeConnections, status: nextStatus });
      return {
        ...server,
        status: nextStatus,
        activeConnections,
        halfOpenConnections: phase === 'ACK' ? Math.max(0, server.halfOpenConnections - 1) : server.halfOpenConnections,
        cpuLoad: nextStatus === 'OFFLINE' ? 0 : metrics.cpuLoad,
        responseTimeMs: nextStatus === 'OFFLINE' ? 0 : metrics.responseTime,
      };
    });
    commitServers(nextServers);
  }, [commitServers]);

  const transitionConnection = useCallback((id: string, phase: TcpPhase, flag: TcpFlag, status: NetworkRequest['status']) => {
    const current = activeRequestsRef.current.find((request) => request.id === id);
    if (!current) return;

    const now = Date.now();
    const phasePatch: Partial<NetworkRequest> = {
      phase,
      currentFlag: flag,
      status,
      phaseStartedAt: now,
      handshakeMs: phase === 'ESTABLISHED' ? now - current.startTime : current.handshakeMs,
    };
    patchActiveRequest(id, phasePatch);

    if (phase === 'ROUTING') logEvent('INFO', `VIP received SYN #${current.requestId}; evaluating ${algorithmRef.current.replaceAll('_', ' ').toLowerCase()}.`, current.requestId, current.selectedServerId ?? undefined, phase, flag);
    if (phase === 'SYN_ACK') logEvent('INFO', `SYN-ACK returned from ${current.selectedServerIp}; backend leg is half-open.`, current.requestId, current.selectedServerId ?? undefined, phase, flag);
    if (phase === 'ACK') {
      updateServerConnectionMetrics(current.selectedServerId ?? '', 0, phase);
      logEvent('INFO', `ACK completed the handshake for TCP flow #${current.requestId}.`, current.requestId, current.selectedServerId ?? undefined, phase, flag);
    }
    if (phase === 'ESTABLISHED') logEvent('SUCCESS', `Flow #${current.requestId} is ESTABLISHED on ${current.selectedServerIp}.`, current.requestId, current.selectedServerId ?? undefined, phase, flag);
    if (phase === 'FIN_WAIT') logEvent('INFO', `FIN sent for flow #${current.requestId}; graceful close begins.`, current.requestId, current.selectedServerId ?? undefined, phase, flag);
    if (phase === 'TIME_WAIT') logEvent('INFO', `Flow #${current.requestId} entered TIME-WAIT to protect delayed segments.`, current.requestId, current.selectedServerId ?? undefined, phase, flag);
  }, [logEvent, patchActiveRequest, updateServerConnectionMetrics]);

  const finishConnection = useCallback((id: string) => {
    const current = activeRequestsRef.current.find((request) => request.id === id);
    if (!current) return;

    const now = Date.now();
    const completedRequest: NetworkRequest = {
      ...current,
      phase: 'CLOSED',
      currentFlag: 'FIN',
      status: 'COMPLETED',
      phaseStartedAt: now,
      durationMs: now - current.startTime,
      connectionDurationMs: Math.max(0, now - current.startTime - current.handshakeMs),
    };

    const nextActive = activeRequestsRef.current.filter((request) => request.id !== id);
    activeRequestsRef.current = nextActive;
    setActiveRequests(nextActive);
    requestHistoryRef.current = [completedRequest, ...requestHistoryRef.current.slice(0, 499)];
    setRequestHistory(requestHistoryRef.current);
    recentCompletionsRef.current.push(now);
    updateServerConnectionMetrics(current.selectedServerId ?? '', -1, 'CLOSED');
    commitClients(
      clientsRef.current.map((client) =>
        client.ip === current.clientIp ? { ...client, activeConnections: Math.max(0, client.activeConnections - 1) } : client,
      ),
    );
    logEvent('SUCCESS', `TCP flow #${current.requestId} CLOSED cleanly after ${completedRequest.durationMs}ms.`, current.requestId, current.selectedServerId ?? undefined, 'CLOSED', 'FIN');

    if (current.selectedServerId) {
      commitServers(
        serversRef.current.map((server) =>
          server.id === current.selectedServerId ? { ...server, timeWaitConnections: server.timeWaitConnections + 1 } : server,
        ),
      );
      schedule(() => {
        commitServers(
          serversRef.current.map((server) =>
            server.id === current.selectedServerId
              ? { ...server, timeWaitConnections: Math.max(0, server.timeWaitConnections - 1) }
              : server,
          ),
        );
      }, 1200);
    }
  }, [commitClients, commitServers, logEvent, schedule, updateServerConnectionMetrics]);

  const processRequest = useCallback((clientIp?: string, algorithmOverride?: AlgorithmType) => {
    const requestId = ++reqIdCounterRef.current;
    const client = clientIp ?? clientsRef.current[Math.floor(Math.random() * clientsRef.current.length)].ip;
    const selectedAlgorithm = algorithmOverride ?? algorithmRef.current;
    const baseRequest = createNetworkRequest(requestId, client);
    const route = buildRouteDecision(requestId, selectedAlgorithm, serversRef.current, lbStateRef.current);
    lbStateRef.current = route.nextState;
    setLastRouteDecision(route.decision);

    if (!route.decision.selectedServerId) {
      const failedRequest: NetworkRequest = {
        ...baseRequest,
        phase: 'FAILED',
        currentFlag: 'RST',
        status: 'FAILED',
        failureReason: 'No healthy TCP target is accepting new connections.',
        durationMs: 40,
      };
      requestHistoryRef.current = [failedRequest, ...requestHistoryRef.current.slice(0, 499)];
      setRequestHistory(requestHistoryRef.current);
      logEvent('ERROR', `SYN #${requestId} refused: no healthy target in the pool.`, requestId, undefined, 'FAILED', 'RST');
      return;
    }

    const selectedServer = serversRef.current.find((server) => server.id === route.decision.selectedServerId);
    if (!selectedServer) return;
    const metrics = calculateServerMetrics({ ...selectedServer, activeConnections: selectedServer.activeConnections + 1 });
    const request: NetworkRequest = {
      ...baseRequest,
      selectedServerId: selectedServer.id,
      selectedServerIp: `${selectedServer.ip}:${selectedServer.port}`,
      responseTimeMs: metrics.responseTime,
      phase: 'SYN_SENT',
      currentFlag: 'SYN',
      status: 'CONNECTING',
    };

    activeRequestsRef.current = [request, ...activeRequestsRef.current.slice(0, 119)];
    setActiveRequests(activeRequestsRef.current);
    commitServers(
      serversRef.current.map((server) =>
        server.id === selectedServer.id
          ? {
              ...server,
              activeConnections: server.activeConnections + 1,
              halfOpenConnections: server.halfOpenConnections + 1,
              totalConnectionsHandled: server.totalConnectionsHandled + 1,
              cpuLoad: metrics.cpuLoad,
              responseTimeMs: metrics.responseTime,
            }
          : server,
      ),
    );
    commitClients(
      clientsRef.current.map((clientItem) =>
        clientItem.ip === client ? { ...clientItem, activeConnections: clientItem.activeConnections + 1 } : clientItem,
      ),
    );
    logEvent('INFO', `SYN #${requestId} from ${client}:${request.sourcePort} → VIP ${LOAD_BALANCER_IP}:${LOAD_BALANCER_PORT}.`, requestId, selectedServer.id, 'SYN_SENT', 'SYN');

    schedule(() => transitionConnection(request.id, 'ROUTING', 'SYN', 'CONNECTING'), 320);
    schedule(() => transitionConnection(request.id, 'SYN_ACK', 'SYN-ACK', 'CONNECTING'), 720);
    schedule(() => transitionConnection(request.id, 'ACK', 'ACK', 'CONNECTING'), 1050);
    schedule(() => transitionConnection(request.id, 'ESTABLISHED', 'DATA', 'ESTABLISHED'), 1350);
    schedule(() => transitionConnection(request.id, 'FIN_WAIT', 'FIN', 'CLOSING'), 3400 + (requestId % 4) * 180);
    schedule(() => transitionConnection(request.id, 'TIME_WAIT', 'ACK', 'CLOSING'), 3800 + (requestId % 4) * 180);
    schedule(() => finishConnection(request.id), 5000 + (requestId % 4) * 180);
  }, [commitClients, commitServers, finishConnection, logEvent, schedule, transitionConnection]);

  const sendSingleRequest = useCallback((clientIp?: string) => processRequest(clientIp), [processRequest]);

  const sendBatchRequests = useCallback((count: number, algorithmOverride?: AlgorithmType) => {
    const boundedCount = Math.max(1, Math.min(150, count));
    logEvent('SYSTEM', `Opening ${boundedCount} TCP connections with ${algorithmOverride ? algorithmOverride.replaceAll('_', ' ') : algorithmRef.current.replaceAll('_', ' ')}.`);
    const interval = Math.max(70, Math.floor(900 / Math.min(boundedCount, 12)));
    for (let index = 0; index < boundedCount; index += 1) {
      schedule(() => processRequest(undefined, algorithmOverride), index * interval);
    }
  }, [logEvent, processRequest, schedule]);

  const startContinuousTraffic = useCallback((rps: number) => {
    if (continuousTimerRef.current) clearInterval(continuousTimerRef.current);
    const safeRate = Math.max(1, Math.min(20, rps));
    setTrafficRateRps(safeRate);
    setIsContinuousTraffic(true);
    logEvent('SYSTEM', `Continuous TCP connection pressure set to ${safeRate} opens/sec.`);
    continuousTimerRef.current = setInterval(() => processRequest(), 1000 / safeRate);
  }, [logEvent, processRequest]);

  const stopContinuousTraffic = useCallback(() => {
    if (continuousTimerRef.current) clearInterval(continuousTimerRef.current);
    continuousTimerRef.current = null;
    setIsContinuousTraffic(false);
    logEvent('SYSTEM', 'Continuous TCP connection pressure stopped.');
  }, [logEvent]);

  const setTrafficRate = useCallback((rps: number) => {
    setTrafficRateRps(rps);
    if (isContinuousTraffic) startContinuousTraffic(rps);
  }, [isContinuousTraffic, startContinuousTraffic]);

  const setAlgorithm = useCallback((nextAlgorithm: AlgorithmType) => {
    algorithmRef.current = nextAlgorithm;
    setAlgorithmState(nextAlgorithm);
    logEvent('SYSTEM', `Routing policy switched to ${nextAlgorithm.replaceAll('_', ' ').toLowerCase()}.`);
  }, [logEvent]);

  const toggleServerStatus = useCallback((serverId: string) => {
    const currentServer = serversRef.current.find((server) => server.id === serverId);
    if (!currentServer) return;
    const takingOffline = currentServer.status === 'ONLINE';
    const nextStatus: Server['status'] = takingOffline
      ? currentServer.activeConnections > 0
        ? 'DRAINING'
        : 'OFFLINE'
      : 'ONLINE';

    commitServers(
      serversRef.current.map((server) =>
        server.id === serverId
          ? {
              ...server,
              status: nextStatus,
              cpuLoad: nextStatus === 'OFFLINE' ? 0 : server.cpuLoad,
              responseTimeMs: nextStatus === 'OFFLINE' ? 0 : server.responseTimeMs,
            }
          : server,
      ),
    );
    if (takingOffline) {
      logEvent('WARNING', `${currentServer.name} stopped accepting new SYNs; existing flows will drain.`, undefined, serverId, 'FAILED', 'RST');
    } else {
      logEvent('SUCCESS', `${currentServer.name} rejoined the eligible TCP target pool.`, undefined, serverId, 'ROUTING', 'SYN');
    }
  }, [commitServers, logEvent]);

  const updateServerWeight = useCallback((serverId: string, weight: number) => {
    const validWeight = Math.max(1, Math.min(20, weight));
    lbStateRef.current = { ...lbStateRef.current, wrrCurrentWeights: { ...lbStateRef.current.wrrCurrentWeights, [serverId]: 0 } };
    commitServers(serversRef.current.map((server) => (server.id === serverId ? { ...server, weight: validWeight } : server)));
  }, [commitServers]);

  const clearLogs = useCallback(() => {
    setEventLogs([]);
    logEvent('SYSTEM', 'Flight recorder cleared.');
  }, [logEvent]);

  const resetSimulation = useCallback(() => {
    clearScheduledWork();
    generationRef.current += 1;
    demoAutoRef.current = false;
    reqIdCounterRef.current = 1000;
    elapsedSecondsRef.current = 0;
    recentCompletionsRef.current = [];
    lbStateRef.current = { rrIndex: -1, wrrCurrentWeights: {} };
    const freshServers = DEFAULT_SERVERS.map((server) => ({ ...server }));
    const freshClients = DEFAULT_CLIENTS.map((client) => ({ ...client }));
    serversRef.current = freshServers;
    clientsRef.current = freshClients;
    activeRequestsRef.current = [];
    requestHistoryRef.current = [];
    algorithmRef.current = 'ROUND_ROBIN';
    setServers(freshServers);
    setClients(freshClients);
    setAlgorithmState('ROUND_ROBIN');
    setActiveRequests([]);
    setRequestHistory([]);
    setEventLogs([]);
    setTimeSeriesData([]);
    setObservedRps(0);
    setSelectedRequest(null);
    setLastRouteDecision(null);
    setIsContinuousTraffic(false);
    setDemoState({ active: false, currentStep: 0, totalSteps: DEMO_STEPS, stepTitle: '', description: '', isPaused: false });
    logEvent('SYSTEM', 'Simulation reset. TCP sockets, queues, and counters are clear.');
  }, [clearScheduledWork, logEvent]);

  useEffect(() => {
    logEvent('SYSTEM', 'TCP connection lab online. Three eligible targets are listening on :8080.');
  }, [logEvent]);

  useEffect(() => {
    if (!selectedRequest) return;
    const freshRequest = activeRequests.find((request) => request.id === selectedRequest.id) ?? requestHistory.find((request) => request.id === selectedRequest.id);
    if (freshRequest && freshRequest !== selectedRequest) setSelectedRequest(freshRequest);
  }, [activeRequests, requestHistory, selectedRequest]);

  useEffect(() => {
    metricsTimerRef.current = setInterval(() => {
      elapsedSecondsRef.current += 1;
      const now = Date.now();
      recentCompletionsRef.current = recentCompletionsRef.current.filter((timestamp) => now - timestamp < 10000);
      setObservedRps(Math.round(recentCompletionsRef.current.length / 10));
      const online = serversRef.current.filter((server) => server.status !== 'OFFLINE');
      const averageLatency = online.length > 0 ? Math.round(online.reduce((sum, server) => sum + server.responseTimeMs, 0) / online.length) : 0;
      const point: TimeSeriesDataPoint = {
        timestamp: formatTimestamp(),
        time: elapsedSecondsRef.current,
        activeConnections: serversRef.current.reduce((sum, server) => sum + server.activeConnections, 0),
        synBacklog: serversRef.current.reduce((sum, server) => sum + server.halfOpenConnections, 0),
        timeWaitConnections: serversRef.current.reduce((sum, server) => sum + server.timeWaitConnections, 0),
        averageLatency,
      };
      serversRef.current.forEach((server) => {
        point[`${server.name} CPU`] = server.status === 'OFFLINE' ? 0 : server.cpuLoad;
        point[`${server.name} TCP`] = server.activeConnections;
      });
      setTimeSeriesData((previous) => [...previous.slice(-39), point]);
    }, 1000);

    return () => {
      if (metricsTimerRef.current) clearInterval(metricsTimerRef.current);
      metricsTimerRef.current = null;
    };
  }, []);

  const runDemoStep = useCallback((step: number) => {
    if (demoTimerRef.current) cancelTimer(demoTimerRef.current);
    const base = { active: true, currentStep: step, totalSteps: DEMO_STEPS, isPaused: false };
    switch (step) {
      case 1:
        setDemoState({ ...base, stepTitle: 'Open the first TCP flow', description: 'A client sends SYN to the VIP. Watch the load balancer choose the next eligible target.' });
        setAlgorithm('ROUND_ROBIN');
        sendBatchRequests(5, 'ROUND_ROBIN');
        break;
      case 2:
        setDemoState({ ...base, stepTitle: 'Let active sockets steer the next flow', description: 'Least connections reads the live table instead of blindly following a turn order.' });
        setAlgorithm('LEAST_CONNECTIONS');
        sendBatchRequests(8, 'LEAST_CONNECTIONS');
        break;
      case 3:
        setDemoState({ ...base, stepTitle: 'Remove a target without killing the story', description: 'ORBIT / 02 enters drain mode: new TCP handshakes avoid it while established connections finish.' });
        toggleServerStatus('server-2');
        break;
      case 4:
        setDemoState({ ...base, stepTitle: 'Fail over new SYNs', description: 'The eligible pool shrinks to two nodes. No new connection is routed to the draining target.' });
        sendBatchRequests(12, 'LEAST_CONNECTIONS');
        break;
      case 5:
        setDemoState({ ...base, stepTitle: 'Recover and rejoin', description: 'The listener returns to the pool. A recovered node can accept new TCP flows again.' });
        toggleServerStatus('server-2');
        sendBatchRequests(6, 'LEAST_CONNECTIONS');
        break;
      case 6:
        setDemoState({ ...base, stepTitle: 'Give capacity a voice', description: 'Weighted round robin now expresses a 5 : 3 : 2 capacity ratio across the cluster.' });
        setAlgorithm('WEIGHTED_ROUND_ROBIN');
        sendBatchRequests(20, 'WEIGHTED_ROUND_ROBIN');
        break;
      case 7:
        setDemoState({ ...base, stepTitle: 'Stress the handshake queue', description: 'A burst fills the visual SYN backlog, then established sockets drain through FIN and TIME-WAIT.' });
        sendBatchRequests(30, 'WEIGHTED_ROUND_ROBIN');
        break;
      case 8:
        demoAutoRef.current = false;
        setDemoState({ active: true, currentStep: DEMO_STEPS, totalSteps: DEMO_STEPS, stepTitle: 'The connection has a life cycle', description: 'Replay the chapters, inspect a flow, or take control of the routing policy.', isPaused: true });
        break;
      default:
        break;
    }

    if (step < DEMO_STEPS && demoAutoRef.current) {
      demoTimerRef.current = schedule(() => runDemoStepRef.current(step + 1), 4800);
    }
  }, [cancelTimer, schedule, sendBatchRequests, setAlgorithm, toggleServerStatus]);

  runDemoStepRef.current = runDemoStep;

  const startDemoMode = useCallback(() => {
    resetSimulation();
    demoAutoRef.current = true;
    schedule(() => runDemoStepRef.current(1), 450);
  }, [resetSimulation, schedule]);

  const nextDemoStep = useCallback(() => {
    if (!demoState.active || demoState.currentStep >= demoState.totalSteps) return;
    if (demoTimerRef.current) cancelTimer(demoTimerRef.current);
    demoAutoRef.current = false;
    runDemoStepRef.current(demoState.currentStep + 1);
  }, [cancelTimer, demoState.active, demoState.currentStep, demoState.totalSteps]);

  const toggleDemoPlayback = useCallback(() => {
    if (!demoState.active || demoState.currentStep >= demoState.totalSteps) return;
    if (demoState.isPaused) {
      demoAutoRef.current = true;
      setDemoState((previous) => ({ ...previous, isPaused: false }));
      demoTimerRef.current = schedule(() => runDemoStepRef.current(demoState.currentStep + 1), 800);
    } else {
      demoAutoRef.current = false;
      if (demoTimerRef.current) cancelTimer(demoTimerRef.current);
      setDemoState((previous) => ({ ...previous, isPaused: true }));
    }
  }, [cancelTimer, demoState.active, demoState.currentStep, demoState.isPaused, demoState.totalSteps, schedule]);

  const stopDemoMode = useCallback(() => {
    demoAutoRef.current = false;
    if (demoTimerRef.current) cancelTimer(demoTimerRef.current);
    setDemoState((previous) => ({ ...previous, active: false, isPaused: true }));
    logEvent('SYSTEM', 'Story mode exited. Manual TCP control restored.');
  }, [cancelTimer, logEvent]);

  useEffect(() => () => {
    generationRef.current += 1;
    clearScheduledWork(true);
  }, [clearScheduledWork]);

  const tcpMetrics = useMemo<TcpMetrics>(() => {
    const completed = requestHistory.filter((request) => request.status === 'COMPLETED');
    const reset = requestHistory.filter((request) => request.status === 'RESET');
    const failed = requestHistory.filter((request) => request.status === 'FAILED');
    const established = activeRequests.filter((request) => ['ESTABLISHED', 'FIN_WAIT', 'TIME_WAIT'].includes(request.phase)).length;
    const synBacklog = activeRequests.filter((request) => ['SYN_SENT', 'ROUTING', 'SYN_ACK', 'ACK'].includes(request.phase)).length;
    return {
      totalConnections: requestHistory.length + activeRequests.length,
      establishedConnections: established,
      closedConnections: completed.length,
      resetConnections: reset.length + failed.length,
      activeConnections: servers.reduce((sum, server) => sum + server.activeConnections, 0),
      synBacklog,
      timeWaitConnections: servers.reduce((sum, server) => sum + server.timeWaitConnections, 0),
      observedRps,
      averageHandshakeMs: completed.length ? Math.round(completed.reduce((sum, request) => sum + request.handshakeMs, 0) / completed.length) : 0,
      averageConnectionDurationMs: completed.length ? Math.round(completed.reduce((sum, request) => sum + request.connectionDurationMs, 0) / completed.length) : 0,
    };
  }, [activeRequests, observedRps, requestHistory, servers]);

  const featuredRequest = activeRequests[0] ?? requestHistory[0] ?? null;

  const value = useMemo<SimulationContextType>(() => ({
    servers,
    clients,
    algorithm,
    activeRequests,
    requestHistory,
    eventLogs,
    isContinuousTraffic,
    trafficRateRps,
    observedRps,
    timeSeriesData,
    demoState,
    selectedRequest,
    featuredRequest,
    lastRouteDecision,
    tcpMetrics,
    setAlgorithm,
    setTrafficRate,
    startContinuousTraffic,
    stopContinuousTraffic,
    sendSingleRequest,
    sendBatchRequests,
    toggleServerStatus,
    updateServerWeight,
    clearLogs,
    resetSimulation,
    startDemoMode,
    nextDemoStep,
    toggleDemoPlayback,
    stopDemoMode,
    setSelectedRequest,
  }), [
    activeRequests,
    algorithm,
    clearLogs,
    clients,
    demoState,
    eventLogs,
    featuredRequest,
    isContinuousTraffic,
    lastRouteDecision,
    nextDemoStep,
    observedRps,
    requestHistory,
    resetSimulation,
    sendBatchRequests,
    sendSingleRequest,
    setAlgorithm,
    setTrafficRate,
    startContinuousTraffic,
    startDemoMode,
    stopContinuousTraffic,
    stopDemoMode,
    tcpMetrics,
    timeSeriesData,
    toggleDemoPlayback,
    toggleServerStatus,
    updateServerWeight,
    servers,
    selectedRequest,
  ]);

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within a SimulationProvider');
  return context;
};
