import { useRef, useEffect, useCallback, useMemo } from 'react';
import { Animated, Platform, NativeModules } from 'react-native';
import { useAccessibilityContext } from '../utils/accessibility';

/**
 * 60fps animation utilities with native driver optimizations
 */

export interface AnimationConfig {
  duration?: number;
  useNativeDriver?: boolean;
  isInteraction?: boolean;
  easing?: (value: number) => number;
}

export interface SpringConfig {
  tension?: number;
  friction?: number;
  useNativeDriver?: boolean;
  isInteraction?: boolean;
}

/**
 * Enhanced animation hooks for 60fps performance
 */

// High-performance fade animation
export const useFadeAnimation = (
  duration: number = 300,
  initialValue: number = 0
) => {
  const { shouldReduceMotion } = useAccessibilityContext();
  const fadeAnim = useRef(new Animated.Value(initialValue)).current;

  const fadeIn = useCallback((config?: Partial<AnimationConfig>) => {
    return Animated.timing(fadeAnim, {
      toValue: 1,
      duration: shouldReduceMotion ? 100 : (config?.duration || duration),
      useNativeDriver: true,
      isInteraction: false,
      ...config,
    });
  }, [fadeAnim, duration, shouldReduceMotion]);

  const fadeOut = useCallback((config?: Partial<AnimationConfig>) => {
    return Animated.timing(fadeAnim, {
      toValue: 0,
      duration: shouldReduceMotion ? 100 : (config?.duration || duration),
      useNativeDriver: true,
      isInteraction: false,
      ...config,
    });
  }, [fadeAnim, duration, shouldReduceMotion]);

  const fadeTo = useCallback((toValue: number, config?: Partial<AnimationConfig>) => {
    return Animated.timing(fadeAnim, {
      toValue,
      duration: shouldReduceMotion ? 100 : (config?.duration || duration),
      useNativeDriver: true,
      isInteraction: false,
      ...config,
    });
  }, [fadeAnim, duration, shouldReduceMotion]);

  return {
    fadeAnim,
    fadeIn,
    fadeOut,
    fadeTo,
  };
};

// High-performance scale animation
export const useScaleAnimation = (
  initialValue: number = 1,
  springConfig?: SpringConfig
) => {
  const { shouldReduceMotion } = useAccessibilityContext();
  const scaleAnim = useRef(new Animated.Value(initialValue)).current;

  const defaultSpringConfig: SpringConfig = {
    tension: 150,
    friction: 8,
    useNativeDriver: true,
    isInteraction: false,
  };

  const config = { ...defaultSpringConfig, ...springConfig };

  const scaleIn = useCallback((toValue: number = 1) => {
    if (shouldReduceMotion) {
      scaleAnim.setValue(toValue);
      return Animated.timing(scaleAnim, { toValue, duration: 1, useNativeDriver: true });
    }
    
    return Animated.spring(scaleAnim, {
      toValue,
      ...config,
    });
  }, [scaleAnim, config, shouldReduceMotion]);

  const scaleOut = useCallback((toValue: number = 0.8) => {
    if (shouldReduceMotion) {
      scaleAnim.setValue(toValue);
      return Animated.timing(scaleAnim, { toValue, duration: 1, useNativeDriver: true });
    }
    
    return Animated.spring(scaleAnim, {
      toValue,
      ...config,
    });
  }, [scaleAnim, config, shouldReduceMotion]);

  const scaleTo = useCallback((toValue: number) => {
    if (shouldReduceMotion) {
      scaleAnim.setValue(toValue);
      return Animated.timing(scaleAnim, { toValue, duration: 1, useNativeDriver: true });
    }
    
    return Animated.spring(scaleAnim, {
      toValue,
      ...config,
    });
  }, [scaleAnim, config, shouldReduceMotion]);

  return {
    scaleAnim,
    scaleIn,
    scaleOut,
    scaleTo,
  };
};

