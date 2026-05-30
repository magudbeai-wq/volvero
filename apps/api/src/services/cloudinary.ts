import { v2 as cloudinary } from 'cloudinary';

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'YOUR_CLOUD_NAME' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'YOUR_API_KEY';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.warn('⚠️ Cloudinary credentials are not configured or are set to placeholders. Local mock fallback enabled.');
}

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// Curated high-resolution Unsplash professional portraits for Somali and culturally diverse dating matching
const MOCK_PROFILES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800'
];

// ── Upload profile photo ──────────────────────────────────────
export async function uploadProfilePhoto(
  base64OrUrl: string,
  userId: string
): Promise<UploadResult> {
  if (!isCloudinaryConfigured) {
    // Generate a unique index based on the userId or pick a random one
    const index = Math.abs(userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % MOCK_PROFILES.length;
    const url = MOCK_PROFILES[index];
    return {
      url,
      publicId: `mock_profile_${userId}_${Date.now()}`,
      width: 800,
      height: 1000,
      format: 'jpg',
      bytes: 142050,
    };
  }

  const result = await cloudinary.uploader.upload(base64OrUrl, {
    folder: `lamaane-doore/profiles/${userId}`,
    transformation: [
      { width: 800, height: 1000, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
    max_bytes: 10_000_000, // 10MB
    overwrite: false,
    unique_filename: true,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

// ── Upload story media ────────────────────────────────────────
export async function uploadStoryMedia(
  base64OrUrl: string,
  userId: string
): Promise<UploadResult> {
  if (!isCloudinaryConfigured) {
    return {
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1080',
      publicId: `mock_story_${userId}_${Date.now()}`,
      width: 1080,
      height: 1920,
      format: 'jpg',
      bytes: 250100,
    };
  }

  const result = await cloudinary.uploader.upload(base64OrUrl, {
    folder: `lamaane-doore/stories/${userId}`,
    resource_type: 'auto',
    transformation: [
      { width: 1080, height: 1920, crop: 'fill' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    max_bytes: 50_000_000, // 50MB
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

// ── Upload chat media ─────────────────────────────────────────
export async function uploadChatMedia(
  base64OrUrl: string,
  conversationId: string
): Promise<UploadResult> {
  if (!isCloudinaryConfigured) {
    return {
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
      publicId: `mock_chat_${conversationId}_${Date.now()}`,
      width: 800,
      height: 800,
      format: 'jpg',
      bytes: 98150,
    };
  }

  const result = await cloudinary.uploader.upload(base64OrUrl, {
    folder: `lamaane-doore/chat/${conversationId}`,
    resource_type: 'auto',
    transformation: [
      { width: 1200, crop: 'limit' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
    max_bytes: 20_000_000, // 20MB
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

// ── Delete media ──────────────────────────────────────────────
export async function deleteMedia(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured) return;
  await cloudinary.uploader.destroy(publicId);
}

// ── Generate signed upload URL for direct browser upload ─────
export function generateSignedUploadParams(userId: string, folder: string) {
  if (!isCloudinaryConfigured) {
    return {
      signature: 'mock_signature',
      timestamp: Math.round(Date.now() / 1000),
      cloudName: 'mock_cloud',
      apiKey: 'mock_api_key',
      folder: `lamaane-doore/${folder}/${userId}`,
    };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: `lamaane-doore/${folder}/${userId}`,
    transformation: 'q_auto:good,f_auto',
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: params.folder,
  };
}

export default cloudinary;
