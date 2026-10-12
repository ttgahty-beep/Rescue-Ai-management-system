import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  EmergencyCase,
  RescueUnit,
  VerifiedResource,
  RoadClosureHazard,
  AuditEvent,
  UserRole,
  AIExtractionResult,
  UnitStatus,
  LocationCoordinates,
} from '../types/emergency';
import {
  INITIAL_RESCUE_UNITS,
  VERIFIED_RESOURCES,
  ROAD_CLOSURES,
  PRD_DEMO_CASE,
  INITIAL_AUDIT_EVENTS,
} from '../data/mockData';
import { fallbackEmergencyTriage } from '../server/geminiService';

interface EmergencyContextType {
  cases: EmergencyCase[];
  activeCaseId: string | null;
  activeCase: EmergencyCase | undefined;
  units: RescueUnit[];
  resources: VerifiedResource[];
  roadHazards: RoadClosureHazard[];
  auditEvents: AuditEvent[];
  currentRole: UserRole;
  selectedLanguage: 'English' | 'Urdu' | 'Roman Urdu';
  isSimulatingTelemetry: boolean;
  isStaleGPS: boolean;
  isOfflineMode: boolean;
  offlineQueueCount: number;
  simulationStep: number;

  setCurrentRole: (role: UserRole) => void;
  setSelectedLanguage: (lang: 'English' | 'Urdu' | 'Roman Urdu') => void;
  setActiveCaseId: (id: string | null) => void;
  createEmergencyCase: (data: Partial<EmergencyCase>) => Promise<EmergencyCase>;
  updateCase: (caseId: string, updates: Partial<EmergencyCase>) => void;
  processAIMessage: (
    userMessage: string,
    caseId?: string,
    location?: { district?: string; landmark?: string; latitude?: number; longitude?: number }
  ) => Promise<{ extraction: AIExtractionResult; reply: string }>;
  verifyCase: (caseId: string, dispatcherName?: string) => void;
  assignUnitToCase: (caseId: string, unitId: string, assignedBy?: string) => void;
  updateUnitStatus: (unitId: string, status: UnitStatus) => void;
  updateUnitLocation: (unitId: string, coords: LocationCoordinates) => void;
  closeCase: (caseId: string, outcomeCode: string, responseNotes: string) => void;
  addChatMessage: (
    caseId: string,
    message: { sender: 'citizen' | 'ai' | 'dispatcher' | 'system'; body: string; language?: any }
  ) => void;
  logAuditEvent: (
    action: string,
    entityType: 'case' | 'assignment' | 'unit' | 'organization' | 'location',
    entityId: string,
    metadata?: Record<string, any>
  ) => void;
  loadPRDDemoScenario: () => void;
  startTelemetrySimulation: () => void;
  stopTelemetrySimulation: () => void;
  toggleStaleGPS: () => void;
  toggleOfflineMode: () => void;
  syncOfflineQueue: () => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

const STORAGE_KEY_CASES = 'rescuelink_cases_v1';
const STORAGE_KEY_AUDIT = 'rescuelink_audit_v1';

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from LocalStorage if available
  const [cases, setCases] = useState<EmergencyCase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CASES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [PRD_DEMO_CASE];
  });

  const [activeCaseId, setActiveCaseId] = useState<string | null>(PRD_DEMO_CASE.id);
  const [units, setUnits] = useState<RescueUnit[]>(INITIAL_RESCUE_UNITS);
  const [resources] = useState<VerifiedResource[]>(VERIFIED_RESOURCES);
  const [roadHazards] = useState<RoadClosureHazard[]>(ROAD_CLOSURES);

  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_AUDIT_EVENTS;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Urdu' | 'Roman Urdu'>('Roman Urdu');

  // Telemetry Simulation State
  const [isSimulatingTelemetry, setIsSimulatingTelemetry] = useState<boolean>(false);
  const [isStaleGPS, setIsStaleGPS] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<LocationCoordinates[]>([]);
  const [simulationStep, setSimulationStep] = useState<number>(0);

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0];

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(cases));
    } catch (e) {
      console.error(e);
    }
  }, [cases]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditEvents));
    } catch (e) {
      console.error(e);
    }
  }, [auditEvents]);

  // Append-only audit logger
  const logAuditEvent = (
    action: string,
    entityType: 'case' | 'assignment' | 'unit' | 'organization' | 'location',
    entityId: string,
    metadata?: Record<string, any>
  ) => {
    const event: AuditEvent = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorId: currentRole === 'citizen' ? 'citizen-user' : `${currentRole}-operator`,
      actorRole: currentRole,
      action,
      entityType,
      entityId,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    };
    setAuditEvents((prev) => [event, ...prev]);
  };

  // Add chat message to a case
  const addChatMessage = (
    caseId: string,
    message: { sender: 'citizen' | 'ai' | 'dispatcher' | 'system'; body: string; language?: any }
  ) => {
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      sender: message.sender,
      body: message.body,
      language: message.language || selectedLanguage,
      timestamp: new Date().toISOString(),
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            chatHistory: [...c.chatHistory, newMsg],
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );
  };

  // Process message through Server-Side Gemini API Proxy (/api/ai/process)
  const processAIMessage = async (
    userMessage: string,
    caseId?: string,
    location?: { district?: string; landmark?: string; latitude?: number; longitude?: number }
  ): Promise<{ extraction: AIExtractionResult; reply: string }> => {
    const currentCase = caseId ? cases.find((c) => c.id === caseId) : undefined;
    const history = currentCase?.chatHistory.map((m) => ({ sender: m.sender, body: m.body })) || [];

    let extraction: AIExtractionResult;

    try {
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage,
          languagePreference: selectedLanguage,
          conversationHistory: history,
          userLocation: location || currentCase?.location,
        }),
      });

      if (response.ok) {
        extraction = await response.json();
      } else {
        extraction = fallbackEmergencyTriage(userMessage, location || currentCase?.location);
      }
    } catch (err) {
      console.warn('Network call failed, using deterministic local engine:', err);
      extraction = fallbackEmergencyTriage(userMessage, location || currentCase?.location);
    }

    if (caseId) {
      setCases((prev) =>
        prev.map((c) => {
          if (c.id === caseId) {
            return {
              ...c,
              aiExtraction: extraction,
              category: extraction.category,
              priority: extraction.priority,
              confidenceScore: extraction.confidenceScore,
              peopleInfo: {
                count: extraction.peopleCount,
                vulnerableCategories: extraction.vulnerableGroups,
                injurySummary: extraction.injurySummary,
              },
              hazards: extraction.hazards,
              immediateNeeds: extraction.immediateNeeds,
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        })
      );
    }

    logAuditEvent('AI_EXTRACTED_AND_CLASSIFIED', 'case', caseId || 'draft', {
      category: extraction.category,
      priority: extraction.priority,
      confidenceScore: extraction.confidenceScore,
      language: extraction.language,
      requiresEscalation: extraction.requiresHumanEscalation,
    });

    return { extraction, reply: extraction.assistantReply };
  };

  // Create an Emergency Case
  const createEmergencyCase = async (data: Partial<EmergencyCase>): Promise<EmergencyCase> => {
    const newId = `RL-PK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCase: EmergencyCase = {
      id: newId,
      reporterName: data.reporterName || 'Citizen Reporter',
      callbackPhone: data.callbackPhone || '+92 300 0000000',
      language: data.language || selectedLanguage,
      category: data.category || 'other',
      priority: data.priority || 'MEDIUM',
      status: 'SUBMITTED',
      confidenceScore: data.confidenceScore || 90,
      location: data.location || {
        latitude: 31.5204,
        longitude: 74.3587,
        district: 'Lahore',
        address: 'Lahore, Punjab, Pakistan',
        landmark: 'Reported Location',
        recordedAt: new Date().toISOString(),
        accuracy: 10,
      },
      description: data.description || '',
      translatedDescription: data.translatedDescription,
      peopleInfo: data.peopleInfo || {
        count: 1,
        vulnerableCategories: [],
      },
      hazards: data.hazards || [],
      immediateNeeds: data.immediateNeeds || [],
      aiExtraction: data.aiExtraction,
      chatHistory: data.chatHistory || [],
      locationHistory: [
        data.location || {
          latitude: 31.5204,
          longitude: 74.3587,
          recordedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCases((prev) => [newCase, ...prev]);
    setActiveCaseId(newId);

    logAuditEvent('CASE_CREATED', 'case', newId, {
      category: newCase.category,
      priority: newCase.priority,
      district: newCase.location.district,
      reporter: newCase.reporterName,
    });

    return newCase;
  };

  // Update Case
  const updateCase = (caseId: string, updates: Partial<EmergencyCase>) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    logAuditEvent('CASE_UPDATED', 'case', caseId, updates);
  };

  // Dispatcher verifies case (FR-05)
  const verifyCase = (caseId: string, dispatcherName: string = 'Officer Tariq (Rescue 1122 Control)') => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            status: 'VERIFIED',
            verifiedAt: new Date().toISOString(),
            verifiedBy: dispatcherName,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    addChatMessage(caseId, {
      sender: 'dispatcher',
      body: `[DISPATCHER VERIFIED]: Emergency confirmed by ${dispatcherName}. Dispatch priority validated. Preparing unit assignment.`,
    });

    logAuditEvent('CASE_VERIFIED', 'case', caseId, { verifiedBy: dispatcherName });
  };

  // Assign unit to case (FR-05)
  const assignUnitToCase = (
    caseId: string,
    unitId: string,
    assignedBy: string = 'Lead Dispatcher (Punjab Emergency Command)'
  ) => {
    const targetUnit = units.find((u) => u.id === unitId);
    if (!targetUnit) return;

    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === unitId) {
          return {
            ...u,
            status: 'ASSIGNED',
            assignedCaseId: caseId,
          };
        }
        return u;
      })
    );

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            status: 'ASSIGNED',
            assignedUnitId: unitId,
            assignedUnit: { ...targetUnit, status: 'ASSIGNED' },
            assignedBy,
            assignedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    addChatMessage(caseId, {
      sender: 'system',
      body: `Assigned: ${targetUnit.callSign} (${targetUnit.organizationName}). Unit alerted and preparing response.`,
    });

    logAuditEvent('UNIT_ASSIGNED', 'assignment', caseId, {
      unitId,
      unitCallSign: targetUnit.callSign,
      assignedBy,
    });
  };

  // Update Unit Status (FR-06)
  const updateUnitStatus = (unitId: string, status: UnitStatus) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === unitId) {
          return { ...u, status };
        }
        return u;
      })
    );

    // Also update attached case status correspondingly
    setCases((prev) =>
      prev.map((c) => {
        if (c.assignedUnitId === unitId) {
          let newCaseStatus = c.status;
          let extra: any = {};

          if (status === 'EN_ROUTE') {
            newCaseStatus = 'ON_THE_WAY';
            extra.onTheWayAt = new Date().toISOString();
          } else if (status === 'AT_SCENE') {
            newCaseStatus = 'ARRIVED';
            extra.arrivedAt = new Date().toISOString();
          } else if (status === 'AVAILABLE') {
            newCaseStatus = 'RESOLVED';
            extra.resolvedAt = new Date().toISOString();
          }

          return {
            ...c,
            status: newCaseStatus,
            assignedUnit: c.assignedUnit ? { ...c.assignedUnit, status } : undefined,
            ...extra,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    logAuditEvent('UNIT_STATUS_UPDATED', 'unit', unitId, { status });
  };

  // Update Unit Location & Handle Offline Queueing (FR-07, FR-12)
  const updateUnitLocation = (unitId: string, coords: LocationCoordinates) => {
    if (isOfflineMode) {
      // Offline queue simulation
      setOfflineQueue((prev) => [...prev, coords]);
      return;
    }

    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === unitId) {
          return {
            ...u,
            currentLocation: coords,
            lastHeartbeat: new Date().toISOString(),
          };
        }
        return u;
      })
    );

    // Update active case assignedUnit location
    setCases((prev) =>
      prev.map((c) => {
        if (c.assignedUnitId === unitId && c.assignedUnit) {
          return {
            ...c,
            assignedUnit: {
              ...c.assignedUnit,
              currentLocation: coords,
              lastHeartbeat: new Date().toISOString(),
            },
            locationHistory: [...c.locationHistory, coords],
          };
        }
        return c;
      })
    );
  };

  // Close Case
  const closeCase = (caseId: string, outcomeCode: string, responseNotes: string) => {
    const c = cases.find((x) => x.id === caseId);
    if (c?.assignedUnitId) {
      setUnits((prev) =>
        prev.map((u) => {
          if (u.id === c.assignedUnitId) {
            return { ...u, status: 'AVAILABLE', assignedCaseId: undefined };
          }
          return u;
        })
      );
    }

    setCases((prev) =>
      prev.map((item) => {
        if (item.id === caseId) {
          return {
            ...item,
            status: 'RESOLVED',
            outcomeCode,
            responseNotes,
            resolvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    addChatMessage(caseId, {
      sender: 'system',
      body: `[CASE RESOLVED]: Outcome recorded as "${outcomeCode}". Response notes: ${responseNotes}`,
    });

    logAuditEvent('CASE_CLOSED', 'case', caseId, { outcomeCode, responseNotes });
  };

  // Toggle Stale GPS (FR-08)
  const toggleStaleGPS = () => {
    setIsStaleGPS((prev) => !prev);
    logAuditEvent('STALE_GPS_TOGGLED', 'location', activeCase?.assignedUnitId || 'unit-a17', {
      stale: !isStaleGPS,
      threshold: '>30 seconds',
    });
  };

  // Toggle Offline Mode & Sync (FR-12)
  const toggleOfflineMode = () => {
    if (isOfflineMode) {
      syncOfflineQueue();
      setIsOfflineMode(false);
    } else {
      setIsOfflineMode(true);
      logAuditEvent('OFFLINE_MODE_ENABLED', 'unit', activeCase?.assignedUnitId || 'unit-a17');
    }
  };

  const syncOfflineQueue = () => {
    if (offlineQueue.length > 0) {
      const lastPoint = offlineQueue[offlineQueue.length - 1];
      if (activeCase?.assignedUnitId) {
        updateUnitLocation(activeCase.assignedUnitId, lastPoint);
      }
      logAuditEvent('OFFLINE_QUEUE_SYNCED', 'location', activeCase?.assignedUnitId || 'unit-a17', {
        pointsSynced: offlineQueue.length,
        lastTimestamp: lastPoint.recordedAt,
      });
      setOfflineQueue([]);
    }
    setIsOfflineMode(false);
  };

  // Telemetry waypoint runner for Unit A-17 moving toward Shahdara flood victim
  const simulationIntervalRef = useRef<any>(null);

  const startTelemetrySimulation = () => {
    setIsSimulatingTelemetry(true);
    setSimulationStep(0);
    setIsStaleGPS(false);
  };

  const stopTelemetrySimulation = () => {
    setIsSimulatingTelemetry(false);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
  };

  useEffect(() => {
    if (!isSimulatingTelemetry) {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      return;
    }

    const assignedUnitId = activeCase?.assignedUnitId || 'unit-a17';
    const targetIncident = activeCase?.location || PRD_DEMO_CASE.location;

    // Waypoints from Shahdara Base to Incident Location
    const baseLat = 31.6050;
    const baseLng = 74.2880;
    const destLat = targetIncident.latitude;
    const destLng = targetIncident.longitude;

    const totalSteps = 12;

    simulationIntervalRef.current = setInterval(() => {
      setSimulationStep((prevStep) => {
        const nextStep = prevStep + 1;

        if (nextStep > totalSteps) {
          // Arrived at scene!
          updateUnitStatus(assignedUnitId, 'AT_SCENE');
          clearInterval(simulationIntervalRef.current);
          setIsSimulatingTelemetry(false);
          logAuditEvent('UNIT_ARRIVED_AT_SCENE', 'unit', assignedUnitId, { step: nextStep });
          return totalSteps;
        }

        const progress = nextStep / totalSteps;
        const currentLat = baseLat + (destLat - baseLat) * progress;
        const currentLng = baseLng + (destLng - baseLng) * progress;

        const newCoords: LocationCoordinates = {
          latitude: currentLat,
          longitude: currentLng,
          speed: Math.round(28 - progress * 15), // slows down near destination
          accuracy: 4,
          heading: 320,
          district: 'Lahore',
          landmark: progress < 0.5 ? 'Approaching Old Ravi Bridge' : 'Navigating Inundated Shahdara Street',
          recordedAt: new Date().toISOString(),
        };

        updateUnitLocation(assignedUnitId, newCoords);

        // Status triggers along the way
        if (nextStep === 1) {
          updateUnitStatus(assignedUnitId, 'EN_ROUTE');
        } else if (nextStep === 8) {
          addChatMessage(activeCase.id, {
            sender: 'dispatcher',
            body: `[GPS ETA UPDATE]: Unit A-17 is 500m away entering your street. Sound horns and wave visible cloth.`,
          });
        }

        return nextStep;
      });
    }, 2500);

    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, [isSimulatingTelemetry, activeCase?.id]);

  // Load Section 30 PRD Demo Scenario
  const loadPRDDemoScenario = () => {
    setCases((prev) => {
      const filtered = prev.filter((c) => c.id !== PRD_DEMO_CASE.id);
      return [PRD_DEMO_CASE, ...filtered];
    });
    setActiveCaseId(PRD_DEMO_CASE.id);
    setCurrentRole('citizen');
    setSelectedLanguage('Roman Urdu');
    setIsStaleGPS(false);
    setIsSimulatingTelemetry(false);
    setSimulationStep(0);

    logAuditEvent('DEMO_SCENARIO_LOADED', 'case', PRD_DEMO_CASE.id, {
      scenario: 'Section 30 PRD - Shahdara Flood Evacuation (3 trapped, 2 kids + 1 mobility impaired)',
    });
  };

  return (
    <EmergencyContext.Provider
      value={{
        cases,
        activeCaseId,
        activeCase,
        units,
        resources,
        roadHazards,
        auditEvents,
        currentRole,
        selectedLanguage,
        isSimulatingTelemetry,
        isStaleGPS,
        isOfflineMode,
        offlineQueueCount: offlineQueue.length,
        simulationStep,
        setCurrentRole,
        setSelectedLanguage,
        setActiveCaseId,
        createEmergencyCase,
        updateCase,
        processAIMessage,
        verifyCase,
        assignUnitToCase,
        updateUnitStatus,
        updateUnitLocation,
        closeCase,
        addChatMessage,
        logAuditEvent,
        loadPRDDemoScenario,
        startTelemetrySimulation,
        stopTelemetrySimulation,
        toggleStaleGPS,
        toggleOfflineMode,
        syncOfflineQueue,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
