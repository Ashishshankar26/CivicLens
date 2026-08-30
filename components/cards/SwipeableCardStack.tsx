import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  Sparkles,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

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

  // Helper title
  const hazardTitle =
    activeIssue.locationName ||
    `${activeIssue.category.replace('_', ' ').toUpperCase()} HAZARD`;

  return (
    <View style={styles.stackContainer}>
      {/* Stack Deck Header Controls */}
      <View style={styles.stackControlsHeader}>
        <View style={styles.counterPill}>
          <Sparkles size={11} color="#007AFF" />
          <Text style={styles.counterPillText}>
            HAZARD {currentIndex + 1} OF {issues.length}
          </Text>
        </View>

        <View style={styles.controlsBtnGroup}>
          <TouchableOpacity style={styles.navArrowBtn} onPress={handlePrev} activeOpacity={0.7}>
            <ChevronLeft size={16} color="#007AFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navArrowBtn} onPress={handleNext} activeOpacity={0.7}>
            <ChevronRight size={16} color="#007AFF" strokeWidth={2.5} />
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
            <View style={styles.bgCardOverlay} />
          </View>
        )}

        {/* Top Active Swipable Card (Depth Layer 1) */}
        <TouchableOpacity
          style={styles.activeCardLayer}
          onPress={() => onPressIssue(activeIssue.id)}
          activeOpacity={0.93}
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

          {/* Smooth Bottom Shadow Gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.85)']}
            locations={[0, 0.5, 1]}
            style={styles.cardGradientOverlay}
          />

          {/* Top Badges Floating Strip */}
          <View style={styles.topBadgesStrip}>
            <CategoryBadge category={activeIssue.category} size="md" />
            <StatusBadge status={activeIssue.status} size="md" />
          </View>

          {/* Compact Glassmorphic Bottom Info Sheet */}
          <View style={styles.glassBottomSheet}>
            {/* Title & Short Description */}
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitleText} numberOfLines={1}>
                {hazardTitle}
              </Text>
            </View>

            {activeIssue.description ? (
              <Text style={styles.sheetDescText} numberOfLines={1}>
                {activeIssue.description}
              </Text>
            ) : null}

            {/* Meta Row: Location + Verifications + Time */}
            <View style={styles.metaRowContainer}>
              <View style={styles.metaPill}>
                <MapPin size={11} color="#007AFF" />
                <Text style={styles.metaPillText} numberOfLines={1}>
                  {activeIssue.locationName || `${activeIssue.latitude.toFixed(3)}, ${activeIssue.longitude.toFixed(3)}`}
                </Text>
              </View>

              <View style={styles.metaPill}>
                <Flame size={11} color="#F97316" />
                <Text style={styles.metaPillText}>
                  {activeIssue.confirmationCount || 0} Verified
                </Text>
              </View>

              <Text style={styles.timeAgoText}>
                {formatRelativeTime(activeIssue.createdAt)}
              </Text>
            </View>

            {/* Quick Action Button Strip */}
            <View style={styles.inspectActionPill}>
              <Text style={styles.inspectActionText}>Inspect Full Hazard Report</Text>
              <View style={styles.actionArrowIconCircle}>
                <ArrowRight size={12} color="#FFFFFF" strokeWidth={2.5} />
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
    gap: 8,
    marginTop: 2,
  },
  stackControlsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.6)',
  },
  counterPillText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#007AFF',
    letterSpacing: 0.6,
  },
  controlsBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navArrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  deckContainer: {
    position: 'relative',
    height: 320,
    width: '100%',
    alignItems: 'center',
  },
  bgCardLayer: {
    position: 'absolute',
    top: 12,
    width: CARD_WIDTH - 20,
    height: 295,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    opacity: 0.65,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  bgCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  activeCardLayer: {
    position: 'absolute',
    top: 0,
    width: CARD_WIDTH,
    height: 310,
    borderRadius: 26,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
  },
  activeCardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
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
  glassBottomSheet: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 20,
    padding: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitleText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  sheetDescText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '500',
    lineHeight: 15,
  },
  metaRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    maxWidth: 120,
  },
  metaPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  timeAgoText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 'auto',
  },
  inspectActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginTop: 4,
  },
  inspectActionText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionArrowIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
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
