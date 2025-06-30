import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { StatusBar, Appearance, ColorSchemeName, Platform, Animated } from 'react-native';
import { Theme, ThemeColors } from '../types';
import { LIGHT_THEME, DARK_THEME, ANIMATION_DURATION } from '../constants/theme';
import { STORAGE_KEYS } from '../constants/app';
import { storage } from '../utils/storage';

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => Promise<void>;
  setSystemTheme: () => Promise<void>;
  isLoading: boolean;
  isDarkMode: boolean;
  statusBarStyle: 'light-content' | 'dark-content';
  themeTransition: Animated.Value;
  isSystemTheme: boolean;
  systemColorScheme: ColorSchemeName;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [isSystemTheme, setIsSystemTheme] = useState(false);
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(null);
  const themeTransition = useRef(new Animated.Value(0)).current;

  const colors = useMemo(() => 
    theme === 'light' ? LIGHT_THEME : DARK_THEME, 
    [theme]
  );

  const isDarkMode = useMemo(() => theme === 'dark', [theme]);
  const statusBarStyle = useMemo(() => 
    theme === 'dark' ? 'light-content' : 'dark-content', 
    [theme]
  );

  useEffect(() => {
    loadTheme();
    setSystemColorScheme(Appearance.getColorScheme());
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
      handleSystemThemeChange(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // Update StatusBar style when theme changes with animation
  useEffect(() => {
    // Animate theme transition
    Animated.timing(themeTransition, {
      toValue: theme === 'dark' ? 1 : 0,
      duration: ANIMATION_DURATION.MEDIUM,
      useNativeDriver: false,
    }).start();

    // Update StatusBar style for both platforms
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle(statusBarStyle, true);
    } else {
      StatusBar.setBarStyle(statusBarStyle, true);
      StatusBar.setBackgroundColor(colors.background, true);
    }
  }, [theme, statusBarStyle, colors.background, themeTransition]);

  const loadTheme = async () => {
    try {
      const savedTheme = await storage.get<Theme>(STORAGE_KEYS.THEME);
      const currentSystemTheme = Appearance.getColorScheme();
      
      if (savedTheme) {
        setTheme(savedTheme);
        setIsSystemTheme(false);
      } else {
        // Use system theme as default
        const defaultTheme: Theme = currentSystemTheme === 'dark' ? 'dark' : 'light';
        setTheme(defaultTheme);
        setIsSystemTheme(true);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      // Fallback to light theme
      setTheme('light');
      setIsSystemTheme(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemThemeChange = async (colorScheme: ColorSchemeName) => {
    // Only update if user is using system theme
    if (isSystemTheme && colorScheme) {
      const newTheme: Theme = colorScheme === 'dark' ? 'dark' : 'light';
      setTheme(newTheme);
    }
  };

  const toggleTheme = async (): Promise<void> => {
    try {
      const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      setIsSystemTheme(false);
      await storage.set(STORAGE_KEYS.THEME, newTheme);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  const setSystemTheme = async (): Promise<void> => {
    try {
      const systemTheme = Appearance.getColorScheme();
      const newTheme: Theme = systemTheme === 'dark' ? 'dark' : 'light';
      setTheme(newTheme);
      setIsSystemTheme(true);
      await storage.remove(STORAGE_KEYS.THEME);
    } catch (error) {
      console.error('Error setting system theme:', error);
    }
  };

  const value: ThemeContextType = useMemo(() => ({
    theme,
    colors,
    toggleTheme,
    setSystemTheme,
    isLoading,
    isDarkMode,
    statusBarStyle,
    themeTransition,
    isSystemTheme,
    systemColorScheme,
  }), [
    theme, 
    colors, 
    isLoading, 
    isDarkMode, 
    statusBarStyle, 
    themeTransition, 
    isSystemTheme, 
    systemColorScheme
  ]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
