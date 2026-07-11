import { NextRequest, NextResponse } from 'next/server';
import { AppError } from './AppError';
import { createClient } from './supabase/server';
import { prisma } from './prisma';

export interface UserContext {
  userId: string;           // Prisma User.id
  supabaseId: string;       // Supabase auth.users.id
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
  }
) {
  return async (req: NextRequest, { params }: { params: any }) => {
    try {
      let userContext: any = undefined;

      if (options?.roles) {
        // Extract Bearer token from Authorization header
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
          throw AppError.unauthorized('No token provided');
        }
        const token = authHeader.split(' ')[1];

        // Validate token via Supabase — getUser makes a network call to Auth server
        const supabase = await createClient();
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

        if (error || !supabaseUser) {
          throw AppError.unauthorized('Invalid or expired token');
        }

        // Load the Prisma profile linked to this Supabase user
        const user = await prisma.user.findUnique({
          where: { supabaseId: supabaseUser.id },
          include: { student: true, coach: true, admin: true },
        });

        if (!user) {
          throw AppError.unauthorized('User profile not found');
        }

        // Check role authorization
        if (options.roles.length > 0 && !options.roles.includes(user.role as any)) {
          throw AppError.forbidden(
            `Access denied. Required: ${options.roles.join(' or ')}. Your role: ${user.role}`
          );
        }

        userContext = {
          userId: user.id,
          supabaseId: user.supabaseId,
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
      return NextResponse.json({ success: false, message }, { status: statusCode });
    }
  };
}
