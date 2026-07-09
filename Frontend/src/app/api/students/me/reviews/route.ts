import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// GET /api/students/me/reviews
// POST /api/students/me/reviews — coach submits review for a student
export const GET = apiHandler(
  async (_req, { user }) => {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw AppError.notFound('Student not found');

    const reviews = await prisma.studentReview.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: reviews });
  },
  { roles: ['STUDENT'] }
);

export const POST = apiHandler(
  async (req, { user }) => {
    const body = await req.json();
    const { studentId, coachName, battingRating, bowlingRating, fitnessRating, reviewText } = body;

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw AppError.notFound('Student not found');

    if (user.role === 'COACH') {
      if (student.primaryCoachId !== user.coachId) {
        throw AppError.forbidden('You can only review students assigned to you');
      }
    }

    const review = await prisma.studentReview.create({
      data: {
        studentId: student.id,
        coachName,
        battingRating,
        bowlingRating,
        fitnessRating,
        reviewText: reviewText ?? null,
      },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  },
  { roles: ['COACH', 'ADMIN'] }
);
