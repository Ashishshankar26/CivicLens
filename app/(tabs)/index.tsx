import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useIssues } from '@/contexts/IssuesContext';
import { CivicMapView } from '@/components/map/CivicMapView';
import { MapIssueCarousel, MapIssueCarouselRef } from '@/components/map/MapIssueCarousel';
import { CivicIssueCard } from '@/components/cards/CivicIssueCard';
import { CivicPulseWidget } from '@/components/widgets/CivicPulseWidget';
import { QuickReportWidget } from '@/components/widgets/QuickReportWidget';
import { ActivityStreamWidget } from '@/components/widgets/ActivityStreamWidget';
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
  Map as MapIcon,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ModernHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { issues, activeIssues } = useIssues();

  // Mode: 'dashboard' vs 'map'
  const [viewMode, setViewMode] = useState<'dashboard' | 'map'>('dashboard');

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
      const cached = await getLastKnownLocation();
      if (cached) {
        setUserLocation(cached);
      }
      const res = await getCurrentLocation();
      if (res.location) {
        setUserLocation(res.location);
      }
    }
    initLocation();
  }, []);

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

  // Calculate live telemetry numbers for Civic Pulse
  const activeCount = issues.filter((i) => i.status === 'active').length;
  const confirmedCount = issues.reduce((acc, i) => acc + (i.confirmationCount || 0), 0);
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;

  // Set default selected issue if none selected
  useEffect(() => {
    if (filteredIssues.length > 0 && !selectedIssueId) {
      setSelectedIssueId(filteredIssues[0].id);
    }
  }, [filteredIssues, selectedIssueId]);

  // Greeting based on time of day
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Citizen';

  const handleSelectIssueFromMap = (issue: CivicIssue) => {
    setSelectedIssueId(issue.id);
    if (carouselRef.current) {
      carouselRef.current.scrollToIssue(issue.id);
    }
  };

  const handleActiveIssueChangeFromCarousel = (issue: CivicIssue) => {
    setSelectedIssueId(issue.id);
  };

  const handleOpenIssueDetails = (issueId: string) => {
    router.push(`/issue/${issueId}`);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Bar with Greeting & Mode Switcher */}
      <View style={[styles.topHeader, { paddingTop: insets.top + (Platform.OS === 'android' ? 8 : 4) }]}>
        <View style={styles.greetingCol}>
          <Text style={styles.greetingSub}>{getGreeting()},</Text>
          <Text style={styles.greetingName} numberOfLines={1}>
            {displayName}
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[
              styles.modeToggleBtn,
              viewMode === 'map' && styles.modeToggleBtnActive,
            ]}
            onPress={() => setViewMode((prev) => (prev === 'dashboard' ? 'map' : 'dashboard'))}
            activeOpacity={0.85}
          >
            {viewMode === 'dashboard' ? (
              <>
                <MapIcon size={14} color={COLORS.primary} strokeWidth={2.4} />
                <Text style={styles.modeToggleText}>Map View</Text>
              </>
            ) : (
              <>
                <LayoutDashboard size={14} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={[styles.modeToggleText, { color: '#FFFFFF' }]}>Dashboard</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Main Content: Dashboard Mode vs Map HUD Mode */}
      {viewMode === 'dashboard' ? (
        <ScrollView
          style={styles.dashboardScroll}
          contentContainerStyle={[styles.dashboardContent, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Search Bar */}
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Search size={16} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search hazards, roads, districts..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
            </View>
          </View>

          {/* Quick Report Hero Action Widget */}
          <QuickReportWidget onPress={() => router.push('/(tabs)/report')} />

          {/* Civic Pulse Neighborhood Telemetry */}
          <CivicPulseWidget
            activeCount={activeCount}
            confirmedCount={confirmedCount}
            resolvedCount={resolvedCount}
            districtName={userLocation ? 'Connaught Place Area' : 'Local District'}
          />

          {/* Nearby Hazards Carousel Section */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Text style={styles.sectionTitle}>Nearby Hazards</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{filteredIssues.length}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setViewMode('map')}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionActionText}>View on Map</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Swipeable Card Carousel */}
          {filteredIssues.length > 0 ? (
            <FlatList
              data={filteredIssues}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalCarousel}
              renderItem={({ item }) => (
                <CivicIssueCard
                  issue={item}
                  userCoords={userLocation}
                  onPress={handleOpenIssueDetails}
                  variant="featured"
                />
              )}
            />
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardTitle}>No Hazards Found</Text>
              <Text style={styles.emptyCardSub}>
                Your local neighborhood is clear of reported civic hazards.
              </Text>
            </View>
          )}

          {/* Recent Activity Stream */}
          <ActivityStreamWidget
            issues={issues}
            onPressIssue={handleOpenIssueDetails}
          />
        </ScrollView>
      ) : (
        /* Map HUD Mode */
        <View style={styles.mapContainer}>
          <CivicMapView
            issues={filteredIssues}
            selectedIssueId={selectedIssueId}
            onSelectIssue={handleSelectIssueFromMap}
            userCoords={userLocation}
            mapType={mapType}
            recenterTrigger={recenterTrigger}
          />

          {/* Map Top Floating Search & Filter Pill Strip */}
          <View style={[styles.mapTopControls, { top: insets.top + (Platform.OS === 'android' ? 64 : 58) }]}>
            {/* Search Pill */}
            <View style={styles.mapSearchBar}>
              <Search size={14} color={COLORS.textMuted} />
              <TextInput
                style={styles.mapSearchInput}
                placeholder="Search map hazards..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Category Filter Horizontal Strip */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryPillStrip}
            >
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  selectedCategory === 'all' && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory('all')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    selectedCategory === 'all' && styles.categoryPillTextActive,
                  ]}
                >
                  All ({issues.length})
                </Text>
              </TouchableOpacity>

              {CATEGORY_LIST.map((cat) => {
                const count = issues.filter((i) => i.category === cat.id).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryPill,
                      isSelected && styles.categoryPillActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        isSelected && styles.categoryPillTextActive,
                      ]}
                    >
                      {cat.label} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Map Side Tools (Layers, GPS Re-center, Urgent Toggle) */}
          <View style={[styles.mapSideTools, { top: insets.top + 130 }]}>
            <TouchableOpacity
              style={styles.toolFab}
              onPress={() => setMapType((p) => (p === 'standard' ? 'satellite' : 'standard'))}
              activeOpacity={0.85}
            >
              <Layers size={16} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolFab}
              onPress={() => setRecenterTrigger(Date.now())}
              activeOpacity={0.85}
            >
              <LocateFixed size={16} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toolFab, urgentOnly && styles.toolFabUrgent]}
              onPress={() => setUrgentOnly((p) => !p)}
              activeOpacity={0.85}
            >
              <Flame size={16} color={urgentOnly ? '#FFFFFF' : '#DC2626'} />
            </TouchableOpacity>
          </View>

          {/* Synchronized Snapping Bottom Issue Carousel */}
          <MapIssueCarousel
            ref={carouselRef}
            issues={filteredIssues}
            userCoords={userLocation}
            onPressIssue={handleOpenIssueDetails}
            onActiveIssueChange={handleActiveIssueChangeFromCarousel}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 100,
  },
  greetingCol: {
    flex: 1,
  },
  greetingSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  greetingName: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  modeToggleBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },

  // Dashboard Styles
  dashboardScroll: {
    flex: 1,
  },
  dashboardContent: {
    padding: 16,
    gap: 16,
  },
  searchRow: {
    flexDirection: 'row',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    ...SHADOWS.card,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  countBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  horizontalCarousel: {
    paddingRight: 16,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  emptyCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptyCardSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Map Mode Styles
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapTopControls: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 80,
    gap: 8,
  },
  mapSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
    ...SHADOWS.card,
  },
  mapSearchInput: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  categoryPillStrip: {
    gap: 6,
    paddingVertical: 2,
  },
  categoryPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  mapSideTools: {
    position: 'absolute',
    right: 14,
    zIndex: 80,
    gap: 8,
  },
  toolFab: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    ...SHADOWS.card,
  },
  toolFabUrgent: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
});
