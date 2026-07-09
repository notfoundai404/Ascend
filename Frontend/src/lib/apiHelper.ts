import { NextRequest, NextResponse } from 'next/server';
import { AppError } from './AppError';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export interface JwtPayload {
  userId: string;
  role: string;
  email: string;
}

export interface UserContext {
  userId: string;
  role: 'ADMIN' | 'COACH' | 'STUDENT';
  email: string;
  studentId?: string;
  coachId?: string;
  adminId?: string;
}

export function apiHandler(
  handler: (req: NextRequest, context: { params: any; user: UserContext }) => Promise<NextResponse> | NextResponse,
  options?: {
    roles?: ('ADMIN' | 'COACH' | 'STUDENT')[];
    requirePasswordChanged?: boolean;
  }
) {
  return async (req: NextRequest, { params }: { params: any }) => {
    try {
      let userContext: any = undefined;

      // Handle Authentication if roles are specified
      if (options?.roles) {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw AppError.unauthorized('No token provided');
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_ACCESS_SECRET;
        if (!secret) {
          throw AppError.internal('JWT secret not configured');
        }

        let decoded: any;
        try {
          decoded = jwt.verify(token, secret);
        } catch (err: any) {
          if (err.name === 'TokenExpiredError') {
            throw AppError.unauthorized('Token expired');
          }
          throw AppError.unauthorized('Invalid token');
        }

        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: { student: true, coach: true, admin: true },
        });
        if (!user) {
          throw AppError.unauthorized('User no longer exists');
        }

        // Check password changed (skip for change-password route itself)
        if (options.requirePasswordChanged !== false && user.isFirstLogin) {
          throw new AppError(
            'Password change required. Please change your temporary password before proceeding.',
            403
          );
        }

        // Check roles
        if (options.roles.length > 0 && !options.roles.includes(user.role as any)) {
          throw AppError.forbidden(
            `Access denied. Required role: ${options.roles.join(' or ')}. Your role: ${user.role}`
          );
        }

        userContext = {
          userId: user.id,
          role: user.role as 'ADMIN' | 'COACH' | 'STUDENT',
          email: user.email,
          studentId: user.student?.id,
          coachId: user.coach?.id,
          adminId: user.admin?.id,
        };
      }

      const res = await handler(req, { params: await params, user: userContext });
      return res;
    } catch (error: any) {
      console.error('API Error:', error);
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal Server Error';
      return NextResponse.json(
        { success: false, message },
        { status: statusCode }
      );
    }
  };
}
