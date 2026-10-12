import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { EmergencyMap } from '../map/EmergencyMap';
import {
  Truck,
  CheckCircle2,
  Navigation,
  Radio,
  Wifi,
  WifiOff,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Phone,
  Shield,
  LifeBuoy,
  Layers,
  ArrowRight,
  Database,
  Check,
} from 'lucide-react';
import { UnitStatus } from '../../types/emergency';

export const ResponderMission: React.FC = () => {
  const {
    units,
    cases,
    updateUnitStatus,
    updateUnitLocation,
    isSimulatingTelemetry,
    startTelemetrySimulation,
    stopTelemetrySimulation,
    isStaleGPS,
    toggleStaleGPS,
    isOfflineMode,
    toggleOfflineMode,
    offlineQueueCount,
    syncOfflineQueue,
    addChatMessage,
    logAuditEvent,
  } = useEmergency();

  const [selectedUnitId, setSelectedUnitId] = useState<string>('unit-a17');
  const [backupAlertSent, setBackupAlertSent] = useState(false);
  const activeUnit = units.find((u) => u.id === selectedUnitId) || units[0];

  const assignedCase = cases.find(
    (c) => c.assignedUnitId === activeUnit.id || (activeUnit.id === 'unit-a17' && c.id === 'RL-PK-2026-9042')
  );

  const missionStatusSteps: { status: UnitStatus; label: string; desc: string }[] = [
    { status: 'ASSIGNED', label: '1. Mission Alert', desc: 'Dispatched' },
    { status: 'ACCEPTED', label: '2. Accept Call', desc: 'Acknowledged' },
    { status: 'EN_ROUTE', label: '3. En Route', desc: 'Sirens on' },
    { status: 'AT_SCENE', label: '4. At Scene', desc: 'On-site rescue' },
    { status: 'TRANSPORTING', label: '5. Evacuating', desc: 'To shelter/camp' },
    { status: 'AVAILABLE', label: '6. Complete', desc: 'Available for next' },
  ];

  const handleStatusChange = (newStatus: UnitStatus) => {
    updateUnitStatus(activeUnit.id, newStatus);

    if (assignedCase) {
      addChatMessage(assignedCase.id, {
        sender: 'system',
        body: `[RESPONDER UPDATE]: ${activeUnit.callSign} status changed to ${newStatus}.`,
      });
    }

    if (newStatus === 'EN_ROUTE' && !isSimulatingTelemetry) {
      startTelemetrySimulation();
    }
  };

  const handleRequestBackup = () => {
    if (!assignedCase) return;
    addChatMessage(assignedCase.id, {
      sender: 'system',
      body: `🚨 [PRIORITY BACKUP REQUESTED]: ${activeUnit.callSign} requested additional support at scene. Second rescue boat dispatched.`,
    });
    logAuditEvent('BACKUP_REQUESTED', 'unit', activeUnit.id, {
      caseId: assignedCase.id,
      reason: 'Rising water level / multiple trapped victims',
    });
    setBackupAlertSent(true);
    setTimeout(() => setBackupAlertSent(false), 5000);
  };

  return (
    <div className="space-y-4">
      {/* Unit Selector & Connectivity HUD */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
            <Truck className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-bold font-mono uppercase">Unit Terminal:</span>
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-black text-zinc-950 focus:outline-none focus:border-red-600"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.callSign} ({u.organizationName}) · {u.type}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
              Base: {activeUnit.serviceArea} · Battery: {activeUnit.batteryLevel}% · Status: {activeUnit.status}
            </p>
          </div>
        </div>

        {/* Network & Offline Queue Simulator (FR-12) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleOfflineMode}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border ${
              isOfflineMode
                ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-black'
            }`}
            title="Toggle offline cellular drop to test local storage queue (FR-12)"
          >
            {isOfflineMode ? <WifiOff className="w-4 h-4 text-amber-700" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
            <span>{isOfflineMode ? 'FR-12 Offline Mode' : 'Online (3G/4G)'}</span>
          </button>

          {offlineQueueCount > 0 && (
            <button
              onClick={syncOfflineQueue}
              className="flex items-center gap-1 bg-black hover:bg-zinc-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Queue ({offlineQueueCount})</span>
            </button>
          )}

          <button
            onClick={handleRequestBackup}
            disabled={backupAlertSent}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs px-4 py-2 rounded-xl shadow-xs transition active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{backupAlertSent ? 'Backup Alert Sent!' : 'Call Backup'}</span>
          </button>
        </div>
      </div>

      {/* Main Mission Screen */}
      {assignedCase ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Mission Controls & Status Machine (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase font-black">
                    ACTIVE DISPATCH ORDER #{assignedCase.id}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-zinc-950 mt-0.5">
                    {assignedCase.category.toUpperCase()} EVACUATION
                  </h3>
                </div>

                <span className="font-mono text-xs font-black text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                  {assignedCase.priority}
                </span>
              </div>

              {/* Status Machine Flow Buttons */}
              <div className="space-y-2">
                <div className="text-xs font-black text-zinc-950 uppercase tracking-wider font-mono">
                  Update Mission Operational State:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {missionStatusSteps.map((step) => {
                    const isCurrent = activeUnit.status === step.status;
                    return (
                      <button
                        key={step.status}
                        onClick={() => handleStatusChange(step.status)}
                        className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                          isCurrent
                            ? 'bg-black text-white border-black shadow-md'
                            : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200'
                        }`}
                      >
                        <div>
                          <div className="font-black text-xs">{step.label}</div>
                          <div className={`text-[10px] mt-0.5 ${isCurrent ? 'text-zinc-300' : 'text-zinc-500'}`}>
                            {step.desc}
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Incident Location & Victim Handoff Notes */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className="font-black text-zinc-950 uppercase tracking-wider font-mono text-[11px]">
                  Target Scene Information:
                </div>
                <div className="text-zinc-800 font-bold">
                  {assignedCase.location.landmark || assignedCase.location.address}
                </div>
                <div className="text-zinc-600 text-[11px]">
                  District: {assignedCase.location.district} · {assignedCase.peopleInfo.count} Trapped Persons
                </div>
                {assignedCase.peopleInfo.vulnerableCategories.length > 0 && (
                  <div className="text-red-600 font-bold text-[11px]">
                    Vulnerabilities: {assignedCase.peopleInfo.vulnerableCategories.join(', ')}
                  </div>
                )}
                <div className="text-zinc-600 text-[11px] pt-1">
                  Reported Hazards: {assignedCase.hazards.join(', ') || 'Rising waters, localized current'}
                </div>
              </div>

              {/* Responder Telemetry Controls */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-3">
                <div className="text-xs text-zinc-600 font-mono">
                  GPS: {activeUnit.currentLocation.latitude.toFixed(4)}, {activeUnit.currentLocation.longitude.toFixed(4)}
                </div>

                <div className="flex items-center gap-2">
                  {isSimulatingTelemetry ? (
                    <button
                      onClick={stopTelemetrySimulation}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs px-3.5 py-1.5 rounded-xl transition"
                    >
                      Pause GPS
                    </button>
                  ) : (
                    <button
                      onClick={startTelemetrySimulation}
                      className="bg-black hover:bg-zinc-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-xs"
                    >
                      Stream Route GPS
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mission Tactical Map (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="bg-white border border-zinc-200 rounded-3xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-2.5 px-2">
                <span className="font-black text-xs text-zinc-950 uppercase tracking-wider font-mono">
                  Tactical Water Navigation & Route
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  Target: {assignedCase.location.district}
                </span>
              </div>

              <EmergencyMap
                center={[activeUnit.currentLocation.latitude, activeUnit.currentLocation.longitude]}
                zoom={14}
                incidentLocation={assignedCase.location}
                assignedUnit={activeUnit}
                unitLocation={activeUnit.currentLocation}
                className="h-[360px] sm:h-[440px] w-full rounded-2xl"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center text-zinc-400">
          No mission currently assigned to {activeUnit.callSign}. Standby at base station.
        </div>
      )}
    </div>
  );
};
