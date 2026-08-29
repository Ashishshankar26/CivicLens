import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText,
        };
      case 'success':
        return {
          container: styles.successContainer,
          text: styles.successText,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseContainer,
        vStyles.container,
        size === 'sm' && styles.smContainer,
        size === 'lg' && styles.lgContainer,
        (disabled || loading) && styles.disabledContainer,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? COLORS.primary : '#FFF'}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.baseText,
              vStyles.text,
              size === 'sm' && styles.smText,
              size === 'lg' && styles.lgText,
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    gap: 8,
  },
  smContainer: {
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  lgContainer: {
    paddingVertical: 16,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
  },
  primaryContainer: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  secondaryContainer: {
    backgroundColor: COLORS.surfaceHighlight,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  dangerContainer: {
    backgroundColor: COLORS.error,
  },
  successContainer: {
    backgroundColor: COLORS.success,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  baseText: {
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  smText: {
    fontSize: 13,
  },
  lgText: {
    fontSize: 17,
  },
  primaryText: {
    color: COLORS.textInverse,
  },
  secondaryText: {
    color: COLORS.textPrimary,
  },
  outlineText: {
    color: COLORS.primary,
  },
  dangerText: {
    color: COLORS.textInverse,
  },
  successText: {
    color: COLORS.textInverse,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
});
