import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  LogOut,
  Trash2,
  Camera,
  Bell,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';

const { width } = Dimensions.get('window');

export interface ModernAlertConfig {
  visible: boolean;
  title: string;
  message?: string;
  icon?: 'logout' | 'info' | 'warning' | 'success' | 'delete' | 'camera' | 'bell' | 'sparkles';
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const ModernAlertModal: React.FC<ModernAlertConfig> = ({
  visible,
  title,
  message,
  icon = 'info',
  confirmText = 'OK',
  cancelText,
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const renderIcon = () => {
    switch (icon) {
      case 'logout':
        return (
          <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
            <LogOut size={26} color="#EF4444" strokeWidth={2.4} />
          </View>
        );
      case 'delete':
        return (
          <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
            <Trash2 size={26} color="#DC2626" strokeWidth={2.4} />
          </View>
        );
      case 'warning':
        return (
          <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
            <AlertTriangle size={26} color="#D97706" strokeWidth={2.4} />
          </View>
        );
      case 'success':
        return (
          <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
            <CheckCircle2 size={26} color="#059669" strokeWidth={2.4} />
          </View>
        );
      case 'camera':
        return (
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <Camera size={26} color="#0066FF" strokeWidth={2.4} />
          </View>
        );
      case 'bell':
        return (
          <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
            <Bell size={26} color="#F59E0B" strokeWidth={2.4} />
          </View>
        );
      case 'sparkles':
        return (
          <View style={[styles.iconBox, { backgroundColor: '#FAF5FF' }]}>
            <Sparkles size={26} color="#9333EA" strokeWidth={2.4} />
          </View>
        );
      case 'info':
      default:
        return (
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
            <Info size={26} color="#0066FF" strokeWidth={2.4} />
          </View>
        );
    }
  };

  const getConfirmBtnStyle = () => {
    if (confirmVariant === 'danger') return styles.dangerBtn;
    if (confirmVariant === 'success') return styles.successBtn;
    return styles.primaryBtn;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel || onConfirm}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header Icon */}
          <View style={styles.iconCenter}>{renderIcon()}</View>

          {/* Title & Message */}
          <Text style={styles.titleText}>{title}</Text>
          {message ? <Text style={styles.messageText}>{message}</Text> : null}

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            {cancelText && onCancel && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.confirmBtn, getConfirmBtnStyle(), !cancelText && { flex: 1 }]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  card: {
    width: Math.min(width - 48, 340),
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.floating,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCenter: {
    marginBottom: 14,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.subtle,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
  },
  dangerBtn: {
    backgroundColor: '#EF4444',
  },
  successBtn: {
    backgroundColor: '#10B981',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
