import crypto from 'crypto';

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghjkmnpqrstuvwxyz';
const DIGITS = '23456789';
const SPECIAL = '@#$!';

/**
 * Generates a secure temporary password.
 * Format: 1 uppercase + 1 lowercase + 1 digit + 1 special + 6 random chars
 * Example: "Kp7#xmTr4s"
 */
export function generateTempPassword(length = 10): string {
  const allChars = UPPER + LOWER + DIGITS + SPECIAL;

  // Ensure at least one of each required character type
  const required = [
    UPPER[crypto.randomInt(UPPER.length)],
    LOWER[crypto.randomInt(LOWER.length)],
    DIGITS[crypto.randomInt(DIGITS.length)],
    SPECIAL[crypto.randomInt(SPECIAL.length)],
  ];

  // Fill remaining characters randomly
  const remaining = Array.from({ length: length - required.length }, () =>
    allChars[crypto.randomInt(allChars.length)]
  );

  // Shuffle the combined array using Fisher-Yates
  const combined = [...required, ...remaining];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join('');
}
