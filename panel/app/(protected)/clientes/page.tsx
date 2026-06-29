'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchClientes, saveCliente } from '@/lib/tenant-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Cliente {
  id: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
}

export default function ClientesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | undefined>();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes', search],
    queryFn: () => fetchClientes(search || undefined) as Promise<Cliente[]>,
  });

  const mutation = useMutation({
    mutationFn: () => saveCliente({ nombre, telefono, email: email || undefined }, editId),
    onSuccess: () => {
      toast.success(editId ? 'Cliente actualizado' : 'Cliente creado');
      void qc.invalidateQueries({ queryKey: ['clientes'] });
      setModalOpen(false);
    },
    onError: () => toast.error('Error al guardar'),
  });

  function openCreate() {
    setEditId(undefined);
    setNombre('');
    setTelefono('');
    setEmail('');
    setModalOpen(true);
  }

  function openEdit(c: Cliente) {
    setEditId(c.id);
    setNombre(c.nombre);
    setTelefono(c.telefono ?? '');
    setEmail(c.email ?? '');
    setModalOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <Button onClick={openCreate}>Nuevo cliente</Button>
      </div>
      <Input
        placeholder="Buscar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Teléfono</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-muted-foreground">
                  Cargando...
                </td>
              </tr>
            )}
            {clientes.map((c) => (
              <tr key={c.id} className="border-b border-border/50">
                <td className="px-3 py-2">
                  <Link href={`/clientes/${c.id}`} className="text-primary hover:underline">
                    {c.nombre}
                  </Link>
                </td>
                <td className="px-3 py-2">{c.telefono ?? '—'}</td>
                <td className="px-3 py-2">{c.email ?? '—'}</td>
                <td className="px-3 py-2 text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nombre</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => mutation.mutate()} disabled={!nombre || mutation.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
