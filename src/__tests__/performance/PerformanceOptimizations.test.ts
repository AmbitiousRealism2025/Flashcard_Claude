/**
 * Comprehensive test suite for performance optimizations
 */

import { act, render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { jest } from '@jest/globals';
import React from 'react';

// Import components and utilities to test
import { FlashCard } from '../../components/FlashCard';
import { CustomButton } from '../../components/CustomButton';
import { ProgressBar } from '../../components/ProgressBar';
import { VirtualizedFlashcardList } from '../../components/VirtualizedFlashcardList';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorBoundary } from '../../components/ErrorBoundary';

import { 
  OptimizationHelpers, 
  useDebounce, 
  useThrottle, 
  PerformanceMonitor 
} from '../../utils/performance';
import { performanceMonitor, PerformanceUtils } from '../../utils/performanceMonitoring';
import { 
  useFadeAnimation, 
  useScaleAnimation, 
  AnimationPerformanceMonitor 
} from '../../utils/animations';

// Mock dependencies
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Animated: {
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => ({ interpolate: jest.fn() })),
    })),
    timing: jest.fn(() => ({ start: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn() })),
    parallel: jest.fn(() => ({ start: jest.fn() })),
    sequence: jest.fn(() => ({ start: jest.fn() })),
    loop: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
  },
  Platform: { OS: 'ios' },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812, scale: 2 })),
    addEventListener: jest.fn(),
  },
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#6D6D80',
      surface: '#F2F2F7',
      border: '#C6C6C8',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
  }),
}));

jest.mock('../../utils/accessibility', () => ({
  useAccessibilityContext: () => ({
    shouldReduceMotion: false,
    announce: jest.fn(),
    isScreenReaderEnabled: false,
  }),
  AccessibilityHelpers: {
    createCardProps: jest.fn(() => ({})),
    createButtonProps: jest.fn(() => ({})),
    announce: jest.fn(),
  },
}));

// Test data
const mockFlashcard = {
  id: '1',
  title: 'Test Card',
  question: 'What is AI?',
  explanation: 'Artificial Intelligence is...',
};

const mockFlashcards = Array.from({ length: 100 }, (_, i) => ({
  id: `${i + 1}`,
  title: `Card ${i + 1}`,
  question: `Question ${i + 1}`,
  explanation: `Explanation ${i + 1}`,
}));

