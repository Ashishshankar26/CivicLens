import { CivicIssue, CreateIssueInput, IssueSeverity, RoadType, TrafficLevel } from '@/types/issue';
import { PriorityBreakdown } from '@/types/gamification';

/**
 * Calculates a 0-100 Smart Priority Score for an issue based on multi-variable weighting:
 * Severity (30) + Traffic Level (20) + Community Confirmations (20) + Waiting Time (15) + Road Importance (15)
 */
export function calculatePriorityScore(
  severity: IssueSeverity,
  trafficLevel: TrafficLevel = 'medium',
  confirmationCount: number = 0,
  gettingWorseCount: number = 0,
  createdAt: string = new Date().toISOString(),
  roadType: RoadType = 'main_road',
  impactFactors: string[] = []
): PriorityBreakdown {
  // 1. Severity Score (max 30)
  let severityScore = 20;
  if (severity === 'high') severityScore = 30;
  else if (severity === 'medium') severityScore = 20;
  else if (severity === 'low') severityScore = 10;

  // 2. Traffic Risk Score (max 20)
  let trafficRiskScore = 12;
  if (trafficLevel === 'heavy') trafficRiskScore = 20;
  else if (trafficLevel === 'medium') trafficRiskScore = 12;
  else if (trafficLevel === 'low') trafficRiskScore = 5;

  // 3. Community Confirmations & Urgency Boost (max 20)
  const confirmationsScore = Math.min(20, confirmationCount * 3 + gettingWorseCount * 5);

  // 4. Waiting Time / Age in Days (max 15)
  const diffDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
  );
  const waitingTimeScore = Math.min(15, diffDays * 2 + 3);

  // 5. Road Importance & Impact Factors (max 15)
  let roadBase = 5;
  if (roadType === 'highway') roadBase = 8;
  else if (roadType === 'main_road') roadBase = 6;
  else if (roadType === 'local_street') roadBase = 3;

  const impactBoost = Math.min(7, impactFactors.length * 2.5);
  const roadImportanceScore = Math.min(15, Math.round(roadBase + impactBoost));

  // Total Priority Score (0 to 100)
  const total = Math.min(
    100,
    Math.max(15, severityScore + trafficRiskScore + confirmationsScore + waitingTimeScore + roadImportanceScore)
  );

  // Tier Classification
  let tier: PriorityBreakdown['tier'] = 'Moderate Priority';
  let tierColor = '#EAB308'; // Amber

  if (total >= 80) {
    tier = 'Critical / Urgent';
    tierColor = '#EF4444'; // Red
  } else if (total >= 60) {
    tier = 'High Priority';
    tierColor = '#F97316'; // Orange
  } else if (total >= 35) {
    tier = 'Moderate Priority';
    tierColor = '#EAB308'; // Amber
  } else {
    tier = 'Low Priority';
    tierColor = '#10B981'; // Emerald
  }

  return {
    total,
    severityScore,
    trafficRiskScore,
    confirmationsScore,
    waitingTimeScore,
    roadImportanceScore,
    tier,
    tierColor,
  };
}

/**
 * Generates an automated 5-step Issue Health Lifecycle Timeline
 */
export function generateIssueTimeline(issue: Partial<CivicIssue>) {
  const isResolved = issue.status === 'resolved';
  const confirmationCount = issue.confirmationCount || 0;
  const isHighPriority = (issue.priorityScore || 50) >= 75;

  return [
    {
      id: 'step_reported',
      title: 'Report Submitted',
      subtitle: `Logged by ${issue.reporterName || 'Citizen'} with GPS & Photo evidence`,
      timestamp: issue.createdAt || 'Just now',
      completed: true,
    },
    {
      id: 'step_ai_verified',
      title: 'AI Vision Analysis',
      subtitle: `Verified category: ${issue.category?.toUpperCase() || 'CIVIC ISSUE'} (${Math.round((issue.aiConfidence || 0.94) * 100)}% match)`,
      timestamp: 'Immediate',
      completed: true,
    },
    {
      id: 'step_community',
      title: 'Community Verified',
      subtitle: `${confirmationCount} nearby citizens confirmed on site`,
      timestamp: confirmationCount > 0 ? 'Verified' : 'Pending more votes',
      completed: confirmationCount >= 1,
      current: confirmationCount < 1 && !isResolved,
    },
    {
      id: 'step_priority',
      title: isHighPriority ? 'High-Priority Alert' : 'Community Watch',
      subtitle: `Community Safety Score: ${issue.priorityScore || 65}/100`,
      timestamp: 'Active',
      completed: isHighPriority || isResolved,
      current: confirmationCount >= 1 && !isResolved,
    },
    {
      id: 'step_resolved',
      title: 'Resolved & Restored',
      subtitle: isResolved ? 'Confirmed repaired with citizen photo proof' : 'Awaiting restoration by community or road crew',
      timestamp: issue.resolvedAt || 'Pending',
      completed: isResolved,
      current: isResolved,
    },
  ];
}
