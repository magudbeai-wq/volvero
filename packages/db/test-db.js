const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Supabase connection...');
    const userCount = await prisma.user.count();
    console.log(`✅ Supabase is CONNECTED! Found ${userCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Supabase connection FAILED:', error.message);
    process.exit(1);
  }
}

main();
