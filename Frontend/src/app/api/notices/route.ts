import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { parsePagination } from '@/lib/pagination';

// GET /api/notices — role-filtered notice list
// POST /api/notices — Admin: create notice
export const GET = apiHandler(
  async (req, { user }) => {
    const url = new URL(req.url);
    const query: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });

    const { page, limit, skip } = parsePagination(query);
    const category = String(query.category || '');
    const categoryFilter = category ? { category } : {};

    let where: Record<string, unknown> = {};

    if (user.role === 'ADMIN') {
      where = { ...categoryFilter };
    } else if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: user.userId } });
      if (!student) throw AppError.notFound('Student not found');
      where = {
        ...categoryFilter,
        OR: [
          { visibility: 'ALL' },
          { visibility: 'SELECTED_STUDENTS', noticeStudents: { some: { studentId: student.id } } },
        ],
      };
    } else if (user.role === 'COACH') {
      const coach = await prisma.coach.findUnique({ where: { userId: user.userId } });
      if (!coach) throw AppError.notFound('Coach not found');
      where = {
        ...categoryFilter,
        OR: [
          { visibility: 'ALL' },
          { visibility: 'SELECTED_COACHES', noticeCoaches: { some: { coachId: coach.id } } },
        ],
      };
    }

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          noticeStudents: { include: { student: { select: { id: true, fullName: true } } } },
          noticeCoaches: { include: { coach: { select: { id: true, name: true } } } },
        },
      }),
      prisma.notice.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { notices, page, limit, total } });
  },
  { roles: ['ADMIN', 'COACH', 'STUDENT'] }
);

export const POST = apiHandler(
  async (req, { user }) => {
    const { title, content, category, visibility, targetStudentIds, targetCoachIds } = await req.json();

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        category,
        visibility,
        createdBy: user.userId,
        ...(visibility === 'SELECTED_STUDENTS' && targetStudentIds?.length
          ? { noticeStudents: { create: targetStudentIds.map((sid: string) => ({ studentId: sid })) } }
          : {}),
        ...(visibility === 'SELECTED_COACHES' && targetCoachIds?.length
          ? { noticeCoaches: { create: targetCoachIds.map((cid: string) => ({ coachId: cid })) } }
          : {}),
      },
      include: {
        noticeStudents: { include: { student: { select: { id: true, fullName: true } } } },
        noticeCoaches: { include: { coach: { select: { id: true, name: true } } } },
      },
    });

    return NextResponse.json({ success: true, data: notice }, { status: 201 });
  },
  { roles: ['ADMIN'] }
);
