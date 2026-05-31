import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAge(dateOfBirth: string | Date): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function formatDistance(km: number): string {
  if (km < 1) return 'Less than 1 km away';
  if (km < 100) return `${Math.round(km)} km away`;
  return `${Math.round(km / 10) * 10} km away`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export const INTERESTS = [
  'Travel', 'Cooking', 'Sports', 'Reading', 'Music', 'Art', 'Photography',
  'Technology', 'Fashion', 'Fitness', 'Gaming', 'Movies', 'Nature',
  'Volunteering', 'Business', 'Politics', 'Spirituality', 'Languages',
  'Dancing', 'Writing', 'Podcasts', 'DIY', 'Gardening', 'Pets',
  'Family', 'Entrepreneurship', 'Education',
];

export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian',
  'Portuguese', 'Mandarin', 'Japanese', 'Korean', 'Hindi',
  'Russian', 'Dutch', 'Swedish', 'Turkish'
];

export const PERSONALITY_TRAITS = [
  'Introverted', 'Extroverted', 'Ambivert', 'Adventurous', 'Homebody',
  'Creative', 'Analytical', 'Empathetic', 'Humorous', 'Serious',
  'Romantic', 'Independent', 'Family-oriented', 'Career-focused',
  'Spiritual', 'Laid-back', 'Ambitious', 'Spontaneous', 'Organised',
];

export const LIFESTYLE_PREFS = [
  'Early bird', 'Night owl', 'Gym lifestyle', 'Foodie', 'Social butterfly',
  'Homebody', 'Traveller', 'Minimalist', 'Tech-savvy', 'Outdoorsy',
  'Health-conscious', 'Career-driven', 'Arts & culture', 'Community-focused',
];
