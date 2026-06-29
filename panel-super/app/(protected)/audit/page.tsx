'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface AuditRow {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  created_at: string;
}

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/super/audit?limit=100')
      .then((res) => setRows(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Auditoría de plataforma</h1>
      {loading ? (
        <p className="text-neutral-400">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-800 bg-neutral-900/50">
              <tr>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Acción</th>
                <th className="px-3 py-2 text-left">Entidad</th>
                <th className="px-3 py-2 text-left">ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-neutral-800/50">
                  <td className="px-3 py-2 text-neutral-400">
                    {new Date(r.created_at).toLocaleString('es-AR')}
                  </td>
                  <td className="px-3 py-2">{r.action}</td>
                  <td className="px-3 py-2">{r.entity_type}</td>
                  <td className="px-3 py-2">{r.entity_id ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
