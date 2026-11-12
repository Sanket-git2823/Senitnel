import React from 'react';
import { cn } from '../../lib/utils';
import { SeverityLevel, WorkOrderStatus, AnomalyStatus } from '../../types/sentinel';

export type BadgeVariant =
  | SeverityLevel
  | WorkOrderStatus
  | AnomalyStatus
  | 'default'
  | 'outline'
  | 'accent'
  | 'normal'
  | 'warning'
  | 'no-data';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'xs' | 'sm';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  size = 'xs'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return 'bg-[#B85555]/15 text-[#D47A7A] border border-[#B85555]/25';
      case 'high':
      case 'warning':
        return 'bg-[#C09853]/15 text-[#D1AA68] border border-[#C09853]/25';
      case 'medium':
        return 'bg-[#B1A078]/15 text-[#C5B58D] border border-[#B1A078]/25';
      case 'low':
      case 'normal':
        return 'bg-[#638D7D]/15 text-[#7DA797] border border-[#638D7D]/25';
      case 'no-data':
        return 'bg-[#24282B] text-[#969DA2] border border-[#34393D]/50';
      case 'Open':
      case 'New':
        return 'bg-[#B1A078]/15 text-[#C5B58D] border border-[#B1A078]/25';
      case 'Assigned':
      case 'Investigating':
        return 'bg-[#5B84A1]/15 text-[#7EA7C4] border border-[#5B84A1]/25';
      case 'Started':
      case 'In Progress':
        return 'bg-[#C09853]/15 text-[#D1AA68] border border-[#C09853]/25';
      case 'Resolved':
      case 'Verified':
        return 'bg-[#638D7D]/15 text-[#7DA797] border border-[#638D7D]/25';
      case 'accent':
        return 'bg-[#B1A078]/15 text-[#C5B58D] border border-[#B1A078]/25';
      case 'outline':
        return 'bg-transparent text-[#969DA2] border border-[#34393D]';
      default:
        return 'bg-[#24282B] text-[#969DA2] border border-[#34393D]/50';
    }
  };

  const sizeClass = size === 'xs' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-sm select-none tracking-normal tabular-nums',
        sizeClass,
        getVariantStyles(),
        className
      )}
    >
      {children}
    </span>
  );
};
