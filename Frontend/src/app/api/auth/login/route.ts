import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/AppError';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      throw AppError.badRequest('Email and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { student: true, coach: true, admin: true },
    });

    if (!user) throw AppError.unauthorized('Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw AppError.unauthorized('Invalid email or password');

    const payload = { userId: user.id, role: user.role, email: user.email };

    const accessSecret = process.env.JWT_ACCESS_SECRET!;
    const refreshSecret = process.env.JWT_REFRESH_SECRET!;
    const accessExpires = (process.env.JWT_ACCESS_EXPIRES || '15m') as jwt.SignOptions['expiresIn'];
    const refreshExpires = (process.env.JWT_REFRESH_EXPIRES || '7d') as jwt.SignOptions['expiresIn'];

    const accessToken = jwt.sign(payload, accessSecret, { expiresIn: accessExpires });
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: refreshExpires });

    // Store hashed refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(refreshToken, 8) },
    });

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isFirstLogin: user.isFirstLogin,
          studentId: user.student?.studentId,
          studentDbId: user.student?.id,
          coachId: user.coach?.id,
          adminId: user.admin?.id,
          fullName:
            user.student?.fullName ??
            user.coach?.name ??
            user.admin?.name ??
            'User',
        },
      },
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status });
  }
}
