import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/auth/profile
 * Called by the client immediately after Supabase login to fetch
 * the Prisma profile (role, name, studentId, etc.).
 * Validates the Supabase access token and returns the profile.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized('No token provided');
    }
    const token = authHeader.split(' ')[1];

    const supabase = await createClient();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      throw AppError.unauthorized('Invalid or expired token');
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      include: { student: true, coach: true, admin: true },
    });

    if (!user) {
      throw AppError.notFound('User profile not found. Contact your administrator.');
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
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
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status }
    );
  }
}
