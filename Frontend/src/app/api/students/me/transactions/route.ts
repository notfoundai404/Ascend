import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { parsePagination } from '@/lib/pagination';

// GET /api/students/me/transactions — paginated
export const GET = apiHandler(
  async (req, { user }) => {
    const url = new URL(req.url);
    const query: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });
    const { page, limit, skip } = parsePagination(query);

    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw AppError.notFound('Student not found');

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { studentId: student.id } }),
    ]);

    // Compute fee totals over ALL transactions (not just current page)
    const allTx = await prisma.transaction.findMany({
      where: { studentId: student.id },
      select: { amount: true, type: true, status: true },
    });
    const academyPaid = allTx
      .filter((t) => t.status === 'Approved' && t.type === 'academy_fees')
      .reduce((s, t) => s + t.amount, 0);
    const uniformPaid = allTx
      .filter((t) => t.status === 'Approved' && t.type === 'uniform_fees')
      .reduce((s, t) => s + t.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        summary: {
          totalFees: student.totalFees,
          uniformFees: student.uniformFees,
          academyPaid,
          uniformPaid,
          totalPaid: academyPaid + uniformPaid,
          remainingAcademy: student.totalFees - academyPaid,
          remainingUniform: student.uniformFees - uniformPaid,
          totalRemaining: student.totalFees + student.uniformFees - academyPaid - uniformPaid,
        },
        pagination: { page, limit, total, hasMore: skip + limit < total },
      },
    });
  },
  { roles: ['STUDENT'] }
);
