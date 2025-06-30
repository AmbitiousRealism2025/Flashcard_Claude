import { useEffect, useRef, useCallback } from 'react';
import { findNodeHandle, AccessibilityInfo, Platform } from 'react-native';
import { AccessibilityHelpers } from './accessibility';

/**
 * Focus management utilities for accessibility
 */

export interface FocusManagementOptions {
  autoFocus?: boolean;
  announceOnFocus?: boolean;
  restoreFocus?: boolean;
  skipToContent?: boolean;
}

/**
 * Hook for managing accessibility focus
 */
export const useAccessibilityFocus = (options: FocusManagementOptions = {}) => {
  const elementRef = useRef<any>(null);
  const previousFocusRef = useRef<any>(null);
  const {
    autoFocus = false,
    announceOnFocus = false,
    restoreFocus = false,
    skipToContent = false,
  } = options;

  /**
   * Focus the element programmatically
   */
  const focusElement = useCallback((element?: any, announcement?: string) => {
    const targetElement = element || elementRef.current;
    if (!targetElement) return;

    // Store previous focus for restoration
    if (restoreFocus && document.activeElement) {
      previousFocusRef.current = document.activeElement;
    }

    try {
      const nodeHandle = findNodeHandle(targetElement);
      if (nodeHandle) {
        AccessibilityInfo.setAccessibilityFocus(nodeHandle);
        
        if (announcement || announceOnFocus) {
          const message = announcement || 'Element focused';
          AccessibilityHelpers.announce(message, 'polite');
        }
      }
    } catch (error) {
      console.warn('Failed to set accessibility focus:', error);
    }
  }, [restoreFocus, announceOnFocus]);

  /**
   * Restore focus to previous element
   */
  const restorePreviousFocus = useCallback(() => {
    if (previousFocusRef.current) {
      try {
        const nodeHandle = findNodeHandle(previousFocusRef.current);
        if (nodeHandle) {
          AccessibilityInfo.setAccessibilityFocus(nodeHandle);
        }
        previousFocusRef.current = null;
      } catch (error) {
        console.warn('Failed to restore previous focus:', error);
      }
    }
  }, []);

  /**
   * Skip to main content (bypass navigation)
   */
  const skipToMainContent = useCallback(() => {
    const mainContent = document.querySelector('[role="main"], main, #main-content');
    if (mainContent) {
      try {
        const nodeHandle = findNodeHandle(mainContent as any);
        if (nodeHandle) {
          AccessibilityInfo.setAccessibilityFocus(nodeHandle);
          AccessibilityHelpers.announce('Skipped to main content', 'assertive');
        }
      } catch (error) {
        console.warn('Failed to skip to main content:', error);
      }
    }
  }, []);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && elementRef.current) {
      // Delay focus to ensure component is fully rendered
      const timer = setTimeout(() => {
        focusElement();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [autoFocus, focusElement]);

  // Skip to content handler
  useEffect(() => {
    if (skipToContent) {
      skipToMainContent();
    }
  }, [skipToContent, skipToMainContent]);

  return {
    elementRef,
    focusElement,
    restorePreviousFocus,
    skipToMainContent,
  };
};

/**
 * Focus trap for modals and overlays
 */
export const useFocusTrap = (isActive: boolean = false) => {
  const containerRef = useRef<any>(null);
  const firstFocusableRef = useRef<any>(null);
  const lastFocusableRef = useRef<any>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[accessibilityRole="button"]',
      '[accessibilityRole="link"]',
    ];

    return Array.from(
      containerRef.current.querySelectorAll(focusableSelectors.join(', '))
    );
  }, []);

  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !isActive) return;

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }, [isActive, getFocusableElements]);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isActive) {
      // Let parent handle escape (e.g., close modal)
      return true;
    }
    return false;
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      // Focus first element when trap becomes active
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0]?.focus();
      }

      // Add event listeners
      document.addEventListener('keydown', handleTabKey);
      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        document.removeEventListener('keydown', handleTabKey);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isActive, handleTabKey, handleEscapeKey, getFocusableElements]);

  return {
    containerRef,
    firstFocusableRef,
    lastFocusableRef,
  };
};

/**
 * Live region for dynamic content announcements
 */
