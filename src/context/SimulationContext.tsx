'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Server,
  Client,
  NetworkRequest,
  AlgorithmType,
  ProtocolType,
  LogEntry,
  TimeSeriesDataPoint,
} from '../types/simulation';
import {
  DEFAULT_SERVERS,
  DEFAULT_CLIENTS,
  LOAD_BALANCER_IP,
  LOAD_BALANCER_PORT,
  LoadBalancerState,
  routeRequest,
  calculateServerMetrics,
  createNetworkRequest,
  formatTimestamp,
} from '../lib/simulationEngine';

interface DemoModeState {
  active: boolean;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  description: string;
  isPaused: boolean;
}

interface SimulationContextType {
  servers: Server[];
  clients: Client[];
  algorithm: AlgorithmType;
  protocol: ProtocolType;
  activeRequests: NetworkRequest[];
  requestHistory: NetworkRequest[];
  eventLogs: LogEntry[];
  isContinuousTraffic: boolean;
  trafficRateRps: number;
  timeSeriesData: TimeSeriesDataPoint[];
  demoState: DemoModeState;
  selectedRequest: NetworkRequest | null;

  // Actions
  setAlgorithm: (algo: AlgorithmType) => void;
  setProtocol: (proto: ProtocolType) => void;
  setTrafficRate: (rps: number) => void;
  startContinuousTraffic: (rps: number) => void;
  stopContinuousTraffic: () => void;
  sendSingleRequest: (clientIp?: string) => void;
  sendBatchRequests: (count: number) => void;
  toggleServerStatus: (serverId: string) => void;
  updateServerWeight: (serverId: string, weight: number) => void;
  clearLogs: () => void;
  resetSimulation: () => void;
  startDemoMode: () => void;
  nextDemoStep: () => void;
  stopDemoMode: () => void;
  setSelectedRequest: (req: NetworkRequest | null) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [servers, setServers] = useState<Server[]>(DEFAULT_SERVERS);
  const [clients] = useState<Client[]>(DEFAULT_CLIENTS);
  const [algorithm, setAlgorithmState] = useState<AlgorithmType>('ROUND_ROBIN');
  const [protocol, setProtocolState] = useState<ProtocolType>('TCP');
  const [activeRequests, setActiveRequests] = useState<NetworkRequest[]>([]);
  const [requestHistory, setRequestHistory] = useState<NetworkRequest[]>([]);
  const [eventLogs, setEventLogs] = useState<LogEntry[]>([]);
  const [isContinuousTraffic, setIsContinuousTraffic] = useState<boolean>(false);
  const [trafficRateRps, setTrafficRateRps] = useState<number>(5);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null);

  const [demoState, setDemoState] = useState<DemoModeState>({
    active: false,
    currentStep: 0,
    totalSteps: 8,
    stepTitle: '',
    description: '',
    isPaused: false,
  });

  const reqIdCounterRef = useRef<number>(1000);
  const lbStateRef = useRef<LoadBalancerState>({ rrIndex: -1, wrrCurrentWeights: {} });
  const continuousTimerRef = useRef<NodeJS.Timeout | null>(null);
  const metricsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedSecondsRef = useRef<number>(0);

  // Helper to append log
  const logEvent = useCallback(
    (type: LogEntry['type'], message: string, requestId?: number, serverId?: string) => {
      const entry: LogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: formatTimestamp(),
        type,
        message,
        requestId,
        serverId,
      };
      setEventLogs((prev) => [entry, ...prev.slice(0, 199)]); // keep max 200 logs
    },
    []
  );

  // Initial greeting log
  useEffect(() => {
    logEvent('SYSTEM', 'Network Load Balancer Simulator initialized. All 3 backend servers ONLINE.');
  }, [logEvent]);

  // Dispatch a single network request
  const processRequest = useCallback(
    (clientIp?: string) => {
      const reqId = ++reqIdCounterRef.current;
      const client = clientIp || clients[Math.floor(Math.random() * clients.length)].ip;
      const req = createNetworkRequest(reqId, client, protocol);

      setActiveRequests((prev) => [...prev, req]);

      setServers((currentServers) => {
        // Find server using LB algorithm
        const { selectedServer, nextState } = routeRequest(algorithm, currentServers, lbStateRef.current);
        lbStateRef.current = nextState;

        if (!selectedServer) {
          // No online server available!
          const failedReq: NetworkRequest = {
            ...req,
            status: 'FAILED',
            failureReason: '503 Service Unavailable: All backend servers offline',
            responseTimeMs: 0,
            durationMs: 50,
          };

          setActiveRequests((prev) => prev.filter((r) => r.id !== req.id));
          setRequestHistory((prev) => [failedReq, ...prev.slice(0, 499)]);
          logEvent('ERROR', `Request #${reqId} FAILED → 503 Service Unavailable (No online servers)`, reqId);
          return currentServers;
        }

        // Increment active connections and calculate realistic response time
        const updatedServers = currentServers.map((s) => {
          if (s.id === selectedServer.id) {
            const nextActive = s.activeConnections + 1;
            const metrics = calculateServerMetrics({ ...s, activeConnections: nextActive });
            return {
              ...s,
              activeConnections: nextActive,
              totalRequestsHandled: s.totalRequestsHandled + 1,
              cpuLoad: metrics.cpuLoad,
              responseTimeMs: metrics.responseTime,
            };
          }
          return s;
        });

        const selectedServerCopy = updatedServers.find((s) => s.id === selectedServer.id)!;
        const processingTime = selectedServerCopy.responseTimeMs + Math.floor(Math.random() * 20);

        // Update req info
        const updatedReq: NetworkRequest = {
          ...req,
          selectedServerId: selectedServer.id,
          selectedServerIp: `${selectedServer.ip}:${selectedServer.port}`,
          responseTimeMs: selectedServerCopy.responseTimeMs,
          durationMs: processingTime,
        };

        logEvent(
          'INFO',
          `Request #${reqId} (${protocol}) [${client}] → Assigned to ${selectedServer.name} (${selectedServer.ip}:${selectedServer.port})`,
          reqId,
          selectedServer.id
        );

        // Schedule request completion asynchronous completion
        setTimeout(() => {
          setActiveRequests((prev) => prev.filter((r) => r.id !== req.id));

          // Check if server is still online when request finishes
          setServers((latestServers) => {
            return latestServers.map((s) => {
              if (s.id === selectedServer.id) {
                const finishedActive = Math.max(0, s.activeConnections - 1);
                const postMetrics = calculateServerMetrics({ ...s, activeConnections: finishedActive });
                return {
                  ...s,
                  activeConnections: finishedActive,
                  cpuLoad: postMetrics.cpuLoad,
                  responseTimeMs: postMetrics.responseTime,
                };
              }
              return s;
            });
          });

          const completedReq: NetworkRequest = {
            ...updatedReq,
            status: 'COMPLETED',
          };

          setRequestHistory((prev) => [completedReq, ...prev.slice(0, 499)]);
          logEvent('SUCCESS', `Request #${reqId} COMPLETED in ${processingTime}ms by ${selectedServer.name}`, reqId, selectedServer.id);
        }, processingTime);

        return updatedServers;
      });
    },
    [algorithm, protocol, clients, logEvent]
  );

  const sendSingleRequest = useCallback(
    (clientIp?: string) => {
      processRequest(clientIp);
    },
    [processRequest]
  );

  const sendBatchRequests = useCallback(
    (count: number) => {
      logEvent('SYSTEM', `Dispatching batch of ${count} requests (${algorithm} / ${protocol})...`);
      const intervalMs = Math.max(10, Math.floor(1000 / Math.min(count, 50)));

      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          processRequest();
        }, i * intervalMs);
      }
    },
    [algorithm, protocol, logEvent, processRequest]
  );

  // Continuous traffic handler
  const startContinuousTraffic = useCallback(
    (rps: number) => {
      if (continuousTimerRef.current) clearInterval(continuousTimerRef.current);
      setTrafficRateRps(rps);
      setIsContinuousTraffic(true);
      logEvent('SYSTEM', `Started continuous traffic generation at ${rps} req/sec`);

      const intervalMs = 1000 / rps;
      continuousTimerRef.current = setInterval(() => {
        processRequest();
      }, intervalMs);
    },
    [logEvent, processRequest]
  );

  const stopContinuousTraffic = useCallback(() => {
    if (continuousTimerRef.current) {
      clearInterval(continuousTimerRef.current);
      continuousTimerRef.current = null;
    }
    setIsContinuousTraffic(false);
    logEvent('SYSTEM', 'Stopped continuous traffic generation');
  }, [logEvent]);

  const setTrafficRate = useCallback(
    (rps: number) => {
      setTrafficRateRps(rps);
      if (isContinuousTraffic) {
        startContinuousTraffic(rps);
      }
    },
    [isContinuousTraffic, startContinuousTraffic]
  );

  // Algorithm switch
  const setAlgorithm = useCallback(
    (algo: AlgorithmType) => {
      setAlgorithmState(algo);
      logEvent('SYSTEM', `Switched load balancing algorithm to ${algo.replace('_', ' ')}`);
    },
    [logEvent]
  );

  // Protocol switch
  const setProtocol = useCallback(
    (proto: ProtocolType) => {
      setProtocolState(proto);
      logEvent('SYSTEM', `Switched network protocol to ${proto}`);
    },
    [logEvent]
  );

  // Server Online/Offline toggle
  const toggleServerStatus = useCallback(
    (serverId: string) => {
      setServers((prev) =>
        prev.map((s) => {
          if (s.id === serverId) {
            const nextStatus = s.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
            if (nextStatus === 'OFFLINE') {
              logEvent('WARNING', `⚠️ ${s.name} (${s.ip}:${s.port}) went OFFLINE! Requests will be re-routed.`, undefined, s.id);
            } else {
              logEvent('SUCCESS', `✅ ${s.name} (${s.ip}:${s.port}) RECOVERED and is now ONLINE!`, undefined, s.id);
            }
            return {
              ...s,
              status: nextStatus,
              activeConnections: nextStatus === 'OFFLINE' ? 0 : s.activeConnections,
              cpuLoad: nextStatus === 'OFFLINE' ? 0 : s.cpuLoad,
            };
          }
          return s;
        })
      );
    },
    [logEvent]
  );

  // Weight updater
  const updateServerWeight = useCallback(
    (serverId: string, weight: number) => {
      const validWeight = Math.max(1, Math.min(20, weight));
      setServers((prev) =>
        prev.map((s) => {
          if (s.id === serverId) {
            logEvent('SYSTEM', `Updated ${s.name} weight to ${validWeight}`, undefined, s.id);
            return { ...s, weight: validWeight };
          }
          return s;
        })
      );
    },
    [logEvent]
  );

  // Clear event logs
  const clearLogs = useCallback(() => {
    setEventLogs([]);
    logEvent('SYSTEM', 'Event log cleared');
  }, [logEvent]);

  // Reset simulation completely
  const resetSimulation = useCallback(() => {
    if (continuousTimerRef.current) clearInterval(continuousTimerRef.current);
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);

    setIsContinuousTraffic(false);
    setServers(DEFAULT_SERVERS.map((s) => ({ ...s })));
    setAlgorithmState('ROUND_ROBIN');
    setProtocolState('TCP');
    setActiveRequests([]);
    setRequestHistory([]);
    setEventLogs([]);
    setTimeSeriesData([]);
    setSelectedRequest(null);
    lbStateRef.current = { rrIndex: -1, wrrCurrentWeights: {} };
    reqIdCounterRef.current = 1000;
    elapsedSecondsRef.current = 0;

    setDemoState({
      active: false,
      currentStep: 0,
      totalSteps: 8,
      stepTitle: '',
      description: '',
      isPaused: false,
    });

    logEvent('SYSTEM', 'Simulation reset to default state. All metrics and counters cleared.');
  }, [logEvent]);

  // Historical metrics ticker every 1 second
  useEffect(() => {
    metricsTimerRef.current = setInterval(() => {
      elapsedSecondsRef.current += 1;
      const timeStr = `${elapsedSecondsRef.current}s`;

      setServers((currentServers) => {
        const point: TimeSeriesDataPoint = {
          timestamp: formatTimestamp(),
          time: elapsedSecondsRef.current,
          totalRps: activeRequests.length,
          avgResponseTime:
            currentServers.filter((s) => s.status === 'ONLINE').reduce((acc, curr) => acc + curr.responseTimeMs, 0) /
              (currentServers.filter((s) => s.status === 'ONLINE').length || 1),
        };

        currentServers.forEach((s) => {
          point[`${s.name} Load`] = s.status === 'ONLINE' ? s.cpuLoad : 0;
          point[`${s.name} Conns`] = s.activeConnections;
        });

        setTimeSeriesData((prev) => [...prev.slice(-29), point]); // Keep last 30 seconds
        return currentServers;
      });
    }, 1000);

    return () => {
      if (metricsTimerRef.current) clearInterval(metricsTimerRef.current);
    };
  }, [activeRequests.length]);

  // Presentation DEMO MODE runner
  const runDemoStep = useCallback(
    (step: number) => {
      switch (step) {
        case 1:
          setDemoState({
            active: true,
            currentStep: 1,
            totalSteps: 8,
            stepTitle: 'Step 1: Baseline Round Robin Distribution',
            description: 'Starting with all 3 servers ONLINE. Distributing 10 requests using Round Robin algorithm...',
            isPaused: false,
          });
          setAlgorithmState('ROUND_ROBIN');
          sendBatchRequests(10);
          break;

        case 2:
          setDemoState({
            active: true,
            currentStep: 2,
            totalSteps: 8,
            stepTitle: 'Step 2: Switching to Least Connections',
            description: 'Switching algorithm to Least Connections. Watch requests dynamically target servers with fewer active connections...',
            isPaused: false,
          });
          setAlgorithmState('LEAST_CONNECTIONS');
          sendBatchRequests(15);
          break;

        case 3:
          setDemoState({
            active: true,
            currentStep: 3,
            totalSteps: 8,
            stepTitle: 'Step 3: Server Failure Simulation (Server 2 OFFLINE)',
            description: 'Simulating node failure! Taking Server 2 OFFLINE. The load balancer must detect failure and stop sending traffic to 192.168.1.102...',
            isPaused: false,
          });
          setServers((prev) =>
            prev.map((s) => (s.id === 'server-2' ? { ...s, status: 'OFFLINE', activeConnections: 0, cpuLoad: 0 } : s))
          );
          logEvent('WARNING', '⚠️ DEMO MODE: Server 2 (192.168.1.102) TAKEN OFFLINE by administrator', undefined, 'server-2');
          break;

        case 4:
          setDemoState({
            active: true,
            currentStep: 4,
            totalSteps: 8,
            stepTitle: 'Step 4: Traffic Routing During Server Failure',
            description: 'Sending 12 requests while Server 2 is down. Notice all traffic automatically redirects to Server 1 and Server 3 without dropping packets...',
            isPaused: false,
          });
          sendBatchRequests(12);
          break;

        case 5:
          setDemoState({
            active: true,
            currentStep: 5,
            totalSteps: 8,
            stepTitle: 'Step 5: Server Recovery',
            description: 'Recovering Server 2 back to ONLINE status. Load balancer will immediately re-include Server 2 in server pool...',
            isPaused: false,
          });
          setServers((prev) => prev.map((s) => (s.id === 'server-2' ? { ...s, status: 'ONLINE' } : s)));
          logEvent('SUCCESS', '✅ DEMO MODE: Server 2 RECOVERED to ONLINE pool', undefined, 'server-2');
          sendBatchRequests(8);
          break;

        case 6:
          setDemoState({
            active: true,
            currentStep: 6,
            totalSteps: 8,
            stepTitle: 'Step 6: Weighted Round Robin Demonstration',
            description: 'Configuring custom server weights (Server 1 = 5, Server 2 = 3, Server 3 = 2). Switching to Weighted Round Robin...',
            isPaused: false,
          });
          setAlgorithmState('WEIGHTED_ROUND_ROBIN');
          sendBatchRequests(20);
          break;

        case 7:
          setDemoState({
            active: true,
            currentStep: 7,
            totalSteps: 8,
            stepTitle: 'Step 7: High Throughput Traffic Burst',
            description: 'Generating 30 continuous requests to stress test response times and inspect server CPU load curves...',
            isPaused: false,
          });
          sendBatchRequests(30);
          break;

        case 8:
          setDemoState({
            active: true,
            currentStep: 8,
            totalSteps: 8,
            stepTitle: 'Step 8: Demo Presentation Complete!',
            description: 'All test scenarios finished! Review the live charts, request logs, and check the Algorithm Comparison section below.',
            isPaused: true,
          });
          break;
        default:
          break;
      }
    },
    [sendBatchRequests, logEvent]
  );

  const startDemoMode = useCallback(() => {
    resetSimulation();
    setTimeout(() => {
      runDemoStep(1);
    }, 500);
  }, [resetSimulation, runDemoStep]);

  const nextDemoStep = useCallback(() => {
    if (demoState.currentStep < demoState.totalSteps) {
      runDemoStep(demoState.currentStep + 1);
    }
  }, [demoState.currentStep, demoState.totalSteps, runDemoStep]);

  const stopDemoMode = useCallback(() => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    setDemoState((prev) => ({ ...prev, active: false }));
    logEvent('SYSTEM', 'Exited Demo Mode.');
  }, [logEvent]);

  return (
    <SimulationContext.Provider
      value={{
        servers,
        clients,
        algorithm,
        protocol,
        activeRequests,
        requestHistory,
        eventLogs,
        isContinuousTraffic,
        trafficRateRps,
        timeSeriesData,
        demoState,
        selectedRequest,

        setAlgorithm,
        setProtocol,
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
        stopDemoMode,
        setSelectedRequest,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
