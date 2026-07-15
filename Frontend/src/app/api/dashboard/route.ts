import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';

// GET /api/dashboard — role-aware dashboard aggregator.
// Returns a focused preview payload sufficient for the dashboard home card.
// Full datasets (attendance history, all transactions, etc.) are loaded
// on-demand through their individual paginated endpoints.
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
        select: {
          id: true,
          studentId: true,
          fullName: true,
          email: true,
          phone: true,
          batch: true,
          cricketRole: true,
          totalFees: true,
          uniformFees: true,
          amountPaidTillDate: true,
          installmentsLimit: true,
          coach: {
            select: { id: true, name: true, specialty: true, avatarUrl: true },
          },
        },
      });
      if (!student) throw AppError.notFound('Student not found');

      // All queries run in parallel — one DB round-trip
      const [
        transactions,
        attendances,
        noticesPreview,
        eventsPreview,
        reviewsPreview,
        achievementsPreview,
        coaches,
      ] = await Promise.all([
        // All transactions needed to compute fee totals accurately
        prisma.transaction.findMany({
          where: { studentId: student.id },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            type: true,
            mode: true,
            status: true,
            utrNumber: true,
            proofUrl: true,
            transactionDatetime: true,
            installmentNumber: true,
            createdAt: true,
            verifiedBy: true,
            verifiedAt: true,
          },
        }),
        // Last 10 attendance records + stats
        prisma.attendance.findMany({
          where: { studentId: student.id },
          orderBy: { date: 'desc' },
          select: { id: true, date: true, isPresent: true, notes: true },
        }),
        // 5 latest visible notices
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
          select: {
            id: true, title: true, content: true, category: true,
            visibility: true, imageUrl: true, createdAt: true, createdBy: true,
          },
        }),
        // 5 next upcoming events
        prisma.calendarEvent.findMany({
          where: { eventDate: { gte: today } },
          orderBy: { eventDate: 'asc' },
          take: 5,
          select: { id: true, title: true, description: true, category: true, eventDate: true, imageUrl: true, createdAt: true },
        }),
        // 3 latest reviews
        prisma.studentReview.findMany({
          where: { studentId: student.id },
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true, coachName: true, battingRating: true,
            bowlingRating: true, fitnessRating: true, reviewText: true, createdAt: true,
          },
        }),
        // 3 latest achievements
        prisma.achievement.findMany({
          where: { studentId: student.id },
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: { id: true, title: true, description: true, imageUrl: true, date: true, isFeatured: true, createdAt: true },
        }),
        // Coaches list for feedback form dropdown
        prisma.coach.findMany({
          orderBy: { name: 'asc' },
          select: { id: true, name: true, specialty: true, experience: true, rating: true, avatarUrl: true },
        }),
      ]);

      const academyPaid = transactions
        .filter((t) => t.status === 'Approved' && t.type === 'academy_fees')
        .reduce((s, t) => s + t.amount, 0);
      const uniformPaid = transactions
        .filter((t) => t.status === 'Approved' && t.type === 'uniform_fees')
        .reduce((s, t) => s + t.amount, 0);

      const totalClasses = attendances.length;
      const present = attendances.filter((a) => a.isPresent).length;

      return NextResponse.json({
        success: true,
        data: {
          student: {
            id: student.id,
            studentId: student.studentId,
            fullName: student.fullName,
            email: student.email,
            phone: student.phone,
            batch: student.batch,
            cricketRole: student.cricketRole,
            totalFees: student.totalFees,
            uniformFees: student.uniformFees,
            amountPaidTillDate: student.amountPaidTillDate,
            installmentsLimit: student.installmentsLimit,
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
            // Full records for the attendance tab — no separate call needed
            records: attendances,
          },
          pendingPaymentsCount: transactions.filter((t) => t.status === 'Pending').length,
          // Full transaction list — small enough for students
          transactions,
          noticesPreview,
          eventsPreview,
          reviewsPreview,
          achievementsPreview,
          coaches,
        },
      });
    }

    // ── COACH ────────────────────────────────────────────────
    if (user.role === 'COACH') {
      const coach = await prisma.coach.findUnique({
        where: { userId: user.userId },
        select: {
          id: true, name: true, phone: true, email: true,
          specialty: true, experience: true, rating: true, avatarUrl: true,
        },
      });
      if (!coach) throw AppError.notFound('Coach not found');

      const [assignedStudents, todayAttendance, eventsPreview, noticesPreview, coaches] =
        await Promise.all([
          prisma.student.findMany({
            where: { primaryCoachId: coach.id },
            select: {
              id: true, studentId: true, fullName: true,
              cricketRole: true, batch: true, email: true, phone: true,
            },
          }),
          prisma.attendance.findMany({
            where: {
              student: { primaryCoachId: coach.id },
              date: { gte: today, lt: tomorrow },
            },
            select: {
              id: true, isPresent: true, notes: true,
              student: { select: { id: true, fullName: true, studentId: true } },
            },
          }),
          prisma.calendarEvent.findMany({
            where: { eventDate: { gte: today } },
            orderBy: { eventDate: 'asc' },
            take: 5,
            select: { id: true, title: true, description: true, category: true, eventDate: true, imageUrl: true, createdAt: true },
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
            select: {
              id: true, title: true, content: true, category: true,
              visibility: true, imageUrl: true, createdAt: true, createdBy: true,
            },
          }),
          // All coaches for the staff tab
          prisma.coach.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true, specialty: true, experience: true, rating: true, avatarUrl: true },
          }),
        ]);

      const presentToday = todayAttendance.filter((a) => a.isPresent).length;
      const pendingPaymentsCount = await prisma.transaction.count({
        where: { status: 'Pending', student: { primaryCoachId: coach.id } },
      });

      return NextResponse.json({
        success: true,
        data: {
          coach,
          assignedStudents,
          totalStudents: assignedStudents.length,
          todayAttendance: {
            records: todayAttendance,
            presentCount: presentToday,
            absentCount: todayAttendance.length - presentToday,
            unmarkedCount: assignedStudents.length - todayAttendance.length,
          },
          eventsPreview,
          noticesPreview,
          coaches,
          pendingPaymentsCount,
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
      eventsPreview,
      noticesPreview,
      recentStudents,
      recentTransactions,
      allStudents,
      coaches,
      adminFeedbacks,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.coach.count(),
      prisma.attendance.findMany({
        where: { date: { gte: today, lt: tomorrow } },
        select: {
          id: true, isPresent: true, notes: true,
          student: { select: { id: true, fullName: true, studentId: true } },
        },
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
        select: { id: true, title: true, description: true, category: true, eventDate: true, imageUrl: true, createdAt: true },
      }),
      prisma.notice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, title: true, content: true, category: true,
          visibility: true, imageUrl: true, createdAt: true, createdBy: true,
        },
      }),
      prisma.student.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, studentId: true, fullName: true, email: true,
          batch: true, createdAt: true,
          coach: { select: { id: true, name: true } },
        },
      }),
      // 10 most recent transactions for admin dashboard card
      prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, amount: true, type: true, mode: true, status: true,
          utrNumber: true, proofUrl: true, transactionDatetime: true,
          installmentNumber: true, createdAt: true, verifiedBy: true, verifiedAt: true,
          student: { select: { id: true, studentId: true, fullName: true } },
        },
      }),
      // Full student list for Manage Accounts tab
      prisma.student.findMany({
        orderBy: { fullName: 'asc' },
        select: {
          id: true, studentId: true, fullName: true, email: true, phone: true,
          batch: true, cricketRole: true, totalFees: true, uniformFees: true,
          amountPaidTillDate: true, installmentsLimit: true, createdAt: true,
          primaryCoachId: true,
          coach: { select: { id: true, name: true } },
        },
      }),
      // Full coaches list
      prisma.coach.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true, name: true, specialty: true, experience: true, rating: true,
          avatarUrl: true, email: true, phone: true,
          _count: { select: { students: true } },
        },
      }),
      // Feedback list for admin
      prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, studentId: true, studentName: true, coachName: true,
          rating: true, comments: true, isTestimonial: true, createdAt: true,
        },
      }),
    ]);

    const presentToday = todayAttendance.filter((a) => a.isPresent).length;

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
          records: todayAttendance,
          total: todayAttendance.length,
          present: presentToday,
          absent: todayAttendance.length - presentToday,
        },
        eventsPreview,
        noticesPreview,
        recentStudents,
        recentTransactions,
        allStudents,
        coaches,
        adminFeedbacks,
      },
    });
  },
  { roles: ['ADMIN', 'COACH', 'STUDENT'] }
);
