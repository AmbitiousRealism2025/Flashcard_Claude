import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES, FONT_WEIGHTS, ANIMATION_DURATION } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
  transparent?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({
  size = 'medium',
  color,
  message,
  overlay = false,
  transparent = false,
}) => {
  const { colors } = useTheme();
  
  // Animation values
  const spinAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: ANIMATION_DURATION.SHORT,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: ANIMATION_DURATION.SHORT,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous spin animation
    const spinLoop = Animated.loop(
      Animated.timing(spinAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    // Pulse animation for the dots
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    spinLoop.start();
    pulseLoop.start();

    return () => {
      spinLoop.stop();
      pulseLoop.stop();
    };
  }, []);

  const spin = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { spinnerSize: 24, dotSize: 4, spacing: 2 };
      case 'large':
        return { spinnerSize: 48, dotSize: 8, spacing: 4 };
      default:
        return { spinnerSize: 32, dotSize: 6, spacing: 3 };
    }
  };

  const { spinnerSize, dotSize, spacing } = getSizeConfig();
  const spinnerColor = color || colors.primary;

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      ...(overlay && {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: transparent ? 'transparent' : `${colors.background}CC`,
        zIndex: 1000,
      }),
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.LG,
    },
    spinnerContainer: {
      width: spinnerSize,
      height: spinnerSize,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: message ? SPACING.MD : 0,
    },
    spinner: {
      width: spinnerSize,
      height: spinnerSize,
      borderRadius: spinnerSize / 2,
      borderWidth: 2,
      borderColor: `${spinnerColor}30`,
      borderTopColor: spinnerColor,
    },
    dotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: SPACING.SM,
    },
    dot: {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
      backgroundColor: spinnerColor,
      marginHorizontal: spacing,
    },
    message: {
      fontSize: size === 'small' ? FONT_SIZES.SMALL : FONT_SIZES.MEDIUM,
      color: colors.text,
      textAlign: 'center',
      fontWeight: FONT_WEIGHTS.MEDIUM,
      marginTop: SPACING.SM,
      maxWidth: SCREEN_WIDTH * 0.8,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: SPACING.LG,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
    },
  });

  const renderSpinner = () => (
    <View style={styles.spinnerContainer}>
      <Animated.View
        style={[
          styles.spinner,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      />
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                transform: [
                  {
                    scale: pulseAnimation.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: [1, 1.2],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
                opacity: pulseAnimation.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0.6, 1],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );

  const content = (
    <Animated.View
      style={[
        styles.content,
        overlay && !transparent && styles.card,
        {
          opacity: fadeAnimation,
          transform: [{ scale: scaleAnimation }],
        },
      ]}
    >
      {renderSpinner()}
      {message && <Text style={styles.message}>{message}</Text>}
    </Animated.View>
  );

  if (overlay) {
    return (
      <View style={styles.container} pointerEvents="none">
        {content}
      </View>
    );
  }

  return content;
});

LoadingSpinner.displayName = 'LoadingSpinner';

// Additional loading components for specific use cases
export const PageLoadingSpinner: React.FC<{ message?: string }> = React.memo(({ message = 'Loading...' }) => (
  <LoadingSpinner size="large" message={message} overlay transparent />
));

export const InlineLoadingSpinner: React.FC<{ size?: 'small' | 'medium' }> = React.memo(({ size = 'small' }) => (
  <LoadingSpinner size={size} />
));

export const FullScreenLoadingSpinner: React.FC<{ message?: string }> = React.memo(({ message = 'Loading your flashcards...' }) => (
  <LoadingSpinner size="large" message={message} overlay />
));

PageLoadingSpinner.displayName = 'PageLoadingSpinner';
InlineLoadingSpinner.displayName = 'InlineLoadingSpinner';
FullScreenLoadingSpinner.displayName = 'FullScreenLoadingSpinner';