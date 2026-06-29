'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { canNav } from '@/hooks/useCan';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useTenantSse } from '@/hooks/useTenantSse';
import { Skeleton } from '@/components/ui/skeleton';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { fetchMe } from '@/lib/tenant-api';
import { setPanelSession, getPanelToken, getPanelRefreshToken, getTenantSlug } from '@/lib/auth-storage';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { usuario, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  useTenantSse(!!usuario);

  useEffect(() => {
    if (!loading && !usuario) {
      router.replace('/login');
    }
  }, [loading, usuario, router]);

  useEffect(() => {
    if (!usuario || !pathname) return;
    if (pathname === '/mas' || pathname === '/proximamente') return;
    if (!canNav(pathname, usuario.rol)) {
      router.replace('/dashboard');
    }
  }, [usuario, pathname, router]);

  useEffect(() => {
    if (!usuario || usuario.rol !== 'GERENTE') {
      setOnboardingChecked(true);
      return;
    }
    if (usuario.onboardingCompletado) {
      setOnboardingChecked(true);
      return;
    }
    void fetchMe()
      .then((me) => {
        if (!me.onboardingCompletado) setShowOnboarding(true);
        else {
          const token = getPanelToken();
          const refresh = getPanelRefreshToken();
          const slug = getTenantSlug();
          if (token && refresh && slug) {
            setPanelSession({
              token,
              refreshToken: refresh,
              tenantSlug: slug,
              usuario: { ...usuario, onboardingCompletado: true },
            });
          }
        }
      })
      .finally(() => setOnboardingChecked(true));
  }, [usuario]);

  if (loading || !onboardingChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col pb-16 md:pb-0">
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
      <MobileBottomNav />
      {showOnboarding && usuario.rol === 'GERENTE' && (
        <OnboardingWizard
          usuario={usuario}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
