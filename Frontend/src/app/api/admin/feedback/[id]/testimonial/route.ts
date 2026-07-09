import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/feedback/[id]/testimonial — toggle isTestimonial flag
export const PATCH = apiHandler(
  async (req, { params }) => {
    const { isTestimonial } = await req.json();

    const fb = await prisma.feedback.findUnique({ where: { id: params.id } });
    if (!fb) throw AppError.notFound('Feedback not found');

    const updated = await prisma.feedback.update({
      where: { id: params.id },
      data: { isTestimonial },
    });

    return NextResponse.json({ success: true, data: updated });
  },
  { roles: ['ADMIN'] }
);
