import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// DELETE /api/notices/[id] — Admin or Coach: remove a notice permanently
export const DELETE = apiHandler(
  async (_req, { user, params }) => {
    const { id } = params as { id: string };

    const notice = await prisma.notice.findUnique({ where: { id } });
    if (!notice) {
      throw new AppError('Notice not found.', 404);
    }

    await prisma.notice.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  },
  { roles: ['ADMIN', 'COACH'] }
);
