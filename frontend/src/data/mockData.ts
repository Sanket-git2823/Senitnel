import {
  Anomaly,
  ActivityEvent,
  WorkOrder,
  InsightCard,
  BuildingNode,
  TelemetryPoint,
  InvestigationContext,
  Operator,
  Team,
  SystemStatus,
  Floor
} from '../types/sentinel';

export const CURRENT_OPERATOR: Operator = {
  id: 'OP-042',
  name: 'Sanket Patel',
  role: 'Senior Facilities Operations Engineer',
  level: 'Tier 2 Controller',
  shift: 'Shift A (07:00 – 19:00)',
  email: 'sanket.patel@sentinel.campus.local'
};

export const TEAMS: Team[] = [
  { id: 'team-hvac', name: 'Facilities HVAC Response Team', lead: 'Marcus Vance', activeWorkOrders: 3, specialty: 'HVAC' },
  { id: 'team-elec', name: 'Electrical Engineering & Distribution', lead: 'Sarah Chen', activeWorkOrders: 2, specialty: 'Electrical' },
  { id: 'team-bms', name: 'Automation & BMS Controls', lead: 'David Rodriguez', activeWorkOrders: 1, specialty: 'IT / Network' },
  { id: 'team-plumb', name: 'Plumbing & Hydraulic Infrastructure', lead: 'Elena Rostova', activeWorkOrders: 0, specialty: 'Plumbing' }
];

export const INITIAL_SYSTEM_STATUS: SystemStatus = {
  telemetryWsState: 'connected',
  telemetryWsUrl: 'wss://telemetry.campus.internal:8443/v1/stream',
  latencyMs: 18,
  connectedDevices: 1428,
  totalDevices: 1432,
  lastSync: '1.8s ago',
  systemHealth: 'OPERATIONAL',
  apiEndpoint: 'https://sentinel-core.campus.internal/api/v1',
  activeOperator: CURRENT_OPERATOR,
  isMockData: true
};

export const INITIAL_BUILDINGS: BuildingNode[] = [
  {
    id: 'acad-a',
    name: 'Academic Block A',
    shortName: 'Block A',
    category: 'Academic',
    status: 'normal',
    consumptionMWh: 0.52,
    currentKw: 42.5,
    expectedKw: 45.0,
    occupancy: 240,
    tempC: 24.2,
    anomalyCount: 0,
    coords: { x: 310, y: 190, width: 90, height: 60 },
    isometricCoords: { x: 340, y: 310 },
    color: '#10B981',
    floorsCount: 4,
    totalRooms: 48,
    sqm: 14200
  },
  {
    id: 'acad-b',
    name: 'Academic Block B',
    shortName: 'Block B',
    category: 'Academic',
    status: 'warning',
    consumptionMWh: 1.18,
    currentKw: 96.2,
    expectedKw: 72.0,
    occupancy: 18,
    tempC: 25.1,
    anomalyCount: 1,
    coords: { x: 440, y: 140, width: 85, height: 60 },
    isometricCoords: { x: 445, y: 300 },
    color: '#F59E0B',
    floorsCount: 3,
    totalRooms: 36,
    sqm: 11500
  },
  {
    id: 'lab-complex',
    name: 'Academic Block A / Lab Complex (Lab 204)',
    shortName: 'Lab Complex',
    category: 'Laboratory',
    status: 'critical',
    consumptionMWh: 2.31,
    currentKw: 184.8,
    expectedKw: 110.0,
    occupancy: 0,
    tempC: 27.4,
    anomalyCount: 2,
    coords: { x: 580, y: 160, width: 95, height: 65 },
    isometricCoords: { x: 575, y: 340 },
    color: '#EF4444',
    floorsCount: 4,
    totalRooms: 32,
    sqm: 9800
  },
  {
    id: 'library',
    name: 'Central Library',
    shortName: 'Library',
    category: 'General',
    status: 'normal',
    consumptionMWh: 0.28,
    currentKw: 28.3,
    expectedKw: 30.0,
    occupancy: 95,
    tempC: 23.5,
    anomalyCount: 0,
    coords: { x: 470, y: 240, width: 75, height: 50 },
    isometricCoords: { x: 475, y: 430 },
    color: '#10B981',
    floorsCount: 3,
    totalRooms: 20,
    sqm: 8500
  },
  {
    id: 'hostel-a',
    name: 'Hostel A (North Residence)',
    shortName: 'Hostel A',
    category: 'Hostel',
    status: 'warning',
    consumptionMWh: 1.02,
    currentKw: 88.4,
    expectedKw: 65.0,
    occupancy: 42,
    tempC: 26.0,
    anomalyCount: 1,
    coords: { x: 310, y: 310, width: 80, height: 55 },
    isometricCoords: { x: 320, y: 475 },
    color: '#F59E0B',
    floorsCount: 5,
    totalRooms: 120,
    sqm: 16000
  },
  {
    id: 'hostel-b',
    name: 'Hostel B (South Residence)',
    shortName: 'Hostel B',
    category: 'Hostel',
    status: 'normal',
    consumptionMWh: 0.95,
    currentKw: 76.1,
    expectedKw: 78.0,
    occupancy: 110,
    tempC: 24.8,
    anomalyCount: 0,
    coords: { x: 530, y: 330, width: 80, height: 55 },
    isometricCoords: { x: 535, y: 535 },
    color: '#10B981',
    floorsCount: 5,
    totalRooms: 120,
    sqm: 16000
  },
  {
    id: 'facilities-cen',
    name: 'Central Utility Plant & Substation 1',
    shortName: 'Utility Plant',
    category: 'Facility',
    status: 'normal',
    consumptionMWh: 3.12,
    currentKw: 245.0,
    expectedKw: 240.0,
    occupancy: 6,
    tempC: 28.0,
    anomalyCount: 0,
    coords: { x: 670, y: 280, width: 85, height: 60 },
    isometricCoords: { x: 670, y: 460 },
    color: '#10B981',
    floorsCount: 2,
    totalRooms: 14,
    sqm: 7200
  }
];

