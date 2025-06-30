import { AccessibilityInfo, AccessibilityRole, Platform } from 'react-native';
import { useEffect, useState, useCallback } from 'react';

/**
 * Accessibility utilities for React Native components
 */

// Type definitions for accessibility
export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  accessibilityActions?: Array<{
    name: string;
    label?: string;
  }>;
  onAccessibilityAction?: (event: { nativeEvent: { actionName: string } }) => void;
  accessibilityElementsHidden?: boolean;
  accessibilityViewIsModal?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

// Accessibility helper functions
export const AccessibilityHelpers = {
  /**
   * Creates accessibility props for a button
   */
  createButtonProps: (
    label: string,
    hint?: string,
    disabled?: boolean,
    role: AccessibilityRole = 'button'
  ): AccessibilityProps => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
    accessibilityState: { disabled: !!disabled },
    importantForAccessibility: 'yes',
  }),

  /**
   * Creates accessibility props for text elements
   */
  createTextProps: (
    label: string,
    role: AccessibilityRole = 'text',
    important: boolean = true
  ): AccessibilityProps => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: role,
    importantForAccessibility: important ? 'yes' : 'auto',
  }),

  /**
   * Creates accessibility props for input fields
   */
  createInputProps: (
    label: string,
    hint?: string,
    required?: boolean,
    invalid?: boolean,
    value?: string
  ): AccessibilityProps => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'text',
    accessibilityState: {
      disabled: false,
    },
    accessibilityValue: value ? { text: value } : undefined,
    importantForAccessibility: 'yes',
  }),

  /**
   * Creates accessibility props for cards/containers
   */
  createCardProps: (
    label: string,
    hint?: string,
    selected?: boolean
  ): AccessibilityProps => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'button',
    accessibilityState: { selected: !!selected },
    importantForAccessibility: 'yes',
  }),

  /**
   * Creates accessibility props for progress indicators
   */
  createProgressProps: (
    label: string,
    value: number,
    min: number = 0,
    max: number = 100
  ): AccessibilityProps => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: 'progressbar',
    accessibilityValue: {
      min,
      max,
      now: value,
      text: `${Math.round((value / max) * 100)}%`,
    },
    importantForAccessibility: 'yes',
  }),

  /**
   * Creates accessibility props for navigation elements
   */
  createNavProps: (
    label: string,
    hint?: string,
    selected?: boolean
  ): AccessibilityProps => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'tab',
    accessibilityState: { selected: !!selected },
    importantForAccessibility: 'yes',
  }),

  /**
   * Creates accessibility props for modal/overlay content
   */
  createModalProps: (label: string): AccessibilityProps => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: 'dialog',
    accessibilityViewIsModal: true,
    importantForAccessibility: 'yes',
  }),

  /**
   * Creates accessibility props for list items
   */
  createListItemProps: (
    label: string,
    position: number,
    total: number,
    hint?: string
  ): AccessibilityProps => ({
    accessible: true,
    accessibilityLabel: `${label}. Item ${position} of ${total}`,
    accessibilityHint: hint,
    accessibilityRole: 'button',
    importantForAccessibility: 'yes',
  }),

  /**
   * Creates accessibility props for lists
   */
  createListProps: (
    label: string,
    itemCount: number,
    hint?: string
  ): AccessibilityProps => ({
    accessible: true,
    accessibilityLabel: `${label}. ${itemCount} items`,
    accessibilityHint: hint,
    accessibilityRole: 'list',
    importantForAccessibility: 'yes',
  }),

  /**
   * Announces a message to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    } else {
      // Android equivalent
      AccessibilityInfo.announceForAccessibility(message);
    }
  },

  /**
   * Focus an element for screen readers
   */
  focusElement: (reactTag: number) => {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  },

  /**
   * Check if screen reader is enabled
   */
  isScreenReaderEnabled: async (): Promise<boolean> => {
    return await AccessibilityInfo.isScreenReaderEnabled();
  },

  /**
   * Check if reduce motion is enabled
   */
  isReduceMotionEnabled: async (): Promise<boolean> => {
    return await AccessibilityInfo.isReduceMotionEnabled();
  },

  /**
   * Check if accessibility is enabled
   */
  isAccessibilityEnabled: async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      return await AccessibilityInfo.isAccessibilityEnabled();
    }
    return await AccessibilityInfo.isScreenReaderEnabled();
  },
};

