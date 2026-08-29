import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { CheckCircle, AlertTriangle, FileText } from 'lucide-react-native';

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
        return <CheckCircle size={38} color={COLORS.success} />;
      case 'filter':
        return <AlertTriangle size={38} color={COLORS.warning} />;
      default:
        return <FileText size={38} color={COLORS.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>{renderIcon()}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {effectiveActionTitle && effectiveOnAction && (
        <TouchableOpacity
          style={styles.btn}
          onPress={effectiveOnAction}
          activeOpacity={0.85}
        >
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
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: SPACING.md,
  },
  btn: {
    marginTop: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    ...SHADOWS.small,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
