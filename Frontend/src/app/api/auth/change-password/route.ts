import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

export const POST = apiHandler(
  async (req, { user }) => {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      throw AppError.badRequest('Current password and new password are required');
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) throw AppError.notFound('User not found');

    const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!valid) throw AppError.badRequest('Current password is incorrect');

    if (currentPassword === newPassword) {
      throw AppError.badRequest('New password must be different from current password');
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.userId },
      data: { passwordHash: newHash, isFirstLogin: false },
    });

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  },
  { roles: ['ADMIN', 'COACH', 'STUDENT'], requirePasswordChanged: false }
);
