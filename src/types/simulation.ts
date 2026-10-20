export type ServerStatus = 'ONLINE' | 'DRAINING' | 'OFFLINE';
export type AlgorithmType = 'ROUND_ROBIN' | 'LEAST_CONNECTIONS' | 'WEIGHTED_ROUND_ROBIN';
export type ProtocolType = 'TCP';

/** The visible chapters of one simulated TCP connection. */
export type TcpPhase =
  | 'SYN_SENT'
  | 'ROUTING'
  | 'SYN_ACK'
  | 'ACK'
  | 'ESTABLISHED'
  | 'FIN_WAIT'
  | 'TIME_WAIT'
  | 'RST'
  | 'CLOSED'
  | 'FAILED';

export type RequestStatus = 'CONNECTING' | 'ESTABLISHED' | 'CLOSING' | 'COMPLETED' | 'FAILED' | 'RESET';
export type TcpFlag = 'SYN' | 'SYN-ACK' | 'ACK' | 'DATA' | 'FIN' | 'RST';

export interface Server {
  id: string;
  name: string;
  ip: string;
  port: number;
  protocol: ProtocolType;
  status: ServerStatus;
  activeConnections: number;
  halfOpenConnections: number;
  timeWaitConnections: number;
  totalConnectionsHandled: number;
  failedConnections: number;
  cpuLoad: number;
  responseTimeMs: number;
  weight: number;
  maxCapacity: number;
  zone: string;
}

export interface Client {
  id: string;
  name: string;
  ip: string;
  activeConnections: number;
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
  startTime: number;
  phaseStartedAt: number;
  durationMs: number;
  handshakeMs: number;
  connectionDurationMs: number;
  selectedServerId: string | null;
  selectedServerIp: string | null;
  phase: TcpPhase;
  currentFlag: TcpFlag;
  status: RequestStatus;
  sequenceNumber: number;
  acknowledgementNumber: number;
  responseTimeMs: number;
  failureReason?: string;
}

export interface RouteDecision {
  requestId: number;
  algorithm: AlgorithmType;
  candidateServerIds: string[];
  selectedServerId: string | null;
  rationale: string;
  scores: Record<string, number>;
}

export interface TcpMetrics {
  totalConnections: number;
  establishedConnections: number;
  closedConnections: number;
  resetConnections: number;
  activeConnections: number;
  synBacklog: number;
  timeWaitConnections: number;
  observedRps: number;
  averageHandshakeMs: number;
  averageConnectionDurationMs: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SYSTEM';
  message: string;
  phase?: TcpPhase;
  flag?: TcpFlag;
  requestId?: number;
  serverId?: string;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  time: number;
  activeConnections: number;
  synBacklog: number;
  timeWaitConnections: number;
  averageLatency: number;
  [key: string]: number | string;
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
  targetDistribution: string;
}

export interface DemoModeState {
  active: boolean;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  description: string;
  isPaused: boolean;
}
