import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET /api/admin/students/[id] — full student detail with all relations
export const GET = apiHandler(
  async (_req, { params }) => {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        coach: true,
        transactions: { orderBy: { createdAt: 'desc' } },
        attendances: { orderBy: { date: 'desc' }, take: 30 },
        reviews: { orderBy: { createdAt: 'desc' } },
        feedbacks: { orderBy: { createdAt: 'desc' } },
        achievements: { orderBy: { createdAt: 'desc' } },
        user: { select: { role: true, createdAt: true } },
      },
    });

    if (!student) throw AppError.notFound('Student not found');

    return NextResponse.json({ success: true, data: student });
  },
  { roles: ['ADMIN'] }
);

// DELETE /api/admin/students/[id] — remove student + auth user
export const DELETE = apiHandler(
  async (_req, { params }) => {
    // Find the user record to get supabaseId
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: { user: { select: { id: true, supabaseId: true } } },
    });

    if (!student) throw AppError.notFound('Student not found');

    // Delete Prisma user (cascade deletes student + all related records)
    await prisma.user.delete({ where: { id: student.user.id } });

    // Delete from Supabase auth so the email can be reused
    if (student.user.supabaseId) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(student.user.supabaseId);
      if (error) {
        console.error('[students/[id] DELETE] Supabase auth delete failed:', error.message);
        // Non-fatal — Prisma record is already gone
      }
    }

    return NextResponse.json({ success: true });
  },
  { roles: ['ADMIN'] }
);
