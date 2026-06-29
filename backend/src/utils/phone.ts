export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('54') && digits.length >= 12) {
    return `+${digits}`;
  }
  if (digits.startsWith('0')) {
    return `+54${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `+54${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('15')) {
    return `+54${digits.slice(2)}`;
  }
  return digits.startsWith('+') ? phone.trim() : `+${digits}`;
}
