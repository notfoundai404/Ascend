import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { parsePagination } from '@/lib/pagination';

// GET /api/admin/coaches — paginated coach list
// POST /api/admin/coaches — invite coach via Supabase + create Prisma profile
export const GET = apiHandler(
  async (req, { user }) => {
    const url = new URL(req.url);
    const query: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });

    const { page, limit, skip } = parsePagination(query);
    const search = String(query.search || '');

    const where = search
      ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
      : {};

    const [coaches, total] = await Promise.all([
      prisma.coach.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { students: true } },
          user: { select: { createdAt: true } },
        },
      }),
      prisma.coach.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { coaches, page, limit, total } });
  },
  { roles: ['ADMIN'] }
);

export const POST = apiHandler(
  async (req, { user }) => {
    const { name, email, phone, specialty, experience } = await req.json();

    if (!name || !email) {
      throw AppError.badRequest('name and email are required');
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) throw AppError.conflict('A user with this email already exists');

    // 1. Invite coach via Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email.toLowerCase(),
      {
        data: { role: 'COACH', fullName: name },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
      }
    );

    if (authError || !authData?.user) {
      throw AppError.internal(`Failed to invite coach: ${authError?.message ?? 'Unknown error'}`);
    }

    // 2. Create Prisma profile linked by supabaseId
    const userRecord = await prisma.user.create({
      data: {
        supabaseId: authData.user.id,
        email: email.toLowerCase(),
        role: 'COACH',
        coach: {
          create: {
            name,
            email: email.toLowerCase(),
            phone: phone ?? null,
            specialty: specialty ?? null,
            experience: experience ?? null,
          },
        },
      },
      include: { coach: true },
    });

    return NextResponse.json(
      { success: true, data: { coach: userRecord.coach } },
      { status: 201 }
    );
  },
  { roles: ['ADMIN'] }
);
