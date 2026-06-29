'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface TenantDetail {
  id: number;
  slug: string;
  nombre: string;
  plan: string;
  status: string;
  page_status: string;
  db_name: string | null;
  provisioningRuns: Array<{
    id: number;
    status: string;
    error_message: string | null;
    started_at: string;
    finished_at: string | null;
  }>;
  domains: Array<{ domain: string; is_primary: number }>;
}

export default function TenantDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  function load() {
    return api.get(`/api/super/tenants/${id}`).then((res) => setTenant(res.data.data));
  }

  useEffect(() => {
    load()
      .catch(() => setMessage('Error al cargar'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api.put(`/api/super/tenants/${id}`, {
        nombre: form.get('nombre'),
        plan: form.get('plan'),
        status: form.get('status'),
        page_status: form.get('page_status'),
      });
      setMessage('Actualizado');
      await load();
    } catch {
      setMessage('Error al actualizar');
    }
  }

  async function handleReprovision() {
    if (!tenant) return;
    const email = prompt('Email gerente:', `admin@${tenant.slug}.local`);
    const password = prompt('Contraseña gerente (min 8):', 'Password123!');
    if (!email || !password) return;
    try {
      await api.post(`/api/super/tenants/${id}/reprovision`, {
        gerente: { nombre: 'Gerente', email, password },
        seedDemoData: false,
      });
      setMessage('Reprovision OK');
      await load();
    } catch {
      setMessage('Error en reprovision');
    }
  }

  if (loading) return <p className="text-neutral-400">Cargando...</p>;
  if (!tenant) return <p className="text-red-400">Tenant no encontrado</p>;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link href="/tenants" className="text-sm text-neutral-400 hover:text-white">
          ← Tenants
        </Link>
        <h1 className="text-2xl font-semibold mt-2">{tenant.nombre}</h1>
        <p className="font-mono text-sm text-neutral-500">{tenant.slug}</p>
      </div>
      {message && <p className="text-sm text-neutral-300">{message}</p>}
      <form onSubmit={handleUpdate} className="space-y-4 rounded-lg border border-neutral-800 p-4">
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Nombre</label>
          <input name="nombre" defaultValue={tenant.nombre} className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Plan</label>
            <select name="plan" defaultValue={tenant.plan} className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm">
              <option value="trial">trial</option>
              <option value="basico">basico</option>
              <option value="profesional">profesional</option>
              <option value="enterprise">enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Status</label>
            <select name="status" defaultValue={tenant.status} className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm">
              <option value="activo">activo</option>
              <option value="suspendido">suspendido</option>
              <option value="eliminado">eliminado</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Page status</label>
          <select name="page_status" defaultValue={tenant.page_status} className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm">
            <option value="ACTIVA">ACTIVA</option>
            <option value="PAUSADA">PAUSADA</option>
            <option value="MANTENIMIENTO">MANTENIMIENTO</option>
            <option value="BLOQUEADA">BLOQUEADA</option>
          </select>
        </div>
        <p className="text-sm text-neutral-500">BD: {tenant.db_name ?? 'no provisionada'}</p>
        <button type="submit" className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
          Guardar
        </button>
      </form>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">Provisioning runs</h2>
          <button onClick={handleReprovision} className="text-sm text-neutral-300 hover:text-white">
            Reprovisionar
          </button>
        </div>
        <ul className="space-y-2 text-sm">
          {tenant.provisioningRuns.map((run) => (
            <li key={run.id} className="rounded border border-neutral-800 p-3">
              <span className={run.status === 'success' ? 'text-green-400' : run.status === 'error' ? 'text-red-400' : 'text-yellow-400'}>
                {run.status}
              </span>
              {run.error_message && <p className="text-neutral-500 mt-1">{run.error_message}</p>}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-medium mb-2">Dominios</h2>
        <ul className="text-sm text-neutral-400">
          {tenant.domains.map((d) => (
            <li key={d.domain}>{d.domain}{d.is_primary ? ' (primary)' : ''}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
