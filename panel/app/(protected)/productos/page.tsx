'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchProductos, saveProducto } from '@/lib/tenant-api';
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

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stockActual: number;
}

export default function ProductosPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | undefined>();
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('0');

  const { data: productos = [] } = useQuery({
    queryKey: ['productos'],
    queryFn: () => fetchProductos() as Promise<Producto[]>,
  });

  const mutation = useMutation({
    mutationFn: () =>
      saveProducto(
        { nombre, precio: Number(precio), stockActual: Number(stock) },
        editId
      ),
    onSuccess: () => {
      toast.success('Guardado');
      void qc.invalidateQueries({ queryKey: ['productos'] });
      setOpen(false);
    },
    onError: () => toast.error('Error'),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Button
          onClick={() => {
            setEditId(undefined);
            setNombre('');
            setPrecio('');
            setStock('0');
            setOpen(true);
          }}
        >
          Nuevo
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Precio</th>
              <th className="px-3 py-2 text-left">Stock</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className="border-b border-border/50">
                <td className="px-3 py-2">{p.nombre}</td>
                <td className="px-3 py-2">${p.precio}</td>
                <td className="px-3 py-2">{p.stockActual}</td>
                <td className="px-3 py-2 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditId(p.id);
                      setNombre(p.nombre);
                      setPrecio(String(p.precio));
                      setStock(String(p.stockActual));
                      setOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nombre</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div>
              <Label>Precio</Label>
              <Input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} />
            </div>
            <div>
              <Label>Stock</Label>
              <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
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
