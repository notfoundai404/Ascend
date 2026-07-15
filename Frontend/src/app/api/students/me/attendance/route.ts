import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { parsePagination } from '@/lib/pagination';

// GET /api/students/me/attendance — paginated attendance history
export const GET = apiHandler(
  async (req, { user }) => {
    const url = new URL(req.url);
    const query: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });
    const { page, limit, skip } = parsePagination(query);

    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw AppError.notFound('Student not found');

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where: { studentId: student.id },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        select: { id: true, date: true, isPresent: true, notes: true },
      }),
      prisma.attendance.count({ where: { studentId: student.id } }),
    ]);

    // Compute stats over all records (not just current page)
    const [presentCount, totalCount] = await Promise.all([
      prisma.attendance.count({ where: { studentId: student.id, isPresent: true } }),
      prisma.attendance.count({ where: { studentId: student.id } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        records,
        stats: {
          total: totalCount,
          present: presentCount,
          absent: totalCount - presentCount,
          percentage: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
        },
        pagination: { page, limit, total, hasMore: skip + limit < total },
      },
    });
  },
  { roles: ['STUDENT'] }
);
