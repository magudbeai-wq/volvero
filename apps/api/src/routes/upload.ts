import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const router = Router();

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ dest: 'tmp/' });

// ── POST /api/upload/audio ──────────────────────────────────────
router.post('/audio', requireAuth, upload.single('audio'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video', // Cloudinary treats audio as video resource type
      folder: 'volvero_voice_messages',
    });

    // Cleanup temp file
    fs.unlinkSync(req.file.path);

    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload audio' });
  }
});

export default router;
