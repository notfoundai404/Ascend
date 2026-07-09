import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/students/[id]/coach — assign or remove a coach
export const PATCH = apiHandler(
  async (req, { params }) => {
    const { coachId } = await req.json();

    const student = await prisma.student.findUnique({ where: { id: params.id } });
    if (!student) throw AppError.notFound('Student not found');

    if (coachId) {
      const coach = await prisma.coach.findUnique({ where: { id: coachId } });
      if (!coach) throw AppError.notFound('Coach not found');
    }

    const updated = await prisma.student.update({
      where: { id: params.id },
      data: { primaryCoachId: coachId ?? null },
      include: { coach: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, data: updated });
  },
  { roles: ['ADMIN'] }
);
