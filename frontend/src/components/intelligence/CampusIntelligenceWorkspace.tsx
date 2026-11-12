import React, { useState } from 'react';
import {
  Compass,
  Cpu,
  Thermometer,
  Wind,
  Users,
  Activity,
  Layers,
  Search,
  Zap,
  Building,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { BuildingNode, Anomaly } from '../../types/sentinel';
import { Badge } from '../common/Badge';

interface CampusIntelligenceWorkspaceProps {
  buildings: BuildingNode[];
  anomalies: Anomaly[];
  onOpenAnomaly: (id: string) => void;
  onSelectBuilding: (id: string) => void;
  selectedBuildingId: string;
}

export const CampusIntelligenceWorkspace: React.FC<CampusIntelligenceWorkspaceProps> = ({
  buildings,
  anomalies,
  onOpenAnomaly,
  onSelectBuilding,
  selectedBuildingId
}) => {
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');

  const activeBuilding = buildings.find((b) => b.id === selectedBuildingId) || buildings[0];

  const subsystems = [
    { name: 'All', icon: Layers, count: 5 },
    { name: 'HVAC', icon: Wind, powerKw: 142.4, loadPct: 48, status: 'warning' },
    { name: 'Lighting', icon: Zap, powerKw: 65.2, loadPct: 22, status: 'normal' },
    { name: 'Laboratory', icon: Cpu, powerKw: 47.4, loadPct: 16, status: 'critical' },
    { name: 'IT Infrastructure', icon: Activity, powerKw: 26.8, loadPct: 9, status: 'normal' }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#151719] overflow-hidden select-none text-xs">
      {/* 1. Header */}
      <div className="h-12 px-5 bg-[#1C1F22] border-b border-[#34393D]/50 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#24282B] flex items-center justify-center text-[#B1A078]">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-[#E3E5E6]">
              Campus Operational Intelligence
            </h2>
            <p className="text-[11px] text-[#969DA2]">
              Real-time multi-signal telemetry correlation & subsystem topology
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#638D7D] font-mono text-[11px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#638D7D]" />
            Continuous context engine active
          </span>
        </div>
      </div>

      {/* 2. Subsystem Selector Ribbon */}
      <div className="px-5 py-3 bg-[#1C1F22]/50 border-b border-[#34393D]/40 flex items-center gap-3 overflow-x-auto shrink-0">
        <span className="text-[#969DA2] text-[11px] shrink-0">Subsystem:</span>
        {subsystems.map((sub) => {
          const isSelected = selectedSubsystem === sub.name;
          const Icon = sub.icon;
          return (
            <button
              key={sub.name}
              onClick={() => setSelectedSubsystem(sub.name)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#B1A078] text-[#151719] font-medium'
                  : 'bg-[#24282B] text-[#969DA2] hover:text-[#E3E5E6]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sub.name}</span>
              {sub.powerKw && (
                <span className={`text-[11px] font-mono ${isSelected ? 'text-[#151719]' : 'text-[#6B7278]'}`}>
                  {sub.powerKw} kW
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Main Operational Intelligence Split Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-5 overflow-y-auto custom-scrollbar min-h-0">
        {/* Left Column: Spatial Environmental Telemetry */}
        <div className="space-y-4">
          <div className="bg-[#1C1F22] rounded-md p-4 border border-[#34393D]/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#34393D]/30">
              <span className="font-medium text-[#E3E5E6] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#B1A078]" />
                Spatial Focus: {activeBuilding.name}
              </span>
              <Badge variant={activeBuilding.status}>{activeBuilding.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#151719] p-3 rounded border border-[#34393D]/30">
                <div className="flex items-center gap-1.5 text-[#969DA2] text-[11px] mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-[#B1A078]" />
                  <span>Mean indoor temp</span>
                </div>
                <div className="text-xl font-mono font-medium text-[#E3E5E6]">
                  {activeBuilding.tempC}°C
                </div>
                <span className="text-[10px] text-[#638D7D]">Setpoint 22.0°C</span>
              </div>

              <div className="bg-[#151719] p-3 rounded border border-[#34393D]/30">
                <div className="flex items-center gap-1.5 text-[#969DA2] text-[11px] mb-1">
                  <Users className="w-3.5 h-3.5 text-[#638D7D]" />
                  <span>Occupancy</span>
                </div>
                <div className="text-xl font-mono font-medium text-[#E3E5E6]">
                  {activeBuilding.occupancy}
                </div>
                <span className="text-[10px] text-[#969DA2]">Persons detected</span>
              </div>

              <div className="bg-[#151719] p-3 rounded border border-[#34393D]/30">
                <div className="flex items-center gap-1.5 text-[#969DA2] text-[11px] mb-1">
                  <Zap className="w-3.5 h-3.5 text-[#C09853]" />
                  <span>Current draw</span>
                </div>
                <div className="text-xl font-mono font-medium text-[#E3E5E6]">
                  {activeBuilding.currentKw.toFixed(1)} kW
                </div>
                <span className="text-[10px] text-[#969DA2]">Baseline {activeBuilding.expectedKw} kW</span>
              </div>

              <div className="bg-[#151719] p-3 rounded border border-[#34393D]/30">
                <div className="flex items-center gap-1.5 text-[#969DA2] text-[11px] mb-1">
                  <Wind className="w-3.5 h-3.5 text-[#638D7D]" />
                  <span>Air Quality CO2</span>
                </div>
                <div className="text-xl font-mono font-medium text-[#E3E5E6]">
                  415 ppm
                </div>
                <span className="text-[10px] text-[#638D7D]">Optimal (&lt;600)</span>
              </div>
            </div>
          </div>

          {/* Building Switcher */}
          <div className="bg-[#1C1F22] rounded-md p-4 border border-[#34393D]/40 space-y-2">
            <span className="text-xs text-[#969DA2] block font-medium">Campus structures selector</span>
            <div className="space-y-1">
              {buildings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onSelectBuilding(b.id)}
                  className={`w-full flex items-center justify-between p-2 rounded text-left transition-colors cursor-pointer ${
                    b.id === selectedBuildingId
                      ? 'bg-[#24282B] text-[#E3E5E6] font-medium'
                      : 'hover:bg-[#151719] text-[#969DA2]'
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span>{b.currentKw.toFixed(1)} kW</span>
                    <Badge variant={b.status} size="xs">{b.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Live Subsystem Telemetry Bus */}
        <div className="space-y-4">
          <div className="bg-[#1C1F22] rounded-md p-4 border border-[#34393D]/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#34393D]/30">
              <span className="font-medium text-[#E3E5E6] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#B1A078]" />
                BACnet / Modbus Field Gateway Telemetry
              </span>
              <span className="text-xs font-mono text-[#638D7D]">Online</span>
            </div>

            <div className="space-y-2">
              {[
                { name: 'AHU-01 Chilled Water Supply', val: '6.2°C', baseline: '6.0°C', protocol: 'BACnet IP', status: 'normal' },
                { name: 'AHU-01 Chilled Water Return', val: '12.4°C', baseline: '12.5°C', protocol: 'BACnet IP', status: 'normal' },
                { name: 'FCU-204 Reheat Actuator', val: '78% (Jam)', baseline: '0%', protocol: 'BACnet IP', status: 'critical' },
                { name: 'Main Sub-Station Transformer A', val: '415.2 V', baseline: '415.0 V', protocol: 'Modbus RTU', status: 'normal' },
                { name: 'Sub-Station Power Factor', val: '0.94 PF', baseline: '0.95 PF', protocol: 'Modbus RTU', status: 'normal' },
                { name: 'DALI Lighting Master Zone 2', val: 'Active (Override)', baseline: 'Off (Night)', protocol: 'MQTT', status: 'warning' },
              ].map((dev, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-[#151719] border border-[#34393D]/25">
                  <div>
                    <div className="text-[#E3E5E6] font-medium">{dev.name}</div>
                    <div className="text-[11px] text-[#6B7278]">{dev.protocol} • Expected: {dev.baseline}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-medium ${dev.status === 'critical' ? 'text-[#D47A7A]' : dev.status === 'warning' ? 'text-[#D1AA68]' : 'text-[#7DA797]'}`}>
                      {dev.val}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Anomaly Correlator */}
        <div className="space-y-4">
          <div className="bg-[#1C1F22] rounded-md p-4 border border-[#34393D]/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#34393D]/30">
              <span className="font-medium text-[#E3E5E6] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D47A7A]" />
                Anomaly Diagnostic Matrix
              </span>
              <span className="text-xs font-mono text-[#D47A7A]">{anomalies.length} detected</span>
            </div>

            <div className="space-y-2">
              {anomalies.map((a) => (
                <div
                  key={a.id}
                  onClick={() => onOpenAnomaly(a.id)}
                  className="p-3 rounded bg-[#151719] hover:bg-[#24282B] border border-[#34393D]/30 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium text-[#E3E5E6]">{a.id}</span>
                    <Badge variant={a.severity}>{a.severity}</Badge>
                  </div>
                  <div className="text-[#E3E5E6] font-medium truncate">{a.asset}</div>
                  <div className="text-[11px] text-[#969DA2] line-clamp-2">{a.description}</div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#34393D]/20 text-[11px]">
                    <span className="text-[#D47A7A] font-mono">{a.actualPower.toFixed(2)} kW vs {a.expectedPower.toFixed(2)} kW</span>
                    <span className="text-[#B1A078] hover:underline">Investigate →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
