import { executeTenantMutation } from '../../config/tenantDatabase';

export async function insertAudit(data: {
  usuarioId: number | null;
  accion: string;
  entidad: string;
  entidadId?: number | null;
  datosPrevios?: unknown;
  datosNuevos?: unknown;
}): Promise<void> {
  await executeTenantMutation(
    `INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, datos_previos, datos_nuevos)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.usuarioId ?? null,
      data.accion,
      data.entidad,
      data.entidadId ?? null,
      data.datosPrevios ? JSON.stringify(data.datosPrevios) : null,
      data.datosNuevos ? JSON.stringify(data.datosNuevos) : null,
    ]
  );
}
