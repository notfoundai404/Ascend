import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// GET /api/students/me/feedbacks
// POST /api/students/me/feedbacks
export const GET = apiHandler(
  async (_req, { user }) => {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw AppError.notFound('Student not found');

    const feedbacks = await prisma.feedback.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: feedbacks });
  },
  { roles: ['STUDENT'] }
);

export const POST = apiHandler(
  async (req, { user }) => {
    const { coachName, rating, comments } = await req.json();

    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw AppError.notFound('Student not found');

    const feedback = await prisma.feedback.create({
      data: {
        studentId: student.id,
        studentName: student.fullName,
        coachName: coachName ?? null,
        rating,
        comments,
      },
    });

    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  },
  { roles: ['STUDENT'] }
);