export const LAB_204_INVESTIGATION: InvestigationContext = {
  incidentId: 'ANO-101',
  assetId: 'lab-204',
  assetName: 'Lab 204 — Advanced Robotics & Mechatronics',
  locationBreadcrumb: 'Campus / Academic Block A / Level 2 / Room 204',
  timestamp: '23:08:33 IST',
  durationMinutes: 31,
  detectionEngine: 'Sentinel SentinelCore-v4.2 (IsolationForest + TemporalLSTM Ensemble)',
  confidenceScore: 92,
  observedPowerKw: 3.82,
  baselinePowerKw: 0.98,
  deviationPct: 289.8,
  indoorTempC: 27.4,
  setpointTempC: 21.0,
  ambientTempC: 24.1,
  occupancyPIR: 0,
  occupancyBadgeCount: 0,
  scheduledClass: 'None (Scheduled Idle Window)',
  timetableStatus: 'Idle / Unscheduled',
  estimatedKwhWastePerDay: 68.2,
  estimatedFinancialWastePerDay: 52.40,
  estimatedCo2KgPerDay: 41.6,
  contributingSignals: [
    {
      id: 'sig-1',
      signalName: 'FCU-204 Reheat Valve Actuator',
      subsystem: 'HVAC',
      observedValue: '78% Stuck Open',
      expectedValue: '0% (Closed)',
      deviation: '+78%',
      confidenceContribution: 44,
      status: 'critical'
    },
    {
      id: 'sig-2',
      signalName: 'Chilled Water Supply Bypass Delta-T',
      subsystem: 'HVAC',
      observedValue: '1.4°C Delta',
      expectedValue: '5.5°C Normal',
      deviation: '-74.5%',
      confidenceContribution: 28,
      status: 'critical'
    },
    {
      id: 'sig-3',
      signalName: 'Room PIR Occupancy Sensor (PIR-L2-04)',
      subsystem: 'Safety',
      observedValue: '0 Motion pulses / 45m',
      expectedValue: '0 Motion pulses',
      deviation: '0% (Confirmed Empty)',
      confidenceContribution: 12,
      status: 'nominal'
    },
    {
      id: 'sig-4',
      signalName: 'Active Workstation Plug Load Bank',
      subsystem: 'Laboratory',
      observedValue: '0.85 kW Standby',
      expectedValue: '0.80 kW Baseline',
      deviation: '+6.25%',
      confidenceContribution: 8,
      status: 'nominal'
    }
  ],
  historicalComparison: {
    period: 'Same Day/Hour (Last 4 Mondays)',
    avgConsumptionKw: 0.94,
    peakKw: 1.12,
    normalVariancePct: 6.8
  },
  recommendedActions: [
    {
      id: 'rec-1',
      action: 'Dispatch HVAC technician to calibrate or override sticky reheat valve actuator on FCU-204.',
      priority: 'Immediate',
      assignedTeamDefault: 'Facilities HVAC Response Team',
      impactPrediction: 'Restores power consumption from 3.82 kW back to ~0.98 kW baseline; saves $52.40/day.'
    },
    {
      id: 'rec-2',
      action: 'Force software BMS fallback setpoint to 24°C eco-mode until physical valve actuator verification is complete.',
      priority: 'Immediate',
      assignedTeamDefault: 'Automation & BMS Controls',
      impactPrediction: 'Mitigates immediate thermal overshoot and reduces compressor cycling.'
    }
  ]
};

