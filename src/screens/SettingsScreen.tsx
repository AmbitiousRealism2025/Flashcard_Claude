import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { CustomButton } from '../components/CustomButton';
import {
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
} from '../constants/theme';
import { APP_CONFIG } from '../constants/app';

export const SettingsScreen: React.FC = () => {
  const { colors, theme } = useTheme();

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      paddingHorizontal: SPACING.LG,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 + SPACING.MD : SPACING.MD,
      paddingBottom: SPACING.LG,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: FONT_SIZES.HEADING,
      fontWeight: FONT_WEIGHTS.BOLD,
      color: colors.text,
      marginBottom: SPACING.XS,
    },
    headerSubtitle: {
      fontSize: FONT_SIZES.MEDIUM,
      color: colors.textSecondary,
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.LG,
      paddingTop: SPACING.LG,
    },
    section: {
      marginBottom: SPACING.XL,
    },
    sectionTitle: {
      fontSize: FONT_SIZES.LARGE,
      fontWeight: FONT_WEIGHTS.SEMIBOLD,
      color: colors.text,
      marginBottom: SPACING.MD,
    },
    sectionDescription: {
      fontSize: FONT_SIZES.MEDIUM,
      color: colors.textSecondary,
      marginBottom: SPACING.LG,
      lineHeight: 22,
    },
    settingCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.LG,
      marginBottom: SPACING.MD,
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
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.MD,
    },
    settingLabel: {
      fontSize: FONT_SIZES.MEDIUM,
      fontWeight: FONT_WEIGHTS.MEDIUM,
      color: colors.text,
      flex: 1,
    },
    settingDescription: {
      fontSize: FONT_SIZES.SMALL,
      color: colors.textSecondary,
      marginTop: SPACING.XS,
    },
    appInfoCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.LG,
      alignItems: 'center',
      marginBottom: SPACING.XL,
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
    },
    appIcon: {
      fontSize: 48,
      marginBottom: SPACING.MD,
    },
    appName: {
      fontSize: FONT_SIZES.TITLE,
      fontWeight: FONT_WEIGHTS.BOLD,
      color: colors.text,
      marginBottom: SPACING.XS,
    },
    appVersion: {
      fontSize: FONT_SIZES.MEDIUM,
      color: colors.textSecondary,
      marginBottom: SPACING.XS,
    },
    appDescription: {
      fontSize: FONT_SIZES.MEDIUM,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    themeSection: {
      marginBottom: SPACING.XL,
    },
    themePreview: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
      padding: SPACING.MD,
      marginTop: SPACING.MD,
    },
    themePreviewDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: SPACING.SM,
    },
    themePreviewText: {
      fontSize: FONT_SIZES.MEDIUM,
      color: colors.text,
      fontWeight: FONT_WEIGHTS.MEDIUM,
    },
    actionSection: {
      paddingBottom: SPACING.XXL,
    },
  });

  const handleResetSettings = () => {
    // Implementation for resetting settings
    console.log('Reset settings');
  };

  const handleContactSupport = () => {
    // Implementation for contacting support
    console.log('Contact support');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Customize your flashcard experience
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* App Info Section */}
            <View style={styles.section}>
              <View style={styles.appInfoCard}>
                <Text style={styles.appIcon}>🧠</Text>
                <Text style={styles.appName}>{APP_CONFIG.NAME}</Text>
                <Text style={styles.appVersion}>Version {APP_CONFIG.VERSION}</Text>
                <Text style={styles.appDescription}>
                  {APP_CONFIG.DESCRIPTION}
                </Text>
              </View>
            </View>

            {/* Theme Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Appearance</Text>
              <Text style={styles.sectionDescription}>
                Choose your preferred theme for the best learning experience.
                Dark mode can help reduce eye strain during extended study sessions.
              </Text>
              
              <ThemeToggle />
              
              <View style={styles.themePreview}>
                <View 
                  style={[
                    styles.themePreviewDot, 
                    { backgroundColor: colors.primary }
                  ]} 
                />
                <Text style={styles.themePreviewText}>
                  Current theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
            </View>

            {/* Performance Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance</Text>
              <Text style={styles.sectionDescription}>
                Optimize your app experience with performance settings.
              </Text>
              
              <View style={styles.settingCard}>
                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel}>Reduce Animations</Text>
                    <Text style={styles.settingDescription}>
                      Disable animations for better performance on older devices
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Learning Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Learning</Text>
              <Text style={styles.sectionDescription}>
                Customize your flashcard learning experience.
              </Text>
              
              <View style={styles.settingCard}>
                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel}>Auto-flip Cards</Text>
                    <Text style={styles.settingDescription}>
                      Automatically flip cards after a set time
                    </Text>
                  </View>
                </View>
                
                <View style={styles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.settingLabel}>Shuffle Deck</Text>
                    <Text style={styles.settingDescription}>
                      Randomize card order for better learning
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Actions Section */}
            <View style={styles.actionSection}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <Text style={styles.sectionDescription}>
                Manage your app data and get help when needed.
              </Text>
              
              <CustomButton
                title="Contact Support"
                onPress={handleContactSupport}
                variant="outline"
                icon="📧"
                fullWidth
                style={{ marginBottom: SPACING.MD }}
              />
              
              <CustomButton
                title="Reset All Settings"
                onPress={handleResetSettings}
                variant="outline"
                icon="⚠️"
                fullWidth
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
