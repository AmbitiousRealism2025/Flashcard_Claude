import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();

  const buttonStyles = StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: variant === 'primary' ? colors.primary : colors.surface,
      borderColor: colors.border,
      borderRadius: 12,
      borderWidth: variant === 'secondary' ? 1 : 0,
      justifyContent: 'center',
      paddingHorizontal: SPACING.LG,
      paddingVertical: size === 'large' ? SPACING.MD : SPACING.SM,
      shadowColor: colors.shadow,
      shadowOffset: {
        height: 2,
        width: 0,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonDisabled: {
      backgroundColor: colors.border,
      opacity: 0.6,
    },
    text: {
      color: variant === 'primary' ? '#FFFFFF' : colors.text,
      fontSize: size === 'large' ? FONT_SIZES.LARGE : FONT_SIZES.MEDIUM,
      fontWeight: FONT_WEIGHTS.SEMIBOLD,
    },
    textDisabled: {
      color: colors.textSecondary,
    },
  });

  return (
    <TouchableOpacity
      style={[
        buttonStyles.button,
        disabled && buttonStyles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={[buttonStyles.text, disabled && buttonStyles.textDisabled]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};