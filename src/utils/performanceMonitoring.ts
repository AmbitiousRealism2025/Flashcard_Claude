import { useEffect, useRef, useCallback, useState } from 'react';
import { Platform, Dimensions } from 'react-native';

/**
 * Comprehensive performance monitoring and metrics collection
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

export interface RenderMetric {
  componentName: string;
  renderTime: number;
  timestamp: number;
  props?: Record<string, any>;
}

export interface NavigationMetric {
  from: string;
  to: string;
  duration: number;
  timestamp: number;
}

export interface MemoryMetric {
  heapUsed: number;
  heapTotal: number;
  timestamp: number;
}

export interface AnimationMetric {
  name: string;
  duration: number;
  fps: number;
  timestamp: number;
  dropped_frames?: number;
}

/**
 * Central performance monitoring class
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private renderMetrics: RenderMetric[] = [];
  private navigationMetrics: NavigationMetric[] = [];
  private memoryMetrics: MemoryMetric[] = [];
  private animationMetrics: AnimationMetric[] = [];
  
  private observers: ((metric: PerformanceMetric) => void)[] = [];
  private isEnabled: boolean = __DEV__;
  private maxMetrics: number = 1000;

  // Performance thresholds
  private thresholds = {
    renderTime: 16, // 60fps = 16.67ms per frame
    navigationTime: 500,
    memoryUsage: 100 * 1024 * 1024, // 100MB
    animationFPS: 55, // Below 55fps is considered poor
  };

  constructor() {
    this.startMemoryMonitoring();
    this.startFPSMonitoring();
  }

  /**
   * Enable or disable monitoring
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Add performance observer
   */
  addObserver(observer: (metric: PerformanceMetric) => void) {
    this.observers.push(observer);
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, context?: Record<string, any>) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: performance.now(),
      context,
    };

    this.metrics.push(metric);
    this.notifyObservers(metric);
    this.cleanupOldMetrics();

    // Check thresholds and warn if exceeded
    this.checkThresholds(metric);
  }

  /**
   * Record render performance
   */
  recordRender(componentName: string, renderTime: number, props?: Record<string, any>) {
    if (!this.isEnabled) return;

    const metric: RenderMetric = {
      componentName,
      renderTime,
      timestamp: performance.now(),
      props,
    };

    this.renderMetrics.push(metric);
    this.recordMetric(`render_${componentName}`, renderTime, { props });

    if (renderTime > this.thresholds.renderTime) {
      console.warn(`[Performance] Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  }

  /**
   * Record navigation performance
   */
  recordNavigation(from: string, to: string, duration: number) {
    if (!this.isEnabled) return;

    const metric: NavigationMetric = {
      from,
      to,
      duration,
      timestamp: performance.now(),
    };

    this.navigationMetrics.push(metric);
    this.recordMetric('navigation', duration, { from, to });

    if (duration > this.thresholds.navigationTime) {
      console.warn(`[Performance] Slow navigation detected: ${from} → ${to} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Record animation performance
   */
  recordAnimation(name: string, duration: number, fps: number, droppedFrames?: number) {
    if (!this.isEnabled) return;

    const metric: AnimationMetric = {
      name,
      duration,
      fps,
      timestamp: performance.now(),
      dropped_frames: droppedFrames,
    };

    this.animationMetrics.push(metric);
    this.recordMetric(`animation_${name}`, duration, { fps, droppedFrames });

    if (fps < this.thresholds.animationFPS) {
      console.warn(`[Performance] Poor animation performance: ${name} running at ${fps.toFixed(1)}fps`);
    }
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring() {
    if (!this.isEnabled || typeof performance.memory === 'undefined') return;

    const checkMemory = () => {
      const memory = performance.memory;
      const metric: MemoryMetric = {
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize,
        timestamp: performance.now(),
      };

      this.memoryMetrics.push(metric);
      this.recordMetric('memory_heap_used', memory.usedJSHeapSize);

      if (memory.usedJSHeapSize > this.thresholds.memoryUsage) {
        console.warn(`[Performance] High memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      }
    };

    setInterval(checkMemory, 5000); // Check every 5 seconds
  }

  /**
   * Start FPS monitoring
   */
  private startFPSMonitoring() {
    if (!this.isEnabled) return;

    let frames = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        this.recordMetric('fps', fps);
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Notify observers of new metrics
   */
  private notifyObservers(metric: PerformanceMetric) {
    this.observers.forEach(observer => {
      try {
        observer(metric);
      } catch (error) {
        console.error('[Performance] Observer error:', error);
      }
    });
  }

  /**
   * Check performance thresholds
   */
  private checkThresholds(metric: PerformanceMetric) {
    // Custom threshold checking logic
    if (metric.name.includes('render') && metric.value > this.thresholds.renderTime) {
      this.recordMetric('threshold_violation_render', metric.value, metric.context);
    }
  }

  /**
   * Clean up old metrics to prevent memory leaks
   */
  private cleanupOldMetrics() {
    const cutoff = performance.now() - 300000; // Keep last 5 minutes

    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.renderMetrics = this.renderMetrics.filter(m => m.timestamp > cutoff);
    this.navigationMetrics = this.navigationMetrics.filter(m => m.timestamp > cutoff);
    this.memoryMetrics = this.memoryMetrics.filter(m => m.timestamp > cutoff);
    this.animationMetrics = this.animationMetrics.filter(m => m.timestamp > cutoff);

    // Limit total metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get performance report
   */
  getReport(): {
    summary: Record<string, any>;
    metrics: PerformanceMetric[];
    renders: RenderMetric[];
    navigations: NavigationMetric[];
    animations: AnimationMetric[];
  } {
    const now = performance.now();
    const recent = this.metrics.filter(m => now - m.timestamp < 60000); // Last minute

    const summary = {
      totalMetrics: this.metrics.length,
      recentMetrics: recent.length,
      avgRenderTime: this.getAverageRenderTime(),
      avgNavigationTime: this.getAverageNavigationTime(),
      currentMemoryUsage: this.getCurrentMemoryUsage(),
      avgFPS: this.getAverageFPS(),
      slowestComponents: this.getSlowestComponents(),
      thresholdViolations: this.getThresholdViolations(),
    };

    return {
      summary,
      metrics: this.metrics,
      renders: this.renderMetrics,
      navigations: this.navigationMetrics,
      animations: this.animationMetrics,
    };
  }

  /**
   * Get average render time
   */
  private getAverageRenderTime(): number {
    const renderTimes = this.renderMetrics.map(m => m.renderTime);
    return renderTimes.length > 0 ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : 0;
  }

  /**
   * Get average navigation time
   */
  private getAverageNavigationTime(): number {
    const navTimes = this.navigationMetrics.map(m => m.duration);
    return navTimes.length > 0 ? navTimes.reduce((a, b) => a + b, 0) / navTimes.length : 0;
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    const latest = this.memoryMetrics[this.memoryMetrics.length - 1];
    return latest ? latest.heapUsed : 0;
  }

  /**
   * Get average FPS
   */
  private getAverageFPS(): number {
    const fpsMetrics = this.metrics.filter(m => m.name === 'fps');
    const fps = fpsMetrics.map(m => m.value);
    return fps.length > 0 ? fps.reduce((a, b) => a + b, 0) / fps.length : 0;
  }

  /**
   * Get slowest components
   */
  private getSlowestComponents(): Array<{ name: string; avgTime: number }> {
    const componentTimes: Record<string, number[]> = {};
    
    this.renderMetrics.forEach(m => {
      if (!componentTimes[m.componentName]) {
        componentTimes[m.componentName] = [];
      }
      componentTimes[m.componentName].push(m.renderTime);
    });

    return Object.entries(componentTimes)
      .map(([name, times]) => ({
        name,
        avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);
  }

  /**
   * Get threshold violations
   */
  private getThresholdViolations(): number {
    return this.metrics.filter(m => m.name.includes('threshold_violation')).length;
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify(this.getReport(), null, 2);
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
    this.renderMetrics = [];
    this.navigationMetrics = [];
    this.memoryMetrics = [];
    this.animationMetrics = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hooks for performance monitoring
 */

// Hook for component render performance
export const useRenderPerformance = (componentName: string) => {
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - startTimeRef.current;
    performanceMonitor.recordRender(componentName, renderTime);
  });

  return {
    recordRender: (props?: Record<string, any>) => {
      const renderTime = performance.now() - startTimeRef.current;
      performanceMonitor.recordRender(componentName, renderTime, props);
    },
  };
};

// Hook for navigation performance
export const useNavigationPerformance = () => {
  const navigationStartRef = useRef<number>(0);
  const currentRouteRef = useRef<string>('');

  const startNavigation = useCallback((route: string) => {
    navigationStartRef.current = performance.now();
    currentRouteRef.current = route;
  }, []);

  const endNavigation = useCallback((toRoute: string) => {
    const duration = performance.now() - navigationStartRef.current;
    performanceMonitor.recordNavigation(currentRouteRef.current, toRoute, duration);
  }, []);

  return {
    startNavigation,
    endNavigation,
  };
};

// Hook for animation performance
export const useAnimationPerformance = () => {
  const animationStartRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  const startAnimation = useCallback((name: string) => {
    animationStartRef.current = performance.now();
    frameCountRef.current = 0;
  }, []);

  const endAnimation = useCallback((name: string) => {
    const duration = performance.now() - animationStartRef.current;
    const fps = frameCountRef.current > 0 ? (frameCountRef.current / (duration / 1000)) : 0;
    performanceMonitor.recordAnimation(name, duration, fps);
  }, []);

  const recordFrame = useCallback(() => {
    frameCountRef.current++;
  }, []);

  return {
    startAnimation,
    endAnimation,
    recordFrame,
  };
};

// Hook for performance metrics
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState(() => performanceMonitor.getReport());

  useEffect(() => {
    const unsubscribe = performanceMonitor.addObserver(() => {
      setMetrics(performanceMonitor.getReport());
    });

    return unsubscribe;
  }, []);

  return metrics;
};

/**
 * Performance utilities
 */
export const PerformanceUtils = {
  /**
   * Measure execution time of a function
   */
  measureTime: <T>(fn: () => T, label?: string): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    const duration = end - start;
    if (label) {
      performanceMonitor.recordMetric(`execution_${label}`, duration);
    }
    
    return result;
  },

  /**
   * Measure async execution time
   */
  measureTimeAsync: async <T>(fn: () => Promise<T>, label?: string): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    const duration = end - start;
    if (label) {
      performanceMonitor.recordMetric(`async_execution_${label}`, duration);
    }
    
    return result;
  },

  /**
   * Debounce function with performance tracking
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    label?: string
  ): T => {
    let timeout: NodeJS.Timeout;
    let callCount = 0;
    
    return ((...args: any[]) => {
      callCount++;
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        if (label) {
          performanceMonitor.recordMetric(`debounce_${label}_calls`, callCount);
        }
        callCount = 0;
        func(...args);
      }, wait);
    }) as T;
  },

  /**
   * Throttle function with performance tracking
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number,
    label?: string
  ): T => {
    let inThrottle: boolean;
    let callCount = 0;
    
    return ((...args: any[]) => {
      callCount++;
      
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        
        setTimeout(() => {
          inThrottle = false;
          if (label) {
            performanceMonitor.recordMetric(`throttle_${label}_calls`, callCount);
          }
          callCount = 0;
        }, limit);
      }
    }) as T;
  },

  /**
   * Get device performance characteristics
   */
  getDevicePerformance: () => {
    const { width, height } = Dimensions.get('window');
    const pixelRatio = Dimensions.get('window').scale;
    
    return {
      platform: Platform.OS,
      screenWidth: width,
      screenHeight: height,
      pixelRatio,
      totalPixels: width * height * pixelRatio,
      memorySupported: typeof performance.memory !== 'undefined',
      performanceNowSupported: typeof performance.now !== 'undefined',
      requestAnimationFrameSupported: typeof requestAnimationFrame !== 'undefined',
    };
  },
};