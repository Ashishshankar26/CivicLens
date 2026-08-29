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
    color: COLORS.pothole,
    backgroundColor: COLORS.potholeLight,
    description: 'Road craters, depressions, or asphalt damage causing hazard',
  },
  garbage: {
    id: 'garbage',
    label: 'Garbage Dump',
    shortLabel: 'Garbage',
    iconName: 'Trash2',
    color: COLORS.garbage,
    backgroundColor: COLORS.garbageLight,
    description: 'Overflowing bins, illegal dumping, or scattered waste',
  },
  streetlight: {
    id: 'streetlight',
    label: 'Streetlight',
    shortLabel: 'Streetlight',
    iconName: 'Lightbulb',
    color: COLORS.streetlight,
    backgroundColor: COLORS.streetlightLight,
    description: 'Dark streets, flickering bulbs, or damaged lighting poles',
  },
  road_damage: {
    id: 'road_damage',
    label: 'Road Damage',
    shortLabel: 'Damage',
    iconName: 'Construction',
    color: COLORS.roadDamage,
    backgroundColor: COLORS.roadDamageLight,
    description: 'Cracks, missing manhole covers, or broken dividers',
  },
  other: {
    id: 'other',
    label: 'Civic Issue',
    shortLabel: 'Other',
    iconName: 'HelpCircle',
    color: COLORS.other,
    backgroundColor: COLORS.otherLight,
    description: 'Waterlogging, fallen branches, or general infrastructure faults',
  },
};

export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORIES);
