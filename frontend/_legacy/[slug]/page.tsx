'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBarberia } from '@/context/BarberiaContext';
import { useServicios } from '@/hooks/useServicios';
import { useProductos } from '@/hooks/useProductos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Servicio, Producto } from '@/types';

export default function BarberiaPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { barberia, estilos, loadBarberiaBySlug, loading } = useBarberia();
  const { servicios } = useServicios(barberia?.id || null, true);
  const { productos } = useProductos(barberia?.id || null, true);
  const [selectedServicios, setSelectedServicios] = useState<number[]>([]);
  const [selectedProductos, setSelectedProductos] = useState<Record<number, number>>({});

  useEffect(() => {
    if (slug) {
      loadBarberiaBySlug(slug);
    }
  }, [slug]);

  const toggleServicio = (servicioId: number) => {
    setSelectedServicios(prev =>
      prev.includes(servicioId)
        ? prev.filter(id => id !== servicioId)
        : [...prev, servicioId]
    );
  };

  const toggleProducto = (productoId: number) => {
    setSelectedProductos(prev => {
      if (prev[productoId]) {
        const newState = { ...prev };
        delete newState[productoId];
        return newState;
      }
      return { ...prev, [productoId]: 1 };
    });
  };

  const updateProductoCantidad = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      const newState = { ...selectedProductos };
      delete newState[productoId];
      setSelectedProductos(newState);
    } else {
      setSelectedProductos(prev => ({ ...prev, [productoId]: cantidad }));
    }
  };

  const calcularTotal = () => {
    let total = 0;
    selectedServicios.forEach(servicioId => {
      const servicio = servicios.find(s => s.id === servicioId);
      if (servicio) total += parseFloat(servicio.precio.toString());
    });
    Object.entries(selectedProductos).forEach(([productoId, cantidad]) => {
      const producto = productos.find(p => p.id === parseInt(productoId));
      if (producto) total += parseFloat(producto.precio.toString()) * cantidad;
    });
    return total;
  };

  const handleContinuar = () => {
    const data = {
      servicios: selectedServicios,
      productos: Object.entries(selectedProductos).map(([id, cantidad]) => ({
        producto_id: parseInt(id),
        cantidad,
      })),
    };
    sessionStorage.setItem('reserva', JSON.stringify(data));
    router.push(`/${slug}/reservar`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!barberia) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Barbería no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{barberia.nombre}</h1>
          {estilos?.texto_bienvenida && (
            <p className="text-gray-600">{estilos.texto_bienvenida}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Servicios</CardTitle>
                <CardDescription>Selecciona los servicios que deseas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {servicios.map((servicio) => (
                  <div
                    key={servicio.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedServicios.includes(servicio.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleServicio(servicio.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{servicio.nombre}</p>
                        <p className="text-sm text-gray-500">
                          {servicio.duracion_minutos} min
                        </p>
                      </div>
                      <p className="font-bold">${servicio.precio}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
                <CardDescription>Agrega productos adicionales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {productos.map((producto) => (
                  <div
                    key={producto.id}
                    className="p-4 border rounded-lg border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-medium">{producto.nombre}</p>
                        <p className="text-sm text-gray-500">
                          Stock: {producto.stock_actual}
                        </p>
                      </div>
                      <p className="font-bold">${producto.precio}</p>
                    </div>
                    {selectedProductos[producto.id] ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateProductoCantidad(producto.id, selectedProductos[producto.id] - 1)}
                        >
                          -
                        </Button>
                        <span className="w-12 text-center">{selectedProductos[producto.id]}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateProductoCantidad(producto.id, selectedProductos[producto.id] + 1)}
                          disabled={selectedProductos[producto.id] >= producto.stock_actual}
                        >
                          +
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleProducto(producto.id)}
                        disabled={producto.stock_actual === 0}
                        className="w-full"
                      >
                        Agregar
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Servicios seleccionados:</p>
                  {selectedServicios.length === 0 ? (
                    <p className="text-sm text-gray-400">Ninguno</p>
                  ) : (
                    <ul className="space-y-1">
                      {selectedServicios.map(servicioId => {
                        const servicio = servicios.find(s => s.id === servicioId);
                        return servicio ? (
                          <li key={servicioId} className="text-sm flex justify-between">
                            <span>{servicio.nombre}</span>
                            <span>${servicio.precio}</span>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Productos seleccionados:</p>
                  {Object.keys(selectedProductos).length === 0 ? (
                    <p className="text-sm text-gray-400">Ninguno</p>
                  ) : (
                    <ul className="space-y-1">
                      {Object.entries(selectedProductos).map(([productoId, cantidad]) => {
                        const producto = productos.find(p => p.id === parseInt(productoId));
                        return producto ? (
                          <li key={productoId} className="text-sm flex justify-between">
                            <span>{producto.nombre} x{cantidad}</span>
                            <span>${parseFloat(producto.precio.toString()) * cantidad}</span>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-bold">${calcularTotal().toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={handleContinuar}
                    disabled={selectedServicios.length === 0 && Object.keys(selectedProductos).length === 0}
                    className="w-full"
                  >
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

