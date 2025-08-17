import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

// Custom hook for tracking component lifecycle and interactions
export const useAnalytics = (componentName: string) => {
  const startTime = useRef<number>(Date.now());
  const mounted = useRef<boolean>(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      analytics.trackEvent('component_mounted', {
        algorithm: componentName
      });
    }

    return () => {
      if (mounted.current) {
        const timeSpent = Date.now() - startTime.current;
        analytics.trackEvent('component_unmounted', {
          algorithm: componentName,
          expression_length: timeSpent // Using expression_length field for duration
        });
      }
    };
  }, [componentName]);

  return {
    trackInteraction: (action: string) => {
      analytics.trackEvent('component_interaction', {
        algorithm: componentName,
        error_type: action
      });
    }
  };
};

// Hook for tracking page views and navigation
export const usePageView = (pageName: string) => {
  useEffect(() => {
    analytics.trackEvent('page_view', {
      algorithm: pageName
    });
  }, [pageName]);
};

// Hook for tracking form interactions
export const useFormAnalytics = (formName: string) => {
  return {
    trackFieldFocus: (fieldName: string) => {
      analytics.trackEvent('form_field_focus', {
        algorithm: formName,
        error_type: fieldName
      });
    },
    
    trackFieldBlur: (fieldName: string, value: string) => {
      analytics.trackEvent('form_field_blur', {
        algorithm: formName,
        error_type: fieldName,
        expression_length: value.length
      });
    },
    
    trackSubmit: (isValid: boolean) => {
      analytics.trackEvent('form_submit', {
        algorithm: formName,
        success: isValid
      });
    }
  };
};