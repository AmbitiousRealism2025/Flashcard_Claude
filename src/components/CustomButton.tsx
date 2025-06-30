import React, { useMemo, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/theme';
import { OptimizationHelpers } from '../utils/performance';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

const CustomButtonComponent: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useTheme();

  // Memoized press handler for performance
  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      onPress();
    }
  }, [onPress, disabled, loading]);

  // Memoized button style calculation
  const buttonStyle = useMemo((): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: size === 'large' ? SPACING.XL : SPACING.LG,
      paddingVertical: size === 'large' ? SPACING.MD : SPACING.SM,
      ...(fullWidth && { width: '100%' }),
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: colors.border,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  }, [colors, variant, size, fullWidth]);

  // Memoized text style calculation
  const textStyleBase = useMemo((): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'large' ? FONT_SIZES.LARGE : FONT_SIZES.MEDIUM,
      fontWeight: FONT_WEIGHTS.SEMIBOLD,
      textAlign: 'center',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          ...baseStyle,
          color: colors.text,
        };
      case 'outline':
      case 'ghost':
        return {
          ...baseStyle,
          color: colors.primary,
        };
      default:
        return baseStyle;
    }
  }, [colors, variant, size]);

  // Memoized final styles
  const finalButtonStyle = useMemo(() => [
    buttonStyle,
    disabled && {
      backgroundColor:
        variant === 'outline' || variant === 'ghost'
          ? 'transparent'
          : colors.border,
      opacity: 0.6,
    },
    style,
  ], [buttonStyle, disabled, variant, colors.border, style]);

  const finalTextStyle = useMemo(() => [
    textStyleBase,
    disabled && {
      color: colors.textSecondary,
    },
    textStyle,
  ], [textStyleBase, disabled, colors.textSecondary, textStyle]);

  return (
    <TouchableOpacity
      style={finalButtonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary' ? '#FFFFFF' : colors.primary
          }
        />
      ) : (
        <>
          {icon && (
            <Text style={[finalTextStyle, { marginRight: SPACING.SM }]}>
              {icon}
            </Text>
          )}
          <Text style={finalTextStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// Export the optimized component with React.memo
export const CustomButton = React.memo(CustomButtonComponent, (prevProps, nextProps) => {
  return OptimizationHelpers.shallowEqual(prevProps, nextProps);
});