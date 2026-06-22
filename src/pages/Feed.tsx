import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  AtSign,
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  ChevronRight,
  Film,
  Flame,
  Hash,
  Heart,
  Image,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  Newspaper,
  Paperclip,
  PartyPopper,
  Pin,
  Plus,
  Search,
  Send,
  Share2,
  Smile,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Textarea } from '../components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import type { Post } from '../types';
import { cn } from '../lib/utils';

const TYPE_CONFIG: Record<string, { label: string; badgeClass: string; icon: typeof Bell; bar: string }> = {
  announcement: { label: 'Comunicado', badgeClass: 'bg-blue-100 text-blue-700', icon: Megaphone, bar: '#0057b8' },
  alert: { label: 'Aviso importante', badgeClass: 'bg-red-100 text-red-700', icon: AlertTriangle, bar: '#dc2626' },
  update: { label: 'Atualização', badgeClass: 'bg-emerald-100 text-emerald-700', icon: TrendingUp, bar: '#16a34a' },
  event: { label: 'Evento', badgeClass: 'bg-purple-100 text-purple-700', icon: Calendar, bar: '#7c3aed' },
  message: { label: 'Publicação', badgeClass: 'bg-slate-100 text-slate-600', icon: MessageCircle, bar: '#64748b' },
  poll: { label: 'Enquete', badgeClass: 'bg-amber-100 text-amber-700', icon: Users, bar: '#d97706' },
};

const COMPOSE_TYPES = [
  { key: 'message', label: 'Post', icon: MessageCircle },
  { key: 'announcement', label: 'Comunicado', icon: Megaphone },
  { key: 'alert', label: 'Aviso', icon: AlertTriangle },
  { key: 'event', label: 'Evento', icon: Calendar },
];

const FILTERS = [
  { key: 'all', label: 'Para você', icon: Sparkles },
  { key: 'announcement', label: 'Comunicados', icon: Megaphone },
  { key: 'alert', label: 'Avisos', icon: AlertTriangle },
  { key: 'update', label: 'Atualizações', icon: TrendingUp },
  { key: 'event', label: 'Eventos', icon: Calendar },
];

const REACTIONS = [
  { key: 'like', icon: ThumbsUp, label: 'Curtir', color: '#0057b8', bg: 'hover:bg-blue-50' },
  { key: 'love', icon: Heart, label: 'Amei', color: '#e11d48', bg: 'hover:bg-red-50' },
  { key: 'celebrate', icon: PartyPopper, label: 'Celebrar', color: '#d97706', bg: 'hover:bg-amber-50' },
  { key: 'insightful', icon: Star, label: 'Relevante', color: '#7c3aed', bg: 'hover:bg-purple-50' },
];

interface Comment {
  id: string;
  content: string;
  created_at: string;
  users?: { name: string; photo_url?: string };
}

interface PostWithExtras extends Post {
  _likes: number;
  _reaction: string | null;
  _comments: number;
  _showComments: boolean;
  _commentText: string;
  _commentsList: Comment[];
}

const ME = {
  name: 'Pedro Henrique',
  position: 'Gerente Comercial',
  department: 'Comercial',
  photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=120',
};

