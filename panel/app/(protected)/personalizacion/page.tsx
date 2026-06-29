'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TenantPreview } from '@/components/personalizacion/TenantPreview';
import {
  fetchTenantMeta,
  fetchTenantEstilos,
  saveTenantMeta,
  saveTenantEstilos,
  geocodeTenantDireccion,
  uploadTenantMedia,
} from '@/lib/tenant-api';
import api from '@/lib/api';

export default function PersonalizacionPage() {
  const qc = useQueryClient();
  const { data: meta, isLoading: loadingMeta } = useQuery({
    queryKey: ['tenant-meta'],
    queryFn: fetchTenantMeta,
  });
  const { data: estilos, isLoading: loadingEstilos } = useQuery({
    queryKey: ['tenant-estilos'],
    queryFn: fetchTenantEstilos,
  });

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [textoBienvenida, setTextoBienvenida] = useState('');
  const [colorPrimario, setColorPrimario] = useState('#6366f1');
  const [colorAcento, setColorAcento] = useState('#818cf8');

  useEffect(() => {
    if (!meta) return;
    setNombre(meta.nombre);
    setTelefono(meta.telefono ?? '');
    setDireccion(meta.direccion ?? '');
    setTextoBienvenida(meta.textoBienvenida ?? '');
  }, [meta]);

  useEffect(() => {
    if (!estilos) return;
    setColorPrimario(estilos.colorPrimario ?? '#6366f1');
    setColorAcento(estilos.colorAcento ?? '#818cf8');
  }, [estilos]);

  const saveMetaMutation = useMutation({
    mutationFn: () =>
      saveTenantMeta({
        nombre,
        telefono: telefono || null,
        direccion: direccion || null,
        textoBienvenida: textoBienvenida || null,
      }),
    onSuccess: () => {
      toast.success('Datos guardados');
      void qc.invalidateQueries({ queryKey: ['tenant-meta'] });
    },
    onError: () => toast.error('Error al guardar'),
  });

  const saveEstilosMutation = useMutation({
    mutationFn: () => saveTenantEstilos({ colorPrimario, colorAcento }),
    onSuccess: () => {
      toast.success('Estilos guardados');
      void qc.invalidateQueries({ queryKey: ['tenant-estilos'] });
    },
    onError: () => toast.error('Error al guardar estilos'),
  });

  const geocodeMutation = useMutation({
    mutationFn: geocodeTenantDireccion,
    onSuccess: () => {
      toast.success('Ubicación geocodificada');
      void qc.invalidateQueries({ queryKey: ['tenant-meta'] });
    },
    onError: () => toast.error('No se pudo geocodificar (¿OPENCAGE_API_KEY?)'),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ type, file }: { type: 'logo' | 'hero' | 'favicon'; file: File }) =>
      uploadTenantMedia(type, file),
    onSuccess: () => {
      toast.success('Imagen subida');
      void qc.invalidateQueries({ queryKey: ['tenant-estilos'] });
    },
    onError: () => toast.error('Error al subir imagen'),
  });

  const apiBase = api.defaults.baseURL ?? '';
  const heroPreview = estilos?.heroPath ? `${apiBase}/api/tenant/media/hero` : null;

  if (loadingMeta || loadingEstilos) {
    return <p className="text-muted-foreground">Cargando...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Mi página</h1>

      <TenantPreview
        nombre={nombre}
        textoBienvenida={textoBienvenida}
        colorPrimario={colorPrimario}
        heroPreviewUrl={heroPreview}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del local</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Nombre</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>
          <div>
            <Label>Dirección</Label>
            <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => geocodeMutation.mutate()}
            disabled={geocodeMutation.isPending || !direccion}
          >
            Geocodificar dirección
          </Button>
          <div>
            <Label>Texto de bienvenida</Label>
            <textarea
              className="mt-1 min-h-[80px] w-full rounded-md border border-border bg-background p-2 text-sm"
              value={textoBienvenida}
              onChange={(e) => setTextoBienvenida(e.target.value)}
            />
          </div>
          <Button onClick={() => saveMetaMutation.mutate()} disabled={saveMetaMutation.isPending}>
            Guardar datos
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Colores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Color principal</Label>
              <Input type="color" value={colorPrimario} onChange={(e) => setColorPrimario(e.target.value)} className="h-10" />
            </div>
            <div>
              <Label>Color acento</Label>
              <Input type="color" value={colorAcento} onChange={(e) => setColorAcento(e.target.value)} className="h-10" />
            </div>
          </div>
          <Button onClick={() => saveEstilosMutation.mutate()} disabled={saveEstilosMutation.isPending}>
            Guardar colores
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Imágenes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(['logo', 'hero', 'favicon'] as const).map((type) => (
            <div key={type} className="flex items-center gap-3">
              <Label className="w-20 capitalize">{type}</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadMutation.mutate({ type, file: f });
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
