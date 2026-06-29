'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchProfesionales, fetchServicios, saveProfesional } from '@/lib/tenant-api';
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

interface Profesional {
  id: number;
  nombre: string;
  especialidad: string | null;
  fotoPath: string | null;
  servicioIds: number[];
}

export default function ProfesionalesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | undefined>();
  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [fotoPath, setFotoPath] = useState('');
  const [servicioIds, setServicioIds] = useState<number[]>([]);

  const { data: profesionales = [] } = useQuery({
    queryKey: ['profesionales'],
    queryFn: () => fetchProfesionales() as Promise<Profesional[]>,
  });
  const { data: servicios = [] } = useQuery({
    queryKey: ['servicios'],
    queryFn: () => fetchServicios() as Promise<{ id: number; nombre: string }[]>,
  });

  const mutation = useMutation({
    mutationFn: () =>
      saveProfesional(
        { nombre, especialidad: especialidad || undefined, fotoPath: fotoPath || undefined, servicioIds },
        editId
      ),
    onSuccess: () => {
      toast.success('Guardado');
      void qc.invalidateQueries({ queryKey: ['profesionales'] });
      setOpen(false);
    },
    onError: () => toast.error('Error'),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Profesionales</h1>
        <Button
          onClick={() => {
            setEditId(undefined);
            setNombre('');
            setEspecialidad('');
            setFotoPath('');
            setServicioIds([]);
            setOpen(true);
          }}
        >
          Nuevo
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {profesionales.map((p) => (
          <div key={p.id} className="rounded-lg border border-border p-4">
            {p.fotoPath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.fotoPath} alt="" className="mb-2 h-16 w-16 rounded-full object-cover" />
            )}
            <p className="font-medium">{p.nombre}</p>
            {p.especialidad && <p className="text-sm text-muted-foreground">{p.especialidad}</p>}
            <Button size="sm" variant="ghost" className="mt-2" onClick={() => {
              setEditId(p.id);
              setNombre(p.nombre);
              setEspecialidad(p.especialidad ?? '');
              setFotoPath(p.fotoPath ?? '');
              setServicioIds(p.servicioIds);
              setOpen(true);
            }}>
              Editar
            </Button>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar profesional' : 'Nuevo profesional'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nombre</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div>
              <Label>Especialidad</Label>
              <Input value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} />
            </div>
            <div>
              <Label>Foto (URL)</Label>
              <Input value={fotoPath} onChange={(e) => setFotoPath(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>Servicios</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {servicios.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setServicioIds((prev) =>
                        prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id]
                      )
                    }
                    className={`rounded border px-2 py-0.5 text-xs ${servicioIds.includes(s.id) ? 'border-primary bg-primary/20' : 'border-border'}`}
                  >
                    {s.nombre}
                  </button>
                ))}
              </div>
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