// High-performance slide animation
export const useSlideAnimation = (
  initialValue: number = 0,
  duration: number = 300
) => {
  const { shouldReduceMotion } = useAccessibilityContext();
  const slideAnim = useRef(new Animated.Value(initialValue)).current;

  const slideIn = useCallback((fromValue: number, toValue: number = 0) => {
    slideAnim.setValue(fromValue);
    
    return Animated.timing(slideAnim, {
      toValue,
      duration: shouldReduceMotion ? 100 : duration,
      useNativeDriver: true,
      isInteraction: false,
    });
  }, [slideAnim, duration, shouldReduceMotion]);

  const slideOut = useCallback((toValue: number) => {
    return Animated.timing(slideAnim, {
      toValue,
      duration: shouldReduceMotion ? 100 : duration,
      useNativeDriver: true,
      isInteraction: false,
    });
  }, [slideAnim, duration, shouldReduceMotion]);

  return {
    slideAnim,
    slideIn,
    slideOut,
  };
};

// Advanced rotation animation with 60fps optimization
export const useRotationAnimation = (
  initialValue: number = 0,
  duration: number = 1000
) => {
  const { shouldReduceMotion } = useAccessibilityContext();
  const rotationAnim = useRef(new Animated.Value(initialValue)).current;

  const rotate = useCallback((toValue: number = 1, loop: boolean = false) => {
    if (shouldReduceMotion) {
      return Animated.timing(rotationAnim, { toValue, duration: 1, useNativeDriver: true });
    }

    const animation = Animated.timing(rotationAnim, {
      toValue,
      duration,
      useNativeDriver: true,
      isInteraction: false,
    });

    return loop ? Animated.loop(animation) : animation;
  }, [rotationAnim, duration, shouldReduceMotion]);

  const rotateInterpolate = useMemo(() => 
    rotationAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    }), [rotationAnim]
  );

  return {
    rotationAnim,
    rotate,
    rotateInterpolate,
  };
};

// Card flip animation optimized for 60fps
export const useFlipAnimation = (duration: number = 600) => {
  const { shouldReduceMotion } = useAccessibilityContext();
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flip = useCallback(() => {
    return Animated.timing(flipAnim, {
      toValue: flipAnim._value === 0 ? 1 : 0,
      duration: shouldReduceMotion ? 100 : duration,
      useNativeDriver: true,
      isInteraction: true,
    });
  }, [flipAnim, duration, shouldReduceMotion]);

  const flipTo = useCallback((toValue: 0 | 1) => {
    return Animated.timing(flipAnim, {
      toValue,
      duration: shouldReduceMotion ? 100 : duration,
      useNativeDriver: true,
      isInteraction: true,
    });
  }, [flipAnim, duration, shouldReduceMotion]);

  const frontInterpolate = useMemo(() => 
    flipAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    }), [flipAnim]
  );

  const backInterpolate = useMemo(() => 
    flipAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
    }), [flipAnim]
  );

  const frontOpacity = useMemo(() => 
    flipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0, 0],
    }), [flipAnim]
  );

  const backOpacity = useMemo(() => 
    flipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    }), [flipAnim]
  );

  return {
    flipAnim,
    flip,
    flipTo,
    frontInterpolate,
    backInterpolate,
    frontOpacity,
    backOpacity,
  };
};

// Gesture-based animation for swipe interactions
export const useSwipeAnimation = () => {
  const { shouldReduceMotion } = useAccessibilityContext();
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const resetPosition = useCallback((config?: SpringConfig) => {
    if (shouldReduceMotion) {
      translateX.setValue(0);
      translateY.setValue(0);
      scale.setValue(1);
      rotation.setValue(0);
      return Animated.timing(translateX, { toValue: 0, duration: 1, useNativeDriver: true });
    }

    return Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
        ...config,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
        ...config,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
        ...config,
      }),
      Animated.spring(rotation, {
        toValue: 0,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
        ...config,
      }),
    ]);
  }, [translateX, translateY, scale, rotation, shouldReduceMotion]);

  const animateOut = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    const targetX = direction === 'left' ? -500 : direction === 'right' ? 500 : 0;
    const targetY = direction === 'up' ? -500 : direction === 'down' ? 500 : 0;
    const targetRotation = direction === 'left' ? -30 : direction === 'right' ? 30 : 0;

    if (shouldReduceMotion) {
      translateX.setValue(targetX);
      translateY.setValue(targetY);
      rotation.setValue(targetRotation);
      return Animated.timing(translateX, { toValue: targetX, duration: 1, useNativeDriver: true });
    }

    return Animated.parallel([
      Animated.timing(translateX, {
        toValue: targetX,
        duration: 300,
        useNativeDriver: true,
        isInteraction: true,
      }),
      Animated.timing(translateY, {
        toValue: targetY,
        duration: 300,
        useNativeDriver: true,
        isInteraction: true,
      }),
      Animated.timing(rotation, {
        toValue: targetRotation,
        duration: 300,
        useNativeDriver: true,
        isInteraction: true,
      }),
    ]);
  }, [translateX, translateY, rotation, shouldReduceMotion]);

  const rotationInterpolate = useMemo(() => 
    rotation.interpolate({
      inputRange: [-30, 0, 30],
      outputRange: ['-30deg', '0deg', '30deg'],
    }), [rotation]
  );

  return {
    translateX,
    translateY,
    scale,
    rotation,
    rotationInterpolate,
    resetPosition,
    animateOut,
  };
};

