export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type AnomalyStatus = 'New' | 'Investigating' | 'Monitoring' | 'Resolved' | 'Closed';
export type WorkOrderStatus = 'Open' | 'Assigned' | 'Started' | 'In Progress' | 'Resolved' | 'Verified';
export type WorkOrderPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type SubsystemType = 'HVAC' | 'Electrical' | 'Lighting' | 'Laboratory' | 'Plumbing' | 'Safety' | 'IT / Network';

export interface Operator {
  id: string;
  name: string;
  role: string;
  level: string;
  shift: string;
  email: string;
}

export interface Team {
  id: string;
  name: string;
  lead: string;
  activeWorkOrders: number;
  specialty: SubsystemType;
}

export interface Sensor {
  id: string;
  name: string;
  type: 'Power' | 'Temperature' | 'Humidity' | 'PIR Occupancy' | 'CO2' | 'Vibration' | 'Flow' | 'Lux';
  unit: string;
  currentValue: number;
  baselineValue: number;
  status: 'online' | 'degraded' | 'offline';
  lastPing: string;
  busProtocol: 'BACnet IP' | 'Modbus RTU' | 'MQTT' | 'Zigbee Pro';
}

export interface Room {
  id: string;
  name: string;
  floor: string;
  buildingId: string;
  areaSqFt: number;
  currentKw: number;
  baselineKw: number;
  tempC: number;
  occupancyCount: number;
  scheduledActivity: string;
  hasActiveAnomaly: boolean;
  anomalyId?: string;
  sensors: Sensor[];
}

export interface Floor {
  id: string;
  level: number;
  name: string;
  buildingId: string;
  rooms: Room[];
}

export interface BuildingNode {
  id: string;
  name: string;
  shortName: string;
  category: 'Academic' | 'Laboratory' | 'Hostel' | 'Facility' | 'General';
  status: 'normal' | 'warning' | 'critical' | 'no-data';
  consumptionMWh: number;
  currentKw: number;
  expectedKw: number;
  occupancy: number;
  tempC: number;
  anomalyCount: number;
  coords: { x: number; y: number; width: number; height: number };
  isometricCoords: { x: number; y: number };
  color: string;
  floorsCount?: number;
  totalRooms?: number;
  sqm?: number;
}

export interface TelemetryPoint {
  time: string;
  actual: number;
  expected: number;
  isAnomaly?: boolean;
  occupancy?: number;
  temperature?: number;
}

export interface ContributingSignal {
  id: string;
  signalName: string;
  subsystem: SubsystemType;
  observedValue: string;
  expectedValue: string;
  deviation: string;
  confidenceContribution: number; // e.g. 42%
  status: 'critical' | 'warning' | 'nominal';
}

export interface InvestigationContext {
  incidentId: string;
  assetId: string;
  assetName: string;
  locationBreadcrumb: string;
  timestamp: string;
  durationMinutes: number;
  detectionEngine: string;
  confidenceScore: number;
  observedPowerKw: number;
  baselinePowerKw: number;
  deviationPct: number;
  indoorTempC: number;
  setpointTempC: number;
  ambientTempC: number;
  occupancyPIR: number;
  occupancyBadgeCount: number;
  scheduledClass: string;
  timetableStatus: 'Idle / Unscheduled' | 'Active Session' | 'Maintenance Window';
  estimatedKwhWastePerDay: number;
  estimatedFinancialWastePerDay: number; // USD / INR
  estimatedCo2KgPerDay: number;
  contributingSignals: ContributingSignal[];
  historicalComparison: {
    period: string;
    avgConsumptionKw: number;
    peakKw: number;
    normalVariancePct: number;
  };
  recommendedActions: {
    id: string;
    action: string;
    priority: 'Immediate' | 'Scheduled';
    assignedTeamDefault: string;
    impactPrediction: string;
  }[];
}

export interface Anomaly {
  id: string;
  severity: SeverityLevel;
  asset: string;
  assetId: string;
  buildingId: string;
  type: string;
  detectedAt: string;
  duration: string;
  status: AnomalyStatus;
  description: string;
  confidence: number;
  expectedPower: number;
  actualPower: number;
  temperature: number;
  occupancy: number;
  impactKwhPerDay: number;
  impactCostPerDay: number;
  impactCo2PerDay: number;
  recommendedAction: string;
  investigation?: InvestigationContext;
}

export interface WorkOrderStep {
  name: 'Work Order Created' | 'Assigned' | 'Started' | 'In Progress' | 'Resolved' | 'Verified';
  timestamp?: string;
  completed: boolean;
  current?: boolean;
}

export interface ResolutionRecord {
  resolvedBy: string;
  resolvedAt: string;
  rootCause: string;
  actionsTaken: string;
  partsReplaced?: string;
  powerAfterKw: number;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignedTo: string;
  assignedOperator?: string;
  teamId?: string;
  location: string;
  assetId: string;
  assetName: string;
  type: string;
  category: SubsystemType;
  detectedBy: string;
  detectedAt: string;
  dueDate: string;
  description: string;
  impactKwhPerDay: number;
  impactCostPerDay: number;
  impactCo2PerDay: number;
  recommendedAction: string;
  relatedIncidentId: string;
  steps: WorkOrderStep[];
  resolution?: ResolutionRecord;
}

export interface InsightCard {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  confidence: number;
  firstDetected?: string;
  potentialSaving?: string;
  actionText: string;
  actionType: 'incident' | 'recommendation' | 'forecast';
  assetId?: string;
}

export interface ActivityEvent {
  id: string;
  time: string;
  event: string;
  asset: string;
  user: string;
  type?: 'anomaly' | 'work-order' | 'system' | 'resolution';
}

export interface FilterState {
  assetType: string;
  status: string;
  anomaly: string;
  building: string;
  searchQuery?: string;
}

export interface SystemStatus {
  telemetryWsState: 'connected' | 'reconnecting' | 'disconnected';
  telemetryWsUrl: string;
  latencyMs: number;
  connectedDevices: number;
  totalDevices: number;
  lastSync: string;
  systemHealth: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  apiEndpoint: string;
  activeOperator: Operator;
  isMockData: boolean;
}

export interface ReportConfig {
  id: string;
  title: string;
  type: 'Energy Performance' | 'Incident Summary' | 'Building Comparison' | 'Carbon Audit' | 'Maintenance Efficiency';
  dateRange: 'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Current Quarter' | 'Year to Date';
  buildingScope: 'All Campus' | 'Academic Buildings' | 'Laboratories' | 'Hostels';
  format: 'CSV' | 'PDF' | 'JSON';
  generatedAt?: string;
  recordsCount?: number;
}