const fallbackPosts: PostWithExtras[] = [
  {
    id: 'social-1',
    title: 'WIKI NEX 2.0 no ar',
    content: 'Pessoal, publicamos a nova base viva de processos. A proposta é cada área manter seus padrões críticos atualizados e fáceis de encontrar. Comecem pelos artigos de Atendimento, Suporte Técnico e Financeiro.',
    type: 'announcement',
    pinned: true,
    created_at: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
    updated_at: new Date().toISOString(),
    users: {
      id: 'pedro',
      name: 'Pedro Henrique',
      email: 'pedro.henrique@nextelecom.com.br',
      position: 'Administrador',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      photo_url: ME.photo,
      departments: { id: 'comercial', name: 'Comercial', created_at: new Date().toISOString() },
    },
    _likes: 18,
    _reaction: null,
    _comments: 2,
    _showComments: false,
    _commentText: '',
    _commentsList: [
      {
        id: 'c1',
        content: 'Ficou muito mais fácil achar os procedimentos por área.',
        created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        users: { name: 'Ana Beatriz Santos', photo_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80' },
      },
      {
        id: 'c2',
        content: 'Vou revisar os artigos de OLT e GPON ainda hoje.',
        created_at: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
        users: { name: 'Rafael Souza', photo_url: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=80' },
      },
    ],
  },
  {
    id: 'social-2',
    title: 'Meta comercial superada',
    content: 'Fechamos a semana com 127% da meta. Destaque para as indicações vindas do atendimento e para o novo script de abordagem consultiva. Obrigado a todo mundo que ajudou no fluxo!',
    type: 'update',
    pinned: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: new Date().toISOString(),
    users: {
      id: 'mariana',
      name: 'Mariana Costa',
      email: 'mariana.costa@nextelecom.com.br',
      position: 'Analista de NOC',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      photo_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120',
      departments: { id: 'noc', name: 'NOC', created_at: new Date().toISOString() },
    },
    _likes: 24,
    _reaction: 'celebrate',
    _comments: 1,
    _showComments: false,
    _commentText: '',
    _commentsList: [
      {
        id: 'c3',
        content: 'Time voando. Parabéns pela integração entre áreas!',
        created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
        users: { name: 'Fernanda Lima', photo_url: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=80' },
      },
    ],
  },
  {
    id: 'social-3',
    title: 'Manutenção programada no backbone',
    content: 'Hoje às 23h iniciaremos uma janela de manutenção no backbone principal. A equipe de NOC estará em plantão e qualquer atualização será publicada neste feed.',
    type: 'alert',
    pinned: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updated_at: new Date().toISOString(),
    users: {
      id: 'lucas',
      name: 'Lucas Alves',
      email: 'lucas.alves@nextelecom.com.br',
      position: 'Técnico de Suporte',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      photo_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=120',
      departments: { id: 'suporte', name: 'Suporte Técnico', created_at: new Date().toISOString() },
    },
    _likes: 11,
    _reaction: null,
    _comments: 0,
    _showComments: false,
    _commentText: '',
    _commentsList: [],
  },
];

const stories = [
  { label: 'Plantão NOC', icon: Zap, color: '#0057b8' },
  { label: 'Comercial', icon: Briefcase, color: '#16a34a' },
  { label: 'Aniversários', icon: PartyPopper, color: '#ff7a00' },
  { label: 'RH', icon: Users, color: '#9333ea' },
];

const communities = [
  { label: 'Atendimento', members: 28, icon: MessageCircle },
  { label: 'Suporte GPON', members: 19, icon: Zap },
  { label: 'Comercial B2B', members: 14, icon: Briefcase },
  { label: 'Financeiro', members: 11, icon: Building2 },
];

const suggestions = [
  { name: 'Ana Beatriz Santos', role: 'Gestora de RH', photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80' },
  { name: 'Rafael Souza', role: 'Infraestrutura', photo: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=80' },
  { name: 'Fernanda Lima', role: 'Financeiro', photo: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=80' },
];

const trending = [
  { label: 'WIKI NEX 2.0', count: 42 },
  { label: 'Meta de Vendas', count: 31 },
  { label: 'Backbone', count: 18 },
  { label: 'Treinamentos GPON', count: 15 },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora mesmo';
  if (mins < 60) return `${mins}m atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function normalizePost(post: Post): PostWithExtras {
  return {
    ...post,
    _likes: post.likes?.length ?? 0,
    _reaction: null,
    _comments: post.comments?.length ?? 0,
    _showComments: false,
    _commentText: '',
    _commentsList: post.comments ?? [],
  };
}

export function Feed() {
  const [posts, setPosts] = useState<PostWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [composeText, setComposeText] = useState('');
  const [composeType, setComposeType] = useState('message');
  const [composing, setComposing] = useState(false);
  const [showReactions, setShowReactions] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);

    try {
      const result = await Promise.race([
        supabase
          .from('posts')
          .select('*, users(id, name, photo_url, position, departments(name)), likes(id, user_id), comments(id, content, created_at, users(name, photo_url))')
          .order('pinned', { ascending: false })
          .order('created_at', { ascending: false }),
        new Promise<null>(resolve => {
          window.setTimeout(() => resolve(null), 1800);
        }),
      ]);

      const data = result?.data as Post[] | undefined;
      setPosts(data?.length ? data.map(normalizePost) : fallbackPosts);
    } catch {
      setPosts(fallbackPosts);
    } finally {
      setLoading(false);
    }
  }

  function setReaction(postId: string, reaction: string) {
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      const removing = post._reaction === reaction;
      return {
        ...post,
        _reaction: removing ? null : reaction,
        _likes: removing ? Math.max(0, post._likes - 1) : post._reaction ? post._likes : post._likes + 1,
      };
    }));
    setShowReactions(null);
  }

  function toggleComments(postId: string) {
    setPosts(prev => prev.map(post => post.id === postId ? { ...post, _showComments: !post._showComments } : post));
  }

  function setCommentText(postId: string, text: string) {
    setPosts(prev => prev.map(post => post.id === postId ? { ...post, _commentText: text } : post));
  }

  function submitComment(postId: string) {
    setPosts(prev => prev.map(post => {
      if (post.id !== postId || !post._commentText.trim()) return post;
      const comment: Comment = {
        id: Date.now().toString(),
        content: post._commentText,
        created_at: new Date().toISOString(),
        users: { name: ME.name, photo_url: ME.photo },
      };
      return {
        ...post,
        _commentText: '',
        _comments: post._comments + 1,
        _commentsList: [...post._commentsList, comment],
        _showComments: true,
      };
    }));
  }

  async function submitPost() {
    if (!composeText.trim()) return;

    const localPost: PostWithExtras = {
      id: `local-${Date.now()}`,
      content: composeText,
      type: composeType as Post['type'],
      pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      users: {
        id: 'me',
        name: ME.name,
        email: 'pedro.henrique@nextelecom.com.br',
        photo_url: ME.photo,
        position: ME.position,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        departments: { id: 'comercial', name: ME.department, created_at: new Date().toISOString() },
      },
      _likes: 0,
      _reaction: null,
      _comments: 0,
      _showComments: false,
      _commentText: '',
      _commentsList: [],
    };

    setPosts(prev => [localPost, ...prev]);
    setComposeText('');
    setComposing(false);

    try {
      const { data: author } = await supabase.from('users').select('id').limit(1).single();
      if (author) {
        await supabase.from('posts').insert({ content: localPost.content, type: localPost.type, author_id: author.id });
      }
    } catch {
      // Keeps the local social interaction responsive when the backend is unavailable.
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return posts.filter(post => {
      const matchFilter = filter === 'all' || post.type === filter;
      const matchSearch = !query ||
        post.content.toLowerCase().includes(query) ||
        post.title?.toLowerCase().includes(query) ||
        post.users?.name.toLowerCase().includes(query);
      return matchFilter && matchSearch;
    });
  }, [filter, posts, search]);

  return (
    <div className="social-feed-shell">
      <aside className="social-left-panel">
        <ProfileCard />
        <SocialPanel title="Comunidades" icon={Hash}>
          <div className="space-y-2">
            {communities.map(community => (
              <button key={community.label} className="social-community-row">
                <span className="social-community-icon"><community.icon size={15} /></span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-bold text-slate-800">{community.label}</span>
                  <span className="text-xs text-slate-400">{community.members} membros</span>
                </span>
                <ChevronRight size={14} className="text-slate-300" />
              </button>
            ))}
          </div>
        </SocialPanel>
      </aside>

      <main className="min-w-0 space-y-5">
        <FeedHero />
        <Stories />
        <FeedToolbar search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} />
        <Composer
          composing={composing}
          setComposing={setComposing}
          composeType={composeType}
          setComposeType={setComposeType}
          composeText={composeText}
          setComposeText={setComposeText}
          submitPost={submitPost}
        />

        <div className="space-y-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => <PostSkeleton key={index} />)
          ) : filtered.length > 0 ? (
            filtered.map(post => (
              <SocialPost
                key={post.id}
                post={post}
                showReactions={showReactions}
                setShowReactions={setShowReactions}
                setReaction={setReaction}
                toggleComments={toggleComments}
                setCommentText={setCommentText}
                submitComment={submitComment}
              />
            ))
          ) : (
            <div className="social-empty-state">
              <Newspaper size={44} />
              <h3>Nenhuma publicação encontrada</h3>
              <p>Tente buscar por outro termo ou publicar uma novidade para a equipe.</p>
            </div>
          )}
        </div>
      </main>

      <aside className="social-right-panel">
        <SocialPanel title="Sugestões" icon={UserPlus}>
          <div className="space-y-3">
            {suggestions.map(person => (
              <div key={person.name} className="flex items-center gap-3">
                <img src={person.photo} alt={person.name} className="h-10 w-10 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{person.name}</p>
                  <p className="truncate text-xs text-slate-400">{person.role}</p>
                </div>
                <button className="social-small-action"><Plus size={14} /></button>
              </div>
            ))}
          </div>
        </SocialPanel>

        <SocialPanel title="Em alta" icon={Flame}>
          <div className="space-y-2">
            {trending.map((item, index) => (
              <button key={item.label} className="social-trending-row">
                <span className="text-sm font-black text-slate-300">{index + 1}</span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-bold text-slate-800">#{item.label}</span>
                  <span className="text-xs text-slate-400">{item.count} interações</span>
                </span>
              </button>
            ))}
          </div>
        </SocialPanel>

        <SocialPanel title="Tipos de post" icon={Bookmark}>
          <div className="space-y-2">
            {Object.entries(TYPE_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilter(filter === key ? 'all' : key)}
                className={cn('social-type-row', filter === key && 'social-type-row-active')}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: config.bar }} />
                <config.icon size={14} style={{ color: config.bar }} />
                <span>{config.label}</span>
              </button>
            ))}
          </div>
        </SocialPanel>
      </aside>
    </div>
  );
}

function FeedHero() {
  return (
    <section className="social-hero">
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-blue-100">Rede social corporativa</p>
        <h1>Feed Nex</h1>
        <p>Conecte pessoas, áreas e decisões em um mural vivo da operação.</p>
      </div>
      <div className="social-hero-metrics">
        <span><strong>42</strong> colaboradores</span>
        <span><strong>87%</strong> engajamento</span>
        <span><strong>12</strong> comunidades</span>
      </div>
    </section>
  );
}

function Stories() {
  return (
    <div className="social-stories">
      <button className="social-story social-story-create">
        <span><Plus size={18} /></span>
        Criar
      </button>
      {stories.map(story => (
        <button key={story.label} className="social-story">
          <span style={{ color: story.color, backgroundColor: `${story.color}14` }}>
            <story.icon size={18} />
          </span>
          {story.label}
        </button>
      ))}
    </div>
  );
}

function FeedToolbar({
  search,
  setSearch,
  filter,
  setFilter,
}: {
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
}) {
  return (
    <div className="social-toolbar">
      <div className="social-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Pesquisar pessoas, posts e assuntos..."
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
      </div>
      <div className="social-filter-strip">
        {FILTERS.map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={cn('social-filter-pill', filter === item.key && 'social-filter-pill-active')}
          >
            <item.icon size={14} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Composer({
  composing,
  setComposing,
  composeType,
  setComposeType,
  composeText,
  setComposeText,
  submitPost,
}: {
  composing: boolean;
  setComposing: (value: boolean) => void;
  composeType: string;
  setComposeType: (value: string) => void;
  composeText: string;
  setComposeText: (value: string) => void;
  submitPost: () => void;
}) {
  return (
    <div className="social-composer">
      {!composing ? (
        <div className="flex items-center gap-4">
          <img src={ME.photo} alt={ME.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-orange-100" />
          <button onClick={() => setComposing(true)} className="social-compose-trigger">
            Compartilhe uma atualização com a equipe...
          </button>
          <button className="social-composer-icon"><Camera size={18} /></button>
        </div>
      ) : (
        <div className="space-y-4 animate-slide-up">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            {COMPOSE_TYPES.map(type => (
              <button
                key={type.key}
                onClick={() => setComposeType(type.key)}
                className={cn('social-compose-type', composeType === type.key && 'social-compose-type-active')}
              >
                <type.icon size={15} />
                {type.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <img src={ME.photo} alt={ME.name} className="h-11 w-11 rounded-full object-cover" />
            <div>
              <p className="text-sm font-bold text-slate-900">{ME.name}</p>
              <p className="text-xs text-slate-400">{ME.department} · {TYPE_CONFIG[composeType]?.label}</p>
            </div>
          </div>
          <Textarea
            autoFocus
            value={composeText}
            onChange={event => setComposeText(event.target.value)}
            placeholder="Escreva uma novidade, reconhecimento, aviso ou pergunta..."
            className="min-h-[150px] resize-none rounded-xl border-slate-200 text-base focus:border-orange-400 focus:ring-orange-400/30"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1">
              {[Image, Film, Paperclip, AtSign, Smile].map((Icon, index) => (
                <button key={index} className="social-composer-tool">
                  <Icon size={18} />
                </button>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => { setComposing(false); setComposeText(''); }} className="social-cancel-button">
                Cancelar
              </button>
              <button onClick={submitPost} disabled={!composeText.trim()} className="social-submit-button">
                <Send size={15} />
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SocialPost({
  post,
  showReactions,
  setShowReactions,
  setReaction,
  toggleComments,
  setCommentText,
  submitComment,
}: {
  post: PostWithExtras;
  showReactions: string | null;
  setShowReactions: (value: string | null) => void;
  setReaction: (postId: string, reaction: string) => void;
  toggleComments: (postId: string) => void;
  setCommentText: (postId: string, text: string) => void;
  submitComment: (postId: string) => void;
}) {
  const config = TYPE_CONFIG[post.type] || TYPE_CONFIG.message;
  const TypeIcon = config.icon;
  const author = post.users;
  const reaction = REACTIONS.find(item => item.key === post._reaction);

  return (
    <article className="social-post">
      <div className="social-post-bar" style={{ backgroundColor: config.bar }} />
      {post.pinned && (
        <div className="social-pinned">
          <Pin size={14} />
          Publicação fixada
        </div>
      )}

      <div className="p-5 md:p-6">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={author?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.name || 'N')}&size=56&background=ff7a00&color=fff`}
                alt={author?.name}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-white"
              />
              <span className="social-author-type" style={{ color: config.bar }}>
                <TypeIcon size={12} />
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-black text-slate-900">{author?.name || 'Rede Nex'}</h2>
                <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold', config.badgeClass)}>
                  {config.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                {[author?.position, author?.departments?.name].filter(Boolean).join(' · ')}
                <span className="mx-1.5">·</span>
                {timeAgo(post.created_at)}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="social-menu-button">
                <MoreHorizontal size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem className="gap-2 cursor-pointer"><Bookmark size={15} /> Salvar</DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer"><Share2 size={15} /> Compartilhar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {post.title && <h3 className="mb-2 text-lg font-black leading-snug text-slate-900">{post.title}</h3>}
        <p className="whitespace-pre-wrap text-base leading-7 text-slate-700">{post.content}</p>

        <div className="social-post-stats">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              <span className="social-reaction-dot bg-[#0057b8]"><ThumbsUp size={9} /></span>
              <span className="social-reaction-dot bg-[#e11d48]"><Heart size={9} /></span>
              <span className="social-reaction-dot bg-[#d97706]"><PartyPopper size={9} /></span>
            </div>
            <span>{post._likes} reações</span>
          </div>
          <button onClick={() => toggleComments(post.id)}>{post._comments} comentários</button>
        </div>

        <div className="social-actions">
          <div className="relative">
            <button
              onMouseEnter={() => setShowReactions(post.id)}
              onMouseLeave={() => window.setTimeout(() => setShowReactions(null), 250)}
              onClick={() => setReaction(post.id, 'like')}
              className={cn('social-action-button', post._reaction && 'social-action-button-active')}
            >
              {reaction ? <reaction.icon size={18} style={{ color: reaction.color }} /> : <ThumbsUp size={18} />}
              {reaction ? reaction.label : 'Curtir'}
            </button>
            {showReactions === post.id && (
              <div
                className="social-reaction-picker"
                onMouseEnter={() => setShowReactions(post.id)}
                onMouseLeave={() => setShowReactions(null)}
              >
                {REACTIONS.map(item => (
                  <button key={item.key} onClick={() => setReaction(post.id, item.key)} title={item.label} className={cn('social-reaction-choice', item.bg)}>
                    <item.icon size={22} style={{ color: item.color }} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => toggleComments(post.id)} className="social-action-button">
            <MessageCircle size={18} />
            Comentar
          </button>
          <button className="social-action-button ml-auto">
            <Share2 size={18} />
            Compartilhar
          </button>
        </div>

        {post._showComments && (
          <div className="mt-5 space-y-4 animate-slide-up">
            {post._commentsList.map(comment => (
              <div key={comment.id} className="flex items-start gap-3">
                <img
                  src={comment.users?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.users?.name || 'N')}&size=36&background=0057b8&color=fff`}
                  alt={comment.users?.name}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div className="rounded-2xl rounded-tl-sm bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold text-slate-800">{comment.users?.name}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{comment.content}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <img src={ME.photo} alt={ME.name} className="h-9 w-9 rounded-full object-cover" />
              <div className="social-comment-box">
                <input
                  value={post._commentText}
                  onChange={event => setCommentText(post.id, event.target.value)}
                  onKeyDown={event => { if (event.key === 'Enter') submitComment(post.id); }}
                  placeholder="Escreva um comentário..."
                />
                <button onClick={() => submitComment(post.id)} disabled={!post._commentText.trim()}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function ProfileCard() {
  return (
    <div className="social-profile-card">
      <div className="social-profile-cover" />
      <div className="px-5 pb-5">
        <img src={ME.photo} alt={ME.name} className="-mt-8 h-16 w-16 rounded-full object-cover ring-4 ring-white" />
        <h2 className="mt-3 text-base font-black text-slate-900">{ME.name}</h2>
        <p className="text-sm text-slate-500">{ME.position}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <Building2 size={13} />
          {ME.department}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
          {[
            { value: '18', label: 'Posts' },
            { value: '42', label: 'Conexões' },
            { value: '7', label: 'Grupos' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-base font-black text-slate-900">{item.value}</p>
              <p className="text-[11px] text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialPanel({ title, icon: Icon, children }: { title: string; icon: typeof Hash; children: ReactNode }) {
  return (
    <section className="social-panel">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={16} className="text-orange-500" />
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function PostSkeleton() {
  return (
    <div className="social-post p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="h-3 w-1/4 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-4 rounded bg-slate-100" />
        <div className="h-4 w-4/5 rounded bg-slate-100" />
      </div>
    </div>
  );
}
