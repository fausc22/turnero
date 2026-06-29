'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { BookingStepper } from './BookingStepper';
import { StickyBookingSummary } from './StickyBookingSummary';
import { ServiceCard } from './ServiceCard';
import { ProfessionalPicker } from './ProfessionalPicker';
import { WeekDateStrip } from './WeekDateStrip';
import { TimeSlotGrid } from './TimeSlotGrid';
import { ClienteForm } from './ClienteForm';
import { WizardSkeleton } from '@/components/layout/LoadingSkeleton';
import { useTenant } from '@/context/TenantContext';
import {
  useCreateReserva,
  useDisponibilidad,
  useProfesionales,
  useServicios,
} from '@/hooks/public/usePublicQueries';
import { useBookingStore } from '@/stores/bookingStore';
import { buildDateRange, canConfirmWithoutMp } from '@/lib/dates';
import { copy } from '@/lib/copy';
import { formatFechaHora, formatPrecio } from '@/lib/format';
import { createPaymentPreference, getApiErrorCode, getApiErrorMessage } from '@/lib/api';
import { calcMontoDisplay, paymentButtonLabel, requiresMercadoPago } from '@/lib/pagos';
import type { ModoPago } from '@/types/public';
import { getTenantSlug } from '@/lib/tenant-client';
import type { ServicioPublico } from '@/types/public';
import type { ClienteFormValues } from '@/lib/validations/reserva';

function flattenServicios(
  categorias: { servicios: ServicioPublico[] }[] | undefined
): ServicioPublico[] {
  if (!categorias) return [];
  return categorias.flatMap((c) => c.servicios);
}

