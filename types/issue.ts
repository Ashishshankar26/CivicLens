export type IssueCategory =
  | 'pothole'
  | 'garbage'
  | 'streetlight'
  | 'road_damage'
  | 'other';

export type IssueSeverity = 'low' | 'medium' | 'high';

export type IssueStatus = 'active' | 'resolved';

export type RoadType = 'highway' | 'main_road' | 'local_street';
export type TrafficLevel = 'low' | 'medium' | 'heavy';
export type RoadCondition = 'dry' | 'water_filled' | 'poor_visibility';

export interface IssueTimelineStep {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
}

export interface CivicIssue {
  id: string;
  category: IssueCategory;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  locationName: string;
  severity: IssueSeverity;
  status: IssueStatus;
  reportedBy: string;
  reporterName: string;
  createdAt: string;
  updatedAt: string;
  confirmationCount: number;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedImageUrl?: string;
  aiSuggestedCategory?: IssueCategory;
  aiConfidence?: number;
  
  // CivicLens 2.0 Smart Priority & Enhanced Attributes
  priorityScore?: number; // 0 to 100
  priorityTier?: 'Critical / Urgent' | 'High Priority' | 'Moderate Priority' | 'Low Priority';
  impactFactors?: string[]; // e.g. ['vehicle_damage', 'two_wheeler_danger']
  roadType?: RoadType;
  trafficLevel?: TrafficLevel;
  roadCondition?: RoadCondition;
  gettingWorseCount?: number;
  repairedVotesCount?: number;
  timeline?: IssueTimelineStep[];
}

export interface CreateIssueInput {
  category: IssueCategory;
  description: string;
  imageUri: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  severity: IssueSeverity;
  aiSuggestedCategory?: IssueCategory;
  aiConfidence?: number;
  impactFactors?: string[];
  roadType?: RoadType;
  trafficLevel?: TrafficLevel;
  roadCondition?: RoadCondition;
}

export interface NearbyDuplicate {
  issue: CivicIssue;
  distanceMeters: number;
}
