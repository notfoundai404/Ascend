import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// PATCH /api/payments/[id]/approve
export const PATCH = apiHandler(
  async (_req, { params, user }) => {
    const tx = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { student: true },
    });
    if (!tx) throw AppError.notFound('Transaction not found');
    if (tx.status !== 'Pending') {
      throw AppError.badRequest(`Transaction is already ${tx.status}`);
    }

    const student = tx.student;
    const newAmountPaid = student.amountPaidTillDate + tx.amount;
    const totalCharged = student.totalFees + student.uniformFees;
    const remaining = Math.max(0, totalCharged - newAmountPaid);

    const [updatedTx] = await prisma.$transaction([
      prisma.transaction.update({
        where: { id: params.id },
        data: {
          status: 'Approved',
          verifiedBy: user.userId,
          verifiedAt: new Date(),
          amountPaidTillDate: newAmountPaid,
          remainingAmount: remaining,
        },
      }),
      prisma.student.update({
        where: { id: student.id },
        data: { amountPaidTillDate: newAmountPaid },
      }),
    ]);

    return NextResponse.json({ success: true, data: updatedTx });
  },
  { roles: ['ADMIN'] }
);
