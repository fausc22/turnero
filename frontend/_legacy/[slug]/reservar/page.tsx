'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBarberia } from '@/context/BarberiaContext';
import { useClientes } from '@/hooks/useClientes';
import { turnosApi } from '@/services/api/turnos';
import { pagosApi } from '@/services/api/pagos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clienteSchema } from '@/lib/validations';
import { addDays, format, setHours, setMinutes } from 'date-fns';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export default function ReservarPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { barberia } = useBarberia();
  const { createCliente } = useClientes(barberia?.id || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clienteSchema),
  });

  useEffect(() => {
    // Cargar script de Mercado Pago
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const generarHorariosDisponibles = () => {
    if (!selectedDate) return [];
    const horarios = [];
    for (let hora = 9; hora <= 18; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        horarios.push(`${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`);
      }
    }
    return horarios;
  };

  const onSubmit = async (data: any) => {
    if (!barberia || !selectedDate || !selectedTime) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Crear o buscar cliente
      let clienteId: number;
      try {
        const cliente = await createCliente(data);
        clienteId = cliente.id;
      } catch (err: any) {
        // Si el cliente ya existe, buscar por email
        // Por simplicidad, asumimos que se crea nuevo
        throw err;
      }

      // Obtener datos de la reserva del sessionStorage
      const reservaData = sessionStorage.getItem('reserva');
      if (!reservaData) {
        throw new Error('No se encontraron datos de la reserva');
      }

      const { servicios, productos } = JSON.parse(reservaData);

      // Crear fecha inicio y fin
      const [hora, minuto] = selectedTime.split(':').map(Number);
      const fechaInicio = setMinutes(setHours(selectedDate, hora), minuto);
      
      // Calcular duración total (asumiendo 30 min por servicio, simplificado)
      const duracionTotal = servicios.length * 30;
      const fechaFin = addDays(fechaInicio, 0);
      fechaFin.setMinutes(fechaFin.getMinutes() + duracionTotal);

      // Crear turno
      const turno = await turnosApi.create({
        cliente_id: clienteId,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        servicios,
        productos,
      });

      // Crear preferencia de pago
      const backUrl = window.location.origin;
      const preference = await pagosApi.createPreference({
        turnoId: turno.id,
        backUrl,
      });

      // Inicializar checkout de Mercado Pago
      if (window.MercadoPago) {
        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '');
        mp.checkout({
          preference: {
            id: preference.id,
          },
          render: {
            container: '.cho-container',
            label: 'Pagar',
          },
        });
      } else {
        // Redirigir a la URL de checkout
        window.location.href = preference.init_point;
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la reserva');
      setLoading(false);
    }
  };

  const minDate = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Reservar Turno</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" {...register('nombre')} />
                {errors.nombre && (
                  <p className="text-sm text-red-500 mt-1">{errors.nombre.message as string}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email (opcional)</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message as string}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono (opcional)</Label>
                <Input id="telefono" {...register('telefono')} />
                {errors.telefono && (
                  <p className="text-sm text-red-500 mt-1">{errors.telefono.message as string}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fecha y Hora</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  min={minDate}
                  onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
                />
              </div>

              {selectedDate && (
                <div>
                  <Label htmlFor="hora">Hora *</Label>
                  <select
                    id="hora"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="">Selecciona una hora</option>
                    {generarHorariosDisponibles().map((hora) => (
                      <option key={hora} value={hora}>
                        {hora}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Volver
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Procesando...' : 'Continuar al Pago'}
            </Button>
          </div>
        </form>

        <div className="cho-container mt-6"></div>
      </div>
    </div>
  );
}

