import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LAMAANE DOORE database...');

  // Create demo users
  const demoUsers = [
    {
      clerkId: 'user_demo_001',
      email: 'amina@demo.lamaane.com',
      fullName: 'Amina Hassan',
      gender: 'FEMALE' as const,
      dateOfBirth: new Date('1998-03-15'),
      city: 'London',
      country: 'United Kingdom',
      tribe: 'Hawiye',
      religion: 'ISLAM' as const,
      maritalStatus: 'NEVER_MARRIED' as const,
      educationLevel: 'MASTERS' as const,
      career: 'Medical Doctor',
      height: 165,
      relationshipGoal: 'MARRIAGE' as const,
      bio: 'Somali doctor based in London. Love traveling, Somali poetry, and good coffee. Looking for a kind-hearted partner who values family.',
      interests: ['Travel', 'Reading', 'Cooking', 'Fitness', 'Islam'],
      languages: ['Somali', 'English', 'Arabic'],
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
      clerkId: 'user_demo_002',
      email: 'hassan@demo.lamaane.com',
      fullName: 'Hassan Abdi',
      gender: 'MALE' as const,
      dateOfBirth: new Date('1995-07-22'),
      city: 'Toronto',
      country: 'Canada',
      tribe: 'Darod',
      religion: 'ISLAM' as const,
      maritalStatus: 'NEVER_MARRIED' as const,
      educationLevel: 'BACHELORS' as const,
      career: 'Software Engineer',
      height: 182,
      relationshipGoal: 'MARRIAGE' as const,
      bio: 'Software engineer in Toronto. I love building things — both in code and in life. Looking for a partner to build a beautiful life with.',
      interests: ['Technology', 'Gaming', 'Travel', 'Business', 'Somali Culture'],
      languages: ['Somali', 'English'],
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
      clerkId: 'user_demo_003',
      email: 'fadumo@demo.lamaane.com',
      fullName: 'Fadumo Ali',
      gender: 'FEMALE' as const,
      dateOfBirth: new Date('2000-01-10'),
      city: 'Minneapolis',
      country: 'United States',
      tribe: 'Isaaq',
      religion: 'ISLAM' as const,
      maritalStatus: 'NEVER_MARRIED' as const,
      educationLevel: 'BACHELORS' as const,
      career: 'Nurse',
      height: 160,
      relationshipGoal: 'MARRIAGE' as const,
      bio: 'Somali-American nurse from Minneapolis. Family-oriented, love cooking Somali food, and always up for an adventure.',
      interests: ['Cooking', 'Travel', 'Islam', 'Family', 'Fitness'],
      languages: ['Somali', 'English', 'Arabic'],
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
      where: { clerkId: userData.clerkId },
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