// Stagger animation for lists
export const useStaggerAnimation = (
  itemCount: number,
  staggerDelay: number = 100,
  animationDuration: number = 300
) => {
  const { shouldReduceMotion } = useAccessibilityContext();
  const animations = useRef(
    Array.from({ length: itemCount }, () => new Animated.Value(0))
  ).current;

  const startStaggered = useCallback((direction: 'in' | 'out' = 'in') => {
    const toValue = direction === 'in' ? 1 : 0;
    const duration = shouldReduceMotion ? 50 : animationDuration;
    const delay = shouldReduceMotion ? 10 : staggerDelay;

    return Animated.stagger(
      delay,
      animations.map(anim => 
        Animated.timing(anim, {
          toValue,
          duration,
          useNativeDriver: true,
          isInteraction: false,
        })
      )
    );
  }, [animations, animationDuration, staggerDelay, shouldReduceMotion]);

  return {
    animations,
    startStaggered,
  };
};

// Performance monitoring for animations
export const AnimationPerformanceMonitor = {
  measureAnimationPerformance: (animationName: string, animation: Animated.CompositeAnimation) => {
    if (!__DEV__) return animation;

    const startTime = performance.now();
    const startFrames = NativeModules?.PlatformConstants?.reactNativeVersion ? 
      performance.now() : Date.now();

    return {
      ...animation,
      start: (callback?: (result: { finished: boolean }) => void) => {
        animation.start((result) => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          console.log(`[Animation Performance] ${animationName}:`, {
            duration: `${duration.toFixed(2)}ms`,
            completed: result.finished,
            fps: duration > 0 ? Math.round(1000 / (duration / 60)) : 'Unknown',
          });

          callback?.(result);
        });
      },
    };
  },

  // Check if device supports 60fps
  supportsHighRefreshRate: () => {
    if (Platform.OS === 'ios') {
      return NativeModules?.PlatformConstants?.interfaceIdiom === 'pad' ||
             NativeModules?.PlatformConstants?.systemName?.includes('Pro');
    }
    // Android devices vary greatly, assume 60fps is supported
    return true;
  },

  // Get optimal animation duration based on device capabilities
  getOptimalDuration: (baseDuration: number) => {
    const highRefreshRate = AnimationPerformanceMonitor.supportsHighRefreshRate();
    return highRefreshRate ? baseDuration : baseDuration * 1.2;
  },
};

// Preset animation configurations for common use cases
export const AnimationPresets = {
  // Quick micro-interactions
  quick: {
    duration: 150,
    useNativeDriver: true,
    isInteraction: true,
  },

  // Standard UI transitions
  standard: {
    duration: 300,
    useNativeDriver: true,
    isInteraction: false,
  },

  // Smooth entrance animations
  entrance: {
    duration: 500,
    useNativeDriver: true,
    isInteraction: false,
  },

  // Spring configurations
  spring: {
    gentle: { tension: 120, friction: 14 },
    bouncy: { tension: 180, friction: 12 },
    stiff: { tension: 300, friction: 15 },
  },
};

// Batch animation utilities
export const BatchAnimations = {
  // Run animations in parallel for better performance
  parallel: (animations: Animated.CompositeAnimation[]) => {
    return Animated.parallel(animations);
  },

  // Run animations in sequence
  sequence: (animations: Animated.CompositeAnimation[]) => {
    return Animated.sequence(animations);
  },

  // Stagger animations with optimal timing
  stagger: (delay: number, animations: Animated.CompositeAnimation[]) => {
    return Animated.stagger(delay, animations);
  },
};