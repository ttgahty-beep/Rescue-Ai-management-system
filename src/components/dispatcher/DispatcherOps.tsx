import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { EmergencyMap } from '../map/EmergencyMap';
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  Filter,
  Search,
  Send,
  FileEdit,
  Clock,
  MapPin,
  Users,
  Shield,
  Layers,
  PhoneCall,
  Check,
  AlertOctagon,
  Copy,
  ChevronRight,
  Phone,
} from 'lucide-react';
import { EmergencyCase, PriorityLevel, CaseStatus, RescueUnit } from '../../types/emergency';

export const DispatcherOps: React.FC = () => {
  const {
    cases,
    activeCaseId,
    setActiveCaseId,
    activeCase,
    units,
    verifyCase,
    assignUnitToCase,
    updateCase,
    closeCase,
    addChatMessage,
    resources,
    roadHazards,
  } = useEmergency();

  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterDistrict, setFilterDistrict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Inline edit state for AI extraction (FR-03)
  const [isEditingAI, setIsEditingAI] = useState(false);
  const [editCategory, setEditCategory] = useState<string>('');
  const [editPriority, setEditPriority] = useState<PriorityLevel>('CRITICAL');
  const [editPeopleCount, setEditPeopleCount] = useState<number>(1);
  const [editNotes, setEditNotes] = useState<string>('');

  // Dispatcher message box to citizen
  const [customDispatcherMsg, setCustomDispatcherMsg] = useState('');

  // Close case modal
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [outcomeCode, setOutcomeCode] = useState('SUCCESSFUL_EVACUATION');
  const [responseNotes, setResponseNotes] = useState('');

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesPriority = filterPriority === 'All' || c.priority === filterPriority;
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesDistrict = filterDistrict === 'All' || c.location.district === filterDistrict;
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.landmark?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reporterName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesStatus && matchesDistrict && matchesSearch;
  });

  // FR-10 Duplicate Detection: Check for similar cases in same district with same category
  const currentCase = activeCase || cases[0];
  const duplicateCandidates = cases.filter(
    (c) =>
      c.id !== currentCase?.id &&
      c.location.district === currentCase?.location.district &&
      c.category === currentCase?.category &&
      c.status !== 'RESOLVED' &&
      c.status !== 'DUPLICATE'
  );

  const startEditing = () => {
    if (!currentCase) return;
    setEditCategory(currentCase.category);
    setEditPriority(currentCase.priority);
    setEditPeopleCount(currentCase.peopleInfo.count);
    setEditNotes(currentCase.aiExtraction?.injurySummary || '');
    setIsEditingAI(true);
  };

  const saveAIEdits = () => {
    if (!currentCase) return;
    updateCase(currentCase.id, {
      category: editCategory as any,
      priority: editPriority,
      peopleInfo: {
        ...currentCase.peopleInfo,
        count: editPeopleCount,
      },
      aiExtraction: currentCase.aiExtraction
        ? {
            ...currentCase.aiExtraction,
            injurySummary: editNotes,
          }
        : undefined,
    });
    setIsEditingAI(false);
  };

  const handleSendMessageToCitizen = () => {
    if (!customDispatcherMsg.trim() || !currentCase) return;
    addChatMessage(currentCase.id, {
      sender: 'dispatcher',
      body: `[DISPATCH COMMAND]: ${customDispatcherMsg}`,
    });
    setCustomDispatcherMsg('');
  };

  const handleCloseCaseSubmit = () => {
    if (!currentCase) return;
    closeCase(currentCase.id, outcomeCode, responseNotes);
    setIsCloseModalOpen(false);
    setResponseNotes('');
  };

  return (
    <div className="space-y-4">
      {/* Top Operations Header */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
            <Radio className="w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-zinc-950">
                Pakistan Operations & Tactical Dispatch Room
              </h2>
              <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                LIVE NETWORK
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-0.5">
              Human-in-the-loop verification, resource assignment & cross-agency routing
            </p>
          </div>
        </div>

        {/* Quick Triage Stats */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <div className="bg-zinc-50 px-3.5 py-2 rounded-2xl border border-zinc-200">
            <span className="text-zinc-500 text-[10px] block font-bold">ACTIVE CASES</span>
            <span className="text-base font-black text-red-600 tabular-nums">
              {cases.filter((c) => c.status !== 'RESOLVED').length}
            </span>
          </div>
          <div className="bg-zinc-50 px-3.5 py-2 rounded-2xl border border-zinc-200">
            <span className="text-zinc-500 text-[10px] block font-bold">READY UNITS</span>
            <span className="text-base font-black text-emerald-700 tabular-nums">
              {units.filter((u) => u.status !== 'OFFLINE').length}
            </span>
          </div>
        </div>
      </div>

      {/* FR-10 Duplicate Detection Warning Banner */}
      {duplicateCandidates.length > 0 && currentCase && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-start gap-2.5">
            <Copy className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <div className="font-black text-amber-950 text-sm">
                FR-10 Duplicate Incident Warning: {duplicateCandidates.length} matching report(s) in {currentCase.location.district}
              </div>
              <p className="text-amber-900 text-xs mt-0.5 font-medium">
                Case(s) #{duplicateCandidates.map((d) => d.id).join(', ')} report similar conditions within geographic proximity.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              duplicateCandidates.forEach((d) => {
                updateCase(d.id, {
                  status: 'DUPLICATE',
                  isDuplicateOf: currentCase.id,
                  responseNotes: `Merged into primary incident #${currentCase.id}`,
                });
              });
            }}
            className="bg-black hover:bg-zinc-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shrink-0 transition"
          >
            Merge Duplicates
          </button>
        </div>
      )}

      {/* Main Workspace: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Triage Queue & Filters (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by ID, district, victim name..."
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-red-600 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 focus:outline-none transition"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-zinc-800 focus:outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="CRITICAL">P1 - Critical</option>
                <option value="HIGH">P2 - High</option>
                <option value="MEDIUM">P3 - Medium</option>
                <option value="LOW">P4 - Low</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-zinc-800 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="VERIFIED">Verified</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="ON_THE_WAY">En Route</option>
                <option value="ARRIVED">At Scene</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-zinc-800 focus:outline-none"
              >
                <option value="All">All Districts</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Sukkur">Sukkur</option>
              </select>
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredCases.map((c) => {
              const isSelected = currentCase?.id === c.id;
              const isCrit = c.priority === 'CRITICAL';
              const isHigh = c.priority === 'HIGH';

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCaseId(c.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-md'
                      : 'bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isCrit ? 'bg-red-500 animate-ping' : 'bg-amber-400'}`} />
                      <span className="font-mono font-bold tracking-tight text-[11px]">
                        #{c.id}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        isSelected
                          ? isCrit ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-200'
                          : isCrit ? 'bg-red-100 text-red-800' : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        {c.priority}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold uppercase ${
                      isSelected ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="font-bold text-sm mb-1 line-clamp-1">
                    {c.location.landmark || c.location.district || 'Unspecified Location'}
                  </div>

                  <p className={`text-[11px] line-clamp-2 leading-relaxed ${
                    isSelected ? 'text-zinc-300' : 'text-zinc-600'
                  }`}>
                    {c.description}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-200/40 text-[10px] font-mono">
                    <span className={isSelected ? 'text-zinc-400' : 'text-zinc-500'}>
                      {c.peopleInfo.count} Trapped · {c.category.toUpperCase()}
                    </span>
                    <span className={isSelected ? 'text-zinc-400' : 'text-zinc-500'}>
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Case Examination, Verification & Resource Assignment (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {currentCase ? (
            <>
              {/* Case Action Terminal */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 flex-wrap gap-2">
                  <div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase font-black">
                      ACTIVE INCIDENT RECORD · {currentCase.id}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-zinc-950 flex items-center gap-2 mt-0.5">
                      <span>{currentCase.category.toUpperCase()} IN {currentCase.location.district}</span>
                      <span className="text-xs font-mono font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        {currentCase.priority}
                      </span>
                    </h3>
                  </div>

                  {/* Verification & Closure Action Bar */}
                  <div className="flex items-center gap-2">
                    {currentCase.status === 'SUBMITTED' || currentCase.status === 'UNDER_REVIEW' ? (
                      <button
                        onClick={() => verifyCase(currentCase.id, 'Officer Tariq (1122 Command)')}
                        className="bg-black hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Verify & Approve Case</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsCloseModalOpen(true)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve / Close Mission</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Extraction Card (Editable per FR-03) */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span className="font-mono text-xs font-black uppercase tracking-wider text-zinc-900">
                        FR-03 AI Extraction & Dispatch Reason
                      </span>
                      {currentCase.confidenceScore && (
                        <span className="text-[10px] font-mono bg-zinc-200 text-zinc-800 px-1.5 py-0.2 rounded font-bold">
                          {currentCase.confidenceScore}% confidence
                        </span>
                      )}
                    </div>

                    {!isEditingAI ? (
                      <button
                        onClick={startEditing}
                        className="text-[11px] font-bold text-black hover:text-red-600 flex items-center gap-1"
                      >
                        <FileEdit className="w-3 h-3" />
                        <span>Correct AI Values</span>
                      </button>
                    ) : (
                      <button
                        onClick={saveAIEdits}
                        className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save Corrections</span>
                      </button>
                    )}
                  </div>

                  {!isEditingAI ? (
                    <div className="text-xs space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                        <div>
                          <span className="text-zinc-500 block">Category:</span>
                          <span className="font-bold text-zinc-900 uppercase">{currentCase.category}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">People Affected:</span>
                          <span className="font-bold text-zinc-900">{currentCase.peopleInfo.count} persons</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Reporter:</span>
                          <span className="font-bold text-zinc-900">{currentCase.reporterName}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Callback:</span>
                          <a href={`tel:${currentCase.callbackPhone}`} className="font-bold text-red-600 hover:underline">
                            {currentCase.callbackPhone}
                          </a>
                        </div>
                      </div>

                      {currentCase.aiExtraction?.aiReasoning && (
                        <div className="bg-white p-2.5 rounded-xl border border-zinc-200 text-[11px] text-zinc-700 leading-relaxed font-sans">
                          <span className="font-bold text-zinc-900">Recommendation: </span>
                          {currentCase.aiExtraction.aiReasoning}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                      <div>
                        <label className="block text-zinc-600 font-bold mb-1">Category</label>
                        <input
                          type="text"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-zinc-900"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-600 font-bold mb-1">Priority</label>
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-zinc-900"
                        >
                          <option value="CRITICAL">CRITICAL (P1)</option>
                          <option value="HIGH">HIGH (P2)</option>
                          <option value="MEDIUM">MEDIUM (P3)</option>
                          <option value="LOW">LOW (P4)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-zinc-600 font-bold mb-1">People Count</label>
                        <input
                          type="number"
                          value={editPeopleCount}
                          onChange={(e) => setEditPeopleCount(parseInt(e.target.value) || 1)}
                          className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-zinc-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Tactical Map with Incident Coordinates */}
                <div className="rounded-2xl overflow-hidden border border-zinc-200">
                  <EmergencyMap
                    center={[currentCase.location.latitude, currentCase.location.longitude]}
                    zoom={13}
                    incidentLocation={currentCase.location}
                    assignedUnit={currentCase.assignedUnit}
                    className="h-[240px] sm:h-[300px] w-full"
                  />
                </div>

                {/* Resource Assignment Panel (FR-05) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-red-600" />
                      <span className="font-black text-xs text-zinc-950 uppercase tracking-wider font-mono">
                        FR-05 Assign Rescue Units & Boats
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {units.filter((u) => u.status === 'AVAILABLE').length} Available in District
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {units.map((u) => {
                      const isAssignedToThis = currentCase.assignedUnitId === u.id;
                      const isAvailable = u.status === 'AVAILABLE';

                      return (
                        <div
                          key={u.id}
                          className={`p-3 rounded-2xl border transition flex items-center justify-between gap-2 ${
                            isAssignedToThis
                              ? 'bg-black text-white border-black'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                          }`}
                        >
                          <div>
                            <div className="font-black text-xs flex items-center gap-1.5">
                              <span>{u.callSign}</span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                isAssignedToThis ? 'bg-red-600 text-white' : 'bg-zinc-200 text-zinc-800'
                              }`}>
                                {u.type}
                              </span>
                            </div>
                            <div className={`text-[10px] mt-0.5 ${isAssignedToThis ? 'text-zinc-300' : 'text-zinc-500'}`}>
                              {u.organizationName} · {u.serviceArea}
                            </div>
                          </div>

                          <div>
                            {isAssignedToThis ? (
                              <span className="font-mono text-[10px] font-black text-emerald-400">
                                ASSIGNED
                              </span>
                            ) : (
                              <button
                                onClick={() => assignUnitToCase(currentCase.id, u.id, 'Dispatcher Command')}
                                className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition shadow-xs active:scale-95"
                              >
                                Mobilize
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dispatcher Direct Instruction to Citizen */}
                <div className="pt-2 border-t border-zinc-100 space-y-2">
                  <div className="text-[11px] font-bold text-zinc-700 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-black" />
                    <span>Broadcast Tactical Directive to Citizen Mobile:</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customDispatcherMsg}
                      onChange={(e) => setCustomDispatcherMsg(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessageToCitizen()}
                      placeholder="e.g. Boat A-17 has entered your street. Wave a flashlight or red cloth..."
                      className="flex-1 bg-zinc-50 border border-zinc-200 focus:border-red-600 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none"
                    />
                    <button
                      onClick={handleSendMessageToCitizen}
                      className="bg-black hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
                    >
                      Transmit
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center text-zinc-400">
              No case selected for triage.
            </div>
          )}
        </div>
      </div>

      {/* Case Closure Modal */}
      {isCloseModalOpen && currentCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-base text-zinc-950">Close Emergency Incident #{currentCase.id}</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-bold mb-1">Outcome Resolution Code</label>
                <select
                  value={outcomeCode}
                  onChange={(e) => setOutcomeCode(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-2.5 text-zinc-900 font-bold"
                >
                  <option value="SUCCESSFUL_EVACUATION">SUCCESSFUL_EVACUATION (Evacuated to Shelter)</option>
                  <option value="HOSPITAL_TRANSPORT">HOSPITAL_TRANSPORT (Admitted to Trauma Unit)</option>
                  <option value="TREATED_ON_SCENE">TREATED_ON_SCENE (First-Aid Provided)</option>
                  <option value="FALSE_ALARM">FALSE_ALARM (Cancelled / Unverified)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Mission debrief & notes</label>
                <textarea
                  rows={3}
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder="Summarize actions taken, victims saved, handoff location..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-2.5 text-zinc-900 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseCaseSubmit}
                className="px-5 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-xs"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
