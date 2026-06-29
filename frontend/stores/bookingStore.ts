import { create } from 'zustand';
import type { Slot } from '@/types/public';
import type { ClienteFormValues } from '@/lib/validations/reserva';

export type BookingStep = 1 | 2 | 3 | 4 | 5;

interface BookingState {
  step: BookingStep;
  servicioIds: number[];
  profesionalId: number | null;
  fecha: string | null;
  slot: Slot | null;
  cliente: Partial<ClienteFormValues>;
  idempotencyKey: string | null;
  setStep: (step: BookingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleServicio: (id: number) => void;
  setProfesionalId: (id: number | null) => void;
  setFecha: (fecha: string) => void;
  setSlot: (slot: Slot | null) => void;
  setCliente: (data: Partial<ClienteFormValues>) => void;
  ensureIdempotencyKey: () => string;
  reset: () => void;
}

const initialState = {
  step: 1 as BookingStep,
  servicioIds: [] as number[],
  profesionalId: null as number | null,
  fecha: null as string | null,
  slot: null as Slot | null,
  cliente: {} as Partial<ClienteFormValues>,
  idempotencyKey: null as string | null,
};

export const useBookingStore = create<BookingState>((set, get) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(5, s.step + 1) as BookingStep })),
  prevStep: () => set((s) => ({ step: Math.max(1, s.step - 1) as BookingStep })),
  toggleServicio: (id) =>
    set((s) => ({
      servicioIds: s.servicioIds.includes(id)
        ? s.servicioIds.filter((x) => x !== id)
        : [...s.servicioIds, id],
    })),
  setProfesionalId: (id) => set({ profesionalId: id }),
  setFecha: (fecha) => set({ fecha, slot: null }),
  setSlot: (slot) => set({ slot }),
  setCliente: (data) => set((s) => ({ cliente: { ...s.cliente, ...data } })),
  ensureIdempotencyKey: () => {
    const current = get().idempotencyKey;
    if (current) return current;
    const key = crypto.randomUUID();
    set({ idempotencyKey: key });
    return key;
  },
  reset: () => set({ ...initialState }),
}));
