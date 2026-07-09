import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/AppError';

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) throw AppError.badRequest('Refresh token is required');

    const secret = process.env.JWT_REFRESH_SECRET!;
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, secret);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.refreshToken) {
      throw AppError.unauthorized('Session expired, please login again');
    }

    const valid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!valid) throw AppError.unauthorized('Invalid refresh token');

    const payload = { userId: user.id, role: user.role, email: user.email };
    const accessSecret = process.env.JWT_ACCESS_SECRET!;
    const refreshSecret = process.env.JWT_REFRESH_SECRET!;
    const accessExpires = (process.env.JWT_ACCESS_EXPIRES || '15m') as jwt.SignOptions['expiresIn'];
    const refreshExpires = (process.env.JWT_REFRESH_EXPIRES || '7d') as jwt.SignOptions['expiresIn'];

    const newAccessToken = jwt.sign(payload, accessSecret, { expiresIn: accessExpires });
    const newRefreshToken = jwt.sign(payload, refreshSecret, { expiresIn: refreshExpires });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(newRefreshToken, 8) },
    });

    return NextResponse.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status });
  }
}