// Custom hooks for accessibility
export const useAccessibility = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);

  useEffect(() => {
    const checkAccessibilitySettings = async () => {
      try {
        const [screenReader, reduceMotion, accessibility] = await Promise.all([
          AccessibilityHelpers.isScreenReaderEnabled(),
          AccessibilityHelpers.isReduceMotionEnabled(),
          AccessibilityHelpers.isAccessibilityEnabled(),
        ]);

        setIsScreenReaderEnabled(screenReader);
        setIsReduceMotionEnabled(reduceMotion);
        setIsAccessibilityEnabled(accessibility);
      } catch (error) {
        console.warn('Error checking accessibility settings:', error);
      }
    };

    checkAccessibilitySettings();

    // Listen for changes
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled
    );

    return () => {
      screenReaderListener?.remove();
      reduceMotionListener?.remove();
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    AccessibilityHelpers.announce(message, priority);
  }, []);

  const focusElement = useCallback((reactTag: number) => {
    AccessibilityHelpers.focusElement(reactTag);
  }, []);

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    isAccessibilityEnabled,
    announce,
    focusElement,
  };
};

// Accessibility context for managing app-wide settings
export const useAccessibilityContext = () => {
  const accessibility = useAccessibility();
  
  return {
    ...accessibility,
    // Helper methods
    shouldReduceMotion: accessibility.isReduceMotionEnabled,
    shouldUseSimpleAnimations: accessibility.isScreenReaderEnabled || accessibility.isReduceMotionEnabled,
    shouldProvideVoiceHints: accessibility.isScreenReaderEnabled,
  };
};

// Color contrast utilities
export const ColorAccessibility = {
  /**
   * Calculate luminance of a color
   */
  getLuminance: (hexColor: string): number => {
    const rgb = ColorAccessibility.hexToRgb(hexColor);
    if (!rgb) return 0;

    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Convert hex color to RGB
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: string, color2: string): number => {
    const lum1 = ColorAccessibility.getLuminance(color1);
    const lum2 = ColorAccessibility.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if color combination meets WCAG contrast requirements
   */
  meetsWCAGContrast: (
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA',
    size: 'normal' | 'large' = 'normal'
  ): boolean => {
    const ratio = ColorAccessibility.getContrastRatio(foreground, background);
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    } else {
      return size === 'large' ? ratio >= 3 : ratio >= 4.5;
    }
  },

  /**
   * Get accessible text color for a background
   */
  getAccessibleTextColor: (backgroundColor: string): string => {
    const whiteContrast = ColorAccessibility.getContrastRatio('#FFFFFF', backgroundColor);
    const blackContrast = ColorAccessibility.getContrastRatio('#000000', backgroundColor);
    
    return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
  },
};

// Semantic accessibility labels
export const SemanticLabels = {
  // Navigation
  navigation: {
    home: 'Home tab',
    flashcards: 'Flashcards tab', 
    settings: 'Settings tab',
    back: 'Go back',
    close: 'Close',
    menu: 'Menu',
  },

  // Flashcards
  flashcard: {
    flip: 'Tap to flip card and reveal answer',
    swipeLeft: 'Swipe left for incorrect answer',
    swipeRight: 'Swipe right for correct answer',
    progress: (current: number, total: number) => `Card ${current} of ${total}`,
    question: 'Question',
    answer: 'Answer',
    nextCard: 'Next card',
    previousCard: 'Previous card',
  },

  // Actions
  actions: {
    start: 'Start learning',
    retry: 'Try again',
    continue: 'Continue',
    finish: 'Finish',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    refresh: 'Refresh',
  },

  // States
  states: {
    loading: 'Loading',
    loadingFlashcards: 'Loading flashcards',
    error: 'Error occurred',
    empty: 'No items available',
    success: 'Success',
    completed: 'Completed',
  },

  // Form elements
  form: {
    required: 'Required field',
    optional: 'Optional field',
    invalid: 'Invalid input',
    search: 'Search',
    clear: 'Clear',
  },
};