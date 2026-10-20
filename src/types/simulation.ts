export type ServerStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED';
export type AlgorithmType = 'ROUND_ROBIN' | 'LEAST_CONNECTIONS' | 'WEIGHTED_ROUND_ROBIN';
export type ProtocolType = 'TCP' | 'UDP';
export type RequestStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'INTERRUPTED';

export interface Server {
  id: string;
  name: string;
  ip: string;
  port: number;
  protocol: ProtocolType;
  status: ServerStatus;
  activeConnections: number;
  totalRequestsHandled: number;
  failedRequests: number;
  cpuLoad: number; // 0 - 100%
  responseTimeMs: number; // ms
  weight: number; // for Weighted Round Robin
  maxCapacity: number; // max concurrent connections before degradation
}

export interface Client {
  id: string;
  name: string;
  ip: string;
  activeRequests: number;
}

export interface NetworkRequest {
  id: string;
  requestId: number;
  clientIp: string;
  sourcePort: number;
  destinationIp: string;
  destinationPort: number;
  protocol: ProtocolType;
  timestamp: string;
  startTime: number; // unix ms
  durationMs: number;
  selectedServerId: string | null;
  selectedServerIp: string | null;
  status: RequestStatus;
  responseTimeMs: number;
  failureReason?: string;
}

export interface SimulationMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  activeConnections: number;
  averageResponseTimeMs: number;
  currentTrafficRateRps: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SYSTEM';
  message: string;
  requestId?: number;
  serverId?: string;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  time: number; // seconds elapsed
  totalRps: number;
  avgResponseTime: number;
  [key: string]: number | string; // dynamic server load keys e.g. "Server 1 Load", "Server 2 Load"
}

export interface AlgorithmBenchmarkResult {
  algorithm: AlgorithmType;
  algorithmName: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTimeMs: number;
  averageServerLoadPercent: number;
  requestsPerServer: Record<string, number>;
  serverLoads: Record<string, number>;
}
