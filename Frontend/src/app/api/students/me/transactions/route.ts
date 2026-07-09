import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// GET /api/students/me/transactions
export const GET = apiHandler(
  async (_req, { user }) => {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw AppError.notFound('Student not found');

    const transactions = await prisma.transaction.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });

    const academyPaid = transactions
      .filter((t: any) => t.status === 'Approved' && t.type === 'academy_fees')
      .reduce((s: number, t: any) => s + t.amount, 0);
    const uniformPaid = transactions
      .filter((t: any) => t.status === 'Approved' && t.type === 'uniform_fees')
      .reduce((s: number, t: any) => s + t.amount, 0);

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
      },
    });
  },
  { roles: ['STUDENT'] }
);
