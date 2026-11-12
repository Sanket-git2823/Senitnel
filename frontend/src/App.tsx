import React, { useState, useEffect, useCallback } from 'react';

// Shell components
import { Header } from './components/shell/Header';
import { Sidebar, type WorkspaceTab } from './components/shell/Sidebar';
import { BottomStatusBar } from './components/shell/BottomStatusBar';

// Workspace components
import { CampusOverview } from './components/dashboard/CampusOverview';
import { InfrastructureWorkspace } from './components/infrastructure/InfrastructureWorkspace';
import { IncidentsWorkspace } from './components/incidents/IncidentsWorkspace';
import { InvestigationWorkspace } from './components/investigation/InvestigationWorkspace';
import { WorkOrdersWorkspace } from './components/work-orders/WorkOrdersWorkspace';
import { AnalyticsWorkspace } from './components/analytics/AnalyticsWorkspace';
import { ReportsWorkspace } from './components/reports/ReportsWorkspace';
import { LiveMonitoringWorkspace } from './components/telemetry/LiveMonitoringWorkspace';
import { CampusIntelligenceWorkspace } from './components/intelligence/CampusIntelligenceWorkspace';
import { AdminWorkspace } from './components/admin/AdminWorkspace';

// Command palette
import { CommandPalette } from './components/command/CommandPalette';

// Scenario controller
import { ScenarioController } from './components/common/ScenarioController';

// Services & Integration
import { assetService } from './services/asset-service';
import { incidentService } from './services/incident-service';
import { workOrderService } from './services/work-order-service';
import { apiClient } from './services/api-client';

// Data & types
import {
  INITIAL_BUILDINGS,
  INITIAL_INSIGHTS,
  INITIAL_ANOMALIES,
  INITIAL_ACTIVITY,
  INITIAL_WORK_ORDERS,
  CURRENT_OPERATOR
} from './data/mockData';
import type {
  BuildingNode,
  Anomaly,
  WorkOrder,
  FilterState,
  ActivityEvent,
  ResolutionRecord,
  WorkOrderStatus
} from './types/sentinel';

