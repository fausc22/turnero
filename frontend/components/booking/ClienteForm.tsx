'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { clienteFormSchema, type ClienteFormValues } from '@/lib/validations/reserva';
import { copy } from '@/lib/copy';

export function ClienteForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: Partial<ClienteFormValues>;
  onSubmit: (data: ClienteFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      nombre: '',
      telefono: '',
      email: '',
      notas: '',
      aceptaPolitica: undefined,
      ...defaultValues,
    },
  });

  const acepta = watch('aceptaPolitica');

  return (
    <form id="cliente-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" {...register('nombre')} />
        {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input id="telefono" type="tel" placeholder="11 2345 6789" {...register('telefono')} />
        {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email (opcional)</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="notas">Notas (opcional)</Label>
        <Textarea id="notas" {...register('notas')} />
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="politica"
          checked={acepta === true}
          onCheckedChange={(v) => setValue('aceptaPolitica', v === true ? true : (undefined as never))}
        />
        <Label htmlFor="politica" className="text-sm leading-snug text-muted-foreground">
          {copy.politicaCancelacion}
        </Label>
      </div>
      {errors.aceptaPolitica && (
        <p className="text-sm text-destructive">{errors.aceptaPolitica.message}</p>
      )}
    </form>
  );
}
