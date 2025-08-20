// Production-safe logging utility
const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

// For production monitoring, you can integrate with services like:
// - Sentry for error tracking
// - LogRocket for session replay
// - PostHog for analytics
export const logEvent = (eventName: string, properties?: Record<string, any>) => {
  if (isDevelopment) {
    console.log(`Event: ${eventName}`, properties);
  }
  // In production, send to analytics service
  // analytics.track(eventName, properties);
};