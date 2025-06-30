import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';
import { Flashcard } from '../types';
import {
  CARD_DIMENSIONS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  ANIMATION_DURATION,
} from '../constants/theme';
import { AccessibilityHelpers, SemanticLabels, useAccessibilityContext } from '../utils/accessibility';
import { PerformanceMonitor, OptimizationHelpers } from '../utils/performance';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FlashCardProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: any;
}

const FlashCardComponent: React.FC<FlashCardProps> = ({
  card,
  isFlipped,
  onFlip,
  onSwipeLeft,
  onSwipeRight,
  style,
}) => {
  const { colors } = useTheme();
  const { shouldReduceMotion, announce } = useAccessibilityContext();
  
  // Animation values with performance monitoring
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;

  // Memoized animation duration based on accessibility settings
  const animationDuration = useMemo(() => {
    return shouldReduceMotion ? ANIMATION_DURATION.SHORT : ANIMATION_DURATION.MEDIUM;
  }, [shouldReduceMotion]);

  useEffect(() => {
    const startTime = performance.now();
    
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 1 : 0,
      duration: animationDuration,
      useNativeDriver: true,
    }).start(() => {
      if (__DEV__) {
        const endTime = performance.now();
        PerformanceMonitor.logRender(`FlashCard flip animation: ${endTime - startTime}ms`);
      }
      
      // Announce card state change for accessibility
      if (isFlipped) {
        announce(SemanticLabels.flashcard.answer, 'polite');
      }
    });
  }, [isFlipped, animationDuration, announce]);

  // Memoized gesture event handler
  const handlePanGestureEvent = useMemo(() => 
    Animated.event(
      [{ nativeEvent: { translationX: translateX } }],
      { useNativeDriver: true }
    ), [translateX]
  );

  // Optimized gesture state change handler
  const handlePanGestureStateChange = useCallback((event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Reset card position with reduced motion support
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: shouldReduceMotion ? 300 : 180,
        friction: shouldReduceMotion ? 20 : 12,
      }).start();

      // Determine swipe direction
      const swipeThreshold = SCREEN_WIDTH * 0.25;
      const velocityThreshold = 500;

      if (translationX > swipeThreshold || velocityX > velocityThreshold) {
        announce('Marked as correct', 'assertive');
        onSwipeRight?.();
      } else if (translationX < -swipeThreshold || velocityX < -velocityThreshold) {
        announce('Marked as incorrect', 'assertive');
        onSwipeLeft?.();
      }
    }
  }, [onSwipeLeft, onSwipeRight, shouldReduceMotion, announce]);

  // Optimized press handler with performance monitoring
  const handlePress = useCallback(() => {
    const startTime = performance.now();
    
    if (!shouldReduceMotion) {
      // Scale animation for feedback only if motion is not reduced
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onFlip();
    
    if (__DEV__) {
      const endTime = performance.now();
      PerformanceMonitor.logRender(`FlashCard press handler: ${endTime - startTime}ms`);
    }
  }, [onFlip, shouldReduceMotion]);

  // Memoized animation interpolations for better performance
  const animationInterpolations = useMemo(() => ({
    frontInterpolate: flipAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    }),
    backInterpolate: flipAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
    }),
    frontOpacity: flipAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0, 0],
    }),
    backOpacity: flipAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    }),
  }), [flipAnimation]);

  // Memoized styles for performance optimization
  const styles = useMemo(() => StyleSheet.create({
    container: {
      alignItems: 'center',
      height: CARD_DIMENSIONS.HEIGHT,
      justifyContent: 'center',
      width: CARD_DIMENSIONS.WIDTH,
    },
    card: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: CARD_DIMENSIONS.BORDER_RADIUS,
      height: '100%',
      justifyContent: 'center',
      padding: SPACING.LG,
      width: '100%',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    cardFront: {
      backfaceVisibility: 'hidden',
      position: 'absolute',
    },
    cardBack: {
      backfaceVisibility: 'hidden',
      position: 'absolute',
    },
    title: {
      color: colors.primary,
      fontSize: FONT_SIZES.LARGE,
      fontWeight: FONT_WEIGHTS.BOLD,
      marginBottom: SPACING.MD,
      textAlign: 'center',
    },
    question: {
      color: colors.text,
      fontSize: FONT_SIZES.MEDIUM,
      fontWeight: FONT_WEIGHTS.MEDIUM,
      textAlign: 'center',
    },
    explanation: {
      color: colors.text,
      fontSize: FONT_SIZES.MEDIUM,
      lineHeight: FONT_SIZES.MEDIUM * 1.4,
      textAlign: 'center',
    },
    flipIndicator: {
      bottom: SPACING.SM,
      color: colors.textSecondary,
      fontSize: FONT_SIZES.SMALL,
      position: 'absolute',
      textAlign: 'center',
    },
  }), [colors]);

  // Memoized accessibility props
  const accessibilityProps = useMemo(() => ({
    container: AccessibilityHelpers.createCardProps(
      `Flashcard: ${card.title}`,
      isFlipped ? SemanticLabels.flashcard.swipeLeft : SemanticLabels.flashcard.flip,
      false
    ),
    question: AccessibilityHelpers.createTextProps(
      `Question: ${card.question}`,
      'text',
      true
    ),
    answer: AccessibilityHelpers.createTextProps(
      `Answer: ${card.explanation}`,
      'text',
      true
    ),
  }), [card.title, card.question, card.explanation, isFlipped]);

  return (
    <PanGestureHandler
      onGestureEvent={handlePanGestureEvent}
      onHandlerStateChange={handlePanGestureStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateX },
              { scale: scaleAnimation },
            ],
          },
          style,
        ]}
        {...accessibilityProps.container}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handlePress}
          style={styles.card}
        >
          {/* Front of card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              {
                opacity: animationInterpolations.frontOpacity,
                transform: [{ rotateY: animationInterpolations.frontInterpolate }],
              },
            ]}
          >
            <Text style={styles.title}>{card.title}</Text>
            <Text style={styles.question} {...accessibilityProps.question}>
              {card.question}
            </Text>
            <Text style={styles.flipIndicator}>Tap to reveal answer</Text>
          </Animated.View>

          {/* Back of card */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              {
                opacity: animationInterpolations.backOpacity,
                transform: [{ rotateY: animationInterpolations.backInterpolate }],
              },
            ]}
          >
            <Text style={styles.title}>{card.title}</Text>
            <Text style={styles.explanation} {...accessibilityProps.answer}>
              {card.explanation}
            </Text>
            <Text style={styles.flipIndicator}>Swipe to continue</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

// Export the optimized component with React.memo for performance
export const FlashCard = React.memo(FlashCardComponent, (prevProps, nextProps) => {
  return OptimizationHelpers.shallowEqual(prevProps, nextProps);
});