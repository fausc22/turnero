'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchUsuarios,
  saveUsuario,
  patchUsuarioActivo,
  fetchProfesionales,
  type PanelUsuario,
} from '@/lib/tenant-api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function UsuariosPage() {
  const { usuario } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<PanelUsuario | null>(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('RECEPCIONISTA');
  const [profesionalId, setProfesionalId] = useState<string>('');

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: fetchUsuarios,
  });

  const { data: profesionales = [] } = useQuery({
    queryKey: ['profesionales'],
    queryFn: fetchProfesionales,
  });

  const mutation = useMutation({
    mutationFn: () =>
      saveUsuario(
        {
          nombre,
          email,
          ...(password ? { password } : {}),
          rol,
          profesionalId: rol === 'PROFESIONAL' ? Number(profesionalId) : null,
        },
        edit?.id
      ),
    onSuccess: () => {
      toast.success('Guardado');
      void qc.invalidateQueries({ queryKey: ['usuarios'] });
      setOpen(false);
    },
    onError: () => toast.error('Error al guardar'),
  });

  const toggleActivo = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => patchUsuarioActivo(id, activo),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: () => toast.error('No se pudo cambiar el estado'),
  });

  function openCreate() {
    setEdit(null);
    setNombre('');
    setEmail('');
    setPassword('');
    setRol('RECEPCIONISTA');
    setProfesionalId('');
    setOpen(true);
  }

  function openEdit(u: PanelUsuario) {
    setEdit(u);
    setNombre(u.nombre);
    setEmail(u.email);
    setPassword('');
    setRol(u.rol);
    setProfesionalId(u.profesionalId ? String(u.profesionalId) : '');
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <Button onClick={openCreate}>Nuevo usuario</Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Rol</th>
              <th className="px-3 py-2 text-left">Profesional</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-border/50">
                <td className="px-3 py-2">{u.nombre}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">
                  <Badge variant="secondary">{u.rol}</Badge>
                </td>
                <td className="px-3 py-2">{u.profesionalNombre ?? '—'}</td>
                <td className="px-3 py-2">{u.activo ? 'Activo' : 'Inactivo'}</td>
                <td className="px-3 py-2 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(u)}>
                    Editar
                  </Button>
                  {u.id !== usuario?.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActivo.mutate({ id: u.id, activo: !u.activo })}
                    >
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nombre</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>{edit ? 'Nueva contraseña (opcional)' : 'Contraseña'}</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <Label>Rol</Label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
              >
                <option value="GERENTE">Gerente</option>
                <option value="RECEPCIONISTA">Recepcionista</option>
                <option value="PROFESIONAL">Profesional</option>
              </select>
            </div>
            {rol === 'PROFESIONAL' && (
              <div>
                <Label>Profesional vinculado</Label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={profesionalId}
                  onChange={(e) => setProfesionalId(e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {profesionales.map((p: { id: number; nombre: string }) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
