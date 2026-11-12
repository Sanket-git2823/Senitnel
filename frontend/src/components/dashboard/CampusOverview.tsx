import React, { useMemo, useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import {
  BuildingNode,
  Anomaly,
  WorkOrder,
  ActivityEvent,
  InsightCard,
} from '../../types/sentinel';
import { BuildingCard } from './BuildingCard';
import {
  Building2,
  Cpu,
  DoorOpen,
  Clock,
  Zap,
  ChevronRight,
  RotateCcw,
  Move,
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis, Area, AreaChart } from 'recharts';

interface CampusOverviewProps {
  buildings: BuildingNode[];
  anomalies: Anomaly[];
  workOrders: WorkOrder[];
  activity: ActivityEvent[];
  insights: InsightCard[];
  selectedBuildingId: string;
  onSelectBuilding: (id: string) => void;
  onOpenAnomaly: (id: string) => void;
  onOpenWorkOrder: (wo: WorkOrder) => void;
  isResolved: boolean;
  onUpdateBuildingCoords?: (id: string, coords: { x: number; y: number }) => void;
}

function summaryStats(buildings: BuildingNode[]) {
  const totalSensors = 1428;
  const totalRooms = buildings.reduce((s, b) => s + (b.totalRooms ?? 0), 0);
  const onlineCount = buildings.filter((b) => b.status !== 'no-data').length;
  const offlineCount = buildings.length - onlineCount;
  return { totalSensors, totalRooms, onlineCount, offlineCount };
}

function computeHealthPct(buildings: BuildingNode[]): number {
  const healthy = buildings.filter((b) => b.status === 'normal').length;
  return Math.round((healthy / buildings.length) * 100);
}

function computeEfficiency(buildings: BuildingNode[]): number {
  const totalExpected = buildings.reduce((s, b) => s + b.expectedKw, 0);
  const totalActual = buildings.reduce((s, b) => s + b.currentKw, 0);
  if (totalExpected === 0) return 100;
  const eff = Math.min(100, (totalExpected / totalActual) * 100);
  return Math.round(eff * 10) / 10;
}

const CampusMap: React.FC<{
  buildings: BuildingNode[];
  anomalies: Anomaly[];
  selectedId: string;
  onSelect: (id: string) => void;
  onUpdateCoords?: (id: string, coords: { x: number; y: number }) => void;
  resetTrigger?: number;
}> = ({ buildings, anomalies, selectedId, onSelect, onUpdateCoords, resetTrigger }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Load custom layout from localStorage if available
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      const saved = localStorage.getItem('sentinel_building_positions');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    const init: Record<string, { x: number; y: number }> = {};
    buildings.forEach((b) => {
      init[b.id] = { x: b.coords.x, y: b.coords.y };
    });
    return init;
  });

  // Keep positions synchronized if buildings array changes
  useEffect(() => {
    setPositions((prev) => {
      const next = { ...prev };
      buildings.forEach((b) => {
        if (!next[b.id]) {
          next[b.id] = { x: b.coords.x, y: b.coords.y };
        }
      });
      return next;
    });
  }, [buildings]);

  // Handle external reset trigger
  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      const resetMap: Record<string, { x: number; y: number }> = {};
      buildings.forEach((b) => {
        resetMap[b.id] = { x: b.coords.x, y: b.coords.y };
      });
      setPositions(resetMap);
      try {
        localStorage.removeItem('sentinel_building_positions');
      } catch (_) {}
    }
  }, [resetTrigger, buildings]);

  // Drag tracking state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragRef = useRef<{
    id: string;
    startPointerX: number;
    startPointerY: number;
    startBoxX: number;
    startBoxY: number;
    hasMoved: boolean;
  } | null>(null);

  const anomalyBuildingIds = useMemo(
    () => new Set(anomalies.filter((a) => a.status !== 'Resolved' && a.status !== 'Closed').map((a) => a.buildingId)),
    [anomalies]
  );

  const selectedBuilding = buildings.find((b) => b.id === selectedId);

  // SVG coordinate transformation
  const getSvgPoint = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: clientX, y: clientY };
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (ctm) {
      const transformed = pt.matrixTransform(ctm.inverse());
      return { x: transformed.x, y: transformed.y };
    }
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 600 / rect.width;
    const scaleY = 400 / rect.height;
    return {
      x: 220 + (clientX - rect.left) * scaleX,
      y: 80 + (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>, building: BuildingNode) => {
    e.stopPropagation();
    const p = getSvgPoint(e.clientX, e.clientY);
    const curX = positions[building.id]?.x ?? building.coords.x;
    const curY = positions[building.id]?.y ?? building.coords.y;

    dragRef.current = {
      id: building.id,
      startPointerX: p.x,
      startPointerY: p.y,
      startBoxX: curX,
      startBoxY: curY,
      hasMoved: false,
    };
    setDraggingId(building.id);
    (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    if (!dragRef.current) return;
    const p = getSvgPoint(e.clientX, e.clientY);
    const dx = p.x - dragRef.current.startPointerX;
    const dy = p.y - dragRef.current.startPointerY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragRef.current.hasMoved = true;
    }

    const b = buildings.find((item) => item.id === dragRef.current?.id);
    const w = b?.coords.width ?? 70;
    const h = b?.coords.height ?? 50;

    // Boundaries within SVG viewBox: x in [225, 815 - w], y in [85, 475 - h]
    const clampedX = Math.round(Math.max(225, Math.min(815 - w, dragRef.current.startBoxX + dx)));
    const clampedY = Math.round(Math.max(85, Math.min(475 - h, dragRef.current.startBoxY + dy)));

    setPositions((prev) => ({
      ...prev,
      [dragRef.current!.id]: { x: clampedX, y: clampedY },
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<SVGGElement>, buildingId: string) => {
    if (dragRef.current) {
      if (!dragRef.current.hasMoved) {
        onSelect(buildingId);
      } else {
        const finalCoords = positions[buildingId];
        if (finalCoords) {
          try {
            localStorage.setItem('sentinel_building_positions', JSON.stringify(positions));
          } catch (_) {}
          onUpdateCoords?.(buildingId, finalCoords);
        }
      }
    }
    dragRef.current = null;
    setDraggingId(null);
    try {
      (e.currentTarget as SVGGElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  return (
    <svg
      ref={svgRef}
      viewBox="220 80 600 400"
      className="w-full h-full touch-none select-none"
      style={{ minHeight: 380 }}
    >
      {/* Background canvas */}
      <rect x="220" y="80" width="600" height="400" fill="#151719" />

      {/* Campus road paths - subtle, low-contrast architectural lines */}
      <g stroke="#262B2E" strokeWidth="1.5" fill="none">
        <line x1="260" y1="270" x2="780" y2="270" />
        <line x1="500" y1="100" x2="500" y2="420" />
        <line x1="350" y1="220" x2="470" y2="260" />
        <line x1="530" y1="260" x2="620" y2="190" />
        <line x1="350" y1="340" x2="470" y2="270" />
        <line x1="570" y1="360" x2="510" y2="270" />
        <line x1="670" y1="310" x2="620" y2="270" />
      </g>

      {/* Buildings representation with interactive dragging */}
      {buildings.map((b) => {
        const isSelected = b.id === selectedId;
        const hasAnomaly = anomalyBuildingIds.has(b.id);
        const isDragging = draggingId === b.id;

        const posX = positions[b.id]?.x ?? b.coords.x;
        const posY = positions[b.id]?.y ?? b.coords.y;
        
        const strokeColor =
          b.status === 'critical'
            ? '#B85555'
            : b.status === 'warning'
            ? '#C09853'
            : '#638D7D';

        return (
          <g
            key={b.id}
            className="cursor-grab active:cursor-grabbing transition-transform"
            onPointerDown={(e) => handlePointerDown(e, b)}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => handlePointerUp(e, b.id)}
            onPointerCancel={(e) => handlePointerUp(e, b.id)}
            style={{ opacity: isDragging ? 0.95 : 1 }}
          >
            {/* Selection indicator */}
            {isSelected && (
              <rect
                x={posX - 3}
                y={posY - 3}
                width={b.coords.width + 6}
                height={b.coords.height + 6}
                rx={4}
                fill="none"
                stroke="#B1A078"
                strokeWidth="1.5"
                strokeDasharray={isDragging ? '4 2' : 'none'}
              />
            )}

            {/* Building footprint */}
            <rect
              x={posX}
              y={posY}
              width={b.coords.width}
              height={b.coords.height}
              rx={3}
              fill={isSelected || isDragging ? '#24282B' : '#1C1F22'}
              stroke={isDragging ? '#B1A078' : isSelected ? '#B1A078' : strokeColor}
              strokeWidth={isDragging ? 1.5 : 1}
            />

            {/* Drag Grip Indicator dots (top-left) */}
            <g opacity={isDragging ? 0.9 : 0.4} fill="#969DA2">
              <circle cx={posX + 6} cy={posY + 6} r={1} />
              <circle cx={posX + 10} cy={posY + 6} r={1} />
              <circle cx={posX + 6} cy={posY + 10} r={1} />
              <circle cx={posX + 10} cy={posY + 10} r={1} />
            </g>

            {/* Building Name */}
            <text
              x={posX + b.coords.width / 2}
              y={posY + b.coords.height / 2 - 3}
              fill="#E3E5E6"
              fontSize="9"
              fontFamily="Inter, sans-serif"
              fontWeight="500"
              textAnchor="middle"
              className="pointer-events-none"
            >
              {b.shortName}
            </text>

            {/* Power metric */}
            <text
              x={posX + b.coords.width / 2}
              y={posY + b.coords.height / 2 + 10}
              fill="#969DA2"
              fontSize="8"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
              className="pointer-events-none"
            >
              {b.currentKw.toFixed(1)} kW
            </text>

            {/* Coordinate display badge while dragging */}
            {isDragging && (
              <g className="pointer-events-none">
                <rect
                  x={posX}
                  y={posY - 18}
                  width={74}
                  height={14}
                  rx={2}
                  fill="#151719"
                  stroke="#B1A078"
                  strokeWidth="0.8"
                />
                <text
                  x={posX + 37}
                  y={posY - 8}
                  fill="#B1A078"
                  fontSize="7.5"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  X:{posX} Y:{posY}
                </text>
              </g>
            )}

            {/* Anomaly dot (restrained, no glowing halos) */}
            {hasAnomaly && (
              <circle
                cx={posX + b.coords.width - 5}
                cy={posY + 5}
                r={3}
                fill="#B85555"
                className="pointer-events-none"
              />
            )}
          </g>
        );
      })}

      {/* Selected building detail callout */}
      {selectedBuilding && (() => {
        const sX = positions[selectedBuilding.id]?.x ?? selectedBuilding.coords.x;
        const sY = positions[selectedBuilding.id]?.y ?? selectedBuilding.coords.y;
        const calloutX = sX + selectedBuilding.coords.width + 105 > 815
          ? sX - 105
          : sX + selectedBuilding.coords.width + 10;

        return (
          <g className="pointer-events-none">
            <rect
              x={calloutX}
              y={sY}
              width={100}
              height={40}
              rx={4}
              fill="#1C1F22"
              stroke="#34393D"
              strokeWidth="1"
            />
            <text
              x={calloutX + 8}
              y={sY + 15}
              fill="#969DA2"
              fontSize="8"
              fontFamily="Inter, sans-serif"
            >
              Current load
            </text>
            <text
              x={calloutX + 8}
              y={sY + 30}
              fill="#E3E5E6"
              fontSize="12"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="500"
            >
              {selectedBuilding.currentKw.toFixed(1)} kW
            </text>
          </g>
        );
      })()}

      {/* Legend & Instructions - quiet, bottom left */}
      <g transform="translate(240, 440)">
        <circle cx={0} cy={0} r={3} fill="#638D7D" />
        <text x={7} y={3} fill="#969DA2" fontSize="8" fontFamily="Inter, sans-serif">Optimal</text>
        <circle cx={60} cy={0} r={3} fill="#C09853" />
        <text x={67} y={3} fill="#969DA2" fontSize="8" fontFamily="Inter, sans-serif">Warning</text>
        <circle cx={124} cy={0} r={3} fill="#B85555" />
        <text x={131} y={3} fill="#969DA2" fontSize="8" fontFamily="Inter, sans-serif">Critical</text>
        <text x={190} y={3} fill="#6B7278" fontSize="7.5" fontFamily="Inter, sans-serif">
          • Drag building footprint to rearrange layout
        </text>
      </g>
    </svg>
  );
};

export const CampusOverview: React.FC<CampusOverviewProps> = ({
  buildings,
  anomalies,
  workOrders,
  selectedBuildingId,
  onSelectBuilding,
  onOpenAnomaly,
  onOpenWorkOrder,
  onUpdateBuildingCoords,
}) => {
  const [resetCounter, setResetCounter] = useState(0);

  const { totalSensors, totalRooms, onlineCount, offlineCount } = useMemo(
    () => summaryStats(buildings),
    [buildings]
  );
  const healthPct = useMemo(() => computeHealthPct(buildings), [buildings]);
  const efficiencyPct = useMemo(() => computeEfficiency(buildings), [buildings]);
  
  const totalCampusKw = useMemo(
    () => buildings.reduce((s, b) => s + b.currentKw, 0),
    [buildings]
  );
  const activeAnomalies = useMemo(
    () => anomalies.filter((a) => a.status !== 'Resolved' && a.status !== 'Closed'),
    [anomalies]
  );
  const openWOs = useMemo(
    () => workOrders.filter((w) => w.status !== 'Resolved' && w.status !== 'Verified'),
    [workOrders]
  );

  const displayBuildings = useMemo(
    () =>
      [...buildings]
        .sort((a, b) => b.anomalyCount - a.anomalyCount || b.currentKw - a.currentKw)
        .slice(0, 4),
    [buildings]
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#151719] select-none overflow-hidden">
      {/* Upper Section: Left Inspector + Center Map + Right Alert Pane */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Campus Metrics & Buildings */}
        <div className="w-80 shrink-0 flex flex-col bg-[#151719] border-r border-[#34393D]/50 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {/* Section: Overview Header */}
          <div>
            <h2 className="text-sm font-medium text-[#E3E5E6] mb-1">
              Campus infrastructure
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#969DA2]">
              <span>{buildings.length} buildings</span>
              <span>•</span>
              <span>{totalSensors.toLocaleString()} sensors</span>
              <span>•</span>
              <span>{totalRooms} rooms</span>
            </div>
          </div>

          {/* Operational Gauges: Clean flat surfaces */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#1C1F22] rounded-md p-3">
              <span className="text-xs text-[#969DA2] block mb-1">
                Infrastructure health
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-medium font-mono text-[#E3E5E6]">
                  {healthPct}
                </span>
                <span className="text-xs text-[#969DA2]">%</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-[#638D7D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#638D7D]" />
                <span>{onlineCount} of {buildings.length} online</span>
              </div>
            </div>

            <div className="bg-[#1C1F22] rounded-md p-3">
              <span className="text-xs text-[#969DA2] block mb-1">
                Operational efficiency
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-medium font-mono text-[#E3E5E6]">
                  {efficiencyPct}
                </span>
                <span className="text-xs text-[#969DA2]">%</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-[#969DA2]">
                <span>Near baseline</span>
              </div>
            </div>
          </div>

          {/* Key Buildings List (2x2 grid) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#969DA2]">
                Key structures
              </span>
              <span className="text-xs text-[#6B7278]">
                {buildings.length} total
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {displayBuildings.map((b) => (
                <BuildingCard
                  key={b.id}
                  building={b}
                  isSelected={b.id === selectedBuildingId}
                  onSelect={onSelectBuilding}
                />
              ))}
            </div>
          </div>

          {/* Active Work Orders summary list */}
          <div className="pt-2 border-t border-[#34393D]/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#969DA2]">
                Pending work orders
              </span>
              <span className="text-xs text-[#B1A078] font-mono">
                {openWOs.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {workOrders.slice(0, 3).map((wo) => (
                <div
                  key={wo.id}
                  onClick={() => onOpenWorkOrder(wo)}
                  className="flex items-center justify-between p-2.5 rounded-md bg-[#1C1F22] hover:bg-[#24282B] transition-colors cursor-pointer text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-mono text-[#E3E5E6] mr-2">{wo.id}</span>
                    <span className="text-[#969DA2] truncate">{wo.title}</span>
                  </div>
                  <span className={cn(
                    'text-[11px] font-mono shrink-0',
                    wo.priority === 'Critical' ? 'text-[#D47A7A]' : 'text-[#D1AA68]'
                  )}>
                    {wo.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Campus Map View */}
        <div className="flex-1 relative overflow-hidden bg-[#151719] flex flex-col">
          {/* Clean Map Subheader */}
          <div className="px-5 py-3 border-b border-[#34393D]/40 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-[#E3E5E6]">
                  Campus digital twin
                </h2>
                <span className="text-[10px] text-[#B1A078] bg-[#1C1F22] px-2 py-0.5 rounded border border-[#34393D]/50 font-mono flex items-center gap-1">
                  <Move className="w-2.5 h-2.5" />
                  Draggable layout
                </span>
              </div>
              <p className="text-xs text-[#969DA2]">
                Real-time spatial distribution — drag building boxes to rearrange in space
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#969DA2]">
              <button
                onClick={() => setResetCounter((c) => c + 1)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1F22] hover:bg-[#24282B] text-[#969DA2] hover:text-[#E3E5E6] border border-[#34393D]/50 text-xs transition-colors"
                title="Reset building layout to blueprint coordinates"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset layout</span>
              </button>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#638D7D]" />
                Modbus & BACnet active
              </span>
              <span>•</span>
              <span className="font-mono">18ms latency</span>
            </div>
          </div>

          {/* Map canvas */}
          <div className="flex-1 relative p-4 flex items-center justify-center">
            <CampusMap
              buildings={buildings}
              anomalies={anomalies}
              selectedId={selectedBuildingId}
              onSelect={onSelectBuilding}
              onUpdateCoords={onUpdateBuildingCoords}
              resetTrigger={resetCounter}
            />

            {/* Right-aligned Warning Drawer */}
            {activeAnomalies.length > 0 && (
              <div className="absolute top-4 right-4 w-72 bg-[#1C1F22] rounded-md p-3.5 space-y-2.5 shadow-lg border border-[#34393D]/50">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#34393D]/40">
                  <span className="text-xs font-medium text-[#E3E5E6]">
                    Active warnings
                  </span>
                  <span className="text-xs text-[#D47A7A] font-mono">
                    {activeAnomalies.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {activeAnomalies.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      onClick={() => onOpenAnomaly(a.id)}
                      className="p-2.5 rounded bg-[#24282B] hover:bg-[#2A2F33] transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-medium text-[#E3E5E6]">{a.id}</span>
                        <span className="text-[#D47A7A] font-mono">{a.actualPower.toFixed(2)} kW</span>
                      </div>
                      <p className="text-[#969DA2] truncate text-[11px]">{a.asset} — {a.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Performance Strip: Flat surfaces, no heavy box borders */}
      <div className="h-28 shrink-0 border-t border-[#34393D]/50 bg-[#151719] px-4 py-3">
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Anomaly response card */}
          <div className="bg-[#1C1F22] rounded-md px-4 py-2.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#969DA2] block">
                Average incident resolution time
              </span>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-2xl font-medium font-mono text-[#E3E5E6]">
                  ±31
                </span>
                <span className="text-xs text-[#969DA2]">minutes</span>
              </div>
              <span className="text-xs text-[#6B7278]">
                Detection to technician dispatch
              </span>
            </div>
            <div className="w-28 h-10 opacity-70">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { t: 0, v: 42 }, { t: 1, v: 38 }, { t: 2, v: 45 },
                  { t: 3, v: 31 }, { t: 4, v: 36 }, { t: 5, v: 31 }
                ]}>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#B1A078"
                    strokeWidth={1.5}
                    fill="#B1A078"
                    fillOpacity={0.12}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Campus total energy draw card */}
          <div className="bg-[#1C1F22] rounded-md px-4 py-2.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#969DA2] block">
                Total campus instantaneous power
              </span>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-2xl font-medium font-mono text-[#E3E5E6]">
                  {totalCampusKw.toFixed(1)}
                </span>
                <span className="text-xs text-[#969DA2]">kW</span>
              </div>
              <span className="text-xs text-[#6B7278]">
                Aggregated live telemetry across 7 structures
              </span>
            </div>
            <div className="w-28 h-10 opacity-70">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { t: 0, v: 680 }, { t: 1, v: 720 }, { t: 2, v: 710 },
                  { t: 3, v: 740 }, { t: 4, v: 750 }, { t: 5, v: totalCampusKw }
                ]}>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#638D7D"
                    strokeWidth={1.5}
                    fill="#638D7D"
                    fillOpacity={0.12}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusOverview;
