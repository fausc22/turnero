'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProductos } from '@/hooks/useProductos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productoSchema } from '@/lib/validations';

export default function ProductosPage() {
  const { user } = useAuth();
  const { productos, loading, createProducto, deleteProducto } = useProductos(user?.barberia_id || null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      stock_actual: 0,
      activo: true,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await createProducto({
        ...data,
        precio: parseFloat(data.precio),
        stock_actual: parseInt(data.stock_actual),
      });
      reset();
      setShowForm(false);
    } catch (error: any) {
      alert(error.message || 'Error al crear producto');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProducto(id);
      } catch (error) {
        alert('Error al eliminar producto');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Nuevo Producto'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nuevo Producto</CardTitle>
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
                <Label htmlFor="precio">Precio</Label>
                <Input id="precio" type="number" step="0.01" {...register('precio', { valueAsNumber: true })} />
                {errors.precio && (
                  <p className="text-sm text-red-500 mt-1">{errors.precio.message as string}</p>
                )}
              </div>

              <div>
                <Label htmlFor="stock_actual">Stock Inicial</Label>
                <Input id="stock_actual" type="number" {...register('stock_actual', { valueAsNumber: true })} />
                {errors.stock_actual && (
                  <p className="text-sm text-red-500 mt-1">{errors.stock_actual.message as string}</p>
                )}
              </div>

              <Button type="submit">Crear Producto</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : productos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No hay productos
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productos.map((producto) => (
            <Card key={producto.id}>
              <CardHeader>
                <CardTitle>{producto.nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">${producto.precio}</p>
                <p className="text-sm text-gray-600 mt-2">Stock: {producto.stock_actual}</p>
                <p className={`text-sm mt-2 ${producto.activo ? 'text-green-600' : 'text-red-600'}`}>
                  {producto.activo ? 'Activo' : 'Inactivo'}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleDelete(producto.id)}
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

