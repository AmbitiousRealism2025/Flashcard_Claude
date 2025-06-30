import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LoadingSpinner } from './LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import { useAccessibilityContext } from '../utils/accessibility';
import { SPACING, FONT_SIZES, FONT_WEIGHTS, ANIMATION_DURATION } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BaseLoadingProps {
  message?: string;
  subMessage?: string;
  progress?: number;
  onCancel?: () => void;
}

// App initialization loading screen
export const AppInitializationLoading: React.FC<BaseLoadingProps> = React.memo(({
  message = 'Initializing AI Flashcards...',
  subMessage = 'Loading your learning environment',
}) => {
  const { colors } = useTheme();
  const { shouldReduceMotion, announce } = useAccessibilityContext();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const styles = useMemo(() => createAppInitStyles(colors), [colors]);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: shouldReduceMotion ? ANIMATION_DURATION.SHORT : ANIMATION_DURATION.MEDIUM,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: shouldReduceMotion ? ANIMATION_DURATION.SHORT : ANIMATION_DURATION.MEDIUM,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation for brain emoji
    if (!shouldReduceMotion) {
      const floatingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );
      floatingAnimation.start();
      
      return () => floatingAnimation.stop();
    }

    // Announce loading for accessibility
    announce(message, 'assertive');
  }, [shouldReduceMotion, fadeAnim, scaleAnim, rotateAnim, message, announce]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.logo,
            {
              transform: [{ rotate: rotateInterpolate }],
            },
          ]}
        >
          🧠
        </Animated.Text>
        
        <Text style={styles.title}>AI Flashcards</Text>
        
        <LoadingSpinner
          size="large"
          color={colors.primary}
          message=""
        />
        
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.subMessage}>{subMessage}</Text>
      </Animated.View>
    </View>
  );
});

