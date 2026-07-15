import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { parsePagination } from '@/lib/pagination';
import { generateStudentId } from '@/lib/studentId';

// GET /api/admin/students — paginated, searchable student list
// POST /api/admin/students — create student via Supabase invite email (no SMTP needed)
export const GET = apiHandler(
  async (req, { user }) => {
    const url = new URL(req.url);
    const query: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });

    const { page, limit, skip } = parsePagination(query);
    const search = String(query.search || '');
    const coachFilter = String(query.coachId || '');
    const batchFilter = String(query.batch || '');

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { studentId: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (coachFilter) where.primaryCoachId = coachFilter;
    if (batchFilter) where.batch = batchFilter;

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          coach: { select: { id: true, name: true, specialty: true } },
          user: { select: { createdAt: true } },
          _count: { select: { transactions: true, attendances: true } },
        },
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { students, page, limit, total } });
  },
  { roles: ['ADMIN'] }
);

export const POST = apiHandler(
  async (req, { user }) => {
    const { fullName, email, phone, primaryCoachId, batch, totalFees, uniformFees, installmentsLimit } =
      await req.json();

    if (!fullName || !email || !phone) {
      throw AppError.badRequest('fullName, email, and phone are required');
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) throw AppError.conflict('A user with this email already exists');

    if (primaryCoachId) {
      const coach = await prisma.coach.findUnique({ where: { id: primaryCoachId } });
      if (!coach) throw AppError.notFound('Coach not found');
    }

    // 1. Invite the user via Supabase Auth — Supabase sends the invite email automatically
    const { inviteUserByEmail } = await import('@/lib/email');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    let authUserId: string;
    try {
      const invited = await inviteUserByEmail(email.toLowerCase(), {
        data: { role: 'STUDENT', fullName },
        // redirectTo must be whitelisted in Supabase Dashboard → Auth → URL Configuration → Redirect URLs
        redirectTo: `${appUrl}/auth/confirm`,
      });
      authUserId = invited.userId;
      console.log(`[students/route] Invite email sent to: ${email.toLowerCase()}`);
    } catch (inviteErr) {
      console.error('[students/route] Supabase inviteUserByEmail error:', inviteErr);
      throw AppError.internal(
        `Failed to invite user: ${inviteErr instanceof Error ? inviteErr.message : String(inviteErr)}`
      );
    }

    const studentId = await generateStudentId();

    // 2. Create Prisma profile linked by supabaseId
    const userRecord = await prisma.user.create({
      data: {
        supabaseId: authUserId,
        email: email.toLowerCase(),
        role: 'STUDENT',
        student: {
          create: {
            studentId,
            fullName,
            email: email.toLowerCase(),
            phone,
            primaryCoachId: primaryCoachId ?? null,
            batch: batch ?? null,
            totalFees: totalFees ?? 0,
            uniformFees: uniformFees ?? 0,
            installmentsLimit: installmentsLimit ?? 3,
            joiningDate: new Date().toISOString().split('T')[0],
          },
        },
      },
      include: { student: true },
    });

    return NextResponse.json(
      { success: true, data: { student: userRecord.student } },
      { status: 201 }
    );
  },
  { roles: ['ADMIN'] }
);
