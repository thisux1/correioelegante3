export function isEmailAdmin(email?: string | null): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const rawAdmins = process.env.ADMIN_EMAILS || '';
  const adminList = rawAdmins
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return adminList.includes(email.trim().toLowerCase());
}
