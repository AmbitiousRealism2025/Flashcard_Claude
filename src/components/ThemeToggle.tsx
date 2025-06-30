import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import {
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  ANIMATION_DURATION,
} from '../constants/theme';
import { createThemeShadow, interpolateThemeColor } from '../utils/theme';

interface ThemeToggleProps {
  style?: any;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ style }) => {
  const { theme, colors, toggleTheme, themeTransition, isSystemTheme } = useTheme();
  const switchAnimation = useRef(new Animated.Value(theme === 'dark' ? 1 : 0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(switchAnimation, {
        toValue: theme === 'dark' ? 1 : 0,
        duration: ANIMATION_DURATION.MEDIUM,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: ANIMATION_DURATION.MEDIUM / 2,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: ANIMATION_DURATION.MEDIUM / 2,
          useNativeDriver: true,
        }),
      ])
    ]).start();
  }, [theme, switchAnimation, glowAnimation]);

  const handleToggle = async () => {
    // Add tactile feedback
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: ANIMATION_DURATION.SHORT / 2,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: ANIMATION_DURATION.SHORT / 2,
        useNativeDriver: true,
      }),
    ]).start();

    await toggleTheme();
  };

  const switchTranslateX = switchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 34],
  });

  const switchBackgroundColor = switchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.MD,
      paddingHorizontal: SPACING.LG,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginVertical: SPACING.SM,
      ...createThemeShadow(theme, 2),
    },
    labelContainer: {
      flex: 1,
    },
    label: {
      fontSize: FONT_SIZES.MEDIUM,
      fontWeight: FONT_WEIGHTS.MEDIUM,
      color: colors.text,
    },
    description: {
      fontSize: FONT_SIZES.SMALL,
      color: colors.textSecondary,
      marginTop: SPACING.XS,
    },
    switchContainer: {
      marginLeft: SPACING.MD,
    },
    switch: {
      width: 60,
      height: 32,
      borderRadius: 16,
      padding: 2,
      justifyContent: 'center',
    },
    switchThumb: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.background,
      ...createThemeShadow(theme, 3),
    },
    themeIcon: {
      fontSize: FONT_SIZES.LARGE,
      marginRight: SPACING.SM,
    },
  });

  return (
    <Animated.View style={[styles.container, style, { transform: [{ scale: scaleAnimation }] }]}>
      <View style={styles.labelContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.themeIcon}>{theme === 'dark' ? '🌙' : '☀️'}</Text>
          <Text style={styles.label}>
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </View>
        <Text style={styles.description}>
          {isSystemTheme 
            ? 'Following system theme settings' 
            : 'Switch between light and dark themes'
          }
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.switchContainer}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.switch,
            {
              backgroundColor: switchBackgroundColor,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.switchThumb,
              {
                transform: [{ translateX: switchTranslateX }],
              },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};