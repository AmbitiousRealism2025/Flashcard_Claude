import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  BackHandler,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { FlashCard, CustomButton, ProgressBar } from '../components';
import { useFlashcardState } from '../hooks/useFlashcardState';
import { useFlashcardGestures } from '../hooks/useFlashcardGestures';
import { useTheme } from '../context/ThemeContext';
import { aiBeginnerFlashcards } from '../data/aiFlashcards';
import { NavigationParamList } from '../types';
import {
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  ANIMATION_DURATION,
} from '../constants/theme';
import { NavigationUtils, NavigationErrorHandler } from '../utils/navigation';
import { AccessibilityHelpers, useAccessibilityContext } from '../utils/accessibility';
import { PerformanceMonitor } from '../utils/performance';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type FlashcardsScreenRouteProp = {
  params: {
    deckId: string;
  };
};

export const FlashcardsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<FlashcardsScreenRouteProp>();
  const { shouldReduceMotion, announce } = useAccessibilityContext();
  
  // Validate route parameters
  if (!route.params?.deckId) {
    NavigationErrorHandler.handleNavigationError(
      new Error('No deck ID provided'),
      'Home'
    );
    return null;
  }
  
  const { deckId } = route.params;
  
  // State management
  const [deck] = useState(aiBeginnerFlashcards); // In a real app, this would fetch based on deckId
  const [isComplete, setIsComplete] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animation values
  const cardOpacity = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const completionOpacity = useSharedValue(0);
  const completionScale = useSharedValue(0.8);
  const progressOpacity = useSharedValue(1);
  
  // Refs for preventing rapid gestures
  const lastSwipeTime = useRef(0);
  const SWIPE_COOLDOWN = 300; // ms
  
  // Flashcard state management
  const flashcardState = useFlashcardState({
    cards: deck.cards,
    onComplete: handleDeckComplete,
  });
  
  const {
    state,
    actions: { flipCard, nextCard, previousCard, resetDeck },
    selectors: { getCurrentCard, canGoNext, canGoPrevious, isLastCard },
  } = flashcardState;
  
  const currentCard = getCurrentCard();
  
  // Handle deck completion
  function handleDeckComplete() {
    setIsComplete(true);
    
    // Animate card out and show completion
    cardOpacity.value = withTiming(0, { duration: 300 });
    progressOpacity.value = withTiming(0, { duration: 300 });
    
    setTimeout(() => {
      setShowCompletion(true);
      completionOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
      completionScale.value = withSpring(1, { damping: 15, stiffness: 100 });
      
      // Haptic feedback for completion
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 300);
  }
  
  // Enhanced gesture handling with edge case management
  const handleSwipeLeft = useCallback(() => {
    const now = Date.now();
    if (now - lastSwipeTime.current < SWIPE_COOLDOWN || isAnimating) {
      return; // Prevent rapid gestures
    }
    lastSwipeTime.current = now;
    
    if (canGoNext) {
      setIsAnimating(true);
      
      // Animate card exit
      cardOpacity.value = withSpring(0, { damping: 20, stiffness: 200 });
      cardScale.value = withSpring(0.8, { damping: 20, stiffness: 200 });
      
      setTimeout(() => {
        runOnJS(nextCard)();
        
        // Animate new card entrance
        cardOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
        cardScale.value = withSpring(1, { damping: 15, stiffness: 100 });
        
        setIsAnimating(false);
      }, 200);
    }
  }, [canGoNext, nextCard, isAnimating, cardOpacity, cardScale]);
  
  const handleSwipeRight = useCallback(() => {
    const now = Date.now();
    if (now - lastSwipeTime.current < SWIPE_COOLDOWN || isAnimating) {
      return; // Prevent rapid gestures
    }
    lastSwipeTime.current = now;
    
    if (canGoPrevious) {
      setIsAnimating(true);
      
      // Animate card exit
      cardOpacity.value = withSpring(0, { damping: 20, stiffness: 200 });
      cardScale.value = withSpring(0.8, { damping: 20, stiffness: 200 });
      
      setTimeout(() => {
        runOnJS(previousCard)();
        
        // Animate new card entrance
        cardOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
        cardScale.value = withSpring(1, { damping: 15, stiffness: 100 });
        
        setIsAnimating(false);
      }, 200);
    }
  }, [canGoPrevious, previousCard, isAnimating, cardOpacity, cardScale]);
  
  const handleFlip = useCallback(() => {
    if (!isAnimating) {
      flipCard();
    }
  }, [flipCard, isAnimating]);
  
  // Enhanced navigation handling with error management
  const handleBackToHome = useCallback(() => {
    try {
      NavigationUtils.navigateToHome();
    } catch (error) {
      NavigationErrorHandler.handleNavigationError(error as Error, 'Home');
    }
  }, []);
  
  const handleRestart = useCallback(() => {
    try {
      const startTime = performance.now();
      
      setIsComplete(false);
      setShowCompletion(false);
      resetDeck();
      
      // Reset animations with accessibility considerations
      const springConfig = shouldReduceMotion 
        ? { damping: 25, stiffness: 200 } 
        : { damping: 15, stiffness: 100 };
      
      cardOpacity.value = withSpring(1, springConfig);
      cardScale.value = withSpring(1, springConfig);
      progressOpacity.value = withSpring(1, springConfig);
      completionOpacity.value = 0;
      completionScale.value = 0.8;
      
      // Announce restart for accessibility
      announce('Flashcards restarted', 'polite');
      
      if (__DEV__) {
        const endTime = performance.now();
        PerformanceMonitor.logRender(`Flashcard restart: ${endTime - startTime}ms`);
      }
    } catch (error) {
      console.error('Restart error:', error);
      Alert.alert('Error', 'Failed to restart flashcards. Please try again.');
    }
  }, [resetDeck, cardOpacity, cardScale, progressOpacity, completionOpacity, completionScale, shouldReduceMotion, announce]);
  
  // Handle Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (showCompletion) {
          handleBackToHome();
          return true;
        }
        
        if (state.currentCardIndex > 0) {
          Alert.alert(
            'Exit Flashcards?',
            'You will lose your current progress.',
            [
              { text: 'Continue Learning', style: 'cancel' },
              { text: 'Exit', style: 'destructive', onPress: handleBackToHome },
            ]
          );
          return true;
        }
        
        return false;
      };
      
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [showCompletion, state.currentCardIndex, handleBackToHome])
  );
  
  // Device rotation handling
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      // Reset any ongoing animations on rotation
      if (isAnimating) {
        setIsAnimating(false);
        cardOpacity.value = 1;
        cardScale.value = 1;
      }
    });
    
    return () => subscription?.remove();
  }, [isAnimating, cardOpacity, cardScale]);
  
  // Enhanced gesture integration with error handling
  const gestureProps = useFlashcardGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onTap: handleFlip,
    canSwipeLeft: canGoNext && !isAnimating,
    canSwipeRight: canGoPrevious && !isAnimating,
    disabled: isComplete || !currentCard,
  });

  // Error boundary for gesture handling
  const safeGestureHandler = useCallback((handler: () => void) => {
    try {
      if (!isAnimating && !isComplete && currentCard) {
        handler();
      }
    } catch (error) {
      console.error('Gesture handler error:', error);
      // Reset gesture state on error
      gestureProps.forceReset?.();
    }
  }, [isAnimating, isComplete, currentCard, gestureProps]);
  
  // Styles
  const styles = createStyles(colors);
  
  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardOpacity.value,
      transform: [{ scale: cardScale.value }],
    };
  });
  
  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: progressOpacity.value,
    };
  });
  
  const completionAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: completionOpacity.value,
      transform: [{ scale: completionScale.value }],
    };
  });
  
  // Render completion screen
  if (showCompletion) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />
        
        <Animated.View style={[styles.completionContainer, completionAnimatedStyle]}>
          <Text style={styles.completionEmoji}>🎉</Text>
          <Text style={styles.completionTitle}>Congratulations!</Text>
          <Text style={styles.completionSubtitle}>
            You've completed the {deck.title} deck
          </Text>
          <Text style={styles.completionDescription}>
            You've successfully reviewed all {deck.cards.length} flashcards. 
            Great job learning about AI fundamentals!
          </Text>
          
          <View style={styles.completionButtons}>
            <CustomButton
              title="Study Again"
              onPress={handleRestart}
              variant="primary"
              size="large"
              style={styles.completionButton}
            />
            <CustomButton
              title="Back to Home"
              onPress={handleBackToHome}
              variant="outline"
              size="large"
              style={styles.completionButton}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }
  
  // Main flashcards screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'} />
      
      {/* Progress bar */}
      <Animated.View style={[styles.progressContainer, progressAnimatedStyle]}>
        <ProgressBar
          progress={state.progress}
          currentCard={state.currentCardIndex}
          totalCards={deck.cards.length}
          showNumbers={true}
        />
      </Animated.View>
      
      {/* Main card area */}
      <View style={styles.cardContainer}>
        {currentCard && (
          <Animated.View style={[styles.cardWrapper, cardAnimatedStyle]}>
            <FlashCard
              card={currentCard}
              isFlipped={state.isFlipped}
              onFlip={handleFlip}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              style={styles.card}
            />
          </Animated.View>
        )}
      </View>
      
      {/* Instruction text */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          {state.isFlipped 
            ? (isLastCard ? 'Swipe left to finish' : 'Swipe left for next card')
            : 'Tap card to reveal answer'
          }
        </Text>
        {canGoPrevious && (
          <Text style={styles.secondaryInstructionText}>
            Swipe right to go back
          </Text>
        )}
      </View>
      
      {/* Navigation hints */}
      <View style={styles.hintsContainer}>
        {canGoPrevious && (
          <View style={[styles.hint, styles.hintLeft]}>
            <Text style={styles.hintText}>← Previous</Text>
          </View>
        )}
        {canGoNext && (
          <View style={[styles.hint, styles.hintRight]}>
            <Text style={styles.hintText}>
              {isLastCard ? 'Finish →' : 'Next →'}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    paddingTop: SPACING.SM,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 350,
    aspectRatio: 1.4,
  },
  card: {
    width: '100%',
    height: '100%',
  },
  instructionContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.LG,
    paddingHorizontal: SPACING.LG,
  },
  instructionText: {
    fontSize: FONT_SIZES.MEDIUM,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: FONT_WEIGHTS.MEDIUM,
    marginBottom: SPACING.XS,
  },
  secondaryInstructionText: {
    fontSize: FONT_SIZES.SMALL,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  hintsContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.SM,
    zIndex: -1,
  },
  hint: {
    backgroundColor: `${colors.primary}20`,
    paddingVertical: SPACING.XS,
    paddingHorizontal: SPACING.SM,
    borderRadius: 8,
    opacity: 0.6,
  },
  hintLeft: {
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  hintRight: {
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  hintText: {
    fontSize: FONT_SIZES.SMALL,
    color: colors.primary,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  // Completion screen styles
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.XL,
  },
  completionEmoji: {
    fontSize: 80,
    marginBottom: SPACING.LG,
  },
  completionTitle: {
    fontSize: FONT_SIZES.HEADING,
    fontWeight: FONT_WEIGHTS.BOLD,
    color: colors.text,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  completionSubtitle: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: SPACING.MD,
  },
  completionDescription: {
    fontSize: FONT_SIZES.MEDIUM,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.MEDIUM * 1.5,
    marginBottom: SPACING.XXL,
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  completionButtons: {
    width: '100%',
    maxWidth: 280,
  },
  completionButton: {
    marginBottom: SPACING.MD,
  },
});
