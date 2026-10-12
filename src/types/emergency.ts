/**
 * RescueLink AI - Core Data Model & Types
 * Compliant with RescueLink AI PRD and Architecture Specification (Version 1.0)
 */

export type UserRole = 'citizen' | 'dispatcher' | 'responder' | 'admin' | 'auditor';

export type CaseStatus =
  | 'NEW'
  | 'AI_DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'RESOLVED'
  | 'DUPLICATE'
  | 'REJECTED'
  | 'CANCELLED'
  | 'UNABLE_TO_VERIFY'
  | 'ESCALATED';

export type UnitStatus =
  | 'OFFLINE'
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'AT_SCENE'
  | 'TRANSPORTING'
  | 'NEEDS_SUPPORT';

export type LocationFreshness = 'LIVE' | 'STALE' | 'OFFLINE';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentCategory =
  | 'flood'
  | 'medical'
  | 'accident'
  | 'fire'
  | 'collapse'
  | 'trapped'
  | 'missing'
  | 'shelter'
  | 'relief'
  | 'other';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  address?: string;
  district?: string;
  landmark?: string;
  recordedAt: string;
}

export interface CasePersonInfo {
  count: number;
  vulnerableCategories: string[];
  injurySummary?: string;
}

export interface AIExtractionResult {
  language: 'English' | 'Urdu' | 'Roman Urdu';
  category: IncidentCategory;
  priority: PriorityLevel;
  confidenceScore: number;
  locationName: string;
  district: string;
  landmark: string;
  peopleCount: number;
  vulnerableGroups: string[];
  injurySummary: string;
  hazards: string[];
  immediateNeeds: string[];
  recommendedOrg: string;
  recommendedUnitType: string;
  englishTranslation: string;
  aiReasoning: string;
  assistantReply: string;
  safetyGuidance: string[];
  requiresHumanEscalation: boolean;
  suggestedFollowUps?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'citizen' | 'ai' | 'dispatcher' | 'system';
  body: string;
  language?: 'English' | 'Urdu' | 'Roman Urdu';
  timestamp: string;
  audioSimulation?: boolean;
}

export interface RescueUnit {
  id: string;
  organizationId: string;
  organizationName: string;
  type: string; // 'Ambulance Type A' | 'Flood Rescue Boat' | 'Fire Tender' | 'Urban Rescue'
  callSign: string;
  contactNumber: string;
  capabilities: string[];
  status: UnitStatus;
  serviceArea: string;
  currentLocation: LocationCoordinates;
  lastHeartbeat: string;
  batteryLevel?: number;
  assignedCaseId?: string;
}

export interface EmergencyCase {
  id: string;
  reporterName: string;
  callbackPhone: string;
  language: 'English' | 'Urdu' | 'Roman Urdu';
  category: IncidentCategory;
  priority: PriorityLevel;
  status: CaseStatus;
  confidenceScore: number;
  location: LocationCoordinates;
  description: string;
  translatedDescription?: string;
  peopleInfo: CasePersonInfo;
  hazards: string[];
  immediateNeeds: string[];
  aiExtraction?: AIExtractionResult;
  assignedUnitId?: string;
  assignedUnit?: RescueUnit;
  assignedBy?: string;
  assignedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  onTheWayAt?: string;
  arrivedAt?: string;
  resolvedAt?: string;
  outcomeCode?: string;
  responseNotes?: string;
  chatHistory: ChatMessage[];
  locationHistory: LocationCoordinates[];
  createdAt: string;
  updatedAt: string;
  isDuplicateOf?: string;
  duplicateCandidateIds?: string[];
}

export interface VerifiedResource {
  id: string;
  name: string;
  type: 'hospital' | 'rescue_station' | 'relief_shelter' | 'blood_bank' | 'ngo_depot';
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  contactPerson?: string;
  capacityTotal?: number;
  capacityAvailable?: number;
  icuBeds?: number;
  oxygenAvailable?: boolean;
  boatsAvailable?: number;
  status: 'active' | 'limited' | 'full';
  verifiedAt: string;
  verifiedBy: string;
}

export interface RoadClosureHazard {
  id: string;
  title: string;
  type: 'flood_inundation' | 'bridge_collapse' | 'landslide' | 'debris';
  district: string;
  description: string;
  latitude: number;
  longitude: number;
  severity: 'blocked' | 'caution';
  reportedAt: string;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorRole: UserRole | 'system';
  action: string;
  entityType: 'case' | 'assignment' | 'unit' | 'organization' | 'location';
  entityId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}
