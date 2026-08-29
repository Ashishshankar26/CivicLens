import { IssueSeverity } from '@/types/issue';
import { COLORS } from './theme';

export interface SeverityMeta {
  id: IssueSeverity;
  label: string;
  color: string;
  backgroundColor: string;
  description: string;
}

export const SEVERITIES: Record<IssueSeverity, SeverityMeta> = {
  low: {
    id: 'low',
    label: 'Low',
    color: COLORS.low,
    backgroundColor: COLORS.lowLight,
    description: 'Minor inconvenience, no immediate risk to traffic or safety',
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    color: COLORS.medium,
    backgroundColor: COLORS.mediumLight,
    description: 'Noticeable issue impacting flow or local pedestrian movement',
  },
  high: {
    id: 'high',
    label: 'High',
    color: COLORS.high,
    backgroundColor: COLORS.highLight,
    description: 'Urgent hazard causing vehicle damage, accidents, or hygiene risks',
  },
};

export const SEVERITY_LIST: SeverityMeta[] = Object.values(SEVERITIES);