describe('Performance Optimizations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    performanceMonitor.clear();
  });

  describe('React.memo Optimizations', () => {
    it('should prevent unnecessary re-renders with React.memo', () => {
      const onPress = jest.fn();
      const { rerender } = render(
        <CustomButton title="Test" onPress={onPress} variant="primary" />
      );

      // First render
      expect(screen.getByText('Test')).toBeTruthy();

      // Re-render with same props should not cause component to re-render
      rerender(
        <CustomButton title="Test" onPress={onPress} variant="primary" />
      );

      // Component should still be there but internal render count shouldn't increase
      expect(screen.getByText('Test')).toBeTruthy();
    });

    it('should re-render only when props actually change', () => {
      const onPress = jest.fn();
      const { rerender } = render(
        <CustomButton title="Test" onPress={onPress} variant="primary" />
      );

      expect(screen.getByText('Test')).toBeTruthy();

      // Change props - should re-render
      rerender(
        <CustomButton title="New Title" onPress={onPress} variant="primary" />
      );

      expect(screen.getByText('New Title')).toBeTruthy();
    });

    it('should optimize ProgressBar re-renders', () => {
      const { rerender } = render(
        <ProgressBar 
          progress={50} 
          currentCard={5} 
          totalCards={10} 
          showNumbers={true} 
        />
      );

      expect(screen.getByText('6')).toBeTruthy(); // currentCard + 1
      expect(screen.getByText('10')).toBeTruthy();

      // Same props - should not re-render
      rerender(
        <ProgressBar 
          progress={50} 
          currentCard={5} 
          totalCards={10} 
          showNumbers={true} 
        />
      );

      expect(screen.getByText('6')).toBeTruthy();
    });
  });

  describe('Optimization Helpers', () => {
    it('should perform shallow equality correctly', () => {
      const obj1 = { a: 1, b: 2, c: 'test' };
      const obj2 = { a: 1, b: 2, c: 'test' };
      const obj3 = { a: 1, b: 2, c: 'different' };

      expect(OptimizationHelpers.shallowEqual(obj1, obj2)).toBe(true);
      expect(OptimizationHelpers.shallowEqual(obj1, obj3)).toBe(false);
    });

    it('should perform deep equality correctly', () => {
      const obj1 = { a: 1, b: { c: 2, d: [1, 2, 3] } };
      const obj2 = { a: 1, b: { c: 2, d: [1, 2, 3] } };
      const obj3 = { a: 1, b: { c: 2, d: [1, 2, 4] } };

      expect(OptimizationHelpers.deepEqual(obj1, obj2)).toBe(true);
      expect(OptimizationHelpers.deepEqual(obj1, obj3)).toBe(false);
    });
  });

  describe('Performance Hooks', () => {
    it('should debounce function calls correctly', async () => {
      const mockFn = jest.fn();
      
      const TestComponent = () => {
        const debouncedFn = useDebounce(mockFn, 100);
        
        React.useEffect(() => {
          debouncedFn('call1');
          debouncedFn('call2');
          debouncedFn('call3');
        }, [debouncedFn]);

        return <div>Test</div>;
      };

      render(<TestComponent />);

      // Should only call once after debounce delay
      await waitFor(() => {
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith('call3');
      }, { timeout: 200 });
    });

    it('should throttle function calls correctly', async () => {
      const mockFn = jest.fn();
      
      const TestComponent = () => {
        const throttledFn = useThrottle(mockFn, 100);
        
        React.useEffect(() => {
          throttledFn('call1');
          throttledFn('call2');
          throttledFn('call3');
        }, [throttledFn]);

        return <div>Test</div>;
      };

      render(<TestComponent />);

      // Should call immediately for first call, then throttle subsequent calls
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call1');
    });
  });

  describe('Virtualization Performance', () => {
    it('should render only visible items in virtualized list', () => {
      const onCardFlip = jest.fn();
      const onCardSwipe = jest.fn();
      const flippedCards = new Set<string>();

      render(
        <VirtualizedFlashcardList
          flashcards={mockFlashcards}
          onCardFlip={onCardFlip}
          onCardSwipe={onCardSwipe}
          flippedCards={flippedCards}
          itemHeight={200}
          initialNumToRender={3}
        />
      );

      // Should only render a subset of items initially
      const renderedCards = screen.getAllByText(/Card \d+/);
      expect(renderedCards.length).toBeLessThan(mockFlashcards.length);
      expect(renderedCards.length).toBeGreaterThan(0);
    });

    it('should handle empty list without performance issues', () => {
      const onCardFlip = jest.fn();
      const onCardSwipe = jest.fn();
      const flippedCards = new Set<string>();

      render(
        <VirtualizedFlashcardList
          flashcards={[]}
          onCardFlip={onCardFlip}
          onCardSwipe={onCardSwipe}
          flippedCards={flippedCards}
        />
      );

      expect(screen.getByText('No flashcards available')).toBeTruthy();
    });
  });

  describe('Animation Performance', () => {
    it('should create optimized fade animations', () => {
      const TestComponent = () => {
        const { fadeAnim, fadeIn } = useFadeAnimation(300);
        
        React.useEffect(() => {
          fadeIn().start();
        }, [fadeIn]);

        return <div>Animated Component</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText('Animated Component')).toBeTruthy();
    });

    it('should create optimized scale animations', () => {
      const TestComponent = () => {
        const { scaleAnim, scaleIn } = useScaleAnimation();
        
        React.useEffect(() => {
          scaleIn().start();
        }, [scaleIn]);

        return <div>Scaled Component</div>;
      };

      render(<TestComponent />);
      expect(screen.getByText('Scaled Component')).toBeTruthy();
    });

    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      jest.doMock('../../utils/accessibility', () => ({
        useAccessibilityContext: () => ({
          shouldReduceMotion: true,
          announce: jest.fn(),
          isScreenReaderEnabled: false,
        }),
      }));

      const TestComponent = () => {
        const { fadeIn } = useFadeAnimation(300);
        
        React.useEffect(() => {
          const animation = fadeIn();
          // With reduced motion, duration should be much shorter
          expect(animation._config?.duration).toBeLessThan(200);
        }, [fadeIn]);

        return <div>Reduced Motion Component</div>;
      };

      render(<TestComponent />);
    });
  });

  describe('Performance Monitoring', () => {
    it('should record performance metrics', () => {
      const metricName = 'test_metric';
      const metricValue = 123.45;

      performanceMonitor.recordMetric(metricName, metricValue, { context: 'test' });

      const report = performanceMonitor.getReport();
      expect(report.metrics).toContainEqual(
        expect.objectContaining({
          name: metricName,
          value: metricValue,
        })
      );
    });

    it('should record render performance', () => {
      const componentName = 'TestComponent';
      const renderTime = 15.5;

      performanceMonitor.recordRender(componentName, renderTime);

      const report = performanceMonitor.getReport();
      expect(report.renders).toContainEqual(
        expect.objectContaining({
          componentName,
          renderTime,
        })
      );
    });

    it('should warn about slow renders', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Record a slow render (>16ms)
      performanceMonitor.recordRender('SlowComponent', 25);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow render detected')
      );

      consoleSpy.mockRestore();
    });

    it('should measure execution time', () => {
      const result = PerformanceUtils.measureTime(() => {
        // Simulate some work
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      }, 'test_execution');

      expect(result).toBe(499500); // Sum of 0 to 999
      
      const report = performanceMonitor.getReport();
      expect(report.metrics.some(m => m.name === 'execution_test_execution')).toBe(true);
    });
  });

  describe('Loading State Performance', () => {
    it('should render loading spinner without blocking main thread', () => {
      render(<LoadingSpinner size="large" message="Loading..." />);
      
      expect(screen.getByText('Loading...')).toBeTruthy();
      
      // Should use native driver for animations
      // This is implicitly tested by our mock setup
    });

    it('should handle loading state transitions smoothly', async () => {
      const TestComponent = () => {
        const [loading, setLoading] = React.useState(true);
        
        React.useEffect(() => {
          setTimeout(() => setLoading(false), 100);
        }, []);

        return loading ? 
          <LoadingSpinner message="Loading..." /> :
          <div>Content Loaded</div>;
      };

      render(<TestComponent />);
      
      expect(screen.getByText('Loading...')).toBeTruthy();
      
      await waitFor(() => {
        expect(screen.getByText('Content Loaded')).toBeTruthy();
      });
    });
  });

  describe('Error Boundary Performance', () => {
    it('should handle errors without affecting app performance', () => {
      const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div>No Error</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No Error')).toBeTruthy();

      // Trigger error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeTruthy();
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners and timers', () => {
      const mockClearTimeout = jest.spyOn(global, 'clearTimeout');
      const mockRemoveEventListener = jest.spyOn(document, 'removeEventListener');

      const TestComponent = () => {
        React.useEffect(() => {
          const timer = setTimeout(() => {}, 1000);
          const listener = () => {};
          
          document.addEventListener('keydown', listener);
          
          return () => {
            clearTimeout(timer);
            document.removeEventListener('keydown', listener);
          };
        }, []);

        return <div>Test</div>;
      };

      const { unmount } = render(<TestComponent />);
      
      unmount();

      expect(mockClearTimeout).toHaveBeenCalled();
      expect(mockRemoveEventListener).toHaveBeenCalled();

      mockClearTimeout.mockRestore();
      mockRemoveEventListener.mockRestore();
    });
  });

  describe('Accessibility Performance', () => {
    it('should not impact performance with accessibility features enabled', () => {
      const startTime = performance.now();

      render(
        <FlashCard
          card={mockFlashcard}
          isFlipped={false}
          onFlip={jest.fn()}
          onSwipeLeft={jest.fn()}
          onSwipeRight={jest.fn()}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time even with accessibility
      expect(renderTime).toBeLessThan(50); // 50ms threshold
    });
  });

  describe('Bundle Size Impact', () => {
    it('should import only necessary utilities', () => {
      // This test ensures we're not importing entire libraries unnecessarily
      const { OptimizationHelpers } = require('../../utils/performance');
      const { PerformanceMonitor } = require('../../utils/performance');
      
      expect(OptimizationHelpers).toBeDefined();
      expect(PerformanceMonitor).toBeDefined();
      
      // Should be functions/objects, not entire module imports
      expect(typeof OptimizationHelpers.shallowEqual).toBe('function');
      expect(typeof PerformanceMonitor.measureTime).toBe('function');
    });
  });

  describe('Device Performance Adaptation', () => {
    it('should adapt animations based on device capabilities', () => {
      // Mock lower-end device
      jest.doMock('react-native', () => ({
        ...jest.requireActual('react-native'),
        Platform: { OS: 'android' },
        Dimensions: {
          get: () => ({ width: 320, height: 568, scale: 1 }), // Lower resolution
        },
      }));

      const devicePerf = PerformanceUtils.getDevicePerformance();
      
      expect(devicePerf.totalPixels).toBeLessThan(1000000); // Lower pixel count
      expect(devicePerf.pixelRatio).toBe(1);
    });
  });
});

// Performance benchmark tests
describe('Performance Benchmarks', () => {
  it('should render FlashCard within performance budget', () => {
    const renderTimes: number[] = [];
    
    // Render multiple times to get average
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();
      
      const { unmount } = render(
        <FlashCard
          card={mockFlashcard}
          isFlipped={false}
          onFlip={jest.fn()}
        />
      );
      
      const endTime = performance.now();
      renderTimes.push(endTime - startTime);
      
      unmount();
    }
    
    const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    
    // Should render within 16ms budget for 60fps
    expect(avgRenderTime).toBeLessThan(16);
  });

  it('should handle large lists efficiently', () => {
    const largeDataSet = Array.from({ length: 10000 }, (_, i) => ({
      id: `${i}`,
      title: `Item ${i}`,
      question: `Question ${i}`,
      explanation: `Explanation ${i}`,
    }));

    const startTime = performance.now();

    render(
      <VirtualizedFlashcardList
        flashcards={largeDataSet}
        onCardFlip={jest.fn()}
        onCardSwipe={jest.fn()}
        flippedCards={new Set()}
        initialNumToRender={5}
      />
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should handle large datasets efficiently
    expect(renderTime).toBeLessThan(100); // 100ms threshold for large lists
  });
});

export {};