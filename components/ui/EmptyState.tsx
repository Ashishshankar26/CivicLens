import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { CheckCircle, AlertTriangle, FileText, Plus } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  type?: 'reports' | 'filter' | 'success';
  actionTitle?: string;
  buttonTitle?: string;
  onAction?: () => void;
  onButtonPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  type = 'reports',
  actionTitle,
  buttonTitle,
  onAction,
  onButtonPress,
}) => {
  const effectiveActionTitle = actionTitle || buttonTitle;
  const effectiveOnAction = onAction || onButtonPress;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={34} color={COLORS.success} strokeWidth={1.8} />;
      case 'filter':
        return <AlertTriangle size={34} color={COLORS.warning} strokeWidth={1.8} />;
      default:
        return <FileText size={34} color={COLORS.primary} strokeWidth={1.8} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Decorative Background Dots */}
      <View style={styles.decoDotsLayer}>
        <View style={[styles.decoDot, styles.decoDot1]} />
        <View style={[styles.decoDot, styles.decoDot2]} />
        <View style={[styles.decoDot, styles.decoDot3]} />
        <View style={[styles.decoDot, styles.decoDot4]} />
      </View>

      <View style={styles.iconCircle}>{renderIcon()}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {effectiveActionTitle && effectiveOnAction && (
        <TouchableOpacity
          style={styles.btn}
          onPress={effectiveOnAction}
          activeOpacity={0.85}
        >
          <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.btnText}>{effectiveActionTitle}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl + 8,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
    position: 'relative',
    overflow: 'hidden',
  },
  decoDotsLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  decoDot: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.primaryLight,
  },
  decoDot1: {
    width: 48,
    height: 48,
    top: -12,
    right: -8,
    opacity: 0.6,
  },
  decoDot2: {
    width: 28,
    height: 28,
    bottom: 12,
    left: -6,
    opacity: 0.4,
  },
  decoDot3: {
    width: 18,
    height: 18,
    top: 20,
    left: 30,
    opacity: 0.3,
  },
  decoDot4: {
    width: 36,
    height: 36,
    bottom: -10,
    right: 40,
    opacity: 0.25,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
    marginBottom: SPACING.md,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    ...SHADOWS.small,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13.5,
  },
});
