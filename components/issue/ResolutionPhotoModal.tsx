import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { Camera, Image as ImageIcon, CheckCircle2, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ResolutionPhotoModalProps {
  visible: boolean;
  onTakePhoto: () => void;
  onChooseGallery: () => void;
  onClose: () => void;
}

export const ResolutionPhotoModal: React.FC<ResolutionPhotoModalProps> = ({
  visible,
  onTakePhoto,
  onChooseGallery,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <X size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Icon Header */}
          <View style={styles.iconCircle}>
            <CheckCircle2 size={32} color="#059669" />
          </View>

          <Text style={styles.modalTitle}>Resolution Verification Proof</Text>
          <Text style={styles.modalSub}>
            Upload on-site photo evidence to confirm this hazard has been resolved for the community.
          </Text>

          {/* Action 1: Camera */}
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={onTakePhoto}
            activeOpacity={0.85}
          >
            <Camera size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Capture Photo with Camera</Text>
          </TouchableOpacity>

          {/* Action 2: Gallery */}
          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={onChooseGallery}
            activeOpacity={0.8}
          >
            <ImageIcon size={18} color={COLORS.primaryDark} />
            <Text style={styles.secondaryActionText}>Upload from Gallery</Text>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: Math.min(width - 40, 360),
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.floating,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#A7F3D0',
    ...SHADOWS.small,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: RADIUS.full,
    width: '100%',
    gap: 8,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    width: '100%',
    gap: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  secondaryActionText: {
    color: COLORS.primaryDark,
    fontWeight: '800',
    fontSize: 13,
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
});