// Flashcard deck loading screen
export const FlashcardDeckLoading: React.FC<BaseLoadingProps & { deckName?: string }> = React.memo(({
  message = 'Loading flashcards...',
  deckName = 'AI Fundamentals',
  progress,
}) => {
  const { colors } = useTheme();
  const { announce } = useAccessibilityContext();
  
  const styles = useMemo(() => createDeckLoadingStyles(colors), [colors]);

  useEffect(() => {
    announce(`Loading ${deckName} deck`, 'polite');
  }, [deckName, announce]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.deckIcon}>📚</Text>
        <Text style={styles.deckName}>{deckName}</Text>
        
        <LoadingSpinner
          size="medium"
          color={colors.primary}
          message=""
        />
        
        <Text style={styles.message}>{message}</Text>
        
        {progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress}%`, backgroundColor: colors.primary }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}
      </View>
    </View>
  );
});

// Navigation transition loading
export const NavigationLoading: React.FC<BaseLoadingProps> = React.memo(({
  message = 'Loading...',
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createNavLoadingStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <LoadingSpinner
        size="medium"
        color={colors.primary}
        message={message}
        overlay
        transparent
      />
    </View>
  );
});

// Data sync loading
export const DataSyncLoading: React.FC<BaseLoadingProps & { 
  syncType?: 'save' | 'load' | 'sync' 
}> = React.memo(({
  message,
  syncType = 'sync',
  progress,
}) => {
  const { colors } = useTheme();
  const { announce } = useAccessibilityContext();
  
  const styles = useMemo(() => createSyncLoadingStyles(colors), [colors]);

  const getIcon = () => {
    switch (syncType) {
      case 'save': return '💾';
      case 'load': return '📂';
      default: return '🔄';
    }
  };

  const getMessage = () => {
    if (message) return message;
    switch (syncType) {
      case 'save': return 'Saving your progress...';
      case 'load': return 'Loading your data...';
      default: return 'Syncing data...';
    }
  };

  useEffect(() => {
    announce(getMessage(), 'polite');
  }, [getMessage, announce]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>{getIcon()}</Text>
        
        <LoadingSpinner
          size="small"
          color={colors.primary}
          message=""
        />
        
        <Text style={styles.message}>{getMessage()}</Text>
        
        {progress !== undefined && (
          <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
        )}
      </View>
    </View>
  );
});

// Skeleton loading for cards
export const FlashcardSkeleton: React.FC<{ count?: number }> = React.memo(({ count = 3 }) => {
  const { colors } = useTheme();
  const { shouldReduceMotion } = useAccessibilityContext();
  
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const styles = useMemo(() => createSkeletonStyles(colors), [colors]);

  useEffect(() => {
    if (!shouldReduceMotion) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    }
  }, [shouldReduceMotion, pulseAnim]);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.skeletonCard,
            { opacity: shouldReduceMotion ? 0.7 : pulseAnim },
          ]}
        >
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonText} />
          <View style={styles.skeletonTextShort} />
        </Animated.View>
      ))}
    </View>
  );
});

// Loading state manager component
export const LoadingStateManager: React.FC<{
  state: 'idle' | 'app-init' | 'deck-loading' | 'navigation' | 'data-sync';
  props?: any;
  children: React.ReactNode;
}> = React.memo(({ state, props = {}, children }) => {
  switch (state) {
    case 'app-init':
      return <AppInitializationLoading {...props} />;
    case 'deck-loading':
      return <FlashcardDeckLoading {...props} />;
    case 'navigation':
      return <NavigationLoading {...props} />;
    case 'data-sync':
      return <DataSyncLoading {...props} />;
    case 'idle':
    default:
      return <>{children}</>;
  }
});

// Styles
const createAppInitStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.XL,
  },
  logo: {
    fontSize: 80,
    marginBottom: SPACING.LG,
  },
  title: {
    fontSize: FONT_SIZES.HEADING,
    fontWeight: FONT_WEIGHTS.BOLD,
    color: colors.text,
    marginBottom: SPACING.XL,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.LARGE,
    color: colors.primary,
    textAlign: 'center',
    marginTop: SPACING.LG,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  subMessage: {
    fontSize: FONT_SIZES.MEDIUM,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.SM,
  },
});

const createDeckLoadingStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.XL,
  },
  deckIcon: {
    fontSize: 64,
    marginBottom: SPACING.MD,
  },
  deckName: {
    fontSize: FONT_SIZES.TITLE,
    fontWeight: FONT_WEIGHTS.BOLD,
    color: colors.text,
    marginBottom: SPACING.LG,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.MEDIUM,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.MD,
  },
  progressContainer: {
    width: SCREEN_WIDTH * 0.6,
    marginTop: SPACING.LG,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: FONT_SIZES.SMALL,
    color: colors.textSecondary,
    marginTop: SPACING.SM,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
});

const createNavLoadingStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

const createSyncLoadingStyles = (colors: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `${colors.background}90`,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: SPACING.XL,
    alignItems: 'center',
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  icon: {
    fontSize: 32,
    marginBottom: SPACING.MD,
  },
  message: {
    fontSize: FONT_SIZES.MEDIUM,
    color: colors.text,
    textAlign: 'center',
    marginTop: SPACING.MD,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
  progressText: {
    fontSize: FONT_SIZES.SMALL,
    color: colors.textSecondary,
    marginTop: SPACING.SM,
  },
});

const createSkeletonStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: SPACING.LG,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    height: 150,
    justifyContent: 'space-around',
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '60%',
  },
  skeletonText: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '80%',
  },
  skeletonTextShort: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: 4,
    width: '40%',
  },
});

// Add display names
AppInitializationLoading.displayName = 'AppInitializationLoading';
FlashcardDeckLoading.displayName = 'FlashcardDeckLoading';
NavigationLoading.displayName = 'NavigationLoading';
DataSyncLoading.displayName = 'DataSyncLoading';
FlashcardSkeleton.displayName = 'FlashcardSkeleton';
LoadingStateManager.displayName = 'LoadingStateManager';