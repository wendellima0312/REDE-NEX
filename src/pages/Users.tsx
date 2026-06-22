import { useEffect, useState } from 'react';
import {
  Users as UsersIcon, Search, Grid3X3, List, Plus,
  Mail, Building2, ChevronRight, UserCheck, UserX,
} from 'lucide-react';
import { getDepartments, getUsers } from '../lib/appApi';
import { Card } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

interface UserRow {
  id: string;
  name: string;
  email: string;
  photo_url?: string;
  position?: string;
  status: 'active' | 'inactive';
  admission_date?: string;
  departments?: { name: string } | null;
  roles?: { name: string } | null;
}

const ROLE_COLORS: Record<string, string> = {
  Administrador: 'bg-red-100 text-red-700',
  Gestor: 'bg-blue-100 text-blue-700',
  Editor: 'bg-amber-100 text-amber-700',
  Colaborador: 'bg-green-100 text-green-700',
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export function Users() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [nextUsers, nextDepartments] = await Promise.all([
      getUsers(),
      getDepartments(),
    ]);

    setUsers(nextUsers as unknown as UserRow[]);
    setDepartments(nextDepartments);
    setLoading(false);
  }

  const filtered = users.filter(u => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.position?.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'all' || u.departments?.name === filterDept;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchDept && matchStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Colaboradores</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestão de usuários e colaboradores</p>
        </div>
        <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors">
          <Plus size={14} /> Novo Colaborador
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: UsersIcon, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Ativos', value: stats.active, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inativos', value: stats.inactive, icon: UserX, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <Card key={s.label} className="p-4 border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar colaboradores..."
            className="w-full pl-9 pr-4 h-9 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
        >
          <option value="all">Todos os setores</option>
          {departments.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        {/* View toggle */}
        <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
          <button
            onClick={() => setView('cards')}
            className={`px-3 py-2 transition-colors ${view === 'cards' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Grid3X3 size={15} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-2 transition-colors ${view === 'list' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500">{filtered.length} colaborador(es) encontrado(s)</p>

      {/* Users display */}
      {view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="p-5 border-slate-200 text-center space-y-3">
                  <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-3 w-1/2 mx-auto" />
                </Card>
              ))
            : filtered.map(user => (
                <Card
                  key={user.id}
                  className="p-5 border-slate-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="text-center">
                    <div className="relative inline-block mb-3">
                      <img
                        src={user.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=64&background=ff7a00&color=fff`}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-slate-100"
                      />
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">{user.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{user.position || '-'}</p>
                    {user.roles?.name && (
                      <span className={`inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[user.roles.name] || 'bg-gray-100 text-gray-600'}`}>
                        {user.roles.name}
                      </span>
                    )}
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      {user.departments?.name && (
                        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                          <Building2 size={10} /> {user.departments.name}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 truncate">
                        <Mail size={10} /> {user.email}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
        </div>
      ) : (
        <Card className="border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Colaborador', 'Cargo', 'Setor', 'Perfil', 'Admissão', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : filtered.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=32&background=ff7a00&color=fff`}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                              <p className="text-[11px] text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{user.position || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{user.departments?.name || '-'}</td>
                        <td className="px-4 py-3">
                          {user.roles?.name ? (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[user.roles.name] || 'bg-gray-100 text-gray-600'}`}>
                              {user.roles.name}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                          {formatDate(user.admission_date)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {user.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <UsersIcon size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Nenhum colaborador encontrado</p>
          <p className="text-slate-400 text-sm mt-1">Tente ajustar os filtros de busca</p>
        </div>
      )}
    </div>
  );
}
