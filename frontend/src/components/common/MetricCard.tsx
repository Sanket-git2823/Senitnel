import React from 'react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  status?: 'nominal' | 'warning' | 'critical';
  icon?: LucideIcon;
  badge?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subValue,
  status = 'nominal',
  icon: Icon,
  badge,
  className
}) => {
  const getStatusDot = () => {
    switch (status) {
      case 'critical':
        return 'bg-[#B85555]';
      case 'warning':
        return 'bg-[#C09853]';
      case 'nominal':
      default:
        return 'bg-[#638D7D]';
    }
  };

  return (
    <div
      className={cn(
        'bg-[#1C1F22] rounded-md p-3.5 flex flex-col justify-between transition-colors',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs text-[#969DA2] font-normal truncate">
          {label}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {badge && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#24282B] text-[#969DA2]">
              {badge}
            </span>
          )}
          {Icon && <Icon className="w-3.5 h-3.5 text-[#6B7278]" />}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl font-semibold text-[#E3E5E6] font-mono tracking-tight tabular-nums">
          {value}
        </span>
        {unit && <span className="text-xs text-[#969DA2]">{unit}</span>}
      </div>

      {subValue && (
        <div className="text-xs text-[#969DA2] flex items-center gap-1.5 mt-1">
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', getStatusDot())} />
          <span className="truncate">{subValue}</span>
        </div>
      )}
    </div>
  );
};