export const INITIAL_ANOMALIES: Anomaly[] = [
  {
    id: 'ANO-101',
    severity: 'critical',
    asset: 'Lab 204 (Academic Block A)',
    assetId: 'lab-204',
    buildingId: 'lab-complex',
    type: 'High Power Draw in Unoccupied Space',
    detectedAt: '23:08:33',
    duration: '31m',
    status: 'New',
    description: 'Lab 204 is drawing 3.82 kW (baseline: 0.98 kW, +289.8% deviation) with 0 occupants detected and no scheduled classes.',
    confidence: 92,
    expectedPower: 0.98,
    actualPower: 3.82,
    temperature: 27.4,
    occupancy: 0,
    impactKwhPerDay: 68.2,
    impactCostPerDay: 52.40,
    impactCo2PerDay: 41.6,
    recommendedAction: 'Inspect FCU-204 reheat valve actuator, verify BACnet valve feedback, and revert manual override.',
    investigation: LAB_204_INVESTIGATION
  },
  {
    id: 'ANO-102',
    severity: 'high',
    asset: 'Hostel A – Wing 2 / Room 105',
    assetId: 'hostel-a-105',
    buildingId: 'hostel-a',
    type: 'AC Continuous Run in Vacant Quarters',
    detectedAt: '22:45:10',
    duration: '54m',
    status: 'Investigating',
    description: 'Split inverter unit running continuously at 18°C setpoint while optical sensor confirms room unoccupied.',
    confidence: 89,
    expectedPower: 0.15,
    actualPower: 1.85,
    temperature: 19.1,
    occupancy: 0,
    impactKwhPerDay: 40.8,
    impactCostPerDay: 31.20,
    impactCo2PerDay: 24.8,
    recommendedAction: 'Trigger remote BMS setpoint override to 26°C or alert floor supervisor.'
  },
  {
    id: 'ANO-103',
    severity: 'high',
    asset: 'Academic Block B – Level 2 Corridors',
    assetId: 'acad-b-l2',
    buildingId: 'acad-b',
    type: 'Architectural Lighting Over-illumination',
    detectedAt: '22:15:08',
    duration: '1h 24m',
    status: 'New',
    description: 'Level 2 corridor luminaires running at 100% lux (2.10 kW vs 0.40 kW baseline) during curfew hours.',
    confidence: 95,
    expectedPower: 0.40,
    actualPower: 2.10,
    temperature: 25.1,
    occupancy: 0,
    impactKwhPerDay: 38.4,
    impactCostPerDay: 29.50,
    impactCo2PerDay: 23.4,
    recommendedAction: 'Verify DALI relay timer and photocell sensor daylight threshold trigger.'
  },
  {
    id: 'ANO-104',
    severity: 'medium',
    asset: 'Central Library – Chilled Water Loop',
    assetId: 'lib-chiller',
    buildingId: 'library',
    type: 'Low Delta-T Thermal Inefficiency',
    detectedAt: '21:30:22',
    duration: '2h 09m',
    status: 'Investigating',
    description: 'Secondary chilled water delta-T compressed to 1.8°C across AHU-2 coil; pump VFD over-cycling.',
    confidence: 81,
    expectedPower: 4.20,
    actualPower: 6.80,
    temperature: 23.5,
    occupancy: 95,
    impactKwhPerDay: 58.0,
    impactCostPerDay: 44.50,
    impactCo2PerDay: 35.3,
    recommendedAction: 'Inspect modulating 2-way valve positioning and test differential pressure transmitter.'
  },
  {
    id: 'ANO-105',
    severity: 'medium',
    asset: 'Auditorium Main Stage Rack',
    assetId: 'audi-main',
    buildingId: 'acad-a',
    type: 'Vampire Standby Draw Post-Event',
    detectedAt: '20:12:44',
    duration: '3h 27m',
    status: 'Monitoring',
    description: 'Main audio processing line and stage dimmers pulling 1.40 kW baseline outside operating timetable.',
    confidence: 84,
    expectedPower: 0.20,
    actualPower: 1.40,
    temperature: 24.5,
    occupancy: 0,
    impactKwhPerDay: 28.8,
    impactCostPerDay: 22.10,
    impactCo2PerDay: 17.5,
    recommendedAction: 'Engage motorized breaker shunt trip or review audio rack automated shutdown script.'
  },
  {
    id: 'ANO-106',
    severity: 'low',
    asset: 'Utility Plant – Solar Inverter 2',
    assetId: 'solar-inv-2',
    buildingId: 'facilities-cen',
    type: 'IGBT Heatsink Elevated Thermal Baseline',
    detectedAt: '19:40:15',
    duration: '4h 00m',
    status: 'Monitoring',
    description: 'Inverter 2 heatsink temperature 58°C (+12°C over nominal at 60% load); fan tachometer indicates mild friction.',
    confidence: 76,
    expectedPower: 12.0,
    actualPower: 11.2,
    temperature: 58.0,
    occupancy: 0,
    impactKwhPerDay: 12.0,
    impactCostPerDay: 9.20,
    impactCo2PerDay: 7.3,
    recommendedAction: 'Clean intake air louvers and schedule bearing lubrication during morning preventive maintenance.'
  },
  {
    id: 'ANO-107',
    severity: 'low',
    asset: 'Research Center – Exhaust Blower EF-4',
    assetId: 'res-vent',
    buildingId: 'acad-a',
    type: 'Mechanical Vibration Harmonic Anomaly',
    detectedAt: '18:50:00',
    duration: '4h 50m',
    status: 'Monitoring',
    description: 'Piezoelectric sensor detects 45 Hz harmonic oscillation on exhaust blower mounting frame.',
    confidence: 73,
    expectedPower: 2.10,
    actualPower: 2.40,
    temperature: 26.2,
    occupancy: 12,
    impactKwhPerDay: 7.2,
    impactCostPerDay: 5.50,
    impactCo2PerDay: 4.4,
    recommendedAction: 'Inspect V-belt tension and shaft alignment during next weekend shutdown window.'
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-7821',
    title: 'Inspect HVAC Reheat Actuator – LAB-204',
    priority: 'Critical',
    status: 'Open',
    assignedTo: 'Facilities HVAC Response Team',
    assignedOperator: 'Marcus Vance (Lead Tech)',
    teamId: 'team-hvac',
    location: 'Academic Block A / Level 2 / Room 204',
    assetId: 'HVAC-204',
    assetName: 'Lab 204 FCU & Reheat Coil',
    type: 'HVAC Mechanical Repair',
    category: 'HVAC',
    detectedBy: 'Sentinel AI Engine (Ensemble Core)',
    detectedAt: '23:09:15 IST',
    dueDate: '2026-11-10 03:00 IST (4 hr SLA)',
    description: 'Abnormal power spike to 3.82 kW during vacant timetable window. BMS telemetry indicates FCU reheat valve is stuck at 78% open position, causing continuous reheat cycle against cooling stage.',
    impactKwhPerDay: 68.2,
    impactCostPerDay: 52.40,
    impactCo2PerDay: 41.6,
    recommendedAction: 'Inspect FCU-204 actuator motor, verify 0-10V analog command signal from DDC controller, recalibrate valve seating, and clear manual mechanical override.',
    relatedIncidentId: 'ANO-101 — High Power Draw in Unoccupied Space',
    steps: [
      { name: 'Work Order Created', timestamp: '23:09:15 IST', completed: true },
      { name: 'Assigned', timestamp: '23:10:02 IST', completed: true },
      { name: 'Started', completed: false, current: true },
      { name: 'In Progress', completed: false },
      { name: 'Resolved', completed: false },
      { name: 'Verified', completed: false }
    ]
  },
  {
    id: 'WO-7820',
    title: 'AC Setpoint & Occupancy Timeout – Hostel A-105',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Electrical Engineering & Distribution',
    assignedOperator: 'Sarah Chen',
    teamId: 'team-elec',
    location: 'Hostel A / Floor 1 / Room 105',
    assetId: 'AC-H105',
    assetName: 'Split Inverter AC Unit #105',
    type: 'Controls Recalibration',
    category: 'HVAC',
    detectedBy: 'Sentinel AI Engine',
    detectedAt: '22:45:10 IST',
    dueDate: '2026-11-10 06:00 IST',
    description: 'AC unit drawing 1.85 kW with zero motion detected for over 45 minutes.',
    impactKwhPerDay: 40.8,
    impactCostPerDay: 31.20,
    impactCo2PerDay: 24.8,
    recommendedAction: 'Flash thermostat firmware with automatic 20-minute unoccupied standby cutoff.',
    relatedIncidentId: 'ANO-102 — Vacant AC Operation',
    steps: [
      { name: 'Work Order Created', timestamp: '22:45:30 IST', completed: true },
      { name: 'Assigned', timestamp: '22:48:00 IST', completed: true },
      { name: 'Started', timestamp: '22:55:00 IST', completed: true },
      { name: 'In Progress', timestamp: '23:05:00 IST', completed: true, current: true },
      { name: 'Resolved', completed: false },
      { name: 'Verified', completed: false }
    ]
  },
  {
    id: 'WO-7819',
    title: 'DALI Lighting Schedule Override – Block B L2',
    priority: 'High',
    status: 'Open',
    assignedTo: 'Electrical Engineering & Distribution',
    assignedOperator: 'Sarah Chen',
    teamId: 'team-elec',
    location: 'Academic Block B / Level 2',
    assetId: 'LTG-BLK-B2',
    assetName: 'Corridor & Seminar Lighting Master Relay',
    type: 'Lighting Schedule',
    category: 'Lighting',
    detectedBy: 'Sentinel AI Engine',
    detectedAt: '22:15:08 IST',
    dueDate: '2026-11-10 08:00 IST',
    description: 'Corridor luminaires at 100% lux outside occupancy window.',
    impactKwhPerDay: 38.4,
    impactCostPerDay: 29.50,
    impactCo2PerDay: 23.4,
    recommendedAction: 'Reset DALI bus controller gateway and verify motion sensor lux override.',
    relatedIncidentId: 'ANO-103 — Lighting Over-illumination',
    steps: [
      { name: 'Work Order Created', timestamp: '22:16:00 IST', completed: true },
      { name: 'Assigned', completed: false, current: true },
      { name: 'Started', completed: false },
      { name: 'In Progress', completed: false },
      { name: 'Resolved', completed: false },
      { name: 'Verified', completed: false }
    ]
  },
  {
    id: 'WO-7818',
    title: 'AHU-2 Modulating Valve Actuator Recalibration',
    priority: 'Medium',
    status: 'Assigned',
    assignedTo: 'Automation & BMS Controls',
    assignedOperator: 'David Rodriguez',
    teamId: 'team-bms',
    location: 'Central Library / Mechanical Basement',
    assetId: 'CHILL-LIB-01',
    assetName: 'AHU-2 Modulating 2-Way Valve',
    type: 'BMS Actuator Tune',
    category: 'HVAC',
    detectedBy: 'Sentinel AI Engine',
    detectedAt: '21:30:22 IST',
    dueDate: '2026-11-10 12:00 IST',
    description: 'Chilled water supply delta T has compressed below 2.0°C.',
    impactKwhPerDay: 58.0,
    impactCostPerDay: 44.50,
    impactCo2PerDay: 35.3,
    recommendedAction: 'Calibrate Honeywell Modutrol valve stroke and purge air bubbles from supply lines.',
    relatedIncidentId: 'ANO-104 — Low Delta-T Inefficiency',
    steps: [
      { name: 'Work Order Created', timestamp: '21:31:00 IST', completed: true },
      { name: 'Assigned', timestamp: '21:40:00 IST', completed: true, current: true },
      { name: 'Started', completed: false },
      { name: 'In Progress', completed: false },
      { name: 'Resolved', completed: false },
      { name: 'Verified', completed: false }
    ]
  }
];

