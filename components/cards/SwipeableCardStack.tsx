import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { CivicIssue } from '@/types/issue';
import { StatusBadge } from '../ui/StatusBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import { formatRelativeTime } from '@/utils/formatters';
import {
  MapPin,
  Users,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Flame,
  ShieldCheck,
  Compass,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 44;

interface SwipeableCardStackProps {
  issues: CivicIssue[];
  onPressIssue: (issueId: string) => void;
}

export function SwipeableCardStack({ issues, onPressIssue }: SwipeableCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!issues || issues.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Compass size={32} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No Hazards Logged Yet</Text>
        <Text style={styles.emptySub}>Switch tabs or report a new hazard to view cards here.</Text>
      </View>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % issues.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + issues.length) % issues.length);
  };

  const activeIssue = issues[currentIndex] || issues[0];
  const nextIssue = issues[(currentIndex + 1) % issues.length];

  return (
    <View style={styles.stackContainer}>
      {/* Cards Stack Header Controls */}
      <View style={styles.stackControlsHeader}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexBadgeText}>
            {currentIndex + 1} of {issues.length} Hazards
          </Text>
        </View>

        <View style={styles.controlsBtnGroup}>
          <TouchableOpacity style={styles.navArrowBtn} onPress={handlePrev} activeOpacity={0.7}>
            <ChevronLeft size={18} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navArrowBtn} onPress={handleNext} activeOpacity={0.7}>
            <ChevronRight size={18} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stack Deck Wrapper */}
      <View style={styles.deckContainer}>
        {/* Background Stack Card (Depth Layer 2) */}
        {issues.length > 1 && nextIssue && (
          <View style={styles.bgCardLayer}>
            <Image
              source={{
                uri:
                  nextIssue.imageUrl ||
                  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
              }}
              style={styles.bgImage}
            />
            <View style={styles.cardGradientOverlay} />
            <View style={styles.bgCardContentPreview}>
              <Text style={styles.bgCardTitle} numberOfLines={1}>
                {nextIssue.description || `${nextIssue.category} reported`}
              </Text>
            </View>
          </View>
        )}

        {/* Top Active Swipable Card (Depth Layer 1) */}
        <TouchableOpacity
          style={styles.activeCardLayer}
          onPress={() => onPressIssue(activeIssue.id)}
          activeOpacity={0.92}
        >
          {/* Card Hero Image */}
          <Image
            source={{
              uri:
                activeIssue.imageUrl ||
                'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
            }}
            style={styles.activeCardImage}
            resizeMode="cover"
          />

          {/* Dark Glass Gradient Overlay */}
          <View style={styles.cardGradientOverlay} />

          {/* Top Badges Floating Strip */}
          <View style={styles.topBadgesStrip}>
            <CategoryBadge category={activeIssue.category} size="md" />
            <StatusBadge status={activeIssue.status} size="md" />
          </View>

          {/* Bottom Content Info */}
          <View style={styles.activeCardBody}>
            <Text style={styles.activeCardTitle} numberOfLines={2}>
              {activeIssue.description || `${activeIssue.category.replace('_', ' ')} detected`}
            </Text>

            {/* Location & Time */}
            <View style={styles.metaRow}>
              <MapPin size={13} color="#CBD5E1" />
              <Text style={styles.locationText} numberOfLines={1}>
                {activeIssue.locationName || `${activeIssue.latitude.toFixed(4)}, ${activeIssue.longitude.toFixed(4)}`}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Users size={13} color="#CBD5E1" />
              <Text style={styles.metaSubText}>
                {activeIssue.confirmationCount || 0} Citizens Verified • {formatRelativeTime(activeIssue.createdAt)}
              </Text>
            </View>

            {/* Action Bar */}
            <View style={styles.cardActionBar}>
              <Text style={styles.actionBtnLabel}>Tap to Inspect Full Report</Text>
              <View style={styles.actionArrowCircle}>
                <ArrowRight size={14} color="#007AFF" strokeWidth={2.5} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stackContainer: {
    gap: 10,
    marginTop: 4,
  },
  stackControlsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  indexBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.6)',
  },
  indexBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#007AFF',
  },
  controlsBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deckContainer: {
    position: 'relative',
    height: 310,
    width: '100%',
    alignItems: 'center',
  },
  bgCardLayer: {
    position: 'absolute',
    top: 14,
    width: CARD_WIDTH - 20,
    height: 280,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    opacity: 0.7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  bgCardContentPreview: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
  },
  bgCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activeCardLayer: {
    position: 'absolute',
    top: 0,
    width: CARD_WIDTH,
    height: 295,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  activeCardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  topBadgesStrip: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeCardBody: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    gap: 6,
  },
  activeCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    fontSize: 11.5,
    color: '#E2E8F0',
    fontWeight: '600',
    flex: 1,
  },
  metaSubText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cardActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 4,
  },
  actionBtnLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionArrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.6)',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  emptySub: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
