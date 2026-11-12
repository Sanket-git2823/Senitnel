import React, { useState } from 'react';
import {
  BarChart3,
  DollarSign,
  Leaf,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  CAMPUS_ENERGY_DISTRIBUTION,
  BUILDING_ENERGY_COMPARISON,
  PEAK_DEMAND_CURVE
} from '../../data/mockData';
import { MetricCard } from '../common/MetricCard';

interface AnalyticsWorkspaceProps {
  isResolved: boolean;
}

const BAR_COLORS = ['#B1A078', '#638D7D', '#5B84A1', '#C09853', '#8E7DA1'];

export const AnalyticsWorkspace: React.FC<AnalyticsWorkspaceProps> = ({ isResolved }) => {
  const [timeRange, setTimeRange] = useState<string>('24h');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#151719] overflow-y-auto select-none p-5 space-y-4 text-xs custom-scrollbar">
      {/* 1. Header & Time Filter Range */}
      <div className="bg-[#1C1F22] rounded-md p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-4 h-4 text-[#B1A078]" />
          <div>
            <h2 className="font-medium text-[#E3E5E6] text-sm">
              Operational analytics
            </h2>
            <p className="text-xs text-[#969DA2]">
              Historical energy consumption, demand curves, and subsystem distributions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {['24h', '7d', '30d', '90d', 'YTD'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                timeRange === t
                  ? 'bg-[#B1A078] text-[#151719] font-medium'
                  : 'bg-[#24282B] text-[#969DA2] hover:text-[#E3E5E6]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <MetricCard
          label="Total consumption"
          value={isResolved ? '9.85' : '10.36'}
          unit="MWh"
          subValue={isResolved ? '510 kWh saved post-resolution' : '+1.4% above campus baseline'}
          status={isResolved ? 'nominal' : 'warning'}
          icon={Zap}
        />
        <MetricCard
          label="Daily energy expenditure"
          value={isResolved ? '4,768' : '4,820'}
          unit="USD"
          subValue="Current tariff run-rate"
          status="nominal"
          icon={DollarSign}
        />
        <MetricCard
          label="Carbon footprint"
          value={isResolved ? '2.78' : '2.84'}
          unit="tCO2e"
          subValue="Scope 2 electricity emissions"
          status="nominal"
          icon={Leaf}
        />
        <MetricCard
          label="Intervention savings"
          value={isResolved ? '692.40' : '640.00'}
          unit="USD / Day"
          subValue="Verified through Sentinel dispatches"
          status="nominal"
          icon={ShieldCheck}
        />
      </div>

      {/* 3. Grid Row: Peak Demand Curve & Subsystems Energy Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
        {/* Peak Demand Tracking Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#1C1F22] rounded-md p-4 flex flex-col min-h-[260px]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium text-[#E3E5E6] text-sm">
                Peak demand tracking
              </h3>
              <p className="text-xs text-[#969DA2]">
                Contracted threshold: 1,400 kW · Recorded peak: 1,390 kW
              </p>
            </div>
            <span className="text-xs text-[#638D7D] font-medium">Within contract limits</span>
          </div>

          <div className="flex-1 w-full h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PEAK_DEMAND_CURVE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262B2E" vertical={false} />
                <XAxis dataKey="time" stroke="#6B7278" tick={{ fontSize: 10, fill: '#969DA2' }} tickLine={false} />
                <YAxis stroke="#6B7278" tick={{ fontSize: 10, fill: '#969DA2' }} tickLine={false} domain={[200, 1600]} unit=" kW" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1F22',
                    borderColor: '#34393D',
                    fontSize: 11,
                    color: '#E3E5E6'
                  }}
                />
                <Area type="monotone" dataKey="demandKw" name="Demand (kW)" stroke="#B1A078" fill="#B1A078" fillOpacity={0.12} strokeWidth={1.5} isAnimationActive={false} />
                <ReferenceLine y={1400} stroke="#B85555" strokeDasharray="3 3" label={{ value: 'Contract limit (1,400 kW)', fill: '#B85555', fontSize: 10, position: 'insideTopLeft' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subsystem Distribution */}
        <div className="bg-[#1C1F22] rounded-md p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#34393D]/40 mb-3">
            <h3 className="font-medium text-[#E3E5E6] text-sm">
              Subsystem distribution
            </h3>
            <span className="text-xs text-[#969DA2]">10.36 MWh total</span>
          </div>

          <div className="space-y-3 my-auto">
            {CAMPUS_ENERGY_DISTRIBUTION.map((item, idx) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#969DA2]">{item.name}</span>
                  <span className="font-mono text-[#E3E5E6]">{item.value}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#151719] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: BAR_COLORS[idx % BAR_COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#34393D]/40 text-xs text-[#969DA2] flex justify-between">
            <span>Primary load: HVAC systems</span>
            <span className="font-mono text-[#E3E5E6]">48%</span>
          </div>
        </div>
      </div>

      {/* 4. Building-Wise Energy Variance Comparison */}
      <div className="bg-[#1C1F22] rounded-md p-4 flex flex-col shrink-0 min-h-[250px]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-medium text-[#E3E5E6] text-sm">
              Building consumption comparison
            </h3>
            <p className="text-xs text-[#969DA2]">
              Current load measured against expected baseline
            </p>
          </div>
        </div>

        <div className="flex-1 w-full h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BUILDING_ENERGY_COMPARISON} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262B2E" vertical={false} />
              <XAxis dataKey="name" stroke="#6B7278" tick={{ fontSize: 10, fill: '#969DA2' }} tickLine={false} />
              <YAxis stroke="#6B7278" tick={{ fontSize: 10, fill: '#969DA2' }} tickLine={false} unit=" kW" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1F22',
                  borderColor: '#34393D',
                  fontSize: 11,
                  color: '#E3E5E6'
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#969DA2' }} />
              <Bar dataKey="current" name="Current load (kW)" fill="#B1A078" radius={[2, 2, 0, 0]} />
              <Bar dataKey="baseline" name="Baseline (kW)" fill="#24282B" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
