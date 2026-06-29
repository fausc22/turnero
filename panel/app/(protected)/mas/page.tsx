'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/nav';
import { useAuth } from '@/context/AuthContext';
import { canNav } from '@/hooks/useCan';
import { cn } from '@/lib/utils';

export default function MasPage() {
  const pathname = usePathname();
  const { usuario, logout } = useAuth();

  const extra = NAV_ITEMS.filter(
    (item) => !['/dashboard', '/agenda', '/turnos'].includes(item.href) && canNav(item.href, usuario?.rol)
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Más</h1>
      <nav className="space-y-1">
        {extra.map((item) => {
          const href = item.comingSoon ? '/proximamente' : item.href;
          const Icon = item.icon;
          const active = pathname === href;
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm',
                active && 'border-primary bg-primary/10'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
              {item.comingSoon && (
                <span className="ml-auto text-xs text-muted-foreground">Próximamente</span>
              )}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={logout}
        className="w-full rounded-lg border border-border px-4 py-3 text-sm text-red-400 hover:bg-muted"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
