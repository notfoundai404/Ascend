import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// POST /api/attendance/students — Mark attendance for multiple students
export const POST = apiHandler(
  async (req, { user }) => {
    const { date, records } = await req.json();

    if (!date || !records?.length) {
      throw AppError.badRequest('date and records are required');
    }

    const [year, month, day] = date.split('-');
    const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    parsedDate.setHours(0, 0, 0, 0);
    // Coach: verify all students are assigned to them
    if (user.role === 'COACH') {
      const coach = await prisma.coach.findUnique({ where: { userId: user.userId } });
      if (!coach) throw AppError.notFound('Coach not found');

      for (const record of records) {
        const student = await prisma.student.findUnique({ where: { id: record.studentId } });
        if (!student) throw AppError.notFound(`Student ${record.studentId} not found`);
        if (student.primaryCoachId !== coach.id) {
          throw AppError.forbidden('You can only mark attendance for students assigned to you');
        }
      }
    }

    const results = await prisma.$transaction(
      records.map((record: any) =>
        prisma.attendance.upsert({
          where: { date_studentId: { date: parsedDate, studentId: record.studentId } },
          create: {
            date: parsedDate,
            studentId: record.studentId,
            isPresent: record.isPresent,
            notes: record.notes ?? null,
            eventId: record.eventId ?? null,
            markedBy: user.userId,
          },
          update: {
            isPresent: record.isPresent,
            notes: record.notes ?? null,
            markedBy: user.userId,
          },
        })
      )
    );

    return NextResponse.json({ success: true, data: results });
  },
  { roles: ['ADMIN', 'COACH'] }
);
