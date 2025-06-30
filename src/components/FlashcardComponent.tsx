import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import {
  PanGestureHandler,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useFlashcardGestures } from '../hooks/useFlashcardGestures';
import { Flashcard } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FlashcardComponentProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  canSwipeLeft: boolean;
  canSwipeRight: boolean;
  showControls?: boolean;
}

export const FlashcardComponent: React.FC<FlashcardComponentProps> = ({
  card,
  isFlipped,
  onFlip,
  onSwipeLeft,
  onSwipeRight,
  canSwipeLeft,
  canSwipeRight,
  showControls = true,
}) => {
  const { colors } = useTheme();
  
  const {
    panGestureHandler,
    tapGestureHandler,
    animatedStyle,
    resetAnimation,
    tapRef,
    panRef,
  } = useFlashcardGestures({
    onSwipeLeft,
    onSwipeRight,
    onTap: onFlip,
    canSwipeLeft,
    canSwipeRight,
  });

  // Flip animation
  const flipValue = useSharedValue(0);

  useEffect(() => {
    flipValue.value = withSpring(isFlipped ? 180 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFlipped, flipValue]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 180], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipValue.value, [0, 180], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  // Reset animations when card changes
  useEffect(() => {
    resetAnimation();
  }, [card.id, resetAnimation]);

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <PanGestureHandler 
        ref={panRef} 
        onGestureEvent={panGestureHandler}
        simultaneousHandlers={tapRef}
        minPointers={1}
        maxPointers={1}
      >
        <Animated.View style={[styles.cardContainer, animatedStyle]}>
          <TapGestureHandler 
            ref={tapRef} 
            onGestureEvent={tapGestureHandler}
            simultaneousHandlers={panRef}
            numberOfTaps={1}
          >
            <Animated.View style={styles.card}>
              {/* Front of card (Question) */}
              <Animated.View style={[styles.cardFace, styles.cardFront, frontAnimatedStyle]}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardQuestion}>{card.question}</Text>
                  <Text style={styles.tapHint}>Tap to reveal answer</Text>
                </View>
              </Animated.View>

              {/* Back of card (Answer) */}
              <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardAnswer}>{card.explanation}</Text>
                  <Text style={styles.tapHint}>Tap to see question</Text>
                </View>
              </Animated.View>
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>

      {/* Gesture hints */}
      {showControls && (
        <View style={styles.hintsContainer}>
          <View style={[styles.swipeHint, !canSwipeRight && styles.swipeHintDisabled]}>
            <Text style={[styles.swipeHintText, !canSwipeRight && styles.swipeHintTextDisabled]}>
              ← Previous
            </Text>
          </View>
          <View style={[styles.swipeHint, !canSwipeLeft && styles.swipeHintDisabled]}>
            <Text style={[styles.swipeHintText, !canSwipeLeft && styles.swipeHintTextDisabled]}>
              Next →
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cardContainer: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.6,
  },
  card: {
    flex: 1,
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardFront: {
    // Additional front-specific styles if needed
  },
  cardBack: {
    // Additional back-specific styles if needed
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  cardQuestion: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
    flex: 1,
    textAlignVertical: 'center',
  },
  cardAnswer: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    flex: 1,
    textAlignVertical: 'center',
  },
  tapHint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.7,
  },
  hintsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: screenWidth * 0.85,
    marginTop: 20,
  },
  swipeHint: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.accent,
    borderRadius: 20,
    opacity: 0.8,
  },
  swipeHintDisabled: {
    backgroundColor: colors.border,
    opacity: 0.3,
  },
  swipeHintText: {
    fontSize: 14,
    color: colors.surface,
    fontWeight: '500',
  },
  swipeHintTextDisabled: {
    color: colors.textSecondary,
  },
});