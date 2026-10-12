import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import {
  Hospital,
  Shield,
  Building,
  Phone,
  CheckCircle,
  Search,
  Filter,
  ExternalLink,
  MapPin,
  Bed,
  Activity,
} from 'lucide-react';
import { PAKISTAN_HELPLINES } from '../../data/mockData';

export const CitizenDirectoryView: React.FC = () => {
  const { resources, roadHazards } = useEmergency();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === 'All' || res.district === selectedDistrict;
    const matchesType = selectedType === 'All' || res.type === selectedType;
    return matchesSearch && matchesDistrict && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Directory Intro Banner */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
            <Hospital className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-zinc-950">
              Verified Emergency Directory & Live Facility Bed Capacity
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Audited directory of public emergency hospitals, Rescue 1122 stations & PDMA flood relief camps across Pakistan.
            </p>
          </div>
        </div>

        {/* National Helplines Quick Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-zinc-100">
          {PAKISTAN_HELPLINES.map((h) => (
            <a
              key={h.number}
              href={`tel:${h.number}`}
              className="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 rounded-2xl p-2.5 transition flex flex-col justify-between group shadow-xs active:scale-95"
            >
              <div>
                <div className="font-mono text-sm font-black text-red-600 group-hover:text-red-700">
                  {h.number}
                </div>
                <div className="text-[11px] font-bold text-zinc-900 line-clamp-1 mt-0.5">{h.name}</div>
              </div>
              <div className="text-[10px] text-zinc-500 mt-1 font-mono">24/7 Toll-Free</div>
            </a>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals, trauma centers, relief shelters..."
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-red-600 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-900 focus:outline-none transition font-medium"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-red-600"
          >
            <option value="All">All Districts</option>
            <option value="Lahore">Lahore</option>
            <option value="Karachi">Karachi</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Peshawar">Peshawar</option>
            <option value="Sukkur">Sukkur</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-red-600"
          >
            <option value="All">All Facility Types</option>
            <option value="hospital">Hospitals & Trauma Centers</option>
            <option value="rescue_station">Rescue 1122 Stations</option>
            <option value="relief_shelter">Flood Relief Camps</option>
          </select>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => {
          const isHosp = res.type === 'hospital';
          const isCamp = res.type === 'relief_shelter';

          return (
            <div
              key={res.id}
              className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        isHosp
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : isCamp
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-zinc-100 text-zinc-900 border border-zinc-200'
                      }`}
                    >
                      {isHosp ? 'H' : isCamp ? '⛺' : '🚑'}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-black tracking-wider text-zinc-500">
                        {res.type.replace('_', ' ')}
                      </span>
                      <h3 className="font-black text-sm text-zinc-950 group-hover:text-red-600 transition">
                        {res.name}
                      </h3>
                    </div>
                  </div>

                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[10px] font-black px-2 py-0.5 rounded">
                    VERIFIED
                  </span>
                </div>

                <div className="text-xs text-zinc-600 space-y-1 mt-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{res.address}, {res.district}</span>
                  </div>

                  {res.capacityTotal !== undefined && (
                    <div className="flex items-center gap-2 pt-1 font-mono text-[11px]">
                      <span className="text-zinc-500">Capacity:</span>
                      <span className="font-black text-emerald-700">{res.capacityAvailable ?? 0} Available</span>
                      <span className="text-zinc-400">/ {res.capacityTotal} Total</span>
                    </div>
                  )}

                  {res.icuBeds !== undefined && (
                    <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                      <span className="text-zinc-500">ICU / Trauma Beds:</span>
                      <span className="font-mono font-black text-red-600">
                        {res.icuBeds} beds
                      </span>
                    </div>
                  )}

                  {res.boatsAvailable !== undefined && res.boatsAvailable > 0 && (
                    <div className="flex items-center gap-2 pt-1 font-mono text-[11px]">
                      <span className="text-zinc-500">Rescue Boats:</span>
                      <span className="font-bold text-zinc-900">
                        {res.boatsAvailable} In-Service
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${res.phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5 text-red-500" />
                  <span>Call {res.phone}</span>
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText?.(`${res.latitude}, ${res.longitude}`);
                  }}
                  title="Copy GPS coordinates"
                  className="p-2.5 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-xl border border-zinc-200 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