export function BookingWizard() {
  const router = useRouter();
  const qc = useQueryClient();
  const { config, bookingEnabled } = useTenant();
  const { data: serviciosData, isLoading: loadingServicios } = useServicios();
  const { data: profesionales, isLoading: loadingPros } = useProfesionales();
  const createReserva = useCreateReserva();

  const {
    step,
    servicioIds,
    profesionalId,
    fecha,
    slot,
    cliente,
    setStep,
    nextStep,
    prevStep,
    toggleServicio,
    setProfesionalId,
    setFecha,
    setSlot,
    setCliente,
    ensureIdempotencyKey,
  } = useBookingStore();

  const servicios = useMemo(() => flattenServicios(serviciosData), [serviciosData]);
  const maxDias = config?.politicas?.anticipacionMaximaDias ?? 30;
  const dates = useMemo(() => buildDateRange(maxDias), [maxDias]);

  const { data: slots = [], isLoading: loadingSlots } = useDisponibilidad(
    fecha,
    servicioIds,
    profesionalId,
    step >= 3
  );

  useEffect(() => {
    if (!bookingEnabled) router.replace('/');
  }, [bookingEnabled, router]);

  useEffect(() => {
    if (step === 5) ensureIdempotencyKey();
  }, [step, ensureIdempotencyKey]);

  useEffect(() => {
    if (!fecha && dates.length) setFecha(dates[0].value);
  }, [fecha, dates, setFecha]);

  if (!bookingEnabled) return null;
  if (loadingServicios) return <WizardSkeleton />;

  const selectedServicios = servicios.filter((s) => servicioIds.includes(s.id));
  const totalPrecio = selectedServicios.reduce((s, x) => s + x.precio, 0);
  const modoPago = (config?.politicas?.modoPago ?? 'SIN_PAGO') as ModoPago;
  const pagoOnline = config?.politicas?.pagoOnlineDisponible ?? false;
  const sinMp = canConfirmWithoutMp(modoPago);
  const montoPago = calcMontoDisplay(modoPago, totalPrecio, config?.politicas ?? null);
  const puedeConfirmar = sinMp || pagoOnline;

  const handleConfirm = async () => {
    if (!slot || !cliente.nombre || !cliente.telefono) return;
    const key = ensureIdempotencyKey();
    try {
      const result = await createReserva.mutateAsync({
        idempotencyKey: key,
        body: {
          servicioIds,
          profesionalId: slot.profesionalId ?? profesionalId,
          fechaInicio: slot.fechaInicio,
          cliente: {
            nombre: cliente.nombre!,
            telefono: cliente.telefono!,
            email: cliente.email || undefined,
          },
          notas: cliente.notas,
          idempotencyKey: key,
        },
      });

      if (result.estado === 'PENDIENTE' && requiresMercadoPago(modoPago) && pagoOnline) {
        const pref = await createPaymentPreference({
          turnoId: result.turnoId,
          tokenGestion: result.tokenGestion,
        });
        window.location.href = pref.initPoint;
        return;
      }

      router.push(`/confirmacion?token=${result.tokenGestion}`);
    } catch (err) {
      if (getApiErrorCode(err) === 'SLOT_TAKEN') {
        toast.error(copy.slotOcupado);
        setStep(3);
        void qc.invalidateQueries({
          queryKey: ['tenant', getTenantSlug(), 'disponibilidad'],
        });
        return;
      }
      toast.error(getApiErrorMessage(err) || 'No pudimos confirmar la reserva. Intentá de nuevo.');
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <BookingStepper current={step} />

      {step === 1 && (
        <div className="space-y-3">
          <h1 className="text-xl font-semibold">{copy.servicios}</h1>
          {servicios.map((s) => (
            <ServiceCard
              key={s.id}
              servicio={s}
              selected={servicioIds.includes(s.id)}
              onToggle={() => toggleServicio(s.id)}
            />
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">{copy.profesional}</h1>
          {loadingPros ? (
            <WizardSkeleton />
          ) : (
            <ProfessionalPicker
              profesionales={profesionales ?? []}
              servicioIds={servicioIds}
              value={profesionalId}
              onChange={setProfesionalId}
            />
          )}
          <Button variant="outline" onClick={prevStep}>
            {copy.volver}
          </Button>
          <Button className="w-full" onClick={nextStep}>
            {copy.continuar}
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">{copy.fechaHora}</h1>
          <WeekDateStrip dates={dates} selected={fecha} onSelect={setFecha} />
          <TimeSlotGrid
            slots={slots}
            selected={slot}
            onSelect={setSlot}
            isLoading={loadingSlots}
          />
          <Button variant="outline" onClick={prevStep}>
            {copy.volver}
          </Button>
          <Button className="w-full" disabled={!slot} onClick={nextStep}>
            {copy.continuar}
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">{copy.tusDatos}</h1>
          <ClienteForm
            defaultValues={cliente}
            onSubmit={(data: ClienteFormValues) => {
              setCliente(data);
              nextStep();
            }}
          />
          <Button variant="outline" onClick={prevStep}>
            {copy.volver}
          </Button>
          <Button type="submit" form="cliente-form" className="w-full">
            {copy.continuar}
          </Button>
        </div>
      )}

      {step === 5 && slot && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold">{copy.resumen}</h1>
          <div className="space-y-2 rounded-lg border border-border bg-card p-4 text-sm">
            <p>
              <span className="text-muted-foreground">Servicios: </span>
              {selectedServicios.map((s) => s.nombre).join(', ')}
            </p>
            <p>
              <span className="text-muted-foreground">Horario: </span>
              {formatFechaHora(slot.fechaInicio)}
            </p>
            {slot.profesionalNombre && (
              <p>
                <span className="text-muted-foreground">Profesional: </span>
                {slot.profesionalNombre}
              </p>
            )}
            <p>
              <span className="text-muted-foreground">Cliente: </span>
              {cliente.nombre} · {cliente.telefono}
            </p>
            <p className="font-medium">Total: {formatPrecio(totalPrecio)}</p>
          </div>
          {requiresMercadoPago(modoPago) && !pagoOnline && (
            <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              {copy.pagoOnlineProximamente}
            </p>
          )}
          {pagoOnline && montoPago != null && (
            <p className="text-sm text-muted-foreground">
              {paymentButtonLabel(modoPago, montoPago)} con Mercado Pago
            </p>
          )}
          <Button variant="outline" onClick={prevStep}>
            {copy.volver}
          </Button>
          <Button
            className="w-full"
            disabled={!puedeConfirmar || createReserva.isPending}
            onClick={() => void handleConfirm()}
          >
            {createReserva.isPending
              ? 'Procesando...'
              : pagoOnline && requiresMercadoPago(modoPago) && montoPago != null
                ? paymentButtonLabel(modoPago, montoPago)
                : copy.confirmar}
          </Button>
        </div>
      )}

      {step === 1 && (
        <StickyBookingSummary
          servicios={servicios}
          selectedIds={servicioIds}
          canContinue={servicioIds.length > 0}
          onContinue={nextStep}
        />
      )}
    </div>
  );
}
