import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// PATCH /api/payments/[id]/reject
export const PATCH = apiHandler(
  async (_req, { params, user }) => {
    const tx = await prisma.transaction.findUnique({ where: { id: params.id } });
    if (!tx) throw AppError.notFound('Transaction not found');
    if (tx.status !== 'Pending') {
      throw AppError.badRequest(`Transaction is already ${tx.status}`);
    }

    const updated = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        status: 'Rejected',
        verifiedBy: user.userId,
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  },
  { roles: ['ADMIN'] }
);
