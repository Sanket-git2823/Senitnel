import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  Thermometer,
  Wind,
  Gauge,
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
import { TelemetryPoint } from '../../types/sentinel';
import { LAB_204_TELEMETRY, LAB_204_TELEMETRY_RESOLVED } from '../../data/mockData';
import { Badge } from '../common/Badge';

interface LiveMonitoringWorkspaceProps {
  isResolved: boolean;
}

export const LiveMonitoringWorkspace: React.FC<LiveMonitoringWorkspaceProps> = ({ isResolved }) => {
  const [telemetryStream, setTelemetryStream] = useState<TelemetryPoint[]>(
    isResolved ? LAB_204_TELEMETRY_RESOLVED : LAB_204_TELEMETRY
  );
  const [activeFrequency, setActiveFrequency] = useState<'1s' | '5s' | '10s'>('5s');

  useEffect(() => {
    setTelemetryStream(isResolved ? LAB_204_TELEMETRY_RESOLVED : LAB_204_TELEMETRY);
  }, [isResolved]);

  const currentPower = isResolved ? 0.98 : 3.82;
  const currentTemp = isResolved ? 23.9 : 27.4;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#151719] overflow-y-auto select-none p-5 space-y-4 text-xs custom-scrollbar">
      {/* 1. Header & Live Stream Status */}
      <div className="bg-[#1C1F22] rounded-md p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-[#B1A078]" />
          <div>
            <h2 className="font-medium text-[#E3E5E6] text-sm">
              Live telemetry stream
            </h2>
            <p className="text-xs text-[#969DA2]">
              Industrial bus ingestion with 10-second polling interval
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[#969DA2] mr-1">Poll rate:</span>
          {(['1s', '5s', '10s'] as const).map((freq) => (
            <button
              key={freq}
              onClick={() => setActiveFrequency(freq)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                activeFrequency === freq
                  ? 'bg-[#B1A078] text-[#151719] font-medium'
                  : 'bg-[#24282B] text-[#969DA2] hover:text-[#E3E5E6]'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top Sensor Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="bg-[#1C1F22] rounded-md p-3.5">
          <div className="flex justify-between items-center text-[#969DA2]">
            <span>Lab 204 sub-panel</span>
            <Zap className="w-3.5 h-3.5 text-[#B1A078]" />
          </div>
          <div className="text-2xl font-medium font-mono text-[#E3E5E6] mt-1 tabular-nums">
            {currentPower.toFixed(2)} kW
          </div>
          <span className={`text-xs block mt-1 ${isResolved ? 'text-[#638D7D]' : 'text-[#D47A7A]'}`}>
            {isResolved ? 'Baseline (0.98 kW)' : 'Overdraw (+289.8%)'}
          </span>
        </div>

        <div className="bg-[#1C1F22] rounded-md p-3.5">
          <div className="flex justify-between items-center text-[#969DA2]">
            <span>Zone thermostat</span>
            <Thermometer className="w-3.5 h-3.5 text-[#6B7278]" />
          </div>
          <div className="text-2xl font-medium font-mono text-[#E3E5E6] mt-1 tabular-nums">
            {currentTemp.toFixed(1)}°C
          </div>
          <span className="text-xs text-[#969DA2] block mt-1">
            Target setpoint: 21.0°C
          </span>
        </div>

        <div className="bg-[#1C1F22] rounded-md p-3.5">
          <div className="flex justify-between items-center text-[#969DA2]">
            <span>Indoor CO2</span>
            <Wind className="w-3.5 h-3.5 text-[#6B7278]" />
          </div>
          <div className="text-2xl font-medium font-mono text-[#E3E5E6] mt-1 tabular-nums">
            420 ppm
          </div>
          <span className="text-xs text-[#638D7D] block mt-1">
            Air exchange optimal
          </span>
        </div>

        <div className="bg-[#1C1F22] rounded-md p-3.5">
          <div className="flex justify-between items-center text-[#969DA2]">
            <span>Gateway latency</span>
            <Gauge className="w-3.5 h-3.5 text-[#6B7278]" />
          </div>
          <div className="text-2xl font-medium font-mono text-[#E3E5E6] mt-1 tabular-nums">
            18 ms
          </div>
          <span className="text-xs text-[#638D7D] block mt-1">
            0 packet drops
          </span>
        </div>
      </div>

      {/* 3. Oscillogram Chart */}
      <div className="bg-[#1C1F22] rounded-md p-4 flex flex-col min-h-[270px] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-medium text-[#E3E5E6] text-sm">
              Real-time circuit draw profile (Lab 204)
            </h3>
            <p className="text-xs text-[#969DA2]">
              Modbus registers 40001–40016
            </p>
          </div>
        </div>

        <div className="flex-1 w-full h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetryStream} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262B2E" vertical={false} />
              <XAxis dataKey="time" stroke="#6B7278" tick={{ fontSize: 10, fill: '#969DA2' }} tickLine={false} />
              <YAxis stroke="#6B7278" tick={{ fontSize: 10, fill: '#969DA2' }} tickLine={false} domain={[0, 5]} unit=" kW" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1F22',
                  borderColor: '#34393D',
                  fontSize: 11,
                  color: '#E3E5E6'
                }}
              />
              <Line type="monotone" dataKey="actual" name="Load (kW)" stroke="#B1A078" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="stepAfter" dataKey="expected" name="Baseline (kW)" stroke="#638D7D" strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Active Ingestion Hardware Nodes Table */}
      <div className="bg-[#1C1F22] rounded-md p-4 shrink-0">
        <h3 className="font-medium text-[#E3E5E6] text-sm mb-3">
          Active edge gateways & protocol bridges
        </h3>

        <table className="w-full text-left text-xs">
          <thead className="text-[#969DA2] border-b border-[#34393D]/40">
            <tr>
              <th className="pb-2 font-normal">Gateway ID</th>
              <th className="pb-2 font-normal">Location</th>
              <th className="pb-2 font-normal">Protocol</th>
              <th className="pb-2 font-normal">Connected nodes</th>
              <th className="pb-2 font-normal">Throughput</th>
              <th className="pb-2 text-right font-normal">Link status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#34393D]/30">
            {[
              { id: 'GW-ACAD-A-L2', loc: 'Block A Level 2 Lab Racks', proto: 'BACnet IP / MSTP', nodes: 48, rate: '14.2 KB/s' },
              { id: 'GW-ACAD-A-L1', loc: 'Block A Ground Floor Comm', proto: 'Modbus TCP', nodes: 36, rate: '8.4 KB/s' },
              { id: 'GW-PLANT-SUB1', loc: 'Central Substation Switchgear', proto: 'Modbus RTU (RS-485)', nodes: 92, rate: '28.6 KB/s' },
              { id: 'GW-HOSTEL-N', loc: 'Hostel A North Distribution', proto: 'Zigbee Pro Gateway', nodes: 120, rate: '6.1 KB/s' },
              { id: 'GW-LIB-CHILL', loc: 'Central Library Mechanical Rm', proto: 'BACnet IP', nodes: 24, rate: '9.8 KB/s' }
            ].map((gw) => (
              <tr key={gw.id} className="text-[#E3E5E6]">
                <td className="py-2.5 font-mono">{gw.id}</td>
                <td className="py-2.5 text-[#969DA2]">{gw.loc}</td>
                <td className="py-2.5 font-mono text-[#969DA2]">{gw.proto}</td>
                <td className="py-2.5 font-mono">{gw.nodes} devices</td>
                <td className="py-2.5 font-mono text-[#969DA2]">{gw.rate}</td>
                <td className="py-2.5 text-right">
                  <Badge variant="normal">Online</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
