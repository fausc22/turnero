'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  completeOnboarding,
  saveTenantMeta,
  saveTenantEstilos,
} from '@/lib/tenant-api';
import { setPanelSession, getPanelToken, getPanelRefreshToken, getTenantSlug } from '@/lib/auth-storage';
import type { StoredUser } from '@/lib/auth-storage';

const STEPS = [
  'Datos del local',
  'Colores de marca',
  'Horarios',
  'Pagos y políticas',
  '¡Listo!',
];

interface Props {
  usuario: StoredUser;
  onComplete: () => void;
}

export function OnboardingWizard({ usuario, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [colorPrimario, setColorPrimario] = useState('#6366f1');

  const saveMetaMutation = useMutation({
    mutationFn: () => saveTenantMeta({ nombre, telefono, direccion }),
  });

  const saveEstilosMutation = useMutation({
    mutationFn: () => saveTenantEstilos({ colorPrimario }),
  });

  const completeMutation = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: (data) => {
      const token = getPanelToken();
      const refresh = getPanelRefreshToken();
      const slug = getTenantSlug();
      if (token && refresh && slug) {
        setPanelSession({
          token,
          refreshToken: refresh,
          tenantSlug: slug,
          usuario: { ...usuario, ...data, onboardingCompletado: true },
        });
      }
      toast.success('¡Configuración inicial lista!');
      onComplete();
    },
    onError: () => toast.error('No se pudo completar el onboarding'),
  });

  async function handleNext() {
    if (step === 0) {
      if (!nombre.trim()) {
        toast.error('Ingresá el nombre del local');
        return;
      }
      await saveMetaMutation.mutateAsync();
    }
    if (step === 1) {
      await saveEstilosMutation.mutateAsync();
    }
    if (step === STEPS.length - 1) {
      await completeMutation.mutateAsync();
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <Dialog open>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Configurá tu local — paso {step + 1} de {STEPS.length}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{STEPS[step]}</p>

        {step === 0 && (
          <div className="space-y-3">
            <div>
              <Label>Nombre comercial</Label>
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
          </div>
        )}

        {step === 1 && (
          <div>
            <Label>Color principal</Label>
            <Input type="color" value={colorPrimario} onChange={(e) => setColorPrimario(e.target.value)} className="h-10 w-full" />
          </div>
        )}

        {step === 2 && (
          <p className="text-sm">
            Configurá tus horarios en{' '}
            <Link href="/horarios" className="text-primary underline">
              Horarios operativos
            </Link>
            .
          </p>
        )}

        {step === 3 && (
          <p className="text-sm">
            Revisá pagos y políticas en{' '}
            <Link href="/configuracion" className="text-primary underline">
              Configuración
            </Link>
            .
          </p>
        )}

        {step === 4 && (
          <p className="text-sm text-muted-foreground">
            Tu página de reservas ya está lista. Podés personalizar más en Mi página.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          {step > 0 && step < STEPS.length - 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Atrás
            </Button>
          )}
          <Button
            onClick={() => void handleNext()}
            disabled={saveMetaMutation.isPending || saveEstilosMutation.isPending || completeMutation.isPending}
          >
            {step === STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
