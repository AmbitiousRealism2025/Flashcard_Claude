import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitor = {
  /**
   * Measures the time taken to execute a function
   */
  measureTime: <T>(fn: () => T, label?: string): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    if (label) {
      console.log(`${label}: ${end - start}ms`);
    }
    
    return result;
  },

  /**
   * Measures async function execution time
   */
  measureTimeAsync: async <T>(fn: () => Promise<T>, label?: string): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    if (label) {
      console.log(`${label}: ${end - start}ms`);
    }
    
    return result;
  },

  /**
   * Logs render performance
   */
  logRender: (componentName: string) => {
    if (__DEV__) {
      console.log(`[RENDER] ${componentName} at ${new Date().toISOString()}`);
    }
  },
};

/**
 * Hook for stable callback references with dependency tracking
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

/**
 * Hook for memoizing expensive computations with automatic dependency tracking
 */
export const useStableMemo = <T>(factory: () => T, deps: React.DependencyList): T => {
  return useMemo(factory, deps);
};

/**
 * Hook for preventing unnecessary re-renders by comparing previous values
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

/**
 * Hook for debouncing values to prevent excessive re-renders
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttling function calls
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
        }, delay - (now - lastCall.current));
      }
    },
    [callback, delay]
  );

  return throttledCallback as T;
};

/**
 * Hook for optimizing list rendering with virtualization support
 */
export const useVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollOffset, setScrollOffset] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollOffset / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollOffset]);

  return {
    visibleItems,
    setScrollOffset,
  };
};

/**
 * Performance optimization helpers for React components
 */
export const OptimizationHelpers = {
  /**
   * Creates a memoized component with custom comparison
   */
  createMemoComponent: <P extends object>(
    Component: React.ComponentType<P>,
    areEqual?: (prevProps: P, nextProps: P) => boolean
  ) => {
    if (areEqual) {
      return React.memo(Component, areEqual);
    }
    return React.memo(Component);
  },

  /**
   * Shallow comparison for props (useful for React.memo)
   */
  shallowEqual: <T extends Record<string, any>>(obj1: T, obj2: T): boolean => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (let key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }

    return true;
  },

  /**
   * Deep comparison for complex objects
   */
  deepEqual: (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;

    if (obj1 == null || obj2 == null) return false;

    if (typeof obj1 !== typeof obj2) return false;

    if (typeof obj1 !== 'object') return obj1 === obj2;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!OptimizationHelpers.deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  },
};

/**
 * Animation performance utilities
 */
export const AnimationHelpers = {
  /**
   * Performance-optimized spring animation
   */
  createSpringAnimation: (
    from: number,
    to: number,
    config = { tension: 180, friction: 12 }
  ) => {
    const { tension, friction } = config;
    let velocity = 0;
    let position = from;

    return {
      update: (deltaTime: number) => {
        const deltaTimeSeconds = deltaTime / 1000;
        const force = -tension * (position - to);
        const dampening = -friction * velocity;
        const acceleration = force + dampening;

        velocity += acceleration * deltaTimeSeconds;
        position += velocity * deltaTimeSeconds;

        return {
          position,
          velocity,
          isSettled: Math.abs(velocity) < 0.01 && Math.abs(position - to) < 0.01,
        };
      },
    };
  },
};

/**
 * Hook for requesting animation frame with cleanup
 */
export const useAnimationFrame = (callback: (deltaTime: number) => void) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);
};