export const INITIAL_ACTIVITY: ActivityEvent[] = [
  { id: 'act-1', time: '23:09:15', event: 'Work Order Created (WO-7821)', asset: 'Lab 204 (HVAC-204)', user: 'Sanket Patel', type: 'work-order' },
  { id: 'act-2', time: '23:08:33', event: 'Critical Anomaly Flagged (ANO-101)', asset: 'Lab 204', user: 'Sentinel AI Core', type: 'anomaly' },
  { id: 'act-3', time: '22:55:00', event: 'Work Order In Progress (WO-7820)', asset: 'Hostel A – Rm 105', user: 'Sarah Chen', type: 'work-order' },
  { id: 'act-4', time: '22:45:10', event: 'High Severity Anomaly Flagged (ANO-102)', asset: 'Hostel A', user: 'Sentinel AI Core', type: 'anomaly' },
  { id: 'act-5', time: '22:15:08', event: 'Lighting Anomaly Flagged (ANO-103)', asset: 'Academic Block B', user: 'Sentinel AI Core', type: 'anomaly' }
];

export const INITIAL_INSIGHTS: InsightCard[] = [
  {
    id: 'ins-1',
    severity: 'CRITICAL',
    title: 'Severe Ghost Load Detected — Lab 204',
    description: 'Lab 204 drawing 3.82 kW (vs 0.98 kW baseline). Occupancy is 0 and no classes scheduled. Reheat valve actuator suspected stuck.',
    confidence: 92,
    firstDetected: '31m ago',
    potentialSaving: '$52.40/day',
    actionText: 'Investigate Incident',
    actionType: 'incident',
    assetId: 'lab-204'
  },
  {
    id: 'ins-2',
    severity: 'HIGH',
    title: 'Chiller Plant Optimization Opportunity',
    description: 'Library AHU-2 experiencing low delta-T syndrome. Modulating valve recalibration can save ~58 kWh/day.',
    confidence: 81,
    potentialSaving: '$44.50/day',
    actionText: 'View Recommendation',
    actionType: 'recommendation',
    assetId: 'library'
  },
  {
    id: 'ins-3',
    severity: 'MEDIUM',
    title: 'Peak Demand Alert Forecast',
    description: 'Projected campus demand peak of 1.48 MW tomorrow at 11:30 AM will breach contracted demand tariff by 6.2%.',
    confidence: 78,
    actionText: 'View Forecast',
    actionType: 'forecast'
  }
];

