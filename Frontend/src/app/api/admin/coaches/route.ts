import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { parsePagination } from '@/lib/pagination';
import { generateTempPassword } from '@/lib/password';
import { activationEmailTemplate } from '@/lib/emailTemplates';
import { sendEmail } from '@/lib/email';

// GET /api/admin/coaches — paginated coach list
// POST /api/admin/coaches — create coach with temp password + activation email
export const GET = apiHandler(
  async (req, { user }) => {
    const url = new URL(req.url);
    const query: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });

    const { page, limit, skip } = parsePagination(query);
    const search = String(query.search || '');

    const where = search
      ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
      : {};

    const [coaches, total] = await Promise.all([
      prisma.coach.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { students: true } },
          user: { select: { isFirstLogin: true, createdAt: true } },
        },
      }),
      prisma.coach.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { coaches, page, limit, total } });
  },
  { roles: ['ADMIN'] }
);

export const POST = apiHandler(
  async (req, { user }) => {
    const { name, email, phone } = await req.json();

    if (!name || !email) {
      throw AppError.badRequest('name and email are required');
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) throw AppError.conflict('A user with this email already exists');

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const userRecord = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'COACH',
        isFirstLogin: true,
        coach: {
          create: {
            name,
            email: email.toLowerCase(),
            phone: phone ?? null,
          },
        },
      },
      include: { coach: true },
    });

    const loginUrl = process.env.LOGIN_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;
    const { subject, html, text } = activationEmailTemplate({
      recipientName: name,
      email: email.toLowerCase(),
      tempPassword,
      role: 'Coach',
      loginUrl,
    });

    await sendEmail({ to: email, subject, html, text });

    return NextResponse.json(
      { success: true, data: { coach: userRecord.coach, tempPassword } },
      { status: 201 }
    );
  },
  { roles: ['ADMIN'] }
);
