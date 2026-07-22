'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearSuperTokens } from '../../lib/auth';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function logout() {
    clearSuperTokens();
    router.push('/login');
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <Link href="/tenants" className="font-semibold">
          TuTurno Super
        </Link>
        <nav className="flex gap-4 text-sm text-neutral-400">
          <Link href="/tenants" className="hover:text-white">
            Tenants
          </Link>
          <Link href="/audit" className="hover:text-white">
            Auditoría
          </Link>
          <button type="button" onClick={logout} className="hover:text-white">
            Salir
          </button>
        </nav>
      </header>
      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
