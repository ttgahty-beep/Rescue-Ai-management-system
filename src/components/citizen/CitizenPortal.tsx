import React, { useState } from 'react';
import { CitizenReportView } from './CitizenReportView';
import { CitizenTrackView } from './CitizenTrackView';
import { CitizenDirectoryView } from './CitizenDirectoryView';
import { CitizenSafetyGuidesView } from './CitizenSafetyGuidesView';
import { AlertCircle, MapPin, Hospital, BookOpen } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

export const CitizenPortal: React.FC = () => {
  const { activeCase } = useEmergency();
  const [activeTab, setActiveTab] = useState<'report' | 'track' | 'directory' | 'guides'>('track');

  return (
    <div className="space-y-4">
      {/* Precision Segmented Control Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'report'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Report SOS (اطلاع دیں)</span>
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition relative ${
              activeTab === 'track'
                ? 'bg-black text-white shadow-xs'
                : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 ${activeTab === 'track' ? 'text-red-500' : 'text-red-600'}`} />
            <span>Live Rescue Map</span>
            {activeCase && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute top-1.5 right-1.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'directory'
                ? 'bg-black text-white shadow-xs'
                : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <Hospital className="w-3.5 h-3.5" />
            <span>Facilities & Camps</span>
          </button>

          <button
            onClick={() => setActiveTab('guides')}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'guides'
                ? 'bg-black text-white shadow-xs'
                : 'text-zinc-700 hover:text-black hover:bg-zinc-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>First-Aid Guides</span>
          </button>
        </div>

        {activeCase && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">ACTIVE CASE</span>
            <span className="font-mono font-bold text-red-600">#{activeCase.id}</span>
            <span className="text-zinc-400">·</span>
            <span className="text-emerald-700 font-bold uppercase text-[11px] font-mono">
              {activeCase.status.replace(/_/g, ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Sub-view Content */}
      {activeTab === 'report' && (
        <CitizenReportView
          onCaseCreated={() => {
            setActiveTab('track');
          }}
        />
      )}

      {activeTab === 'track' && (
        <CitizenTrackView onNewReportClick={() => setActiveTab('report')} />
      )}

      {activeTab === 'directory' && <CitizenDirectoryView />}

      {activeTab === 'guides' && <CitizenSafetyGuidesView />}
    </div>
  );
};
