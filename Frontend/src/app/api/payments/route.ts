import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHelper';
import { AppError } from '@/lib/AppError';
import { prisma } from '@/lib/prisma';
import { parsePagination } from '@/lib/pagination';

// GET /api/payments — Admin: list all payments
// POST /api/payments — Student: submit a payment
export const GET = apiHandler(
  async (req, { user }) => {
    const url = new URL(req.url);
    const query: Record<string, unknown> = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });

    const { page, limit, skip } = parsePagination(query);
    const status = String(query.status || '');
    const type = String(query.type || '');
    const studentId = String(query.studentId || '');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (studentId) where.studentId = studentId;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { id: true, studentId: true, fullName: true, email: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { transactions, page, limit, total } });
  },
  { roles: ['ADMIN'] }
);

export const POST = apiHandler(
  async (req, { user }) => {
    let amount: number, type: string, mode: string, utrNumber: string | undefined,
      transactionDatetime: string, feesFor: string | undefined, installmentNumber: number | undefined,
      proofUrl: string | undefined;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      amount = parseFloat(formData.get('amount') as string);
      type = formData.get('type') as string;
      mode = formData.get('mode') as string;
      utrNumber = formData.get('utrNumber') as string | undefined;
      transactionDatetime = formData.get('transactionDatetime') as string;
      feesFor = formData.get('feesFor') as string | undefined;
      installmentNumber = formData.get('installmentNumber')
        ? parseInt(formData.get('installmentNumber') as string)
        : undefined;
      // proofUrl: in production you'd handle file upload to storage here
      proofUrl = undefined;
    } else {
      const body = await req.json();
      ({ amount, type, mode, utrNumber, transactionDatetime, feesFor, installmentNumber, proofUrl } = body);
    }

    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) throw AppError.notFound('Student not found');

    // Get existing count for installment numbering
    const existingCount = await prisma.transaction.count({
      where: { studentId: student.id, type, status: { not: 'Rejected' } },
    });

    const instNum = installmentNumber ?? existingCount + 1;

    const tx = await prisma.transaction.create({
      data: {
        studentId: student.id,
        amount,
        type,
        mode,
        utrNumber: utrNumber ?? null,
        transactionDatetime: new Date(transactionDatetime),
        feesFor: feesFor ?? null,
        installmentNumber: instNum,
        proofUrl: proofUrl ?? null,
        status: 'Pending',
      },
    });

    return NextResponse.json({ success: true, data: tx }, { status: 201 });
  },
  { roles: ['STUDENT'] }
);
