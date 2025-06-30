import { Animated, Easing } from 'react-native';
import { Theme, ThemeColors } from '../types';
import { LIGHT_THEME, DARK_THEME, ANIMATION_DURATION } from '../constants/theme';

/**
 * Theme utility functions for managing theme-related operations
 */

/**
 * Get theme colors based on theme type
 * @param theme - The theme type ('light' or 'dark')
 * @returns ThemeColors object
 */
export const getThemeColors = (theme: Theme): ThemeColors => {
  return theme === 'light' ? LIGHT_THEME : DARK_THEME;
};

/**
 * Create an animated theme transition
 * @param animatedValue - The animated value to control the transition
 * @param toTheme - The target theme ('light' or 'dark')
 * @param duration - Animation duration in milliseconds (optional)
 * @returns Promise that resolves when animation completes
 */
export const animateThemeTransition = (
  animatedValue: Animated.Value,
  toTheme: Theme,
  duration: number = ANIMATION_DURATION.MEDIUM
): Promise<void> => {
  return new Promise<void>((resolve) => {
    Animated.timing(animatedValue, {
      toValue: toTheme === 'dark' ? 1 : 0,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => resolve());
  });
};

/**
 * Interpolate colors between light and dark themes
 * @param animatedValue - The animated value (0 for light, 1 for dark)
 * @param lightColor - Color for light theme
 * @param darkColor - Color for dark theme
 * @returns Animated color value
 */
export const interpolateThemeColor = (
  animatedValue: Animated.Value,
  lightColor: string,
  darkColor: string
): Animated.AnimatedInterpolation<string> => {
  return animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [lightColor, darkColor],
  });
};

/**
 * Create a theme-aware shadow style
 * @param theme - Current theme
 * @param elevation - Shadow elevation (1-5)
 * @returns Platform-specific shadow style
 */
export const createThemeShadow = (theme: Theme, elevation: number = 2) => {
  const colors = getThemeColors(theme);
  const shadowOpacity = theme === 'dark' ? 0.3 : 0.1;
  const shadowRadius = elevation * 2;
  const shadowOffset = { width: 0, height: elevation };

  return {
    shadowColor: colors.shadow,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    elevation: elevation + 1, // Android elevation
  };
};

/**
 * Get appropriate text color for theme
 * @param theme - Current theme
 * @param variant - Text variant ('primary', 'secondary', 'tertiary')
 * @returns Color string
 */
export const getThemeTextColor = (
  theme: Theme,
  variant: 'primary' | 'secondary' | 'tertiary' = 'primary'
): string => {
  const colors = getThemeColors(theme);
  
  switch (variant) {
    case 'primary':
      return colors.text;
    case 'secondary':
      return colors.textSecondary;
    case 'tertiary':
      return colors.textTertiary;
    default:
      return colors.text;
  }
};

/**
 * Get theme-appropriate background color
 * @param theme - Current theme
 * @param variant - Background variant ('primary', 'surface', 'card')
 * @returns Color string
 */
export const getThemeBackgroundColor = (
  theme: Theme,
  variant: 'primary' | 'surface' | 'card' = 'primary'
): string => {
  const colors = getThemeColors(theme);
  
  switch (variant) {
    case 'primary':
      return colors.background;
    case 'surface':
      return colors.surface;
    case 'card':
      return colors.cardBackground;
    default:
      return colors.background;
  }
};

/**
 * Create animated theme-aware styles
 * @param animatedValue - The animated value controlling the theme transition
 * @param lightStyle - Style object for light theme
 * @param darkStyle - Style object for dark theme
 * @returns Object with animated style properties
 */
export const createAnimatedThemeStyle = (
  animatedValue: Animated.Value,
  lightStyle: Record<string, any>,
  darkStyle: Record<string, any>
) => {
  const animatedStyle: Record<string, any> = {};
  
  // Get all unique keys from both style objects
  const allKeys = new Set([...Object.keys(lightStyle), ...Object.keys(darkStyle)]);
  
  allKeys.forEach(key => {
    const lightValue = lightStyle[key];
    const darkValue = darkStyle[key];
    
    // Only animate color values (strings starting with # or rgb/rgba)
    if (
      typeof lightValue === 'string' && 
      typeof darkValue === 'string' &&
      (lightValue.startsWith('#') || lightValue.startsWith('rgb'))
    ) {
      animatedStyle[key] = interpolateThemeColor(animatedValue, lightValue, darkValue);
    } else {
      // For non-color values, use the current theme's value
      animatedStyle[key] = lightValue; // This will be overridden by theme context
    }
  });
  
  return animatedStyle;
};

/**
 * Validate if a color string is valid
 * @param color - Color string to validate
 * @returns Boolean indicating if color is valid
 */
export const isValidColor = (color: string): boolean => {
  if (!color || typeof color !== 'string') return false;
  
  // Check for hex colors
  if (color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) return true;
  
  // Check for rgb/rgba colors
  if (color.match(/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/)) return true;
  
  // Check for named colors (basic set)
  const namedColors = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
    'pink', 'brown', 'gray', 'grey', 'transparent'
  ];
  
  return namedColors.includes(color.toLowerCase());
};

/**
 * Convert hex color to RGBA
 * @param hex - Hex color string (e.g., '#FF0000')
 * @param alpha - Alpha value (0-1)
 * @returns RGBA color string
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  if (!isValidColor(hex) || !hex.startsWith('#')) {
    throw new Error('Invalid hex color');
  }
  
  const hexValue = hex.replace('#', '');
  const r = parseInt(hexValue.substr(0, 2), 16);
  const g = parseInt(hexValue.substr(2, 2), 16);
  const b = parseInt(hexValue.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Lighten or darken a color
 * @param color - Base color (hex format)
 * @param amount - Amount to lighten (positive) or darken (negative) (-100 to 100)
 * @returns Modified color string
 */
export const adjustColorBrightness = (color: string, amount: number): string => {
  if (!isValidColor(color) || !color.startsWith('#')) {
    return color; // Return original if invalid
  }
  
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

/**
 * Get contrast ratio between two colors
 * @param color1 - First color (hex format)
 * @param color2 - Second color (hex format)
 * @returns Contrast ratio (1-21)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = (rgb & 0xff) / 255;
    
    const [rs, gs, bs] = [r, g, b].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if color combination meets WCAG accessibility standards
 * @param backgroundColor - Background color (hex format)
 * @param textColor - Text color (hex format)
 * @param level - WCAG level ('AA' or 'AAA')
 * @returns Boolean indicating if combination is accessible
 */
export const isAccessibleColorCombination = (
  backgroundColor: string,
  textColor: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  const ratio = getContrastRatio(backgroundColor, textColor);
  const minRatio = level === 'AAA' ? 7 : 4.5;
  
  return ratio >= minRatio;
};