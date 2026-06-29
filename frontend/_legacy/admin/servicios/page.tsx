'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useServicios } from '@/hooks/useServicios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { servicioSchema } from '@/lib/validations';

export default function ServiciosPage() {
  const { user } = useAuth();
  const { servicios, loading, createServicio, deleteServicio } = useServicios(user?.barberia_id || null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(servicioSchema),
    defaultValues: {
      activo: true,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await createServicio({
        ...data,
        duracion_minutos: parseInt(data.duracion_minutos),
        precio: parseFloat(data.precio),
      });
      reset();
      setShowForm(false);
    } catch (error: any) {
      alert(error.message || 'Error al crear servicio');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        await deleteServicio(id);
      } catch (error) {
        alert('Error al eliminar servicio');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Servicios</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Nuevo Servicio'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nuevo Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" {...register('nombre')} />
                {errors.nombre && (
                  <p className="text-sm text-red-500 mt-1">{errors.nombre.message as string}</p>
                )}
              </div>

              <div>
                <Label htmlFor="duracion_minutos">Duración (minutos)</Label>
                <Input id="duracion_minutos" type="number" {...register('duracion_minutos', { valueAsNumber: true })} />
                {errors.duracion_minutos && (
                  <p className="text-sm text-red-500 mt-1">{errors.duracion_minutos.message as string}</p>
                )}
              </div>

              <div>
                <Label htmlFor="precio">Precio</Label>
                <Input id="precio" type="number" step="0.01" {...register('precio', { valueAsNumber: true })} />
                {errors.precio && (
                  <p className="text-sm text-red-500 mt-1">{errors.precio.message as string}</p>
                )}
              </div>

              <Button type="submit">Crear Servicio</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : servicios.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No hay servicios
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicios.map((servicio) => (
            <Card key={servicio.id}>
              <CardHeader>
                <CardTitle>{servicio.nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Duración: {servicio.duracion_minutos} min</p>
                <p className="text-lg font-bold mt-2">${servicio.precio}</p>
                <p className={`text-sm mt-2 ${servicio.activo ? 'text-green-600' : 'text-red-600'}`}>
                  {servicio.activo ? 'Activo' : 'Inactivo'}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleDelete(servicio.id)}
                >
                  Eliminar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

