import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// GET /api/admin/students/[id] — full student detail with all relations
export const GET = apiHandler(
  async (_req, { params }) => {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        coach: true,
        transactions: { orderBy: { createdAt: 'desc' } },
        attendances: { orderBy: { date: 'desc' }, take: 30 },
        reviews: { orderBy: { createdAt: 'desc' } },
        feedbacks: { orderBy: { createdAt: 'desc' } },
        achievements: { orderBy: { createdAt: 'desc' } },
        user: { select: { role: true, createdAt: true } },
      },
    });

    if (!student) throw AppError.notFound('Student not found');

    return NextResponse.json({ success: true, data: student });
  },
  { roles: ['ADMIN'] }
);
