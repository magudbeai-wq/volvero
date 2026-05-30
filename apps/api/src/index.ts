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
    service: 'LAMAANE DOORE API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
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

// ── Error Handling ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Socket.io ────────────────────────────────────────────────
initSocket(httpServer);

// ── Start Server ─────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3001;

httpServer.listen(PORT, () => {
  logger.info(`🚀 LAMAANE DOORE API running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🌐 CORS Origin: ${process.env.SOCKET_CORS_ORIGIN}`);
});

export { app, httpServer };
