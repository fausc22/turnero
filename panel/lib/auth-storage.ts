const TOKEN_KEY = 'tuturno_panel_token';
const REFRESH_KEY = 'tuturno_panel_refresh';
const SLUG_KEY = 'tuturno_panel_tenant_slug';
const USER_KEY = 'tuturno_panel_user';

export interface StoredUser {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  onboardingCompletado?: boolean;
}

export function getPanelToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getPanelRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getTenantSlug(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SLUG_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setPanelSession(data: {
  token: string;
  refreshToken: string;
  tenantSlug: string;
  usuario: StoredUser;
}): void {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(REFRESH_KEY, data.refreshToken);
  localStorage.setItem(SLUG_KEY, data.tenantSlug);
  localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
  document.cookie = `panel_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearPanelSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(SLUG_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = 'panel_token=; path=/; max-age=0';
}
