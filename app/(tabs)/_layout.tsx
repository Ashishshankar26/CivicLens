import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import {
  Compass,
  Layers,
  Plus,
  ScrollText,
  CircleUserRound,
} from 'lucide-react-native';

export default function FloatingTabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomOffset = insets.bottom > 0 ? insets.bottom + 4 : 12;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomOffset,
          left: 18,
          right: 18,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          borderRadius: RADIUS.full,
          height: 62,
          paddingBottom: 0,
          paddingHorizontal: 8,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.80)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
          elevation: 10,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 1,
          letterSpacing: -0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
              <Compass size={20} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.4 : 1.8} />
              {focused && <View style={styles.activeIndicatorDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="spotdex"
        options={{
          title: 'Spotdex',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
              <Layers size={19} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.4 : 1.8} />
              {focused && <View style={styles.activeIndicatorDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="report"
        options={{
          title: 'Spot',
          tabBarIcon: ({ focused }) => (
            <View style={styles.plusBtnOuter}>
              <View style={[styles.inlinePlusBtn, focused && styles.inlinePlusBtnActive]}>
                <Plus size={20} color="#FFFFFF" strokeWidth={3} />
              </View>
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '900',
            marginTop: 2,
            color: COLORS.primary,
            letterSpacing: -0.1,
          },
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: 'Logbook',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
              <ScrollText size={19} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.4 : 1.8} />
              {focused && <View style={styles.activeIndicatorDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'You',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
              <CircleUserRound size={20} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.4 : 1.8} />
              {focused && <View style={styles.activeIndicatorDot} />}
            </View>
          ),
        }}
      />

      {/* Hidden legacy tab */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
  },
  tabIconActive: {
    transform: [{ scale: 1.05 }],
  },
  activeIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 3,
  },
  plusBtnOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
  },
  inlinePlusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  inlinePlusBtnActive: {
    backgroundColor: COLORS.primaryDark,
    transform: [{ scale: 1.06 }],
  },
});