// Telemetry Series for Lab 204: Shows normal daytime usage, dip into evening, sudden spike at 22:38, and post-resolution return to baseline
export const LAB_204_TELEMETRY: TelemetryPoint[] = [
  { time: '17:00', actual: 4.80, expected: 4.90, occupancy: 24, temperature: 23.2 },
  { time: '18:00', actual: 4.10, expected: 4.20, occupancy: 16, temperature: 23.5 },
  { time: '19:00', actual: 2.30, expected: 2.20, occupancy: 4, temperature: 23.8 },
  { time: '20:00', actual: 1.10, expected: 1.05, occupancy: 0, temperature: 24.0 },
  { time: '21:00', actual: 1.00, expected: 0.98, occupancy: 0, temperature: 24.1 },
  { time: '22:00', actual: 0.98, expected: 0.98, occupancy: 0, temperature: 24.2 },
  { time: '22:30', actual: 1.05, expected: 0.98, occupancy: 0, temperature: 24.3 },
  { time: '22:38', actual: 3.82, expected: 0.98, isAnomaly: true, occupancy: 0, temperature: 26.1 },
  { time: '22:45', actual: 3.85, expected: 0.98, isAnomaly: true, occupancy: 0, temperature: 26.8 },
  { time: '23:00', actual: 3.82, expected: 0.98, isAnomaly: true, occupancy: 0, temperature: 27.2 },
  { time: '23:15', actual: 3.80, expected: 0.98, isAnomaly: true, occupancy: 0, temperature: 27.4 },
  { time: '23:30', actual: 3.82, expected: 0.98, isAnomaly: true, occupancy: 0, temperature: 27.4 }
];

