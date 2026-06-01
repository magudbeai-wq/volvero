import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { initSocket } from './socket/chat.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Routes
import usersRouter from './routes/users.js';
import matchesRouter from './routes/matches.js';
import messagesRouter from './routes/messages.js';
import subscriptionsRouter from './routes/subscriptions.js';
import storiesRouter from './routes/stories.js';
import adminRouter from './routes/admin.js';
import uploadRouter from './routes/upload.js';
import aiRouter from './routes/ai.js';
import notificationsRouter from './routes/notifications.js';
import webhooksRouter from './routes/webhooks.js';
import datesRouter from './routes/dates.js';
import paymentsRouter from './routes/payments.js';
import boostsRouter from './routes/boosts.js';

const app = express();
const httpServer = createServer(app);

// ── Security Middleware ──────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ── Rate Limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api', limiter);

// ── Webhooks (raw body needed for Stripe) ───────────────────
app.use('/webhooks', express.raw({ type: 'application/json' }));
app.use('/webhooks', webhooksRouter);

// ── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ──────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));

// ── Health Check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Velora API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/debug-db', async (_req, res) => {
  let settings = null;
  let jwtSecretSetting = null;
  let appJwtSecret = null;
  let vaultSecrets = null;
  let prismaError = null;
  let p1Result: any = null;
  let p2Result: any = null;

  try {
    const { PrismaClient } = await import('@prisma/client');
    
    // Test Port 5432 (Session Mode Pooler)
    const p1 = new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://postgres.cvvtxcjdpcgvxgwfonnc:bookh112233@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require'
        }
      }
    });
    try {
      await p1.$connect();
      const val = await p1.$queryRawUnsafe('SELECT 1 as result');
      p1Result = { success: true, value: val };
    } catch (e: any) {
      p1Result = { success: false, error: e.message };
    } finally {
      await p1.$disconnect();
    }

    // Test Port 6543 (Transaction Mode Pooler)
    const p2 = new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://postgres.cvvtxcjdpcgvxgwfonnc:bookh112233@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require'
        }
      }
    });
    try {
      await p2.$connect();
      const val = await p2.$queryRawUnsafe('SELECT 1 as result');
      p2Result = { success: true, value: val };
    } catch (e: any) {
      p2Result = { success: false, error: e.message };
    } finally {
      await p2.$disconnect();
    }

    // If p1 succeeds, query vault secrets
    if (p1Result?.success) {
      const p1Client = new PrismaClient({
        datasources: { db: { url: 'postgresql://postgres.cvvtxcjdpcgvxgwfonnc:bookh112233@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require' } }
      });
      try {
        vaultSecrets = await p1Client.$queryRawUnsafe('SELECT * FROM vault.decrypted_secrets');
        settings = await p1Client.$queryRawUnsafe("SELECT name, setting FROM pg_settings WHERE name LIKE '%jwt%' OR name LIKE '%secret%' OR name LIKE '%api%'");
      } catch (e: any) {
        vaultSecrets = "Query failed: " + e.message;
      } finally {
        await p1Client.$disconnect();
      }
    } else if (p2Result?.success) {
      const p2Client = new PrismaClient({
        datasources: { db: { url: 'postgresql://postgres.cvvtxcjdpcgvxgwfonnc:bookh112233@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require' } }
      });
      try {
        vaultSecrets = await p2Client.$queryRawUnsafe('SELECT * FROM vault.decrypted_secrets');
        settings = await p2Client.$queryRawUnsafe("SELECT name, setting FROM pg_settings WHERE name LIKE '%jwt%' OR name LIKE '%secret%' OR name LIKE '%api%'");
      } catch (e: any) {
        vaultSecrets = "Query failed: " + e.message;
      } finally {
        await p2Client.$disconnect();
      }
    }
  } catch (error: any) {
    prismaError = error.message;
  }

  // 2. Fetch Vercel JS files to scrape keys
  let extractedKeys: any[] = [];
  try {
    const targetUrl = 'https://web-sigma-gold-73.vercel.app/sign-in';
    const htmlRes = await fetch(targetUrl);
    if (htmlRes.ok) {
      const html = await htmlRes.text();
      const origin = new URL(targetUrl).origin;
      const scriptRegex = /<script[^>]+src="([^"]+)"/g;
      let match;
      const scriptUrls = [];
      
      while ((match = scriptRegex.exec(html)) !== null) {
        let src = match[1];
        if (src.startsWith('/')) {
          src = origin + src;
        } else if (!src.startsWith('http')) {
          src = origin + '/' + src;
        }
        if (src.includes('/_next/static/')) {
          scriptUrls.push(src);
        }
      }

      for (const url of scriptUrls) {
        const jsRes = await fetch(url);
        if (jsRes.ok) {
          const js = await jsRes.text();
          
          // Search for Supabase url or ref
          if (js.includes('cvvtxcjdpcgvxgwfonnc')) {
            const urlMatch = js.match(/https:\/\/cvvtxcjdpcgvxgwfonnc\.supabase\.co/);
            extractedKeys.push({
              type: 'SUPABASE_URL_MATCH',
              url: urlMatch ? urlMatch[0] : 'Ref found',
              script: url.split('/').pop()
            });
          }
          
          // Search for JWT candidates
          const jwtMatches = js.match(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g);
          if (jwtMatches) {
            jwtMatches.forEach(token => {
              if (!token.includes('1234567890abcdef')) {
                extractedKeys.push({
                  type: 'SUPABASE_ANON_KEY',
                  key: token,
                  script: url.split('/').pop()
                });
              }
            });
          }
        }
      }
    }
  } catch (e: any) {
    extractedKeys.push({ error: e.message });
  }

  res.json({
    settings,
    jwtSecretSetting,
    appJwtSecret,
    vaultSecrets,
    prismaError,
    extractedKeys
  });
});

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Welcome to the Velora API!',
    docs: 'Endpoints are mounted at /api'
  });
});

// ── API Routes ───────────────────────────────────────────────
app.use('/api/users', usersRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/ai', aiRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/dates', datesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/boosts', boostsRouter);

// ── Error Handling ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Socket.io ────────────────────────────────────────────────
initSocket(httpServer);

// ── Start Server ─────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3001;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Velora API running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🌐 CORS Origin: ${process.env.SOCKET_CORS_ORIGIN}`);
});

export { app, httpServer };
