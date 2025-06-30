import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useEffect,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { OptimizationHelpers } from '../utils/performance';
import { SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

interface ProgressBarProps {
  progress: number; // 0-100
  currentCard: number;
  totalCards: number;
  showNumbers?: boolean;
}

const ProgressBarComponent: React.FC<ProgressBarProps> = ({
  progress,
  currentCard,
  totalCards,
  showNumbers = true,
}) => {
  const { colors } = useTheme();
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withSpring(progress, {
      damping: 15,
      stiffness: 100,
    });
  }, [progress, progressValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value}%`,
    };
  });

  // Memoized styles for performance
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Memoized progress calculations
  const progressData = useMemo(() => ({
    currentDisplay: Math.min(currentCard + 1, totalCards),
    percentageDisplay: Math.round(progress),
  }), [currentCard, totalCards, progress]);

  return (
    <View style={styles.container}>
      {showNumbers && (
        <View style={styles.numbersContainer}>
          <Text style={styles.currentNumber}>{progressData.currentDisplay}</Text>
          <Text style={styles.separator}>/</Text>
          <Text style={styles.totalNumber}>{totalCards}</Text>
        </View>
      )}
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View style={[styles.progressFill, animatedStyle]} />
        </View>
      </View>

      <Text style={styles.percentageText}>
        {progressData.percentageDisplay}% Complete
      </Text>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
  },
  numbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  currentNumber: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: FONT_WEIGHTS.BOLD,
    color: colors.primary,
  },
  separator: {
    fontSize: FONT_SIZES.MEDIUM,
    color: colors.textSecondary,
    marginHorizontal: SPACING.XS,
  },
  totalNumber: {
    fontSize: FONT_SIZES.MEDIUM,
    color: colors.textSecondary,
  },
  progressContainer: {
    width: screenWidth * 0.8,
    marginBottom: SPACING.SM,
  },
  progressBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  percentageText: {
    fontSize: FONT_SIZES.EXTRA_SMALL,
    color: colors.textSecondary,
    fontWeight: FONT_WEIGHTS.MEDIUM,
  },
});

// Export the optimized component with React.memo
export const ProgressBar = React.memo(ProgressBarComponent, (prevProps, nextProps) => {
  return OptimizationHelpers.shallowEqual(prevProps, nextProps);
});