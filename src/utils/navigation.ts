import { NavigationContainerRef } from '@react-navigation/native';
import { NavigationParamList } from '../types';
import * as Haptics from 'expo-haptics';
import { Platform, Alert } from 'react-native';

// Navigation utilities for enhanced navigation flow and parameter handling
export class NavigationUtils {
  private static navigationRef: NavigationContainerRef<NavigationParamList> | null = null;

  static setNavigationRef(ref: NavigationContainerRef<NavigationParamList>) {
    this.navigationRef = ref;
  }

  static navigate(screen: keyof NavigationParamList, params?: any) {
    if (this.navigationRef?.isReady()) {
      this.navigationRef.navigate(screen as never, params);
      this.provideFeedback();
    }
  }

  static goBack() {
    if (this.navigationRef?.canGoBack()) {
      this.navigationRef.goBack();
      this.provideFeedback();
    }
  }

  static reset(screen: keyof NavigationParamList, params?: any) {
    if (this.navigationRef?.isReady()) {
      this.navigationRef.reset({
        index: 0,
        routes: [{ name: screen as never, params }],
      });
    }
  }

  private static provideFeedback() {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  // Enhanced navigation with validation and error handling
  static navigateToFlashcards(deckId: string, title?: string) {
    if (!deckId) {
      Alert.alert('Error', 'Invalid deck selected');
      return;
    }

    this.navigate('Flashcards', { deckId, title });
  }

  static navigateToSettings() {
    this.navigate('Settings');
  }

  static navigateToHome() {
    this.navigate('Home');
  }

  // Smart back navigation with context awareness
  static smartGoBack(currentScreen: keyof NavigationParamList, onExit?: () => void) {
    if (currentScreen === 'Home') {
      // On home screen, exit app or show exit confirmation
      if (onExit) {
        onExit();
      }
      return;
    }

    if (currentScreen === 'Flashcards') {
      // Show progress loss warning if applicable
      Alert.alert(
        'Exit Flashcards?',
        'You will lose your current progress.',
        [
          { text: 'Continue Learning', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => this.goBack() },
        ]
      );
      return;
    }

    this.goBack();
  }

  // Navigation state helpers
  static getCurrentRoute() {
    return this.navigationRef?.getCurrentRoute();
  }

  static getCurrentRouteName() {
    return this.navigationRef?.getCurrentRoute()?.name;
  }

  static getNavigationState() {
    return this.navigationRef?.getRootState();
  }

  static isReady() {
    return this.navigationRef?.isReady() ?? false;
  }
}

// Enhanced route parameter validation
export const validateRouteParams = {
  Flashcards: (params: any): params is { deckId: string; title?: string } => {
    return params && typeof params.deckId === 'string' && params.deckId.length > 0;
  },
  Home: (params: any): params is undefined => {
    return params === undefined;
  },
  Settings: (params: any): params is undefined => {
    return params === undefined;
  },
};

// Navigation animation configurations
export const NavigationAnimations = {
  // Slide from right (default)
  slideFromRight: {
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  },

  // Fade transition
  fade: {
    cardStyleInterpolator: ({ current }: any) => {
      return {
        cardStyle: {
          opacity: current.progress,
        },
      };
    },
  },

  // Modal presentation
  modal: {
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.height, 0],
              }),
            },
          ],
        },
      };
    },
  },

  // Scale from center
  scaleFromCenter: {
    cardStyleInterpolator: ({ current }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              scale: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
          opacity: current.progress,
        },
      };
    },
  },
};

// Navigation gesture configurations
export const NavigationGestures = {
  // Enhanced swipe back gesture
  enhancedSwipeBack: {
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    gestureResponseDistance: 50,
    gestureVelocityImpact: 0.3,
  },

  // Disabled gestures for specific screens
  disabled: {
    gestureEnabled: false,
  },
};

// Deep linking and URL handling
export const DeepLinkUtils = {
  // Parse deep link URLs
  parseDeepLink: (url: string): { screen: keyof NavigationParamList; params?: any } | null => {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);

      if (pathSegments.length === 0) {
        return { screen: 'Home' };
      }

      const screen = pathSegments[0] as keyof NavigationParamList;
      
      switch (screen) {
        case 'Flashcards':
          const deckId = pathSegments[1];
          if (deckId) {
            return { screen: 'Flashcards', params: { deckId } };
          }
          break;
        case 'Settings':
          return { screen: 'Settings' };
        default:
          break;
      }

      return { screen: 'Home' };
    } catch (error) {
      console.warn('Failed to parse deep link:', error);
      return { screen: 'Home' };
    }
  },

  // Generate deep link URLs
  generateDeepLink: (screen: keyof NavigationParamList, params?: any): string => {
    const baseUrl = 'aiflashcards://';
    
    switch (screen) {
      case 'Flashcards':
        if (params?.deckId) {
          return `${baseUrl}flashcards/${params.deckId}`;
        }
        break;
      case 'Settings':
        return `${baseUrl}settings`;
      case 'Home':
      default:
        return baseUrl;
    }

    return baseUrl;
  },
};

// Navigation tracking and analytics
export const NavigationTracking = {
  // Track screen views
  trackScreenView: (screenName: string, params?: any) => {
    // In a real app, this would integrate with analytics services
    console.log(`Screen viewed: ${screenName}`, params);
  },

  // Track navigation actions
  trackNavigation: (action: string, from: string, to: string, params?: any) => {
    // In a real app, this would integrate with analytics services
    console.log(`Navigation: ${action} from ${from} to ${to}`, params);
  },
};

