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

// ── In-memory UserContext cache ───────────────────────────────────────────────
// Keyed by Supabase UID. Each entry expires after TTL_MS so role/profile
// changes are reflected quickly without restarting the server.
const TTL_MS = 30_000; // 30 seconds
const userCache = new Map<string, { ctx: UserContext; expiresAt: number }>();

function getCachedUser(supabaseId: string): UserContext | null {
  const entry = userCache.get(supabaseId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    userCache.delete(supabaseId);
    return null;
  }
  return entry.ctx;
}

function setCachedUser(supabaseId: string, ctx: UserContext) {
  userCache.set(supabaseId, { ctx, expiresAt: Date.now() + TTL_MS });
}

/** Call this after any mutation that changes a user's role or profile linkage. */
export function invalidateUserCache(supabaseId: string) {
  userCache.delete(supabaseId);
}
// ─────────────────────────────────────────────────────────────────────────────

export function apiHandler(
  handler: (req: NextRequest, context: { params: any; user: UserContext }) => Promise<NextResponse> | NextResponse,
  options?: {
    roles?: ('ADMIN' | 'COACH' | 'STUDENT')[];
    optionalAuth?: boolean;
  }
) {
  return async (req: NextRequest, { params }: { params: any }) => {
    try {
      let userContext: any = undefined;

      if (options?.roles || options?.optionalAuth) {
        // ── JWT validation via Supabase (required every request) ────────────
        const t0 = performance.now();
        const supabase = await createClient();
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
        if (process.env.NODE_ENV === 'development') {
          console.log(`[apiHelper] getUser: ${(performance.now() - t0).toFixed(1)}ms`);
        }

        if (error || !supabaseUser) {
          if (options?.roles) {
            throw AppError.unauthorized('Invalid or expired session');
          }
          // optionalAuth — continue without a user context
        } else {
          // ── Prisma profile lookup (cached for TTL_MS) ────────────────────
          const cached = getCachedUser(supabaseUser.id);
          if (cached) {
            userContext = cached;
          } else {
            const t1 = performance.now();
            // Lean select — only fetch fields needed to build UserContext
            const user = await prisma.user.findUnique({
              where: { supabaseId: supabaseUser.id },
              select: {
                id: true,
                supabaseId: true,
                email: true,
                role: true,
                student: { select: { id: true } },
                coach:   { select: { id: true } },
                admin:   { select: { id: true } },
              },
            });
            if (process.env.NODE_ENV === 'development') {
              console.log(`[apiHelper] prisma lookup: ${(performance.now() - t1).toFixed(1)}ms`);
            }

            if (!user) {
              if (options?.roles) {
                throw AppError.unauthorized('User profile not found');
              }
              // optionalAuth — profile missing, continue as guest
            } else {
              userContext = {
                userId: user.id,
                supabaseId: user.supabaseId,
                role: user.role as 'ADMIN' | 'COACH' | 'STUDENT',
                email: user.email,
                studentId: user.student?.id,
                coachId: user.coach?.id,
                adminId: user.admin?.id,
              } satisfies UserContext;

              setCachedUser(supabaseUser.id, userContext);
            }
          }
        }

        // Check role authorization (only when roles are explicitly required)
        if (options?.roles && options.roles.length > 0 && userContext && !options.roles.includes(userContext.role)) {
          throw AppError.forbidden(
            `Access denied. Required: ${options.roles.join(' or ')}. Your role: ${userContext.role}`
          );
        }
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