export const LAB_204_TELEMETRY_RESOLVED: TelemetryPoint[] = [
  ...LAB_204_TELEMETRY.slice(0, 11),
  { time: '23:30', actual: 1.95, expected: 0.98, isAnomaly: false, occupancy: 0, temperature: 25.8 },
  { time: '23:35', actual: 1.05, expected: 0.98, isAnomaly: false, occupancy: 0, temperature: 24.4 },
  { time: '23:40', actual: 0.98, expected: 0.98, isAnomaly: false, occupancy: 0, temperature: 23.9 }
];

export const CAMPUS_ENERGY_DISTRIBUTION = [
  { name: 'HVAC & Chiller Plants', value: 48, kwh: 4210, cost: '$3,240' },
  { name: 'Lighting & Architectural', value: 22, kwh: 1930, cost: '$1,480' },
  { name: 'Lab Equipment & Power Banks', value: 18, kwh: 1578, cost: '$1,210' },
  { name: 'IT Infrastructure & Data Center', value: 8, kwh: 702, cost: '$540' },
  { name: 'Hydraulic Pumps & Utilities', value: 4, kwh: 350, cost: '$270' }
];

export const BUILDING_ENERGY_COMPARISON = [
  { name: 'Utility Plant', current: 245.0, baseline: 240.0, variance: '+2.1%' },
  { name: 'Lab Complex', current: 184.8, baseline: 110.0, variance: '+68.0%' },
  { name: 'Academic Block B', current: 96.2, baseline: 72.0, variance: '+33.6%' },
  { name: 'Hostel A', current: 88.4, baseline: 65.0, variance: '+36.0%' },
  { name: 'Hostel B', current: 76.1, baseline: 78.0, variance: '-2.4%' },
  { name: 'Academic Block A', current: 42.5, baseline: 45.0, variance: '-5.5%' },
  { name: 'Central Library', current: 28.3, baseline: 30.0, variance: '-5.6%' }
];

