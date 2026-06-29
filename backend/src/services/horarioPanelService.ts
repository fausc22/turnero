import * as horarioRepo from '../repositories/tenant/horarioOperativoRepository';
import * as bloqueoRepo from '../repositories/tenant/bloqueoRepository';
import { NotFoundError } from '../utils/errors';

function mapHorario(row: horarioRepo.HorarioOperativoRow) {
  return {
    id: row.id,
    diaSemana: row.dia_semana,
    horaInicio: row.hora_inicio,
    horaFin: row.hora_fin,
    profesionalId: row.profesional_id,
  };
}

function mapBloqueo(row: bloqueoRepo.BloqueoRow) {
  return {
    id: row.id,
    fechaInicio: new Date(row.fecha_inicio).toISOString(),
    fechaFin: new Date(row.fecha_fin).toISOString(),
    motivo: row.motivo,
    profesionalId: row.profesional_id,
  };
}

export async function listHorarios() {
  const rows = await horarioRepo.listAll();
  return rows.map(mapHorario);
}

export async function replaceHorarioDay(input: {
  diaSemana: number;
  profesionalId?: number | null;
  franjas: { horaInicio: string; horaFin: string; profesionalId?: number | null }[];
}) {
  await horarioRepo.replaceDay(input.diaSemana, input.franjas, input.profesionalId);
  const rows = await horarioRepo.findByDiaSemana(input.diaSemana, input.profesionalId);
  return rows.map(mapHorario);
}

export async function deleteHorario(id: number) {
  const all = await horarioRepo.listAll();
  if (!all.find((h) => h.id === id)) throw new NotFoundError('Horario');
  await horarioRepo.deleteById(id);
  return { id };
}

export async function listBloqueos(filters: {
  from?: string;
  to?: string;
  profesionalId?: number;
}) {
  const rows = await bloqueoRepo.list({
    from: filters.from ? new Date(filters.from) : undefined,
    to: filters.to ? new Date(filters.to) : undefined,
    profesionalId: filters.profesionalId,
  });
  return rows.map(mapBloqueo);
}

export async function createBloqueo(input: {
  fechaInicio: string;
  fechaFin: string;
  motivo?: string;
  profesionalId?: number | null;
}) {
  const id = await bloqueoRepo.create({
    fechaInicio: new Date(input.fechaInicio),
    fechaFin: new Date(input.fechaFin),
    motivo: input.motivo,
    profesionalId: input.profesionalId,
  });
  const rows = await bloqueoRepo.list();
  const created = rows.find((b) => b.id === id)!;
  return mapBloqueo(created);
}

export async function deleteBloqueo(id: number) {
  const rows = await bloqueoRepo.list();
  if (!rows.find((b) => b.id === id)) throw new NotFoundError('Bloqueo');
  await bloqueoRepo.deleteById(id);
  return { id };
}
