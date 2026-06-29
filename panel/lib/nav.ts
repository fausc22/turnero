import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  Scissors,
  Package,
  UserCircle,
  CalendarClock,
  Palette,
  BarChart3,
  Settings,
  Shield,
  CreditCard,
  ListOrdered,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/turnos', label: 'Turnos', icon: Clock },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/servicios', label: 'Servicios', icon: Scissors },
  { href: '/productos', label: 'Productos', icon: Package },
  { href: '/profesionales', label: 'Profesionales', icon: UserCircle },
  { href: '/horarios', label: 'Horarios', icon: CalendarClock },
  { href: '/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
  { href: '/personalizacion', label: 'Mi página', icon: Palette },
  { href: '/estadisticas', label: 'Estadísticas', icon: BarChart3 },
  { href: '/lista-espera', label: 'Lista de espera', icon: ListOrdered },
  { href: '/usuarios', label: 'Usuarios', icon: Shield },
];

export const MOBILE_NAV = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/turnos', label: 'Turnos', icon: Clock },
  { href: '/mas', label: 'Más', icon: Settings },
];
