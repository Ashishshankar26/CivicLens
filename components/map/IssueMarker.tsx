import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CivicIssue } from '@/types/issue';
import { CATEGORIES } from '@/constants/categories';
import { COLORS, SHADOWS } from '@/constants/theme';
import {
  Trash2,
  Lightbulb,
  TriangleAlert,
  BadgeCheck,
  Zap,
  CircleDotDashed,
  Recycle,
  Construction,
} from 'lucide-react-native';

interface IssueMarkerProps {
  issue: CivicIssue;
  isSelected?: boolean;
  zoomScale?: number; // Dynamic zoom scaling factor
}

export const IssueMarker: React.FC<IssueMarkerProps> = ({
  issue,
  isSelected = false,
  zoomScale = 1.0,
}) => {
  const isResolved = issue.status === 'resolved';
  const meta = CATEGORIES[issue.category] || CATEGORIES.other;
  const isCritical = (issue.priorityScore || 50) >= 80 && !isResolved;

  const flagColor = isResolved ? '#10B981' : isCritical ? '#EF4444' : (meta.color || COLORS.primary);

  const renderIcon = () => {
    const iconSize = Math.max(12, Math.round(14 * zoomScale));

    if (isResolved) {
      return <BadgeCheck size={iconSize} color="#FFFFFF" strokeWidth={2.6} />;
    }

    switch (issue.category) {
      case 'pothole':
        return <CircleDotDashed size={iconSize} color="#FFFFFF" strokeWidth={2.6} />;
      case 'garbage':
        return <Recycle size={iconSize} color="#FFFFFF" strokeWidth={2.4} />;
      case 'streetlight':
        return <Lightbulb size={iconSize} color="#FFFFFF" strokeWidth={2.4} />;
      case 'road_damage':
        return <Construction size={iconSize} color="#FFFFFF" strokeWidth={2.4} />;
      case 'other':
      default:
        return <TriangleAlert size={iconSize} color="#FFFFFF" strokeWidth={2.4} />;
    }
  };

  // Base dimensions scaled by current zoom level
  const flagWidth = Math.round(38 * zoomScale);
  const flagHeight = Math.round(28 * zoomScale);
  const poleHeight = Math.round(18 * zoomScale);

  return (
    <View style={[styles.markerContainer, isSelected && styles.markerSelected]}>
      {/* Flag Banner */}
      <View
        style={[
          styles.flagBanner,
          {
            backgroundColor: flagColor,
            width: flagWidth,
            height: flagHeight,
            borderRadius: Math.round(7 * zoomScale),
          },
          isSelected && styles.flagBannerSelected,
        ]}
      >
        {renderIcon()}

        {/* Priority Status Dot */}
        {isCritical && (
          <View
            style={[
              styles.urgentDot,
              {
                width: Math.round(7 * zoomScale),
                height: Math.round(7 * zoomScale),
                borderRadius: Math.round(3.5 * zoomScale),
              },
            ]}
          />
        )}
      </View>

      {/* Flag Pole */}
      <View
        style={[
          styles.flagPole,
          {
            height: poleHeight,
            width: Math.max(2, Math.round(2.5 * zoomScale)),
            backgroundColor: '#1E293B',
          },
        ]}
      />

      {/* Flag Base Pin Dot */}
      <View
        style={[
          styles.flagBaseDot,
          {
            width: Math.round(6 * zoomScale),
            height: Math.round(6 * zoomScale),
            borderRadius: Math.round(3 * zoomScale),
            backgroundColor: flagColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  markerSelected: {
    transform: [{ scale: 1.2 }],
  },
  flagBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    position: 'relative',
  },
  flagBannerSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 2.5,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  urgentDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  flagPole: {
    borderRadius: 1,
  },
  flagBaseDot: {
    marginTop: -1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
});
