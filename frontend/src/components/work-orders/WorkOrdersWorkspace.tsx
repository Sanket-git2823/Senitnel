import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  FileCheck,
  Plus,
  AlertCircle
} from 'lucide-react';
import { WorkOrder, WorkOrderStatus, ResolutionRecord } from '../../types/sentinel';
import { Badge } from '../common/Badge';

interface WorkOrdersWorkspaceProps {
  workOrders: WorkOrder[];
  selectedWorkOrder: WorkOrder | null;
  onSelectWorkOrder: (wo: WorkOrder) => void;
  onUpdateStatus: (woId: string, status: WorkOrderStatus) => void;
  onResolveWorkOrder: (woId: string, resolution: ResolutionRecord) => void;
  onCreateNewWorkOrder: () => void;
  isResolved?: boolean;
}

const DEFAULT_STEPS = [
  { name: 'Work Order Created', timestamp: 'Just now', completed: true },
  { name: 'Assigned', completed: false, current: true },
  { name: 'Started', completed: false },
  { name: 'In Progress', completed: false },
  { name: 'Resolved', completed: false },
  { name: 'Verified', completed: false }
];

export const WorkOrdersWorkspace: React.FC<WorkOrdersWorkspaceProps> = ({
  workOrders = [],
  selectedWorkOrder,
  onSelectWorkOrder,
  onUpdateStatus,
  onResolveWorkOrder,
  onCreateNewWorkOrder,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState(
    'FCU-204 reheat valve actuator inspected. Actuator motor was jammed at 78% due to thermal expansion debris in linkage. Linkage freed, lubricated, and calibrated 0-10V analog input signal. Baseline draw verified.'
  );
  const [partsReplaced, setPartsReplaced] = useState('Siemens GDE131.1P Rotary Actuator Linkage Bushing');

  const filteredOrders = (workOrders || []).filter((wo) => {
    if (!wo) return false;
    const woStatus = (wo.status || 'Open').toLowerCase();
    if (filterStatus !== 'All' && woStatus !== filterStatus.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idStr = (wo.id || '').toLowerCase();
      const titleStr = (wo.title || '').toLowerCase();
      const locStr = (wo.location || '').toLowerCase();
      const assignStr = (wo.assignedTo || '').toLowerCase();
      return idStr.includes(q) || titleStr.includes(q) || locStr.includes(q) || assignStr.includes(q);
    }
    return true;
  });

  const activeOrder = selectedWorkOrder || filteredOrders[0] || workOrders[0];

  const handleAdvanceStatus = (current: WorkOrderStatus) => {
    if (!activeOrder) return;
    if (current === 'Open') {
      onUpdateStatus(activeOrder.id, 'Assigned');
    } else if (current === 'Assigned') {
      onUpdateStatus(activeOrder.id, 'In Progress');
    } else if (current === 'Started' || current === 'In Progress') {
      setShowResolutionDialog(true);
    } else if (current === 'Resolved') {
      onUpdateStatus(activeOrder.id, 'Verified');
    }
  };

  const handleConfirmResolution = () => {
    if (!activeOrder) return;
    const record: ResolutionRecord = {
      resolvedBy: activeOrder.assignedOperator || 'Sunil Verma (HVAC Tech)',
      resolvedAt: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' IST',
      rootCause: 'Reheat coil modulating valve actuator stuck in mechanical bind',
      actionsTaken: resolutionNotes,
      partsReplaced,
      powerAfterKw: 0.98,
      verifiedBy: 'Sanket Patel (Operator)',
      verifiedAt: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' IST'
    };
    onResolveWorkOrder(activeOrder.id, record);
    setShowResolutionDialog(false);
  };

  // Safe steps derivation
  const activeSteps = (activeOrder && Array.isArray(activeOrder.steps) && activeOrder.steps.length > 0)
    ? activeOrder.steps
    : DEFAULT_STEPS;

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-[#151719] overflow-hidden select-none text-xs">
      {/* 1. Left Section: Work Orders List */}
      <div className="flex-1 flex flex-col border-r border-[#34393D]/50 overflow-hidden min-w-0">
        {/* Top Control Bar */}
        <div className="h-12 px-4 bg-[#1C1F22] border-b border-[#34393D]/50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-4 h-4 text-[#B1A078]" />
            <h2 className="font-medium text-[#E3E5E6] text-sm">
              Facilities work orders
            </h2>
            <span className="text-xs text-[#969DA2] font-mono">
              ({workOrders.length})
            </span>
          </div>

          <button
            onClick={onCreateNewWorkOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#B1A078] hover:bg-[#C5B58D] text-[#151719] font-medium text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New work order</span>
          </button>
        </div>

        {/* Filter Pills & Search */}
        <div className="p-3 bg-[#1C1F22]/60 border-b border-[#34393D]/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['All', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Verified'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap cursor-pointer ${
                  filterStatus === st
                    ? 'bg-[#B1A078] text-[#151719] font-medium'
                    : 'bg-[#24282B] text-[#969DA2] hover:text-[#E3E5E6]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56 shrink-0">
            <Search className="w-3.5 h-3.5 text-[#6B7278] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#151719] rounded-md pl-8 pr-2.5 py-1.5 text-xs text-[#E3E5E6] placeholder-[#6B7278] focus:outline-none border border-[#34393D]/50"
            />
          </div>
        </div>

        {/* Dense Enterprise Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-[#969DA2] space-y-2">
              <ClipboardList className="w-8 h-8 text-[#6B7278] mx-auto opacity-50" />
              <p>No work orders match the current filter.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181B1D] text-[#969DA2] border-b border-[#34393D]/40 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-4 font-normal">Priority</th>
                  <th className="py-2.5 px-4 font-normal">ID</th>
                  <th className="py-2.5 px-4 font-normal">Title & location</th>
                  <th className="py-2.5 px-4 font-normal">Assigned team</th>
                  <th className="py-2.5 px-4 font-normal">Status</th>
                  <th className="py-2.5 px-4 text-right font-normal">Due date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34393D]/30">
                {filteredOrders.map((wo) => {
                  const isSelected = activeOrder?.id === wo.id;
                  const priorityStr = wo.priority || 'High';
                  const statusStr = wo.status || 'Open';
                  const dueDateDisplay = wo.dueDate ? wo.dueDate.slice(0, 10) : '2026-11-12';
                  const locationDisplay = wo.location || wo.assetName || 'Campus';
                  const assignedDisplay = wo.assignedTo || 'Facilities HVAC Team';

                  return (
                    <tr
                      key={wo.id}
                      onClick={() => onSelectWorkOrder(wo)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#24282B] text-[#E3E5E6]'
                          : 'hover:bg-[#1C1F22] text-[#969DA2]'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <Badge variant={priorityStr.toLowerCase() as any}>
                          {priorityStr}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-[#E3E5E6]">{wo.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#E3E5E6] truncate max-w-[220px]">{wo.title}</div>
                        <div className="text-[11px] text-[#969DA2] truncate">{locationDisplay}</div>
                      </td>
                      <td className="py-3 px-4 text-[#969DA2] truncate">{assignedDisplay}</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusStr as any}>{statusStr}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[#969DA2]">
                        {dueDateDisplay}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 2. Right Section: Detailed Work Order Inspector & Stepper */}
      {activeOrder ? (
        <div className="w-full md:w-[460px] bg-[#1C1F22] flex flex-col h-full overflow-y-auto custom-scrollbar shrink-0 border-l border-[#34393D]/30">
          {/* Header */}
          <div className="p-4 border-b border-[#34393D]/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-semibold font-mono text-[#E3E5E6]">
                {activeOrder.id}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={(activeOrder.priority || 'High').toLowerCase() as any}>
                  {activeOrder.priority || 'High'}
                </Badge>
                <Badge variant={(activeOrder.status || 'Open') as any}>{activeOrder.status || 'Open'}</Badge>
              </div>
            </div>
            <h3 className="text-sm font-medium text-[#E3E5E6]">{activeOrder.title}</h3>
            <div className="text-xs text-[#969DA2] flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#6B7278]" />
              {activeOrder.location || activeOrder.assetName || 'Campus'}
            </div>
          </div>

          {/* Lifecycle Stepper */}
          <div className="p-4 border-b border-[#34393D]/40 bg-[#181B1D]">
            <span className="text-xs text-[#969DA2] block mb-3 font-medium">
              Workflow lifecycle
            </span>
            <div className="space-y-2">
              {activeSteps.map((step, idx) => {
                return (
                  <div key={step.name} className="flex items-start gap-3 text-xs">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          step.completed
                            ? 'bg-[#638D7D] text-[#151719] font-bold'
                            : step.current
                            ? 'bg-[#B1A078] text-[#151719] font-bold'
                            : 'bg-[#24282B] text-[#6B7278]'
                        }`}
                      >
                        {step.completed ? '✓' : idx + 1}
                      </div>
                      {idx < activeSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-3 my-0.5 ${
                            step.completed ? 'bg-[#638D7D]/40' : 'bg-[#24282B]'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span
                        className={
                          step.completed
                            ? 'text-[#E3E5E6]'
                            : step.current
                            ? 'text-[#B1A078] font-medium'
                            : 'text-[#6B7278]'
                        }
                      >
                        {step.name}
                      </span>
                      {step.timestamp && (
                        <span className="text-[11px] font-mono text-[#969DA2]">{step.timestamp}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lifecycle Action Transition Button */}
            <div className="mt-4 pt-3 border-t border-[#34393D]/40">
              {activeOrder.status === 'Open' && (
                <button
                  onClick={() => handleAdvanceStatus('Open')}
                  className="w-full py-2 rounded-md bg-[#B1A078] hover:bg-[#C5B58D] text-[#151719] font-medium text-xs transition-colors cursor-pointer"
                >
                  Assign to field technician
                </button>
              )}
              {activeOrder.status === 'Assigned' && (
                <button
                  onClick={() => handleAdvanceStatus('Assigned')}
                  className="w-full py-2 rounded-md bg-[#B1A078] hover:bg-[#C5B58D] text-[#151719] font-medium text-xs transition-colors cursor-pointer"
                >
                  Begin work (In Progress)
                </button>
              )}
              {(activeOrder.status === 'Started' || activeOrder.status === 'In Progress') && (
                <button
                  onClick={() => handleAdvanceStatus('In Progress')}
                  className="w-full py-2 rounded-md bg-[#638D7D] hover:bg-[#7DA797] text-[#151719] font-medium text-xs transition-colors cursor-pointer"
                >
                  Resolve & submit completion audit
                </button>
              )}
              {activeOrder.status === 'Resolved' && (
                <button
                  onClick={() => handleAdvanceStatus('Resolved')}
                  className="w-full py-2 rounded-md bg-[#638D7D] hover:bg-[#7DA797] text-[#151719] font-medium text-xs transition-colors cursor-pointer"
                >
                  Confirm automated telemetry verification
                </button>
              )}
              {activeOrder.status === 'Verified' && (
                <div className="flex items-center justify-center gap-2 py-2 rounded-md bg-[#24282B] text-[#638D7D] font-medium text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Work order verified & closed</span>
                </div>
              )}
            </div>
          </div>

          {/* Details & Scope */}
          <div className="p-4 space-y-4 flex-1">
            <div>
              <span className="text-xs text-[#969DA2] block mb-1">
                Description of issue
              </span>
              <p className="text-xs text-[#E3E5E6] bg-[#151719] p-3 rounded-md border border-[#34393D]/30 leading-relaxed">
                {activeOrder.description || 'Routine facilities maintenance request.'}
              </p>
            </div>

            <div>
              <span className="text-xs text-[#969DA2] block mb-1">
                Recommended action
              </span>
              <p className="text-xs text-[#E3E5E6] bg-[#151719] p-3 rounded-md border border-[#34393D]/30 leading-relaxed">
                {activeOrder.recommendedAction || 'Inspect mechanical components and verify operational baseline.'}
              </p>
            </div>

            {/* Impact Estimation Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#151719] p-2.5 rounded-md border border-[#34393D]/30">
                <span className="text-[11px] text-[#969DA2] block">Waste / day</span>
                <span className="text-sm font-mono font-medium text-[#E3E5E6]">
                  {activeOrder.impactKwhPerDay ? `${activeOrder.impactKwhPerDay.toFixed(1)} kWh` : '68.2 kWh'}
                </span>
              </div>
              <div className="bg-[#151719] p-2.5 rounded-md border border-[#34393D]/30">
                <span className="text-[11px] text-[#969DA2] block">Loss / day</span>
                <span className="text-sm font-mono font-medium text-[#E3E5E6]">
                  ₹{activeOrder.impactCostPerDay ? activeOrder.impactCostPerDay.toFixed(2) : '52.40'}
                </span>
              </div>
              <div className="bg-[#151719] p-2.5 rounded-md border border-[#34393D]/30">
                <span className="text-[11px] text-[#969DA2] block">CO2 impact</span>
                <span className="text-sm font-mono font-medium text-[#E3E5E6]">
                  {activeOrder.impactCo2PerDay ? `${activeOrder.impactCo2PerDay.toFixed(1)} kg` : '41.6 kg'}
                </span>
              </div>
            </div>

            {/* Resolution Verification Dossier (if resolved) */}
            {activeOrder.resolution && (
              <div className="p-3.5 rounded-md bg-[#181B1D] border border-[#34393D]/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-[#638D7D]">
                  <span className="flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" />
                    Technician resolution dossier
                  </span>
                  <span className="text-[11px] font-mono text-[#969DA2]">{activeOrder.resolution.resolvedAt}</span>
                </div>
                <div className="text-xs text-[#969DA2]">
                  <span className="text-[#E3E5E6] font-medium">Technician:</span> {activeOrder.resolution.resolvedBy}
                </div>
                <div className="text-xs text-[#969DA2]">
                  <span className="text-[#E3E5E6] font-medium">Root cause:</span> {activeOrder.resolution.rootCause}
                </div>
                <div className="text-xs text-[#969DA2]">
                  <span className="text-[#E3E5E6] font-medium">Work done:</span> {activeOrder.resolution.actionsTaken}
                </div>
                {activeOrder.resolution.partsReplaced && (
                  <div className="text-xs text-[#969DA2]">
                    <span className="text-[#E3E5E6] font-medium">Parts:</span> {activeOrder.resolution.partsReplaced}
                  </div>
                )}
                <div className="text-xs text-[#638D7D] font-mono pt-1">
                  Power post-repair: {activeOrder.resolution.powerAfterKw} kW (Normal baseline restored)
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full md:w-[460px] bg-[#1C1F22] flex flex-col items-center justify-center p-8 text-center text-[#969DA2] shrink-0 border-l border-[#34393D]/30">
          <AlertCircle className="w-8 h-8 text-[#6B7278] mb-2" />
          <h3 className="text-sm font-medium text-[#E3E5E6] mb-1">No work order selected</h3>
          <p className="text-xs text-[#6B7278] max-w-xs mb-4">
            Select a work order from the table or create a new dispatch to review its lifecycle and actions.
          </p>
          <button
            onClick={onCreateNewWorkOrder}
            className="px-3 py-1.5 rounded-md bg-[#B1A078] hover:bg-[#C5B58D] text-[#151719] font-medium text-xs transition-colors cursor-pointer"
          >
            Create work order
          </button>
        </div>
      )}

      {/* Resolution Modal */}
      {showResolutionDialog && (
        <div className="fixed inset-0 z-50 bg-[#151719]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1F22] border border-[#34393D] rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#34393D]/40">
              <h3 className="text-sm font-medium text-[#E3E5E6]">
                Submit technician repair resolution
              </h3>
              <span className="font-mono text-xs text-[#B1A078]">{activeOrder?.id}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#969DA2] block mb-1">
                  Repair notes & actions taken
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#151719] rounded-md p-2.5 text-[#E3E5E6] focus:outline-none border border-[#34393D]/50 custom-scrollbar"
                />
              </div>

              <div>
                <label className="text-[#969DA2] block mb-1">
                  Parts replaced / components serviced
                </label>
                <input
                  type="text"
                  value={partsReplaced}
                  onChange={(e) => setPartsReplaced(e.target.value)}
                  className="w-full bg-[#151719] rounded-md px-2.5 py-1.5 text-[#E3E5E6] focus:outline-none border border-[#34393D]/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#34393D]/40">
              <button
                onClick={() => setShowResolutionDialog(false)}
                className="px-3 py-1.5 rounded-md bg-[#24282B] hover:bg-[#2A2F33] text-[#969DA2] text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolution}
                className="px-3.5 py-1.5 rounded-md bg-[#638D7D] hover:bg-[#7DA797] text-[#151719] font-medium text-xs transition-colors cursor-pointer"
              >
                Confirm resolution & verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
