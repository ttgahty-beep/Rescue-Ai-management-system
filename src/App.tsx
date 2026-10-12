/**
 * RescueLink AI - Pakistan Emergency Coordination Platform
 * Compliant with RescueLink AI PRD and Architecture Specification (Version 1.0)
 * Modern High-Contrast White Theme with Black & Emergency Red Accents & Mobile Navigation
 */

import React, { useState } from 'react';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import { Header } from './components/layout/Header';
import { CitizenPortal } from './components/citizen/CitizenPortal';
import { DispatcherOps } from './components/dispatcher/DispatcherOps';
import { ResponderMission } from './components/responder/ResponderMission';
import { AdminConsole } from './components/admin/AdminConsole';
import { DemoScenarioWalkthrough } from './components/demo/DemoScenarioWalkthrough';
import { Shield, AlertCircle, MapPin, Radio, Truck, Settings, Hospital } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentRole, setCurrentRole, cases } = useEmergency();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const activeCasesCount = cases.filter((c) => c.status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-[#fafafa] tactical-grid-bg text-zinc-950 flex flex-col justify-between selection:bg-red-600 selection:text-white pb-20 sm:pb-0">
      {/* Header with Hotlines & Role Switcher */}
      <Header onOpenDemoModal={() => setIsDemoModalOpen(true)} />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 space-y-6">
        {currentRole === 'citizen' && <CitizenPortal />}
        {currentRole === 'dispatcher' && <DispatcherOps />}
        {currentRole === 'responder' && <ResponderMission />}
        {currentRole === 'admin' && <AdminConsole />}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar (Thumb Friendly) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-xl py-1 px-3 flex items-center justify-around">
        <button
          onClick={() => setCurrentRole('citizen')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            currentRole === 'citizen' ? 'text-red-600 font-black' : 'text-zinc-600 hover:text-black font-semibold'
          }`}
        >
          <AlertCircle className={`w-5 h-5 ${currentRole === 'citizen' ? 'text-red-600 stroke-[2.5]' : 'text-zinc-500'}`} />
          <span className="text-[10px] mt-0.5 font-sans">Citizen SOS</span>
        </button>

        <button
          onClick={() => setCurrentRole('dispatcher')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition relative ${
            currentRole === 'dispatcher' ? 'text-black font-black' : 'text-zinc-600 hover:text-black font-semibold'
          }`}
        >
          <Radio className={`w-5 h-5 ${currentRole === 'dispatcher' ? 'text-red-600 stroke-[2.5]' : 'text-zinc-500'}`} />
          <span className="text-[10px] mt-0.5 font-sans">Dispatch</span>
          {activeCasesCount > 0 && (
            <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-red-600 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setCurrentRole('responder')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            currentRole === 'responder' ? 'text-black font-black' : 'text-zinc-600 hover:text-black font-semibold'
          }`}
        >
          <Truck className={`w-5 h-5 ${currentRole === 'responder' ? 'text-red-600 stroke-[2.5]' : 'text-zinc-500'}`} />
          <span className="text-[10px] mt-0.5 font-sans">Responder</span>
        </button>

        <button
          onClick={() => setCurrentRole('admin')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            currentRole === 'admin' ? 'text-black font-black' : 'text-zinc-600 hover:text-black font-semibold'
          }`}
        >
          <Settings className={`w-5 h-5 ${currentRole === 'admin' ? 'text-red-600 stroke-[2.5]' : 'text-zinc-500'}`} />
          <span className="text-[10px] mt-0.5 font-sans">Audit</span>
        </button>
      </nav>

      {/* PRD Section 30 Demo Scenario Walkthrough Modal */}
      <DemoScenarioWalkthrough
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      {/* Refined High-Contrast Footer */}
      <footer className="border-t border-zinc-200 bg-white px-4 sm:px-6 py-6 text-xs text-zinc-600 mt-12 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-red-500" />
            </div>
            <span className="font-black text-zinc-950 text-sm">RescueLink AI</span>
            <span className="text-zinc-500">— Pakistan Emergency Coordination & AI Triage Platform</span>
          </div>

          <div className="text-center md:text-right text-[11px] text-zinc-500 max-w-xl">
            <span className="text-zinc-900 font-bold">Statutory Notice (PRD Section 32):</span> RescueLink AI is a third-party situational awareness layer and does not replace official state services (Rescue 1122, Police 15, Edhi 115, Chhipa 1020, NDMA 1030).
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500 font-mono">
          <div>Version 1.0 (MVP) · District-First Architecture · Rescue 1122 & Edhi Integration</div>
          <div>Bilingual: English · اردو · Roman Urdu · Powered by Gemini 3.8 Flash</div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <EmergencyProvider>
      <MainContent />
    </EmergencyProvider>
  );
}
