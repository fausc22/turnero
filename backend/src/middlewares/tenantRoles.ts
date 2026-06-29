import { requireTenantRole } from './requireTenantRole';

export { requireTenantRole };

export const gerenteOnly = requireTenantRole('GERENTE');
export const recepRead = requireTenantRole('GERENTE', 'RECEPCIONISTA');
export const recepWrite = requireTenantRole('GERENTE', 'RECEPCIONISTA');
export const agendaRead = requireTenantRole('GERENTE', 'RECEPCIONISTA', 'PROFESIONAL');
