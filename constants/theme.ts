// System-Wide Electric Cobalt Blue & Modern iOS Design System

export const COLORS = {
  // Brand Primary & Glow (Electric Cobalt Blue)
  primary: '#0066FF',
  primaryDark: '#0052CC',
  primaryLight: '#EFF6FF',
  primaryMuted: '#DBEAFE',
  primaryGlow: 'rgba(0, 102, 255, 0.25)',

  // Secondary Accents
  accentGreen: '#10B981',
  accentAmber: '#F59E0B',
  accentRed: '#EF4444',
  accentPurple: '#8B5CF6',

  // Surfaces & Backgrounds
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceHighlight: '#F1F5F9',
  surfaceGlass: 'rgba(255, 255, 255, 0.94)',
  surfaceGlassBorder: 'rgba(0, 102, 255, 0.12)',
  surfaceDark: '#0F172A',

  // Status Colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  active: '#EF4444',
  activeLight: '#FEE2E2',
  resolved: '#10B981',
  resolvedLight: '#D1FAE5',

  // Severity specific
  low: '#10B981',
  lowLight: '#D1FAE5',
  medium: '#0066FF',
  mediumLight: '#EFF6FF',
  high: '#EF4444',
  highLight: '#FEE2E2',

  // Categories
  pothole: '#0066FF',
  potholeLight: '#EFF6FF',
  garbage: '#10B981',
  garbageLight: '#ECFDF5',
  streetlight: '#F59E0B',
  streetlightLight: '#FEF3C7',
  roadDamage: '#EF4444',
  roadDamageLight: '#FEE2E2',
  other: '#8B5CF6',
  otherLight: '#F3E8FF',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#0066FF',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Tab bar & Navbar
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: '#0066FF',
  tabBarInactive: '#94A3B8',
  header: '#FFFFFF',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 26,
  full: 9999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  subtle: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  small: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  medium: {
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  large: {
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  floating: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
};
