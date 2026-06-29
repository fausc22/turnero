'use client';

import { use, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { fetchCliente, fetchClienteHistorial, saveClienteFull } from '@/lib/tenant-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ESTADO_STYLES } from '@/lib/agenda-utils';
import { cn } from '@/lib/utils';

const TAG_PRESETS = ['VIP', 'moroso', 'nuevo'];

export default function ClienteFichaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const clienteId = Number(id);
  const qc = useQueryClient();

  const { data: cliente, isLoading } = useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: () =>
      fetchCliente(clienteId) as Promise<{
        id: number;
        nombre: string;
        telefono: string | null;
        email: string | null;
        notasInternas: string | null;
        tags: string[];
        puntosMembresia?: number;
        totalGastado?: number;
        ultimaVisita?: string | null;
      }>,
  });

  const { data: historial = [] } = useQuery({
    queryKey: ['cliente-historial', clienteId],
    queryFn: () =>
      fetchClienteHistorial(clienteId) as Promise<
        { id: number; fechaInicio: string; estado: string; precioTotal: number }[]
      >,
  });

  const [notas, setNotas] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!cliente) return;
    setNotas(cliente.notasInternas ?? '');
    setTags(cliente.tags ?? []);
  }, [cliente]);

  const saveMutation = useMutation({
    mutationFn: () => saveClienteFull({ notasInternas: notas, tags }, clienteId),
    onSuccess: () => {
      toast.success('Ficha actualizada');
      void qc.invalidateQueries({ queryKey: ['cliente', clienteId] });
    },
    onError: () => toast.error('Error al guardar'),
  });

  function addTag(tag: string) {
    const t = tag.trim();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput('');
  }

  if (isLoading) return <p className="text-muted-foreground">Cargando...</p>;
  if (!cliente) return <p>Cliente no encontrado</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/clientes">
          <Button variant="outline" size="sm">
            ← Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">{cliente.nombre}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4 text-sm">
            <p className="text-muted-foreground">Total gastado</p>
            <p className="text-xl font-semibold">${(cliente.totalGastado ?? 0).toLocaleString('es-AR')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-sm">
            <p className="text-muted-foreground">Última visita</p>
            <p className="text-xl font-semibold">
              {cliente.ultimaVisita
                ? format(new Date(cliente.ultimaVisita), 'dd/MM/yyyy')
                : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-sm">
            <p className="text-muted-foreground">Puntos membresía</p>
            <p className="text-xl font-semibold">{cliente.puntosMembresia ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos de contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Teléfono: {cliente.telefono ?? '—'}</p>
          <p>Email: {cliente.email ?? '—'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CRM — notas y tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Notas internas</Label>
            <textarea
              className="mt-1 min-h-[80px] w-full rounded-md border border-border bg-background p-2 text-sm"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
          <div>
            <Label>Tags</Label>
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                >
                  {t} ×
                </Badge>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {TAG_PRESETS.map((t) => (
                <Button key={t} type="button" size="sm" variant="outline" onClick={() => addTag(t)}>
                  + {t}
                </Button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Nuevo tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag(tagInput)}
              />
              <Button type="button" variant="outline" onClick={() => addTag(tagInput)}>
                Agregar
              </Button>
            </div>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            Guardar ficha
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de turnos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {historial.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin turnos previos</p>
          )}
          {historial.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm"
            >
              <span>{format(new Date(t.fechaInicio), 'dd/MM/yyyy HH:mm')}</span>
              <Badge variant="outline" className={cn('text-[10px]', ESTADO_STYLES[t.estado])}>
                {t.estado}
              </Badge>
              <span>${t.precioTotal}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
