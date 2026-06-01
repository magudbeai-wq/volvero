import { logger } from '../utils/logger.js';

const isUnsplashConfigured =
  process.env.UNSPLASH_ACCESS_KEY &&
  process.env.UNSPLASH_ACCESS_KEY !== 'YOUR_UNSPLASH_ACCESS_KEY';

if (isUnsplashConfigured) {
  logger.info('📸 Unsplash Photo Service active and connected.');
} else {
  logger.info('💡 Unsplash API key not provided. Utilizing premium curated offline stock portraits.');
}

// Ultra-premium curated high-resolution portraits from Unsplash
// Structured specifically for Somali, East African, and diverse premium dating matching
const PREMIUM_PORTRAITS = {
  FEMALE: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=800',
  ],
  MALE: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1504257400765-1888b26f247f?auto=format&fit=crop&q=80&w=800',
  ],
  BACKGROUND: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1080',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=1200',
  ]
};

export interface UnsplashPhoto {
  id: string;
  url: string;
  creator: string;
  creatorLink: string;
  description?: string;
}

/**
 * Dynamically queries the Unsplash API for themed high-quality images.
 * Gracefully falls back to premium, pre-vetted local asset links on empty/error/limit.
 */
export async function getDatingProfilePhoto(
  gender: 'MALE' | 'FEMALE' | 'ALL',
  queryKeyword?: string
): Promise<UnsplashPhoto> {
  const genderKey = gender === 'ALL' ? (Math.random() > 0.5 ? 'MALE' : 'FEMALE') : gender;
  const localList = PREMIUM_PORTRAITS[genderKey];
  const fallbackUrl = localList[Math.floor(Math.random() * localList.length)];

  if (!isUnsplashConfigured) {
    return {
      id: `local_fallback_${genderKey.toLowerCase()}_${Math.floor(Math.random() * 1000)}`,
      url: fallbackUrl,
      creator: 'Unsplash Premium contributor',
      creatorLink: 'https://unsplash.com',
      description: 'Stunning premium portrait'
    };
  }

  const keyword = queryKeyword || (genderKey === 'FEMALE' ? 'beautiful woman portrait' : 'handsome man portrait');
  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&orientation=squarish&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Unsplash returned HTTP status ${res.status}`);
    }
    const data = await res.json() as any;
    return {
      id: data.id,
      url: data.urls.regular,
      creator: data.user.name,
      creatorLink: data.user.links.html,
      description: data.description || data.alt_description
    };
  } catch (error) {
    logger.warn({ error }, 'Unsplash API call failed. Reverting safely to premium local portraits.');
    return {
      id: `local_fallback_${genderKey.toLowerCase()}_${Math.floor(Math.random() * 1000)}`,
      url: fallbackUrl,
      creator: 'Unsplash Contributor',
      creatorLink: 'https://unsplash.com',
    };
  }
}

/**
 * Retrieves a beautiful background banner or blog header image.
 */
export async function getBackgroundOrBanner(query: string = 'abstract dark purple'): Promise<UnsplashPhoto> {
  const fallbackList = PREMIUM_PORTRAITS.BACKGROUND;
  const fallbackUrl = fallbackList[Math.floor(Math.random() * fallbackList.length)];

  if (!isUnsplashConfigured) {
    return {
      id: `local_bg_${Math.floor(Math.random() * 1000)}`,
      url: fallbackUrl,
      creator: 'Unsplash Contributor',
      creatorLink: 'https://unsplash.com',
    };
  }

  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${process.env.UNSPLASH_ACCESS_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Unsplash HTTP ${res.status}`);
    const data = await res.json() as any;
    return {
      id: data.id,
      url: data.urls.regular,
      creator: data.user.name,
      creatorLink: data.user.links.html,
      description: data.description || data.alt_description
    };
  } catch (error) {
    return {
      id: `local_bg_${Math.floor(Math.random() * 1000)}`,
      url: fallbackUrl,
      creator: 'Unsplash Contributor',
      creatorLink: 'https://unsplash.com',
    };
  }
}
