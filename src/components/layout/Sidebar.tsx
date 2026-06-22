import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  GraduationCap,
  BookOpen,
  Users,
  Shield,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  open: boolean;
}

const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/',
  },
  {
    label: 'Feed',
    icon: Newspaper,
    to: '/feed',
  },
  {
    label: 'Treinamentos',
    icon: GraduationCap,
    to: '/treinamentos',
  },
  {
    label: 'Wiki',
    icon: BookOpen,
    to: '/wiki',
  },
  {
    label: 'Colaboradores',
    icon: Users,
    to: '/colaboradores',
  },
  {
    label: 'Permissões',
    icon: Shield,
    to: '/permissoes',
  },
];

export function Sidebar({ open }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" />
      )}

      <aside
        className={cn(
          'fixed top-14 left-0 bottom-0 z-40 bg-white border-r border-slate-200 flex flex-col transition-all duration-200 ease-in-out overflow-hidden',
          open ? 'w-56' : 'w-0 lg:w-14'
        )}
      >
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin overflow-x-hidden">
          <ul className="space-y-0.5 px-2">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative',
                      isActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={17}
                        className={cn(
                          'flex-shrink-0 transition-colors',
                          isActive ? 'text-orange-500' : 'text-slate-500 group-hover:text-slate-700'
                        )}
                      />
                      <span
                        className={cn(
                          'whitespace-nowrap transition-all duration-200',
                          open ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:opacity-0 lg:w-0'
                        )}
                      >
                        {item.label}
                      </span>
                      {isActive && open && (
                        <ChevronRight size={13} className="ml-auto text-orange-400" />
                      )}
                      {/* Tooltip for collapsed state */}
                      {!open && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden lg:block">
                          {item.label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-slate-100 px-2 py-3 overflow-x-hidden">
          <NavLink
            to="/configuracoes"
            className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all duration-150"
          >
            <Settings size={17} className="flex-shrink-0" />
            <span
              className={cn(
                'whitespace-nowrap transition-all duration-200',
                open ? 'opacity-100 w-auto' : 'opacity-0 w-0'
              )}
            >
              Configurações
            </span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
