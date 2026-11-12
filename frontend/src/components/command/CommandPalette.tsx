import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Building,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  Terminal,
  ArrowRight,
  Flame,
  Zap,
  Radio,
  FileText
} from 'lucide-react';
import { Anomaly, WorkOrder, BuildingNode } from '../../types/sentinel';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBuilding: (buildingId: string) => void;
  onOpenAnomaly: (anomalyId: string) => void;
  onOpenWorkOrder: (workOrderId: string) => void;
  onNavigateWorkspace: (workspace: string) => void;
  buildings?: BuildingNode[];
  anomalies?: Anomaly[];
  workOrders?: WorkOrder[];
}

interface CommandItem {
  id: string;
  category: 'Command' | 'Building' | 'Incident' | 'Work order' | 'Workspace';
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  badge?: string;
  badgeVariant?: 'critical' | 'high' | 'normal' | 'accent';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectBuilding,
  onOpenAnomaly,
  onOpenWorkOrder,
  onNavigateWorkspace,
  buildings = [],
  anomalies = [],
  workOrders = []
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allItems: CommandItem[] = [
    {
      id: 'cmd-high-ano',
      category: 'Command',
      title: 'Show highest priority anomaly (Lab 204)',
      subtitle: 'Opens critical anomaly ANO-101 investigation (+289.8% deviation)',
      icon: Flame,
      badge: 'Critical',
      badgeVariant: 'critical',
      action: () => {
        onOpenAnomaly('ANO-101');
        onClose();
      }
    },
    {
      id: 'cmd-open-lab204',
      category: 'Command',
      title: 'Open Lab 204 infrastructure & telemetry',
      subtitle: 'Jump directly to Lab 204 in Academic Block A',
      icon: Zap,
      badge: 'Hotspot',
      badgeVariant: 'accent',
      action: () => {
        onSelectBuilding('lab-complex');
        onNavigateWorkspace('INFRASTRUCTURE');
        onClose();
      }
    },
    {
      id: 'cmd-energy-analytics',
      category: 'Command',
      title: 'Show campus energy consumption & peak demand',
      subtitle: 'Opens Analytics workspace with 24h load profile',
      icon: BarChart3,
      badge: 'Analytics',
      action: () => {
        onNavigateWorkspace('ANALYTICS');
        onClose();
      }
    },
    {
      id: 'cmd-unresolved-wo',
      category: 'Command',
      title: 'Find unresolved work orders',
      subtitle: 'Inspect pending facilities repair dispatches',
      icon: ClipboardList,
      badge: 'Work orders',
      badgeVariant: 'accent',
      action: () => {
        onNavigateWorkspace('WORK_ORDERS');
        onClose();
      }
    },
    {
      id: 'cmd-hvac-incidents',
      category: 'Command',
      title: 'Show HVAC incidents & efficiency alerts',
      subtitle: 'Filter active incident grid to HVAC subsystems',
      icon: AlertTriangle,
      badge: 'Incidents',
      badgeVariant: 'high',
      action: () => {
        onNavigateWorkspace('INCIDENTS');
        onClose();
      }
    },
    {
      id: 'cmd-export-report',
      category: 'Command',
      title: 'Generate energy audit report',
      subtitle: 'Export campus infrastructure consumption summary (CSV / PDF)',
      icon: FileText,
      badge: 'Reports',
      action: () => {
        onNavigateWorkspace('REPORTS');
        onClose();
      }
    },
    {
      id: 'ws-overview',
      category: 'Workspace',
      title: 'Go to overview',
      subtitle: 'Campus digital twin and key performance indicators',
      icon: Terminal,
      action: () => {
        onNavigateWorkspace('OVERVIEW');
        onClose();
      }
    },
    {
      id: 'ws-investigations',
      category: 'Workspace',
      title: 'Go to investigations',
      subtitle: 'Diagnostic workbench for root-cause analysis',
      icon: Search,
      action: () => {
        onNavigateWorkspace('INVESTIGATIONS');
        onClose();
      }
    },
    ...buildings.map((b) => ({
      id: `bld-${b.id}`,
      category: 'Building' as const,
      title: b.name,
      subtitle: `${b.category} • ${b.currentKw.toFixed(1)} kW load`,
      icon: Building,
      badge: b.status === 'normal' ? 'Optimal' : b.status === 'warning' ? 'Warning' : 'Critical',
      badgeVariant: b.status === 'critical' ? ('critical' as const) : b.status === 'warning' ? ('high' as const) : ('normal' as const),
      action: () => {
        onSelectBuilding(b.id);
        onClose();
      }
    })),
    ...anomalies.map((a) => ({
      id: `ano-${a.id}`,
      category: 'Incident' as const,
      title: `${a.id} — ${a.asset}`,
      subtitle: `${a.type} • ${a.actualPower.toFixed(2)} kW (expected: ${a.expectedPower.toFixed(2)} kW)`,
      icon: AlertTriangle,
      badge: a.severity === 'critical' ? 'Critical' : 'High',
      badgeVariant: a.severity === 'critical' ? ('critical' as const) : ('high' as const),
      action: () => {
        onOpenAnomaly(a.id);
        onClose();
      }
    })),
    ...workOrders.map((w) => ({
      id: `wo-${w.id}`,
      category: 'Work order' as const,
      title: `${w.id} — ${w.title}`,
      subtitle: `${w.assignedTo} • ${w.status}`,
      icon: ClipboardList,
      badge: w.status,
      badgeVariant: 'accent' as const,
      action: () => {
        onOpenWorkOrder(w.id);
        onClose();
      }
    }))
  ];

