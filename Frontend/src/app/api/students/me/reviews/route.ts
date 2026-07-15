import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { parsePagination } from '@/lib/pagination';

// GET /api/students/me/reviews — paginated
// POST /api/students/me/reviews — coach submits review for a student
export const GET = apiHandler(
  async (req, { user }) => {
    const url = new URL(req.url);
    const query: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });
    const { page, limit, skip } = parsePagination(query);

    // user.studentId is already resolved by apiHelper — no extra DB lookup needed
    const studentId = user.studentId;
    if (!studentId) throw AppError.notFound('Student profile not found');

    const [reviews, total] = await Promise.all([
      prisma.studentReview.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.studentReview.count({ where: { studentId } }),
    ]);

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: { page, limit, total, hasMore: skip + limit < total },
    });
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
