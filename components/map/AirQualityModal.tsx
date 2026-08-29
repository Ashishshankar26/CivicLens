import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { AirQualityData } from '@/services/analytics/airQualityService';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { Wind, X, ShieldAlert, CheckCircle2, AlertTriangle, Sparkles, Activity } from 'lucide-react-native';

interface AirQualityModalProps {
  data: AirQualityData | null;
  visible: boolean;
  onClose: () => void;
}

export const AirQualityModal: React.FC<AirQualityModalProps> = ({
  data,
  visible,
  onClose,
}) => {
  if (!data) return null;

  // Calculate percentage fill for progress bars (0 to 100 max safe reference)
  const pm25Pct = Math.min(100, Math.round((data.pm2_5 / 75) * 100));
  const pm10Pct = Math.min(100, Math.round((data.pm10 / 150) * 100));
  const dustPct = Math.min(100, Math.round((data.dust / 100) * 100));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Header Handle */}
              <View style={styles.handle} />

              {/* Title Header */}
              <View style={styles.headerRow}>
                <View style={styles.titleGroup}>
                  <View style={[styles.iconCircle, { backgroundColor: data.color + '20' }]}>
                    <Wind size={22} color={data.color} />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>Live Air Quality (AQI)</Text>
                    <Text style={styles.headerSubtitle}>Open-Meteo Real-Time Telemetry</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Giant AQI Meter Card */}
                <View style={[styles.gaugeCard, { borderColor: data.color + '40' }]}>
                  <View style={[styles.gaugeRing, { borderColor: data.color }]}>
                    <Text style={[styles.aqiNumber, { color: data.color }]}>{data.aqi}</Text>
                    <Text style={styles.aqiUnit}>US AQI</Text>
                  </View>

                  <View style={styles.gaugeInfo}>
                    <View style={[styles.statusBadge, { backgroundColor: data.color }]}>
                      <Text style={styles.statusText}>{data.label.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.gaugeSubtitle}>
                      {data.aqi <= 50
                        ? 'Clean & Healthy Air'
                        : data.aqi <= 100
                        ? 'Acceptable Outdoor Air'
                        : 'Elevated Air Pollution'}
                    </Text>
                  </View>
                </View>

                {/* Pollutants Breakdown Section */}
                <Text style={styles.sectionTitle}>Key Air Pollutants</Text>

                <View style={styles.pollutantsList}>
                  {/* PM2.5 */}
                  <View style={styles.pollutantRow}>
                    <View style={styles.pollutantInfo}>
                      <Text style={styles.pollutantName}>PM 2.5 (Fine Particulates)</Text>
                      <Text style={styles.pollutantVal}>{data.pm2_5} µg/m³</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${pm25Pct}%`,
                            backgroundColor: pm25Pct > 60 ? '#EF4444' : pm25Pct > 35 ? '#F59E0B' : '#10B981',
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* PM10 */}
                  <View style={styles.pollutantRow}>
                    <View style={styles.pollutantInfo}>
                      <Text style={styles.pollutantName}>PM 10 (Coarse Particulates)</Text>
                      <Text style={styles.pollutantVal}>{data.pm10} µg/m³</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${pm10Pct}%`,
                            backgroundColor: pm10Pct > 60 ? '#EF4444' : pm10Pct > 35 ? '#F59E0B' : '#10B981',
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Dust */}
                  <View style={styles.pollutantRow}>
                    <View style={styles.pollutantInfo}>
                      <Text style={styles.pollutantName}>Dust Concentration</Text>
                      <Text style={styles.pollutantVal}>{data.dust} µg/m³</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${dustPct}%`,
                            backgroundColor: dustPct > 60 ? '#EF4444' : dustPct > 35 ? '#F59E0B' : '#10B981',
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                {/* Health Guidance Card */}
                <View style={[styles.healthCard, { backgroundColor: data.color + '12', borderColor: data.color + '35' }]}>
                  <View style={styles.healthHeader}>
                    <Sparkles size={16} color={data.color} />
                    <Text style={[styles.healthTitle, { color: data.color }]}>Citizen Health Guidance</Text>
                  </View>
                  <Text style={styles.healthText}>{data.recommendation}</Text>
                </View>
              </ScrollView>

              {/* Close Action Button */}
              <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
                <Text style={styles.doneBtnText}>Close Dashboard</Text>
              </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    maxHeight: 380,
  },
  gaugeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1.5,
    gap: 16,
    marginBottom: 14,
  },
  gaugeRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aqiNumber: {
    fontSize: 26,
    fontWeight: '900',
  },
  aqiUnit: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginTop: -2,
  },
  gaugeInfo: {
    flex: 1,
    gap: 6,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  gaugeSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  pollutantsList: {
    gap: 10,
    marginBottom: 14,
  },
  pollutantRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  pollutantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollutantName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  pollutantVal: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  healthCard: {
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    gap: 6,
    marginBottom: 6,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  healthText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
  doneBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 4,
    ...SHADOWS.small,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
