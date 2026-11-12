import React from 'react';
import { Play, Check, ChevronRight, RotateCcw } from 'lucide-react';

export interface ScenarioStep {
  step: number;
  title: string;
  description: string;
  actionLabel: string;
  targetWorkspace: string;
}

export const SCENARIO_STEPS: ScenarioStep[] = [
  { step: 1, title: 'Observe campus overview', description: 'Monitor high-level campus telemetry and notice critical alert in Academic Block A', actionLabel: 'Go to overview', targetWorkspace: 'OVERVIEW' },
  { step: 2, title: 'Select Academic Block A', description: 'Drill down to Academic Block A / Lab Complex on the digital twin', actionLabel: 'Select Block A', targetWorkspace: 'OVERVIEW' },
  { step: 3, title: 'Inspect Lab 204', description: 'Open Lab 204 to check spatial zoning and connected sub-panel telemetry', actionLabel: 'Open Lab 204', targetWorkspace: 'INFRASTRUCTURE' },
  { step: 4, title: 'View real-time telemetry', description: 'Observe 3.82 kW power draw vs 0.98 kW baseline and 27.4°C temperature', actionLabel: 'View telemetry', targetWorkspace: 'LIVE_MONITORING' },
  { step: 5, title: 'Open detected anomaly', description: 'Review ANO-101 flagged with 92% confidence by the anomaly engine', actionLabel: 'Open incident', targetWorkspace: 'INCIDENTS' },
  { step: 6, title: 'Investigate contributing signals', description: 'Analyze FCU-204 reheat valve stuck at 78% and confirmed 0 occupancy', actionLabel: 'Investigate', targetWorkspace: 'INVESTIGATIONS' },
  { step: 7, title: 'Review estimated impact', description: 'Quantify daily financial waste ($52.40/day) and excess carbon emissions', actionLabel: 'Review impact', targetWorkspace: 'INVESTIGATIONS' },
  { step: 8, title: 'Generate work order', description: 'Convert diagnosed anomaly into formal maintenance dispatch WO-7821', actionLabel: 'Create work order', targetWorkspace: 'WORK_ORDERS' },
  { step: 9, title: 'Assign to HVAC team', description: 'Route work order to Facilities HVAC Response Team lead technician', actionLabel: 'Assign team', targetWorkspace: 'WORK_ORDERS' },
  { step: 10, title: 'Start field work', description: 'Advance work order status from Assigned to In Progress', actionLabel: 'Start work', targetWorkspace: 'WORK_ORDERS' },
  { step: 11, title: 'Resolve incident', description: 'Submit technician resolution: valve actuator reseated and calibrated', actionLabel: 'Submit resolution', targetWorkspace: 'WORK_ORDERS' },
  { step: 12, title: 'Verify telemetry recovery', description: 'Confirm power has returned to 0.98 kW baseline and building status is optimal', actionLabel: 'Verify recovery', targetWorkspace: 'OVERVIEW' }
];

interface ScenarioControllerProps {
  currentStep: number;
  onSelectStep: (stepNumber: number) => void;
  onExecuteCurrentStep: () => void;
  onResetScenario: () => void;
  isResolved: boolean;
  onClose: () => void;
}

export const ScenarioController: React.FC<ScenarioControllerProps> = ({
  currentStep,
  onSelectStep,
  onExecuteCurrentStep,
  onResetScenario,
  isResolved,
  onClose
}) => {
  const current = SCENARIO_STEPS[currentStep - 1] || SCENARIO_STEPS[0];

  return (
    <div className="bg-[#1C1F22] border-b border-[#34393D]/50 px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs select-none shrink-0 z-20">
      {/* Step info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-5 h-5 rounded bg-[#24282B] flex items-center justify-center text-[#B1A078] shrink-0">
          <Play className="w-3 h-3 fill-current" />
        </div>
        <div className="truncate">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#E3E5E6]">
              Workflow demo: Lab 204
            </span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#24282B] text-[#969DA2]">
              Step {currentStep} of 12
            </span>
          </div>
          <div className="text-xs text-[#969DA2] truncate mt-0.5">
            <span className="text-[#E3E5E6] font-medium">{current.title}</span> — {current.description}
          </div>
        </div>
      </div>

      {/* Stepper Dots */}
      <div className="flex items-center gap-1 shrink-0">
        {SCENARIO_STEPS.map((s) => {
          const isDone = s.step < currentStep || isResolved;
          const isCurrent = s.step === currentStep && !isResolved;
          return (
            <button
              key={s.step}
              onClick={() => onSelectStep(s.step)}
              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono transition-colors cursor-pointer ${
                isCurrent
                  ? 'bg-[#B1A078] text-[#151719] font-semibold'
                  : isDone
                  ? 'bg-[#24282B] text-[#638D7D]'
                  : 'bg-[#151719] text-[#6B7278] hover:text-[#969DA2]'
              }`}
              title={`Step ${s.step}: ${s.title}`}
            >
              {isDone ? <Check className="w-3 h-3" /> : s.step}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onExecuteCurrentStep}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#B1A078] hover:bg-[#C5B58D] text-[#151719] font-medium transition-colors cursor-pointer"
        >
          <span>{current.actionLabel}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onResetScenario}
          className="p-1.5 rounded-md bg-[#24282B] hover:bg-[#2A2F33] text-[#969DA2] hover:text-[#E3E5E6] transition-colors"
          title="Reset scenario"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onClose}
          className="text-xs text-[#6B7278] hover:text-[#969DA2] px-2 py-1"
        >
          Close
        </button>
      </div>
    </div>
  );
};