export const PEAK_DEMAND_CURVE = [
  { time: '00:00', demandKw: 420, thresholdKw: 1400 },
  { time: '03:00', demandKw: 380, thresholdKw: 1400 },
  { time: '06:00', demandKw: 590, thresholdKw: 1400 },
  { time: '09:00', demandKw: 1120, thresholdKw: 1400 },
  { time: '11:30', demandKw: 1390, thresholdKw: 1400 },
  { time: '14:00', demandKw: 1310, thresholdKw: 1400 },
  { time: '17:00', demandKw: 1050, thresholdKw: 1400 },
  { time: '20:00', demandKw: 860, thresholdKw: 1400 },
  { time: '23:00', demandKw: 680, thresholdKw: 1400 }
];

export const CAMPUS_FLOORS_ACAD_A: Floor[] = [
  {
    id: 'floor-acad-a-l1',
    level: 1,
    name: 'Level 1 — Classrooms & Lecture Halls',
    buildingId: 'acad-a',
    rooms: [
      {
        id: 'room-101',
        name: 'Lecture Hall 101',
        floor: 'Level 1',
        buildingId: 'acad-a',
        areaSqFt: 1800,
        currentKw: 6.2,
        baselineKw: 6.5,
        tempC: 23.8,
        occupancyCount: 84,
        scheduledActivity: 'ENG-201 Thermodynamics',
        hasActiveAnomaly: false,
        sensors: [
          { id: 's-101-pwr', name: 'Power Meter 101', type: 'Power', unit: 'kW', currentValue: 6.2, baselineValue: 6.5, status: 'online', lastPing: '12s ago', busProtocol: 'Modbus RTU' },
          { id: 's-101-tmp', name: 'Temp Probe 101', type: 'Temperature', unit: '°C', currentValue: 23.8, baselineValue: 23.5, status: 'online', lastPing: '8s ago', busProtocol: 'BACnet IP' },
          { id: 's-101-pir', name: 'PIR Motion 101', type: 'PIR Occupancy', unit: 'Count', currentValue: 84, baselineValue: 80, status: 'online', lastPing: '4s ago', busProtocol: 'Zigbee Pro' }
        ]
      },
      {
        id: 'room-102',
        name: 'Classroom 102',
        floor: 'Level 1',
        buildingId: 'acad-a',
        areaSqFt: 950,
        currentKw: 2.4,
        baselineKw: 2.5,
        tempC: 24.0,
        occupancyCount: 32,
        scheduledActivity: 'MAT-304 Calculus',
        hasActiveAnomaly: false,
        sensors: []
      }
    ]
  },
  {
    id: 'floor-acad-a-l2',
    level: 2,
    name: 'Level 2 — Laboratories & Research Bays',
    buildingId: 'acad-a',
    rooms: [
      {
        id: 'lab-204',
        name: 'Lab 204 — Robotics & Mechatronics',
        floor: 'Level 2',
        buildingId: 'acad-a',
        areaSqFt: 1450,
        currentKw: 3.82,
        baselineKw: 0.98,
        tempC: 27.4,
        occupancyCount: 0,
        scheduledActivity: 'None (Unscheduled / Idle)',
        hasActiveAnomaly: true,
        anomalyId: 'ANO-101',
        sensors: [
          { id: 's-204-pwr', name: 'Sub-panel Meter PM-204', type: 'Power', unit: 'kW', currentValue: 3.82, baselineValue: 0.98, status: 'online', lastPing: '2s ago', busProtocol: 'Modbus RTU' },
          { id: 's-204-tmp', name: 'Thermostat Zone Sensor TS-204', type: 'Temperature', unit: '°C', currentValue: 27.4, baselineValue: 21.0, status: 'online', lastPing: '5s ago', busProtocol: 'BACnet IP' },
          { id: 's-204-pir', name: 'Ceiling PIR Motion PIR-204', type: 'PIR Occupancy', unit: 'Count', currentValue: 0, baselineValue: 0, status: 'online', lastPing: '1s ago', busProtocol: 'Zigbee Pro' },
          { id: 's-204-act', name: 'FCU-204 Reheat Valve Positioner', type: 'Flow', unit: '% Open', currentValue: 78, baselineValue: 0, status: 'degraded', lastPing: '3s ago', busProtocol: 'BACnet IP' },
          { id: 's-204-co2', name: 'Indoor Air Quality CO2 Monitor', type: 'CO2', unit: 'ppm', currentValue: 420, baselineValue: 415, status: 'online', lastPing: '10s ago', busProtocol: 'MQTT' }
        ]
      },
      {
        id: 'lab-205',
        name: 'Lab 205 — Nano-Materials Synthesis',
        floor: 'Level 2',
        buildingId: 'acad-a',
        areaSqFt: 1200,
        currentKw: 4.1,
        baselineKw: 4.0,
        tempC: 22.0,
        occupancyCount: 2,
        scheduledActivity: 'Overnight Crystallization Assay',
        hasActiveAnomaly: false,
        sensors: []
      }
    ]
  }
];

