const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const SHARE_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;

export function sanitizeText(
  value: string,
  maxLength = 200
): string {
  return value
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .slice(0, maxLength);
}

export function sanitizeEmail(value: string): string | null {
  const normalized = sanitizeText(value, 254).toLowerCase();
  if (!normalized || !EMAIL_RE.test(normalized)) return null;
  return normalized;
}

export function isValidShareId(value: string): boolean {
  return SHARE_ID_RE.test(value);
}
