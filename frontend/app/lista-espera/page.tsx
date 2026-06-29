'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { copy } from '@/lib/copy';
import { fetchServicios, createListaEspera, getApiErrorMessage } from '@/lib/api';

export default function ListaEsperaPage() {
  const { data: categorias, isLoading } = useQuery({
    queryKey: ['servicios'],
    queryFn: fetchServicios,
  });

  const [servicioIds, setServicioIds] = useState<number[]>([]);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      createListaEspera({
        servicioIds,
        fechaDesde,
        fechaHasta,
        cliente: { nombre, telefono, ...(email ? { email } : {}) },
      }),
    onSuccess: () => {
      setEnviado(true);
      toast.success(copy.listaEsperaEnviado);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const toggleServicio = (id: number) => {
    setServicioIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (enviado) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="text-xl font-semibold">{copy.listaEsperaEnviado}</h1>
        <Button className="mt-6" asChild>
          <Link href="/">{copy.volverInicio}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">{copy.listaEsperaTitulo}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy.listaEsperaDesc}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{copy.servicios}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}
          {categorias?.map((cat) =>
            cat.servicios.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={servicioIds.includes(s.id)}
                  onChange={() => toggleServicio(s.id)}
                />
                {s.nombre}
              </label>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label>Desde</Label>
            <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
          </div>
          <div>
            <Label>Hasta</Label>
            <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          </div>
          <div>
            <Label>Nombre</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>
          <div>
            <Label>Email (opcional)</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button
            className="w-full"
            disabled={
              mutation.isPending ||
              !servicioIds.length ||
              !fechaDesde ||
              !fechaHasta ||
              !nombre ||
              !telefono
            }
            onClick={() => mutation.mutate()}
          >
            {copy.confirmar}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
