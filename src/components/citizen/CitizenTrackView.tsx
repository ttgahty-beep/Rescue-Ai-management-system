import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { EmergencyMap } from '../map/EmergencyMap';
import {
  ShieldAlert,
  PhoneCall,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
  LifeBuoy,
  XCircle,
  Play,
  Pause,
  RefreshCw,
  Share2,
  Activity,
  Truck,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { CaseStatus } from '../../types/emergency';

export const CitizenTrackView: React.FC<{ onNewReportClick: () => void }> = ({
  onNewReportClick,
}) => {
  const {
    cases,
    activeCaseId,
    setActiveCaseId,
    activeCase,
    updateCase,
    isStaleGPS,
    toggleStaleGPS,
    isSimulatingTelemetry,
    startTelemetrySimulation,
    stopTelemetrySimulation,
    simulationStep,
  } = useEmergency();

  const [showMarkSafeModal, setShowMarkSafeModal] = useState(false);

  if (!activeCase) {
    return (
      <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center text-zinc-500 shadow-xs max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-4 border border-zinc-200">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="font-black text-lg text-zinc-950">No Active Emergency Selected</h3>
        <p className="text-xs text-zinc-600 mt-1.5 max-w-sm mx-auto">
          You currently have no emergency reports in progress or selected. You can file a new distress call or select a recent case.
        </p>
        <button
          onClick={onNewReportClick}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white font-black text-xs px-6 py-3 rounded-xl transition shadow-xs active:scale-95"
        >
          File New Emergency Distress Call
        </button>
      </div>
    );
  }

  const statusSteps: { key: CaseStatus; label: string; desc: string }[] = [
    { key: 'SUBMITTED', label: '1. Logged', desc: 'Case received' },
    { key: 'UNDER_REVIEW', label: '2. Triage', desc: 'Dispatcher reviewing' },
    { key: 'VERIFIED', label: '3. Verified', desc: 'Approved by 1122' },
    { key: 'ASSIGNED', label: '4. Dispatched', desc: 'Crew mobilized' },
    { key: 'ON_THE_WAY', label: '5. En Route', desc: 'Sirens on, moving' },
    { key: 'ARRIVED', label: '6. At Scene', desc: 'On-site rescue' },
    { key: 'RESOLVED', label: '7. Evacuated', desc: 'Completed & safe' },
  ];

  const getStatusIndex = (st: CaseStatus) => {
    const idx = statusSteps.findIndex((s) => s.key === st);
    if (idx !== -1) return idx;
    if (st === 'NEW' || st === 'AI_DRAFT') return 0;
    return 1;
  };

  const currentStepIndex = getStatusIndex(activeCase.status);
  const assignedUnit = activeCase.assignedUnit;

  const currentCoords = assignedUnit?.currentLocation || activeCase.location;
  const speed = currentCoords.speed || (isSimulatingTelemetry ? 28 : 0);

  const isEnRouteOrArrived =
    activeCase.status === 'ON_THE_WAY' || activeCase.status === 'ARRIVED' || activeCase.status === 'ASSIGNED';
  const remainingSteps = Math.max(0, 12 - simulationStep);
  const estimatedMins = activeCase.status === 'ARRIVED' ? 0 : Math.max(2, Math.round(remainingSteps * 0.8));

  return (
    <div className="space-y-4">
      {/* Active Case Selector Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">
            Tracking Case:
          </span>
          <select
            value={activeCase.id}
            onChange={(e) => setActiveCaseId(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-zinc-950 focus:outline-none focus:border-red-600"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} · {c.category.toUpperCase()} ({c.location.district})
              </option>
            ))}
          </select>
          <span className="text-zinc-300 hidden sm:inline">·</span>
          <span className="text-xs text-zinc-700 font-medium">
            Reporter: <span className="font-bold text-zinc-950">{activeCase.reporterName}</span> ({activeCase.callbackPhone})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Stale GPS Simulator Toggle (FR-08) */}
          <button
            onClick={toggleStaleGPS}
            className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition ${
              isStaleGPS
                ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200/80 hover:text-black'
            }`}
            title="Toggle Stale Location Warning (FR-08 test)"
          >
            {isStaleGPS ? '⚠️ Stale GPS Alert Active' : 'Test Stale GPS (FR-08)'}
          </button>

          <button
            onClick={onNewReportClick}
            className="bg-black hover:bg-zinc-800 text-white text-xs font-black px-3.5 py-1.5 rounded-xl transition shadow-xs"
          >
            + New SOS
          </button>
        </div>
      </div>

      {/* FR-08 Stale Location Warning Banner */}
      {isStaleGPS && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 shadow-sm flex items-start gap-3.5 text-amber-900 animate-in fade-in">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0 shadow-xs">
            ⚠️
          </div>
          <div className="text-xs">
            <div className="font-black text-amber-950 text-sm">
              FR-08 WARNING: STALE COORDINATES DETECTED (&gt;30 SECONDS OLD)
            </div>
            <p className="mt-0.5 text-amber-900 leading-relaxed font-medium">
              GPS telemetry from {assignedUnit?.callSign || 'Assigned Rescue Unit'} has temporarily paused due to district cellular towers. Displaying last verified coordinates recorded at {new Date(currentCoords.recordedAt).toLocaleTimeString()}. Rescue 1122 Radio Command backup is tracking.
            </p>
          </div>
        </div>
      )}

      {/* Status Timeline Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div>
            <div className="text-[11px] text-zinc-500 font-mono tracking-wider uppercase font-bold">
              Emergency Lifecycle Status · #{activeCase.id}
            </div>
            <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2 mt-0.5">
              <span>{activeCase.category.toUpperCase()} CRISIS</span>
              <span className="font-mono text-xs font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                PRIORITY: {activeCase.priority}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {activeCase.status !== 'RESOLVED' ? (
              <button
                onClick={() => setShowMarkSafeModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl transition shadow-xs active:scale-95"
              >
                Mark Safe / Evacuated
              </button>
            ) : (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-black text-xs px-3 py-1.5 rounded-xl">
                ✓ OPERATION RESOLVED
              </span>
            )}
          </div>
        </div>

        {/* Linear Step Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {statusSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.key}
                className={`p-3 rounded-xl border transition ${
                  isCurrent
                    ? 'bg-black text-white border-black shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[11px] font-mono font-bold">
                  <span>{step.label}</span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                </div>
                <div className={`text-[10px] ${isCurrent ? 'text-zinc-300' : isCompleted ? 'text-emerald-700' : 'text-zinc-400'}`}>
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Tracking Layout: Map + Real-time Telemetry Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Viewport */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white border border-zinc-200 rounded-2xl p-3 shadow-xs">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span className="font-black text-xs text-zinc-950 uppercase tracking-wider font-mono">
                  Live District GPS Route & Waterway Inundation
                </span>
              </div>
              <div className="text-[11px] font-mono text-zinc-500">
                {activeCase.location.district || 'Lahore'}, Pakistan
              </div>
            </div>

            <EmergencyMap
              center={[currentCoords.latitude, currentCoords.longitude]}
              zoom={13}
              incidentLocation={activeCase.location}
              assignedUnit={assignedUnit}
              unitLocation={assignedUnit?.currentLocation}
              isStale={isStaleGPS}
              className="h-[320px] sm:h-[400px] lg:h-[460px] w-full rounded-xl"
            />

            <div className="flex items-center justify-between flex-wrap gap-2 mt-2 px-1 text-[11px] text-zinc-500 font-mono">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 bg-red-600 rounded-full" />
                <span>Incident: {activeCase.location.landmark || activeCase.location.address}</span>
              </div>
              <div>
                Coordinates: {currentCoords.latitude.toFixed(4)}, {currentCoords.longitude.toFixed(4)}
              </div>
            </div>
          </div>
        </div>

        {/* Right HUD Column: Unit Telemetry & Distress Info */}
        <div className="space-y-4">
          {/* Unit Status Card */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-xs">
                  <Truck className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-zinc-950">
                    {assignedUnit ? assignedUnit.callSign : 'Awaiting Dispatch'}
                  </h3>
                  <div className="text-[11px] text-zinc-500">
                    {assignedUnit ? assignedUnit.organizationName : 'Rescue 1122 Provincial Command'}
                  </div>
                </div>
              </div>

              {assignedUnit && (
                <span className="bg-emerald-100 text-emerald-800 font-mono font-black text-xs px-2.5 py-1 rounded-lg">
                  {assignedUnit.status}
                </span>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                <div className="text-[10px] font-mono text-zinc-500 uppercase font-bold">ESTIMATED ETA</div>
                <div className="text-xl font-black text-red-600 font-mono mt-0.5">
                  {isEnRouteOrArrived ? `${estimatedMins} min` : '--'}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Rapid transit</div>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                <div className="text-[10px] font-mono text-zinc-500 uppercase font-bold">UNIT SPEED</div>
                <div className="text-xl font-black text-zinc-950 font-mono mt-0.5">
                  {speed} km/h
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  Battery: {assignedUnit?.batteryLevel || 100}%
                </div>
              </div>
            </div>

            {/* Interactive Telemetry Controls for Testing */}
            <div className="pt-2 border-t border-zinc-100 space-y-2">
              <div className="text-[11px] font-bold text-zinc-700 flex items-center justify-between">
                <span>Telemetry Stream Simulator:</span>
                <span className="font-mono text-[10px] text-zinc-500">Step {simulationStep}/12</span>
              </div>

              <div className="flex gap-2">
                {isSimulatingTelemetry ? (
                  <button
                    onClick={stopTelemetrySimulation}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-2 rounded-xl transition"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Stream</span>
                  </button>
                ) : (
                  <button
                    onClick={startTelemetrySimulation}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs py-2 rounded-xl transition shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 text-red-500" />
                    <span>Simulate GPS Route</span>
                  </button>
                )}
              </div>
            </div>

            {/* Direct Dial Responder / Control Room */}
            <div className="pt-1">
              <a
                href="tel:1122"
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Call Incident Controller (1122)</span>
              </a>
            </div>
          </div>

          {/* Victim & Condition Summary */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs space-y-2.5 text-xs">
            <div className="font-black text-zinc-950 uppercase tracking-wider text-[11px] font-mono border-b border-zinc-100 pb-2">
              Incident Context & Safety Notes
            </div>

            <div className="flex items-center justify-between text-zinc-700">
              <span>Affected Persons:</span>
              <span className="font-black text-zinc-950">{activeCase.peopleInfo.count} Trapped</span>
            </div>

            {activeCase.peopleInfo.vulnerableCategories.length > 0 && (
              <div className="flex items-start justify-between text-zinc-700 gap-2">
                <span>Vulnerabilities:</span>
                <span className="font-bold text-red-600 text-right">
                  {activeCase.peopleInfo.vulnerableCategories.join(', ')}
                </span>
              </div>
            )}

            <div className="flex items-start justify-between text-zinc-700 gap-2">
              <span>Hazards:</span>
              <span className="font-medium text-zinc-900 text-right">
                {activeCase.hazards.join(', ') || 'None reported'}
              </span>
            </div>

            {activeCase.translatedDescription && (
              <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 text-[11px] text-zinc-700 leading-relaxed">
                <span className="font-bold text-zinc-900">Translation: </span>
                {activeCase.translatedDescription}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mark Safe Modal */}
      {showMarkSafeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-black text-base text-zinc-950">Confirm Evacuation & Safety</h3>
              <p className="text-xs text-zinc-600 mt-1">
                Are you confirming that all victims have been evacuated to safety and this emergency case can be officially closed?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowMarkSafeModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateCase(activeCase.id, {
                    status: 'RESOLVED',
                    resolvedAt: new Date().toISOString(),
                    responseNotes: 'Marked resolved and safe by citizen confirmation.',
                  });
                  setShowMarkSafeModal(false);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
              >
                Yes, Evacuated & Safe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
