// Supabase Auth requires an email address internally. Students never see or type
// an email — they log in with a Student ID, and this file quietly converts that
// ID into a fake, unused email domain behind the scenes.
export const STUDENT_EMAIL_DOMAIN = "thaneconnect.local";

export function studentIdToEmail(studentId: string): string {
  return `${studentId.trim().toLowerCase()}@${STUDENT_EMAIL_DOMAIN}`;
}