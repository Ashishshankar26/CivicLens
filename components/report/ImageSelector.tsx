import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { Camera, ImagePlus, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react-native';

interface ImageSelectorProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
  onImageRemoved?: () => void;
  isAnalyzing?: boolean;
  isLoading?: boolean;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  imageUri,
  onImageSelected,
  onImageRemoved,
  isAnalyzing = false,
  isLoading = false,
}) => {
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'CivicLens requires camera access to capture photos of road hazards.'
        );
        return;
      }

      // Setting allowsEditing to false prevents Android crop tool from producing black cropped buffers
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Camera Error', error?.message || 'Unable to capture photo. Please try again.');
    }
  };

  const handlePickGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Gallery Permission Required',
          'CivicLens requires photo library access to upload photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Gallery Error', error?.message || 'Unable to select photo. Please try again.');
    }
  };

  // If an image is selected, show preview with prominent Retake, Replace, and Remove buttons
  if (imageUri) {
    return (
      <View style={styles.container}>
        <View style={styles.previewCard}>
          <Image
            source={{ uri: imageUri }}
            style={styles.previewImage}
            resizeMode="cover"
          />

          <View style={styles.photoStatusBadge}>
            <CheckCircle2 size={13} color="#065F46" />
            <Text style={styles.photoStatusText}>Photo Attached</Text>
          </View>

          {isAnalyzing && (
            <View style={styles.analyzingOverlay}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.analyzingText}>AI analyzing photo...</Text>
            </View>
          )}
        </View>

        {/* Action Controls directly below the image */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.retakeBtn]}
            onPress={handleTakePhoto}
            activeOpacity={0.8}
          >
            <Camera size={16} color="#FFFFFF" />
            <Text style={styles.retakeBtnText}>Retake Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.galleryBtn]}
            onPress={handlePickGallery}
            activeOpacity={0.8}
          >
            <ImagePlus size={16} color={COLORS.textPrimary} />
            <Text style={styles.galleryBtnText}>Choose Gallery</Text>
          </TouchableOpacity>

          {onImageRemoved && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={onImageRemoved}
              activeOpacity={0.8}
            >
              <Trash2 size={16} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Empty state: Take Photo or Pick Gallery
  return (
    <View style={styles.uploadContainer}>
      <View style={styles.iconCircle}>
        <Camera size={28} color={COLORS.primary} />
      </View>
      <Text style={styles.uploadTitle}>Photo Evidence Required</Text>
      <Text style={styles.uploadSubtitle}>
        Capture a clear photo of the pothole, garbage, or streetlight.
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.primaryActionBtn]}
          onPress={handleTakePhoto}
          activeOpacity={0.8}
        >
          <Camera size={18} color="#FFF" />
          <Text style={styles.primaryActionText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.secondaryActionBtn]}
          onPress={handlePickGallery}
          activeOpacity={0.8}
        >
          <ImagePlus size={18} color={COLORS.textPrimary} />
          <Text style={styles.secondaryActionText}>From Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  previewCard: {
    width: '100%',
    height: 220,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  photoStatusBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
    ...SHADOWS.small,
  },
  photoStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  analyzingText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  retakeBtn: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  galleryBtn: {
    backgroundColor: COLORS.surfaceHighlight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  galleryBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  removeBtn: {
    padding: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    maxWidth: 240,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  primaryActionBtn: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  secondaryActionBtn: {
    backgroundColor: COLORS.surfaceHighlight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  primaryActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryActionText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
