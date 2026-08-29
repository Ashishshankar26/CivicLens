import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
  Linking,
} from 'react-native';
import { PotholePredictionHotspot } from '@/services/analytics/potholePredictionService';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { CloudRain, AlertTriangle, ShieldAlert, ArrowRight, X, Droplets, MapPin, Navigation } from 'lucide-react-native';

interface PotholeHotspotModalProps {
  hotspot: PotholePredictionHotspot | null;
  visible: boolean;
  onClose: () => void;
  onReportEarlyHazard: (hotspot: PotholePredictionHotspot) => void;
}

export const PotholeHotspotModal: React.FC<PotholeHotspotModalProps> = ({
  hotspot,
  visible,
  onClose,
  onReportEarlyHazard,
}) => {
  if (!hotspot) return null;

  const isCritical = hotspot.riskLevel === 'CRITICAL';
  const isHigh = hotspot.riskLevel === 'HIGH';
  const themeColor = isCritical ? '#EF4444' : isHigh ? '#F97316' : '#EAB308';
  const themeBg = isCritical ? '#FEF2F2' : isHigh ? '#FFF7ED' : '#FEFCE8';

  const handleOpenMaps = () => {
    if (!hotspot) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${hotspot.latitude},${hotspot.longitude}(${encodeURIComponent(hotspot.locationName)})`,
      android: `geo:0,0?q=${hotspot.latitude},${hotspot.longitude}(${encodeURIComponent(hotspot.locationName)})`,
      default: `https://www.google.com/maps/search/?api=1&query=${hotspot.latitude},${hotspot.longitude}`,
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${hotspot.latitude},${hotspot.longitude}`);
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Header handle */}
              <View style={styles.handle} />

              {/* Title Header */}
              <View style={styles.headerRow}>
                <View style={styles.titleGroup}>
                  <View style={[styles.iconCircle, { backgroundColor: themeBg }]}>
                    <ShieldAlert size={22} color={themeColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.badgeRow}>
                      <Text style={[styles.riskBadgeText, { backgroundColor: themeColor }]}>
                        {hotspot.riskLevel} RISK • {hotspot.riskScore}%
                      </Text>
                      <View style={styles.liveTag}>
                        <CloudRain size={10} color="#0066FF" />
                        <Text style={styles.liveTagText}>Open-Meteo Data</Text>
                      </View>
                    </View>
                    <Text style={styles.locationTitle}>{hotspot.locationName}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Real Rain Metrics Grid */}
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <Droplets size={16} color="#0066FF" />
                    <Text style={styles.metricValue}>{hotspot.rainfallAccumulatedMm} mm</Text>
                    <Text style={styles.metricLabel}>30-Day Rain Depth</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <CloudRain size={16} color="#F59E0B" />
                    <Text style={styles.metricValue}>{hotspot.heavyRainDaysCount} Days</Text>
                    <Text style={styles.metricLabel}>Heavy Rain (&gt;25mm)</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <AlertTriangle size={16} color={themeColor} />
                    <Text style={styles.metricValue}>~{hotspot.predictedPotholesCount} Potholes</Text>
                    <Text style={styles.metricLabel}>Est. Formation</Text>
                  </View>
                </View>

                {/* AI Predictive Insight */}
                <View style={[styles.aiCard, { borderColor: themeColor + '40', backgroundColor: themeBg }]}>
                  <Text style={[styles.aiHeaderTitle, { color: themeColor }]}>
                    ⚡ AI Predictive Road Analysis
                  </Text>
                  <Text style={styles.aiText}>{hotspot.aiRecommendation}</Text>
                  <Text style={styles.rainDateNote}>
                    Based on real satellite rainfall telemetry recorded on {hotspot.lastRainDate}.
                  </Text>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.navBtn} onPress={handleOpenMaps} activeOpacity={0.8}>
                  <Navigation size={16} color="#0066FF" />
                  <Text style={styles.navBtnText}>Navigate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.reportBtn, { backgroundColor: themeColor }]}
                  onPress={() => {
                    onClose();
                    onReportEarlyHazard(hotspot);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.reportBtnText}>Report Early Warning</Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: '85%',
    gap: 14,
    ...SHADOWS.large,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riskBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0066FF',
  },
  locationTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    maxHeight: 340,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  aiCard: {
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    marginTop: 10,
    gap: 6,
  },
  aiHeaderTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  aiText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    fontWeight: '500',
  },
  rainDateNote: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 6,
  },
  navBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0066FF',
  },
  reportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    gap: 8,
    ...SHADOWS.small,
  },
  reportBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