export const useLiveRegion = () => {
  const liveRegionRef = useRef<any>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      // Clear previous content
      liveRegionRef.current.textContent = '';
      
      // Add new content after a brief delay to ensure it's announced
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = message;
          liveRegionRef.current.setAttribute('aria-live', priority);
        }
      }, 10);
    }
  }, []);

  const clear = useCallback(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = '';
    }
  }, []);

  return {
    liveRegionRef,
    announce,
    clear,
  };
};

/**
 * Navigation focus management
 */
export const useNavigationFocus = () => {
  const routeChangeHandlers = useRef<Set<(route: string) => void>>(new Set());

  const addRouteChangeHandler = useCallback((handler: (route: string) => void) => {
    routeChangeHandlers.current.add(handler);
    
    return () => {
      routeChangeHandlers.current.delete(handler);
    };
  }, []);

  const handleRouteChange = useCallback((newRoute: string) => {
    // Announce route change
    const routeName = newRoute.split('/').pop() || 'page';
    AccessibilityHelpers.announce(`Navigated to ${routeName}`, 'assertive');

    // Focus main content
    setTimeout(() => {
      const mainContent = document.querySelector('[role="main"], main, #main-content');
      if (mainContent) {
        try {
          const nodeHandle = findNodeHandle(mainContent as any);
          if (nodeHandle) {
            AccessibilityInfo.setAccessibilityFocus(nodeHandle);
          }
        } catch (error) {
          console.warn('Failed to focus main content on route change:', error);
        }
      }
    }, 100);

    // Notify handlers
    routeChangeHandlers.current.forEach(handler => handler(newRoute));
  }, []);

  return {
    addRouteChangeHandler,
    handleRouteChange,
  };
};

/**
 * Screen reader optimizations
 */
export const ScreenReaderOptimizations = {
  /**
   * Optimize content for screen readers
   */
  optimizeForScreenReader: (content: string): string => {
    return content
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add spaces between camelCase
      .replace(/(\d+)/g, ' $1 ') // Add spaces around numbers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  },

  /**
   * Create descriptive labels for complex UI
   */
  createDescriptiveLabel: (
    element: string,
    state?: string,
    position?: { current: number; total: number },
    additionalInfo?: string
  ): string => {
    let label = element;
    
    if (state) {
      label += `, ${state}`;
    }
    
    if (position) {
      label += `, ${position.current} of ${position.total}`;
    }
    
    if (additionalInfo) {
      label += `, ${additionalInfo}`;
    }
    
    return ScreenReaderOptimizations.optimizeForScreenReader(label);
  },

  /**
   * Format time for screen readers
   */
  formatTimeForScreenReader: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    let formatted = '';
    if (hours > 0) {
      formatted += `${hours} hour${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0) {
      formatted += `${minutes} minute${minutes > 1 ? 's' : ''} `;
    }
    if (remainingSeconds > 0 || formatted === '') {
      formatted += `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    }

    return formatted.trim();
  },

  /**
   * Format progress for screen readers
   */
  formatProgressForScreenReader: (
    current: number,
    total: number,
    unit: string = 'items'
  ): string => {
    const percentage = Math.round((current / total) * 100);
    return `${current} of ${total} ${unit}, ${percentage} percent complete`;
  },
};

/**
 * Accessibility testing helpers
 */
export const AccessibilityTesting = {
  /**
   * Check if element has proper accessibility attributes
   */
  validateElement: (element: any): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } => {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for accessibility label
    if (!element.props?.accessibilityLabel && !element.props?.children) {
      issues.push('Missing accessibility label');
      suggestions.push('Add accessibilityLabel prop');
    }

    // Check for proper role
    if (!element.props?.accessibilityRole) {
      suggestions.push('Consider adding accessibilityRole prop');
    }

    // Check for interactive elements
    if (element.props?.onPress && !element.props?.accessibilityRole) {
      issues.push('Interactive element missing accessibility role');
      suggestions.push('Add accessibilityRole="button" for pressable elements');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
    };
  },

  /**
   * Log accessibility warnings in development
   */
  logAccessibilityWarnings: (componentName: string, element: any) => {
    if (__DEV__) {
      const validation = AccessibilityTesting.validateElement(element);
      if (!validation.isValid) {
        console.warn(`Accessibility issues in ${componentName}:`, {
          issues: validation.issues,
          suggestions: validation.suggestions,
        });
      }
    }
  },
};