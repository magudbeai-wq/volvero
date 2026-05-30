import { Router } from 'express';
import multer from 'multer';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import {
  uploadProfilePhoto,
  uploadStoryMedia,
  uploadChatMedia,
  generateSignedUploadParams,
} from '../services/cloudinary.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// Use memory storage for multer (buffer → Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'video/mp4'];
    cb(null, allowed.includes(file.mimetype));
  },
});

function bufferToBase64(buffer: Buffer, mimetype: string): string {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
}

// ── POST /api/upload/photo ────────────────────────────────────
router.post('/photo', requireAuth, upload.single('photo'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const base64 = bufferToBase64(req.file.buffer, req.file.mimetype);
    const result = await uploadProfilePhoto(base64, req.userId!);

    // Save to user photos array
    const user = await prisma.user.findUnique({ where: { clerkId: req.userId! } });
    if (user) {
      const photos = user.photos.includes(result.url)
        ? user.photos
        : [...user.photos, result.url].slice(0, 9);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          photos,
          profilePhoto: user.profilePhoto || result.url,
        },
      });
    }

    res.json({ url: result.url, publicId: result.publicId });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ── POST /api/upload/story ────────────────────────────────────
router.post('/story', requireAuth, upload.single('media'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const base64 = bufferToBase64(req.file.buffer, req.file.mimetype);
    const result = await uploadStoryMedia(base64, req.userId!);

    res.json({ url: result.url, publicId: result.publicId });
  } catch (error) {
    res.status(500).json({ error: 'Story upload failed' });
  }
});

// ── POST /api/upload/chat ─────────────────────────────────────
router.post('/chat/:conversationId', requireAuth, upload.single('media'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const base64 = bufferToBase64(req.file.buffer, req.file.mimetype);
    const result = await uploadChatMedia(base64, req.params.conversationId);

    res.json({ url: result.url, publicId: result.publicId });
  } catch (error) {
    res.status(500).json({ error: 'Chat media upload failed' });
  }
});

// ── GET /api/upload/sign ──────────────────────────────────────
// Returns signed params for direct browser-to-Cloudinary uploads
router.get('/sign', requireAuth, (req: AuthRequest, res) => {
  const folder = (req.query.folder as string) || 'profiles';
  const params = generateSignedUploadParams(req.userId!, folder);
  res.json(params);
});

export default router;
