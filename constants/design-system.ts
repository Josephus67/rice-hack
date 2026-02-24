/**
 * Design System for Rice Quality Analyzer
 * Colors based on rice/agriculture theme
 */

export const Colors = {
  // Brand Colors
  primary: '#2E7D32',      // Rice green
  primaryLight: '#60ad5e',
  primaryDark: '#005005',
  secondary: '#8D6E63',    // Rice brown/husk
  secondaryLight: '#be9c91',
  secondaryDark: '#5f4339',
  
  // Semantic Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Grade Colors
  gradePremium: '#4CAF50',
  grade1: '#8BC34A',
  grade2: '#FFC107',
  grade3: '#FF9800',
  gradeBelowGrade: '#F44336',
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Theme-specific (extended for app screens)
  light: {
    // Base colors
    text: '#212121',
    textSecondary: '#757575',
    textMuted: '#9E9E9E',
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    surface: '#FAFAFA',
    card: '#FFFFFF',
    border: '#E0E0E0',
    tint: '#2E7D32',
    icon: '#757575',
    tabIconDefault: '#9E9E9E',
    tabIconSelected: '#2E7D32',
    // Brand
    primary: '#2E7D32',
    primaryLight: '#60ad5e',
    primaryDark: '#005005',
    primaryText: '#FFFFFF',
    secondary: '#8D6E63',
    // Semantic
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    // Grade colors
    premium: '#4CAF50',
    grade1: '#8BC34A',
    grade2: '#FFC107',
    grade3: '#FF9800',
    belowGrade: '#F44336',
    // Utilities
    white: '#FFFFFF',
    black: '#000000',
    // Grays (for chart components)
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
  },
  dark: {
    // Base colors
    text: '#FAFAFA',
    textSecondary: '#BDBDBD',
    textMuted: '#757575',
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    surface: '#1E1E1E',
    card: '#1E1E1E',
    border: '#424242',
    tint: '#81C784',
    icon: '#BDBDBD',
    tabIconDefault: '#757575',
    tabIconSelected: '#81C784',
    // Brand
    primary: '#81C784',
    primaryLight: '#b2fab4',
    primaryDark: '#519657',
    primaryText: '#121212',
    secondary: '#A1887F',
    // Semantic
    success: '#66BB6A',
    warning: '#FFB74D',
    error: '#EF5350',
    info: '#42A5F5',
    // Grade colors
    premium: '#66BB6A',
    grade1: '#9CCC65',
    grade2: '#FFCA28',
    grade3: '#FFA726',
    belowGrade: '#EF5350',
    // Utilities
    white: '#FFFFFF',
    black: '#000000',
    // Grays (for chart components)
    gray200: '#424242',
    gray300: '#616161',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
} as const;

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
} as const;

// Aliases for consistency with component usage
export const FontSize = FontSizes;
export const FontWeight = FontWeights;

// Grade colors (for quality classification display)
export const GradeColors = {
  premium: '#1B5E20',
  grade1: '#2E7D32',
  grade2: '#388E3C',
  grade3: '#689F38',
  belowGrade: '#FFA000',
} as const;

// Semantic colors (for status/alerts)
export const SemanticColors = {
  success: '#2E7D32',
  warning: '#F57C00',
  error: '#C62828',
  info: '#1565C0',
} as const;

// Additional layout constants
export const Dimensions = {
  headerHeight: 56,
  tabBarHeight: 60,
  buttonHeight: 48,
  inputHeight: 48,
  cardPadding: 16,
  screenPadding: 16,
} as const;
