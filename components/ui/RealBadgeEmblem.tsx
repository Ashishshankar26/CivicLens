import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Polygon,
  G,
  Text as SvgText,
  Rect,
} from 'react-native-svg';

export interface BadgeTheme {
  shape: 'circle' | 'hexagon' | 'octagon';
  // Outer frame palette
  rimColorTop: string;
  rimColorMid: string;
  rimColorBottom: string;
  rimBorder: string;
  // Inner disc palette
  bgTop: string;
  bgBottom: string;
  // Accent & illustration
  primaryColor: string;
  secondaryColor: string;
  shadowColor: string;
  sparkleColor: string;
  // Specific rendering
  iconType:
    | 'city'
    | 'road'
    | 'pothole'
    | 'cone'
    | 'leaf'
    | 'recycle'
    | 'lamp'
    | 'moon'
    | 'sun'
    | 'eye'
    | 'compass'
    | 'shield'
    | 'trophy'
    | 'medal'
    | 'check'
    | 'flame'
    | 'spark'
    | 'star'
    | 'wrench'
    | 'ai_bot'
    | 'camera'
    | 'heart'
    | 'flag'
    | 'target'
    | 'number';
  numberLabel?: string;
}

const BADGE_THEMES: Record<string, BadgeTheme> = {
  // 1. ONBOARDING & NOVICE (Fresh Sky & Turquoise Medallions)
  first_step: {
    shape: 'circle',
    rimColorTop: '#38BDF8',
    rimColorMid: '#0284C7',
    rimColorBottom: '#0369A1',
    rimBorder: '#7DD3FC',
    bgTop: '#E0F2FE',
    bgBottom: '#BAE6FD',
    primaryColor: '#0284C7',
    secondaryColor: '#38BDF8',
    shadowColor: '#075985',
    sparkleColor: '#FFFFFF',
    iconType: 'compass',
  },
  sharp_eye: {
    shape: 'circle',
    rimColorTop: '#60A5FA',
    rimColorMid: '#2563EB',
    rimColorBottom: '#1D4ED8',
    rimBorder: '#93C5FD',
    bgTop: '#EFF6FF',
    bgBottom: '#BFDBFE',
    primaryColor: '#2563EB',
    secondaryColor: '#60A5FA',
    shadowColor: '#1E40AF',
    sparkleColor: '#FFFFFF',
    iconType: 'camera',
  },
  first_verifier: {
    shape: 'circle',
    rimColorTop: '#34D399',
    rimColorMid: '#059669',
    rimColorBottom: '#047857',
    rimBorder: '#6EE7B7',
    bgTop: '#ECFDF5',
    bgBottom: '#A7F3D0',
    primaryColor: '#059669',
    secondaryColor: '#34D399',
    shadowColor: '#065F46',
    sparkleColor: '#FFFFFF',
    iconType: 'eye',
  },
  ready_scout: {
    shape: 'circle',
    rimColorTop: '#818CF8',
    rimColorMid: '#4F46E5',
    rimColorBottom: '#3730A3',
    rimBorder: '#A5B4FC',
    bgTop: '#EEF2FF',
    bgBottom: '#C7D2FE',
    primaryColor: '#4F46E5',
    secondaryColor: '#818CF8',
    shadowColor: '#312E81',
    sparkleColor: '#FFFFFF',
    iconType: 'shield',
  },
  location_scout: {
    shape: 'circle',
    rimColorTop: '#2DD4BF',
    rimColorMid: '#0D9488',
    rimColorBottom: '#115E59',
    rimBorder: '#5EEAD4',
    bgTop: '#F0FDFA',
    bgBottom: '#99F6E4',
    primaryColor: '#0D9488',
    secondaryColor: '#2DD4BF',
    shadowColor: '#134E4A',
    sparkleColor: '#FFFFFF',
    iconType: 'city',
  },
  quick_responder: {
    shape: 'circle',
    rimColorTop: '#FBBF24',
    rimColorMid: '#D97706',
    rimColorBottom: '#B45309',
    rimBorder: '#FDE68A',
    bgTop: '#FEF3C7',
    bgBottom: '#FDE68A',
    primaryColor: '#D97706',
    secondaryColor: '#F59E0B',
    shadowColor: '#92400E',
    sparkleColor: '#FFFFFF',
    iconType: 'spark',
  },

  // 2. POTHOLES & ROAD HAZARDS (Warm Terracotta, Coral, Amber & Road Cones)
  pothole_novice: {
    shape: 'circle',
    rimColorTop: '#FB923C',
    rimColorMid: '#EA580C',
    rimColorBottom: '#C2410C',
    rimBorder: '#FED7AA',
    bgTop: '#FFF7ED',
    bgBottom: '#FFEDD5',
    primaryColor: '#EA580C',
    secondaryColor: '#FB923C',
    shadowColor: '#9A3412',
    sparkleColor: '#FFFFFF',
    iconType: 'cone',
  },
  pothole_patrol: {
    shape: 'circle',
    rimColorTop: '#F97316',
    rimColorMid: '#C2410C',
    rimColorBottom: '#9A3412',
    rimBorder: '#FDBA74',
    bgTop: '#FFF7ED',
    bgBottom: '#FED7AA',
    primaryColor: '#C2410C',
    secondaryColor: '#F97316',
    shadowColor: '#7C2D12',
    sparkleColor: '#FFFFFF',
    iconType: 'road',
  },
  pothole_hunter: {
    shape: 'circle',
    rimColorTop: '#EF4444',
    rimColorMid: '#DC2626',
    rimColorBottom: '#B91C1C',
    rimBorder: '#FCA5A5',
    bgTop: '#FEF2F2',
    bgBottom: '#FECACA',
    primaryColor: '#DC2626',
    secondaryColor: '#EF4444',
    shadowColor: '#991B1B',
    sparkleColor: '#FFFFFF',
    iconType: 'pothole',
  },
  pothole_master: {
    shape: 'octagon',
    rimColorTop: '#FDE047',
    rimColorMid: '#F59E0B',
    rimColorBottom: '#B45309',
    rimBorder: '#FEF08A',
    bgTop: '#FFFBEB',
    bgBottom: '#FDE68A',
    primaryColor: '#D97706',
    secondaryColor: '#F59E0B',
    shadowColor: '#92400E',
    sparkleColor: '#FFFFFF',
    iconType: 'star',
  },
  road_guardian: {
    shape: 'hexagon',
    rimColorTop: '#FB923C',
    rimColorMid: '#EA580C',
    rimColorBottom: '#C2410C',
    rimBorder: '#FED7AA',
    bgTop: '#FFF7ED',
    bgBottom: '#FFEDD5',
    primaryColor: '#EA580C',
    secondaryColor: '#FB923C',
    shadowColor: '#9A3412',
    sparkleColor: '#FFFFFF',
    iconType: 'shield',
  },
  asphalt_doctor: {
    shape: 'circle',
    rimColorTop: '#A855F7',
    rimColorMid: '#7E22CE',
    rimColorBottom: '#6B21A8',
    rimBorder: '#D8B4FE',
    bgTop: '#FAF5FF',
    bgBottom: '#E9D5FF',
    primaryColor: '#7E22CE',
    secondaryColor: '#A855F7',
    shadowColor: '#581C87',
    sparkleColor: '#FFFFFF',
    iconType: 'wrench',
  },
  crater_crusher: {
    shape: 'circle',
    rimColorTop: '#E11D48',
    rimColorMid: '#BE123C',
    rimColorBottom: '#9F1239',
    rimBorder: '#FDA4AF',
    bgTop: '#FFF1F2',
    bgBottom: '#FECDD3',
    primaryColor: '#BE123C',
    secondaryColor: '#E11D48',
    shadowColor: '#881337',
    sparkleColor: '#FFFFFF',
    iconType: 'flame',
  },
  smooth_streets: {
    shape: 'circle',
    rimColorTop: '#10B981',
    rimColorMid: '#059669',
    rimColorBottom: '#047857',
    rimBorder: '#6EE7B7',
    bgTop: '#ECFDF5',
    bgBottom: '#A7F3D0',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    shadowColor: '#065F46',
    sparkleColor: '#FFFFFF',
    iconType: 'road',
  },

  // 3. LIGHTING & STREETLIGHT (Electric Twilight, Violet & Radiant Beacons)
  lamp_spotter: {
    shape: 'circle',
    rimColorTop: '#FBBF24',
    rimColorMid: '#D97706',
    rimColorBottom: '#B45309',
    rimBorder: '#FDE68A',
    bgTop: '#FEF3C7',
    bgBottom: '#FDE68A',
    primaryColor: '#D97706',
    secondaryColor: '#F59E0B',
    shadowColor: '#92400E',
    sparkleColor: '#FFFFFF',
    iconType: 'lamp',
  },
  light_keeper: {
    shape: 'circle',
    rimColorTop: '#6366F1',
    rimColorMid: '#4338CA',
    rimColorBottom: '#3730A3',
    rimBorder: '#A5B4FC',
    bgTop: '#EEF2FF',
    bgBottom: '#C7D2FE',
    primaryColor: '#4338CA',
    secondaryColor: '#6366F1',
    shadowColor: '#312E81',
    sparkleColor: '#FFFFFF',
    iconType: 'lamp',
  },
  dawn_patrol: {
    shape: 'circle',
    rimColorTop: '#F59E0B',
    rimColorMid: '#EA580C',
    rimColorBottom: '#C2410C',
    rimBorder: '#FDE68A',
    bgTop: '#FFFBEB',
    bgBottom: '#FED7AA',
    primaryColor: '#EA580C',
    secondaryColor: '#F59E0B',
    shadowColor: '#9A3412',
    sparkleColor: '#FFFFFF',
    iconType: 'sun',
  },
  night_owl: {
    shape: 'circle',
    rimColorTop: '#8B5CF6',
    rimColorMid: '#6D28D9',
    rimColorBottom: '#5B21B6',
    rimBorder: '#C4B5FD',
    bgTop: '#F5F3FF',
    bgBottom: '#DDD6FE',
    primaryColor: '#6D28D9',
    secondaryColor: '#8B5CF6',
    shadowColor: '#4C1D95',
    sparkleColor: '#FFFFFF',
    iconType: 'moon',
  },
  grid_guardian: {
    shape: 'hexagon',
    rimColorTop: '#38BDF8',
    rimColorMid: '#0284C7',
    rimColorBottom: '#0369A1',
    rimBorder: '#7DD3FC',
    bgTop: '#E0F2FE',
    bgBottom: '#BAE6FD',
    primaryColor: '#0284C7',
    secondaryColor: '#38BDF8',
    shadowColor: '#075985',
    sparkleColor: '#FFFFFF',
    iconType: 'shield',
  },
  beacon_master: {
    shape: 'octagon',
    rimColorTop: '#FDE047',
    rimColorMid: '#F59E0B',
    rimColorBottom: '#B45309',
    rimBorder: '#FEF08A',
    bgTop: '#FFFBEB',
    bgBottom: '#FDE68A',
    primaryColor: '#D97706',
    secondaryColor: '#F59E0B',
    shadowColor: '#92400E',
    sparkleColor: '#FFFFFF',
    iconType: 'star',
  },

  // 4. WASTE & SANITATION (Lush Emerald & Lime Medallions)
  eco_starter: {
    shape: 'circle',
    rimColorTop: '#84CC16',
    rimColorMid: '#65A30D',
    rimColorBottom: '#4D7C0F',
    rimBorder: '#BEF264',
    bgTop: '#F7FEE7',
    bgBottom: '#D9F99D',
    primaryColor: '#65A30D',
    secondaryColor: '#84CC16',
    shadowColor: '#3F6212',
    sparkleColor: '#FFFFFF',
    iconType: 'leaf',
  },
  eco_warrior: {
    shape: 'circle',
    rimColorTop: '#10B981',
    rimColorMid: '#059669',
    rimColorBottom: '#047857',
    rimBorder: '#6EE7B7',
    bgTop: '#ECFDF5',
    bgBottom: '#A7F3D0',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    shadowColor: '#065F46',
    sparkleColor: '#FFFFFF',
    iconType: 'recycle',
  },
  eco_sentinel: {
    shape: 'hexagon',
    rimColorTop: '#34D399',
    rimColorMid: '#059669',
    rimColorBottom: '#047857',
    rimBorder: '#A7F3D0',
    bgTop: '#ECFDF5',
    bgBottom: '#6EE7B7',
    primaryColor: '#059669',
    secondaryColor: '#34D399',
    shadowColor: '#065F46',
    sparkleColor: '#FFFFFF',
    iconType: 'shield',
  },
  zero_waste_hero: {
    shape: 'octagon',
    rimColorTop: '#FDE047',
    rimColorMid: '#10B981',
    rimColorBottom: '#059669',
    rimBorder: '#FEF08A',
    bgTop: '#ECFDF5',
    bgBottom: '#A7F3D0',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    shadowColor: '#065F46',
    sparkleColor: '#FFFFFF',
    iconType: 'trophy',
  },

  // 5. COMMUNITY VERIFICATION (Deep Ocean & Cobalt Medallions)
  verify_bronze: {
    shape: 'circle',
    rimColorTop: '#CD7F32',
    rimColorMid: '#A0522D',
    rimColorBottom: '#8B4513',
    rimBorder: '#E6A86C',
    bgTop: '#FFF8F0',
    bgBottom: '#FED7AA',
    primaryColor: '#A0522D',
    secondaryColor: '#CD7F32',
    shadowColor: '#78350F',
    sparkleColor: '#FFFFFF',
    iconType: 'check',
  },
  verify_silver: {
    shape: 'circle',
    rimColorTop: '#E2E8F0',
    rimColorMid: '#94A3B8',
    rimColorBottom: '#64748B',
    rimBorder: '#F8FAFC',
    bgTop: '#F8FAFC',
    bgBottom: '#E2E8F0',
    primaryColor: '#64748B',
    secondaryColor: '#94A3B8',
    shadowColor: '#334155',
    sparkleColor: '#FFFFFF',
    iconType: 'check',
  },
  verify_gold: {
    shape: 'octagon',
    rimColorTop: '#FDE047',
    rimColorMid: '#F59E0B',
    rimColorBottom: '#B45309',
    rimBorder: '#FEF08A',
    bgTop: '#FFFBEB',
    bgBottom: '#FDE68A',
    primaryColor: '#D97706',
    secondaryColor: '#F59E0B',
    shadowColor: '#92400E',
    sparkleColor: '#FFFFFF',
    iconType: 'check',
  },
  verify_platinum: {
    shape: 'hexagon',
    rimColorTop: '#A5F3FC',
    rimColorMid: '#06B6D4',
    rimColorBottom: '#0891B2',
    rimBorder: '#CFFAFE',
    bgTop: '#ECFEFF',
    bgBottom: '#BAE6FD',
    primaryColor: '#0891B2',
    secondaryColor: '#06B6D4',
    shadowColor: '#164E63',
    sparkleColor: '#FFFFFF',
    iconType: 'medal',
  },
  double_check: {
    shape: 'circle',
    rimColorTop: '#38BDF8',
    rimColorMid: '#0284C7',
    rimColorBottom: '#0369A1',
    rimBorder: '#7DD3FC',
    bgTop: '#E0F2FE',
    bgBottom: '#BAE6FD',
    primaryColor: '#0284C7',
    secondaryColor: '#38BDF8',
    shadowColor: '#075985',
    sparkleColor: '#FFFFFF',
    iconType: 'eye',
  },
  hawk_eye: {
    shape: 'circle',
    rimColorTop: '#F43F5E',
    rimColorMid: '#E11D48',
    rimColorBottom: '#BE123C',
    rimBorder: '#FDA4AF',
    bgTop: '#FFF1F2',
    bgBottom: '#FECDD3',
    primaryColor: '#E11D48',
    secondaryColor: '#F43F5E',
    shadowColor: '#9F1239',
    sparkleColor: '#FFFFFF',
    iconType: 'target',
  },
  peer_trusted: {
    shape: 'circle',
    rimColorTop: '#EC4899',
    rimColorMid: '#DB2777',
    rimColorBottom: '#BE185D',
    rimBorder: '#FBCFE8',
    bgTop: '#FDF2F8',
    bgBottom: '#FCE7F3',
    primaryColor: '#DB2777',
    secondaryColor: '#EC4899',
    shadowColor: '#9D174D',
    sparkleColor: '#FFFFFF',
    iconType: 'heart',
  },

  // 6. RESOLUTION & CELEBRATION
  fix_witness: {
    shape: 'circle',
    rimColorTop: '#10B981',
    rimColorMid: '#059669',
    rimColorBottom: '#047857',
    rimBorder: '#6EE7B7',
    bgTop: '#ECFDF5',
    bgBottom: '#A7F3D0',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    shadowColor: '#065F46',
    sparkleColor: '#FFFFFF',
    iconType: 'check',
  },
  before_after: {
    shape: 'circle',
    rimColorTop: '#8B5CF6',
    rimColorMid: '#6D28D9',
    rimColorBottom: '#5B21B6',
    rimBorder: '#C4B5FD',
    bgTop: '#F5F3FF',
    bgBottom: '#DDD6FE',
    primaryColor: '#6D28D9',
    secondaryColor: '#8B5CF6',
    shadowColor: '#4C1D95',
    sparkleColor: '#FFFFFF',
    iconType: 'camera',
  },
  city_healer: {
    shape: 'octagon',
    rimColorTop: '#FDE047',
    rimColorMid: '#F59E0B',
    rimColorBottom: '#B45309',
    rimBorder: '#FEF08A',
    bgTop: '#FFFBEB',
    bgBottom: '#FDE68A',
    primaryColor: '#D97706',
    secondaryColor: '#F59E0B',
    shadowColor: '#92400E',
    sparkleColor: '#FFFFFF',
    iconType: 'trophy',
  },

  // 7. STREAKS & LOYALTY (Fire & Solar Flames)
  streak_3: {
    shape: 'circle',
    rimColorTop: '#FB923C',
    rimColorMid: '#EA580C',
    rimColorBottom: '#C2410C',
    rimBorder: '#FED7AA',
    bgTop: '#FFF7ED',
    bgBottom: '#FFEDD5',
    primaryColor: '#EA580C',
    secondaryColor: '#FB923C',
    shadowColor: '#9A3412',
    sparkleColor: '#FFFFFF',
    iconType: 'flame',
  },
  streak_7: {
    shape: 'circle',
    rimColorTop: '#EF4444',
    rimColorMid: '#DC2626',
    rimColorBottom: '#B91C1C',
    rimBorder: '#FCA5A5',
    bgTop: '#FEF2F2',
    bgBottom: '#FECACA',
    primaryColor: '#DC2626',
    secondaryColor: '#EF4444',
    shadowColor: '#991B1B',
    sparkleColor: '#FFFFFF',
    iconType: 'flame',
  },
  streak_14: {
    shape: 'hexagon',
    rimColorTop: '#F97316',
    rimColorMid: '#EA580C',
    rimColorBottom: '#C2410C',
    rimBorder: '#FDBA74',
    bgTop: '#FFF7ED',
    bgBottom: '#FED7AA',
    primaryColor: '#EA580C',
    secondaryColor: '#F97316',
    shadowColor: '#9A3412',
    sparkleColor: '#FFFFFF',
    iconType: 'flame',
  },
  streak_30: {
    shape: 'octagon',
    rimColorTop: '#FDE047',
    rimColorMid: '#F59E0B',
    rimColorBottom: '#B45309',
    rimBorder: '#FEF08A',
    bgTop: '#FFFBEB',
    bgBottom: '#FDE68A',
    primaryColor: '#D97706',
    secondaryColor: '#F59E0B',
    shadowColor: '#92400E',
    sparkleColor: '#FFFFFF',
    iconType: 'flame',
  },
  weekend_hero: {
    shape: 'circle',
    rimColorTop: '#38BDF8',
    rimColorMid: '#0284C7',
    rimColorBottom: '#0369A1',
    rimBorder: '#7DD3FC',
    bgTop: '#E0F2FE',
    bgBottom: '#BAE6FD',
    primaryColor: '#0284C7',
    secondaryColor: '#38BDF8',
    shadowColor: '#075985',
    sparkleColor: '#FFFFFF',
    iconType: 'flag',
  },
  holiday_keeper: {
    shape: 'circle',
    rimColorTop: '#EC4899',
    rimColorMid: '#DB2777',
    rimColorBottom: '#BE185D',
    rimBorder: '#FBCFE8',
    bgTop: '#FDF2F8',
    bgBottom: '#FCE7F3',
    primaryColor: '#DB2777',
    secondaryColor: '#EC4899',
    shadowColor: '#9D174D',
    sparkleColor: '#FFFFFF',
    iconType: 'spark',
  },

  // 8. 3D MILESTONES (Faceted Hexagons & Gold Octagons like the reference)
  milestone_5: {
    shape: 'hexagon',
    rimColorTop: '#93C5FD',
    rimColorMid: '#3B82F6',
    rimColorBottom: '#1D4ED8',
    rimBorder: '#BFDBFE',
    bgTop: '#EFF6FF',
    bgBottom: '#DBEAFE',
    primaryColor: '#FFFFFF',
    secondaryColor: '#DBEAFE',
    shadowColor: '#1E40AF',
    sparkleColor: '#FFFFFF',
    iconType: 'number',
    numberLabel: '5',
  },
  milestone_10: {
    shape: 'hexagon',
    rimColorTop: '#67E8F9',
    rimColorMid: '#06B6D4',
    rimColorBottom: '#0E7490',
    rimBorder: '#A5F3FC',
    bgTop: '#ECFEFF',
    bgBottom: '#CFFAFE',
    primaryColor: '#FFFFFF',
    secondaryColor: '#CFFAFE',
    shadowColor: '#155E75',
    sparkleColor: '#FFFFFF',
    iconType: 'number',
    numberLabel: '10',
  },
  milestone_25: {
    shape: 'hexagon',
    rimColorTop: '#7DD3FC',
    rimColorMid: '#0284C7',
    rimColorBottom: '#075985',
    rimBorder: '#BAE6FD',
    bgTop: '#E0F2FE',
    bgBottom: '#BAE6FD',
    primaryColor: '#FFFFFF',
    secondaryColor: '#E0F2FE',
    shadowColor: '#0369A1',
    sparkleColor: '#FFFFFF',
    iconType: 'number',
    numberLabel: '25',
  },
  milestone_50: {
    shape: 'hexagon',
    rimColorTop: '#CBD5E1',
    rimColorMid: '#64748B',
    rimColorBottom: '#334155',
    rimBorder: '#F1F5F9',
    bgTop: '#F8FAFC',
    bgBottom: '#E2E8F0',
    primaryColor: '#FFFFFF',
    secondaryColor: '#F8FAFC',
    shadowColor: '#475569',
    sparkleColor: '#FFFFFF',
    iconType: 'number',
    numberLabel: '50',
  },
  milestone_100: {
    shape: 'octagon',
    rimColorTop: '#FEF08A',
    rimColorMid: '#EAB308',
    rimColorBottom: '#A16207',
    rimBorder: '#FDE047',
    bgTop: '#FEF9C3',
    bgBottom: '#FDE68A',
    primaryColor: '#FFFFFF',
    secondaryColor: '#FEF08A',
    shadowColor: '#CA8A04',
    sparkleColor: '#FFFFFF',
    iconType: 'number',
    numberLabel: '100',
  },
  milestone_250: {
    shape: 'hexagon',
    rimColorTop: '#E9D5FF',
    rimColorMid: '#A855F7',
    rimColorBottom: '#7E22CE',
    rimBorder: '#F3E8FF',
    bgTop: '#FAF5FF',
    bgBottom: '#E9D5FF',
    primaryColor: '#FFFFFF',
    secondaryColor: '#FAF5FF',
    shadowColor: '#6B21A8',
    sparkleColor: '#FFFFFF',
    iconType: 'number',
    numberLabel: '250',
  },
  milestone_500: {
    shape: 'octagon',
    rimColorTop: '#FDE047',
    rimColorMid: '#F59E0B',
    rimColorBottom: '#B45309',
    rimBorder: '#FEF08A',
    bgTop: '#FFFBEB',
    bgBottom: '#FDE68A',
    primaryColor: '#FFFFFF',
    secondaryColor: '#FEF08A',
    shadowColor: '#92400E',
    sparkleColor: '#FFFFFF',
    iconType: 'number',
    numberLabel: '500',
  },

  // 9. AI VISION & METROPOLIS
  ai_visionary: {
    shape: 'hexagon',
    rimColorTop: '#C084FC',
    rimColorMid: '#7C3AED',
    rimColorBottom: '#5B21B6',
    rimBorder: '#DDD6FE',
    bgTop: '#F5F3FF',
    bgBottom: '#EDE9FE',
    primaryColor: '#7C3AED',
    secondaryColor: '#A78BFA',
    shadowColor: '#4C1D95',
    sparkleColor: '#FFFFFF',
    iconType: 'ai_bot',
  },
  legendary_guardian: {
    shape: 'octagon',
    rimColorTop: '#FEF08A',
    rimColorMid: '#F59E0B',
    rimColorBottom: '#B45309',
    rimBorder: '#FDE047',
    bgTop: '#EA580C',
    bgBottom: '#C2410C',
    primaryColor: '#FDE047',
    secondaryColor: '#FEF08A',
    shadowColor: '#9A3412',
    sparkleColor: '#FFFFFF',
    iconType: 'star',
  },
};

