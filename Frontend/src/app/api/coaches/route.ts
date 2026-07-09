import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { prisma } from '@/lib/prisma';

// GET /api/coaches — public coaches list (all authenticated roles)
export const GET = apiHandler(
  async (_req, { user }) => {
    const coaches = await prisma.coach.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        specialty: true,
        experience: true,
        rating: true,
        avatarUrl: true,
        _count: { select: { students: true } },
      },
    });

    return NextResponse.json({ success: true, data: coaches });
  },
  { roles: ['ADMIN', 'COACH', 'STUDENT'] }
);
