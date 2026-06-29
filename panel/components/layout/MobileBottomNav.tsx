'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOBILE_NAV } from '@/lib/nav';
import { useAuth } from '@/context/AuthContext';
import { canNav } from '@/hooks/useCan';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { usuario } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-[#141416] md:hidden">
      {MOBILE_NAV.map((item) => {
        if (item.href !== '/mas' && !canNav(item.href, usuario?.rol)) return null;
        const active =
          pathname === item.href ||
          (item.href === '/mas' && pathname === '/mas') ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-[10px]',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
