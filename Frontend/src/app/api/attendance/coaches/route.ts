import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// POST /api/attendance/coaches — Admin marks coach attendance
export const POST = apiHandler(
  async (req, { user }) => {
    const { date, coachId, isPresent, notes } = await req.json();

    if (!date || !coachId || isPresent === undefined) {
      throw AppError.badRequest('date, coachId, and isPresent are required');
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    const coach = await prisma.coach.findUnique({ where: { id: coachId } });
    if (!coach) throw AppError.notFound('Coach not found');

    const record = await prisma.coachAttendance.upsert({
      where: { date_coachId: { date: parsedDate, coachId } },
      create: {
        date: parsedDate,
        coachId,
        isPresent,
        notes: notes ?? null,
        markedBy: user.userId,
      },
      update: {
        isPresent,
        notes: notes ?? null,
        markedBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: record });
  },
  { roles: ['ADMIN'] }
);