// Sparkle 4-point star SVG path generator
function renderSparkle(cx: number, cy: number, size: number, color: string = '#FFFFFF') {
  const d = `M ${cx} ${cy - size} Q ${cx} ${cy} ${cx + size} ${cy} Q ${cx} ${cy} ${cx} ${cy + size} Q ${cx} ${cy} ${cx - size} ${cy} Q ${cx} ${cy} ${cx} ${cy - size} Z`;
  return <Path key={`spk-${cx}-${cy}`} d={d} fill={color} />;
}

interface RealBadgeEmblemProps {
  id: string;
  size?: number;
  isUnlocked?: boolean;
}

export const RealBadgeEmblem: React.FC<RealBadgeEmblemProps> = ({
  id,
  size = 56,
  isUnlocked = true,
}) => {
  const normId = (id || '').toLowerCase().trim();
  const theme = BADGE_THEMES[normId] || {
    shape: 'circle',
    rimColorTop: '#60A5FA',
    rimColorMid: '#2563EB',
    rimColorBottom: '#1D4ED8',
    rimBorder: '#93C5FD',
    bgTop: '#EFF6FF',
    bgBottom: '#BFDBFE',
    primaryColor: '#2563EB',
    secondaryColor: '#60A5FA',
    shadowColor: '#1E40AF',
    sparkleColor: '#FFFFFF',
    iconType: 'shield',
  };

  const center = size / 2;
  const scale = size / 100; // normalized 100x100 grid

  // Locked Appearance Palette
  const lockedTheme: BadgeTheme = {
    shape: theme.shape,
    rimColorTop: '#94A3B8',
    rimColorMid: '#64748B',
    rimColorBottom: '#334155',
    rimBorder: '#CBD5E1',
    bgTop: '#F1F5F9',
    bgBottom: '#E2E8F0',
    primaryColor: '#64748B',
    secondaryColor: '#94A3B8',
    shadowColor: '#334155',
    sparkleColor: 'transparent',
    iconType: theme.iconType,
    numberLabel: theme.numberLabel,
  };

  const active = isUnlocked ? theme : lockedTheme;

  // Render Inner Illustration Graphic
  const renderIllustration = () => {
    if (!isUnlocked) {
      // Locked Padlock Icon
      return (
        <G transform={`scale(${scale})`}>
          {/* Shackle */}
          <Path
            d="M 38 46 L 38 35 C 38 28.37 43.37 23 50 23 C 56.63 23 62 28.37 62 35 L 62 46"
            fill="none"
            stroke="#64748B"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Body */}
          <Rect x="32" y="44" width="36" height="28" rx="7" fill="#475569" />
          <Circle cx="50" cy="56" r="3.5" fill="#CBD5E1" />
          <Path d="M 50 58 L 50 64" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
        </G>
      );
    }

    if (active.iconType === 'number' && active.numberLabel) {
      const fontSize = active.numberLabel.length > 2 ? 32 : 38;
      const yOffset = active.numberLabel.length > 2 ? 61 : 63;
      return (
        <G transform={`scale(${scale})`}>
          {/* 3D Drop Shadow Text */}
          <SvgText
            x="50"
            y={yOffset + 3}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight="900"
            fill={active.shadowColor}
            fontFamily={undefined}
          >
            {active.numberLabel}
          </SvgText>
          {/* Front White Text */}
          <SvgText
            x="50"
            y={yOffset}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight="900"
            fill="#FFFFFF"
            fontFamily={undefined}
          >
            {active.numberLabel}
          </SvgText>
        </G>
      );
    }

    if (active.iconType === 'star') {
      // 3D Faceted Star
      return (
        <G transform={`scale(${scale})`}>
          {/* 45-deg drop shadow */}
          <Path
            d="M 50 20 L 59 39 L 80 41 L 64 56 L 69 77 L 50 66 L 31 77 L 36 56 L 20 41 L 41 39 Z"
            fill={active.shadowColor}
            transform="translate(2, 3)"
            opacity={0.6}
          />
          {/* Left Facets (Lighter Gold) */}
          <Path d="M 50 20 L 50 52 L 41 39 Z" fill="#FEF08A" />
          <Path d="M 50 52 L 50 66 L 31 77 Z" fill="#FDE047" />
          <Path d="M 50 52 L 20 41 L 36 56 Z" fill="#FEF08A" />
          <Path d="M 50 52 L 36 56 L 31 77 Z" fill="#FACC15" />
          <Path d="M 50 20 L 50 52 L 59 39 Z" fill="#FACC15" />
          {/* Right Facets (Darker Gold Amber) */}
          <Path d="M 50 52 L 80 41 L 59 39 Z" fill="#EAB308" />
          <Path d="M 50 52 L 64 56 L 80 41 Z" fill="#CA8A04" />
          <Path d="M 50 52 L 69 77 L 64 56 Z" fill="#A16207" />
          <Path d="M 50 52 L 50 66 L 69 77 Z" fill="#CA8A04" />
        </G>
      );
    }

    if (active.iconType === 'city') {
      // Metro Skyline with windows and cloud
      return (
        <G transform={`scale(${scale})`}>
          {/* Sky background cloud */}
          <Path d="M 28 42 Q 32 36 40 38 Q 48 34 56 39 Q 65 37 70 44 L 28 44 Z" fill="#FFFFFF" opacity={0.7} />
          {/* Ground */}
          <Path d="M 22 75 L 78 75" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          {/* Tall Skyscraper Center */}
          <Rect x="42" y="32" width="16" height="43" rx="2" fill="#FFFFFF" />
          <Path d="M 50 22 L 50 32" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <Rect x="46" y="38" width="2" height="3" fill={active.primaryColor} />
          <Rect x="52" y="38" width="2" height="3" fill={active.primaryColor} />
          <Rect x="46" y="45" width="2" height="3" fill={active.primaryColor} />
          <Rect x="52" y="45" width="2" height="3" fill={active.primaryColor} />
          <Rect x="46" y="52" width="2" height="3" fill={active.primaryColor} />
          <Rect x="52" y="52" width="2" height="3" fill={active.primaryColor} />
          {/* Left Tower */}
          <Rect x="26" y="46" width="13" height="29" rx="2" fill="#E2E8F0" />
          <Rect x="30" y="51" width="2" height="2.5" fill={active.shadowColor} />
          <Rect x="34" y="51" width="2" height="2.5" fill={active.shadowColor} />
          <Rect x="30" y="58" width="2" height="2.5" fill={active.shadowColor} />
          <Rect x="34" y="58" width="2" height="2.5" fill={active.shadowColor} />
          {/* Right Tower */}
          <Rect x="61" y="40" width="14" height="35" rx="2" fill="#CBD5E1" />
          <Rect x="65" y="46" width="2" height="3" fill={active.shadowColor} />
          <Rect x="70" y="46" width="2" height="3" fill={active.shadowColor} />
          <Rect x="65" y="54" width="2" height="3" fill={active.shadowColor} />
          <Rect x="70" y="54" width="2" height="3" fill={active.shadowColor} />
        </G>
      );
    }

    if (active.iconType === 'cone' || active.iconType === 'road') {
      // Traffic Cone / Road Hazard
      return (
        <G transform={`scale(${scale})`}>
          {/* Drop shadow */}
          <Path d="M 28 74 L 72 74 L 66 79 L 22 79 Z" fill={active.shadowColor} opacity={0.4} />
          {/* Base */}
          <Rect x="25" y="70" width="50" height="6" rx="3" fill="#EA580C" />
          {/* Orange Cone */}
          <Polygon points="50,22 33,70 67,70" fill="#F97316" />
          {/* White Reflective Stripes */}
          <Polygon points="45,38 39,52 61,52 55,38" fill="#FFFFFF" />
          <Polygon points="42,57 36,66 64,66 58,57" fill="#FFFFFF" />
        </G>
      );
    }

    if (active.iconType === 'pothole') {
      // Pothole Crater with Caution Stripe
      return (
        <G transform={`scale(${scale})`}>
          {/* Asphalt layer */}
          <Path d="M 20 54 Q 50 48 80 54 L 80 76 L 20 76 Z" fill="#334155" />
          {/* Deep Crater */}
          <Path d="M 32 54 Q 50 64 68 54 Q 50 72 32 54 Z" fill="#0F172A" />
          {/* Hazard triangle */}
          <Polygon points="50,24 36,48 64,48" fill="#F59E0B" />
          <Polygon points="50,30 40,46 60,46" fill="#FEF08A" />
          <Path d="M 50 36 L 50 41" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
          <Circle cx="50" cy="43.5" r="1.2" fill="#92400E" />
        </G>
      );
    }

    if (active.iconType === 'leaf' || active.iconType === 'recycle') {
      // Eco Clean Leaves / Recycling
      return (
        <G transform={`scale(${scale})`}>
          {/* Large Leaf */}
          <Path
            d="M 50 24 C 68 24 76 42 74 62 C 64 74 46 76 34 66 C 26 56 32 36 50 24 Z"
            fill="#22C55E"
          />
          {/* Center leaf vein */}
          <Path d="M 40 68 Q 52 50 68 32" stroke="#DCFCE7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Small companion sprout */}
          <Path
            d="M 32 44 C 22 44 18 54 20 64 C 28 68 38 66 42 58 C 44 50 38 44 32 44 Z"
            fill="#4ADE80"
          />
        </G>
      );
    }

    if (active.iconType === 'lamp' || active.iconType === 'sun' || active.iconType === 'moon') {
      // Glowing Streetlight / Night Beacon
      return (
        <G transform={`scale(${scale})`}>
          {/* Radial Light Rays */}
          <Circle cx="50" cy="38" r="22" fill="#FEF08A" opacity={0.35} />
          {/* Lamp Post Head */}
          <Path d="M 34 32 Q 50 22 66 32 L 60 40 L 40 40 Z" fill="#334155" />
          {/* Glowing Bulb */}
          <Circle cx="50" cy="42" r="7" fill="#FDE047" />
          <Circle cx="50" cy="42" r="4" fill="#FFFFFF" />
          {/* Pole */}
          <Path d="M 50 40 L 50 76" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
          <Path d="M 42 76 L 58 76" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
        </G>
      );
    }

    if (active.iconType === 'trophy' || active.iconType === 'medal') {
      // Golden Victory Trophy
      return (
        <G transform={`scale(${scale})`}>
          {/* Trophy Cup Base */}
          <Rect x="42" y="66" width="16" height="5" rx="1.5" fill="#D97706" />
          <Rect x="38" y="71" width="24" height="6" rx="2" fill="#B45309" />
          <Path d="M 50 56 L 50 66" stroke="#D97706" strokeWidth="5" strokeLinecap="round" />
          {/* Cup Bowl */}
          <Path d="M 35 28 L 65 28 C 65 48 35 48 35 28 Z" fill="#F59E0B" />
          <Path d="M 38 28 L 62 28 C 62 44 38 44 38 28 Z" fill="#FDE047" />
          {/* Handles */}
          <Path d="M 35 32 C 26 32 26 44 37 44" stroke="#F59E0B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <Path d="M 65 32 C 74 32 74 44 63 44" stroke="#F59E0B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Star on Cup */}
          <Path d="M 50 33 L 52 37 L 56 37 L 53 40 L 54 44 L 50 42 L 46 44 L 47 40 L 44 37 L 48 37 Z" fill="#B45309" />
        </G>
      );
    }

    if (active.iconType === 'flame') {
      // Streak Flame
      return (
        <G transform={`scale(${scale})`}>
          {/* Outer Orange Flame */}
          <Path
            d="M 50 20 C 62 36 74 48 70 64 C 66 76 52 80 44 78 C 30 74 26 58 36 46 C 42 40 44 32 50 20 Z"
            fill="#EA580C"
          />
          {/* Inner Yellow Core */}
          <Path
            d="M 50 38 C 58 48 64 56 60 66 C 58 72 48 74 44 72 C 36 70 34 60 40 54 C 44 50 46 44 50 38 Z"
            fill="#FDE047"
          />
        </G>
      );
    }

    if (active.iconType === 'camera') {
      // Photo Evidence Camera
      return (
        <G transform={`scale(${scale})`}>
          <Rect x="26" y="36" width="48" height="36" rx="8" fill="#FFFFFF" />
          <Path d="M 40 36 L 44 30 L 56 30 L 60 36 Z" fill="#CBD5E1" />
          <Circle cx="50" cy="54" r="12" fill={active.primaryColor} />
          <Circle cx="50" cy="54" r="9" fill="#FFFFFF" />
          <Circle cx="50" cy="54" r="6" fill={active.primaryColor} />
          <Circle cx="64" cy="43" r="2.5" fill="#EF4444" />
        </G>
      );
    }

    if (active.iconType === 'shield' || active.iconType === 'check') {
      // Verification Crest & Shield
      return (
        <G transform={`scale(${scale})`}>
          <Path
            d="M 50 22 C 64 22 74 28 74 38 C 74 58 50 76 50 76 C 50 76 26 58 26 38 C 26 28 36 22 50 22 Z"
            fill="#FFFFFF"
          />
          <Path
            d="M 50 26 C 60 26 69 31 69 39 C 69 55 50 70 50 70 C 50 70 31 55 31 39 C 31 31 40 26 50 26 Z"
            fill={active.primaryColor}
          />
          {/* Checkmark inside */}
          <Path
            d="M 42 48 L 47 53 L 59 41"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </G>
      );
    }

    // Default: Compass / Eye Scout
    return (
      <G transform={`scale(${scale})`}>
        <Circle cx="50" cy="50" r="26" fill="#FFFFFF" />
        <Circle cx="50" cy="50" r="22" fill={active.primaryColor} />
        {/* Compass Needle */}
        <Polygon points="50,30 55,50 50,46" fill="#EF4444" />
        <Polygon points="50,30 45,50 50,46" fill="#F87171" />
        <Polygon points="50,70 55,50 50,54" fill="#CBD5E1" />
        <Polygon points="50,70 45,50 50,54" fill="#FFFFFF" />
        <Circle cx="50" cy="50" r="3" fill="#FFFFFF" />
      </G>
    );
  };

  // 1. HEXAGON SHAPE (3D Beveled Crystal / Metallic Shield)
  if (active.shape === 'hexagon') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="hexRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={active.rimColorTop} />
              <Stop offset="50%" stopColor={active.rimColorMid} />
              <Stop offset="100%" stopColor={active.rimColorBottom} />
            </LinearGradient>
            <LinearGradient id="hexInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={active.bgTop} />
              <Stop offset="100%" stopColor={active.bgBottom} />
            </LinearGradient>
          </Defs>

          {/* Outer Beveled Hexagon Base */}
          <Polygon
            points="50,3 91,26 91,74 50,97 9,74 9,26"
            fill="url(#hexRimGrad)"
            stroke={active.rimBorder}
            strokeWidth="2.5"
          />

          {/* Top Bevel Highlight Facet */}
          <Polygon points="50,3 91,26 80,32 50,15 20,32 9,26" fill="#FFFFFF" opacity={0.35} />

          {/* Bottom Bevel Shadow Facet */}
          <Polygon points="50,97 91,74 80,68 50,85 20,68 9,74" fill="#000000" opacity={0.25} />

          {/* Inner Recessed Hexagon Canvas */}
          <Polygon
            points="50,15 80,32 80,68 50,85 20,68 20,32"
            fill="url(#hexInnerGrad)"
            stroke={active.rimColorBottom}
            strokeWidth="1.5"
          />

          {/* Center Illustration Graphic */}
          {renderIllustration()}

          {/* Sparkles floating around rim */}
          {isUnlocked && (
            <>
              {renderSparkle(16, 26, 4.5, active.sparkleColor)}
              {renderSparkle(84, 24, 3.5, active.sparkleColor)}
              {renderSparkle(50, 93, 4, active.sparkleColor)}
            </>
          )}
        </Svg>
      </View>
    );
  }

  // 2. OCTAGON SHAPE (3D Golden Master Shield)
  if (active.shape === 'octagon') {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="octRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={active.rimColorTop} />
              <Stop offset="50%" stopColor={active.rimColorMid} />
              <Stop offset="100%" stopColor={active.rimColorBottom} />
            </LinearGradient>
            <LinearGradient id="octInnerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={active.bgTop} />
              <Stop offset="100%" stopColor={active.bgBottom} />
            </LinearGradient>
          </Defs>

          {/* Outer 8-sided Beveled Coin */}
          <Polygon
            points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30"
            fill="url(#octRimGrad)"
            stroke={active.rimBorder}
            strokeWidth="3"
          />

          {/* Top Bevel Highlight */}
          <Polygon points="30,4 70,4 63,15 37,15" fill="#FFFFFF" opacity={0.45} />
          <Polygon points="4,30 30,4 37,15 15,37" fill="#FFFFFF" opacity={0.35} />

          {/* Bottom Bevel Shadow */}
          <Polygon points="30,96 70,96 63,85 37,85" fill="#000000" opacity={0.3} />
          <Polygon points="96,70 70,96 63,85 85,63" fill="#000000" opacity={0.25} />

          {/* Inner Recessed Octagon Canvas */}
          <Polygon
            points="37,15 63,15 85,37 85,63 63,85 37,85 15,63 15,37"
            fill="url(#octInnerGrad)"
            stroke={active.rimColorBottom}
            strokeWidth="2"
          />

          {/* Center Illustration Graphic */}
          {renderIllustration()}

          {/* Sparkles around rim */}
          {isUnlocked && (
            <>
              {renderSparkle(12, 28, 5, active.sparkleColor)}
              {renderSparkle(88, 26, 4, active.sparkleColor)}
              {renderSparkle(28, 92, 4.5, active.sparkleColor)}
              {renderSparkle(74, 90, 3.5, active.sparkleColor)}
            </>
          )}
        </Svg>
      </View>
    );
  }

  // 3. CIRCULAR ILLUSTRATED MEDALLION (Thick Vibrant Border + Sparkles)
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="circRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={active.rimColorTop} />
            <Stop offset="60%" stopColor={active.rimColorMid} />
            <Stop offset="100%" stopColor={active.rimColorBottom} />
          </LinearGradient>
          <RadialGradient id="circInnerGrad" cx="50%" cy="40%" r="60%">
            <Stop offset="0%" stopColor={active.bgTop} />
            <Stop offset="100%" stopColor={active.bgBottom} />
          </RadialGradient>
        </Defs>

        {/* Thick Outer Rim */}
        <Circle
          cx="50"
          cy="50"
          r="47"
          fill="url(#circRimGrad)"
          stroke={active.rimBorder}
          strokeWidth="2"
        />

        {/* Top Rim Arc Highlight */}
        <Path
          d="M 12 40 A 44 44 0 0 1 88 40"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity={0.35}
        />

        {/* Inner Circular Canvas */}
        <Circle
          cx="50"
          cy="50"
          r="36"
          fill="url(#circInnerGrad)"
          stroke={active.rimColorBottom}
          strokeWidth="1.5"
        />

        {/* Center Civic Vector Illustration */}
        {renderIllustration()}

        {/* 4-Point Sparkling Stars */}
        {isUnlocked && (
          <>
            {renderSparkle(20, 24, 4.5, active.sparkleColor)}
            {renderSparkle(80, 26, 3.5, active.sparkleColor)}
            {renderSparkle(22, 76, 3.5, active.sparkleColor)}
            {renderSparkle(78, 74, 4.5, active.sparkleColor)}
          </>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