  const filtered = allItems.filter((item) => {
    if (activeCategory !== 'All' && item.category !== activeCategory) {
      return false;
    }
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-start justify-center pt-20 select-none"
      onClick={onClose}
    >
      <div
        className="w-[600px] max-w-[95vw] bg-[#1C1F22] border border-[#34393D] rounded-lg shadow-2xl overflow-hidden flex flex-col text-xs"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="h-12 px-4 bg-[#151719] border-b border-[#34393D]/50 flex items-center gap-3">
          <Search className="w-4 h-4 text-[#969DA2]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search assets, anomalies, work orders, or commands..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-[#E3E5E6] placeholder-[#6B7278] text-sm focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-[#24282B] text-[#969DA2] text-[11px] font-mono">
            Esc
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="px-3 py-2 bg-[#1C1F22] border-b border-[#34393D]/40 flex items-center gap-1.5 overflow-x-auto text-xs">
          {['All', 'Command', 'Incident', 'Work order', 'Building', 'Workspace'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeCategory === cat
                  ? 'bg-[#B1A078] text-[#151719] font-medium'
                  : 'bg-[#24282B] text-[#969DA2] hover:text-[#E3E5E6]'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto text-[#6B7278] text-[11px] pr-1">{filtered.length} results</span>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto py-1 custom-scrollbar divide-y divide-[#34393D]/20">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[#6B7278]">
              No matching assets or commands found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#24282B] text-[#E3E5E6]' : 'hover:bg-[#24282B]/60 text-[#E3E5E6]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-6 h-6 rounded bg-[#151719] flex items-center justify-center shrink-0 text-[#969DA2]">
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs truncate">{item.title}</span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                              item.badgeVariant === 'critical'
                                ? 'bg-[#B85555]/20 text-[#D47A7A]'
                                : item.badgeVariant === 'high'
                                ? 'bg-[#C09853]/20 text-[#D1AA68]'
                                : item.badgeVariant === 'accent'
                                ? 'bg-[#B1A078]/20 text-[#C5B58D]'
                                : 'bg-[#638D7D]/20 text-[#7DA797]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#969DA2] truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#6B7278]">{item.category}</span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#B1A078]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-[#151719] border-t border-[#34393D]/40 flex items-center justify-between text-[11px] text-[#6B7278]">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>Esc to close</span>
          </div>
          <span>Sentinel Command</span>
        </div>
      </div>
    </div>
  );
};
