import Link from 'next/link';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
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
          <Link href="/login" className="hover:text-white">
            Salir
          </Link>
        </nav>
      </header>
      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
