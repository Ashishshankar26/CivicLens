import React from 'react';
import { View, StyleSheet } from 'react-native';
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
} from 'lucide-react-native';

export interface BadgeStyleConfig {
  bgColor: string;
  borderColor: string;
  innerBg: string;
  iconColor: string;
  shadowColor: string;
}

const BADGE_CONFIGS: Record<string, BadgeStyleConfig> = {
  first_spot: {
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    innerBg: '#FFFFFF',
    iconColor: '#0284C7',
    shadowColor: '#0284C7',
  },
  road_scout: {
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    innerBg: '#FFFFFF',
    iconColor: '#D97706',
    shadowColor: '#D97706',
  },
  community_sentinel: {
    bgColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    innerBg: '#FFFFFF',
    iconColor: '#4F46E5',
    shadowColor: '#4F46E5',
  },
  hazard_hunter: {
    bgColor: '#FEF2F2',
    borderColor: '#FECDD3',
    innerBg: '#FFFFFF',
    iconColor: '#E11D48',
    shadowColor: '#E11D48',
  },
  first_verifier: {
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    innerBg: '#FFFFFF',
    iconColor: '#059669',
    shadowColor: '#059669',
  },
  civic_guardian: {
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    innerBg: '#FFFFFF',
    iconColor: '#7C3AED',
    shadowColor: '#7C3AED',
  },
  road_restorer: {
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA',
    innerBg: '#FFFFFF',
    iconColor: '#EA580C',
    shadowColor: '#EA580C',
  },
  fixer_champion: {
    bgColor: '#FAF5FF',
    borderColor: '#E9D5FF',
    innerBg: '#FFFFFF',
    iconColor: '#9333EA',
    shadowColor: '#9333EA',
  },
  ai_visionary: {
    bgColor: '#F0FDFA',
    borderColor: '#99F6E4',
    innerBg: '#FFFFFF',
    iconColor: '#0D9488',
    shadowColor: '#0D9488',
  },
  streak_master: {
    bgColor: '#FFF1F2',
    borderColor: '#FECDD3',
    innerBg: '#FFFFFF',
    iconColor: '#F43F5E',
    shadowColor: '#F43F5E',
  },
  default: {
    bgColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    innerBg: '#FFFFFF',
    iconColor: '#0066FF',
    shadowColor: '#0066FF',
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

  const squircleRadius = Math.round(size * 0.28);
  const innerSize = Math.round(size * 0.68);
  const innerRadius = Math.round(innerSize * 0.26);
  const iconSize = Math.round(size * 0.42);
  const strokeWidth = 2.2;

  const renderBadgeIcon = () => {
    const color = isUnlocked ? config.iconColor : '#94A3B8';

    switch (normId) {
      case 'first_spot':
        return <Camera size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'road_scout':
        return <Compass size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'community_sentinel':
        return <Shield size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'hazard_hunter':
        return <Trophy size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'first_verifier':
        return <Eye size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'civic_guardian':
        return <ShieldCheck size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'road_restorer':
        return <Wrench size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'fixer_champion':
        return <Crown size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'ai_visionary':
        return <Bot size={iconSize} color={color} strokeWidth={strokeWidth} />;
      case 'streak_master':
        return <Flame size={iconSize} color={color} strokeWidth={strokeWidth} />;
      default:
        return <Award size={iconSize} color={color} strokeWidth={strokeWidth} />;
    }
  };

  if (!isUnlocked) {
    return (
      <View
        style={[
          styles.cardBase,
          {
            width: size,
            height: size,
            borderRadius: squircleRadius,
            backgroundColor: '#F8FAFC',
            borderColor: '#E2E8F0',
          },
        ]}
      >
        <View
          style={[
            styles.innerPill,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerRadius,
              backgroundColor: '#F1F5F9',
              borderColor: '#E2E8F0',
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
        styles.cardBase,
        {
          width: size,
          height: size,
          borderRadius: squircleRadius,
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          shadowColor: config.shadowColor,
        },
      ]}
    >
      <View
        style={[
          styles.innerPill,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerRadius,
            backgroundColor: config.innerBg,
            borderColor: 'rgba(255, 255, 255, 0.9)',
          },
        ]}
      >
        {renderBadgeIcon()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  innerPill: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