// Error handling for navigation
export const NavigationErrorHandler = {
  // Handle navigation errors gracefully
  handleNavigationError: (error: Error, fallbackScreen: keyof NavigationParamList = 'Home') => {
    console.error('Navigation error:', error);
    
    Alert.alert(
      'Navigation Error',
      'Something went wrong. Taking you back to the home screen.',
      [
        {
          text: 'OK',
          onPress: () => NavigationUtils.navigateToHome(),
        },
      ]
    );
  },

  // Validate navigation state
  validateNavigationState: (): boolean => {
    return NavigationUtils.isReady();
  },

  // Handle edge cases in navigation
  handleEdgeCase: (scenario: string, context?: any) => {
    console.warn(`Navigation edge case: ${scenario}`, context);
    
    switch (scenario) {
      case 'rapid_navigation':
        // Prevent rapid navigation by debouncing
        return false;
      case 'invalid_params':
        NavigationUtils.navigateToHome();
        return true;
      case 'memory_pressure':
        // Handle low memory scenarios
        return NavigationUtils.smartGoBack('Home');
      default:
        return false;
    }
  },
};

// Device rotation and orientation handling
export const DeviceOrientationHandler = {
  // Handle device rotation during navigation
  handleRotation: (newOrientation: 'portrait' | 'landscape') => {
    const currentRoute = NavigationUtils.getCurrentRouteName();
    
    // Some screens may need special handling during rotation
    switch (currentRoute) {
      case 'Flashcards':
        // Reset any ongoing animations or gestures
        console.log('Handling flashcard rotation to:', newOrientation);
        break;
      case 'Settings':
        // Settings might need layout adjustments
        console.log('Handling settings rotation to:', newOrientation);
        break;
      default:
        break;
    }
  },

  // Handle memory pressure during navigation
  handleMemoryPressure: () => {
    const currentRoute = NavigationUtils.getCurrentRouteName();
    console.warn('Memory pressure detected on:', currentRoute);
    
    // Navigate to a simpler screen if needed
    if (currentRoute === 'Flashcards') {
      Alert.alert(
        'Memory Warning',
        'The app is running low on memory. Would you like to return to the home screen?',
        [
          { text: 'Continue', style: 'cancel' },
          { text: 'Go Home', onPress: () => NavigationUtils.navigateToHome() },
        ]
      );
    }
  },
};

// Performance monitoring for navigation
export const NavigationPerformance = {
  // Track navigation performance
  trackNavigationTime: (from: string, to: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 1000) { // Log slow navigations
      console.warn(`Slow navigation from ${from} to ${to}: ${duration}ms`);
    }
    
    return duration;
  },

  // Monitor memory usage during navigation
  monitorMemoryUsage: () => {
    // In a real app, this would integrate with memory monitoring
    if (__DEV__) {
      console.log('Memory monitoring active for navigation');
    }
  },
};

// Accessibility enhancements for navigation
export const NavigationAccessibility = {
  // Announce navigation changes
  announceNavigation: (screenName: string, context?: string) => {
    const announcement = context 
      ? `Navigated to ${screenName}. ${context}`
      : `Navigated to ${screenName}`;
    
    // This would integrate with screen reader announcements
    console.log('Navigation announcement:', announcement);
  },

  // Handle navigation for users with disabilities
  enhanceNavigationForAccessibility: (screenName: string) => {
    switch (screenName) {
      case 'Flashcards':
        return {
          focusOnFirstCard: true,
          announceProgress: true,
        };
      case 'Settings':
        return {
          announceOptions: true,
          keyboardNavigationEnabled: true,
        };
      default:
        return {};
    }
  },
};

// Development utilities for testing navigation
export const NavigationTestUtils = {
  // Validate complete navigation setup
  validateSetup: (): boolean => {
    try {
      // Check NavigationUtils methods
      const requiredMethods = [
        'navigate', 'goBack', 'reset', 'navigateToFlashcards',
        'navigateToSettings', 'navigateToHome', 'smartGoBack',
        'getCurrentRoute', 'getCurrentRouteName', 'getNavigationState', 'isReady'
      ];

      const missingMethods = requiredMethods.filter(method => 
        typeof (NavigationUtils as any)[method] !== 'function'
      );

      if (missingMethods.length > 0) {
        console.error('❌ Missing NavigationUtils methods:', missingMethods);
        return false;
      }

      // Check route validators
      const requiredValidators = ['Flashcards', 'Home', 'Settings'];
      const missingValidators = requiredValidators.filter(validator =>
        typeof validateRouteParams[validator as keyof typeof validateRouteParams] !== 'function'
      );

      if (missingValidators.length > 0) {
        console.error('❌ Missing route validators:', missingValidators);
        return false;
      }

      console.log('✅ Navigation setup validation passed');
      return true;
    } catch (error) {
      console.error('❌ Navigation setup validation failed:', error);
      return false;
    }
  },

  // Quick navigation flow test
  testFlow: (): void => {
    console.log('🧪 Testing navigation flow...');
    
    // Test parameter validation
    const tests = [
      {
        name: 'Valid Flashcards params',
        test: () => validateRouteParams.Flashcards({ deckId: 'test', title: 'Test' }),
        expected: true
      },
      {
        name: 'Invalid Flashcards params',
        test: () => validateRouteParams.Flashcards({ deckId: '' }),
        expected: false
      },
      {
        name: 'Home params',
        test: () => validateRouteParams.Home(undefined),
        expected: true
      },
      {
        name: 'Settings params',
        test: () => validateRouteParams.Settings(undefined),
        expected: true
      }
    ];

    tests.forEach(({ name, test, expected }) => {
      try {
        const result = test();
        const status = result === expected ? '✅' : '❌';
        console.log(`  ${status} ${name}: ${result} (expected: ${expected})`);
      } catch (error) {
        console.log(`  ❌ ${name}: Error - ${error}`);
      }
    });
  }
};