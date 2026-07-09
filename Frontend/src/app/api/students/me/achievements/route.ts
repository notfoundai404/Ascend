import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// GET /api/students/me/achievements
// POST /api/students/me/achievements
export const GET = apiHandler(
  async (_req, { user }) => {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw AppError.notFound('Student not found');

    const achievements = await prisma.achievement.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: achievements });
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
