import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractTenantSlugFromHostname } from './lib/tenant-host';

const PANEL_URL = process.env.NEXT_PUBLIC_PANEL_URL || 'http://panel.localhost:4011';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0];
  const slug = extractTenantSlugFromHostname(hostname);

  if (!slug) {
    return NextResponse.redirect(PANEL_URL);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', slug);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.cookies.set('x-tenant-slug', slug, { path: '/', sameSite: 'lax' });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
