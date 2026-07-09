import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/achievements/[id]/featured — toggle isFeatured flag
export const PATCH = apiHandler(
  async (req, { params }) => {
    const { isFeatured } = await req.json();

    const ach = await prisma.achievement.findUnique({ where: { id: params.id } });
    if (!ach) throw AppError.notFound('Achievement not found');

    const updated = await prisma.achievement.update({
      where: { id: params.id },
      data: { isFeatured },
    });

    return NextResponse.json({ success: true, data: updated });
  },
  { roles: ['ADMIN'] }
);
