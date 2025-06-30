import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { CustomButton } from './CustomButton';
import { SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showErrorDetails?: boolean;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
    }

    // Enhanced error logging with context
    this.logErrorWithContext(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to crash analytics service
    this.reportToCrashAnalytics(error, errorInfo);
  }

  private logErrorWithContext = (error: Error, errorInfo: React.ErrorInfo) => {
    const errorReport = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      context: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location?.href || 'unknown',
        errorId: this.state.errorId,
      },
      deviceInfo: {
        platform: Platform.OS,
        screenWidth: Dimensions.get('window').width,
        screenHeight: Dimensions.get('window').height,
      },
    };

    // Store error locally for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(errorReport);
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.shift();
      }
      localStorage.setItem('app_errors', JSON.stringify(existingErrors));
    } catch (storageError) {
      console.warn('Failed to store error locally:', storageError);
    }
  };

  private reportToCrashAnalytics = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real app, you would integrate with services like:
    // - Firebase Crashlytics
    // - Sentry
    // - Bugsnag
    // - LogRocket
    
    if (__DEV__) {
      console.log('Would report to crash analytics:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
      return;
    }

    // Example crash reporting integration
    try {
      // window.crashAnalytics?.recordError?.(error, {
      //   componentStack: errorInfo.componentStack,
      //   errorId: this.state.errorId,
      // });
    } catch (reportingError) {
      console.warn('Failed to report to crash analytics:', reportingError);
    }
  };

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys !== resetKeys) {
      if (resetKeys.some((key, index) => prevProps.resetKeys?.[index] !== key)) {
        this.resetErrorBoundary();
      }
    }

    // Reset error boundary when any prop changes (if enabled)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });
    }, 100);
  };

  retry = () => {
    this.resetErrorBoundary();
  };

  // Enhanced recovery strategies
  private getRecoveryStrategy = (error: Error): 'retry' | 'reload' | 'fallback' => {
    // Network errors - suggest retry
    if (error.name === 'ChunkLoadError' || error.message.includes('Network')) {
      return 'retry';
    }
    
    // Critical app errors - suggest reload
    if (error.message.includes('Cannot read property') || 
        error.message.includes('undefined is not a function')) {
      return 'reload';
    }
    
    // Default to fallback
    return 'fallback';
  };

  private handleReload = () => {
    try {
      // Clear any cached data that might be causing issues
      localStorage.removeItem('app_cache');
      sessionStorage.clear();
      
      // Reload the app
      window.location.reload();
    } catch (reloadError) {
      console.error('Failed to reload app:', reloadError);
      // Fallback to navigation
      this.resetErrorBoundary();
    }
  };

  private clearAppData = () => {
    try {
      // Clear all local storage (with user confirmation in real app)
      localStorage.clear();
      sessionStorage.clear();
      
      // Reset to initial state
      this.resetErrorBoundary();
    } catch (clearError) {
      console.error('Failed to clear app data:', clearError);
    }
  };

  getErrorMessage(error: Error): string {
    if (error.name === 'ChunkLoadError') {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    if (error.message.includes('Network')) {
      return 'Network error occurred. Please check your connection and retry.';
    }

    if (error.message.includes('Permission')) {
      return 'Permission denied. Please check app permissions and try again.';
    }

    return 'An unexpected error occurred. Please try again.';
  }

  getErrorTitle(error: Error): string {
    if (error.name === 'ChunkLoadError') {
      return 'Connection Problem';
    }
    
    if (error.message.includes('Network')) {
      return 'Network Error';
    }

    if (error.message.includes('Permission')) {
      return 'Permission Error';
    }

    return 'Something went wrong';
  }

  renderErrorUI() {
    const { error, errorInfo, errorId } = this.state;
    const { showErrorDetails = __DEV__ } = this.props;

    if (!error) return null;

    const errorTitle = this.getErrorTitle(error);
    const errorMessage = this.getErrorMessage(error);
    const recoveryStrategy = this.getRecoveryStrategy(error);

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.LG,
      },
      content: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: SPACING.XL,
        maxWidth: SCREEN_WIDTH * 0.9,
        width: '100%',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          android: {
            elevation: 4,
          },
        }),
      },
      icon: {
        fontSize: 64,
        textAlign: 'center',
        marginBottom: SPACING.LG,
      },
      title: {
        fontSize: FONT_SIZES.TITLE,
        fontWeight: FONT_WEIGHTS.BOLD,
        color: '#333333',
        textAlign: 'center',
        marginBottom: SPACING.MD,
      },
      message: {
        fontSize: FONT_SIZES.MEDIUM,
        color: '#666666',
        textAlign: 'center',
        lineHeight: FONT_SIZES.MEDIUM * 1.5,
        marginBottom: SPACING.LG,
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.MD,
        marginBottom: showErrorDetails ? SPACING.LG : 0,
      },
      button: {
        flex: 1,
        maxWidth: 120,
      },
      detailsContainer: {
        marginTop: SPACING.LG,
        padding: SPACING.MD,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        maxHeight: SCREEN_HEIGHT * 0.3,
      },
      detailsTitle: {
        fontSize: FONT_SIZES.SMALL,
        fontWeight: FONT_WEIGHTS.BOLD,
        color: '#666666',
        marginBottom: SPACING.SM,
      },
      errorText: {
        fontSize: FONT_SIZES.EXTRA_SMALL,
        color: '#999999',
        fontFamily: Platform.select({
          ios: 'Menlo',
          android: 'monospace',
        }),
        lineHeight: FONT_SIZES.EXTRA_SMALL * 1.4,
      },
      errorId: {
        fontSize: FONT_SIZES.EXTRA_SMALL,
        color: '#cccccc',
        textAlign: 'center',
        marginTop: SPACING.SM,
        fontFamily: Platform.select({
          ios: 'Menlo',
          android: 'monospace',
        }),
      },
    });

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>😵</Text>
          <Text style={styles.title}>{errorTitle}</Text>
          <Text style={styles.message}>{errorMessage}</Text>
          
          <View style={styles.buttonContainer}>
            <View style={styles.button}>
              <CustomButton
                title={recoveryStrategy === 'reload' ? 'Reload App' : 'Try Again'}
                onPress={recoveryStrategy === 'reload' ? this.handleReload : this.retry}
                variant="primary"
                size="medium"
                fullWidth
              />
            </View>
            {recoveryStrategy === 'reload' && (
              <View style={styles.button}>
                <CustomButton
                  title="Clear Data & Reset"
                  onPress={this.clearAppData}
                  variant="outline"
                  size="medium"
                  fullWidth
                />
              </View>
            )}
          </View>

          {showErrorDetails && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Error Details:</Text>
              <ScrollView 
                style={{ maxHeight: 100 }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.errorText}>
                  {error.name}: {error.message}
                  {errorInfo?.componentStack && `\n\nComponent Stack:${errorInfo.componentStack}`}
                </Text>
              </ScrollView>
              {errorId && (
                <Text style={styles.errorId}>Error ID: {errorId}</Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Error boundary for specific contexts
export const NavigationErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Navigation Error:', error);
      // Could log to crash reporting service
    }}
    resetOnPropsChange
  >
    {children}
  </ErrorBoundary>
);

export const FlashcardErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Flashcard Error:', error);
      // Could log to crash reporting service
    }}
    fallback={
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: SPACING.LG,
      }}>
        <Text style={{ fontSize: 48, marginBottom: SPACING.LG }}>😵</Text>
        <Text style={{ 
          fontSize: FONT_SIZES.LARGE, 
          fontWeight: FONT_WEIGHTS.BOLD,
          textAlign: 'center',
          marginBottom: SPACING.MD,
        }}>
          Flashcard Error
        </Text>
        <Text style={{ 
          fontSize: FONT_SIZES.MEDIUM,
          textAlign: 'center',
          color: '#666666',
        }}>
          Unable to load this flashcard.{'\n'}Please try refreshing the deck.
        </Text>
      </View>
    }
  >
    {children}
  </ErrorBoundary>
);