import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useIssues } from '@/contexts/IssuesContext';
import { CivicMapView } from '@/components/map/CivicMapView';
import { MapIssueCarousel, MapIssueCarouselRef } from '@/components/map/MapIssueCarousel';
import { IssueBottomSheet } from '@/components/map/IssueBottomSheet';
import { CATEGORY_LIST } from '@/constants/categories';
import { getCurrentLocation, getLastKnownLocation, LocationResult } from '@/services/location/locationService';
import { CivicIssue } from '@/types/issue';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { MapType } from 'react-native-maps';
import {
  Search,
  Layers,
  LocateFixed,
  Flame,
  ChevronDown,
  Plus,
  Check,
  Filter,
  Activity,
} from 'lucide-react-native';

export default function ModernMapScreen() {
  const insets = useSafeAreaInsets();
  const { issues, activeIssues } = useIssues();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'urgent' | 'active' | 'resolved'>('all');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationResult | null>(null);

  // Map Controls State
  const [mapType, setMapType] = useState<MapType>('standard');
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
  const [showStatusDropdown, setShowStatusDropdown] = useState<boolean>(false);
  const [urgentOnly, setUrgentOnly] = useState<boolean>(false);

  const carouselRef = useRef<MapIssueCarouselRef>(null);

  useEffect(() => {
    async function initLocation() {
      // 1. Instant cache load
      const cached = await getLastKnownLocation();
      if (cached) {
        setUserLocation(cached);
      }

      // 2. High-precision live GPS
      const res = await getCurrentLocation();
      if (res.location) {
        setUserLocation(res.location);
      }
    }
    initLocation();
  }, []);

  // Top Left Button 1: Cycle Map Type
  const handleToggleMapLayers = () => {
    setMapType((prev) => (prev === 'standard' ? 'satellite' : prev === 'satellite' ? 'hybrid' : 'standard'));
  };

  // Top Left Button 2: Re-center to live GPS
  const handleRecenterGPS = () => {
    setRecenterTrigger(Date.now());
  };

  // Top Left Button 3: Toggle Urgent filter
  const handleToggleUrgent = () => {
    setUrgentOnly((prev) => !prev);
  };

  // Filter issues based on search, category, status, and urgent toggle
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      !searchQuery.trim() ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === 'all' || issue.category === selectedCategory;

    const isUrgent = (issue.priorityScore || 50) >= 80;
    if (urgentOnly && !isUrgent) return false;

    if (statusFilter === 'urgent' && !isUrgent) return false;
    if (statusFilter === 'active' && issue.status !== 'active') return false;
    if (statusFilter === 'resolved' && issue.status !== 'resolved') return false;

    return matchesSearch && matchesCategory;
  });

  // Calculate live telemetry counts
  const activeCount = issues.filter((i) => i.status === 'active').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;

  const handleSelectIssueFromMap = (issue: CivicIssue) => {
    setSelectedIssueId(issue.id);
    if (carouselRef.current) {
      carouselRef.current.scrollToIssue(issue.id);
    }
  };

  const handleActiveIssueChangeFromCarousel = (issue: CivicIssue) => {
    setSelectedIssueId(issue.id);
  };

  const handleViewDetails = (issueId: string) => {
    router.push(`/issue/${issueId}`);
  };

  return (
    <View style={styles.container}>
      {/* Full-Screen Vector Map */}
      <CivicMapView
        issues={filteredIssues}
        selectedIssueId={selectedIssueId}
        onSelectIssue={handleSelectIssueFromMap}
        userCoords={userLocation}
        mapType={mapType}
        recenterTrigger={recenterTrigger}
      />

      {/* Floating Top HUD Bar */}
      <View
        style={[
          styles.floatingTopContainer,
          { paddingTop: insets.top + (Platform.OS === 'ios' ? 4 : 8) },
        ]}
      >
        {/* Row 1: Action Controls + Dropdown Filter */}
        <View style={styles.topActionRow}>
          {/* Action Pills */}
          <View style={styles.topPillSegment}>
            <TouchableOpacity
              style={styles.topPillBtn}
              onPress={handleToggleMapLayers}
              activeOpacity={0.8}
            >
              <Layers size={16} color={COLORS.textPrimary} strokeWidth={2.2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.topPillBtn}
              onPress={handleRecenterGPS}
              activeOpacity={0.8}
            >
              <LocateFixed size={16} color={COLORS.primary} strokeWidth={2.4} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.topPillBtn,
                urgentOnly && styles.topPillBtnActiveUrgent,
              ]}
              onPress={handleToggleUrgent}
              activeOpacity={0.8}
            >
              <Flame
                size={16}
                color={urgentOnly ? '#FFFFFF' : '#EF4444'}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
          </View>

          {/* Right Status Filter Pill Dropdown */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.dropdownPill}
              onPress={() => setShowStatusDropdown((prev) => !prev)}
              activeOpacity={0.8}
            >
              <View style={styles.dotsRow}>
                <View style={[styles.appleDot, { backgroundColor: '#FF5F56', borderColor: '#E0443E' }]} />
                <View style={[styles.appleDot, { backgroundColor: '#007AFF', borderColor: '#0062CC' }]} />
                <View style={[styles.appleDot, { backgroundColor: '#27C93F', borderColor: '#1AAB29' }]} />
              </View>
              <ChevronDown size={14} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* Dropdown Menu Overlay */}
            {showStatusDropdown && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={[styles.dropdownItem, statusFilter === 'all' && styles.dropdownItemActive]}
                  onPress={() => {
                    setStatusFilter('all');
                    setShowStatusDropdown(false);
                  }}
                >
                  <View style={styles.menuLabelRow}>
                    <View style={[styles.dot, { backgroundColor: '#64748B' }]} />
                    <Text style={[styles.dropdownItemText, statusFilter === 'all' && styles.dropdownItemTextActive]}>
                      All Issues ({issues.length})
                    </Text>
                  </View>
                  {statusFilter === 'all' && <Check size={14} color={COLORS.primary} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dropdownItem, statusFilter === 'urgent' && styles.dropdownItemActive]}
                  onPress={() => {
                    setStatusFilter('urgent');
                    setShowStatusDropdown(false);
                  }}
                >
                  <View style={styles.menuLabelRow}>
                    <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                    <Text style={[styles.dropdownItemText, statusFilter === 'urgent' && styles.dropdownItemTextActive]}>
                      Urgent Only
                    </Text>
                  </View>
                  {statusFilter === 'urgent' && <Check size={14} color={COLORS.primary} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dropdownItem, statusFilter === 'active' && styles.dropdownItemActive]}
                  onPress={() => {
                    setStatusFilter('active');
                    setShowStatusDropdown(false);
                  }}
                >
                  <View style={styles.menuLabelRow}>
                    <View style={[styles.dot, { backgroundColor: '#0066FF' }]} />
                    <Text style={[styles.dropdownItemText, statusFilter === 'active' && styles.dropdownItemTextActive]}>
                      Active ({activeCount})
                    </Text>
                  </View>
                  {statusFilter === 'active' && <Check size={14} color={COLORS.primary} />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dropdownItem, statusFilter === 'resolved' && styles.dropdownItemActive]}
                  onPress={() => {
                    setStatusFilter('resolved');
                    setShowStatusDropdown(false);
                  }}
                >
                  <View style={styles.menuLabelRow}>
                    <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                    <Text style={[styles.dropdownItemText, statusFilter === 'resolved' && styles.dropdownItemTextActive]}>
                      Resolved ({resolvedCount})
                    </Text>
                  </View>
                  {statusFilter === 'resolved' && <Check size={14} color={COLORS.primary} />}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Floating Search Pill */}
        <View style={styles.floatingSearchCard}>
          <View style={styles.searchIconBox}>
            <Search size={15} color={COLORS.primary} />
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by area, road, or category..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Floating Horizontal Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsScroll}
        >
          <TouchableOpacity
            style={[
              styles.minimalPill,
              selectedCategory === 'all' && styles.minimalPillActive,
            ]}
            onPress={() => setSelectedCategory('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.minimalPillText,
                selectedCategory === 'all' && styles.minimalPillTextActive,
              ]}
            >
              All ({issues.length})
            </Text>
          </TouchableOpacity>

          {CATEGORY_LIST.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = issues.filter((i) => i.category === cat.id).length;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.minimalPill,
                  isSelected && styles.minimalPillActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.minimalPillText,
                    isSelected && styles.minimalPillTextActive,
                  ]}
                >
                  {cat.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Floating Bottom-Right Current Location Button */}
      {filteredIssues.length === 0 && (
        <TouchableOpacity
          style={[styles.floatingLocationFab, { bottom: insets.bottom + 90 }]}
          onPress={handleRecenterGPS}
          activeOpacity={0.85}
        >
          <View style={styles.fabPulseRing} />
          <LocateFixed size={20} color={COLORS.primary} strokeWidth={2.4} />
        </TouchableOpacity>
      )}

      {/* Synchronized Snapping Bottom Issue Carousel (Item #1) hovering above bottom pill navbar */}
      {filteredIssues.length > 0 && (
        <MapIssueCarousel
          ref={carouselRef}
          issues={filteredIssues}
          userCoords={userLocation}
          onPressIssue={handleViewDetails}
          onActiveIssueChange={handleActiveIssueChangeFromCarousel}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  floatingLocationFab: {
    position: 'absolute',
    right: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 25,
    ...SHADOWS.medium,
  },
  fabPulseRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 102, 255, 0.08)',
  },
  floatingTopContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    gap: 8,
    zIndex: 20,
  },
  topActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topPillSegment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: RADIUS.full,
    padding: 3,
    gap: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  topPillBtn: {
    width: 38,
    height: 32,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  topPillBtnActiveUrgent: {
    backgroundColor: '#EF4444',
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 30,
  },
  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
    ...SHADOWS.small,
  },
  dropdownCountBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: RADIUS.full,
  },
  dropdownCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  appleDot: {
    width: 8.5,
    height: 8.5,
    borderRadius: 4.25,
    borderWidth: 0.75,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 42,
    right: 0,
    width: 190,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.large,
    gap: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  menuLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dropdownItemText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dropdownItemTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '900',
  },
  floatingSearchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 7 : 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  searchIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  categoryPillsScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  minimalPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  minimalPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  minimalPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  minimalPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
