import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { parsePagination } from '@/lib/pagination';

// GET /api/students/me/achievements — paginated
// POST /api/students/me/achievements
export const GET = apiHandler(
  async (req, { user }) => {
    const url = new URL(req.url);
    const query: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });
    const { page, limit, skip } = parsePagination(query);

    // user.studentId is already resolved by apiHelper — no extra DB lookup needed
    const studentId = user.studentId;
    if (!studentId) throw AppError.notFound('Student profile not found');

    const [achievements, total] = await Promise.all([
      prisma.achievement.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.achievement.count({ where: { studentId } }),
    ]);

    return NextResponse.json({
      success: true,
      data: achievements,
      pagination: { page, limit, total, hasMore: skip + limit < total },
    });
  },
  { roles: ['STUDENT'] }
);

export const POST = apiHandler(
  async (req, { user }) => {
    // Accepts JSON body (imageUrl as string URL if provided)
    const body = await req.json();
    const { title, description, date, imageUrl } = body;

    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw AppError.notFound('Student not found');

    const achievement = await prisma.achievement.create({
      data: {
        studentId: student.id,
        title,
        description: description ?? null,
        imageUrl: imageUrl ?? null,
        date: date ? new Date(date) : null,
      },
    });

    return NextResponse.json({ success: true, data: achievement }, { status: 201 });
  },
  { roles: ['STUDENT'] }
);
