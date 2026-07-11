/**
 * Seed script — creates the initial Admin Prisma profile.
 *
 * IMPORTANT: The Supabase Auth user must exist FIRST.
 * 1. Go to Supabase Dashboard → Authentication → Users → Add user
 * 2. Create user with the admin email & a strong password
 * 3. Copy the UUID from the user list
 * 4. Set SEED_ADMIN_SUPABASE_ID and SEED_ADMIN_EMAIL in .env
 * 5. Run: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}\nAdd it to your .env file.`);
  }
  return value;
}

async function main() {
  console.log('🌱 Seeding database...\n');

  const adminSupabaseId = requireEnv('SEED_ADMIN_SUPABASE_ID');
  const adminEmail      = requireEnv('SEED_ADMIN_EMAIL');
  const adminName       = process.env['SEED_ADMIN_NAME'] ?? 'Academy Admin';

  // Ensure ID counter exists
  await prisma.idCounter.upsert({
    where: { id: 'student_counter' },
    update: {},
    create: { id: 'student_counter', current: 0 },
  });

  // Create/update admin Prisma profile linked to Supabase Auth user
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { supabaseId: adminSupabaseId },
    create: {
      supabaseId: adminSupabaseId,
      email: adminEmail,
      role: 'ADMIN',
      admin: {
        create: {
          name: adminName,
          email: adminEmail,
        },
      },
    },
  });

  console.log('✅ Admin profile created:', adminUser.email);
  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('  Admin profile linked to Supabase user:', adminSupabaseId);
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
