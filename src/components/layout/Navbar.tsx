import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell, Search, ChevronDown, LogOut, User, Settings, X, Menu,
  LayoutDashboard, Newspaper, GraduationCap, BookOpen, Users, Shield,
  Megaphone, AlertTriangle, TrendingUp, Calendar,
  Wrench, Network, DollarSign, Headphones, Server,
  HeadphonesIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

const notifications = [
  { id: 1, title: 'Nova postagem no Feed', message: 'Pedro Henrique publicou um comunicado.', time: '5 min', read: false },
  { id: 2, title: 'Novo treinamento disponível', message: 'Configuração de ONU GPON foi publicado.', time: '2h', read: false },
  { id: 3, title: 'Wiki atualizada', message: 'Artigo "Processo de Cobrança" foi editado.', time: '1d', read: true },
];

interface NavItemDef {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  children?: { label: string; to: string; icon: typeof LayoutDashboard; description?: string }[];
}

const NAV_ITEMS: NavItemDef[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  {
    label: 'Feed',
    to: '/feed',
    icon: Newspaper,
    children: [
      { label: 'Todos', to: '/feed', icon: Newspaper, description: 'Todas as postagens' },
      { label: 'Comunicados', to: '/feed?type=announcement', icon: Megaphone, description: 'Comunicados internos' },
      { label: 'Avisos', to: '/feed?type=alert', icon: AlertTriangle, description: 'Avisos importantes' },
      { label: 'Atualizações', to: '/feed?type=update', icon: TrendingUp, description: 'Atualizações da empresa' },
      { label: 'Eventos', to: '/feed?type=event', icon: Calendar, description: 'Eventos corporativos' },
    ],
  },
  {
    label: 'Treinamentos',
    to: '/treinamentos',
    icon: GraduationCap,
    children: [
      { label: 'Suporte Técnico', to: '/treinamentos?cat=Suporte+Técnico', icon: Wrench },
      { label: 'NOC', to: '/treinamentos?cat=NOC', icon: Network },
      { label: 'Comercial', to: '/treinamentos?cat=Comercial', icon: TrendingUp },
      { label: 'Financeiro', to: '/treinamentos?cat=Financeiro', icon: DollarSign },
      { label: 'CSC', to: '/treinamentos?cat=CSC', icon: Headphones },
      { label: 'Infraestrutura', to: '/treinamentos?cat=Infraestrutura', icon: Server },
      { label: 'Recursos Humanos', to: '/treinamentos?cat=Recursos+Humanos', icon: Users },
    ],
  },
  {
    label: 'Wiki',
    to: '/wiki',
    icon: BookOpen,
    children: [
      { label: 'Atendimento', to: '/wiki?cat=Atendimento', icon: HeadphonesIcon, description: 'Procedimentos e scripts' },
      { label: 'Suporte Técnico', to: '/wiki?cat=Suporte+Técnico', icon: Wrench, description: 'GPON, OLT, ONU, Mesh' },
      { label: 'NOC', to: '/wiki?cat=NOC', icon: Network, description: 'Monitoramento e backbone' },
      { label: 'Financeiro', to: '/wiki?cat=Financeiro', icon: DollarSign, description: 'Cobrança e negociação' },
      { label: 'Comercial', to: '/wiki?cat=Comercial', icon: TrendingUp, description: 'Vendas e contratos' },
      { label: 'RH', to: '/wiki?cat=RH', icon: Users, description: 'Processos internos' },
    ],
  },
  { label: 'Colaboradores', to: '/colaboradores', icon: Users },
  { label: 'Permissões', to: '/permissoes', icon: Shield },
];

