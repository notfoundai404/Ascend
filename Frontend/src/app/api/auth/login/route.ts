import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/login
 * Signs the user in with Supabase and returns their Prisma profile.
 * Supabase SSR automatically writes the session as an HTTP-only cookie
 * via the server client + middleware — no token is returned to the client.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      throw AppError.badRequest('Email and password are required');
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      throw AppError.unauthorized(error?.message || 'Invalid email or password');
    }

    // Load the Prisma profile linked to this Supabase user
    const user = await prisma.user.findUnique({
      where: { supabaseId: data.user.id },
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
