import { IssueCategory } from '@/types/issue';
import { COLORS } from './theme';

export interface CategoryMeta {
  id: IssueCategory;
  label: string;
  shortLabel: string;
  iconName: string;
  color: string;
  backgroundColor: string;
  description: string;
}

export const CATEGORIES: Record<IssueCategory, CategoryMeta> = {
  pothole: {
    id: 'pothole',
    label: 'Pothole',
    shortLabel: 'Pothole',
    iconName: 'AlertCircle',
    color: '#0066FF', // Cobalt Blue
    backgroundColor: '#EFF6FF',
    description: 'Road craters, depressions, or asphalt damage causing hazard',
  },
  garbage: {
    id: 'garbage',
    label: 'Garbage Dump',
    shortLabel: 'Garbage',
    iconName: 'Trash2',
    color: '#059669', // Emerald
    backgroundColor: '#ECFDF5',
    description: 'Overflowing bins, illegal dumping, or scattered waste',
  },
  streetlight: {
    id: 'streetlight',
    label: 'Streetlight',
    shortLabel: 'Streetlight',
    iconName: 'Lightbulb',
    color: '#D97706', // Amber
    backgroundColor: '#FEF3C7',
    description: 'Dark streets, flickering bulbs, or damaged lighting poles',
  },
  road_damage: {
    id: 'road_damage',
    label: 'Road Hazard',
    shortLabel: 'Hazard',
    iconName: 'Construction',
    color: '#DC2626', // Red
    backgroundColor: '#FEE2E2',
    description: 'Cracks, missing manhole covers, or broken dividers',
  },
  other: {
    id: 'other',
    label: 'Civic Issue',
    shortLabel: 'Other',
    iconName: 'HelpCircle',
    color: '#6366F1', // Indigo
    backgroundColor: '#EEF2FF',
    description: 'Waterlogging, fallen branches, or general infrastructure faults',
  },
};

export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORIES);
