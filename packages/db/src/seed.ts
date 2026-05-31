import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LAMAANE DOORE database...');

  // Create demo users
  const demoUsers = [
    {
      supabaseId: 'user_demo_001',
      email: 'emma@demo.velora.com',
      fullName: 'Emma Watson',
      gender: 'FEMALE' as const,
      dateOfBirth: new Date('1998-03-15'),
      city: 'London',
      country: 'United Kingdom',
      city: 'London',
      country: 'United Kingdom',
      religion: 'ISLAM' as const,
      maritalStatus: 'NEVER_MARRIED' as const,
      educationLevel: 'MASTERS' as const,
      career: 'Medical Doctor',
      height: 165,
      relationshipGoal: 'MARRIAGE' as const,
      bio: 'Medical doctor based in London. Love traveling, art history, and good coffee. Looking for a kind-hearted partner who values family.',
      interests: ['Travel', 'Reading', 'Cooking', 'Fitness', 'Spirituality'],
      languages: ['English', 'French'],
      personalityTraits: ['Ambitious', 'Family-oriented', 'Empathetic'],
      lifestylePrefs: ['Health-conscious', 'Career-driven', 'Community-focused'],
      profilePhoto: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
      photos: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800'],
      isVerified: true,
      verificationStatus: 'VERIFIED' as const,
      isProfileComplete: true,
      profileCompletion: 95,
      latitude: 51.5074,
      longitude: -0.1278,
      isOnline: true,
      referralCode: 'AMINA001',
    },
    {
      supabaseId: 'user_demo_002',
      email: 'michael@demo.velora.com',
      fullName: 'Michael Chen',
      gender: 'MALE' as const,
      dateOfBirth: new Date('1995-07-22'),
      city: 'Toronto',
      country: 'Canada',
      city: 'Toronto',
      country: 'Canada',
      religion: 'ISLAM' as const,
      maritalStatus: 'NEVER_MARRIED' as const,
      educationLevel: 'BACHELORS' as const,
      career: 'Software Engineer',
      height: 182,
      relationshipGoal: 'MARRIAGE' as const,
      bio: 'Software engineer in Toronto. I love building things — both in code and in life. Looking for a partner to build a beautiful life with.',
      interests: ['Technology', 'Gaming', 'Travel', 'Business', 'Photography'],
      languages: ['English', 'Mandarin'],
      personalityTraits: ['Introverted', 'Analytical', 'Ambitious'],
      lifestylePrefs: ['Tech-savvy', 'Career-driven', 'Homebody'],
      profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800'],
      isVerified: true,
      verificationStatus: 'VERIFIED' as const,
      isProfileComplete: true,
      profileCompletion: 90,
      latitude: 43.6532,
      longitude: -79.3832,
      isOnline: false,
      referralCode: 'HASSAN001',
    },
    {
      supabaseId: 'user_demo_003',
      email: 'sarah@demo.velora.com',
      fullName: 'Sarah Johnson',
      gender: 'FEMALE' as const,
      dateOfBirth: new Date('2000-01-10'),
      city: 'Minneapolis',
      country: 'United States',
      city: 'New York',
      country: 'United States',
      religion: 'ISLAM' as const,
      maritalStatus: 'NEVER_MARRIED' as const,
      educationLevel: 'BACHELORS' as const,
      career: 'Nurse',
      height: 160,
      relationshipGoal: 'MARRIAGE' as const,
      bio: 'Nurse from New York. Family-oriented, love cooking Italian food, and always up for an adventure.',
      interests: ['Cooking', 'Travel', 'Photography', 'Family', 'Fitness'],
      languages: ['English', 'Spanish'],
      personalityTraits: ['Extroverted', 'Family-oriented', 'Empathetic'],
      lifestylePrefs: ['Community-focused', 'Health-conscious', 'Social butterfly'],
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800'],
      isVerified: false,
      verificationStatus: 'UNVERIFIED' as const,
      isProfileComplete: true,
      profileCompletion: 80,
      latitude: 44.9778,
      longitude: -93.2650,
      isOnline: true,
      referralCode: 'FADUMO001',
    },
  ];

  for (const userData of demoUsers) {
    await prisma.user.upsert({
      where: { supabaseId: userData.supabaseId },
      create: userData,
      update: userData,
    });
  }

  console.log(`✅ Created ${demoUsers.length} demo users`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
