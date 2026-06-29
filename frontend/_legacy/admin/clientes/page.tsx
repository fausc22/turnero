'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClientes } from '@/hooks/useClientes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clienteSchema } from '@/lib/validations';

export default function ClientesPage() {
  const { user } = useAuth();
  const { clientes, loading, createCliente, deleteCliente } = useClientes(user?.barberia_id || null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(clienteSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      await createCliente(data);
      reset();
      setShowForm(false);
    } catch (error: any) {
      alert(error.message || 'Error al crear cliente');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await deleteCliente(id);
      } catch (error) {
        alert('Error al eliminar cliente');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Nuevo Cliente'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nuevo Cliente</CardTitle>
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

              <Button type="submit">Crear Cliente</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : clientes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No hay clientes
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientes.map((cliente) => (
            <Card key={cliente.id}>
              <CardHeader>
                <CardTitle>{cliente.nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                {cliente.email && <p className="text-sm text-gray-600">📧 {cliente.email}</p>}
                {cliente.telefono && <p className="text-sm text-gray-600">📞 {cliente.telefono}</p>}
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleDelete(cliente.id)}
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

