import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/reset-password
 * Checks that the email exists in our DB, then asks Supabase to send a
 * 8-digit OTP recovery code to that email (no magic link / redirectTo needed).
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      throw AppError.badRequest('Email is required');
    }

    // Verify the email belongs to a known user
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      throw AppError.notFound('No account found with this email address.');
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully.',
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status }
    );
  }
}
