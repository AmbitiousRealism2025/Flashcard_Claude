import { useCallback, useRef, useEffect } from 'react';
import { 
  PanGestureHandler, 
  TapGestureHandler, 
  State,
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
  interpolate,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Dimensions, Platform } from 'react-native';
import { GESTURE_CONFIG } from '../constants/app';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UseFlashcardGesturesProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onTap: () => void;
  canSwipeLeft: boolean;
  canSwipeRight: boolean;
  disabled?: boolean;
}

export const useFlashcardGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onTap,
  canSwipeLeft,
  canSwipeRight,
  disabled = false,
}: UseFlashcardGesturesProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotateZ = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  // Gesture state management
  const isAnimating = useSharedValue(false);
  const lastGestureTime = useSharedValue(0);
  const gestureDirection = useSharedValue(0); // -1 for left, 1 for right, 0 for none
  
  const tapRef = useRef<TapGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);
  
  // Enhanced gesture configuration
  const ENHANCED_GESTURE_CONFIG = {
    ...GESTURE_CONFIG,
    SWIPE_THRESHOLD: SCREEN_WIDTH * 0.25, // Dynamic threshold based on screen width
    SWIPE_VELOCITY_THRESHOLD: 300,
    RAPID_GESTURE_COOLDOWN: 150, // ms
    MAX_VERTICAL_DRIFT: 100,
    ROTATION_INTENSITY: 0.1,
    SCALE_INTENSITY: 0.05,
    OPACITY_THRESHOLD: SCREEN_WIDTH * 0.4,
  };

  const triggerHaptics = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (Platform.OS === 'ios') {
      const feedback = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      };
      Haptics.impactAsync(feedback[intensity]);
    }
  }, []);

  // Enhanced pan gesture handler with edge case management
  const panGestureHandler = useAnimatedGestureHandler<PanGestureHandlerEventPayload>({
    onStart: (event) => {
      if (disabled) return;
      
      const now = Date.now();
      if (now - lastGestureTime.value < ENHANCED_GESTURE_CONFIG.RAPID_GESTURE_COOLDOWN) {
        return; // Prevent rapid gestures
      }
      
      lastGestureTime.value = now;
      
      // Cancel any ongoing animations
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(scale);
      cancelAnimation(rotateZ);
      cancelAnimation(opacity);
      
      isAnimating.value = false;
      runOnJS(triggerHaptics)('light');
    },
    
    onActive: (event) => {
      if (disabled || isAnimating.value) return;
      
      const { translationX, translationY, velocityX } = event;
      
      // Limit vertical movement and prioritize horizontal gestures
      const constrainedY = Math.max(
        -ENHANCED_GESTURE_CONFIG.MAX_VERTICAL_DRIFT,
        Math.min(ENHANCED_GESTURE_CONFIG.MAX_VERTICAL_DRIFT, translationY)
      );
      
      translateX.value = translationX;
      translateY.value = constrainedY * 0.3; // Reduced vertical movement
      
      // Dynamic rotation based on horizontal movement and velocity
      const rotationFactor = (translationX * ENHANCED_GESTURE_CONFIG.ROTATION_INTENSITY) + 
                           (velocityX * 0.01);
      rotateZ.value = Math.max(-15, Math.min(15, rotationFactor));
      
      // Dynamic scale effect
      const distance = Math.sqrt(translationX * translationX + constrainedY * constrainedY);
      scale.value = Math.max(0.9, 1 - (distance * ENHANCED_GESTURE_CONFIG.SCALE_INTENSITY * 0.001));
      
      // Dynamic opacity for swipe indication
      const absTranslationX = Math.abs(translationX);
      if (absTranslationX > ENHANCED_GESTURE_CONFIG.OPACITY_THRESHOLD) {
        opacity.value = Math.max(0.3, 1 - ((absTranslationX - ENHANCED_GESTURE_CONFIG.OPACITY_THRESHOLD) * 0.002));
      } else {
        opacity.value = 1;
      }
      
      // Determine gesture direction for haptic feedback
      const currentDirection = translationX > 0 ? 1 : -1;
      if (gestureDirection.value !== currentDirection && Math.abs(translationX) > 50) {
        gestureDirection.value = currentDirection;
        runOnJS(triggerHaptics)('light');
      }
    },
    
    onEnd: (event) => {
      if (disabled) return;
      
      const { translationX, velocityX, translationY } = event;
      const absTranslationX = Math.abs(translationX);
      const absTranslationY = Math.abs(translationY);
      
      // Reset gesture direction
      gestureDirection.value = 0;
      
      // Prevent accidental swipes (too much vertical movement)
      if (absTranslationY > absTranslationX * 0.7) {
        // Reset to center - likely an accidental gesture
        resetToCenter();
        return;
      }
      
      // Enhanced swipe detection
      const shouldSwipeLeft = (
        translationX > ENHANCED_GESTURE_CONFIG.SWIPE_THRESHOLD ||
        (translationX > 50 && velocityX > ENHANCED_GESTURE_CONFIG.SWIPE_VELOCITY_THRESHOLD)
      ) && canSwipeLeft;
      
      const shouldSwipeRight = (
        translationX < -ENHANCED_GESTURE_CONFIG.SWIPE_THRESHOLD ||
        (translationX < -50 && velocityX < -ENHANCED_GESTURE_CONFIG.SWIPE_VELOCITY_THRESHOLD)
      ) && canSwipeRight;

      if (shouldSwipeLeft) {
        isAnimating.value = true;
        // Animate off screen to the right
        translateX.value = withSpring(SCREEN_WIDTH, { damping: 20, stiffness: 150 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(triggerHaptics)('medium');
        runOnJS(onSwipeLeft)();
        
        // Reset after animation
        setTimeout(() => {
          resetToCenter();
        }, 300);
        
      } else if (shouldSwipeRight) {
        isAnimating.value = true;
        // Animate off screen to the left
        translateX.value = withSpring(-SCREEN_WIDTH, { damping: 20, stiffness: 150 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(triggerHaptics)('medium');
        runOnJS(onSwipeRight)();
        
        // Reset after animation
        setTimeout(() => {
          resetToCenter();
        }, 300);
        
      } else {
        // Spring back to center
        resetToCenter();
      }
    },
    
    onFinish: () => {
      if (!isAnimating.value) {
        resetToCenter();
      }
    },
  });

  // Enhanced tap gesture handler
  const tapGestureHandler = useAnimatedGestureHandler<TapGestureHandlerEventPayload>({
    onStart: () => {
      if (disabled || isAnimating.value) return;
      
      // Visual feedback for tap
      scale.value = withSpring(0.95, { damping: 20, stiffness: 300 }, () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      });
    },
    
    onEnd: (event) => {
      if (disabled || isAnimating.value) return;
      
      if (event.state === State.END) {
        runOnJS(triggerHaptics)('light');
        runOnJS(onTap)();
      }
    },
  });

  // Helper function to reset animations
  const resetToCenter = useCallback(() => {
    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    rotateZ.value = withSpring(0, { damping: 15, stiffness: 150 });
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 150 });
    isAnimating.value = false;
  }, [translateX, translateY, rotateZ, scale, opacity, isAnimating]);

  // Device rotation handling
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      // Reset animations on device rotation
      if (translateX.value !== 0 || translateY.value !== 0) {
        resetToCenter();
      }
    });

    return () => subscription?.remove();
  }, [resetToCenter, translateX, translateY]);

  // Reset animations when disabled state changes
  useEffect(() => {
    if (disabled) {
      resetToCenter();
    }
  }, [disabled, resetToCenter]);

  // Enhanced animated style with additional properties
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotateZ.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  // Public methods for external control
  const resetAnimation = useCallback(() => {
    resetToCenter();
  }, [resetToCenter]);

  const forceReset = useCallback(() => {
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    cancelAnimation(rotateZ);
    cancelAnimation(scale);
    cancelAnimation(opacity);
    resetToCenter();
  }, [resetToCenter, translateX, translateY, rotateZ, scale, opacity]);

  const isCurrentlyAnimating = useCallback(() => {
    return isAnimating.value;
  }, [isAnimating]);

  return {
    panGestureHandler,
    tapGestureHandler,
    animatedStyle,
    resetAnimation,
    forceReset,
    isCurrentlyAnimating,
    tapRef,
    panRef,
    // Expose animation values for external use if needed
    animations: {
      translateX,
      translateY,
      scale,
      rotateZ,
      opacity,
    },
  };
};