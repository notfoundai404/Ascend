import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// GET /api/dashboard — role-aware dashboard aggregator
export const GET = apiHandler(
  async (_req, { user }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // ── STUDENT ──────────────────────────────────────────────
    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.userId },
        include: {
          coach: { select: { id: true, name: true, specialty: true, avatarUrl: true } },
        },
      });
      if (!student) throw AppError.notFound('Student not found');

      const [transactions, attendances, notices, upcomingEvents, latestReviews, recentAchievements] =
        await Promise.all([
          prisma.transaction.findMany({
            where: { studentId: student.id },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.attendance.findMany({
            where: { studentId: student.id },
            orderBy: { date: 'desc' },
          }),
          prisma.notice.findMany({
            where: {
              OR: [
                { visibility: 'ALL' },
                {
                  visibility: 'SELECTED_STUDENTS',
                  noticeStudents: { some: { studentId: student.id } },
                },
              ],
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
          prisma.calendarEvent.findMany({
            where: { eventDate: { gte: today } },
            orderBy: { eventDate: 'asc' },
            take: 5,
          }),
          prisma.studentReview.findMany({
            where: { studentId: student.id },
            orderBy: { createdAt: 'desc' },
            take: 3,
          }),
          prisma.achievement.findMany({
            where: { studentId: student.id },
            orderBy: { createdAt: 'desc' },
            take: 3,
          }),
        ]);

      const academyPaid = transactions
        .filter((t: any) => t.status === 'Approved' && t.type === 'academy_fees')
        .reduce((s: number, t: any) => s + t.amount, 0);
      const uniformPaid = transactions
        .filter((t: any) => t.status === 'Approved' && t.type === 'uniform_fees')
        .reduce((s: number, t: any) => s + t.amount, 0);

      const totalClasses = attendances.length;
      const present = attendances.filter((a: any) => a.isPresent).length;

      return NextResponse.json({
        success: true,
        data: {
          student: {
            id: student.id,
            studentId: student.studentId,
            fullName: student.fullName,
            email: student.email,
            batch: student.batch,
            cricketRole: student.cricketRole,
          },
          coach: student.coach,
          fees: {
            totalFees: student.totalFees,
            uniformFees: student.uniformFees,
            totalCharged: student.totalFees + student.uniformFees,
            academyPaid,
            uniformPaid,
            totalPaid: academyPaid + uniformPaid,
            remainingAcademy: Math.max(0, student.totalFees - academyPaid),
            remainingUniform: Math.max(0, student.uniformFees - uniformPaid),
            totalRemaining: Math.max(0, student.totalFees + student.uniformFees - academyPaid - uniformPaid),
          },
          attendance: {
            totalClasses,
            present,
            absent: totalClasses - present,
            percentage: totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0,
          },
          pendingPayments: transactions.filter((t: any) => t.status === 'Pending').length,
          latestNotices: notices,
          upcomingEvents,
          latestReviews,
          recentAchievements,
        },
      });
    }

    // ── COACH ────────────────────────────────────────────────
    if (user.role === 'COACH') {
      const coach = await prisma.coach.findUnique({ where: { userId: user.userId } });
      if (!coach) throw AppError.notFound('Coach not found');

      const [assignedStudents, todayAttendance, upcomingEvents, notices, ownAttendance] =
        await Promise.all([
          prisma.student.findMany({
            where: { primaryCoachId: coach.id },
            select: { id: true, studentId: true, fullName: true, cricketRole: true, batch: true },
          }),
          prisma.attendance.findMany({
            where: {
              student: { primaryCoachId: coach.id },
              date: { gte: today, lt: tomorrow },
            },
            include: { student: { select: { fullName: true, studentId: true } } },
          }),
          prisma.calendarEvent.findMany({
            where: { eventDate: { gte: today } },
            orderBy: { eventDate: 'asc' },
            take: 5,
          }),
          prisma.notice.findMany({
            where: {
              OR: [
                { visibility: 'ALL' },
                { visibility: 'SELECTED_COACHES', noticeCoaches: { some: { coachId: coach.id } } },
              ],
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }),
          prisma.coachAttendance.findMany({
            where: { coachId: coach.id },
            orderBy: { date: 'desc' },
            take: 10,
          }),
        ]);

      const presentToday = todayAttendance.filter((a: any) => a.isPresent).length;
      const pendingPayments = await prisma.transaction.count({
        where: { status: 'Pending', student: { primaryCoachId: coach.id } },
      });

      return NextResponse.json({
        success: true,
        data: {
          coach: {
            id: coach.id,
            name: coach.name,
            specialty: coach.specialty,
            experience: coach.experience,
            rating: coach.rating,
            avatarUrl: coach.avatarUrl,
          },
          assignedStudents,
          totalStudents: assignedStudents.length,
          todayAttendance: {
            records: todayAttendance,
            presentCount: presentToday,
            absentCount: todayAttendance.length - presentToday,
            unmarkedCount: assignedStudents.length - todayAttendance.length,
          },
          upcomingEvents,
          notices,
          ownAttendance,
          pendingPayments,
        },
      });
    }

    // ── ADMIN ────────────────────────────────────────────────
    const [
      totalStudents,
      totalCoaches,
      todayAttendance,
      pendingPayments,
      totalFeesCollected,
      upcomingEvents,
      recentNotices,
      recentStudents,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.coach.count(),
      prisma.attendance.findMany({
        where: { date: { gte: today, lt: tomorrow } },
        include: { student: { select: { fullName: true, studentId: true } } },
      }),
      prisma.transaction.count({ where: { status: 'Pending' } }),
      prisma.transaction.aggregate({
        where: { status: 'Approved' },
        _sum: { amount: true },
      }),
      prisma.calendarEvent.findMany({
        where: { eventDate: { gte: today } },
        orderBy: { eventDate: 'asc' },
        take: 5,
      }),
      prisma.notice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.student.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          studentId: true,
          fullName: true,
          email: true,
          batch: true,
          createdAt: true,
          coach: { select: { name: true } },
        },
      }),
    ]);

    const presentToday = todayAttendance.filter((a: any) => a.isPresent).length;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalCoaches,
          pendingPayments,
          totalFeesCollected: totalFeesCollected._sum.amount ?? 0,
        },
        todayAttendance: {
          total: todayAttendance.length,
          present: presentToday,
          absent: todayAttendance.length - presentToday,
        },
        upcomingEvents,
        recentNotices,
        recentStudents,
      },
    });
  },
  { roles: ['ADMIN', 'COACH', 'STUDENT'] }
);
