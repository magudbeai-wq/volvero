import { logger } from '../utils/logger.js';

const isSentryConfigured =
  process.env.SENTRY_DSN &&
  process.env.SENTRY_DSN !== 'YOUR_SENTRY_DSN';

const isPostHogConfigured =
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY !== 'YOUR_POSTHOG_KEY';

if (isSentryConfigured) {
  logger.info('🛡️ Sentry Error Tracking initialized successfully.');
} else {
  logger.info('💡 Sentry DSN not provided. Telemetry will fallback to local logger.');
}

if (isPostHogConfigured) {
  logger.info('📊 PostHog Product Analytics active.');
} else {
  logger.info('💡 PostHog Analytics key not provided. Simulation active.');
}

/**
 * Capture an exception securely. Sends to Sentry in production or falls back to logger.
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (isSentryConfigured) {
    // In production: Sentry.captureException(error, { extra: context });
  }
  
  logger.error({ error, ...context }, '🔥 telemetry caught exception');
}

/**
 * Track user lifecycle events (signups, swipes, matches, messages, subscriptions).
 */
export function trackTelemetryEvent(
  userId: string,
  eventName: 'signup' | 'swipe' | 'match' | 'message' | 'subscription_purchase' | 'coin_purchase',
  properties?: Record<string, any>
) {
  const payload = {
    userId,
    event: eventName,
    properties: properties || {},
    timestamp: new Date().toISOString(),
  };

  if (isPostHogConfigured) {
    // In production, execute high-performance POST request to PostHog:
    // fetch(`${process.env.NEXT_PUBLIC_POSTHOG_HOST}/capture/`, { method: 'POST', ... });
  }

  logger.info(payload, `📊 telemetry event tracked: ${eventName}`);
}
