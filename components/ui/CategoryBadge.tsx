import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IssueCategory } from '@/types/issue';
import { CATEGORIES } from '@/constants/categories';
import { RADIUS, SPACING } from '@/constants/theme';
import {
  CircleDotDashed,
  Recycle,
  Lightbulb,
  Construction,
  TriangleAlert,
} from 'lucide-react-native';

interface CategoryBadgeProps {
  category: IssueCategory;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  showIcon = true,
  size = 'md',
}) => {
  const meta = CATEGORIES[category] || CATEGORIES.other;
  const iconSize = size === 'sm' ? 11 : 13;

  const renderIcon = () => {
    switch (category) {
      case 'pothole':
        return <CircleDotDashed size={iconSize} color={meta.color} strokeWidth={2.4} />;
      case 'garbage':
        return <Recycle size={iconSize} color={meta.color} strokeWidth={2.4} />;
      case 'streetlight':
        return <Lightbulb size={iconSize} color={meta.color} strokeWidth={2.4} />;
      case 'road_damage':
        return <Construction size={iconSize} color={meta.color} strokeWidth={2.4} />;
      default:
        return <TriangleAlert size={iconSize} color={meta.color} strokeWidth={2.4} />;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: meta.backgroundColor },
        size === 'sm' && styles.badgeSm,
      ]}
    >
      {showIcon && renderIcon()}
      <Text
        style={[
          styles.text,
          { color: meta.color },
          size === 'sm' && styles.textSm,
        ]}
      >
        {meta.shortLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 10.5,
    fontWeight: '800',
  },
});
