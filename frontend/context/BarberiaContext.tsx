'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Barberia, EstilosBarberia } from '@/types';
import { barberiasApi } from '@/services/api/barberias';

interface BarberiaContextType {
  barberia: Barberia | null;
  estilos: EstilosBarberia | null;
  setBarberia: (barberia: Barberia | null) => void;
  loadBarberiaBySlug: (slug: string) => Promise<void>;
  loading: boolean;
}

const BarberiaContext = createContext<BarberiaContextType | undefined>(undefined);

export function BarberiaProvider({ children }: { children: React.ReactNode }) {
  const [barberia, setBarberiaState] = useState<Barberia | null>(null);
  const [estilos, setEstilos] = useState<EstilosBarberia | null>(null);
  const [loading, setLoading] = useState(false);

  const setBarberia = (newBarberia: Barberia | null) => {
    setBarberiaState(newBarberia);
    if (newBarberia) {
      loadEstilos(newBarberia.slug);
    } else {
      setEstilos(null);
    }
  };

  const loadEstilos = async (slug: string) => {
    try {
      const estilosData = await barberiasApi.getEstilos(slug);
      setEstilos(estilosData);
    } catch (error) {
      console.error('Error loading estilos:', error);
    }
  };

  const loadBarberiaBySlug = async (slug: string) => {
    setLoading(true);
    try {
      const barberiaData = await barberiasApi.findBySlug(slug);
      setBarberiaState(barberiaData);
      await loadEstilos(slug);
    } catch (error) {
      console.error('Error loading barberia:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BarberiaContext.Provider
      value={{
        barberia,
        estilos,
        setBarberia,
        loadBarberiaBySlug,
        loading,
      }}
    >
      {children}
    </BarberiaContext.Provider>
  );
}

export function useBarberia() {
  const context = useContext(BarberiaContext);
  if (context === undefined) {
    throw new Error('useBarberia must be used within a BarberiaProvider');
  }
  return context;
}

