import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, GraduationCap, BookOpen, Newspaper,
  TrendingUp, Bell, AlertCircle, ChevronRight, ArrowUpRight,
  CheckCircle2, Activity, Target, BarChart3,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

interface Stats {
  users: number;
  trainings: number;
  articles: number;
  posts: number;
}

interface RecentPost {
  id: string;
  title: string | null;
  content: string;
  type: string;
  created_at: string;
  users?: { name: string; photo_url?: string; position?: string };
}

const typeConfig: Record<string, { label: string; color: string; icon: typeof Bell }> = {
  announcement: { label: 'Comunicado', color: 'bg-blue-100 text-blue-700', icon: Bell },
  alert: { label: 'Aviso', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  update: { label: 'Atualização', color: 'bg-green-100 text-green-700', icon: TrendingUp },
  event: { label: 'Evento', color: 'bg-purple-100 text-purple-700', icon: Bell },
  message: { label: 'Mensagem', color: 'bg-gray-100 text-gray-700', icon: Bell },
  poll: { label: 'Enquete', color: 'bg-amber-100 text-amber-700', icon: Bell },
};

const statCards = [
  {
    label: 'Colaboradores',
    key: 'users' as const,
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    to: '/colaboradores',
    change: '+2 este mês',
    trend: 'up',
  },
  {
    label: 'Treinamentos',
    key: 'trainings' as const,
    icon: GraduationCap,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    to: '/treinamentos',
    change: '+1 esta semana',
    trend: 'up',
  },
  {
    label: 'Artigos Wiki',
    key: 'articles' as const,
    icon: BookOpen,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    to: '/wiki',
    change: '+3 este mês',
    trend: 'up',
  },
  {
    label: 'Postagens',
    key: 'posts' as const,
    icon: Newspaper,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    to: '/feed',
    change: '+4 esta semana',
    trend: 'up',
  },
];

const progressData = [
  { name: 'Suporte Técnico', completed: 8, total: 12, color: '#ff7a00' },
  { name: 'NOC', completed: 5, total: 8, color: '#0057b8' },
  { name: 'Comercial', completed: 6, total: 7, color: '#16a34a' },
  { name: 'Financeiro', completed: 3, total: 5, color: '#9333ea' },
];

const adoptionData = [
  { day: 'Seg', feed: 12, wiki: 8, training: 5 },
  { day: 'Ter', feed: 18, wiki: 11, training: 9 },
  { day: 'Qua', feed: 16, wiki: 16, training: 12 },
  { day: 'Qui', feed: 25, wiki: 19, training: 14 },
  { day: 'Sex', feed: 31, wiki: 23, training: 18 },
  { day: 'Sáb', feed: 22, wiki: 18, training: 11 },
  { day: 'Dom', feed: 15, wiki: 14, training: 8 },
];

const knowledgeData = [
  { area: 'Atendimento', artigos: 18, treinamentos: 9 },
  { area: 'Suporte', artigos: 24, treinamentos: 12 },
  { area: 'NOC', artigos: 14, treinamentos: 8 },
  { area: 'Comercial', artigos: 11, treinamentos: 7 },
  { area: 'Financeiro', artigos: 9, treinamentos: 5 },
];

const chartSummary = [
  { label: 'Engajamento semanal', value: '87%', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Meta de leitura', value: '72%', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Conteúdos ativos', value: '76', icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50' },
];

const fallbackStats: Stats = {
  users: 42,
  trainings: 18,
  articles: 31,
  posts: 24,
};

const fallbackRecentPosts: RecentPost[] = [
  {
    id: 'fallback-post-1',
    title: 'WIKI NEX 2.0 publicada',
    content: 'Nova base de conhecimento operacional já está disponível para consulta por área.',
    type: 'announcement',
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    users: { name: 'Pedro Henrique', position: 'Administrador' },
  },
  {
    id: 'fallback-post-2',
    title: 'Revisão dos processos críticos',
    content: 'Atendimento, suporte e financeiro receberam novos padrões de documentação.',
    type: 'update',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    users: { name: 'Ana Beatriz Santos', position: 'Gestora de RH' },
  },
  {
    id: 'fallback-post-3',
    title: 'Treinamentos por área atualizados',
    content: 'As trilhas de suporte técnico e NOC foram reorganizadas no painel.',
    type: 'message',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    users: { name: 'Mariana Costa', position: 'Analista de NOC' },
  },
];

function buildLinePath(values: number[], max: number, width = 680, height = 220) {
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function buildAreaPath(values: number[], max: number, width = 680, height = 220) {
  const line = buildLinePath(values, max, width, height);
  return `${line} L ${width} ${height} L 0 ${height} Z`;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({ users: 0, trainings: 0, articles: 0, posts: 0 });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await Promise.race([
          Promise.all([
            supabase.from('users').select('id', { count: 'exact', head: true }),
            supabase.from('trainings').select('id', { count: 'exact', head: true }).eq('status', 'published'),
            supabase.from('wiki_articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
            supabase.from('posts').select('id', { count: 'exact', head: true }),
            supabase
              .from('posts')
              .select('id, title, content, type, created_at, users(name, photo_url, position)')
              .order('created_at', { ascending: false })
              .limit(5),
          ]),
          new Promise<null>(resolve => {
            window.setTimeout(() => resolve(null), 1800);
          }),
        ]);

        if (!result) {
          setStats(fallbackStats);
          setRecentPosts(fallbackRecentPosts);
          return;
        }

        const [usersRes, trainingsRes, articlesRes, postsRes, recentPostsRes] = result;
        const nextStats = {
          users: usersRes.count ?? 0,
          trainings: trainingsRes.count ?? 0,
          articles: articlesRes.count ?? 0,
          posts: postsRes.count ?? 0,
        };

        setStats(Object.values(nextStats).some(Boolean) ? nextStats : fallbackStats);
        setRecentPosts(
          recentPostsRes.data?.length
            ? recentPostsRes.data as unknown as RecentPost[]
            : fallbackRecentPosts
        );
      } catch {
        setStats(fallbackStats);
        setRecentPosts(fallbackRecentPosts);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard NEX 2.0</h1>
            <Badge className="bg-orange-100 text-orange-700 border-0">Operação ao vivo</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">Visão executiva de comunicação, conhecimento e treinamento da Rede Nex</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/70 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Dados sincronizados com fallback inteligente
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Link to={card.to} key={card.key}>
            <Card className="p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</p>
                  {loading ? (
                    <Skeleton className="h-8 w-16 mt-2" />
                  ) : (
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stats[card.key]}</p>
                  )}
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingUp size={10} />
                    {card.change}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <card.icon size={20} className={card.color} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)] gap-6">
        <Card className="border-slate-200 overflow-hidden">
          <div className="flex flex-col gap-4 px-5 py-4 border-b border-slate-100 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Activity size={17} className="text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-800">Pulso da Plataforma</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">Uso de feed, wiki e treinamentos nos últimos 7 dias</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {chartSummary.map(item => (
                <div key={item.label} className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-md ${item.bg}`}>
                      <item.icon size={13} className={item.color} />
                    </span>
                    <span className="text-base font-bold text-slate-900">{item.value}</span>
                  </div>
                  <p className="mt-1 truncate text-[10px] font-medium text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="h-72 px-2 py-4">
            <DashboardLineChart />
          </div>
        </Card>

        <Card className="border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 size={17} className="text-orange-500" />
              <h2 className="text-sm font-semibold text-slate-800">Mapa de Conhecimento</h2>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border-0">NEX 2.0</Badge>
          </div>
          <div className="h-72 px-2 py-4">
            <KnowledgeBarChart />
          </div>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent posts */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Newspaper size={16} className="text-orange-500" />
                <h2 className="text-sm font-semibold text-slate-800">Últimas Postagens</h2>
              </div>
              <Link to="/feed" className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 font-medium">
                Ver tudo <ChevronRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 px-5 py-4">
                      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                : recentPosts.map(post => {
                    const type = typeConfig[post.type] || typeConfig.message;
                    return (
                      <div key={post.id} className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50/70 transition-colors">
                        <img
                          src={post.users?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.users?.name || 'U')}&size=40&background=ff7a00&color=fff`}
                          alt={post.users?.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800">{post.users?.name}</span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${type.color}`}>
                              {type.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{post.title || post.content}</p>
                          <p className="text-[11px] text-slate-400 mt-1">{timeAgo(post.created_at)}</p>
                        </div>
                        <ArrowUpRight size={13} className="text-slate-400 flex-shrink-0 mt-1" />
                      </div>
                    );
                  })}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Training progress */}
          <Card className="border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-orange-500" />
                <h2 className="text-sm font-semibold text-slate-800">Progresso Treinamentos</h2>
              </div>
              <Link to="/treinamentos" className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                <ChevronRight size={13} />
              </Link>
            </div>
            <div className="px-5 py-4 space-y-4">
              {progressData.map(item => {
                const pct = Math.round((item.completed / item.total) * 100);
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">{item.name}</span>
                      <span className="text-xs text-slate-500">{item.completed}/{item.total}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{pct}% concluído</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick links */}
          <Card className="border-slate-200">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <CheckCircle2 size={16} className="text-orange-500" />
              <h2 className="text-sm font-semibold text-slate-800">Acesso Rápido</h2>
            </div>
            <div className="px-5 py-4 space-y-2">
              {[
                { label: 'Feed de Notícias', to: '/feed', icon: Newspaper },
                { label: 'Portal de Treinamentos', to: '/treinamentos', icon: GraduationCap },
                { label: 'Wiki de Processos', to: '/wiki', icon: BookOpen },
                { label: 'Colaboradores', to: '/colaboradores', icon: Users },
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-orange-50 group transition-colors"
                >
                  <div className="p-1.5 rounded-md bg-orange-50 group-hover:bg-orange-100 transition-colors">
                    <item.icon size={13} className="text-orange-500" />
                  </div>
                  <span className="text-sm text-slate-700 group-hover:text-orange-700 font-medium">{item.label}</span>
                  <ChevronRight size={13} className="ml-auto text-slate-300 group-hover:text-orange-400" />
                </Link>
              ))}
            </div>
          </Card>

          {/* Online users mock */}
          <Card className="border-slate-200">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-slate-800">Online Agora</h2>
              <Badge className="ml-auto bg-emerald-100 text-emerald-700 text-[10px] border-0">4 online</Badge>
            </div>
            <div className="px-5 py-4">
              <div className="flex -space-x-2">
                {[
                  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=40',
                  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40',
                  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40',
                  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=40',
                ].map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="online user"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">Pedro, Ana, Mariana e Lucas estão online</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardLineChart() {
  const width = 680;
  const height = 220;
  const max = 34;
  const feedValues = adoptionData.map(item => item.feed);
  const wikiValues = adoptionData.map(item => item.wiki);
  const trainingValues = adoptionData.map(item => item.training);

  return (
    <div className="h-full w-full px-2">
      <svg viewBox={`0 0 ${width + 40} ${height + 40}`} className="h-full w-full overflow-visible" role="img" aria-label="Gráfico de uso semanal da plataforma">
        <defs>
          <linearGradient id="dashboardFeedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0057b8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0057b8" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="dashboardWikiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff7a00" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#ff7a00" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="dashboardTrainingFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <g transform="translate(26 10)">
          {[0, 8, 16, 24, 32].map(value => {
            const y = height - (value / max) * height;
            return (
              <g key={value}>
                <line x1="0" x2={width} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 5" />
                <text x="-10" y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">{value}</text>
              </g>
            );
          })}
          <path d={buildAreaPath(feedValues, max, width, height)} fill="url(#dashboardFeedFill)" />
          <path d={buildAreaPath(wikiValues, max, width, height)} fill="url(#dashboardWikiFill)" />
          <path d={buildAreaPath(trainingValues, max, width, height)} fill="url(#dashboardTrainingFill)" />
          <path d={buildLinePath(feedValues, max, width, height)} fill="none" stroke="#0057b8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={buildLinePath(wikiValues, max, width, height)} fill="none" stroke="#ff7a00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={buildLinePath(trainingValues, max, width, height)} fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {adoptionData.map((item, index) => {
            const x = (index / (adoptionData.length - 1)) * width;
            return (
              <text key={item.day} x={x} y={height + 24} textAnchor="middle" className="fill-slate-500 text-[11px]">
                {item.day}
              </text>
            );
          })}
        </g>
      </svg>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#0057b8]" /> Feed</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ff7a00]" /> Wiki</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#16a34a]" /> Treinamentos</span>
      </div>
    </div>
  );
}

function KnowledgeBarChart() {
  const maxValue = Math.max(...knowledgeData.flatMap(item => [item.artigos, item.treinamentos]));

  return (
    <div className="flex h-full flex-col justify-center gap-4 px-4">
      {knowledgeData.map(item => (
        <div key={item.area} className="grid grid-cols-[86px_minmax(0,1fr)] items-center gap-3">
          <span className="truncate text-xs font-semibold text-slate-600">{item.area}</span>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#0057b8]"
                  style={{ width: `${(item.artigos / maxValue) * 100}%` }}
                />
              </div>
              <span className="w-5 text-right text-[10px] font-bold text-slate-500">{item.artigos}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#ff7a00]"
                  style={{ width: `${(item.treinamentos / maxValue) * 100}%` }}
                />
              </div>
              <span className="w-5 text-right text-[10px] font-bold text-slate-500">{item.treinamentos}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-center gap-4 pt-2 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#0057b8]" /> Artigos</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ff7a00]" /> Treinamentos</span>
      </div>
    </div>
  );
}
