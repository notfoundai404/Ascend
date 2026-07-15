import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { parsePagination } from '@/lib/pagination';
import { uploadToStorage } from '@/lib/storage';

// GET /api/notices — public list (ALL visibility) or full list for ADMIN
// POST /api/notices — Admin: create notice (supports multipart/form-data with image)
export const GET = apiHandler(
  async (req, { user }) => {
    const url = new URL(req.url);
    const query: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });

    const { page, limit, skip } = parsePagination(query);
    const category = String(query.category || '');
    const categoryFilter = category ? { category } : {};

    // Admins see all notices; everyone else (including guests) sees only public ones
    const where: Record<string, unknown> =
      user?.role === 'ADMIN'
        ? { ...categoryFilter }
        : { ...categoryFilter, visibility: 'ALL' };

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
  { optionalAuth: true }
);

export const POST = apiHandler(
  async (req, { user }) => {
    const contentType = req.headers.get('content-type') || '';
    let title: string, content: string, category: string, visibility: string;
    let targetStudentIds: string[] | undefined;
    let targetCoachIds: string[] | undefined;
    let imageUrl: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      // FormData path — image file included
      const formData = await req.formData();
      title = formData.get('title') as string;
      content = formData.get('content') as string;
      category = formData.get('category') as string;
      visibility = formData.get('visibility') as string;
      const raw = formData.get('targetStudentIds') as string | null;
      targetStudentIds = raw ? JSON.parse(raw) : undefined;
      const rawCoach = formData.get('targetCoachIds') as string | null;
      targetCoachIds = rawCoach ? JSON.parse(rawCoach) : undefined;

      const imageFile = formData.get('image') as File | null;
      if (imageFile && imageFile.size > 0) {
        imageUrl = await uploadToStorage(imageFile, 'erp-media', 'notices');
      }
    } else {
      // JSON path — no image or already a URL string
      const body = await req.json();
      ({ title, content, category, visibility, targetStudentIds, targetCoachIds } = body);
      imageUrl = body.imageUrl ?? null;
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        category,
        visibility,
        imageUrl,
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
