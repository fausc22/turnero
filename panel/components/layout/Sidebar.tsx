'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NAV_ITEMS } from '@/lib/nav';
import { canNav } from '@/hooks/useCan';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const { usuario, logout, tenantSlug } = useAuth();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-[#141416] md:flex md:flex-col">
      <div className="border-b border-border p-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">TuTurno</p>
        <p className="font-semibold truncate">{tenantSlug}</p>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => {
          if (!canNav(item.href, usuario?.rol)) return null;
          const href = item.comingSoon ? '/proximamente' : item.href;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                active ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.comingSoon && (
                <span className="ml-auto text-[10px] text-muted-foreground">pronto</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4 space-y-2">
        <p className="text-xs text-muted-foreground truncate">{usuario?.nombre}</p>
        <Button variant="outline" size="sm" className="w-full" onClick={logout}>
          Salir
        </Button>
      </div>
    </aside>
  );
}
