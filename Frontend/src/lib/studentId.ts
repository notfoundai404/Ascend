import { prisma } from '@/lib/prisma';

/**
 * Atomically generates the next student ID in sequence.
 * Format: ASC-001, ASC-002 ... ASC-009, ASC-010, ASC-100...
 * The studentId is immutable once assigned.
 */
export async function generateStudentId(): Promise<string> {
  const counter = await prisma.$transaction(async (tx: any) => {
    // Upsert the counter row (creates if not exists)
    const updated = await tx.idCounter.upsert({
      where: { id: 'student_counter' },
      create: { id: 'student_counter', current: 1 },
      update: { current: { increment: 1 } },
    });
    return updated.current;
  });

  // Format with leading zeros: 1 → ASC-001, 10 → ASC-010, 100 → ASC-100
  const padded = String(counter).padStart(3, '0');
  return `ASC-${padded}`;
}
