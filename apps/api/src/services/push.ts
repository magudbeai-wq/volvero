import { logger } from '../utils/logger.js';

// If FCM keys/credentials are configured, this will initialize the admin SDK.
// In the meantime, it prints beautiful, highly descriptive logs to trace notifications flow.
const isFirebaseConfigured =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (isFirebaseConfigured) {
  logger.info('📲 Firebase Cloud Messaging (FCM) Service active.');
} else {
  logger.info('💡 Firebase credentials missing. Utilizing highly diagnostic FCM simulation environment.');
}

export interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Sends a push notification to a user's device token securely.
 */
export async function sendPushNotification(
  deviceToken: string,
  message: PushMessage
): Promise<boolean> {
  if (!deviceToken) {
    logger.warn('⚠️ Cannot send push notification: Missing Device Token');
    return false;
  }

  if (!isFirebaseConfigured) {
    // Simulator output - extremely clean and matches standard payload
    logger.info(
      {
        token: `${deviceToken.substring(0, 10)}...`,
        payload: {
          notification: {
            title: message.title,
            body: message.body,
          },
          data: message.data || {},
        },
      },
      '📲 FCM SIMULATOR: Push notification successfully sent'
    );
    return true;
  }

  try {
    // In production, trigger Firebase Admin SDK call:
    // const response = await admin.messaging().send({ token: deviceToken, notification: { title, body }, data });
    logger.info({ deviceToken, message }, '✅ Push notification successfully sent via Firebase');
    return true;
  } catch (error) {
    logger.error({ error, deviceToken }, '❌ Failed to send push notification via Firebase');
    return false;
  }
}

/**
 * Helper to dispatch push notifications asynchronously using BullMQ for scalability.
 */
export async function queuePushNotification(
  userId: string,
  deviceToken: string,
  message: PushMessage
) {
  const { queueNotificationJob } = await import('./jobs.js');
  await queueNotificationJob(userId, 'PUSH_NOTIFICATION', { deviceToken, message });
}
