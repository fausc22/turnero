'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function NewTenantPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const { data } = await api.post('/api/super/tenants', {
        slug: form.get('slug'),
        nombre: form.get('nombre'),
        plan: form.get('plan'),
        gerente: {
          nombre: form.get('gerente_nombre'),
          email: form.get('gerente_email'),
          password: form.get('gerente_password'),
        },
        seedDemoData: form.get('seedDemoData') === 'on',
      });
      router.push(`/tenants/${data.data.id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message || 'Error al crear tenant';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/tenants" className="text-sm text-neutral-400 hover:text-white">
          ← Volver
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Nuevo tenant</h1>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Slug</label>
          <input name="slug" required className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Nombre comercial</label>
          <input name="nombre" required className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Plan</label>
          <select name="plan" className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm">
            <option value="trial">trial</option>
            <option value="basico">basico</option>
            <option value="profesional">profesional</option>
            <option value="enterprise">enterprise</option>
          </select>
        </div>
        <hr className="border-neutral-800" />
        <p className="text-sm font-medium">Gerente inicial</p>
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Nombre</label>
          <input name="gerente_nombre" required className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Email</label>
          <input name="gerente_email" type="email" required className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Contraseña</label>
          <input name="gerente_password" type="password" required minLength={8} className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input name="seedDemoData" type="checkbox" />
          Seed demo data
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {loading ? 'Provisionando...' : 'Crear tenant'}
        </button>
      </form>
    </div>
  );
}
