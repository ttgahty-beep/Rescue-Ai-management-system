import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { PAKISTAN_HELPLINES } from '../../data/mockData';
import {
  ShieldAlert,
  PhoneCall,
  User,
  Radio,
  Truck,
  Settings,
  Sparkles,
  ChevronDown,
  Phone,
  Menu,
  X,
  Activity,
} from 'lucide-react';
import { UserRole } from '../../types/emergency';

export const Header: React.FC<{ onOpenDemoModal: () => void }> = ({ onOpenDemoModal }) => {
  const {
    currentRole,
    setCurrentRole,
    selectedLanguage,
    setSelectedLanguage,
    cases,
  } = useEmergency();

  const [showHelplineDropdown, setShowHelplineDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roles: { id: UserRole; label: string; icon: any; count?: number }[] = [
    { id: 'citizen', label: 'Citizen Portal', icon: User },
    {
      id: 'dispatcher',
      label: 'Dispatcher Ops',
      icon: Radio,
      count: cases.filter((c) => c.status !== 'RESOLVED').length,
    },
    {
      id: 'responder',
      label: 'Responder Unit',
      icon: Truck,
      count: cases.filter((c) => c.status === 'ASSIGNED' || c.status === 'ON_THE_WAY').length,
    },
    { id: 'admin', label: 'Command & Audit', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 shadow-xs">
      {/* High-Contrast Pakistan Emergency Hotlines Ticker */}
      <div className="bg-black text-white px-3 sm:px-6 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-0.5">
            <div className="flex items-center gap-1.5 text-[10px] font-black tracking-wider text-red-500 uppercase shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
              <span>EMERGENCY HOTLINES:</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono shrink-0">
              <a
                href="tel:1122"
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-0.5 rounded transition shrink-0"
              >
                <span className="font-sans text-[11px] font-medium hidden sm:inline">Rescue</span>
                <span className="font-mono">1122</span>
              </a>

              <a
                href="tel:115"
                className="inline-flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold px-2 py-0.5 rounded border border-zinc-700 transition shrink-0"
              >
                <span className="font-sans text-[11px] text-zinc-400 font-medium hidden sm:inline">Edhi</span>
                <span className="font-mono">115</span>
              </a>

              <a
                href="tel:1020"
                className="inline-flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold px-2 py-0.5 rounded border border-zinc-700 transition shrink-0"
              >
                <span className="font-sans text-[11px] text-zinc-400 font-medium hidden sm:inline">Chhipa</span>
                <span className="font-mono">1020</span>
              </a>

              <a
                href="tel:15"
                className="hidden md:inline-flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold px-2 py-0.5 rounded border border-zinc-700 transition shrink-0"
              >
                <span className="font-sans text-[11px] text-zinc-400 font-medium">Police</span>
                <span className="font-mono">15</span>
              </a>

              <a
                href="tel:1030"
                className="hidden lg:inline-flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold px-2 py-0.5 rounded border border-zinc-700 transition shrink-0"
              >
                <span className="font-sans text-[11px] text-zinc-400 font-medium">NDMA</span>
                <span className="font-mono">1030</span>
              </a>
            </div>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setShowHelplineDropdown(!showHelplineDropdown)}
              className="text-[11px] font-bold text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-2 py-0.5 rounded flex items-center gap-1 border border-zinc-700 transition"
            >
              <Phone className="w-3 h-3 text-red-500" />
              <span>Directory</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showHelplineDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-2.5 z-50 text-zinc-950 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-zinc-500 px-2 py-1 border-b border-zinc-100 mb-1">
                  <span>Pakistan Helplines</span>
                  <span className="font-mono text-red-600">Free 24/7</span>
                </div>
                <div className="space-y-1">
                  {PAKISTAN_HELPLINES.map((h) => (
                    <div
                      key={h.number}
                      className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-xl transition"
                    >
                      <div>
                        <div className="font-bold text-xs text-zinc-950">{h.name}</div>
                        <div className="text-[10px] text-zinc-500">{h.coverage}</div>
                      </div>
                      <a
                        href={`tel:${h.number}`}
                        className="bg-red-600 hover:bg-red-700 text-white font-mono font-bold px-2.5 py-1 rounded-lg text-xs shadow-xs transition"
                      >
                        {h.number}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/25 shrink-0">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight text-zinc-950">
                RescueLink <span className="text-red-600">AI</span>
              </span>
              <span className="text-[10px] font-mono tracking-wider text-black uppercase bg-zinc-100 px-1.5 py-0.5 rounded font-black border border-zinc-200">
                Pakistan
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 hidden sm:block">
              Emergency Guidance & Dispatch Coordination Platform
            </p>
          </div>
        </div>

        {/* Action Controls & PRD Demo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PRD Demo Walkthrough Trigger */}
          <button
            onClick={onOpenDemoModal}
            className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 text-white font-black text-xs px-3 sm:px-4 py-2 rounded-xl shadow-xs transition active:scale-95"
            title="Load Section 30 PRD Demo Scenario"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span className="hidden sm:inline">PRD Walkthrough</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center bg-zinc-100 rounded-xl p-0.5 border border-zinc-200 text-xs">
            {(['English', 'Urdu', 'Roman Urdu'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  selectedLanguage === lang
                    ? 'bg-black text-white shadow-xs'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                {lang === 'Urdu' ? 'اردو' : lang === 'Roman Urdu' ? 'Roman' : 'EN'}
              </button>
            ))}
          </div>

          {/* Mobile Role Switcher Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-zinc-900 hover:text-black bg-zinc-100 rounded-xl border border-zinc-200"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Role Navigation Bar */}
      <div className="hidden sm:block border-t border-zinc-100 bg-zinc-50 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-2 py-1.5">
          <nav className="flex space-x-1.5">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setCurrentRole(r.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-500' : 'text-zinc-500'}`} />
                  <span>{r.label}</span>
                  {r.count !== undefined && r.count > 0 && (
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        isActive ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {r.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>National Emergency Grid: Online</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer when toggled */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-zinc-200 bg-white p-3 space-y-1.5 shadow-xl animate-in slide-in-from-top-2">
          <div className="text-[10px] font-mono text-zinc-400 uppercase px-2 mb-1 font-bold">
            Switch Interface
          </div>
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setCurrentRole(r.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive ? 'bg-black text-white' : 'text-zinc-800 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-500' : 'text-zinc-500'}`} />
                  <span>{r.label}</span>
                </div>
                {r.count !== undefined && r.count > 0 && (
                  <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {r.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
