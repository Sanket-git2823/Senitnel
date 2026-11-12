import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { BuildingNode } from '../../types/sentinel';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface BuildingCardProps {
  building: BuildingNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function generateSparklineData(building: BuildingNode) {
  const base = building.expectedKw;
  const current = building.currentKw;
  const pts: { t: number; v: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const ratio = i / 5;
    const noise = (Math.sin(i * 2.3 + building.currentKw) * 0.08) * base;
    const v = base + (current - base) * ratio * 0.7 + noise;
    pts.push({ t: i, v: Math.max(0, v) });
  }
  pts.push({ t: 6, v: current });
  return pts;
}

export const BuildingCard: React.FC<BuildingCardProps> = ({
  building,
  isSelected,
  onSelect,
}) => {
  const sparkData = useMemo(() => generateSparklineData(building), [building]);

  const getStatusDot = () => {
    switch (building.status) {
      case 'critical':
        return 'bg-[#B85555]';
      case 'warning':
        return 'bg-[#C09853]';
      case 'normal':
      default:
        return 'bg-[#638D7D]';
    }
  };

  const getStatusText = () => {
    switch (building.status) {
      case 'critical':
        return 'text-[#D47A7A]';
      case 'warning':
        return 'text-[#D1AA68]';
      case 'normal':
      default:
        return 'text-[#7DA797]';
    }
  };

  const deviation = building.expectedKw > 0
    ? ((building.currentKw - building.expectedKw) / building.expectedKw) * 100
    : 0;

  return (
    <div
      onClick={() => onSelect(building.id)}
      className={cn(
        'w-full text-left rounded-md p-3.5 transition-all cursor-pointer surface-transition',
        isSelected
          ? 'bg-[#24282B] text-[#E3E5E6]'
          : 'bg-[#1C1F22] hover:bg-[#24282B]/80 text-[#E3E5E6]'
      )}
    >
      {/* Header: Name and Status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn('w-2 h-2 rounded-full shrink-0', getStatusDot())} />
          <span className="text-sm font-medium text-[#E3E5E6] truncate">
            {building.shortName}
          </span>
        </div>
        <span className="text-xs text-[#969DA2] shrink-0">
          {building.category}
        </span>
      </div>

      {/* Sparkline chart - quiet and integrated */}
      <div className="h-6 w-full my-2 opacity-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Line
              type="monotone"
              dataKey="v"
              stroke={isSelected ? '#B1A078' : '#969DA2'}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Metric readout */}
      <div className="flex items-baseline justify-between mt-1 pt-1.5 border-t border-[#34393D]/40">
        <div className="flex items-baseline gap-1">
          <span className="text-base font-medium text-[#E3E5E6] font-mono tabular-nums">
            {building.currentKw.toFixed(1)}
          </span>
          <span className="text-xs text-[#969DA2]">kW</span>
        </div>
        <span className={cn('text-xs font-mono tabular-nums', getStatusText())}>
          {deviation > 0 ? `+${deviation.toFixed(0)}%` : `${deviation.toFixed(0)}%`}
        </span>
      </div>
    </div>
  );
};
