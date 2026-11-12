import React, { useState } from 'react';
import {
  FolderTree,
  Zap,
  Radio,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { BuildingNode } from '../../types/sentinel';
import { CAMPUS_FLOORS_ACAD_A, LAB_204_TELEMETRY, LAB_204_TELEMETRY_RESOLVED } from '../../data/mockData';
import { Badge } from '../common/Badge';
import { assetService } from '../../services/asset-service';

interface InfrastructureWorkspaceProps {
  buildings: BuildingNode[];
  selectedBuildingId: string;
  onSelectBuilding: (bId: string) => void;
  onOpenInvestigation: (anoId: string) => void;
  isResolved: boolean;
}

export const InfrastructureWorkspace: React.FC<InfrastructureWorkspaceProps> = ({
  buildings,
  selectedBuildingId,
  onSelectBuilding,
  onOpenInvestigation,
  isResolved
}) => {
  const [selectedFloorLevel, setSelectedFloorLevel] = useState<number>(2);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('lab-204');
  const [targetSetpoint, setTargetSetpoint] = useState<number>(22.0);
  const [setpointApplied, setSetpointApplied] = useState<boolean>(false);

  const floors = CAMPUS_FLOORS_ACAD_A;
  const currentFloor = floors.find((f) => f.level === selectedFloorLevel) || floors[1];
  const currentRoom = currentFloor.rooms.find((r) => r.id === selectedRoomId) || currentFloor.rooms[0];

  const chartData = isResolved ? LAB_204_TELEMETRY_RESOLVED : LAB_204_TELEMETRY;

  const handleApplySetpoint = () => {
    setSetpointApplied(true);
    assetService.setThermostatSetpoint(selectedRoomId, targetSetpoint).catch(() => {});
    setTimeout(() => setSetpointApplied(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-[#151719] overflow-hidden select-none text-xs">
      {/* 1. Left Hierarchy Browser */}
      <div className="w-full md:w-64 bg-[#1C1F22] border-r border-[#34393D]/50 flex flex-col h-full shrink-0">
        <div className="h-12 px-4 border-b border-[#34393D]/40 flex items-center justify-between">
          <span className="font-medium text-[#E3E5E6] flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-[#B1A078]" />
            Spatial directory
          </span>
          <span className="text-[11px] font-mono text-[#969DA2]">{buildings.length} structures</span>
        </div>

        {/* Building List */}
        <div className="p-3 border-b border-[#34393D]/40 space-y-1">
          <span className="text-[11px] text-[#969DA2] block px-1 mb-1">Campus buildings</span>
          {buildings.map((b) => {
            const isSelected = b.id === selectedBuildingId;
            return (
              <button
                key={b.id}
                onClick={() => {
                  onSelectBuilding(b.id);
                  if (b.id === 'acad-a' || b.id === 'lab-complex') {
                    setSelectedRoomId('lab-204');
                    setSelectedFloorLevel(2);
                  }
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-left transition-colors ${
                  isSelected
                    ? 'bg-[#24282B] text-[#E3E5E6] font-medium'
                    : 'text-[#969DA2] hover:bg-[#24282B]/60 hover:text-[#E3E5E6]'
                }`}
              >
                <div className="truncate">
                  <div className="text-xs truncate">{b.shortName}</div>
                  <div className="text-[11px] text-[#6B7278]">{b.category}</div>
                </div>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    b.status === 'critical'
                      ? 'bg-[#B85555]'
                      : b.status === 'warning'
                      ? 'bg-[#C09853]'
                      : 'bg-[#638D7D]'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Floors & Rooms */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          <span className="text-[11px] text-[#969DA2] block px-1">Floors and zones</span>
          {floors.map((fl) => (
            <div key={fl.id} className="space-y-1">
              <button
                onClick={() => setSelectedFloorLevel(fl.level)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left text-xs font-medium ${
                  selectedFloorLevel === fl.level
                    ? 'bg-[#24282B] text-[#E3E5E6]'
                    : 'text-[#969DA2] hover:text-[#E3E5E6]'
                }`}
              >
                <span>Level {fl.level}</span>
                <span className="text-[11px] font-mono text-[#6B7278]">{fl.rooms.length} rooms</span>
              </button>

              {selectedFloorLevel === fl.level && (
                <div className="ml-3 pl-2 border-l border-[#34393D]/40 space-y-1">
                  {fl.rooms.map((rm) => (
                    <button
                      key={rm.id}
                      onClick={() => setSelectedRoomId(rm.id)}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-left text-xs ${
                        selectedRoomId === rm.id
                          ? 'bg-[#24282B] text-[#E3E5E6] font-medium'
                          : 'text-[#969DA2] hover:text-[#E3E5E6]'
                      }`}
                    >
                      <span className="truncate">{rm.name}</span>
                      {rm.hasActiveAnomaly && !isResolved && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B85555]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Main Asset Inspector & Telemetry Workbench */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-5 space-y-4">
        {/* Asset Header Info */}
        <div className="bg-[#1C1F22] rounded-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-medium text-[#E3E5E6]">{currentRoom.name}</h2>
              <Badge variant={currentRoom.hasActiveAnomaly && !isResolved ? 'critical' : 'normal'}>
                {currentRoom.hasActiveAnomaly && !isResolved ? 'Fault active' : 'Normal'}
              </Badge>
              <span className="text-xs text-[#969DA2]">
                {currentRoom.areaSqFt} sq ft
              </span>
            </div>
            <p className="text-xs text-[#969DA2] mt-1">
              Academic Block A / {currentFloor.name} • Schedule: {currentRoom.scheduledActivity}
            </p>
          </div>

          {currentRoom.hasActiveAnomaly && !isResolved && (
            <button
              onClick={() => onOpenInvestigation(currentRoom.anomalyId || 'ANO-101')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#B85555] hover:bg-[#C25E5E] text-[#151719] font-medium text-xs transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Inspect active incident (ANO-101)</span>
            </button>
          )}
        </div>

        {/* Real-time Subsystem Telemetry Chart */}
        <div className="bg-[#1C1F22] rounded-md p-4 flex flex-col shrink-0 min-h-[260px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#B1A078]" />
              <h3 className="font-medium text-[#E3E5E6] text-sm">
                Circuit power consumption (PM-204)
              </h3>
            </div>
            <span className="text-xs text-[#969DA2]">
              Baseline: {currentRoom.baselineKw} kW | Current:{' '}
              <span className={isResolved ? 'text-[#638D7D]' : 'text-[#D47A7A] font-medium'}>
                {isResolved ? '0.98 kW' : `${currentRoom.currentKw} kW`}
              </span>
            </span>
          </div>

          <div className="flex-1 w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262B2E" vertical={false} />
                <XAxis dataKey="time" stroke="#6B7278" tick={{ fontSize: 10, fill: '#969DA2' }} tickLine={false} />
                <YAxis stroke="#6B7278" tick={{ fontSize: 10, fill: '#969DA2' }} tickLine={false} domain={[0, 5]} unit=" kW" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1F22',
                    borderColor: '#34393D',
                    borderRadius: 4,
                    fontSize: 11,
                    color: '#E3E5E6'
                  }}
                />
                <Line type="monotone" dataKey="actual" name="Actual load" stroke="#B85555" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line type="stepAfter" dataKey="expected" name="Baseline" stroke="#638D7D" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Connected Sensors */}
        <div className="bg-[#1C1F22] rounded-md p-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#969DA2]" />
              <h3 className="font-medium text-[#E3E5E6] text-sm">
                Connected hardware & sensor bus
              </h3>
            </div>
            <span className="text-xs text-[#969DA2]">
              {currentRoom.sensors.length} nodes online
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[#969DA2] border-b border-[#34393D]/40">
                <tr>
                  <th className="pb-2">Sensor tag</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Current reading</th>
                  <th className="pb-2">Baseline</th>
                  <th className="pb-2">Protocol</th>
                  <th className="pb-2">Ping latency</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34393D]/30">
                {currentRoom.sensors.map((s) => (
                  <tr key={s.id} className="text-[#E3E5E6]">
                    <td className="py-2.5 font-medium">{s.name}</td>
                    <td className="py-2.5 text-[#969DA2]">{s.type}</td>
                    <td className="py-2.5 font-mono">
                      {s.currentValue} {s.unit}
                    </td>
                    <td className="py-2.5 font-mono text-[#969DA2]">
                      {s.baselineValue} {s.unit}
                    </td>
                    <td className="py-2.5 font-mono text-[#969DA2]">{s.busProtocol}</td>
                    <td className="py-2.5 text-[#969DA2]">{s.lastPing}</td>
                    <td className="py-2.5 text-right">
                      <Badge variant={s.status === 'online' ? 'normal' : s.status === 'degraded' ? 'high' : 'critical'}>
                        {s.status === 'online' ? 'Online' : s.status === 'degraded' ? 'Degraded' : 'Offline'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Setpoint Override Panel */}
        <div className="bg-[#1C1F22] rounded-md p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-[#B1A078]" />
            <div>
              <h3 className="font-medium text-[#E3E5E6] text-sm">
                BMS setpoint dispatch
              </h3>
              <p className="text-xs text-[#969DA2]">
                Adjust target thermostat cooling setpoint over BACnet IP loop
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#151719] px-3 py-1.5 rounded-md border border-[#34393D]">
              <span className="text-xs text-[#969DA2]">Target:</span>
              <input
                type="number"
                min="18"
                max="28"
                step="0.5"
                value={targetSetpoint}
                onChange={(e) => setTargetSetpoint(Number(e.target.value))}
                className="w-12 bg-transparent font-medium text-[#E3E5E6] text-xs focus:outline-none"
              />
              <span className="text-xs text-[#969DA2]">°C</span>
            </div>

            <button
              onClick={handleApplySetpoint}
              className="px-3 py-1.5 rounded-md bg-[#24282B] hover:bg-[#2A2F33] text-[#E3E5E6] transition-colors cursor-pointer text-xs"
            >
              {setpointApplied ? '✓ Setpoint dispatched' : 'Transmit override'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
