import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  Camera,
  Compass,
  Shield,
  Trophy,
  Eye,
  ShieldCheck,
  Wrench,
  Crown,
  Bot,
  Flame,
  Award,
  Lock,
  Sparkles,
  Star,
  CheckCircle2,
  Lightbulb,
  Trash2,
  AlertTriangle,
  MapPin,
  Clock,
  Sunrise,
  Moon,
  Zap,
  TrendingUp,
  Target,
  HeartHandshake,
  CheckCheck,
  Building2,
  Flag,
} from 'lucide-react-native';

export interface BadgeArtConfig {
  bezelColor: string;
  bezelShadow: string;
  innerBg: string;
  iconColor: string;
  accentColor: string;
  shape?: 'circle' | 'hexagon' | 'shield';
  milestoneNum?: string;
  badgeType?: 'scene_city' | 'scene_night' | 'scene_flame' | 'scene_trophy' | 'scene_star' | 'scene_wrench' | 'icon';
}

const BADGE_ART_CONFIGS: Record<string, BadgeArtConfig> = {
  // Onboarding & Novice
  first_step: {
    bezelColor: '#38BDF8',
    bezelShadow: '#0284C7',
    innerBg: '#E0F2FE',
    iconColor: '#0284C7',
    accentColor: '#BAE6FD',
  },
  sharp_eye: {
    bezelColor: '#60A5FA',
    bezelShadow: '#2563EB',
    innerBg: '#EFF6FF',
    iconColor: '#2563EB',
    accentColor: '#BFDBFE',
  },
  first_verifier: {
    bezelColor: '#34D399',
    bezelShadow: '#059669',
    innerBg: '#ECFDF5',
    iconColor: '#059669',
    accentColor: '#A7F3D0',
  },
  ready_scout: {
    bezelColor: '#818CF8',
    bezelShadow: '#4F46E5',
    innerBg: '#EEF2FF',
    iconColor: '#4F46E5',
    accentColor: '#C7D2FE',
  },
  location_scout: {
    bezelColor: '#2DD4BF',
    bezelShadow: '#0D9488',
    innerBg: '#F0FDFA',
    iconColor: '#0D9488',
    accentColor: '#99F6E4',
  },
  quick_responder: {
    bezelColor: '#FBBF24',
    bezelShadow: '#D97706',
    innerBg: '#FEF3C7',
    iconColor: '#D97706',
    accentColor: '#FDE68A',
  },

  // Pothole & Road Specialists
  pothole_novice: {
    bezelColor: '#FB923C',
    bezelShadow: '#EA580C',
    innerBg: '#FFF7ED',
    iconColor: '#EA580C',
    accentColor: '#FED7AA',
  },
  pothole_patrol: {
    bezelColor: '#F97316',
    bezelShadow: '#C2410C',
    innerBg: '#FFEDD5',
    iconColor: '#C2410C',
    accentColor: '#FDBA74',
  },
  pothole_hunter: {
    bezelColor: '#EF4444',
    bezelShadow: '#B91C1C',
    innerBg: '#FEE2E2',
    iconColor: '#DC2626',
    accentColor: '#FCA5A5',
  },
  pothole_master: {
    bezelColor: '#DC2626',
    bezelShadow: '#991B1B',
    innerBg: '#FEF2F2',
    iconColor: '#B91C1C',
    accentColor: '#F87171',
    badgeType: 'scene_trophy',
  },
  pothole_legend: {
    bezelColor: '#EAB308',
    bezelShadow: '#CA8A04',
    innerBg: '#FEF08A',
    iconColor: '#A16207',
    accentColor: '#FDE047',
    badgeType: 'scene_star',
  },
  road_doctor_1: {
    bezelColor: '#38BDF8',
    bezelShadow: '#0369A1',
    innerBg: '#E0F2FE',
    iconColor: '#0284C7',
    accentColor: '#7DD3FC',
  },
  road_doctor_2: {
    bezelColor: '#6366F1',
    bezelShadow: '#4338CA',
    innerBg: '#EEF2FF',
    iconColor: '#4F46E5',
    accentColor: '#A5B4FC',
  },
  road_doctor_3: {
    bezelColor: '#A855F7',
    bezelShadow: '#7E22CE',
    innerBg: '#FAF5FF',
    iconColor: '#9333EA',
    accentColor: '#D8B4FE',
    badgeType: 'scene_city',
  },

  // Lighting & Night Ops
  lamp_spotter: {
    bezelColor: '#FCD34D',
    bezelShadow: '#D97706',
    innerBg: '#FEF9C3',
    iconColor: '#D97706',
    accentColor: '#FDE68A',
  },
  night_watch_1: {
    bezelColor: '#F59E0B',
    bezelShadow: '#B45309',
    innerBg: '#1E293B',
    iconColor: '#FBBF24',
    accentColor: '#FDE68A',
    badgeType: 'scene_night',
  },
  night_watch_2: {
    bezelColor: '#6366F1',
    bezelShadow: '#3730A3',
    innerBg: '#0F172A',
    iconColor: '#818CF8',
    accentColor: '#C7D2FE',
    badgeType: 'scene_night',
  },
  night_watch_3: {
    bezelColor: '#8B5CF6',
    bezelShadow: '#5B21B6',
    innerBg: '#1E1B4B',
    iconColor: '#FDE047',
    accentColor: '#C4B5FD',
    badgeType: 'scene_night',
  },
  midnight_owl: {
    bezelColor: '#475569',
    bezelShadow: '#1E293B',
    innerBg: '#0F172A',
    iconColor: '#94A3B8',
    accentColor: '#CBD5E1',
    badgeType: 'scene_night',
  },
  dawn_patrol: {
    bezelColor: '#FB923C',
    bezelShadow: '#EA580C',
    innerBg: '#FFEDD5',
    iconColor: '#EA580C',
    accentColor: '#FDBA74',
  },

  // Waste & Cleanliness
  eco_starter: {
    bezelColor: '#4ADE80',
    bezelShadow: '#16A34A',
    innerBg: '#DCFCE7',
    iconColor: '#16A34A',
    accentColor: '#86EFAC',
  },
  eco_warrior: {
    bezelColor: '#22C55E',
    bezelShadow: '#15803D',
    innerBg: '#BBF7D0',
    iconColor: '#15803D',
    accentColor: '#4ADE80',
  },
  eco_sentinel: {
    bezelColor: '#10B981',
    bezelShadow: '#047857',
    innerBg: '#D1FAE5',
    iconColor: '#047857',
    accentColor: '#6EE7B7',
  },
  eco_champion: {
    bezelColor: '#059669',
    bezelShadow: '#064E3B',
    innerBg: '#ECFDF5',
    iconColor: '#059669',
    accentColor: '#34D399',
    badgeType: 'scene_city',
  },
  eco_legend: {
    bezelColor: '#14B8A6',
    bezelShadow: '#0F766E',
    innerBg: '#CCFBF1',
    iconColor: '#0F766E',
    accentColor: '#5EEAD4',
    badgeType: 'scene_star',
  },
  speedy_cleaner: {
    bezelColor: '#F59E0B',
    bezelShadow: '#B45309',
    innerBg: '#FEF3C7',
    iconColor: '#D97706',
    accentColor: '#FDE68A',
  },

  // Community Verifications
  verify_bronze: {
    bezelColor: '#94A3B8',
    bezelShadow: '#475569',
    innerBg: '#F1F5F9',
    iconColor: '#475569',
    accentColor: '#CBD5E1',
  },
  verify_silver: {
    bezelColor: '#64748B',
    bezelShadow: '#334155',
    innerBg: '#E2E8F0',
    iconColor: '#334155',
    accentColor: '#94A3B8',
  },
  verify_gold: {
    bezelColor: '#FBBF24',
    bezelShadow: '#D97706',
    innerBg: '#FEF3C7',
    iconColor: '#B45309',
    accentColor: '#FDE68A',
    badgeType: 'scene_trophy',
  },
  verify_platinum: {
    bezelColor: '#38BDF8',
    bezelShadow: '#0284C7',
    innerBg: '#E0F2FE',
    iconColor: '#0369A1',
    accentColor: '#7DD3FC',
  },
  verify_diamond: {
    bezelColor: '#818CF8',
    bezelShadow: '#4338CA',
    innerBg: '#EEF2FF',
    iconColor: '#3730A3',
    accentColor: '#A5B4FC',
    badgeType: 'scene_star',
  },
  double_check: {
    bezelColor: '#F87171',
    bezelShadow: '#DC2626',
    innerBg: '#FEE2E2',
    iconColor: '#DC2626',
    accentColor: '#FCA5A5',
  },
  hawk_eye: {
    bezelColor: '#A78BFA',
    bezelShadow: '#7C3AED',
    innerBg: '#EDE9FE',
    iconColor: '#6D28D9',
    accentColor: '#C4B5FD',
  },
  peer_trusted: {
    bezelColor: '#34D399',
    bezelShadow: '#059669',
    innerBg: '#D1FAE5',
    iconColor: '#059669',
    accentColor: '#6EE7B7',
  },

  // Restoration & Proof
  fix_witness: {
    bezelColor: '#F97316',
    bezelShadow: '#C2410C',
    innerBg: '#FFEDD5',
    iconColor: '#EA580C',
    accentColor: '#FDBA74',
  },
  fix_agent: {
    bezelColor: '#10B981',
    bezelShadow: '#047857',
    innerBg: '#D1FAE5',
    iconColor: '#059669',
    accentColor: '#6EE7B7',
    badgeType: 'scene_wrench',
  },
  fix_champion: {
    bezelColor: '#EAB308',
    bezelShadow: '#CA8A04',
    innerBg: '#FEF08A',
    iconColor: '#A16207',
    accentColor: '#FDE047',
    badgeType: 'scene_trophy',
  },
  fix_legend: {
    bezelColor: '#EC4899',
    bezelShadow: '#BE185D',
    innerBg: '#FCE7F3',
    iconColor: '#DB2777',
    accentColor: '#F472B6',
    badgeType: 'scene_city',
  },
  before_after: {
    bezelColor: '#6366F1',
    bezelShadow: '#4338CA',
    innerBg: '#EEF2FF',
    iconColor: '#4F46E5',
    accentColor: '#A5B4FC',
  },
  zero_hazard: {
    bezelColor: '#14B8A6',
    bezelShadow: '#0F766E',
    innerBg: '#CCFBF1',
    iconColor: '#0D9488',
    accentColor: '#5EEAD4',
    badgeType: 'scene_star',
  },

  // Streaks & Consistency
  streak_3: {
    bezelColor: '#F97316',
    bezelShadow: '#C2410C',
    innerBg: '#FFEDD5',
    iconColor: '#EA580C',
    accentColor: '#FDBA74',
    badgeType: 'scene_flame',
  },
  streak_7: {
    bezelColor: '#EF4444',
    bezelShadow: '#B91C1C',
    innerBg: '#FEE2E2',
    iconColor: '#DC2626',
    accentColor: '#F87171',
    badgeType: 'scene_flame',
  },
  streak_14: {
    bezelColor: '#F59E0B',
    bezelShadow: '#B45309',
    innerBg: '#FEF3C7',
    iconColor: '#D97706',
    accentColor: '#FDE68A',
    badgeType: 'scene_flame',
  },
  streak_30: {
    bezelColor: '#8B5CF6',
    bezelShadow: '#6D28D9',
    innerBg: '#EDE9FE',
    iconColor: '#7C3AED',
    accentColor: '#C4B5FD',
    badgeType: 'scene_flame',
  },
  streak_60: {
    bezelColor: '#06B6D4',
    bezelShadow: '#0891B2',
    innerBg: '#CFFAFE',
    iconColor: '#0891B2',
    accentColor: '#67E8F9',
    badgeType: 'scene_flame',
  },
  streak_100: {
    bezelColor: '#EAB308',
    bezelShadow: '#A16207',
    innerBg: '#FEF08A',
    iconColor: '#A16207',
    accentColor: '#FDE047',
    badgeType: 'scene_flame',
  },
  weekend_hero: {
    bezelColor: '#38BDF8',
    bezelShadow: '#0284C7',
    innerBg: '#E0F2FE',
    iconColor: '#0284C7',
    accentColor: '#7DD3FC',
  },
  holiday_keeper: {
    bezelColor: '#EC4899',
    bezelShadow: '#BE185D',
    innerBg: '#FCE7F3',
    iconColor: '#DB2777',
    accentColor: '#F472B6',
  },

  // Milestone Hexagons & AI
  milestone_10: {
    bezelColor: '#60A5FA',
    bezelShadow: '#1D4ED8',
    innerBg: '#EFF6FF',
    iconColor: '#1D4ED8',
    accentColor: '#93C5FD',
    shape: 'hexagon',
    milestoneNum: '10',
  },
  milestone_25: {
    bezelColor: '#38BDF8',
    bezelShadow: '#0369A1',
    innerBg: '#E0F2FE',
    iconColor: '#0369A1',
    accentColor: '#7DD3FC',
    shape: 'hexagon',
    milestoneNum: '25',
  },
  milestone_50: {
    bezelColor: '#94A3B8',
    bezelShadow: '#334155',
    innerBg: '#F1F5F9',
    iconColor: '#334155',
    accentColor: '#CBD5E1',
    shape: 'hexagon',
    milestoneNum: '50',
  },
  milestone_100: {
    bezelColor: '#F59E0B',
    bezelShadow: '#B45309',
    innerBg: '#FEF3C7',
    iconColor: '#B45309',
    accentColor: '#FDE68A',
    shape: 'hexagon',
    milestoneNum: '100',
  },
  milestone_250: {
    bezelColor: '#A855F7',
    bezelShadow: '#6B21A8',
    innerBg: '#FAF5FF',
    iconColor: '#6B21A8',
    accentColor: '#D8B4FE',
    shape: 'hexagon',
    milestoneNum: '250',
  },
  ai_visionary: {
    bezelColor: '#A855F7',
    bezelShadow: '#6366F1',
    innerBg: '#F3E8FF',
    iconColor: '#7C3AED',
    accentColor: '#D8B4FE',
    badgeType: 'scene_star',
  },
};

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
  const config = BADGE_ART_CONFIGS[normId] || {
    bezelColor: '#60A5FA',
    bezelShadow: '#1D4ED8',
    innerBg: '#EFF6FF',
    iconColor: '#1D4ED8',
    accentColor: '#93C5FD',
  };

  const isHexagon = config.shape === 'hexagon';
  const outerRadius = isHexagon ? Math.round(size * 0.22) : size / 2;
  const innerSize = Math.round(size * 0.74);
  const innerRadius = isHexagon ? Math.round(innerSize * 0.18) : innerSize / 2;
  const iconSize = Math.round(size * 0.4);
  const strokeWidth = 2.4;

  const renderBadgeContent = () => {
    const color = isUnlocked ? config.iconColor : '#94A3B8';

    if (config.milestoneNum) {
      return (
        <View style={styles.milestoneCenter}>
          <Text
            style={[
              styles.milestoneText,
              {
                fontSize: Math.round(size * 0.32),
                color: isUnlocked ? config.iconColor : '#94A3B8',
              },
            ]}
          >
            {config.milestoneNum}
          </Text>
        </View>
      );
    }

    if (config.badgeType === 'scene_city') {
      return <Building2 size={iconSize} color={color} strokeWidth={strokeWidth} />;
    }
    if (config.badgeType === 'scene_night') {
      return <Moon size={iconSize} color={color} strokeWidth={strokeWidth} />;
    }
    if (config.badgeType === 'scene_flame') {
      return <Flame size={iconSize} color={color} strokeWidth={strokeWidth} />;
    }
    if (config.badgeType === 'scene_trophy') {
      return <Trophy size={iconSize} color={color} strokeWidth={strokeWidth} />;
    }
    if (config.badgeType === 'scene_star') {
      return <Star size={iconSize} color={color} fill={isUnlocked ? color : 'transparent'} strokeWidth={strokeWidth} />;
    }
    if (config.badgeType === 'scene_wrench') {
      return <Wrench size={iconSize} color={color} strokeWidth={strokeWidth} />;
    }

    // Default icon mappings
    switch (normId) {
      case 'first_step':
        return <Compass size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'sharp_eye':
        return <Camera size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'first_verifier':
        return <Eye size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'ready_scout':
        return <Award size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'location_scout':
        return <MapPin size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'quick_responder':
        return <Zap size={iconSize} color={color} strokeWidth={strokeWidth} />;

      case 'pothole_novice':
      case 'pothole_patrol':
      case 'pothole_hunter':
        return <AlertTriangle size={iconSize} color={color} strokeWidth={strokeWidth} />;

      case 'lamp_spotter':
        return <Lightbulb size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'dawn_patrol':
        return <Sunrise size={iconSize} color={color} strokeWidth={strokeWidth} />;

      case 'eco_starter':
      case 'eco_warrior':
      case 'eco_sentinel':
        return <Trash2 size={iconSize} color={color} strokeWidth={strokeWidth} />;

      case 'verify_bronze':
      case 'verify_silver':
      case 'verify_platinum':
        return <CheckCheck size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'double_check':
        return <TrendingUp size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'hawk_eye':
        return <Target size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'peer_trusted':
        return <HeartHandshake size={iconSize} color={color} strokeWidth={strokeWidth} />;

      case 'fix_witness':
      case 'before_after':
        return <CheckCircle2 size={iconSize} color={color} strokeWidth={strokeWidth} />;

      case 'weekend_hero':
        return <Flag size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'holiday_keeper':
        return <Sparkles size={iconSize} color={color} strokeWidth={strokeWidth} />;

      case 'ai_visionary':
        return <Bot size={iconSize} color={color} strokeWidth={strokeWidth} />;

      default:
        return <ShieldCheck size={iconSize} color={color} strokeWidth={strokeWidth} />;
    }
  };

  if (!isUnlocked) {
    return (
      <View
        style={[
          styles.bezelOuter,
          {
            width: size,
            height: size,
            borderRadius: outerRadius,
            backgroundColor: '#CBD5E1',
            borderBottomColor: '#94A3B8',
            borderBottomWidth: Math.max(3, Math.round(size * 0.08)),
          },
        ]}
      >
        <View
          style={[
            styles.innerCanvas,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerRadius,
              backgroundColor: '#F1F5F9',
              borderColor: '#E2E8F0',
            },
          ]}
        >
          {renderBadgeContent()}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.bezelOuter,
        {
          width: size,
          height: size,
          borderRadius: outerRadius,
          backgroundColor: config.bezelColor,
          borderBottomColor: config.bezelShadow,
          borderBottomWidth: Math.max(3, Math.round(size * 0.08)),
          shadowColor: config.bezelShadow,
        },
      ]}
    >
      {/* Glossy top bevel highlight */}
      <View
        style={[
          styles.innerCanvas,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerRadius,
            backgroundColor: config.innerBg,
            borderColor: 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        {renderBadgeContent()}

        {/* Glint Star Sparkle */}
        <View style={styles.sparkleTopRight}>
          <Star
            size={Math.max(6, Math.round(size * 0.14))}
            color="#FFFFFF"
            fill="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bezelOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
  },
  innerCanvas: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  milestoneCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneText: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sparkleTopRight: {
    position: 'absolute',
    top: 2,
    right: 3,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 2,
  },
});
