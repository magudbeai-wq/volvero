import crypto from 'crypto';
import { logger } from '../utils/logger.js';

const isImageKitConfigured =
  process.env.IMAGEKIT_PUBLIC_KEY &&
  process.env.IMAGEKIT_PUBLIC_KEY !== 'YOUR_IMAGEKIT_PUBLIC_KEY' &&
  process.env.IMAGEKIT_PRIVATE_KEY &&
  process.env.IMAGEKIT_PRIVATE_KEY !== 'YOUR_IMAGEKIT_PRIVATE_KEY' &&
  process.env.IMAGEKIT_URL_ENDPOINT;

if (isImageKitConfigured) {
  logger.info('🎨 ImageKit Media Service is active and configured.');
} else {
  logger.warn('⚠️ ImageKit credentials are not fully configured. Using mock credentials for development fallback.');
}

export interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

/**
 * Generates secure authentication parameters for client-side direct uploads.
 * This ensures the private key remains secret on the server while letting
 * clients upload photos directly to the CDN, reducing server load.
 */
export function getUploadAuthParams(): ImageKitAuthParams {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || 'mock_ik_public_key';
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/mock_project';

  if (!isImageKitConfigured) {
    const mockToken = crypto.randomBytes(16).toString('hex');
    const mockExpire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes expiry
    return {
      token: mockToken,
      expire: mockExpire,
      signature: 'mock_signature_for_development',
      publicKey,
      urlEndpoint,
    };
  }

  const token = crypto.randomBytes(16).toString('hex');
  const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes expiration
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY!;

  // HMAC-SHA1 of token + expire is required by ImageKit
  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(token + expire.toString())
    .digest('hex');

  return {
    token,
    expire,
    signature,
    publicKey,
    urlEndpoint,
  };
}

/**
 * Helper to build optimized, beautiful ImageKit URLs dynamically.
 * Features: Automatic WebP/AVIF delivery, smart facial recognition cropping, and responsive width.
 */
export function getOptimizedUrl(
  pathOrUrl: string,
  options: {
    width?: number;
    height?: number;
    cropMode?: 'face' | 'pad' | 'extract' | 'fill';
    quality?: number;
    blur?: number;
  } = {}
): string {
  const baseEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/mock_project';
  
  // Extract path if full URL is passed
  let path = pathOrUrl;
  if (pathOrUrl.startsWith('http')) {
    try {
      const urlObj = new URL(pathOrUrl);
      // If it's already an ImageKit URL, strip the endpoint to get the relative path
      if (pathOrUrl.includes('ik.imagekit.io')) {
        const parts = urlObj.pathname.split('/');
        parts.shift(); // remove empty leading element
        parts.shift(); // remove imagekit project ID
        path = parts.join('/');
      } else {
        // Return external URLs as is
        return pathOrUrl;
      }
    } catch {
      return pathOrUrl;
    }
  }

  // Construct transformations
  const transformations: string[] = [];
  
  // Format optimization (WebP/AVIF) and quality are enabled by default on ImageKit,
  // but we can make it explicit
  transformations.push('f-auto');

  if (options.width) transformations.push(`w-${options.width}`);
  if (options.height) transformations.push(`h-${options.height}`);
  
  if (options.cropMode === 'face') {
    transformations.push('fo-face'); // Smart crop focusing on faces for dating app avatars!
    transformations.push('cm-pad_resize');
  } else if (options.cropMode === 'fill') {
    transformations.push('cm-extract');
  }
  
  if (options.quality) transformations.push(`q-${options.quality}`);
  if (options.blur) transformations.push(`bl-${options.blur}`);

  const transformString = transformations.length > 0 ? `?tr=${transformations.join(',')}` : '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseEndpoint}${cleanPath}${transformString}`;
}
