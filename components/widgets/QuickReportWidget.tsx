import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import { Camera, Sparkles, ArrowRight } from 'lucide-react-native';

interface QuickReportWidgetProps {
  onPress: () => void;
}

export function QuickReportWidget({ onPress }: QuickReportWidgetProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.leftCol}>
        <View style={styles.tagRow}>
          <View style={styles.aiTag}>
            <Sparkles size={10} color="#FFFFFF" />
            <Text style={styles.aiTagText}>AI-Powered</Text>
          </View>
          <Text style={styles.subtitle}>Instant Urban Triage</Text>
        </View>

        <Text style={styles.title}>Report a Civic Issue</Text>
        <Text style={styles.description}>
          Snap a photo. CivicLens AI classifies the issue and checks nearby reports in seconds.
        </Text>

        <View style={styles.ctaRow}>
          <Text style={styles.ctaText}>Start Report</Text>
          <ArrowRight size={13} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Camera size={26} color="#FFFFFF" strokeWidth={2.4} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.button,
    overflow: 'hidden',
  },
  leftCol: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  aiTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
});
