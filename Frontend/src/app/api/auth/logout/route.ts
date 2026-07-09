import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { prisma } from '@/lib/prisma';

export const POST = apiHandler(
  async (_req, { user }) => {
    await prisma.user.update({
      where: { id: user.userId },
      data: { refreshToken: null },
    });
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  },
  { roles: ['ADMIN', 'COACH', 'STUDENT'] }
);
