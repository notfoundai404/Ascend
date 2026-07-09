/**
 * Parse pagination params from query string.
 * Defaults: page=1, limit=20
 */
export function parsePagination(query: Record<string, unknown>): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'), 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build Prisma orderBy from query string.
 * Example: ?sortBy=createdAt&sortOrder=desc
 */
export function parseSort(
  query: Record<string, unknown>,
  allowedFields: string[],
  defaultField = 'createdAt'
): Record<string, 'asc' | 'desc'> {
  const sortBy = String(query.sortBy || defaultField);
  const sortOrder = String(query.sortOrder || 'desc') as 'asc' | 'desc';
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  return { [field]: sortOrder === 'asc' ? 'asc' : 'desc' };
}
