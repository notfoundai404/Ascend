import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// GET /api/attendance/today
export const GET = apiHandler(
  async (_req, { user }) => {
    const { searchParams } = new URL(_req.url);
    const dateQuery = searchParams.get('date');
    let today: Date;
    if (dateQuery) {
      const [year, month, day] = dateQuery.split('-');
      today = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    } else {
      // For "today", we need to get current date in local timezone, then convert to UTC midnight
      const now = new Date();
      today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    }
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    if (user.role === 'COACH') {
      const coach = await prisma.coach.findUnique({ where: { userId: user.userId } });
      if (!coach) throw AppError.notFound('Coach not found');

      const students = await prisma.student.findMany({
        where: { primaryCoachId: coach.id },
        select: {
          id: true,
          studentId: true,
          fullName: true,
          attendances: {
            where: { date: { gte: today, lt: tomorrow } },
            select: { isPresent: true, notes: true, id: true },
          },
        },
      });

      const data = students.map((s: any) => ({
        studentId: s.id,
        studentDisplayId: s.studentId,
        fullName: s.fullName,
        attendance: s.attendances[0] ?? null,
        marked: s.attendances.length > 0,
      }));

      return NextResponse.json({ success: true, data });
    }

    // Admin: all students
    const students = await prisma.student.findMany({
      orderBy: { fullName: 'asc' },
      select: {
        id: true,
        studentId: true,
        fullName: true,
        primaryCoachId: true,
        coach: { select: { name: true } },
        attendances: {
          where: { date: { gte: today, lt: tomorrow } },
          select: { isPresent: true, notes: true, id: true },
        },
      },
    });

    const data = students.map((s: any) => ({
      studentId: s.id,
      studentDisplayId: s.studentId,
      fullName: s.fullName,
      coachName: s.coach?.name ?? null,
      attendance: s.attendances[0] ?? null,
      marked: s.attendances.length > 0,
    }));

    return NextResponse.json({ success: true, data });
  },
  { roles: ['ADMIN', 'COACH'] }
);
