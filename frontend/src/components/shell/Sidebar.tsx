import React, { useState } from 'react';
import {
  LayoutDashboard,
  Compass,
  Network,
  Activity,
  AlertTriangle,
  Search,
  ClipboardList,
  BarChart3,
  FileText,
  Sliders,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Building,
  FlaskConical,
  Home,
  Zap,
} from 'lucide-react';
import { FilterState } from '../../types/sentinel';
import { SentinelLogo } from '../common/SentinelLogo';

export type WorkspaceTab =
  | 'OVERVIEW'
  | 'CAMPUS_INTELLIGENCE'
  | 'INFRASTRUCTURE'
  | 'LIVE_MONITORING'
  | 'INCIDENTS'
  | 'INVESTIGATIONS'
  | 'WORK_ORDERS'
  | 'ANALYTICS'
  | 'REPORTS'
  | 'ADMIN';

interface SidebarProps {
  activeWorkspace: WorkspaceTab;
  setActiveWorkspace: (tab: WorkspaceTab) => void;
  selectedAssetId: string;
  onSelectAsset: (assetId: string) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  incidentsCount?: number;
  workOrdersCount?: number;
}

interface NavItem {
  id: WorkspaceTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  counter?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
  { id: 'CAMPUS_INTELLIGENCE', label: 'Campus intelligence', icon: Compass },
  { id: 'INFRASTRUCTURE', label: 'Infrastructure', icon: Network },
  { id: 'LIVE_MONITORING', label: 'Live monitoring', icon: Activity },
  { id: 'INCIDENTS', label: 'Incidents', icon: AlertTriangle, counter: 7 },
  { id: 'INVESTIGATIONS', label: 'Investigations', icon: Search },
  { id: 'WORK_ORDERS', label: 'Work orders', icon: ClipboardList, counter: 4 },
  { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
  { id: 'REPORTS', label: 'Reports', icon: FileText },
  { id: 'ADMIN', label: 'System administration', icon: Sliders }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeWorkspace,
  setActiveWorkspace,
  selectedAssetId,
  onSelectAsset,
  incidentsCount = 7,
  workOrdersCount = 4
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    campus: true,
    academic: true,
    acadA: true,
  });

  const toggleNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside
      className={`bg-[#1C1F22] border-r border-[#34393D]/50 flex flex-col h-full select-none text-xs shrink-0 surface-transition z-20 ${
        isCollapsed ? 'w-14' : 'w-60'
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-10 px-3 flex items-center justify-between text-[#969DA2] border-b border-[#34393D]/40">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <SentinelLogo className="w-4 h-4" />
            <span className="text-xs font-medium text-[#E3E5E6]">
              Navigation
            </span>
          </div>
        ) : (
          <div className="mx-auto">
            <SentinelLogo className="w-4 h-4" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-[#24282B] text-[#969DA2] hover:text-[#E3E5E6] ml-auto transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="py-2 px-2 space-y-0.5 shrink-0 border-b border-[#34393D]/40">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeWorkspace === item.id;
          const count = item.id === 'INCIDENTS' ? incidentsCount : item.id === 'WORK_ORDERS' ? workOrdersCount : item.counter;

          return (
            <button
              key={item.id}
              onClick={() => setActiveWorkspace(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors text-left ${
                isActive
                  ? 'bg-[#24282B] text-[#E3E5E6] font-medium'
                  : 'text-[#969DA2] hover:bg-[#24282B]/60 hover:text-[#E3E5E6]'
              }`}
              title={item.label}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#B1A078]' : 'text-[#6B7278]'
                }`}
              />

              {!isCollapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {count !== undefined && count > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[11px] font-mono text-[#969DA2] bg-[#151719]">
                      {count}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Asset Hierarchy Tree (expanded state) */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col min-h-0 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#969DA2]">
              Asset hierarchy
            </span>
            <span className="text-[11px] font-mono text-[#6B7278]">1,428 nodes</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B7278] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Find structure or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#151719] rounded-md pl-8 pr-2 py-1.5 text-xs text-[#E3E5E6] placeholder-[#6B7278] focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar text-xs pt-1">
            {/* Campus root */}
            <div>
              <div
                onClick={() => onSelectAsset('campus')}
                className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer transition-colors ${
                  selectedAssetId === 'campus'
                    ? 'bg-[#24282B] text-[#E3E5E6]'
                    : 'text-[#969DA2] hover:bg-[#24282B]/50'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <button onClick={(e) => toggleNode('campus', e)} className="p-0.5 text-[#6B7278]">
                    {expandedNodes.campus ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                  <span className="truncate font-medium">All campus</span>
                </div>
                <span className="text-[11px] font-mono text-[#6B7278]">10.4 MWh</span>
              </div>

              {expandedNodes.campus && (
                <div className="ml-3 pl-2 border-l border-[#34393D]/40 space-y-1 mt-1">
                  {/* Academic Zones */}
                  <div>
                    <div
                      onClick={(e) => toggleNode('academic', e)}
                      className="flex items-center justify-between py-1 px-2 rounded-md cursor-pointer text-[#969DA2] hover:bg-[#24282B]/50"
                    >
                      <div className="flex items-center gap-1.5">
                        {expandedNodes.academic ? <ChevronDown className="w-3 h-3 text-[#6B7278]" /> : <ChevronRight className="w-3 h-3 text-[#6B7278]" />}
                        <span>Academic zones</span>
                      </div>
                    </div>

                    {expandedNodes.academic && (
                      <div className="ml-3 pl-2 border-l border-[#34393D]/40 space-y-0.5 mt-0.5">
                        {/* Block A */}
                        <div
                          onClick={() => onSelectAsset('acad-a')}
                          className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer ${
                            selectedAssetId === 'acad-a' ? 'bg-[#24282B] text-[#E3E5E6]' : 'text-[#969DA2] hover:text-[#E3E5E6]'
                          }`}
                        >
                          <span className="truncate">Block A</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#638D7D]" />
                        </div>

                        {/* Lab Complex */}
                        <div
                          onClick={() => onSelectAsset('lab-complex')}
                          className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer ${
                            selectedAssetId === 'lab-complex' || selectedAssetId === 'lab-204'
                              ? 'bg-[#24282B] text-[#E3E5E6] font-medium'
                              : 'text-[#969DA2] hover:text-[#E3E5E6]'
                          }`}
                        >
                          <span className="truncate">Lab Complex</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B85555]" />
                        </div>

                        {/* Block B */}
                        <div
                          onClick={() => onSelectAsset('acad-b')}
                          className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer ${
                            selectedAssetId === 'acad-b' ? 'bg-[#24282B] text-[#E3E5E6]' : 'text-[#969DA2] hover:text-[#E3E5E6]'
                          }`}
                        >
                          <span className="truncate">Block B</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C09853]" />
                        </div>

                        {/* Library */}
                        <div
                          onClick={() => onSelectAsset('library')}
                          className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer ${
                            selectedAssetId === 'library' ? 'bg-[#24282B] text-[#E3E5E6]' : 'text-[#969DA2] hover:text-[#E3E5E6]'
                          }`}
                        >
                          <span className="truncate">Library</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#638D7D]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hostels */}
                  <div
                    onClick={() => onSelectAsset('hostel-a')}
                    className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer ${
                      selectedAssetId === 'hostel-a' ? 'bg-[#24282B] text-[#E3E5E6]' : 'text-[#969DA2] hover:text-[#E3E5E6]'
                    }`}
                  >
                    <span className="truncate">Hostel residences</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C09853]" />
                  </div>

                  {/* Utilities */}
                  <div
                    onClick={() => onSelectAsset('facilities-cen')}
                    className={`flex items-center justify-between py-1 px-2 rounded-md cursor-pointer ${
                      selectedAssetId === 'facilities-cen' ? 'bg-[#24282B] text-[#E3E5E6]' : 'text-[#969DA2] hover:text-[#E3E5E6]'
                    }`}
                  >
                    <span className="truncate">Central plant</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#638D7D]" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer link status */}
      <div className="p-3 border-t border-[#34393D]/40 text-xs text-[#969DA2] shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#638D7D]" />
              <span>Telemetry online</span>
            </span>
            <span className="font-mono text-[11px] text-[#6B7278]">99.7%</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-[#638D7D]" />
          </div>
        )}
      </div>
    </aside>
  );
};