export const App: React.FC = () => {
  // ── Navigation & Workspace ────────────────────────────────
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceTab>('OVERVIEW');
  const [selectedAssetId, setSelectedAssetId] = useState('lab-complex');

  // ── Core Application State ────────────────────────────────
  const [buildings, setBuildings] = useState<BuildingNode[]>(INITIAL_BUILDINGS);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(INITIAL_ANOMALIES);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [activity, setActivity] = useState<ActivityEvent[]>(INITIAL_ACTIVITY);
  const [isResolved, setIsResolved] = useState(false);
  const [isMockMode, setIsMockMode] = useState(apiClient.isMockMode());

  // ── UI State ──────────────────────────────────────────────
  const [filters, setFilters] = useState<FilterState>({
    assetType: 'All',
    status: 'All',
    anomaly: 'All',
    building: 'All'
  });
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [scenarioStep, setScenarioStep] = useState(1);

  // Investigation workspace anomaly selector
  const [investigationAnomalyId, setInvestigationAnomalyId] = useState('ANO-101');

  // ── Initial Live Data Load & WebSocket Subscriptions ─────
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [bldData, anomData, woData] = await Promise.all([
          assetService.getBuildings(),
          incidentService.getAnomalies(),
          workOrderService.getWorkOrders()
        ]);

        if (isMounted) {
          if (bldData && bldData.length > 0) setBuildings(bldData);
          if (anomData && anomData.length > 0) setAnomalies(anomData);
          if (woData && woData.length > 0) setWorkOrders(woData);
        }
      } catch (err) {
        console.warn('[SENTINEL] Could not connect to backend, running with fallback baseline.', err);
      }
    };

    loadData();

    // Subscribe to live WebSocket telemetry broadcasts
    const unsubTelemetry = apiClient.subscribeToStream<any>('telemetry.updated', (telemetry) => {
      if (!telemetry || !isMounted) return;

      if (telemetry.room_id === 'LAB-204') {
        const isAnom = telemetry.power_kw > 2.0;
        setBuildings((prev) =>
          prev.map((b) =>
            b.id === 'lab-complex'
              ? {
                  ...b,
                  currentKw: Math.round(telemetry.power_kw * 10) / 10,
                  tempC: Math.round(telemetry.temperature_c * 10) / 10,
                  status: isAnom ? 'critical' : 'normal',
                  color: isAnom ? '#B85555' : '#638D7D'
                }
              : b
          )
        );
      }
    });

    const unsubAnomaly = apiClient.subscribeToStream<any>('anomaly.detected', (anom) => {
      if (!isMounted) return;
      incidentService.getAnomalies().then((fresh) => {
        if (isMounted && fresh && fresh.length > 0) setAnomalies(fresh);
      });
    });

    const unsubWorkOrder = apiClient.subscribeToStream<any>('work_order.updated', () => {
      if (!isMounted) return;
      workOrderService.getWorkOrders().then((fresh) => {
        if (isMounted && fresh && fresh.length > 0) setWorkOrders(fresh);
      });
    });

    return () => {
      isMounted = false;
      unsubTelemetry();
      unsubAnomaly();
      unsubWorkOrder();
    };
  }, []);

  // ── Keyboard Shortcut: Ctrl+K ─────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Derived State ─────────────────────────────────────────
  const currentBuilding = buildings.find((b) => b.id === selectedAssetId) || buildings[2] || buildings[0];

  // ── Workspace Label for Breadcrumb ────────────────────────
  const workspaceLabel: Record<WorkspaceTab, string> = {
    OVERVIEW: 'Overview',
    CAMPUS_INTELLIGENCE: 'Campus Intelligence',
    INFRASTRUCTURE: 'Infrastructure',
    LIVE_MONITORING: 'Live Monitoring',
    INCIDENTS: 'Incidents',
    INVESTIGATIONS: 'Investigations',
    WORK_ORDERS: 'Work Orders',
    ANALYTICS: 'Analytics',
    REPORTS: 'Reports',
    ADMIN: 'System Administration'
  };

  // ── Handlers ──────────────────────────────────────────────

  /** Full resolution flow: resolves work order, clears anomaly, normalizes engine */
  const handleResolveWorkOrder = useCallback((woId: string, resolution: ResolutionRecord) => {
    setIsResolved(true);

    // Call real workOrderService and resolve demo anomaly on backend
    workOrderService.resolveWorkOrder(woId, resolution).catch(() => {});
    apiClient.resolveDemoAnomaly().catch(() => {});

    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.id === woId
          ? {
              ...wo,
              status: 'Verified' as WorkOrderStatus,
              resolution,
              steps: wo.steps.map((s) => ({
                ...s,
                completed: true,
                current: s.name === 'Verified'
              }))
            }
          : wo
      )
    );

    setAnomalies((prev) =>
      prev.map((a) =>
        a.assetId === 'lab-204' || a.id === 'ANO-101'
          ? { ...a, status: 'Resolved', actualPower: 0.98 }
          : a
      )
    );

    setBuildings((prev) =>
      prev.map((b) =>
        b.id === 'lab-complex'
          ? { ...b, status: 'normal', currentKw: 110.0, color: '#638D7D', anomalyCount: 0 }
          : b
      )
    );

    const newAct: ActivityEvent = {
      id: `act-${Date.now()}`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      event: `Work Order ${woId} Verified — Anomaly Cleared`,
      asset: 'Lab 204 (HVAC-204)',
      user: CURRENT_OPERATOR.name,
      type: 'resolution'
    };
    setActivity((prev) => [newAct, ...prev.slice(0, 9)]);
  }, []);

  /** Update work order status through lifecycle stages */
  const handleUpdateWorkOrderStatus = useCallback((woId: string, newStatus: WorkOrderStatus) => {
    workOrderService.updateStatus(woId, newStatus).catch(() => {});

    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== woId) return wo;
        const statusOrder: WorkOrderStatus[] = ['Open', 'Assigned', 'Started', 'In Progress', 'Resolved', 'Verified'];
        const newIdx = statusOrder.indexOf(newStatus);
        return {
          ...wo,
          status: newStatus,
          steps: wo.steps.map((step, idx) => ({
            ...step,
            completed: idx <= newIdx,
            current: idx === newIdx,
            timestamp: idx === newIdx ? new Date().toLocaleTimeString('en-US', { hour12: false }) + ' IST' : step.timestamp
          }))
        };
      })
    );
  }, []);

  /** Create a work order from an anomaly */
  const handleCreateWorkOrderFromAnomaly = useCallback((anomaly: Anomaly) => {
    const existingWO = workOrders.find((w) => w.id === 'WO-7821');
    if (existingWO) {
      setSelectedWorkOrder(existingWO);
      setActiveWorkspace('WORK_ORDERS');
      return;
    }

    const input = {
      title: `Inspect ${anomaly.type} — ${anomaly.asset}`,
      priority: (anomaly.severity === 'critical' ? 'Critical' : 'High') as any,
      status: 'Open' as WorkOrderStatus,
      assignedTeam: 'Facilities HVAC Response Team',
      location: anomaly.asset,
      assetId: anomaly.assetId,
      assetName: anomaly.asset,
      category: 'HVAC' as any,
      description: anomaly.description,
      recommendedAction: anomaly.recommendedAction,
      relatedIncidentId: `INC-${anomaly.id}`,
      impactKwhPerDay: anomaly.impactKwhPerDay,
      impactCostPerDay: anomaly.impactCostPerDay,
      impactCo2PerDay: anomaly.impactCo2PerDay
    };

    workOrderService.createWorkOrder(input).then((created) => {
      setWorkOrders((prev) => [created, ...prev]);
      setSelectedWorkOrder(created);
      setActiveWorkspace('WORK_ORDERS');
    }).catch(() => {
      // Fallback local create
      const newWO: WorkOrder = {
        id: `WO-${Math.floor(7830 + Math.random() * 500)}`,
        title: input.title,
        priority: input.priority,
        status: 'Open',
        assignedTo: input.assignedTeam,
        location: input.location,
        assetId: input.assetId,
        assetName: input.assetName,
        type: 'HVAC Mechanical Repair',
        category: input.category,
        detectedBy: 'Sentinel AI Engine',
        detectedAt: `${anomaly.detectedAt} IST`,
        dueDate: '2026-11-10 06:00 IST',
        description: input.description,
        impactKwhPerDay: input.impactKwhPerDay,
        impactCostPerDay: input.impactCostPerDay,
        impactCo2PerDay: input.impactCo2PerDay,
        recommendedAction: input.recommendedAction,
        relatedIncidentId: input.relatedIncidentId,
        steps: [
          { name: 'Work Order Created', timestamp: 'Just now', completed: true },
          { name: 'Assigned', completed: false, current: true },
          { name: 'Started', completed: false },
          { name: 'In Progress', completed: false },
          { name: 'Resolved', completed: false },
          { name: 'Verified', completed: false }
        ]
      };
      setWorkOrders((prev) => [newWO, ...prev]);
      setSelectedWorkOrder(newWO);
      setActiveWorkspace('WORK_ORDERS');
    });
  }, [workOrders]);

  /** Navigate to investigation workspace for a specific anomaly */
  const handleOpenInvestigation = useCallback((anomalyId: string) => {
    setInvestigationAnomalyId(anomalyId);
    setActiveWorkspace('INVESTIGATIONS');
  }, []);

  /** Scenario controller step execution */
  const handleExecuteScenarioStep = useCallback(() => {
    const step = scenarioStep;

    if (step === 1) {
      setActiveWorkspace('OVERVIEW');
      apiClient.triggerDemoAnomaly().catch(() => {});
    } else if (step === 2) {
      setSelectedAssetId('lab-complex');
    } else if (step === 3) {
      setSelectedAssetId('lab-complex');
      setActiveWorkspace('INFRASTRUCTURE');
    } else if (step === 4) {
      setActiveWorkspace('LIVE_MONITORING');
    } else if (step === 5) {
      setActiveWorkspace('INCIDENTS');
    } else if (step === 6) {
      setInvestigationAnomalyId('ANO-101');
      setActiveWorkspace('INVESTIGATIONS');
    } else if (step === 7) {
      setActiveWorkspace('INVESTIGATIONS');
    } else if (step === 8) {
      setActiveWorkspace('WORK_ORDERS');
    } else if (step === 9) {
      setActiveWorkspace('WORK_ORDERS');
      handleUpdateWorkOrderStatus('WO-7818', 'In Progress');
    } else if (step === 10) {
      setActiveWorkspace('WORK_ORDERS');
      handleUpdateWorkOrderStatus('WO-7818', 'Resolved');
    } else if (step === 11) {
      setActiveWorkspace('WORK_ORDERS');
      apiClient.resolveDemoAnomaly().catch(() => {});
      handleResolveWorkOrder('WO-7818', {
        resolvedBy: 'Sunil Verma (Technician)',
        resolvedAt: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' IST',
        rootCause: 'FCU-204 reheat valve stuck at 78% due to actuator linkage binding',
        actionsTaken: 'Lubricated actuator linkage, performed 0-100% stroke calibration, verified BACnet setpoint control',
        partsReplaced: 'Honeywell Actuator Seal Kit',
        powerAfterKw: 0.98,
        verifiedBy: 'Sanket Patel (Operator)',
        verifiedAt: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' IST'
      });
    } else if (step === 12) {
      setActiveWorkspace('OVERVIEW');
    }

    if (step < 12) setScenarioStep(step + 1);
  }, [scenarioStep, handleUpdateWorkOrderStatus, handleResolveWorkOrder]);

  const handleResetScenario = useCallback(() => {
    setScenarioStep(1);
    setIsResolved(false);
    apiClient.post('/simulator/reset', {}).catch(() => {});

    // Reload baseline
    assetService.getBuildings().then((b) => b && setBuildings(b));
    incidentService.getAnomalies().then((a) => a && setAnomalies(a));
    workOrderService.getWorkOrders().then((w) => w && setWorkOrders(w));

    setActiveWorkspace('OVERVIEW');
    setSelectedAssetId('lab-complex');
    setSelectedWorkOrder(null);
  }, []);

  const handleToggleMockMode = useCallback(() => {
    const nextMode = !isMockMode;
    apiClient.setMockMode(nextMode);
    setIsMockMode(nextMode);
  }, [isMockMode]);

  const handleUpdateBuildingCoords = useCallback((id: string, coords: { x: number; y: number }) => {
    setBuildings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, coords: { ...b.coords, x: coords.x, y: coords.y } } : b
      )
    );
  }, []);

  // ── Workspace Content Renderer ────────────────────────────
  const renderWorkspace = () => {
    switch (activeWorkspace) {
      case 'OVERVIEW':
        return (
          <CampusOverview
            buildings={buildings}
            anomalies={anomalies}
            workOrders={workOrders}
            activity={activity}
            insights={INITIAL_INSIGHTS}
            selectedBuildingId={selectedAssetId}
            onSelectBuilding={(id) => setSelectedAssetId(id)}
            onOpenAnomaly={handleOpenInvestigation}
            onOpenWorkOrder={(wo) => {
              setSelectedWorkOrder(wo);
              setActiveWorkspace('WORK_ORDERS');
            }}
            isResolved={isResolved}
            onUpdateBuildingCoords={handleUpdateBuildingCoords}
          />
        );

      case 'CAMPUS_INTELLIGENCE':
        return (
          <CampusIntelligenceWorkspace
            buildings={buildings}
            anomalies={anomalies}
            selectedBuildingId={selectedAssetId}
            onSelectBuilding={(id) => setSelectedAssetId(id)}
            onOpenAnomaly={handleOpenInvestigation}
          />
        );

      case 'INFRASTRUCTURE':
        return (
          <InfrastructureWorkspace
            buildings={buildings}
            selectedBuildingId={selectedAssetId}
            onSelectBuilding={(id) => setSelectedAssetId(id)}
            onOpenInvestigation={handleOpenInvestigation}
            isResolved={isResolved}
          />
        );

      case 'LIVE_MONITORING':
        return <LiveMonitoringWorkspace isResolved={isResolved} />;

      case 'INCIDENTS':
        return (
          <IncidentsWorkspace
            anomalies={anomalies}
            onOpenInvestigation={handleOpenInvestigation}
            onCreateWorkOrder={handleCreateWorkOrderFromAnomaly}
          />
        );

      case 'INVESTIGATIONS':
        return (
          <InvestigationWorkspace
            anomaly={anomalies.find((a) => a.id === investigationAnomalyId) || anomalies[0]}
            allAnomalies={anomalies}
            onSelectAnomaly={(id) => setInvestigationAnomalyId(id)}
            onCreateOrViewWorkOrder={handleCreateWorkOrderFromAnomaly}
            isResolved={isResolved}
          />
        );

      case 'WORK_ORDERS':
        return (
          <WorkOrdersWorkspace
            workOrders={workOrders}
            selectedWorkOrder={selectedWorkOrder}
            onSelectWorkOrder={(wo) => setSelectedWorkOrder(wo)}
            onUpdateStatus={handleUpdateWorkOrderStatus}
            onResolveWorkOrder={handleResolveWorkOrder}
            onCreateNewWorkOrder={() => {
              if (anomalies.length > 0) {
                handleCreateWorkOrderFromAnomaly(anomalies[0]);
              }
            }}
            isResolved={isResolved}
          />
        );

      case 'ANALYTICS':
        return <AnalyticsWorkspace isResolved={isResolved} />;

      case 'REPORTS':
        return <ReportsWorkspace />;

      case 'ADMIN':
        return <AdminWorkspace />;

      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-[#151719] font-mono text-[#969DA2]">
            <div className="text-center space-y-3">
              <div className="text-[40px] font-bold text-[#24282B] tracking-tight">SENTINEL</div>
              <div className="text-xs text-[#969DA2] uppercase tracking-[0.2em]">
                {workspaceLabel[activeWorkspace]} Workspace
              </div>
              <div className="text-xs text-[#6B7278] max-w-md mx-auto">
                Connected to Sentinel Core. Real-time telemetry streaming active over WebSocket.
              </div>
            </div>
          </div>
        );
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen w-screen bg-[#151719] text-[#E3E5E6] overflow-hidden font-sans">
      {/* Top Bar */}
      <Header
        currentWorkspace={workspaceLabel[activeWorkspace]}
        activeSubPath={currentBuilding?.shortName !== 'Lab Complex' ? currentBuilding?.shortName : undefined}
        onOpenCommand={() => setIsCommandOpen(true)}
        operator={CURRENT_OPERATOR}
        unreadCount={isResolved ? 4 : 7}
        onToggleDemoScenario={() => setShowScenario(!showScenario)}
        isDemoActive={showScenario}
      />

      {/* Scenario Guided Demo Controller (toggled) */}
      {showScenario && (
        <ScenarioController
          currentStep={scenarioStep}
          onSelectStep={(s) => setScenarioStep(s)}
          onExecuteCurrentStep={handleExecuteScenarioStep}
          onResetScenario={handleResetScenario}
          isResolved={isResolved}
          onClose={() => setShowScenario(false)}
        />
      )}

      {/* Main Body: Sidebar + Active Workspace */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeWorkspace={activeWorkspace}
          setActiveWorkspace={setActiveWorkspace}
          selectedAssetId={selectedAssetId}
          onSelectAsset={(id) => setSelectedAssetId(id)}
          filters={filters}
          onFilterChange={setFilters}
          incidentsCount={anomalies.filter((a) => a.status !== 'Resolved').length}
          workOrdersCount={workOrders.filter((w) => w.status !== 'Verified').length}
        />

        {/* Active Workspace Content */}
        {renderWorkspace()}
      </div>

      {/* Bottom Status Bar */}
      <BottomStatusBar isMockData={isMockMode} onToggleMockMode={handleToggleMockMode} />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectBuilding={(bId) => {
          setSelectedAssetId(bId);
          setActiveWorkspace('OVERVIEW');
        }}
        onOpenAnomaly={handleOpenInvestigation}
        onOpenWorkOrder={(woId) => {
          const wo = workOrders.find((w) => w.id === woId) || workOrders[0];
          setSelectedWorkOrder(wo);
          setActiveWorkspace('WORK_ORDERS');
        }}
        onNavigateWorkspace={(ws) => setActiveWorkspace(ws as WorkspaceTab)}
        buildings={buildings}
        anomalies={anomalies}
        workOrders={workOrders}
      />
    </div>
  );
};

export default App;
