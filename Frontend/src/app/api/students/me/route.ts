import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// GET /api/students/me — own profile
// PATCH /api/students/me — update personal fields
export const GET = apiHandler(
  async (_req, { user }) => {
    const student = await prisma.student.findUnique({
      where: { userId: user.userId },
      include: {
        coach: { select: { id: true, name: true, specialty: true, phone: true, avatarUrl: true } },
        user: { select: { role: true, createdAt: true } },
      },
    });
    if (!student) throw AppError.notFound('Student profile not found');

    return NextResponse.json({ success: true, data: student });
  },
  { roles: ['STUDENT'] }
);

export const PATCH = apiHandler(
  async (req, { user }) => {
    const data = await req.json();

    // Students can only update personal fields — block fee/admin fields
    const allowed = [
      'dob', 'fatherName', 'motherName', 'fatherPhone', 'motherPhone',
      'fatherEmail', 'motherEmail', 'emergencyPhone', 'address',
      'bloodGroup', 'cricketRole', 'uniformSize', 'batch',
    ];
    const filtered: Record<string, any> = {};
    for (const key of allowed) {
      if (key in data) filtered[key] = data[key];
    }

    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw AppError.notFound('Student profile not found');

    const updated = await prisma.student.update({
      where: { userId: user.userId },
      data: filtered,
      include: { coach: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, data: updated });
  },
  { roles: ['STUDENT'] }
);