function DropdownNavItem({ item }: { item: NavItemDef }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative h-full flex items-center">
      <button
        onClick={() => setOpen(p => !p)}
        className={cn(
          'flex items-center gap-1.5 px-3 h-full text-sm font-medium transition-all duration-200 group relative',
          open
            ? 'text-orange-400 bg-white/10'
            : 'text-white/85 hover:text-white hover:bg-white/10'
        )}
      >
        <item.icon size={14} className={cn('transition-colors', open ? 'text-orange-400' : 'text-white/60 group-hover:text-white')} />
        {item.label}
        <ChevronDown
          size={12}
          className={cn('transition-transform duration-200 ml-0.5', open ? 'rotate-180 text-orange-400' : 'text-white/50')}
        />
        {open && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-0 w-64 bg-white rounded-b-xl shadow-2xl border border-slate-200/60 overflow-hidden z-50">
          <div className="h-0.5 w-full bg-orange-400" />
          <div className="py-1.5">
            {item.children?.map(child => (
              <button
                key={child.to}
                onClick={() => { navigate(child.to); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 active:bg-orange-100 transition-all duration-150 group text-left"
              >
                <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-orange-100 group-hover:scale-110 transition-all duration-200 flex-shrink-0">
                  <child.icon size={14} className="text-slate-500 group-hover:text-orange-600 transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-orange-700 transition-colors">{child.label}</p>
                  {child.description && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{child.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SimpleNavItem({ item }: { item: NavItemDef }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-1.5 px-3 h-full text-sm font-medium transition-all duration-200 group',
          isActive
            ? 'text-orange-400 bg-white/10'
            : 'text-white/85 hover:text-white hover:bg-white/10'
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon size={14} className={cn('transition-colors', isActive ? 'text-orange-400' : 'text-white/60 group-hover:text-white')} />
          {item.label}
          {isActive && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 rounded-full" />
          )}
        </>
      )}
    </NavLink>
  );
}

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const navigate = useNavigate();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14" style={{ background: 'linear-gradient(135deg, #0057b8 0%, #003d80 100%)' }}>
        <div className="flex items-center h-full px-4 gap-1">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 flex-shrink-0 mr-3 group">
            <div className="bg-white rounded-lg p-1 shadow-sm group-hover:shadow-md transition-shadow">
              <img
                src="/assets/images/logo_nextelecom-pagina-inicial.png"
                alt="Nex Telecom"
                className="h-6 w-auto"
              />
            </div>
            <span className="font-bold text-white text-sm hidden sm:block tracking-tight">
              Rede <span className="text-orange-400">Nex</span>
            </span>
          </NavLink>

          {/* Divider */}
          <div className="w-px h-6 bg-white/20 mx-1 hidden lg:block" />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-stretch h-full gap-0.5 flex-1 min-w-0">
            {NAV_ITEMS.map(item =>
              item.children ? (
                <DropdownNavItem key={item.to} item={item} />
              ) : (
                <SimpleNavItem key={item.to} item={item} />
              )
            )}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
            {/* Search */}
            <div className="hidden md:flex items-center">
              {searchOpen ? (
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Pesquisar..."
                      className="pl-8 pr-3 h-8 w-52 rounded-lg bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400/50 shadow-sm"
                      value={searchValue}
                      onChange={e => setSearchValue(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => { setSearchOpen(false); setSearchValue(''); }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200 active:scale-95"
                >
                  <Search size={17} />
                </button>
              )}
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200 active:scale-95">
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-orange-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold border border-blue-700 leading-none">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 shadow-2xl border-slate-200/60">
                <div className="h-0.5 bg-orange-400" />
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <span className="font-semibold text-sm text-slate-800">Notificações</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-medium bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      {unreadCount} novas
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={cn(
                        'px-4 py-3 border-b border-slate-50 cursor-pointer transition-all duration-150 hover:bg-slate-50 hover:pl-5',
                        !n.read && 'bg-orange-50/50'
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', !n.read ? 'bg-orange-500' : 'bg-transparent')} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{n.time} atrás</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-slate-100">
                  <button className="text-xs text-orange-600 hover:text-orange-700 font-medium w-full text-center transition-colors hover:underline">
                    Ver todas as notificações
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 group active:scale-95">
                  <img
                    src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=40"
                    alt="Avatar"
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-orange-400/70 group-hover:ring-orange-400 transition-all"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-white leading-none">Pedro Henrique</p>
                    <p className="text-[10px] text-white/60 leading-none mt-0.5">Administrador</p>
                  </div>
                  <ChevronDown size={12} className="text-white/50 hidden sm:block group-hover:text-white/80 transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 shadow-2xl border-slate-200/60">
                <div className="h-0.5 bg-orange-400" />
                <DropdownMenuItem className="gap-2 text-sm cursor-pointer hover:bg-orange-50 hover:text-orange-700 transition-colors">
                  <User size={13} /> Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-sm cursor-pointer hover:bg-orange-50 hover:text-orange-700 transition-colors">
                  <Settings size={13} /> Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-sm text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                  <LogOut size={13} /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(p => !p)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#003d80] shadow-xl">
            <div className="px-4 pt-3 pb-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  className="w-full pl-9 pr-4 h-9 rounded-lg bg-white/10 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 border border-white/10"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                />
              </div>
            </div>
            <nav className="px-3 pb-3 space-y-0.5">
              {NAV_ITEMS.map(item => (
                <div key={item.to}>
                  <button
                    onClick={() => { navigate(item.to); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-150"
                  >
                    <item.icon size={15} className="text-white/50" />
                    {item.label}
                    {item.children && <ChevronDown size={12} className="ml-auto text-white/30" />}
                  </button>
                  {item.children && (
                    <div className="ml-4 pl-3 border-l border-white/10 mt-0.5 mb-1 space-y-0.5">
                      {item.children.map(child => (
                        <button
                          key={child.to}
                          onClick={() => { navigate(child.to); setMobileMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:bg-white/10 hover:text-orange-400 transition-all duration-150"
                        >
                          <child.icon size={12} className="flex-shrink-0" />
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
