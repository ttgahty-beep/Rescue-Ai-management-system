import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationCoordinates, RescueUnit } from '../../types/emergency';
import { Layers, Check, Globe, Satellite, Moon, Map as MapIcon, KeyRound, X, RefreshCw } from 'lucide-react';

interface EmergencyMapProps {
  center: [number, number];
  zoom?: number;
  incidentLocation?: LocationCoordinates;
  assignedUnit?: RescueUnit;
  unitLocation?: LocationCoordinates;
  isStale?: boolean;
  allUnits?: RescueUnit[];
  nearbyResources?: Array<{
    id: string;
    name: string;
    type: string;
    latitude: number;
    longitude: number;
  }>;
  hazardZones?: Array<{
    id: string;
    title: string;
    latitude: number;
    longitude: number;
    severity: string;
  }>;
  onSelectIncidentLocation?: (coords: { lat: number; lng: number }) => void;
  interactiveSelect?: boolean;
  className?: string;
}

type MapStyleType = 'voyager' | 'dark' | 'satellite' | 'osm';

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  center,
  zoom = 13,
  incidentLocation,
  assignedUnit,
  unitLocation,
  isStale = false,
  allUnits = [],
  nearbyResources = [],
  hazardZones = [],
  onSelectIncidentLocation,
  interactiveSelect = false,
  className = 'h-[300px] sm:h-[400px] lg:h-[450px] w-full rounded-2xl',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyleType>('voyager');
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Retrieve API key from environment or localStorage
  const envKey = (import.meta.env.VITE_BASEMAPS_API_KEY as string) || '';
  const [localKey, setLocalKey] = useState<string>(() => {
    return localStorage.getItem('basemaps_api_key') || envKey || '';
  });
  const [keyInput, setKeyInput] = useState(localKey);
  const [keySavedToast, setKeySavedToast] = useState(false);

  const effectiveKey = localKey || envKey;

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    setLocalKey(trimmed);
    localStorage.setItem('basemaps_api_key', trimmed);
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 3000);
    // Reload current tile layer with new key
    setTileLayer(mapStyle, trimmed);
  };

  const getTileConfig = (style: MapStyleType, apiKey: string) => {
    if (style === 'satellite') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 19,
        subdomains: undefined,
        attribution: 'ESRI World Imagery',
      };
    }
    if (style === 'osm') {
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        maxZoom: 19,
        subdomains: 'abc',
        attribution: 'OpenStreetMap',
      };
    }
    if (style === 'dark') {
      const url = apiKey
        ? `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?api_key=${encodeURIComponent(
            apiKey
          )}`
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png';
      return {
        url,
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: 'CARTO Dark Matter',
      };
    }
    // Default: voyager (White / Light theme)
    const url = apiKey
      ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=${encodeURIComponent(
          apiKey
        )}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    return {
      url,
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: 'CARTO Voyager',
    };
  };

  // Switch or initialize Tile Layer
  const setTileLayer = (style: MapStyleType, customKey?: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const keyToUse = customKey !== undefined ? customKey : effectiveKey;
    const config = getTileConfig(style, keyToUse);
    const newLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || 'abc',
      attribution: config.attribution,
    });

    // Graceful fallback to OSM on tile error
    newLayer.on('tileerror', () => {
      console.warn('Basemap tile issue detected, verifying fallback routing');
    });

    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Add Tile Layer
      setTileLayer(mapStyle);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      if (interactiveSelect && onSelectIncidentLocation) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onSelectIncidentLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }
    }
  }, []);

  // Handle Map Style Switch
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTileLayer(mapStyle);
    }
  }, [mapStyle, effectiveKey]);

  // Update center/zoom if center prop changes significantly
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center[0], center[1], zoom]);

  // Update Markers, Route, and Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    // 1. Incident Marker (High contrast Red with beacon animation)
    if (incidentLocation && incidentLocation.latitude && incidentLocation.longitude) {
      const incidentIcon = L.divIcon({
        className: 'custom-incident-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-10 h-10 bg-red-600/30 rounded-full animate-ping"></div>
            <div class="w-8 h-8 bg-red-600 border-2 border-white text-white rounded-full flex items-center justify-center shadow-lg font-bold text-xs">
              🚨
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const incidentMarker = L.marker([incidentLocation.latitude, incidentLocation.longitude], {
        icon: incidentIcon,
      }).addTo(layer);

      incidentMarker.bindPopup(`
        <div class="p-2 text-zinc-950 font-sans">
          <div class="font-black text-red-600 flex items-center gap-1.5 text-xs uppercase tracking-wider">
            <span>●</span> Emergency Incident
          </div>
          <div class="text-xs font-bold mt-1 text-zinc-900">${incidentLocation.landmark || incidentLocation.address || 'Reported Location'}</div>
          <div class="text-[11px] text-zinc-600 mt-0.5">${incidentLocation.district || 'Pakistan'}</div>
          <div class="text-[10px] text-zinc-400 mt-1 font-mono">${incidentLocation.latitude.toFixed(4)}, ${incidentLocation.longitude.toFixed(4)}</div>
        </div>
      `);
    }

    // 2. Assigned Unit Marker (with Stale Indicator if stale)
    const activeUnitLoc = unitLocation || assignedUnit?.currentLocation;
    if (activeUnitLoc && activeUnitLoc.latitude && activeUnitLoc.longitude) {
      const isBoat = assignedUnit?.type.toLowerCase().includes('boat');
      const isFire = assignedUnit?.type.toLowerCase().includes('fire');
      const unitIconText = isBoat ? '🚤' : isFire ? '🚒' : '🚑';

      const unitIcon = L.divIcon({
        className: 'custom-unit-marker',
        html: `
          <div class="relative flex items-center justify-center">
            ${isStale ? '<div class="absolute -top-6 bg-amber-500 text-black font-mono font-bold px-1.5 py-0.5 rounded text-[9px] shadow animate-bounce">STALE GPS</div>' : '<div class="absolute w-10 h-10 bg-emerald-500/30 rounded-full animate-pulse"></div>'}
            <div class="w-9 h-9 ${isStale ? 'bg-amber-600 border-amber-300' : 'bg-black border-2 border-white'} text-white rounded-full flex items-center justify-center shadow-xl font-bold text-sm">
              ${unitIconText}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const unitMarker = L.marker([activeUnitLoc.latitude, activeUnitLoc.longitude], {
        icon: unitIcon,
      }).addTo(layer);

      unitMarker.bindPopup(`
        <div class="p-2 text-zinc-950 font-sans">
          <div class="font-black text-zinc-950 flex items-center justify-between gap-2 text-xs">
            <span>${assignedUnit?.callSign || 'Rescue Unit'}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded font-mono ${isStale ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'} font-bold">
              ${isStale ? 'STALE' : 'LIVE'}
            </span>
          </div>
          <div class="text-[11px] text-zinc-600 mt-1">${assignedUnit?.organizationName || 'Rescue 1122'} · ${assignedUnit?.type || 'Ambulance'}</div>
          <div class="text-[10px] text-zinc-500 mt-1 font-mono">
            Speed: ${activeUnitLoc.speed || 0} km/h · Battery: ${assignedUnit?.batteryLevel || 100}%
          </div>
        </div>
      `);
    }

    // 3. Connect route polyline if both incident and assigned unit locations exist
    if (
      incidentLocation &&
      incidentLocation.latitude &&
      incidentLocation.longitude &&
      activeUnitLoc &&
      activeUnitLoc.latitude &&
      activeUnitLoc.longitude
    ) {
      const routePoints: [number, number][] = [
        [activeUnitLoc.latitude, activeUnitLoc.longitude],
        [
          (activeUnitLoc.latitude + incidentLocation.latitude) / 2 + 0.003,
          (activeUnitLoc.longitude + incidentLocation.longitude) / 2 - 0.002,
        ],
        [incidentLocation.latitude, incidentLocation.longitude],
      ];

      const polyline = L.polyline(routePoints, {
        color: '#dc2626',
        weight: 4,
        opacity: 0.9,
        dashArray: '6, 8',
      }).addTo(map);

      routePolylineRef.current = polyline;
    }

    // 4. Render Other Standby Units
    allUnits.forEach((unit) => {
      if (unit.id === assignedUnit?.id) return;
      const isBoat = unit.type.toLowerCase().includes('boat');
      const isFire = unit.type.toLowerCase().includes('fire');
      const unitIconText = isBoat ? '🚤' : isFire ? '🚒' : '🚑';

      const icon = L.divIcon({
        className: 'unit-marker-standby',
        html: `
          <div class="w-7 h-7 bg-white text-zinc-900 border-2 border-zinc-400 rounded-full flex items-center justify-center text-xs shadow-md opacity-85 hover:opacity-100 hover:scale-110 transition">
            ${unitIconText}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const m = L.marker([unit.currentLocation.latitude, unit.currentLocation.longitude], {
        icon,
      }).addTo(layer);

      m.bindPopup(`
        <div class="p-1.5 text-zinc-950 font-sans">
          <div class="font-bold text-xs">${unit.callSign} (${unit.organizationName})</div>
          <div class="text-[11px] text-zinc-600">${unit.serviceArea} · Status: <span class="font-bold text-emerald-700">${unit.status}</span></div>
        </div>
      `);
    });

    // 5. Render Verified Facilities / Hospitals
    nearbyResources.forEach((res) => {
      const isHosp = res.type === 'hospital';
      const icon = L.divIcon({
        className: 'resource-marker',
        html: `
          <div class="w-6 h-6 ${isHosp ? 'bg-red-600 text-white' : 'bg-black text-white'} rounded-md flex items-center justify-center text-[10px] font-black shadow-md border border-white">
            ${isHosp ? 'H' : '⛺'}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const m = L.marker([res.latitude, res.longitude], { icon }).addTo(layer);
      m.bindPopup(`
        <div class="p-1.5 text-zinc-950 font-sans">
          <div class="font-bold text-xs">${res.name}</div>
          <div class="text-[11px] text-zinc-600">${res.type.toUpperCase()}</div>
        </div>
      `);
    });

    // 6. Hazard / Flood Zones
    hazardZones.forEach((hz) => {
      const circle = L.circle([hz.latitude, hz.longitude], {
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.22,
        radius: 700,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(layer);

      circle.bindPopup(`
        <div class="p-1.5 text-zinc-950 font-sans">
          <div class="font-bold text-red-600 text-xs flex items-center gap-1">⚠️ Hazard Zone</div>
          <div class="text-xs font-bold mt-0.5">${hz.title}</div>
          <div class="text-[10px] text-zinc-500 font-mono mt-0.5">Severity: ${hz.severity}</div>
        </div>
      `);
    });
  }, [
    incidentLocation,
    assignedUnit,
    unitLocation,
    isStale,
    allUnits,
    nearbyResources,
    hazardZones,
  ]);

  return (
    <div className={`relative overflow-hidden border border-zinc-200 shadow-sm bg-zinc-50 ${className}`}>
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: Interactive Incident Pinning Instruction */}
      {interactiveSelect && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-zinc-200 text-zinc-900 text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span className="font-bold text-xs">Tap map to set exact emergency coordinates</span>
        </div>
      )}

      {/* Top Right: Trending High-Contrast Basemap Selector */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-1.5">
        <div className="bg-white/95 backdrop-blur-md border border-zinc-200 p-1 rounded-xl shadow-md flex items-center gap-1">
          <button
            onClick={() => setMapStyle('voyager')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              mapStyle === 'voyager'
                ? 'bg-black text-white shadow-xs'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
            }`}
            title="CARTO Voyager - Clean white road network"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voyager</span>
          </button>

          <button
            onClick={() => setMapStyle('satellite')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              mapStyle === 'satellite'
                ? 'bg-black text-white shadow-xs'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
            }`}
            title="High-Resolution Satellite - River terrain & flood inundation"
          >
            <Satellite className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Satellite</span>
          </button>

          <button
            onClick={() => setMapStyle('dark')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
              mapStyle === 'dark'
                ? 'bg-black text-white shadow-xs'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
            }`}
            title="CARTO Dark Matter"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dark</span>
          </button>

          <button
            onClick={() => setMapStyle('osm')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition ${
              mapStyle === 'osm'
                ? 'bg-black text-white shadow-xs'
                : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
            }`}
            title="OpenStreetMap Standard"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">OSM</span>
          </button>
        </div>
      </div>

      {/* Bottom Right: Basemaps API Key Status & Key Manager Trigger */}
      <div className="absolute bottom-3 right-3 z-[1000]">
        <button
          onClick={() => setShowKeyModal(true)}
          className="bg-white/95 hover:bg-white backdrop-blur-md border border-zinc-200 hover:border-zinc-300 text-zinc-900 text-xs px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 font-bold transition group"
          title="Click to manage Basemaps API Key"
        >
          {effectiveKey ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <KeyRound className="w-3.5 h-3.5 text-zinc-700 group-hover:text-black" />
              <span className="font-mono text-[11px]">
                Basemap Key: {effectiveKey.slice(0, 5)}...{effectiveKey.slice(-3)}
              </span>
            </>
          ) : (
            <>
              <KeyRound className="w-3.5 h-3.5 text-red-600" />
              <span className="text-[11px] font-sans">Basemaps API Key</span>
            </>
          )}
        </button>
      </div>

      {/* Basemaps API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                  <KeyRound className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-950">Basemaps API Key</h3>
                  <p className="text-[11px] text-zinc-500">Configure custom map tiles & vector credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-zinc-400 hover:text-black p-1 rounded-lg hover:bg-zinc-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-800 mb-1">
                  API Key / Token (CARTO, Mapbox, Stadia, etc.)
                </label>
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Paste your basemaps API key here..."
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-red-600 rounded-xl px-3 py-2.5 text-xs font-mono text-zinc-900 focus:outline-none transition"
                />
              </div>

              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 space-y-1.5 text-[11px] text-zinc-600">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">Environment Key:</span>
                  <span className="font-mono font-bold text-zinc-800">
                    {envKey ? `${envKey.slice(0, 6)}... (Active)` : 'Not detected in env'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">Local Override:</span>
                  <span className="font-mono font-bold text-zinc-800">
                    {localKey ? 'Saved in LocalStorage' : 'None'}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-200">
                  Tip: Supports CARTO Voyager, Dark Matter, and fallback to OpenStreetMap.
                </p>
              </div>

              {keySavedToast && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Basemap API key updated successfully! Map refreshed.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition"
              >
                Close
              </button>
              <button
                onClick={handleSaveKey}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-black hover:bg-zinc-800 text-white transition shadow-xs"
              >
                Apply & Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
