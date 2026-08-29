import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';
import { Button } from './Button';
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
        return <CheckCircle size={44} color={COLORS.success} />;
      case 'filter':
        return <AlertTriangle size={44} color={COLORS.warning} />;
      default:
        return <FileText size={44} color={COLORS.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>{renderIcon()}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {effectiveActionTitle && effectiveOnAction && (
        <Button
          title={effectiveActionTitle}
          onPress={effectiveOnAction}
          variant="primary"
          size="md"
          style={styles.btn}
        />
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
    borderRadius: RADIUS.lg,
    marginVertical: SPACING.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 17,
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
    marginTop: SPACING.sm,
    minWidth: 160,
  },
});
