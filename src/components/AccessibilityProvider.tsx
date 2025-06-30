import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { useAccessibility, AccessibilityHelpers } from '../utils/accessibility';
import { useLiveRegion, useNavigationFocus } from '../utils/accessibilityFocus';

interface AccessibilityContextType {
  // State
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isAccessibilityEnabled: boolean;
  
  // Functions
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (reactTag: number) => void;
  
  // Navigation
  handleRouteChange: (route: string) => void;
  addRouteChangeHandler: (handler: (route: string) => void) => () => void;
  
  // Live region
  announceLive: (message: string, priority?: 'polite' | 'assertive') => void;
  clearLiveRegion: () => void;
  
  // Settings
  shouldReduceMotion: boolean;
  shouldUseSimpleAnimations: boolean;
  shouldProvideVoiceHints: boolean;
  
  // Focus management
  currentFocus: string | null;
  setCurrentFocus: (focus: string | null) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

interface AccessibilityProviderProps {
  children: React.ReactNode;
  debugMode?: boolean;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ 
  children, 
  debugMode = __DEV__ 
}) => {
  const accessibility = useAccessibility();
  const { announce: liveAnnounce, clear: clearLiveRegion, liveRegionRef } = useLiveRegion();
  const { handleRouteChange, addRouteChangeHandler } = useNavigationFocus();
  
  const [currentFocus, setCurrentFocus] = useState<string | null>(null);
  const lastAnnouncementRef = useRef<string>('');
  const announcementTimeoutRef = useRef<NodeJS.Timeout>();

  // Enhanced announce function with deduplication
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Avoid duplicate announcements
    if (message === lastAnnouncementRef.current) {
      return;
    }
    
    // Clear previous timeout
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }
    
    // Update last announcement
    lastAnnouncementRef.current = message;
    
    // Make announcement
    AccessibilityHelpers.announce(message, priority);
    
    if (debugMode) {
      console.log(`[Accessibility] Announced: "${message}" (${priority})`);
    }
    
    // Clear the last announcement after a delay to allow similar announcements
    announcementTimeoutRef.current = setTimeout(() => {
      lastAnnouncementRef.current = '';
    }, 3000);
  }, [debugMode]);

  // Focus element with enhanced logging
  const focusElement = useCallback((reactTag: number) => {
    AccessibilityHelpers.focusElement(reactTag);
    
    if (debugMode) {
      console.log(`[Accessibility] Focused element: ${reactTag}`);
    }
  }, [debugMode]);

  // Enhanced live region announcements
  const announceLive = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    liveAnnounce(message, priority);
    
    if (debugMode) {
      console.log(`[Accessibility] Live announcement: "${message}" (${priority})`);
    }
  }, [liveAnnounce, debugMode]);

  // Enhanced route change handler
  const enhancedRouteChange = useCallback((route: string) => {
    handleRouteChange(route);
    setCurrentFocus(null); // Clear focus state on route change
    
    if (debugMode) {
      console.log(`[Accessibility] Route changed: ${route}`);
    }
  }, [handleRouteChange, debugMode]);

  // Monitor accessibility state changes
  useEffect(() => {
    if (debugMode) {
      console.log('[Accessibility] State changed:', {
        screenReader: accessibility.isScreenReaderEnabled,
        reduceMotion: accessibility.isReduceMotionEnabled,
        accessibilityEnabled: accessibility.isAccessibilityEnabled,
      });
    }
  }, [
    accessibility.isScreenReaderEnabled,
    accessibility.isReduceMotionEnabled,
    accessibility.isAccessibilityEnabled,
    debugMode,
  ]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, []);

  const contextValue: AccessibilityContextType = {
    // State
    isScreenReaderEnabled: accessibility.isScreenReaderEnabled,
    isReduceMotionEnabled: accessibility.isReduceMotionEnabled,
    isAccessibilityEnabled: accessibility.isAccessibilityEnabled,
    
    // Functions
    announce,
    focusElement,
    
    // Navigation
    handleRouteChange: enhancedRouteChange,
    addRouteChangeHandler,
    
    // Live region
    announceLive,
    clearLiveRegion,
    
    // Settings
    shouldReduceMotion: accessibility.isReduceMotionEnabled,
    shouldUseSimpleAnimations: accessibility.isScreenReaderEnabled || accessibility.isReduceMotionEnabled,
    shouldProvideVoiceHints: accessibility.isScreenReaderEnabled,
    
    // Focus management
    currentFocus,
    setCurrentFocus,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      {/* Hidden live region for announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      />
    </AccessibilityContext.Provider>
  );
};

// Enhanced hook with better error handling
export const useAccessibilityContext = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  
  if (!context) {
    // Fallback context for components outside provider
    console.warn('useAccessibilityContext must be used within AccessibilityProvider. Using fallback.');
    
    return {
      isScreenReaderEnabled: false,
      isReduceMotionEnabled: false,
      isAccessibilityEnabled: false,
      announce: (message: string) => console.log(`[Accessibility Fallback] ${message}`),
      focusElement: () => {},
      handleRouteChange: () => {},
      addRouteChangeHandler: () => () => {},
      announceLive: (message: string) => console.log(`[Accessibility Fallback Live] ${message}`),
      clearLiveRegion: () => {},
      shouldReduceMotion: false,
      shouldUseSimpleAnimations: false,
      shouldProvideVoiceHints: false,
      currentFocus: null,
      setCurrentFocus: () => {},
    };
  }
  
  return context;
};

// HOC for automatic accessibility enhancements
export const withAccessibility = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    announceOnMount?: string;
    focusOnMount?: boolean;
    role?: string;
  } = {}
) => {
  const WrappedComponent = (props: P) => {
    const { announce, focusElement } = useAccessibilityContext();
    const componentRef = useRef<any>(null);

    useEffect(() => {
      if (options.announceOnMount) {
        announce(options.announceOnMount, 'polite');
      }
      
      if (options.focusOnMount && componentRef.current) {
        setTimeout(() => {
          const nodeHandle = componentRef.current;
          if (nodeHandle) {
            focusElement(nodeHandle);
          }
        }, 100);
      }
    }, [announce, focusElement]);

    return (
      <Component
        {...props}
        ref={componentRef}
        accessibilityRole={options.role}
      />
    );
  };

  WrappedComponent.displayName = `withAccessibility(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Accessibility debugging component
export const AccessibilityDebugger: React.FC<{ enabled?: boolean }> = ({ enabled = __DEV__ }) => {
  const context = useAccessibilityContext();
  
  if (!enabled) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: 10,
        borderRadius: 5,
        fontSize: 12,
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: 300,
      }}
    >
      <div><strong>Accessibility Status</strong></div>
      <div>Screen Reader: {context.isScreenReaderEnabled ? '✅' : '❌'}</div>
      <div>Reduce Motion: {context.isReduceMotionEnabled ? '✅' : '❌'}</div>
      <div>Accessibility: {context.isAccessibilityEnabled ? '✅' : '❌'}</div>
      <div>Current Focus: {context.currentFocus || 'None'}</div>
    </div>
  );
};