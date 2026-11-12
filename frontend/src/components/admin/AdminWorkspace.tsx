import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Play,
  Square,
  Pause,
  RotateCcw,
  Zap,
  Radio,
  CheckCircle2,
  AlertCircle,
  Database,
  Terminal,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { apiClient } from '../../services/api-client';

export const AdminWorkspace: React.FC = () => {
  const [simRunning, setSimRunning] = useState<boolean>(true);
  const [activeScenario, setActiveScenario] = useState<string>('normal_operation');
  const [wsState, setWsState] = useState<string>(apiClient.getWsState());
  const [actionMessage, setActionMessage] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState<boolean>(false);

  useEffect(() => {
    const unsub = apiClient.onWsStateChange((s) => setWsState(s));
    // Query initial simulator status
    apiClient.get<any>('/simulator/status').then((res) => {
      if (res.data) {
        setSimRunning(res.data.is_running);
        if (res.data.current_scenario) {
          setActiveScenario(res.data.current_scenario);
        }
      }
    });

    const unsubSim = apiClient.subscribeToStream<any>('simulator.status', (data) => {
      if (data) {
        setSimRunning(data.is_running);
        if (data.current_scenario) {
          setActiveScenario(data.current_scenario);
        }
      }
    });

    return () => {
      unsub();
      unsubSim();
    };
  }, []);

  const handleStartSim = async () => {
    setLoadingAction(true);
    await apiClient.post('/simulator/start', {});
    setSimRunning(true);
    setActionMessage('Simulator generator loop started (5.0s tick interval).');
    setLoadingAction(false);
  };

  const handleStopSim = async () => {
    setLoadingAction(true);
    await apiClient.post('/simulator/stop', {});
    setSimRunning(false);
    setActionMessage('Simulator generator loop stopped.');
    setLoadingAction(false);
  };

  const handleSelectScenario = async (scId: string) => {
    setLoadingAction(true);
    await apiClient.post(`/simulator/scenarios/${scId}`, {});
    setActiveScenario(scId);
    setActionMessage(`Active simulation scenario switched to: ${scId}`);
    setLoadingAction(false);
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset entire demonstration database and re-seed clean operational baseline?')) {
      return;
    }
    setLoadingAction(true);
    await apiClient.post('/simulator/reset', {});
    setActiveScenario('normal_operation');
    setActionMessage('Database and simulation successfully re-seeded to initial normal baseline.');
    setLoadingAction(false);
  };

  const scenarios = [
    { id: 'normal_operation', name: 'Normal Campus Operation', desc: 'All rooms follow scheduled timetables and normal idle baselines.' },
    { id: 'lab_204_ac_waste', name: 'Lab 204 — AC Left Running', desc: 'Unoccupied lab with dual AC drawing 3.82 kW vs 0.91 kW baseline.' },
    { id: 'lights_left_on', name: 'Classroom 301 — Lights & Projector Left On', desc: 'Empty classroom with podium laser projector & lighting active.' },
    { id: 'unexpected_equipment_spike', name: 'Lab 205 — Equipment Spike', desc: 'Unattended 3.90 kW power draw from lab test bench.' },
    { id: 'consumption_drift', name: 'Library 01 — AHU Compressor Drift', desc: 'Gradual compressor degradation drawing 9.95 kW (+35% drift).' },
    { id: 'evening_shutdown', name: 'Evening Campus Shutdown', desc: 'All academic buildings transitioned to night standby loads.' }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#151719] overflow-hidden select-none text-xs">
      {/* 1. Header */}
      <div className="h-12 px-5 bg-[#1C1F22] border-b border-[#34393D]/50 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#24282B] flex items-center justify-center text-[#B1A078]">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-[#E3E5E6]">
              System Administration & Simulation Engine
            </h2>
            <p className="text-[11px] text-[#969DA2]">
              Simulator telemetry control, scenario injection, and runtime diagnostics
            </p>
          </div>
        </div>

        {actionMessage && (
          <div className="text-[11px] font-mono text-[#638D7D] px-3 py-1 bg-[#638D7D]/10 rounded border border-[#638D7D]/25">
            {actionMessage}
          </div>
        )}
      </div>

      {/* 2. Main Administration Workspace */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 p-5 overflow-y-auto custom-scrollbar min-h-0">
        {/* Left Column: Virtual ESP32 Simulator Controls */}
        <div className="space-y-4">
          <div className="bg-[#1C1F22] rounded-md p-4 border border-[#34393D]/40 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#34393D]/30">
              <span className="font-medium text-[#E3E5E6] flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#B1A078]" />
                Virtual Sensor Ingestion Engine
              </span>
              <span className={`font-mono text-xs ${simRunning ? 'text-[#638D7D]' : 'text-[#969DA2]'}`}>
                {simRunning ? 'Running' : 'Stopped'}
              </span>
            </div>

            <p className="text-xs text-[#969DA2] leading-relaxed">
              The Sentinel Virtual ESP32 generator continuously simulates 7 campus spaces every 5 seconds, transmitting readings through the hybrid anomaly detection pipeline.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleStartSim}
                disabled={loadingAction || simRunning}
                className="flex items-center justify-center gap-2 py-2 rounded bg-[#638D7D] hover:bg-[#7DA797] disabled:opacity-40 text-[#151719] font-medium text-xs transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Loop</span>
              </button>

              <button
                onClick={handleStopSim}
                disabled={loadingAction || !simRunning}
                className="flex items-center justify-center gap-2 py-2 rounded bg-[#24282B] hover:bg-[#2A2F33] disabled:opacity-40 text-[#D47A7A] font-medium text-xs transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop Loop</span>
              </button>
            </div>
          </div>

          {/* Database Reset & Baseline */}
          <div className="bg-[#1C1F22] rounded-md p-4 border border-[#34393D]/40 space-y-3">
            <span className="font-medium text-[#E3E5E6] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#B1A078]" />
              Database Management
            </span>
            <p className="text-xs text-[#969DA2] leading-relaxed">
              Re-seed all 8 campus buildings, 7 monitored rooms, and 1,176 hourly historical records to clear active test anomalies.
            </p>
            <button
              onClick={handleResetDemo}
              disabled={loadingAction}
              className="w-full flex items-center justify-center gap-2 py-2 rounded bg-[#24282B] hover:bg-[#2A2F33] text-[#E3E5E6] border border-[#34393D] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#B1A078]" />
              <span>Reset to Clean Baseline</span>
            </button>
          </div>
        </div>

        {/* Center Column: Scenarios & Injection Switcher */}
        <div className="space-y-4 md:col-span-2">
          <div className="bg-[#1C1F22] rounded-md p-4 border border-[#34393D]/40 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#34393D]/30">
              <span className="font-medium text-[#E3E5E6] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#B1A078]" />
                Demonstration Scenarios (One-Click Activation)
              </span>
              <span className="text-[11px] font-mono text-[#B1A078]">
                Active: {activeScenario}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {scenarios.map((sc) => {
                const isActive = activeScenario === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc.id)}
                    className={`p-3 rounded border transition-colors cursor-pointer space-y-1 ${
                      isActive
                        ? 'bg-[#24282B] border-[#B1A078]'
                        : 'bg-[#151719] border-[#34393D]/30 hover:bg-[#1C1F22]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#E3E5E6]">{sc.name}</span>
                      {isActive && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#B1A078] text-[#151719] font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#969DA2] leading-relaxed">
                      {sc.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Engine Connectivity Diagnostics */}
          <div className="bg-[#1C1F22] rounded-md p-4 border border-[#34393D]/40 space-y-3">
            <span className="font-medium text-[#E3E5E6] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#638D7D]" />
              WebSocket & API Bridge Status
            </span>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-[#151719] p-3 rounded border border-[#34393D]/25">
                <span className="text-[#969DA2] block text-[11px]">Stream State</span>
                <span className="font-mono text-[#638D7D] font-medium text-sm capitalize">
                  {wsState}
                </span>
              </div>
              <div className="bg-[#151719] p-3 rounded border border-[#34393D]/25">
                <span className="text-[#969DA2] block text-[11px]">WebSocket Target</span>
                <span className="font-mono text-[#E3E5E6] text-xs truncate block">
                  {apiClient.getWsUrl()}
                </span>
              </div>
              <div className="bg-[#151719] p-3 rounded border border-[#34393D]/25">
                <span className="text-[#969DA2] block text-[11px]">REST API Prefix</span>
                <span className="font-mono text-[#E3E5E6] text-xs truncate block">
                  {apiClient.getBaseUrl()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
