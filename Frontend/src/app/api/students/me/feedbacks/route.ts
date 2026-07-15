import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { parsePagination } from '@/lib/pagination';

// GET /api/students/me/feedbacks — paginated
// POST /api/students/me/feedbacks
export const GET = apiHandler(
  async (req, { user }) => {
    const url = new URL(req.url);
    const query: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });
    const { page, limit, skip } = parsePagination(query);

    // user.studentId is already resolved by apiHelper — no extra DB lookup needed
    const studentId = user.studentId;
    if (!studentId) throw AppError.notFound('Student profile not found');

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.feedback.count({ where: { studentId } }),
    ]);

    return NextResponse.json({
      success: true,
      data: feedbacks,
      pagination: { page, limit, total, hasMore: skip + limit < total },
    });
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
        coachName: coachName || null,
        rating,
        comments,
      },
    });

    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  },
  { roles: ['STUDENT'] }
);
