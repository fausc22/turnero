const TOKEN_KEY = 'tuturno_super_token';
const REFRESH_KEY = 'tuturno_super_refresh';

export function getSuperToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getSuperRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setSuperTokens(token: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  document.cookie = `super_token=${token}; path=/; max-age=28800; SameSite=Lax`;
}

export function clearSuperTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  document.cookie = 'super_token=; path=/; max-age=0';
}
