import React from 'react';
import {
  Flame,
  Clock,
  MapPin,
  Calendar,
  Users,
  Thermometer,
  Wrench,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Anomaly } from '../../types/sentinel';
import { LAB_204_INVESTIGATION, LAB_204_TELEMETRY, LAB_204_TELEMETRY_RESOLVED } from '../../data/mockData';
import { Badge } from '../common/Badge';

interface InvestigationWorkspaceProps {
  anomaly?: Anomaly;
  allAnomalies: Anomaly[];
  onSelectAnomaly: (anomalyId: string) => void;
  onCreateOrViewWorkOrder: (anomaly: Anomaly) => void;
  isResolved: boolean;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  anomaly,
  allAnomalies,
  onSelectAnomaly,
  onCreateOrViewWorkOrder,
  isResolved
}) => {
  const currentAnomaly = anomaly || allAnomalies[0];
  const investigation = currentAnomaly.investigation || LAB_204_INVESTIGATION;

  const chartData = isResolved ? LAB_204_TELEMETRY_RESOLVED : LAB_204_TELEMETRY;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#151719] overflow-y-auto select-none p-5 space-y-4 custom-scrollbar">
      {/* 1. Header & Incident Selector Strip */}
      <div className="bg-[#1C1F22] rounded-md p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#24282B] flex items-center justify-center text-[#B85555] shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-[#E3E5E6]">
                {investigation.assetName}
              </h2>
              <Badge variant={currentAnomaly.severity}>
                {currentAnomaly.severity === 'critical' ? 'Critical' : 'High'}
              </Badge>
              <Badge variant={isResolved ? 'Resolved' : currentAnomaly.status}>
                {isResolved ? 'Resolved' : currentAnomaly.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#969DA2] mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#6B7278]" />
                {investigation.locationBreadcrumb}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#6B7278]" />
                Detected {currentAnomaly.detectedAt} ({currentAnomaly.duration} active)
              </span>
            </div>
          </div>
        </div>

        {/* Anomaly Selector Dropdown & Action Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#969DA2]">Inspect incident:</span>
            <select
              value={currentAnomaly.id}
              onChange={(e) => onSelectAnomaly(e.target.value)}
              className="bg-[#151719] text-[#E3E5E6] rounded-md px-2.5 py-1.5 text-xs focus:outline-none border border-[#34393D]"
            >
              {allAnomalies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.asset}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onCreateOrViewWorkOrder(currentAnomaly)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#B1A078] hover:bg-[#C5B58D] text-[#151719] font-medium text-xs transition-colors cursor-pointer shrink-0"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Dispatch work order</span>
          </button>
        </div>
      </div>

      {/* 2. Key Diagnostic Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">
        <div className="bg-[#1C1F22] rounded-md p-3">
          <span className="text-xs text-[#969DA2] block">Observed power</span>
          <div className="text-xl font-medium text-[#E3E5E6] font-mono tabular-nums my-1">
            {isResolved ? '0.98 kW' : `${investigation.observedPowerKw.toFixed(2)} kW`}
          </div>
          <span className="text-xs text-[#D47A7A]">
            {isResolved ? 'Recovered to baseline' : `+${investigation.deviationPct}% deviation`}
          </span>
        </div>

        <div className="bg-[#1C1F22] rounded-md p-3">
          <span className="text-xs text-[#969DA2] block">Expected baseline</span>
          <div className="text-xl font-medium text-[#E3E5E6] font-mono tabular-nums my-1">
            {investigation.baselinePowerKw.toFixed(2)} kW
          </div>
          <span className="text-xs text-[#638D7D]">
            Idle threshold
          </span>
        </div>

        <div className="bg-[#1C1F22] rounded-md p-3">
          <span className="text-xs text-[#969DA2] block">Detection confidence</span>
          <div className="text-xl font-medium text-[#E3E5E6] font-mono tabular-nums my-1">
            {investigation.confidenceScore}%
          </div>
          <span className="text-xs text-[#969DA2]">
            Ensemble model
          </span>
        </div>

        <div className="bg-[#1C1F22] rounded-md p-3">
          <span className="text-xs text-[#969DA2] block">Daily energy waste</span>
          <div className="text-xl font-medium text-[#E3E5E6] font-mono tabular-nums my-1">
            {isResolved ? '0.0 kWh' : `${investigation.estimatedKwhWastePerDay} kWh`}
          </div>
          <span className="text-xs text-[#969DA2]">
            {isResolved ? 'Loss cleared' : 'Excess consumption'}
          </span>
        </div>

        <div className="bg-[#1C1F22] rounded-md p-3">
          <span className="text-xs text-[#969DA2] block">Daily financial waste</span>
          <div className="text-xl font-medium text-[#E3E5E6] font-mono tabular-nums my-1">
            {isResolved ? '$0.00' : `$${investigation.estimatedFinancialWastePerDay.toFixed(2)}`}
          </div>
          <span className="text-xs text-[#969DA2]">
            {isResolved ? 'Verified savings' : '$1,572/month run-rate'}
          </span>
        </div>
      </div>

      {/* 3. Telemetry Timeline Chart */}
      <div className="bg-[#1C1F22] rounded-md p-4 flex flex-col min-h-[280px] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-[#E3E5E6]">
              Telemetry timeline comparison
            </h3>
            <p className="text-xs text-[#969DA2]">
              Observed circuit draw against dynamic baseline over the past 6 hours
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#969DA2]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-[#B85555] rounded-full inline-block" />
              <span>Observed load</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#638D7D] inline-block" />
              <span>Baseline</span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Area
                type="monotone"
                dataKey="actual"
                name="Observed power"
                stroke="#B85555"
                strokeWidth={1.5}
                fill="#B85555"
                fillOpacity={0.12}
                isAnimationActive={false}
              />
              <Line
                type="stepAfter"
                dataKey="expected"
                name="Baseline"
                stroke="#638D7D"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
              <ReferenceLine y={1.2} stroke="#C09853" strokeDasharray="3 3" label={{ value: 'Idle threshold (1.20 kW)', fill: '#C09853', fontSize: 10, position: 'insideTopRight' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Tri-Context Matrix (Occupancy, Schedule, Environmental) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
        <div className="bg-[#1C1F22] rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#34393D]/40">
            <span className="text-xs font-medium text-[#E3E5E6] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#969DA2]" />
              Occupancy context
            </span>
            <span className="text-xs text-[#638D7D]">Confirmed empty</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#969DA2]">Motion sensor (PIR-204):</span>
              <span className="text-[#E3E5E6]">0 pulses (45m)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#969DA2]">Access turnstiles:</span>
              <span className="text-[#E3E5E6]">0 active badges</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1C1F22] rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#34393D]/40">
            <span className="text-xs font-medium text-[#E3E5E6] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#969DA2]" />
              Timetable context
            </span>
            <span className="text-xs text-[#B1A078]">{investigation.timetableStatus}</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#969DA2]">Scheduled activity:</span>
              <span className="text-[#E3E5E6]">None (idle period)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#969DA2]">Curfew window:</span>
              <span className="text-[#E3E5E6]">20:00 – 08:00 IST</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1C1F22] rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#34393D]/40">
            <span className="text-xs font-medium text-[#E3E5E6] flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-[#969DA2]" />
              Environmental context
            </span>
            <span className="text-xs text-[#D47A7A]">Thermal overshoot</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#969DA2]">Indoor temperature:</span>
              <span className="text-[#E3E5E6]">{investigation.indoorTempC}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#969DA2]">Target setpoint:</span>
              <span className="text-[#E3E5E6]">{investigation.setpointTempC}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Contributing Signals Table */}
      <div className="bg-[#1C1F22] rounded-md p-4 shrink-0">
        <h3 className="text-sm font-medium text-[#E3E5E6] mb-3">
          Contributing signals and root-cause evidence
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[#969DA2] border-b border-[#34393D]/40">
              <tr>
                <th className="pb-2">Subsystem</th>
                <th className="pb-2">Telemetry signal</th>
                <th className="pb-2">Observed value</th>
                <th className="pb-2">Expected baseline</th>
                <th className="pb-2">Deviation</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34393D]/30">
              {investigation.contributingSignals.map((sig) => (
                <tr key={sig.id} className="text-[#E3E5E6]">
                  <td className="py-2.5 text-[#969DA2]">{sig.subsystem}</td>
                  <td className="py-2.5 font-medium">{sig.signalName}</td>
                  <td className="py-2.5 font-mono text-[#D47A7A]">{sig.observedValue}</td>
                  <td className="py-2.5 font-mono text-[#969DA2]">{sig.expectedValue}</td>
                  <td className="py-2.5 font-mono text-[#D1AA68]">{sig.deviation}</td>
                  <td className="py-2.5 text-right">
                    <Badge variant={sig.status === 'critical' ? 'critical' : 'normal'}>
                      {sig.status === 'critical' ? 'Fault' : 'Normal'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Recommended Action Dispatch */}
      <div className="bg-[#1C1F22] rounded-md p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
        <div>
          <span className="text-xs text-[#B1A078] font-medium block mb-1">
            Recommended remediation
          </span>
          <p className="text-sm text-[#E3E5E6]">
            {investigation.recommendedActions[0].action}
          </p>
          <p className="text-xs text-[#969DA2] mt-0.5">
            {investigation.recommendedActions[0].impactPrediction}
          </p>
        </div>

        <button
          onClick={() => onCreateOrViewWorkOrder(currentAnomaly)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#B1A078] hover:bg-[#C5B58D] text-[#151719] font-medium text-xs transition-colors cursor-pointer shrink-0"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Dispatch work order (WO-7821)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
