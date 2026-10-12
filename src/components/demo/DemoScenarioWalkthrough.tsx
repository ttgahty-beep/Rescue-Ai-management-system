import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Play,
  RotateCcw,
  Truck,
  Radio,
  User,
  ShieldCheck,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const DemoScenarioWalkthrough: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    loadPRDDemoScenario,
    setCurrentRole,
    verifyCase,
    assignUnitToCase,
    startTelemetrySimulation,
    updateUnitStatus,
    closeCase,
    cases,
  } = useEmergency();

  const [activeStep, setActiveStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  if (!isOpen) return null;

  const handleStep1 = () => {
    loadPRDDemoScenario();
    setCurrentRole('citizen');
    setActiveStep(2);
  };

  const handleStep2 = () => {
    setCurrentRole('dispatcher');
    verifyCase('RL-PK-2026-9042', 'Senior Dispatcher Tariq (Rescue 1122 Command)');
    setActiveStep(3);
  };

  const handleStep3 = () => {
    assignUnitToCase('RL-PK-2026-9042', 'unit-a17', 'Command Dispatcher (Punjab Emergency)');
    setCurrentRole('responder');
    updateUnitStatus('unit-a17', 'ACCEPTED');
    setActiveStep(4);
  };

  const handleStep4 = () => {
    updateUnitStatus('unit-a17', 'EN_ROUTE');
    startTelemetrySimulation();
    setCurrentRole('citizen');
    setActiveStep(5);
  };

  const handleStep5 = () => {
    updateUnitStatus('unit-a17', 'AT_SCENE');
    closeCase(
      'RL-PK-2026-9042',
      'SUCCESSFUL_EVACUATION',
      'Rescue 1122 Boat Unit A-17 safely evacuated 3 victims (2 children, 1 mobility-impaired elder) to Shahdara Relief Camp.'
    );
    setCurrentRole('admin');
    setActiveStep(6);
  };

  const handleAutoPlay = async () => {
    setIsAutoPlaying(true);
    handleStep1();
    await new Promise((r) => setTimeout(r, 2000));
    handleStep2();
    await new Promise((r) => setTimeout(r, 2000));
    handleStep3();
    await new Promise((r) => setTimeout(r, 2000));
    handleStep4();
    await new Promise((r) => setTimeout(r, 3500));
    handleStep5();
    setIsAutoPlaying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-zinc-200 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-red-500 fill-red-500" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-red-600 font-black tracking-wider">
                PRD Section 30 Compliance Test
              </span>
              <h3 className="font-black text-base text-zinc-950">
                Shahdara Flood Evacuation Scenario
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-black p-1.5 rounded-xl hover:bg-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative Description from PRD */}
        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 text-xs text-zinc-700 leading-relaxed">
          <div className="font-black text-zinc-950 mb-1">Scenario Briefing (PRD Section 30):</div>
          Three trapped victims on a rooftop in Shahdara, Lahore (including 2 children & 1 mobility-impaired adult)
          due to rising Ravi River flood water. AI asks minimum questions, extracts location & generates critical recommendation.
          Dispatcher verifies & assigns Boat Unit A-17. Responder streams GPS telemetry, updates status to En Route,
          and safely evacuates victims with immutable audit recording.
        </div>

        {/* 5-Step Interactive Sequence */}
        <div className="space-y-2.5">
          {/* Step 1 */}
          <div
            className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
              activeStep === 1
                ? 'bg-black text-white border-black shadow-sm'
                : activeStep > 1
                ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                : 'bg-zinc-50 text-zinc-400 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-zinc-200 text-black flex items-center justify-center text-xs font-mono font-bold shrink-0">
                1
              </span>
              <div>
                <div className="font-bold text-xs">Stage 1: Citizen SOS Distress via AI (Roman Urdu)</div>
                <div className={`text-[11px] ${activeStep === 1 ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  Loads Shahdara rooftop emergency report and switches to Citizen Portal.
                </div>
              </div>
            </div>

            {activeStep === 1 ? (
              <button
                onClick={handleStep1}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-xs"
              >
                Trigger SOS
              </button>
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
          </div>

          {/* Step 2 */}
          <div
            className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
              activeStep === 2
                ? 'bg-black text-white border-black shadow-sm'
                : activeStep > 2
                ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                : 'bg-zinc-50 text-zinc-400 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-zinc-200 text-black flex items-center justify-center text-xs font-mono font-bold shrink-0">
                2
              </span>
              <div>
                <div className="font-bold text-xs">Stage 2: Dispatcher HITL Verification (FR-03 & FR-04)</div>
                <div className={`text-[11px] ${activeStep === 2 ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  Review AI extracted priority and approve case in 1122 Command Room.
                </div>
              </div>
            </div>

            {activeStep === 2 ? (
              <button
                onClick={handleStep2}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-xs"
              >
                Verify Incident
              </button>
            ) : activeStep > 2 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : null}
          </div>

          {/* Step 3 */}
          <div
            className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
              activeStep === 3
                ? 'bg-black text-white border-black shadow-sm'
                : activeStep > 3
                ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                : 'bg-zinc-50 text-zinc-400 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-zinc-200 text-black flex items-center justify-center text-xs font-mono font-bold shrink-0">
                3
              </span>
              <div>
                <div className="font-bold text-xs">Stage 3: Mobilize Rescue Boat Unit A-17 (FR-05)</div>
                <div className={`text-[11px] ${activeStep === 3 ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  Assign specialized boat and accept mission in Responder terminal.
                </div>
              </div>
            </div>

            {activeStep === 3 ? (
              <button
                onClick={handleStep3}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-xs"
              >
                Mobilize Boat
              </button>
            ) : activeStep > 3 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : null}
          </div>

          {/* Step 4 */}
          <div
            className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
              activeStep === 4
                ? 'bg-black text-white border-black shadow-sm'
                : activeStep > 4
                ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                : 'bg-zinc-50 text-zinc-400 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-zinc-200 text-black flex items-center justify-center text-xs font-mono font-bold shrink-0">
                4
              </span>
              <div>
                <div className="font-bold text-xs">Stage 4: En Route GPS Telemetry Streaming (FR-06 & FR-07)</div>
                <div className={`text-[11px] ${activeStep === 4 ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  Unit transmits speed and coordinates; citizen tracks on live map.
                </div>
              </div>
            </div>

            {activeStep === 4 ? (
              <button
                onClick={handleStep4}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-xs"
              >
                Stream GPS & Track
              </button>
            ) : activeStep > 4 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : null}
          </div>

          {/* Step 5 */}
          <div
            className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
              activeStep === 5
                ? 'bg-black text-white border-black shadow-sm'
                : activeStep > 5
                ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                : 'bg-zinc-50 text-zinc-400 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-zinc-200 text-black flex items-center justify-center text-xs font-mono font-bold shrink-0">
                5
              </span>
              <div>
                <div className="font-bold text-xs">Stage 5: Arrive at Rooftop & Evacuate to Relief Camp</div>
                <div className={`text-[11px] ${activeStep === 5 ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  Evacuation complete; marks case resolved and logs to Audit Trail.
                </div>
              </div>
            </div>

            {activeStep === 5 ? (
              <button
                onClick={handleStep5}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-xs"
              >
                Complete Mission
              </button>
            ) : activeStep > 5 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : null}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 flex-wrap gap-2">
          <button
            onClick={() => {
              setActiveStep(1);
            }}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoPlay}
              disabled={isAutoPlaying}
              className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs"
            >
              <Play className="w-3.5 h-3.5 text-red-500" />
              <span>{isAutoPlaying ? 'Running Auto-Play...' : '1-Click Auto Run'}</span>
            </button>

            <button
              onClick={onClose}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs px-4 py-2.5 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
