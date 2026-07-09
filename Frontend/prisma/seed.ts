/**
 * Seed script — creates test Admin, Coach, and Student accounts.
 * Run with: npx ts-node --project tsconfig.json -e "require('./prisma/seed.ts')"
 * Or add to package.json prisma.seed and run: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── ADMIN ──────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ascendcricket.in' },
    update: {},
    create: {
      email: 'admin@ascendcricket.in',
      passwordHash: adminHash,
      role: 'ADMIN',
      isFirstLogin: false,
      admin: {
        create: {
          name: 'Academy Admin',
          email: 'admin@ascendcricket.in',
        },
      },
    },
  });
  console.log('✅ Admin created:', adminUser.email);

  // ── COACH ──────────────────────────────────────────────
  const coachHash = await bcrypt.hash('Coach@1234', 12);
  const coachUser = await prisma.user.upsert({
    where: { email: 'coach.ravi@ascendcricket.in' },
    update: {},
    create: {
      email: 'coach.ravi@ascendcricket.in',
      passwordHash: coachHash,
      role: 'COACH',
      isFirstLogin: false,
      coach: {
        create: {
          name: 'Ravi Kumar',
          email: 'coach.ravi@ascendcricket.in',
          phone: '9876543210',
          specialty: 'Batting',
          experience: '10 years',
          rating: 4.5,
        },
      },
    },
    include: { coach: true },
  });
  console.log('✅ Coach created:', coachUser.email);

  // ── STUDENT ────────────────────────────────────────────
  // Ensure IdCounter exists
  await prisma.idCounter.upsert({
    where: { id: 'student_counter' },
    update: {},
    create: { id: 'student_counter', current: 0 },
  });

  const counter = await prisma.idCounter.update({
    where: { id: 'student_counter' },
    data: { current: { increment: 1 } },
  });
  const studentId = `ASC-${String(counter.current).padStart(3, '0')}`;

  const studentHash = await bcrypt.hash('Student@1234', 12);
  const studentUser = await prisma.user.upsert({
    where: { email: 'neil.emmanuel@ascendcricket.in' },
    update: {},
    create: {
      email: 'neil.emmanuel@ascendcricket.in',
      passwordHash: studentHash,
      role: 'STUDENT',
      isFirstLogin: false,
      student: {
        create: {
          studentId,
          fullName: 'Neil Emmanuel',
          email: 'neil.emmanuel@ascendcricket.in',
          phone: '9123456789',
          batch: 'Batch A',
          cricketRole: 'Batsman',
          joiningDate: '2024-01-01',
          totalFees: 30000,
          uniformFees: 2500,
          installmentsLimit: 3,
          primaryCoachId: coachUser.coach?.id ?? null,
        },
      },
    },
  });
  console.log('✅ Student created:', studentUser.email, `(${studentId})`);

  console.log('\n🎉 Seed complete!\n');
  console.log('─────────────────────────────────────────');
  console.log('  ROLE     EMAIL                          PASSWORD');
  console.log('  Admin    admin@ascendcricket.in         Admin@1234');
  console.log('  Student  neil.emmanuel@ascendcricket.in Student@1234');
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
