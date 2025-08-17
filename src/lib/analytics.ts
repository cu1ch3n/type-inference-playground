// Analytics and monitoring setup
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client for analytics
let supabase: any = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Analytics unavailable:', error);
  }
}

export interface AnalyticsEvent {
  event_type: string;
  algorithm?: string;
  expression_length?: number;
  success?: boolean;
  error_type?: string;
  session_id: string;
  timestamp: string;
  user_agent: string;
  viewport_width: number;
  viewport_height: number;
}

class Analytics {
  private sessionId: string;
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = !!supabase && !this.isLocalhost();
    
    if (this.isEnabled) {
      this.trackEvent('app_loaded');
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private isLocalhost(): boolean {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '';
  }

  private getEventData(eventType: string, customData: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
    return {
      event_type: eventType,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      ...customData
    };
  }

  async trackEvent(eventType: string, customData: Partial<AnalyticsEvent> = {}) {
    if (!this.isEnabled) return;

    try {
      const eventData = this.getEventData(eventType, customData);
      
      // Send to Supabase analytics table
      await supabase
        .from('analytics_events')
        .insert([eventData]);
        
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  // Specific tracking methods
  trackAlgorithmChange(algorithm: string) {
    this.trackEvent('algorithm_changed', { algorithm });
  }

  trackInferenceStart(algorithm: string, expressionLength: number) {
    this.trackEvent('inference_started', { 
      algorithm, 
      expression_length: expressionLength 
    });
  }

  trackInferenceSuccess(algorithm: string, expressionLength: number) {
    this.trackEvent('inference_completed', { 
      algorithm, 
      expression_length: expressionLength,
      success: true 
    });
  }

  trackInferenceError(algorithm: string, expressionLength: number, errorType: string) {
    this.trackEvent('inference_error', { 
      algorithm, 
      expression_length: expressionLength,
      success: false,
      error_type: errorType 
    });
  }

  trackRuleInteraction(ruleId: string) {
    this.trackEvent('rule_clicked', { algorithm: ruleId });
  }

  trackStepInteraction(stepId: string) {
    this.trackEvent('step_clicked', { algorithm: stepId });
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Performance monitoring
export const performanceMonitor = {
  startTiming: (label: string): (() => void) => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      analytics.trackEvent('performance_timing', {
        algorithm: label,
        expression_length: Math.round(duration) // Using expression_length field for duration
      });
    };
  },

  trackError: (error: Error, context?: string) => {
    analytics.trackEvent('javascript_error', {
      error_type: error.name,
      algorithm: context || 'unknown',
      expression_length: error.message?.length || 0
    });
  }
};

// Global error handler
window.addEventListener('error', (event) => {
  performanceMonitor.trackError(new Error(event.message), event.filename);
});

window.addEventListener('unhandledrejection', (event) => {
  performanceMonitor.trackError(new Error(event.reason), 'unhandled_promise');
});