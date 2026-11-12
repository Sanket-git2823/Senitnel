import React, { useState, useEffect } from 'react';
import { Activity, Clock, Wifi, WifiOff } from 'lucide-react';
import { apiClient, type WsState } from '../../services/api-client';

interface BottomStatusBarProps {
  isMockData?: boolean;
  onToggleMockMode?: () => void;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  isMockData = false,
  onToggleMockMode
}) => {
  const [latency, setLatency] = useState(14);
  const [secondsAgo, setSecondsAgo] = useState(0.8);
  const [wsState, setWsState] = useState<WsState>(apiClient.getWsState());

  useEffect(() => {
    // Listen to real WebSocket status changes
    const unsub = apiClient.onWsStateChange((state) => {
      setWsState(state);
    });

    const timer = setInterval(() => {
      setLatency(12 + Math.floor(Math.random() * 6));
      setSecondsAgo((prev) => (prev > 4.5 ? 0.6 : Number((prev + 0.5).toFixed(1))));
    }, 2000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const getStatusColor = () => {
    switch (wsState) {
      case 'connected':
        return 'bg-[#638D7D]';
      case 'connecting':
        return 'bg-[#C09853] animate-pulse';
      case 'disconnected':
      default:
        return 'bg-[#B85555]';
    }
  };

  const getStatusLabel = () => {
    switch (wsState) {
      case 'connected':
        return 'Live Engine Connected';
      case 'connecting':
        return 'Connecting to Engine...';
      case 'disconnected':
      default:
        return 'Offline / Local Fallback';
    }
  };

  return (
    <footer className="h-7 bg-[#151719] border-t border-[#34393D]/50 flex items-center justify-between px-4 text-xs text-[#969DA2] select-none z-30 shrink-0">
      {/* Stream connection */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-[#E3E5E6]">
          <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor()}`} />
          <span className="font-medium">{getStatusLabel()}</span>
        </div>
        <span className="text-[#34393D]">|</span>
        <span className="text-[#6B7278] hidden sm:inline font-mono text-[11px]">
          {apiClient.getWsUrl()}
        </span>
      </div>

      {/* Latency & device counts */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-[#6B7278]" />
          <span className="text-[#6B7278]">Latency:</span>
          <span className="font-mono tabular-nums text-[#E3E5E6]">{latency}ms</span>
        </div>

        <span className="text-[#34393D]">|</span>

        <div className="flex items-center gap-1.5">
          <span className="text-[#6B7278]">Sensors:</span>
          <span className="font-mono tabular-nums text-[#E3E5E6]">1,428 / 1,432 online</span>
        </div>

        <span className="text-[#34393D]">|</span>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-[#6B7278]" />
          <span className="text-[#6B7278]">Last sync:</span>
          <span className="font-mono tabular-nums text-[#E3E5E6]">{secondsAgo}s ago</span>
        </div>
      </div>

      {/* System state */}
      <div className="flex items-center gap-3">
        <span className="text-[#638D7D] font-medium">Operational</span>
        {onToggleMockMode && (
          <button
            onClick={onToggleMockMode}
            className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#24282B] hover:bg-[#2F3438] text-[#B1A078] transition-colors cursor-pointer"
            title="Toggle Engine vs Mock Mode"
          >
            {isMockData ? 'Mock Mode' : 'Live Engine'}
          </button>
        )}
      </div>
    </footer>
  );
};
