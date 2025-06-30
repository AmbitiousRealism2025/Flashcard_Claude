import React, { useRef, useCallback } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { HomeScreen, FlashcardsScreen, SettingsScreen } from '../screens';
import { NavigationParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { NavigationUtils, NavigationAnimations, NavigationGestures, validateRouteParams, NavigationErrorHandler } from '../utils/navigation';
import { Platform, StatusBar, Alert } from 'react-native';
import {
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
} from '../constants/theme';

const Stack = createStackNavigator<NavigationParamList>();

export const AppNavigator: React.FC = () => {
  const { colors, theme } = useTheme();
  const navigationRef = useRef<NavigationContainerRef<NavigationParamList>>(null);

  // Set navigation reference for NavigationUtils with error handling
  React.useEffect(() => {
    try {
      if (navigationRef.current) {
        NavigationUtils.setNavigationRef(navigationRef.current);
      }
    } catch (error) {
      console.error('Failed to set navigation reference:', error);
    }
  }, []);

  // Enhanced screen options with dynamic theming and transitions
  const getScreenOptions = (routeName: keyof NavigationParamList) => {
    const baseOptions = {
      headerStyle: {
        backgroundColor: colors.surface,
        shadowColor: colors.shadow,
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        borderBottomWidth: 0,
      },
      headerTintColor: colors.text,
      headerTitleStyle: {
        fontWeight: FONT_WEIGHTS.SEMIBOLD as any,
        fontSize: FONT_SIZES.LARGE,
        color: colors.text,
      },
      headerTitleAlign: 'center' as const,
      headerLeftContainerStyle: {
        paddingLeft: SPACING.MD,
      },
      headerRightContainerStyle: {
        paddingRight: SPACING.MD,
      },
      ...NavigationGestures.enhancedSwipeBack,
    };

    // Customize transitions based on screen
    switch (routeName) {
      case 'Flashcards':
        return {
          ...baseOptions,
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: NavigationAnimations.slideFromRight.cardStyleInterpolator,
          gestureDirection: 'horizontal' as const,
          gestureResponseDistance: 50,
        };
      case 'Settings':
        return {
          ...baseOptions,
          ...TransitionPresets.ModalSlideFromBottomIOS,
          cardStyleInterpolator: NavigationAnimations.modal.cardStyleInterpolator,
          presentation: 'modal' as const,
        };
      default:
        return {
          ...baseOptions,
          ...TransitionPresets.FadeFromBottomAndroid,
        };
    }
  };

  // Dynamic screen titles based on parameters
  const getDynamicTitle = (route: any) => {
    switch (route.name) {
      case 'Home':
        return 'AI Flashcards';
      case 'Flashcards':
        return route.params?.title || 'Flashcards';
      case 'Settings':
        return 'Settings';
      default:
        return route.name;
    }
  };

  // Status bar configuration based on theme
  const statusBarStyle = theme === 'dark' ? 'light-content' : 'dark-content';

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        dark: theme === 'dark',
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.accent,
        },
      }}
      onReady={() => {
        try {
          // Navigation is ready, setup deep linking handlers
          console.log('Navigation ready');
          // Additional setup can be added here
        } catch (error) {
          console.error('Navigation ready error:', error);
        }
      }}
      onStateChange={(state) => {
        try {
          // Track navigation state changes for analytics
          const currentRoute = state?.routes[state?.index];
          if (currentRoute) {
            console.log('Navigation state changed:', currentRoute.name);
            
            // Validate route parameters
            if (currentRoute.params) {
              const isValid = validateRouteParams[currentRoute.name as keyof NavigationParamList]?.(currentRoute.params);
              if (!isValid) {
                console.warn('Invalid route parameters:', currentRoute.name, currentRoute.params);
              }
            }
          }
        } catch (error) {
          console.error('Navigation state change error:', error);
        }
      }}
    >
      <StatusBar barStyle={statusBarStyle} backgroundColor={colors.surface} />
      
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          ...getScreenOptions(route.name as keyof NavigationParamList),
          title: getDynamicTitle(route),
        })}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false, // Home screen manages its own header
          }}
        />
        
        <Stack.Screen
          name="Flashcards"
          component={FlashcardsScreen}
          options={({ route }) => {
            // Validate route parameters
            if (!validateRouteParams.Flashcards(route.params)) {
              console.error('Invalid Flashcards route parameters:', route.params);
              return {
                title: 'Error',
                headerBackTitle: 'Home',
              };
            }
            
            return {
              title: route.params?.title || 'Flashcards',
              headerBackTitle: 'Home',
              headerLeft: Platform.OS === 'ios' ? undefined : () => null, // Custom back handling on Android
            };
          }}
        />
        
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            headerBackTitle: 'Home',
            presentation: 'modal',
            headerLeft: Platform.OS === 'ios' 
              ? () => null // Use default close button
              : undefined,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
