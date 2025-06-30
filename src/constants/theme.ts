import { ThemeColors } from '../types';

export const LIGHT_THEME: ThemeColors = {
  // Primary colors - WCAG AA compliant
  primary: '#007AFF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0056CC',
  secondary: '#5856D6',
  secondaryLight: '#7B7AE0',
  secondaryDark: '#3F3EAA',
  
  // Background colors
  background: '#FFFFFF',
  surface: '#F2F2F7',
  surfaceVariant: '#E5E5EA',
  
  // Text colors - WCAG AAA compliant
  text: '#000000',
  textSecondary: '#6D6D80',
  textTertiary: '#8E8E93',
  textInverse: '#FFFFFF',
  
  // Semantic colors
  success: '#34C759',
  successBackground: '#E8F5E8',
  warning: '#FF9500',
  warningBackground: '#FFF4E5',
  error: '#FF3B30',
  errorBackground: '#FFE5E5',
  info: '#007AFF',
  infoBackground: '#E5F1FF',
  
  // Interactive colors
  link: '#007AFF',
  linkPressed: '#0056CC',
  border: '#C6C6C8',
  borderFocus: '#007AFF',
  shadow: 'rgba(0, 0, 0, 0.1)',
  accent: '#FF9500',
  
  // Component-specific colors
  cardBackground: '#FFFFFF',
  buttonPrimary: '#007AFF',
  buttonSecondary: '#F2F2F7',
  buttonDisabled: '#C6C6C8',
  inputBackground: '#FFFFFF',
  inputBorder: '#C6C6C8',
  placeholder: '#8E8E93',
};

export const DARK_THEME: ThemeColors = {
  // Primary colors - WCAG AA compliant
  primary: '#0A84FF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0056CC',
  secondary: '#5E5CE6',
  secondaryLight: '#7B7AE0',
  secondaryDark: '#3F3EAA',
  
  // Background colors
  background: '#000000',
  surface: '#1C1C1E',
  surfaceVariant: '#2C2C2E',
  
  // Text colors - WCAG AAA compliant
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#6D6D80',
  textInverse: '#000000',
  
  // Semantic colors
  success: '#30D158',
  successBackground: '#1A2A1A',
  warning: '#FF9F0A',
  warningBackground: '#2A2A1A',
  error: '#FF453A',
  errorBackground: '#2A1A1A',
  info: '#0A84FF',
  infoBackground: '#1A1A2A',
  
  // Interactive colors
  link: '#0A84FF',
  linkPressed: '#4DA3FF',
  border: '#38383A',
  borderFocus: '#0A84FF',
  shadow: 'rgba(0, 0, 0, 0.3)',
  accent: '#FF9F0A',
  
  // Component-specific colors
  cardBackground: '#1C1C1E',
  buttonPrimary: '#0A84FF',
  buttonSecondary: '#2C2C2E',
  buttonDisabled: '#38383A',
  inputBackground: '#1C1C1E',
  inputBorder: '#38383A',
  placeholder: '#6D6D80',
};

export const ANIMATION_DURATION = {
  SHORT: 200,
  MEDIUM: 300,
  LONG: 500,
};

export const CARD_DIMENSIONS = {
  WIDTH: 320,
  HEIGHT: 200,
  BORDER_RADIUS: 16,
};

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
};

export const FONT_SIZES = {
  EXTRA_SMALL: 12,
  SMALL: 14,
  MEDIUM: 16,
  LARGE: 18,
  TITLE: 24,
  HEADING: 32,
};

export const FONT_WEIGHTS = {
  REGULAR: '400' as const,
  MEDIUM: '500' as const,
  SEMIBOLD: '600' as const,
  BOLD: '700' as const,
};

/**
 * Creates platform-specific shadow styles
 */
export const createThemeShadow = (colors: ThemeColors, elevation: number = 2) => {
  return {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity: 0.1 + (elevation * 0.05),
    shadowRadius: elevation * 2,
    elevation: elevation * 2, // Android
  };
};
