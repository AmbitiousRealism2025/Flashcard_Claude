import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { CustomButton } from '../components';
import {
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  ANIMATION_DURATION,
  createThemeShadow,
} from '../constants/theme';
import { AccessibilityHelpers, SemanticLabels, useAccessibilityContext } from '../utils/accessibility';
import { PerformanceMonitor, OptimizationHelpers } from '../utils/performance';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Theme shadow helper
const createThemeShadow = (theme: string, elevation: number) => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: theme === 'dark' ? '#000' : '#000',
      shadowOffset: { width: 0, height: elevation },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
      shadowRadius: elevation * 2,
    };
  } else {
    return {
      elevation: elevation * 2,
    };
  }
};

const HomeScreenComponent: React.FC = () => {
  const { colors, theme } = useTheme();
  const navigation = useNavigation();
  const { shouldReduceMotion, announce } = useAccessibilityContext();
  
  // Animation refs
  const fadeInAnimation = useRef(new Animated.Value(0)).current;
  const slideInAnimation = useRef(new Animated.Value(50)).current;
  const scaleAnimation = useRef(new Animated.Value(0.9)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  // Memoized animation durations based on accessibility
  const animationDurations = useMemo(() => ({
    entrance: shouldReduceMotion ? ANIMATION_DURATION.SHORT : ANIMATION_DURATION.LONG,
    floating: shouldReduceMotion ? 1500 : 3000,
  }), [shouldReduceMotion]);

  useEffect(() => {
    const startTime = performance.now();

    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeInAnimation, {
        toValue: 1,
        duration: animationDurations.entrance,
        useNativeDriver: true,
      }),
      Animated.timing(slideInAnimation, {
        toValue: 0,
        duration: animationDurations.entrance,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: animationDurations.entrance,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (__DEV__) {
        const endTime = performance.now();
        PerformanceMonitor.logRender(`HomeScreen entrance animation: ${endTime - startTime}ms`);
      }
      
      // Announce screen loaded for accessibility
      announce('AI Flashcards home screen loaded', 'polite');
    });

    // Floating animation for the brain emoji (only if motion not reduced)
    let floatingLoop: any;
    if (!shouldReduceMotion) {
      const floatingAnimation = () => {
        floatingLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnimation, {
              toValue: 1,
              duration: animationDurations.floating,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnimation, {
              toValue: 0,
              duration: animationDurations.floating,
              useNativeDriver: true,
            }),
          ])
        );
        floatingLoop.start();
      };

      const timer = setTimeout(floatingAnimation, 1000);
      return () => {
        clearTimeout(timer);
        floatingLoop?.stop();
      };
    }
  }, [animationDurations, shouldReduceMotion, announce]);

  // Optimized navigation handlers with enhanced error handling
  const handleStartLearning = useCallback(() => {
    const startTime = performance.now();
    try {
      NavigationUtils.navigateToFlashcards('ai-beginner-deck', 'AI Tools for Beginners');
      
      if (__DEV__) {
        const endTime = performance.now();
        PerformanceMonitor.logRender(`Navigation to Flashcards: ${endTime - startTime}ms`);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to direct navigation
      navigation.navigate('Flashcards', { 
        deckId: 'ai-beginner-deck',
        title: 'AI Tools for Beginners'
      });
    }
  }, [navigation]);

  const handleSettings = useCallback(() => {
    try {
      NavigationUtils.navigateToSettings();
    } catch (error) {
      console.error('Settings navigation error:', error);
      navigation.navigate('Settings');
    }
  }, [navigation]);

  // Memoized animation interpolation
  const rotateInterpolate = useMemo(() => 
    rotateAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '10deg'],
    }), [rotateAnimation]
  );

  // Memoized features data
  const features = useMemo(() => [
    { icon: '🎯', text: 'Interactive flashcards with flip animations' },
    { icon: '🧠', text: 'AI and Machine Learning fundamentals' },
    { icon: '🌙', text: 'Beautiful dark and light themes' },
    { icon: '📱', text: 'Responsive design for all devices' },
  ], []);

  // Memoized accessibility props
  const accessibilityProps = useMemo(() => ({
    startButton: AccessibilityHelpers.createButtonProps(
      SemanticLabels.actions.start,
      'Navigate to flashcards to begin learning',
      false
    ),
    settingsButton: AccessibilityHelpers.createButtonProps(
      'Settings',
      'Open app settings and preferences',
      false
    ),
    title: AccessibilityHelpers.createTextProps(
      'AI Flashcards - Learn artificial intelligence concepts',
      'text',
      true
    ),
    subtitle: AccessibilityHelpers.createTextProps(
      'Ready to learn about AI?',
      'text',
      true
    ),
  }), []);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.LG,
      paddingVertical: SPACING.XL,
    },
    hero: {
      alignItems: 'center',
      marginBottom: SPACING.XXL,
    },
    brainEmoji: {
      fontSize: 80,
      marginBottom: SPACING.LG,
    },
    title: {
      fontSize: FONT_SIZES.HEADING,
      fontWeight: FONT_WEIGHTS.BOLD,
      color: colors.text,
      textAlign: 'center',
      marginBottom: SPACING.MD,
    },
    subtitle: {
      fontSize: FONT_SIZES.LARGE,
      fontWeight: FONT_WEIGHTS.MEDIUM,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: SPACING.LG,
    },
    description: {
      fontSize: FONT_SIZES.MEDIUM,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: FONT_SIZES.MEDIUM * 1.5,
      marginBottom: SPACING.XL,
      maxWidth: SCREEN_WIDTH * 0.8,
    },
    buttonContainer: {
      width: '100%',
      maxWidth: 280,
      marginBottom: SPACING.LG,
    },
    secondaryButtonContainer: {
      marginTop: SPACING.MD,
    },
    features: {
      width: '100%',
      marginTop: SPACING.XL,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.SM,
      paddingHorizontal: SPACING.MD,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: SPACING.MD,
      ...createThemeShadow(colors, 2),
    },
    featureIcon: {
      fontSize: FONT_SIZES.TITLE,
      marginRight: SPACING.MD,
    },
    featureText: {
      flex: 1,
      fontSize: FONT_SIZES.MEDIUM,
      color: colors.text,
      fontWeight: FONT_WEIGHTS.MEDIUM,
    },
    gradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: SCREEN_HEIGHT * 0.3,
      backgroundColor: `${colors.primary}10`,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.gradient} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: fadeInAnimation,
              transform: [
                { translateY: slideInAnimation },
                { scale: scaleAnimation },
              ],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.brainEmoji,
              {
                transform: [{ rotate: rotateInterpolate }],
              },
            ]}
          >
            🧠
          </Animated.Text>
          
          <Text style={styles.title}>AI Flashcards</Text>
          <Text style={styles.subtitle}>Ready to learn about AI?</Text>
          <Text style={styles.description}>
            Master artificial intelligence concepts with interactive flashcards. 
            From basic fundamentals to advanced topics, learn at your own pace 
            with beautiful, engaging cards.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeInAnimation,
              transform: [{ translateY: slideInAnimation }],
            },
          ]}
        >
          <CustomButton
            title="Start Learning"
            onPress={handleStartLearning}
            variant="primary"
            size="large"
            fullWidth
          />
          
          <View style={styles.secondaryButtonContainer}>
            <CustomButton
              title="Settings"
              onPress={handleSettings}
              variant="outline"
              size="medium"
              fullWidth
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.features,
            {
              opacity: fadeInAnimation,
              transform: [{ translateY: slideInAnimation }],
            },
          ]}
        >
          {features.map((feature, index) => (
            <Animated.View
              key={index}
              style={[
                styles.featureItem,
                {
                  opacity: fadeInAnimation,
                  transform: [
                    {
                      translateY: slideInAnimation.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, 50 + index * 10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// Export the optimized component with React.memo
export const HomeScreen = React.memo(HomeScreenComponent);
