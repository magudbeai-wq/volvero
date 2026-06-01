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

// Import Cloudinary and Unsplash services
import { generateSignedUploadParams } from '../services/cloudinary.js';
import { getDatingProfilePhoto } from '../services/unsplash.js';

// ── GET /api/upload/cloudinary-auth ──────────────────────────────────
// Provides secure cryptographic signature parameters for direct client uploads to Cloudinary.
// Ensures private keys remain hidden on the server while allowing client-side speed.
router.get('/cloudinary-auth', requireAuth, (req: AuthRequest, res) => {
  try {
    const authParams = generateSignedUploadParams(req.userId!, 'stories');
    res.json(authParams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Cloudinary upload parameters' });
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

