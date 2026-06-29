'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  fetchPoliticasReserva,
  savePoliticasReserva,
  testMpConnection,
  fetchWhatsappStatus,
  reconnectWhatsapp,
  fetchNotificationFeatures,
  saveNotificationFeatures,
  fetchPlantillasNotificacion,
  savePlantillaNotificacion,
  type PlantillaNotificacion,
} from '@/lib/tenant-api';

const MODOS = [
  'SIN_PAGO',
  'SEÑA_PORCENTAJE',
  'SEÑA_FIJA',
  'PAGO_TOTAL',
  'PAGO_EN_LOCAL',
];

export default function ConfiguracionPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['politicas-reserva'],
    queryFn: fetchPoliticasReserva,
  });

  const { data: waStatus } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: fetchWhatsappStatus,
    refetchInterval: 15000,
  });

  const { data: notifFeatures } = useQuery({
    queryKey: ['notification-features'],
    queryFn: fetchNotificationFeatures,
  });

  const { data: plantillas } = useQuery({
    queryKey: ['plantillas-notificacion'],
    queryFn: fetchPlantillasNotificacion,
  });

  const [modoPago, setModoPago] = useState('SIN_PAGO');
  const [señaPorcentaje, setSeñaPorcentaje] = useState('');
  const [señaMontoFijo, setSeñaMontoFijo] = useState('');
  const [mpToken, setMpToken] = useState('');
  const [recordatorio24h, setRecordatorio24h] = useState(true);
  const [recordatorio2h, setRecordatorio2h] = useState(false);
  const [editingPlantilla, setEditingPlantilla] = useState<PlantillaNotificacion | null>(null);
  const [plantillaCuerpo, setPlantillaCuerpo] = useState('');

  useEffect(() => {
    if (!data) return;
    setModoPago(data.modoPago);
    setSeñaPorcentaje(data.señaPorcentaje != null ? String(data.señaPorcentaje) : '');
    setSeñaMontoFijo(data.señaMontoFijo != null ? String(data.señaMontoFijo) : '');
  }, [data]);

  useEffect(() => {
    if (!notifFeatures) return;
    setRecordatorio24h(notifFeatures.recordatorio24h);
    setRecordatorio2h(notifFeatures.recordatorio2h);
  }, [notifFeatures]);

  const saveMutation = useMutation({
    mutationFn: () =>
      savePoliticasReserva({
        modoPago,
        señaPorcentaje: señaPorcentaje ? Number(señaPorcentaje) : null,
        señaMontoFijo: señaMontoFijo ? Number(señaMontoFijo) : null,
        ...(mpToken ? { mpAccessToken: mpToken } : {}),
      }),
    onSuccess: () => {
      toast.success('Configuración guardada');
      setMpToken('');
      void qc.invalidateQueries({ queryKey: ['politicas-reserva'] });
    },
    onError: () => toast.error('Error al guardar'),
  });

  const testMutation = useMutation({
    mutationFn: () => testMpConnection(mpToken || undefined),
    onSuccess: () => toast.success('Conexión con Mercado Pago OK'),
    onError: () => toast.error('No se pudo conectar con Mercado Pago'),
  });

  const waReconnectMutation = useMutation({
    mutationFn: reconnectWhatsapp,
    onSuccess: () => toast.success('Señal de reconexión enviada al worker'),
    onError: () => toast.error('No se pudo solicitar reconexión'),
  });

  const featuresMutation = useMutation({
    mutationFn: () => saveNotificationFeatures({ recordatorio24h, recordatorio2h }),
    onSuccess: () => {
      toast.success('Recordatorios actualizados');
      void qc.invalidateQueries({ queryKey: ['notification-features'] });
    },
    onError: () => toast.error('Error al guardar recordatorios'),
  });

  const plantillaMutation = useMutation({
    mutationFn: () =>
      savePlantillaNotificacion(
        editingPlantilla!.tipo,
        editingPlantilla!.canal,
        plantillaCuerpo
      ),
    onSuccess: () => {
      toast.success('Plantilla guardada');
      setEditingPlantilla(null);
      void qc.invalidateQueries({ queryKey: ['plantillas-notificacion'] });
    },
    onError: () => toast.error('Error al guardar plantilla'),
  });

  if (isLoading) return <p className="text-muted-foreground">Cargando...</p>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Configuración</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Estado:</span>
            <Badge variant={waStatus?.connected ? 'default' : 'secondary'}>
              {waStatus?.connected ? 'Conectado' : 'Desconectado'}
            </Badge>
            {waStatus?.phone && (
              <span className="text-xs text-muted-foreground">({waStatus.phone})</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Ejecutá <code className="rounded bg-muted px-1">npm run worker:notifications -w backend</code> y escaneá el QR en la terminal.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => waReconnectMutation.mutate()}
            disabled={waReconnectMutation.isPending}
          >
            Reconectar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recordatorios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={recordatorio24h}
              onChange={(e) => setRecordatorio24h(e.target.checked)}
            />
            Recordatorio 24 horas antes
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={recordatorio2h}
              onChange={(e) => setRecordatorio2h(e.target.checked)}
            />
            Recordatorio 2 horas antes
          </label>
          <Button size="sm" onClick={() => featuresMutation.mutate()} disabled={featuresMutation.isPending}>
            Guardar recordatorios
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plantillas de notificación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {plantillas?.map((p) => (
            <div key={`${p.tipo}-${p.canal}`} className="flex items-center justify-between text-sm">
              <span>
                {p.tipo} · {p.canal}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingPlantilla(p);
                  setPlantillaCuerpo(p.cuerpo);
                }}
              >
                Editar
              </Button>
            </div>
          ))}
          {editingPlantilla && (
            <div className="mt-4 space-y-2 rounded-md border border-border p-3">
              <p className="text-xs font-medium">
                {editingPlantilla.tipo} / {editingPlantilla.canal}
              </p>
              <p className="text-xs text-muted-foreground">
                Placeholders: {'{{clienteNombre}}'}, {'{{fecha}}'}, {'{{hora}}'}, {'{{localNombre}}'}, {'{{linkGestion}}'}, {'{{direccion}}'}
              </p>
              <textarea
                className="min-h-[120px] w-full rounded-md border border-border bg-background p-2 text-sm"
                value={plantillaCuerpo}
                onChange={(e) => setPlantillaCuerpo(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => plantillaMutation.mutate()} disabled={plantillaMutation.isPending}>
                  Guardar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingPlantilla(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Políticas de pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Modo de pago</Label>
            <select
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={modoPago}
              onChange={(e) => setModoPago(e.target.value)}
            >
              {MODOS.map((m) => (
                <option key={m} value={m}>
                  {m.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {modoPago === 'SEÑA_PORCENTAJE' && (
            <div>
              <Label>Seña (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={señaPorcentaje}
                onChange={(e) => setSeñaPorcentaje(e.target.value)}
              />
            </div>
          )}

          {modoPago === 'SEÑA_FIJA' && (
            <div>
              <Label>Seña monto fijo ($)</Label>
              <Input
                type="number"
                min={1}
                value={señaMontoFijo}
                onChange={(e) => setSeñaMontoFijo(e.target.value)}
              />
            </div>
          )}

          {['SEÑA_PORCENTAJE', 'SEÑA_FIJA', 'PAGO_TOTAL'].includes(modoPago) && (
            <div>
              <Label>Access Token Mercado Pago</Label>
              {data?.mpConfigured && data.mpAccessTokenMasked && (
                <p className="mb-1 text-xs text-muted-foreground">
                  Configurado: {data.mpAccessTokenMasked}
                </p>
              )}
              <Input
                type="password"
                placeholder="TEST-... o APP_USR-..."
                value={mpToken}
                onChange={(e) => setMpToken(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              Guardar pagos
            </Button>
            {['SEÑA_PORCENTAJE', 'SEÑA_FIJA', 'PAGO_TOTAL'].includes(modoPago) && (
              <Button
                variant="outline"
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending}
              >
                Probar conexión MP
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
