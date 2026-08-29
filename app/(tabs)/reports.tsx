import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useIssues } from '@/contexts/IssuesContext';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CivicIssue } from '@/types/issue';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { formatRelativeTime } from '@/utils/formatters';
import {
  ClipboardList,
  Users,
  ChevronRight,
} from 'lucide-react-native';

export default function ModernMyReportsScreen() {
  const insets = useSafeAreaInsets();
  const { myReports, refreshIssues, isLoading } = useIssues();
  const { user } = useAuth();
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'resolved'>('all');

  const activeCount = myReports.filter((r) => r.status === 'active').length;
  const resolvedCount = myReports.filter((r) => r.status === 'resolved').length;

  const filteredReports = myReports.filter((report) => {
    if (statusTab === 'all') return true;
    return report.status === statusTab;
  });

  const renderItem = ({ item }: { item: CivicIssue }) => {
    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() =>
          router.push({
            pathname: '/issue/[id]',
            params: { id: item.id },
          })
        }
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        <View style={styles.contentCol}>
          <View style={styles.badgeRow}>
            <CategoryBadge category={item.category} size="sm" />
            <StatusBadge status={item.status} size="sm" />
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.timeText}>{formatRelativeTime(item.createdAt)}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <View style={styles.confirmationsBox}>
              <Users size={11} color={COLORS.primaryDark} />
              <Text style={styles.confirmationsText}>{item.confirmationCount} confirmed</Text>
            </View>
          </View>
        </View>

        <ChevronRight size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'ios' ? 4 : 8) }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIconBox}>
          <ClipboardList size={20} color={COLORS.primary} />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>My Reports</Text>
          <Text style={styles.headerSub}>
            Track the status and community verification of your reported incidents
          </Text>
        </View>
      </View>

      {/* METRIC TELEMETRY BAR */}
      <View style={styles.telemetryBar}>
        <View style={styles.telemetrySegment}>
          <Text style={styles.telemetryNum}>{myReports.length}</Text>
          <Text style={styles.telemetryLabel}>Total Logged</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.telemetrySegment}>
          <Text style={[styles.telemetryNum, { color: '#EF4444' }]}>{activeCount}</Text>
          <Text style={styles.telemetryLabel}>In Progress</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.telemetrySegment}>
          <Text style={[styles.telemetryNum, { color: '#10B981' }]}>{resolvedCount}</Text>
          <Text style={styles.telemetryLabel}>Resolved</Text>
        </View>
      </View>

      {/* SEGMENTED TAB SELECTOR */}
      <View style={styles.tabsWrapper}>
        <View style={styles.segmentedTabs}>
          <TouchableOpacity
            style={[styles.tabBtn, statusTab === 'all' && styles.tabBtnActive]}
            onPress={() => setStatusTab('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, statusTab === 'all' && styles.tabTextActive]}>
              All ({myReports.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, statusTab === 'active' && styles.tabBtnActive]}
            onPress={() => setStatusTab('active')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, statusTab === 'active' && styles.tabTextActive]}>
              Active ({activeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, statusTab === 'resolved' && styles.tabBtnActive]}
            onPress={() => setStatusTab('resolved')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, statusTab === 'resolved' && styles.tabTextActive]}>
              Resolved ({resolvedCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reports List with dynamic safe bottom padding */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshIssues}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No Incidents Reported Yet"
            description="Your submitted reports and their live resolution status will appear here."
            buttonTitle="Report an Incident"
            onButtonPress={() => router.push('/(tabs)/report')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  telemetryBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  telemetrySegment: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryNum: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  telemetryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  tabsWrapper: {
    paddingHorizontal: SPACING.md,
    marginVertical: 10,
  },
  segmentedTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.full,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.full,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.subtle,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    gap: 10,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    ...SHADOWS.subtle,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    backgroundColor: '#E2E8F0',
  },
  contentCol: {
    flex: 1,
    gap: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  description: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  dotSeparator: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  confirmationsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  confirmationsText: {
    fontSize: 10,
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
});
