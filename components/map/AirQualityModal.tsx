import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AirQualityData } from '@/services/analytics/airQualityService';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { Wind, X, ShieldAlert, Sparkles, Activity, Info } from 'lucide-react-native';

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

  // Calculate indicator position percentage (0 to 350+ max scale)
  const aqiPct = Math.min(97, Math.max(3, Math.round((data.aqi / 350) * 100)));
  const pm25Pct = Math.min(97, Math.max(3, Math.round((data.pm2_5 / 150) * 100)));
  const pm10Pct = Math.min(97, Math.max(3, Math.round((data.pm10 / 300) * 100)));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissOverlay} activeOpacity={1} onPress={onClose} />
        <View style={styles.appleCard}>
          {/* Top Handle */}
          <View style={styles.handle} />

          {/* Top Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <Wind size={16} color="#007AFF" />
              <Text style={styles.headerCategoryText}>AIR QUALITY INDEX</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {/* Hero Apple Weather AQI Metric Card */}
            <View style={styles.heroSection}>
              <View style={styles.aqiNumberRow}>
                <Text style={styles.heroAqiNumber}>{data.aqi}</Text>
                <View style={styles.heroBadgeWrapper}>
                  <Text style={[styles.heroStatusText, { color: data.color }]}>
                    {data.label}
                  </Text>
                  <Text style={styles.heroSubText}>US AQI Telemetry</Text>
                </View>
              </View>

              <Text style={styles.heroDescText}>
                Air Quality Index is {data.aqi}, which is classified as {data.status.toLowerCase().replace('_', ' ')}. {data.recommendation}
              </Text>

              {/* Apple Weather Continuous Multi-Color Spectrum Slider */}
              <View style={styles.spectrumContainer}>
                <LinearGradient
                  colors={['#10B981', '#F59E0B', '#F97316', '#EF4444', '#8B5CF6', '#7F1D1D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.spectrumBar}
                />
                {/* Glowing Indicator Thumb */}
                <View
                  style={[
                    styles.spectrumThumb,
                    { left: `${aqiPct}%`, backgroundColor: data.color },
                  ]}
                />
              </View>

              <View style={styles.spectrumLabelsRow}>
                <Text style={styles.spectrumLabel}>0 Good</Text>
                <Text style={styles.spectrumLabel}>100</Text>
                <Text style={styles.spectrumLabel}>200</Text>
                <Text style={styles.spectrumLabel}>300+ Severe</Text>
              </View>
            </View>

            {/* Apple Weather Grid: Key Pollutants */}
            <Text style={styles.sectionHeader}>Pollutant Concentration</Text>

            <View style={styles.pollutantsGrid}>
              {/* PM2.5 Card */}
              <View style={styles.pollutantCard}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.pollutantTitle}>PM 2.5</Text>
                  <Text style={styles.pollutantValueText}>{data.pm2_5} µg/m³</Text>
                </View>
                <Text style={styles.pollutantDesc}>Fine Particulates</Text>

                {/* Mini Gradient Slider */}
                <View style={styles.miniSpectrumContainer}>
                  <LinearGradient
                    colors={['#10B981', '#F59E0B', '#F97316', '#EF4444', '#7F1D1D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.miniSpectrumBar}
                  />
                  <View style={[styles.miniSpectrumThumb, { left: `${pm25Pct}%` }]} />
                </View>
              </View>

              {/* PM10 Card */}
              <View style={styles.pollutantCard}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.pollutantTitle}>PM 10</Text>
                  <Text style={styles.pollutantValueText}>{data.pm10} µg/m³</Text>
                </View>
                <Text style={styles.pollutantDesc}>Coarse Inhalable Particulates</Text>

                {/* Mini Gradient Slider */}
                <View style={styles.miniSpectrumContainer}>
                  <LinearGradient
                    colors={['#10B981', '#F59E0B', '#F97316', '#EF4444', '#7F1D1D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.miniSpectrumBar}
                  />
                  <View style={[styles.miniSpectrumThumb, { left: `${pm10Pct}%` }]} />
                </View>
              </View>
            </View>

            {/* Apple Weather Health Advice Box */}
            <View style={[styles.appleAdviceCard, { borderColor: data.color + '40' }]}>
              <View style={styles.adviceHeaderRow}>
                <ShieldAlert size={18} color={data.color} />
                <Text style={[styles.adviceTitle, { color: data.color }]}>
                  Health Guidance
                </Text>
              </View>
              <Text style={styles.adviceBodyText}>{data.recommendation}</Text>
              {data.stationTime && (
                <Text style={styles.attributionText}>
                  Recorded at {data.stationTime} via Open-Meteo & WAQI Real-Time Telemetry
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Close Action Button */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  appleCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.lg,
    maxHeight: '88%',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerCategoryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 1.2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },
  scrollContent: {
    maxHeight: 460,
  },
  scrollContainer: {
    paddingBottom: 16,
    gap: 16,
  },
  heroSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.xl || 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  aqiNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  heroAqiNumber: {
    fontSize: 52,
    fontWeight: '900',
    color: '#1C1C1E',
    letterSpacing: -1,
  },
  heroBadgeWrapper: {
    gap: 2,
  },
  heroStatusText: {
    fontSize: 18,
    fontWeight: '800',
  },
  heroSubText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
  },
  heroDescText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    fontWeight: '500',
  },
  spectrumContainer: {
    height: 10,
    marginTop: 6,
    justifyContent: 'center',
    position: 'relative',
  },
  spectrumBar: {
    height: 6,
    borderRadius: 3,
    width: '100%',
  },
  spectrumThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    marginTop: -4,
    transform: [{ translateX: -7 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  spectrumLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  spectrumLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#8E8E93',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  pollutantsGrid: {
    gap: 10,
  },
  pollutantCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollutantTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  pollutantValueText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  pollutantDesc: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  miniSpectrumContainer: {
    height: 8,
    marginTop: 4,
    justifyContent: 'center',
    position: 'relative',
  },
  miniSpectrumBar: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  miniSpectrumThumb: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#475569',
    marginTop: -3,
    transform: [{ translateX: -5 }],
  },
  appleAdviceCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  adviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adviceTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  adviceBodyText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    fontWeight: '500',
  },
  attributionText: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
