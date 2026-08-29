import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import { ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { formatRelativeTime } from '@/utils/formatters';

interface ResolutionComparisonCardProps {
  beforeImageUrl: string;
  afterImageUrl?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionProofNote?: string;
}

export function ResolutionComparisonCard({
  beforeImageUrl,
  afterImageUrl,
  resolvedAt,
  resolvedBy,
  resolutionProofNote,
}: ResolutionComparisonCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <ShieldCheck size={14} color="#059669" />
          <Text style={styles.badgeText}>Issue Resolved • Verified Proof</Text>
        </View>
        {resolvedAt && (
          <Text style={styles.resolvedTime}>{formatRelativeTime(resolvedAt)}</Text>
        )}
      </View>

      <View style={styles.comparisonGrid}>
        {/* Before Image */}
        <View style={styles.imageColumn}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: beforeImageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.beforePill}>
              <Text style={styles.beforePillText}>BEFORE</Text>
            </View>
          </View>
          <Text style={styles.imageCaption}>Reported Hazard</Text>
        </View>

        {/* After Image */}
        <View style={styles.imageColumn}>
          <View style={styles.imageWrapper}>
            <Image
              source={{
                uri:
                  afterImageUrl ||
                  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
              }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.afterPill}>
              <CheckCircle2 size={10} color="#FFFFFF" />
              <Text style={styles.afterPillText}>RESTORED</Text>
            </View>
          </View>
          <Text style={styles.imageCaption}>Repair Verified</Text>
        </View>
      </View>

      {resolutionProofNote && (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{resolutionProofNote}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    padding: 14,
    ...SHADOWS.card,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: -0.1,
  },
  resolvedTime: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  comparisonGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  imageColumn: {
    flex: 1,
    gap: 4,
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: 110,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  beforePill: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  beforePillText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  afterPill: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(5, 150, 105, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  afterPillText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  imageCaption: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  noteBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});
