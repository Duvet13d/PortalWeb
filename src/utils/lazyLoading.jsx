import { lazy, Suspense } from 'react';

// Lazy load widget components for better performance
export const LazyWeatherWidget = lazy(() => import('../components/widgets/WeatherWidget.jsx'));
export const LazySpotifyWidget = lazy(() => import('../components/widgets/SpotifyWidget.jsx'));
export const LazyTimezoneWidget = lazy(() => import('../components/widgets/TimezoneWidget.jsx'));

// Lazy load tool components
export const LazyCalculator = lazy(() => import('../components/Calculator.jsx'));
export const LazyCurrencyConverter = lazy(() => import('../components/CurrencyConverter.jsx'));
export const LazyNotes = lazy(() => import('../components/tools/Notes.jsx'));

// Lazy load theme components
export const LazyThemeCustomizer = lazy(() => import('../components/theme/ThemeCustomizer.jsx'));

// Loading fallback component
export const WidgetLoadingFallback = ({ height = '200px', width = '100%' }) => (
  <div 
    className="animate-pulse bg-gray-800/50 rounded-lg border border-gray-700/50 flex items-center justify-center"
    style={{ height, width }}
  >
    <div className="flex flex-col items-center space-y-2">
      <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
      <span className="text-gray-400 text-sm">Loading...</span>
    </div>
  </div>
);

// Tool loading fallback
export const ToolLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-10 h-10 border-3 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
      <span className="text-gray-300">Loading tool...</span>
    </div>
  </div>
);

// Progressive loading hook for widgets
export const useProgressiveLoading = () => {
  const loadWidget = (WidgetComponent, fallbackProps = {}) => {
    return (props) => (
      <Suspense fallback={<WidgetLoadingFallback {...fallbackProps} />}>
        <WidgetComponent {...props} />
      </Suspense>
    );
  };

  const loadTool = (ToolComponent) => {
    return (props) => (
      <Suspense fallback={<ToolLoadingFallback />}>
        <ToolComponent {...props} />
      </Suspense>
    );
  };

  return { loadWidget, loadTool };
};

// Intersection Observer for lazy loading widgets on scroll
export const useIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '100px', // Load 100px before element comes into view
    threshold: 0.1
  };

  const observerOptions = { ...defaultOptions, ...options };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, observerOptions);

  return observer;
};

// Preload critical widgets
export const preloadCriticalWidgets = () => {
  // Preload existing widgets that are enabled by default
  import('../components/widgets/WeatherWidget.jsx');
};

// Preload secondary widgets after initial load
export const preloadSecondaryWidgets = () => {
  // Use requestIdleCallback to preload during idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import('../components/widgets/WeatherWidget.jsx');
      import('../components/widgets/SpotifyWidget.jsx');
      import('../components/widgets/TimezoneWidget.jsx');
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      import('../components/widgets/WeatherWidget.jsx');
      import('../components/widgets/SpotifyWidget.jsx');
      import('../components/widgets/TimezoneWidget.jsx');
    }, 2000);
  }
};

// Performance monitoring utilities
export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    
    if (__DEV__) {
      console.log(`${name} took ${end - start} milliseconds`);
    }
    
    return result;
  };
};

// Bundle size analyzer helper
export const logBundleInfo = () => {
  if (__DEV__ && 'performance' in window) {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      console.log('Page load performance:', {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      });
    });
  }
};