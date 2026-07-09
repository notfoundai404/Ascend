import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// DELETE /api/students/me/achievements/[id]
export const DELETE = apiHandler(
  async (_req, { params, user }) => {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw AppError.notFound('Student not found');

    const achievement = await prisma.achievement.findUnique({ where: { id: params.id } });
    if (!achievement) throw AppError.notFound('Achievement not found');
    if (achievement.studentId !== student.id) {
      throw AppError.forbidden("Cannot delete another student's achievement");
    }

    await prisma.achievement.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  },
  { roles: ['STUDENT'] }
);
