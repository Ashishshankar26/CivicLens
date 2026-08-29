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
  Sparkles,
  Award,
  Star,
  Check,
} from 'lucide-react-native';
import { SHADOWS } from '@/constants/theme';

export interface BadgeStyleConfig {
  outerRing: string;
  middleRing: string;
  innerBg: string;
  accentColor: string;
  iconColor: string;
  shadowColor: string;
  shape: 'circle' | 'shield' | 'hexagon' | 'rosette' | 'diamond';
  tag: string;
}

const BADGE_CONFIGS: Record<string, BadgeStyleConfig> = {
  first_spot: {
    outerRing: '#38BDF8',
    middleRing: '#0284C7',
    innerBg: '#0C4A6E',
    accentColor: '#BAE6FD',
    iconColor: '#38BDF8',
    shadowColor: '#0284C7',
    shape: 'circle',
    tag: 'SCOUT LENS',
  },
  road_scout: {
    outerRing: '#F59E0B',
    middleRing: '#B45309',
    innerBg: '#1E293B',
    accentColor: '#FDE68A',
    iconColor: '#FBBF24',
    shadowColor: '#D97706',
    shape: 'rosette',
    tag: 'NAVIGATOR',
  },
  community_sentinel: {
    outerRing: '#60A5FA',
    middleRing: '#1D4ED8',
    innerBg: '#172554',
    accentColor: '#93C5FD',
    iconColor: '#FFFFFF',
    shadowColor: '#2563EB',
    shape: 'shield',
    tag: 'SENTINEL',
  },
  hazard_hunter: {
    outerRing: '#FBBF24',
    middleRing: '#D97706',
    innerBg: '#451A03',
    accentColor: '#FEF08A',
    iconColor: '#FDE047',
    shadowColor: '#B45309',
    shape: 'rosette',
    tag: 'MASTER',
  },
  first_verifier: {
    outerRing: '#34D399',
    middleRing: '#059669',
    innerBg: '#064E3B',
    accentColor: '#A7F3D0',
    iconColor: '#34D399',
    shadowColor: '#059669',
    shape: 'hexagon',
    tag: 'INSPECTOR',
  },
  civic_guardian: {
    outerRing: '#818CF8',
    middleRing: '#4338CA',
    innerBg: '#1E1B4B',
    accentColor: '#C7D2FE',
    iconColor: '#FFFFFF',
    shadowColor: '#4F46E5',
    shape: 'shield',
    tag: 'GUARDIAN',
  },
  road_restorer: {
    outerRing: '#FB923C',
    middleRing: '#C2410C',
    innerBg: '#431407',
    accentColor: '#FED7AA',
    iconColor: '#FDBA74',
    shadowColor: '#EA580C',
    shape: 'rosette',
    tag: 'RESTORER',
  },
  fixer_champion: {
    outerRing: '#EAB308',
    middleRing: '#A855F7',
    innerBg: '#3B0764',
    accentColor: '#FDE047',
    iconColor: '#FACC15',
    shadowColor: '#7E22CE',
    shape: 'rosette',
    tag: 'CHAMPION',
  },
  ai_visionary: {
    outerRing: '#A855F7',
    middleRing: '#6366F1',
    innerBg: '#1E1B4B',
    accentColor: '#38BDF8',
    iconColor: '#38BDF8',
    shadowColor: '#9333EA',
    shape: 'hexagon',
    tag: 'AI NEURAL',
  },
  streak_master: {
    outerRing: '#F87171',
    middleRing: '#DC2626',
    innerBg: '#450A0A',
    accentColor: '#FDE047',
    iconColor: '#F97316',
    shadowColor: '#EF4444',
    shape: 'circle',
    tag: 'STREAK',
  },
  default: {
    outerRing: '#60A5FA',
    middleRing: '#0284C7',
    innerBg: '#0F172A',
    accentColor: '#BAE6FD',
    iconColor: '#FFFFFF',
    shadowColor: '#0284C7',
    shape: 'circle',
    tag: 'BADGE',
  },
};

interface RealBadgeEmblemProps {
  id: string;
  size?: number;
  isUnlocked?: boolean;
}

export const RealBadgeEmblem: React.FC<RealBadgeEmblemProps> = ({
  id,
  size = 54,
  isUnlocked = true,
}) => {
  const normId = (id || '').toLowerCase().trim();
  const config = BADGE_CONFIGS[normId] || BADGE_CONFIGS.default;

  const iconSize = Math.round(size * 0.46);

  const renderBadgeIcon = () => {
    const iconColor = isUnlocked ? config.iconColor : '#94A3B8';
    const strokeWidth = 2.4;

    switch (normId) {
      case 'first_spot':
        return <Camera size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
      case 'road_scout':
        return <Compass size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
      case 'community_sentinel':
        return <Shield size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
      case 'hazard_hunter':
        return <Trophy size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
      case 'first_verifier':
        return <Eye size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
      case 'civic_guardian':
        return <ShieldCheck size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
      case 'road_restorer':
        return <Wrench size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
      case 'fixer_champion':
        return <Crown size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
      case 'ai_visionary':
        return <Bot size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
      case 'streak_master':
        return <Flame size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
      default:
        return <Award size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
    }
  };

  const outerRadius = size / 2;
  const middleSize = size * 0.84;
  const innerSize = size * 0.68;

  if (!isUnlocked) {
    return (
      <View
        style={[
          styles.emblemBase,
          {
            width: size,
            height: size,
            borderRadius: outerRadius,
            backgroundColor: '#1E293B',
            borderColor: '#334155',
            opacity: 0.6,
          },
        ]}
      >
        <View
          style={[
            styles.innerCircle,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: '#0F172A',
              borderColor: '#1E293B',
            },
          ]}
        >
          {renderBadgeIcon()}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.emblemBase,
        {
          width: size,
          height: size,
          borderRadius: outerRadius,
          backgroundColor: config.outerRing,
          borderColor: config.middleRing,
          shadowColor: config.shadowColor,
        },
      ]}
    >
      {/* Outer Metallic Bezel Ring */}
      <View
        style={[
          styles.middleBezel,
          {
            width: middleSize,
            height: middleSize,
            borderRadius: middleSize / 2,
            backgroundColor: config.middleRing,
            borderColor: config.accentColor,
          },
        ]}
      >
        {/* Deep Gem Core */}
        <View
          style={[
            styles.innerCircle,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: config.innerBg,
              borderColor: config.accentColor,
            },
          ]}
        >
          {renderBadgeIcon()}

          {/* Micro Sparkle Star Accent */}
          <View style={styles.microSparkle}>
            <Star size={Math.max(5, Math.round(size * 0.12))} color={config.accentColor} fill={config.accentColor} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emblemBase: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...SHADOWS.medium,
    position: 'relative',
  },
  middleBezel: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  microSparkle: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
});
