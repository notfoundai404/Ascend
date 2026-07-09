import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// GET /api/students/me/attendance
export const GET = apiHandler(
  async (_req, { user }) => {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw AppError.notFound('Student not found');

    const records = await prisma.attendance.findMany({
      where: { studentId: student.id },
      orderBy: { date: 'desc' },
      include: { event: { select: { title: true, category: true } } },
    });

    const total = records.length;
    const present = records.filter((r: any) => r.isPresent).length;

    return NextResponse.json({
      success: true,
      data: {
        records,
        stats: {
          total,
          present,
          absent: total - present,
          percentage: total > 0 ? Math.round((present / total) * 100) : 0,
        },
      },
    });
  },
  { roles: ['STUDENT'] }
);
