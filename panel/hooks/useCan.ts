export type PanelRol = 'GERENTE' | 'RECEPCIONISTA' | 'PROFESIONAL';

export type PanelAction =
  | 'turnos.view'
  | 'turnos.create'
  | 'turnos.edit'
  | 'clientes.view'
  | 'clientes.edit'
  | 'servicios.manage'
  | 'productos.manage'
  | 'profesionales.manage'
  | 'usuarios.manage'
  | 'estadisticas.view'
  | 'lista-espera.view'
  | 'configuracion.manage'
  | 'personalizacion.manage';

const NAV_PERMISSIONS: Record<string, PanelRol[]> = {
  '/dashboard': ['GERENTE', 'RECEPCIONISTA', 'PROFESIONAL'],
  '/agenda': ['GERENTE', 'RECEPCIONISTA', 'PROFESIONAL'],
  '/turnos': ['GERENTE', 'RECEPCIONISTA', 'PROFESIONAL'],
  '/clientes': ['GERENTE', 'RECEPCIONISTA'],
  '/servicios': ['GERENTE'],
  '/productos': ['GERENTE'],
  '/profesionales': ['GERENTE'],
  '/horarios': ['GERENTE'],
  '/pagos': ['GERENTE', 'RECEPCIONISTA'],
  '/personalizacion': ['GERENTE'],
  '/estadisticas': ['GERENTE', 'RECEPCIONISTA'],
  '/configuracion': ['GERENTE'],
  '/usuarios': ['GERENTE'],
  '/lista-espera': ['GERENTE', 'RECEPCIONISTA'],
};

const ACTION_PERMISSIONS: Record<PanelAction, PanelRol[]> = {
  'turnos.view': ['GERENTE', 'RECEPCIONISTA', 'PROFESIONAL'],
  'turnos.create': ['GERENTE', 'RECEPCIONISTA'],
  'turnos.edit': ['GERENTE', 'RECEPCIONISTA'],
  'clientes.view': ['GERENTE', 'RECEPCIONISTA'],
  'clientes.edit': ['GERENTE', 'RECEPCIONISTA'],
  'servicios.manage': ['GERENTE'],
  'productos.manage': ['GERENTE'],
  'profesionales.manage': ['GERENTE'],
  'usuarios.manage': ['GERENTE'],
  'estadisticas.view': ['GERENTE', 'RECEPCIONISTA'],
  'lista-espera.view': ['GERENTE', 'RECEPCIONISTA'],
  'configuracion.manage': ['GERENTE'],
  'personalizacion.manage': ['GERENTE'],
};

export function canNav(href: string, rol: string | undefined): boolean {
  if (!rol) return false;
  const allowed = NAV_PERMISSIONS[href];
  if (!allowed) return true;
  return allowed.includes(rol as PanelRol);
}

export function can(action: PanelAction, rol: string | undefined): boolean {
  if (!rol) return false;
  const allowed = ACTION_PERMISSIONS[action];
  return allowed?.includes(rol as PanelRol) ?? false;
}

export function useCan(action: PanelAction, rol: string | undefined): boolean {
  return can(action, rol);
}

export function useCanNav(href: string, rol: string | undefined): boolean {
  return canNav(href, rol);
}

export function useCanManageCatalog(rol: string | undefined): boolean {
  return can('servicios.manage', rol);
}
