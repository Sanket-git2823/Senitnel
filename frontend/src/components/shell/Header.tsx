import React, { useState, useEffect } from 'react';
import { Search, Bell, Clock, User, ChevronRight } from 'lucide-react';
import { Operator } from '../../types/sentinel';
import { SentinelLogo } from '../common/SentinelLogo';

interface HeaderProps {
  currentWorkspace: string;
  activeSubPath?: string;
  onOpenCommand: () => void;
  operator: Operator;
  unreadCount?: number;
  onToggleDemoScenario?: () => void;
  isDemoActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentWorkspace,
  activeSubPath,
  onOpenCommand,
  operator,
  unreadCount = 7,
  onToggleDemoScenario,
  isDemoActive = false
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }) + ' IST');
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-12 bg-[#1C1F22] border-b border-[#34393D]/50 flex items-center justify-between px-4 select-none z-30 shrink-0">
      {/* Brand & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 pr-4 border-r border-[#34393D]/60">
          <SentinelLogo className="w-5 h-5" />
          <span className="text-sm font-semibold tracking-tight text-[#E3E5E6]">
            Sentinel
          </span>
          <span className="text-[11px] font-mono text-[#969DA2] px-1.5 py-0.5 rounded bg-[#24282B]">
            v2.4
          </span>
        </div>

        {/* Clean sentence-case breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#969DA2]">
          <span>Campus</span>
          <ChevronRight className="w-3 h-3 text-[#6B7278]" />
          <span className="text-[#E3E5E6] font-medium">{currentWorkspace}</span>
          {activeSubPath && (
            <>
              <ChevronRight className="w-3 h-3 text-[#6B7278]" />
              <span className="text-[#B1A078]">{activeSubPath}</span>
            </>
          )}
        </div>
      </div>

      {/* Center: Scenario Guide Trigger */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={onToggleDemoScenario}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
            isDemoActive
              ? 'bg-[#B1A078] text-[#151719] font-medium'
              : 'bg-[#24282B] hover:bg-[#2A2F33] text-[#E3E5E6]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>Demo scenario: Lab 204</span>
        </button>
      </div>

      {/* Right Controls: Search, Clock, Operator, Notifications */}
      <div className="flex items-center gap-3">
        {/* Global Search */}
        <button
          onClick={onOpenCommand}
          className="flex items-center gap-2 bg-[#151719] hover:bg-[#24282B] rounded-md px-3 py-1.5 text-xs text-[#969DA2] transition-colors cursor-pointer w-48"
        >
          <Search className="w-3.5 h-3.5 text-[#6B7278]" />
          <span className="truncate">Search or jump to...</span>
          <kbd className="ml-auto text-[10px] font-mono text-[#6B7278] bg-[#24282B] px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#969DA2] font-mono px-2 py-1">
          <Clock className="w-3.5 h-3.5 text-[#6B7278]" />
          <span className="tabular-nums">{currentTime || '23:39:45 IST'}</span>
        </div>

        {/* Operator Profile */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#34393D]/60">
          <div className="w-6 h-6 rounded-full bg-[#24282B] flex items-center justify-center text-[#E3E5E6]">
            <User className="w-3.5 h-3.5 text-[#969DA2]" />
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-medium text-[#E3E5E6] leading-none">
              {operator.name}
            </span>
            <span className="text-[11px] text-[#969DA2] leading-tight">
              {operator.level}
            </span>
          </div>
        </div>

        {/* Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-7 h-7 rounded hover:bg-[#24282B] text-[#969DA2] hover:text-[#E3E5E6] flex items-center justify-center transition-colors relative"
            title="Active notifications"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B85555]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-9 w-72 bg-[#1C1F22] rounded-md shadow-xl p-3 z-50 text-xs border border-[#34393D]">
              <div className="flex items-center justify-between pb-2 border-b border-[#34393D]/50 mb-2">
                <span className="font-medium text-[#E3E5E6]">Notifications</span>
                <span className="text-[11px] text-[#B85555] font-mono">{unreadCount} active</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-[#24282B] rounded text-xs space-y-1">
                  <div className="flex justify-between text-[#E3E5E6] font-medium">
                    <span>Lab 204 — Anomaly ANO-101</span>
                    <span className="text-[#969DA2] text-[10px]">31m</span>
                  </div>
                  <p className="text-[11px] text-[#969DA2]">High power draw during unscheduled window.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
