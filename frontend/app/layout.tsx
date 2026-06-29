import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { Providers } from './providers';
import { TenantLayout } from '@/components/layout/TenantLayout';
import { PageStatusGate } from '@/components/layout/PageStatusGate';
import { getTenantSlugFromHeaders } from '@/lib/tenant';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TuTurno',
  description: 'Reservá tu turno online',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const slug = await getTenantSlugFromHeaders();

  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <Providers slug={slug}>
          <TenantLayout>
            <PageStatusGate>{children}</PageStatusGate>
          </TenantLayout>
        </Providers>
      </body>
    </html>
  );
}
