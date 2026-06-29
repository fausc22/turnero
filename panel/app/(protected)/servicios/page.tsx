'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchServicios,
  saveServicio,
  fetchCategoriasServicio,
  saveCategoriaServicio,
  type CategoriaServicio,
} from '@/lib/tenant-api';
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

interface Servicio {
  id: number;
  nombre: string;
  duracionMinutos: number;
  precio: number;
  activo: number;
  categoriaId?: number | null;
  categoriaNombre?: string | null;
}

export default function ServiciosPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [editId, setEditId] = useState<number | undefined>();
  const [editCat, setEditCat] = useState<CategoriaServicio | null>(null);
  const [nombre, setNombre] = useState('');
  const [duracion, setDuracion] = useState('30');
  const [precio, setPrecio] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [catNombre, setCatNombre] = useState('');

  const { data: servicios = [] } = useQuery({
    queryKey: ['servicios'],
    queryFn: () => fetchServicios() as Promise<Servicio[]>,
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias-servicio'],
    queryFn: fetchCategoriasServicio,
  });

  const grouped = useMemo(() => {
    const map = new Map<string, Servicio[]>();
    for (const s of servicios) {
      const key = s.categoriaNombre || 'Sin categoría';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries());
  }, [servicios]);

  const mutation = useMutation({
    mutationFn: () =>
      saveServicio(
        {
          nombre,
          duracionMinutos: Number(duracion),
          precio: Number(precio),
          categoriaId: categoriaId ? Number(categoriaId) : null,
        },
        editId
      ),
    onSuccess: () => {
      toast.success('Guardado');
      void qc.invalidateQueries({ queryKey: ['servicios'] });
      setOpen(false);
    },
    onError: () => toast.error('Error'),
  });

  const catMutation = useMutation({
    mutationFn: () => saveCategoriaServicio({ nombre: catNombre }, editCat?.id),
    onSuccess: () => {
      toast.success('Categoría guardada');
      void qc.invalidateQueries({ queryKey: ['categorias-servicio'] });
      setCatOpen(false);
    },
    onError: () => toast.error('Error'),
  });

  function edit(s: Servicio) {
    setEditId(s.id);
    setNombre(s.nombre);
    setDuracion(String(s.duracionMinutos));
    setPrecio(String(s.precio));
    setCategoriaId(s.categoriaId ? String(s.categoriaId) : '');
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Servicios</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setEditCat(null); setCatNombre(''); setCatOpen(true); }}>
            Nueva categoría
          </Button>
          <Button
            onClick={() => {
              setEditId(undefined);
              setNombre('');
              setDuracion('30');
              setPrecio('');
              setCategoriaId('');
              setOpen(true);
            }}
          >
            Nuevo servicio
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categorias.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant="secondary"
            onClick={() => { setEditCat(c); setCatNombre(c.nombre); setCatOpen(true); }}
          >
            {c.nombre}
          </Button>
        ))}
      </div>

      {grouped.map(([cat, items]) => (
        <div key={cat} className="space-y-2">
          <h2 className="text-lg font-medium">{cat}</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">Duración</th>
                  <th className="px-3 py-2 text-left">Precio</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="px-3 py-2">{s.nombre}</td>
                    <td className="px-3 py-2">{s.duracionMinutos} min</td>
                    <td className="px-3 py-2">${s.precio}</td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="ghost" onClick={() => edit(s)}>
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nombre</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div>
              <Label>Categoría</Label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Duración (min)</Label>
              <Input type="number" value={duracion} onChange={(e) => setDuracion(e.target.value)} />
            </div>
            <div>
              <Label>Precio</Label>
              <Input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => mutation.mutate()} disabled={!nombre || mutation.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCat ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Nombre</Label>
            <Input value={catNombre} onChange={(e) => setCatNombre(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={() => catMutation.mutate()} disabled={!catNombre || catMutation.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
