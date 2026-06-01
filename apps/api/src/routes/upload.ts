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

// Import new ImageKit and Unsplash services
import { getUploadAuthParams } from '../services/imagekit.js';
import { getDatingProfilePhoto } from '../services/unsplash.js';

// ── GET /api/upload/imagekit-auth ───────────────────────────────────
// Provides direct secure authentication parameters for client-side uploads.
// Protects the private key on the server while allowing zero-latency uploads.
router.get('/imagekit-auth', requireAuth, (req: AuthRequest, res) => {
  try {
    const authParams = getUploadAuthParams();
    res.json(authParams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate ImageKit upload parameters' });
  }
});

// ── GET /api/upload/avatar-suggestion ───────────────────────────────
// Suggests high-quality Unsplash portrait matches dynamically for the user
router.get('/avatar-suggestion', requireAuth, async (req: AuthRequest, res) => {
  try {
    const gender = (req.query.gender as 'MALE' | 'FEMALE' | 'ALL') || 'ALL';
    const keyword = req.query.keyword as string | undefined;
    const photo = await getDatingProfilePhoto(gender, keyword);
    res.json(photo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve portrait suggestions' });
  }
});

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

