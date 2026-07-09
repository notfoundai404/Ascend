import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// GET /api/calendar — all events with optional filters
// POST /api/calendar — Admin: create event
export const GET = apiHandler(
  async (req, { user }) => {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || '';
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (from || to) {
      where.eventDate = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { eventDate: 'asc' },
    });

    return NextResponse.json({ success: true, data: events });
  },
  { roles: ['ADMIN', 'COACH', 'STUDENT'] }
);

export const POST = apiHandler(
  async (req, { user }) => {
    const { title, description, category, eventDate } = await req.json();

    if (!title || !category || !eventDate) {
      throw AppError.badRequest('title, category, and eventDate are required');
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description: description ?? null,
        category,
        eventDate: new Date(eventDate),
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  },
  { roles: ['ADMIN'] }
);