export const TELEMETRY_POWER_SERIES: TelemetryPoint[] = LAB_204_TELEMETRY;
export const TELEMETRY_TEMP_SERIES = [
  { time: '17:00', actual: 23.2, expected: 23.0 },
  { time: '18:00', actual: 23.5, expected: 23.0 },
  { time: '19:00', actual: 23.8, expected: 23.0 },
  { time: '20:00', actual: 24.0, expected: 22.5 },
  { time: '21:00', actual: 24.1, expected: 22.0 },
  { time: '22:00', actual: 24.2, expected: 21.5 },
  { time: '22:30', actual: 24.3, expected: 21.0 },
  { time: '22:38', actual: 26.1, expected: 21.0, isAnomaly: true },
  { time: '23:00', actual: 27.2, expected: 21.0, isAnomaly: true },
  { time: '23:15', actual: 27.4, expected: 21.0, isAnomaly: true },
  { time: '23:30', actual: 27.4, expected: 21.0, isAnomaly: true }
];

export const TELEMETRY_OCCUPANCY_SERIES = [
  { time: '17:00', actual: 24, expected: 25 },
  { time: '18:00', actual: 16, expected: 15 },
  { time: '19:00', actual: 4, expected: 0 },
  { time: '20:00', actual: 0, expected: 0 },
  { time: '21:00', actual: 0, expected: 0 },
  { time: '22:00', actual: 0, expected: 0 },
  { time: '22:30', actual: 0, expected: 0 },
  { time: '22:38', actual: 0, expected: 0 },
  { time: '23:00', actual: 0, expected: 0 },
  { time: '23:15', actual: 0, expected: 0 },
  { time: '23:30', actual: 0, expected: 0 }
];
