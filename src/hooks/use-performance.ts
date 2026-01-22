'use client';

import { useEffect, useRef, useState } from 'react';

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime?: number;
  memoryUsage?: number;
}

export function usePerformance(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>(Date.now());

  useEffect(() => {
    const loadTime = Date.now() - startTimeRef.current;
    const renderTime = Date.now() - renderStartRef.current;

    // Get memory usage if available
    const memoryUsage = (performance as any).memory?.usedJSHeapSize;

    const newMetrics: PerformanceMetrics = {
      loadTime,
      renderTime,
      memoryUsage,
    };

    setMetrics(newMetrics);

    // Log slow components in development
    if (process.env.NODE_ENV === 'development') {
      if (renderTime > 100) {
        console.warn(`Slow component render: ${componentName} took ${renderTime}ms`);
      }
    }

    // Report to analytics in production
    if (process.env.NODE_ENV === 'production' && renderTime > 200) {
      // You can integrate with your analytics service here
      console.log('Performance metric:', { componentName, ...newMetrics });
    }
  }, [componentName]);

  const recordInteraction = (interactionName: string) => {
    const interactionTime = Date.now() - startTimeRef.current;
    
    setMetrics(prev => prev ? {
      ...prev,
      interactionTime,
    } : null);

    // Log slow interactions
    if (interactionTime > 300) {
      console.warn(`Slow interaction: ${interactionName} in ${componentName} took ${interactionTime}ms`);
    }
  };

  return {
    metrics,
    recordInteraction,
  };
}

export function usePagePerformance(pageName: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<{
    fcp?: number; // First Contentful Paint
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    ttfb?: number; // Time to First Byte
  }>({});

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setPerformanceData(prev => ({ ...prev, fcp: entry.startTime }));
            }
            break;
          case 'largest-contentful-paint':
            setPerformanceData(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'first-input':
            setPerformanceData(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setPerformanceData(prev => ({ 
                ...prev, 
                cls: (prev.cls || 0) + (entry as any).value 
              }));
            }
            break;
          case 'navigation':
            const navEntry = entry as PerformanceNavigationTiming;
            setPerformanceData(prev => ({ 
              ...prev, 
              ttfb: navEntry.responseStart - navEntry.requestStart 
            }));
            break;
        }
      });
    });

    // Observe different performance entry types
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation'] });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }

    // Mark page as loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isLoading && Object.keys(performanceData).length > 0) {
      // Report performance data
      console.log(`Page performance for ${pageName}:`, performanceData);
      
      // Check for performance issues
      const issues: string[] = [];
      
      if (performanceData.fcp && performanceData.fcp > 2500) {
        issues.push('Slow First Contentful Paint');
      }
      
      if (performanceData.lcp && performanceData.lcp > 4000) {
        issues.push('Slow Largest Contentful Paint');
      }
      
      if (performanceData.fid && performanceData.fid > 300) {
        issues.push('High First Input Delay');
      }
      
      if (performanceData.cls && performanceData.cls > 0.25) {
        issues.push('High Cumulative Layout Shift');
      }
      
      if (performanceData.ttfb && performanceData.ttfb > 800) {
        issues.push('Slow Time to First Byte');
      }

      if (issues.length > 0) {
        console.warn(`Performance issues detected on ${pageName}:`, issues);
      }
    }
  }, [isLoading, performanceData, pageName]);

  return {
    isLoading,
    performanceData,
  };
}

export function useResourceTiming() {
  const [resourceMetrics, setResourceMetrics] = useState<PerformanceResourceTiming[]>([]);

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[];
      setResourceMetrics(prev => [...prev, ...entries]);
      
      // Log slow resources
      entries.forEach(entry => {
        const loadTime = entry.responseEnd - entry.requestStart;
        if (loadTime > 1000) {
          console.warn(`Slow resource: ${entry.name} took ${loadTime}ms`);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource timing observer not supported:', error);
    }

    return () => observer.disconnect();
  }, []);

  const getSlowResources = (threshold: number = 1000) => {
    return resourceMetrics.filter(entry => 
      (entry.responseEnd - entry.requestStart) > threshold
    );
  };

  const getResourcesByType = (type: string) => {
    return resourceMetrics.filter(entry => 
      entry.initiatorType === type
    );
  };

  return {
    resourceMetrics,
    getSlowResources,
    getResourcesByType,
  };
}