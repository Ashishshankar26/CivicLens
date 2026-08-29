export type CitizenLevel = 1 | 2 | 3 | 4 | 5;

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  category: 'reporting' | 'verification' | 'resolution' | 'reputation' | 'streak' | 'scouting';
  requiredCount?: number;
  currentCount?: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  rewardTitle?: string;
}

export interface UserActivityLog {
  id: string;
  action: 'submit_report' | 'community_confirm' | 'getting_worse' | 'issue_resolved';
  category: string;
  title: string;
  timestamp: string; // ISO date string
  locationName: string;
}

export interface UserPrivacySettings {
  anonymousReporting: boolean; // Hide real name on public map markers
  locationJitter: boolean;     // Add ±50m privacy fuzzing to residential reports
  biometricLock: boolean;      // Require device biometric/passcode on open
  shareTelemetry: boolean;     // Share anonymized community road safety analytics
}

export interface UserReputation {
  points?: number;
  xp?: number;
  nextLevelXp?: number;
  level: CitizenLevel;
  levelTitle: string;
  trustScore: number; // 0 to 100
  trustTier: 'Verified Guardian' | 'Active Citizen' | 'Community Contributor' | 'New Scout' | 'Trusted Citizen' | 'Active Contributor';
  streakDays: number;
  streakWeeks: number;
  activeDaysThisWeek: string[]; // e.g. ['Mon', 'Wed', 'Fri']
  reportsCount: number;
  confirmationsCount: number;
  resolvedCount: number;
  impactRadiusKm: number; // e.g. 5.2 km²
  badges: Badge[];
  activityLogs: UserActivityLog[];
  privacySettings: UserPrivacySettings;
}

export interface LeaderboardUser {
  id: string;
  displayName: string;
  points: number;
  level: CitizenLevel;
  levelTitle: string;
  trustScore: number;
  streakWeeks: number;
  rank: number;
  reportsCount: number;
  resolvedCount: number;
  isCurrentUser?: boolean;
}

export interface PriorityBreakdown {
  total: number;
  severityScore: number;
  trafficRiskScore: number;
  confirmationsScore: number;
  waitingTimeScore: number;
  roadImportanceScore: number;
  tier: 'Critical / Urgent' | 'High Priority' | 'Moderate Priority' | 'Low Priority';
  tierColor: string;
}
