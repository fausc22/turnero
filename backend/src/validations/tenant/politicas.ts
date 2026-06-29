import { z } from 'zod';

const modoPagoEnum = z.enum([
  'SIN_PAGO',
  'SEÑA_PORCENTAJE',
  'SEÑA_FIJA',
  'PAGO_TOTAL',
  'PAGO_EN_LOCAL',
]);

export const updatePoliticasSchema = z
  .object({
    anticipacionMinimaMinutos: z.number().int().min(0).optional(),
    anticipacionMaximaDias: z.number().int().min(1).max(365).optional(),
    cancelacionHorasMinimas: z.number().int().min(0).optional(),
    bufferMinutos: z.number().int().min(0).optional(),
    slotGranularidadMinutos: z.number().int().min(5).max(60).optional(),
    modoPago: modoPagoEnum.optional(),
    señaPorcentaje: z.number().min(1).max(100).nullable().optional(),
    señaMontoFijo: z.number().positive().nullable().optional(),
    mpAccessToken: z.string().max(500).nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.modoPago === 'SEÑA_PORCENTAJE' && data.señaPorcentaje === undefined) return true;
      if (data.modoPago === 'SEÑA_PORCENTAJE' && data.señaPorcentaje != null) return true;
      return data.modoPago !== 'SEÑA_PORCENTAJE' || data.señaPorcentaje != null;
    },
    { message: 'señaPorcentaje requerido para SEÑA_PORCENTAJE' }
  );

export const listPagosQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  estado: z.enum(['PAGADO', 'FALLIDO', 'DEVUELTO', 'PENDIENTE']).optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});
