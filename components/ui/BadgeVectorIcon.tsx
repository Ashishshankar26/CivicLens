import React from 'react';
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
  LucideIcon,
} from 'lucide-react-native';

const ICON_MAP: Record<string, LucideIcon> = {
  // First Spot: Photo & observation
  first_spot: Camera,
  'first spot': Camera,
  '🌟': Camera,
  camera: Camera,

  // Road Scout: Scouting road routes
  road_scout: Compass,
  'road scout': Compass,
  '🔍': Compass,
  compass: Compass,

  // Community Sentinel: Protecting neighborhoods
  community_sentinel: Shield,
  'community sentinel': Shield,
  '🛡️': Shield,
  shield: Shield,

  // Master Scout: Top-tier scout trophy
  hazard_hunter: Trophy,
  'master scout': Trophy,
  '🦅': Trophy,
  trophy: Trophy,

  // On-Site Verifier: Eyewitness on-site check
  first_verifier: Eye,
  'on-site verifier': Eye,
  'on site verifier': Eye,
  '👁️': Eye,
  eye: Eye,

  // Civic Guardian: Validated community shield
  civic_guardian: ShieldCheck,
  'civic guardian': ShieldCheck,
  '🎖️': ShieldCheck,
  shieldcheck: ShieldCheck,

  // First Restoration: Road repair tool
  road_restorer: Wrench,
  'first restoration': Wrench,
  '🛠️': Wrench,
  wrench: Wrench,

  // Fixer Champion: Repair verification crown
  fixer_champion: Crown,
  'fixer champion': Crown,
  '🏆': Crown,
  crown: Crown,

  // AI Visionary: Gemini AI neural bot
  ai_visionary: Bot,
  'ai visionary': Bot,
  '⚡': Bot,
  bot: Bot,

  // 7-Day Streaker: Active streak flame
  streak_master: Flame,
  '7-day streaker': Flame,
  '🔥': Flame,
  flame: Flame,

  default: Award,
};

interface BadgeVectorIconProps {
  id?: string;
  iconName?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const BadgeVectorIcon: React.FC<BadgeVectorIconProps> = ({
  id = 'default',
  iconName,
  size = 22,
  color = '#0066FF',
  strokeWidth = 2.3,
}) => {
  const normalizedIcon = (iconName || '').toLowerCase().trim();
  const normalizedId = (id || '').toLowerCase().trim();

  const IconComponent =
    ICON_MAP[normalizedIcon] ||
    ICON_MAP[normalizedId] ||
    ICON_MAP.default;

  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
};
