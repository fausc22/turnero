'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Tenant {
  id: number;
  slug: string;
  nombre: string;
  plan: string;
  status: string;
  page_status: string;
  db_name: string | null;
  latestProvisioningRun?: { status: string } | null;
}

export default function TenantsListPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/api/super/tenants')
      .then((res) => setTenants(res.data.data))
      .catch(() => setError('No se pudo cargar tenants'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tenants</h1>
        <Link
          href="/tenants/nuevo"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
        >
          Nuevo tenant
        </Link>
      </div>
      {loading && <p className="text-neutral-400">Cargando...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Provisioning</th>
                <th className="px-4 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-t border-neutral-800">
                  <td className="px-4 py-3 font-mono">{t.slug}</td>
                  <td className="px-4 py-3">{t.nombre}</td>
                  <td className="px-4 py-3">{t.plan}</td>
                  <td className="px-4 py-3">{t.status}</td>
                  <td className="px-4 py-3">
                    {t.db_name ? 'OK' : t.latestProvisioningRun?.status ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/tenants/${t.id}`} className="text-neutral-300 hover:text-white">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
