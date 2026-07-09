import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// GET /api/coaches/me — own coach profile
// PATCH /api/coaches/me — update own profile
export const GET = apiHandler(
  async (_req, { user }) => {
    const coach = await prisma.coach.findUnique({
      where: { userId: user.userId },
      include: {
        _count: { select: { students: true } },
        user: { select: { isFirstLogin: true, createdAt: true } },
      },
    });
    if (!coach) throw AppError.notFound('Coach profile not found');

    return NextResponse.json({ success: true, data: coach });
  },
  { roles: ['COACH'] }
);

export const PATCH = apiHandler(
  async (req, { user }) => {
    const data = await req.json();

    const coach = await prisma.coach.findUnique({ where: { userId: user.userId } });
    if (!coach) throw AppError.notFound('Coach not found');

    const allowed = ['name', 'phone', 'specialty', 'experience', 'rating', 'avatarUrl'];
    const filtered: Record<string, any> = {};
    for (const key of allowed) {
      if (key in data) filtered[key] = data[key];
    }

    const updated = await prisma.coach.update({
      where: { userId: user.userId },
      data: filtered,
    });

    return NextResponse.json({ success: true, data: updated });
  },
  { roles: ['COACH'] }
);
