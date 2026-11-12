import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Anomaly } from '../../types/sentinel';
import { Badge } from '../common/Badge';

interface IncidentsWorkspaceProps {
  anomalies: Anomaly[];
  onOpenInvestigation: (anomalyId: string) => void;
  onCreateWorkOrder: (anomaly: Anomaly) => void;
}

export const IncidentsWorkspace: React.FC<IncidentsWorkspaceProps> = ({
  anomalies,
  onOpenInvestigation,
  onCreateWorkOrder
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = anomalies.filter((a) => {
    if (filterSeverity !== 'All' && a.severity.toLowerCase() !== filterSeverity.toLowerCase()) {
      return false;
    }
    if (filterStatus !== 'All' && a.status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.id.toLowerCase().includes(q) ||
        a.asset.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = anomalies.filter((a) => a.severity === 'critical').length;
  const highCount = anomalies.filter((a) => a.severity === 'high').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#151719] overflow-hidden select-none text-xs">
      {/* 1. Header & Summary Statistics */}
      <div className="h-12 px-4 bg-[#1C1F22] border-b border-[#34393D]/50 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#B85555]" />
          <h2 className="font-medium text-[#E3E5E6] text-sm">
            Incident management & triage
          </h2>
          <div className="flex items-center gap-2 text-xs text-[#969DA2] ml-2">
            <span>{criticalCount} critical</span>
            <span>•</span>
            <span>{highCount} high</span>
          </div>
        </div>

        <span className="text-xs text-[#969DA2]">
          Real-time anomaly detection engine
        </span>
      </div>

      {/* 2. Filters & Search Strip */}
      <div className="p-3 bg-[#1C1F22]/60 border-b border-[#34393D]/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#969DA2]">Severity:</span>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  filterSeverity === sev
                    ? 'bg-[#B1A078] text-[#151719] font-medium'
                    : 'bg-[#24282B] text-[#969DA2] hover:text-[#E3E5E6]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <span className="text-[#34393D]">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[#969DA2]">Status:</span>
            {['All', 'New', 'Investigating', 'Monitoring', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  filterStatus === st
                    ? 'bg-[#B1A078] text-[#151719] font-medium'
                    : 'bg-[#24282B] text-[#969DA2] hover:text-[#E3E5E6]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-60 shrink-0">
          <Search className="w-3.5 h-3.5 text-[#6B7278] absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search incident, room, or fault..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151719] rounded-md pl-8 pr-2.5 py-1.5 text-xs text-[#E3E5E6] placeholder-[#6B7278] focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Incidents Grid Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#181B1D] text-[#969DA2] border-b border-[#34393D]/40 sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-4 font-normal">Severity</th>
              <th className="py-2.5 px-4 font-normal">ID</th>
              <th className="py-2.5 px-4 font-normal">Asset & location</th>
              <th className="py-2.5 px-4 font-normal">Anomaly type</th>
              <th className="py-2.5 px-4 font-normal">Observed / expected</th>
              <th className="py-2.5 px-4 font-normal">Confidence</th>
              <th className="py-2.5 px-4 font-normal">Duration</th>
              <th className="py-2.5 px-4 font-normal">Status</th>
              <th className="py-2.5 px-4 text-right font-normal">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#34393D]/30">
            {filtered.map((item) => {
              const devPct = Math.round(
                ((item.actualPower - item.expectedPower) / item.expectedPower) * 100
              );
              return (
                <tr key={item.id} className="hover:bg-[#1C1F22] transition-colors">
                  <td className="py-3 px-4">
                    <Badge variant={item.severity}>{item.severity}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-[#E3E5E6]">{item.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-[#E3E5E6]">{item.asset}</div>
                    <div className="text-[11px] text-[#969DA2] truncate max-w-[240px]">
                      {item.description}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#E3E5E6]">{item.type}</td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-[#D47A7A]">{item.actualPower.toFixed(2)} kW</span>
                    <span className="text-[#6B7278]"> / </span>
                    <span className="text-[#969DA2]">{item.expectedPower.toFixed(2)} kW</span>
                    <span className="text-[11px] text-[#D1AA68] ml-1.5">
                      ({devPct > 0 ? `+${devPct}%` : `${devPct}%`})
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#E3E5E6]">
                    {item.confidence}%
                  </td>
                  <td className="py-3 px-4 text-[#969DA2] font-mono">{item.duration}</td>
                  <td className="py-3 px-4">
                    <Badge variant={item.status}>{item.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onOpenInvestigation(item.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#24282B] hover:bg-[#2A2F33] text-[#E3E5E6] transition-colors"
                      >
                        <span>Investigate</span>
                        <ExternalLink className="w-3 h-3 text-[#969DA2]" />
                      </button>
                      <button
                        onClick={() => onCreateWorkOrder(item)}
                        className="px-2.5 py-1 rounded bg-[#B1A078] hover:bg-[#C5B58D] text-[#151719] font-medium transition-colors"
                      >
                        Create WO
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
