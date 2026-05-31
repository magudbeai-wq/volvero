import { Resend } from 'resend';
import { logger } from '../utils/logger.js';

// Lazy Resend initialization
let _resend: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith('re_YOUR')) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}


export enum EmailType {
  WELCOME = 'WELCOME',
  MATCH_NOTIFICATION = 'MATCH_NOTIFICATION',
  MESSAGE_NOTIFICATION = 'MESSAGE_NOTIFICATION',
  SUBSCRIPTION_WELCOME = 'SUBSCRIPTION_WELCOME',
  SUBSCRIPTION_CANCELED = 'SUBSCRIPTION_CANCELED',
  VERIFICATION_APPROVED = 'VERIFICATION_APPROVED',
}

type EmailPayload = {
  to: string;
  name: string;
  [key: string]: unknown;
};

export async function sendEmail(type: EmailType, payload: EmailPayload): Promise<void> {
  const resendClient = getResend();
  if (!resendClient) {
    logger.warn({ type }, 'Email not sent — Resend API key not configured');
    return;
  }

  const from = `${process.env.RESEND_FROM_NAME || 'Velora'} <${process.env.RESEND_FROM_EMAIL || 'hello@velora.com'}>`;

  try {
    let subject = '';
    let html = '';

    switch (type) {
      case EmailType.WELCOME:
        subject = `Welcome to Velora, ${payload.name}! 💜`;
        html = welcomeTemplate(payload.name);
        break;

      case EmailType.MATCH_NOTIFICATION:
        subject = `You have a new match on Velora! 💜`;
        html = matchTemplate(payload.name, payload.matchName as string);
        break;

      case EmailType.SUBSCRIPTION_WELCOME:
        subject = `Welcome to Premium — You're now a Velora ${payload.tier} member!`;
        html = subscriptionTemplate(payload.name, payload.tier as string);
        break;

      default:
        return;
    }

    await resendClient.emails.send({ from, to: payload.to, subject, html });
    logger.info({ type, to: payload.to }, 'Email sent');
  } catch (error) {
    logger.error({ error, type }, 'Email send failed');
  }
}

function welcomeTemplate(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Welcome to Velora</title>
</head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#1a0a2e 0%,#0d1b4b 100%);border-radius:24px;padding:48px;border:1px solid rgba(139,92,246,0.3);">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="color:#a78bfa;font-size:32px;margin:0;font-weight:800;letter-spacing:-0.5px;">VELORA</h1>
        <p style="color:#6b7280;font-size:14px;margin:8px 0 0;">Find Your Perfect Match Worldwide</p>
      </div>
      <h2 style="color:#f3f4f6;font-size:24px;font-weight:700;margin:0 0 16px;">Welcome, ${name}! 💜</h2>
      <p style="color:#d1d5db;font-size:16px;line-height:1.6;margin:0 0 24px;">
        You've joined the most premium matchmaking platform. Your journey to finding your perfect match starts now.
      </p>
      <div style="background:rgba(139,92,246,0.1);border-radius:16px;padding:24px;margin:24px 0;border:1px solid rgba(139,92,246,0.2);">
        <h3 style="color:#a78bfa;margin:0 0 16px;font-size:16px;">Get started in 3 steps:</h3>
        <p style="color:#d1d5db;margin:0 0 8px;">✅ Complete your profile to get better matches</p>
        <p style="color:#d1d5db;margin:0 0 8px;">📸 Add your best photos</p>
        <p style="color:#d1d5db;margin:0;">💜 Start discovering your matches</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/discover" 
         style="display:block;text-align:center;background:linear-gradient(135deg,#7c3aed,#2563eb);color:white;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:700;font-size:16px;margin:24px 0 0;">
        Start Discovering Matches →
      </a>
    </div>
    <p style="color:#4b5563;font-size:12px;text-align:center;margin:24px 0 0;">
      © 2024 Velora. All rights reserved.
    </p>
  </div>
</body>
</html>`;
}

function matchTemplate(name: string, matchName: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#1a0a2e,#0d1b4b);border-radius:24px;padding:48px;border:1px solid rgba(139,92,246,0.3);text-align:center;">
      <div style="font-size:72px;margin-bottom:16px;">💜</div>
      <h1 style="color:#a78bfa;font-size:28px;margin:0 0 8px;">It's a Match!</h1>
      <p style="color:#f3f4f6;font-size:18px;margin:0 0 24px;">You and <strong>${matchName}</strong> have liked each other!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" 
         style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:white;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:700;">
        Send a Message →
      </a>
    </div>
  </div>
</body>
</html>`;
}

function subscriptionTemplate(name: string, tier: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#1a0a2e,#0d1b4b);border-radius:24px;padding:48px;border:1px solid rgba(234,179,8,0.3);">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:48px;margin-bottom:16px;">👑</div>
        <h1 style="color:#fbbf24;font-size:28px;margin:0;">Welcome to ${tier}!</h1>
      </div>
      <p style="color:#f3f4f6;font-size:16px;line-height:1.6;">Hi ${name}, your ${tier} subscription is now active. Enjoy unlimited likes, advanced features, and priority matching!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/discover" 
         style="display:block;text-align:center;background:linear-gradient(135deg,#d97706,#fbbf24);color:white;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:700;margin-top:24px;">
        Start Your Premium Experience →
      </a>
    </div>
  </div>
</body>
</html>`;
}
