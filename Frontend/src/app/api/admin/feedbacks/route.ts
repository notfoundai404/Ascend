import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { prisma } from '@/lib/prisma';

// GET /api/admin/feedbacks — all student feedbacks
export const GET = apiHandler(
  async (_req, { user }) => {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { fullName: true, studentId: true } },
      },
    });

    return NextResponse.json({ success: true, data: feedbacks });
  },
  { roles: ['ADMIN'] }
);
