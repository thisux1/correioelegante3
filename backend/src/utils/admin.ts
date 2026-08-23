const DEFAULT_ADMIN_EMAILS = [
  'contato@correioelegante.studio',
  'admin@correioelegante.studio',
];

export function isEmailAdmin(email?: string | null): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const normalized = email.trim().toLowerCase();

  // 1. Default built-in admin emails
  if (DEFAULT_ADMIN_EMAILS.includes(normalized)) {
    return true;
  }

  // 2. Custom ADMIN_EMAILS environment variable (comma separated)
  const rawAdmins = process.env.ADMIN_EMAILS || '';
  const adminList = rawAdmins
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return adminList.includes(normalized);
}
