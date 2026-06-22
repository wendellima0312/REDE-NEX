import { useEffect, useMemo, useState } from 'react';
import {
  AlignLeft,
  ArrowLeft,
  BookMarked,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Code2,
  DollarSign,
  Edit3,
  Eye,
  FileText,
  Folder,
  GitBranch,
  Globe,
  Hash,
  Headphones,
  History,
  Layers,
  ListTree,
  Lock,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Star,
  Tag,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react';
import { localDatabase } from '../lib/localDatabase';
import type { Category, WikiArticle } from '../types';
import { cn } from '../lib/utils';

const CATEGORY_ICONS: Record<string, typeof Headphones> = {
  Atendimento: Headphones,
  'Suporte Técnico': Wrench,
  NOC: Network,
  Financeiro: DollarSign,
  Comercial: TrendingUp,
  RH: Users,
};

const SUBCATEGORIES: Record<string, { label: string; icon: typeof Hash }[]> = {
  Atendimento: [
    { label: 'Procedimentos', icon: CheckCircle2 },
    { label: 'Scripts de Atendimento', icon: AlignLeft },
    { label: 'FAQ', icon: Circle },
  ],
  'Suporte Técnico': [
    { label: 'GPON', icon: GitBranch },
    { label: 'OLT', icon: Layers },
    { label: 'ONU', icon: Circle },
    { label: 'Mesh Wi-Fi', icon: Globe },
    { label: 'TV Plus', icon: Circle },
  ],
  NOC: [
    { label: 'Monitoramento', icon: Globe },
    { label: 'Backbone', icon: GitBranch },
    { label: 'Incidentes', icon: Circle },
  ],
  Financeiro: [
    { label: 'Cobrança', icon: CheckCircle2 },
    { label: 'Negociação', icon: AlignLeft },
    { label: 'Relatórios', icon: FileText },
  ],
  Comercial: [
    { label: 'Vendas', icon: TrendingUp },
    { label: 'Contratos', icon: FileText },
    { label: 'Propostas', icon: AlignLeft },
  ],
  RH: [
    { label: 'Processos Internos', icon: CheckCircle2 },
    { label: 'Onboarding', icon: Users },
    { label: 'Políticas', icon: Lock },
  ],
};

interface CategoryWithArticles extends Category {
  _articles: WikiArticle[];
  _open: boolean;
}

type ViewMode = 'home' | 'article' | 'edit' | 'new';
type EditorTab = 'write' | 'preview';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const fallbackCategories: Category[] = [
  {
    id: 'wiki-atendimento',
    name: 'Atendimento',
    description: 'Processos de atendimento ao cliente',
    icon: 'Headphones',
    color: '#ff7a00',
    type: 'wiki',
    created_at: new Date().toISOString(),
  },
  {
    id: 'wiki-suporte',
    name: 'Suporte Técnico',
    description: 'Documentação técnica de rede e equipamentos',
    icon: 'Wrench',
    color: '#0057b8',
    type: 'wiki',
    created_at: new Date().toISOString(),
  },
  {
    id: 'wiki-financeiro',
    name: 'Financeiro',
    description: 'Cobrança, negociação e processos financeiros',
    icon: 'DollarSign',
    color: '#9333ea',
    type: 'wiki',
    created_at: new Date().toISOString(),
  },
];

const fallbackArticles: WikiArticle[] = [
  {
    id: 'article-atendimento',
    title: 'Procedimento de Atendimento ao Cliente',
    slug: 'procedimento-atendimento-cliente',
    content: `# Procedimento de Atendimento ao Cliente

## Objetivo

Padronizar o atendimento ao cliente, garantindo qualidade, registro correto e tempo de resposta adequado.

## Fluxo de atendimento

1. **Saudação inicial**: cumprimente o cliente e identifique o canal.
2. **Identificação**: confirme CPF/CNPJ, contrato e endereço.
3. **Diagnóstico**: entenda a solicitação e consulte histórico.
4. **Resolução**: execute o procedimento adequado ou encaminhe ao setor responsável.
5. **Encerramento**: confirme a solução e registre o protocolo.

## Pontos importantes

- Mantenha tom profissional e empático.
- Registre todas as interações no sistema.
- Escale para supervisão quando houver risco de cancelamento.
- Confirme dados sensíveis antes de qualquer alteração cadastral.`,
    category_id: 'wiki-atendimento',
    status: 'published',
    tags: ['atendimento', 'cliente', 'procedimento'],
    created_at: '2026-06-10T12:00:00.000Z',
    updated_at: '2026-06-18T12:00:00.000Z',
    categories: fallbackCategories[0],
    users: {
      id: 'user-ana',
      name: 'Ana Beatriz Santos',
      email: 'ana.beatriz@nextelecom.com.br',
      position: 'Gestora de RH',
      status: 'active',
      created_at: '2026-06-01T12:00:00.000Z',
      updated_at: '2026-06-01T12:00:00.000Z',
      photo_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=120',
    },
  },
  {
    id: 'article-olt',
    title: 'Configuração de OLT Huawei',
    slug: 'configuracao-olt-huawei',
    content: `# Configuração de OLT Huawei

## Requisitos

- Acesso SSH à OLT.
- Credenciais de administrador.
- Serial da ONU validado.
- VLAN de serviço definida.

## Acesso ao equipamento

\`\`\`bash
ssh admin@192.168.1.1
\`\`\`

## Configuração de VLAN

\`\`\`bash
vlan 100 smart
port vlan 100 0/0 0
\`\`\`

## Troubleshooting

- ONU não registra: validar serial number e potência óptica.
- Sem navegação: conferir VLAN, profile e autenticação.
- Lentidão: revisar perfil de velocidade e ocupação da PON.`,
    category_id: 'wiki-suporte',
    status: 'published',
    tags: ['OLT', 'GPON', 'Huawei'],
    created_at: '2026-06-08T12:00:00.000Z',
    updated_at: '2026-06-17T12:00:00.000Z',
    categories: fallbackCategories[1],
    users: {
      id: 'user-rafael',
      name: 'Rafael Souza',
      email: 'rafael.souza@nextelecom.com.br',
      position: 'Engenheiro de Infraestrutura',
      status: 'active',
      created_at: '2026-06-01T12:00:00.000Z',
      updated_at: '2026-06-01T12:00:00.000Z',
      photo_url: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=120',
    },
  },
  {
    id: 'article-cobranca',
    title: 'Processo de Cobrança',
    slug: 'processo-cobranca',
    content: `# Processo de Cobrança

## Régua de cobrança

| Dias de atraso | Ação |
|---|---|
| 1-5 dias | SMS automático |
| 6-10 dias | Ligação ativa |
| 11-20 dias | Suspensão do serviço |
| 21-30 dias | Negociação especial |

## Script de negociação

1. Identificar o cliente.
2. Informar o valor em atraso.
3. Oferecer opções de parcelamento.
4. Registrar acordo no sistema.
5. Enviar confirmação por e-mail.

## Limites

- Multa e juros: até 100%.
- Valor principal: sem desconto sem aprovação de gestor.`,
    category_id: 'wiki-financeiro',
    status: 'published',
    tags: ['cobrança', 'negociação', 'financeiro'],
    created_at: '2026-06-07T12:00:00.000Z',
    updated_at: '2026-06-16T12:00:00.000Z',
    categories: fallbackCategories[2],
    users: {
      id: 'user-fernanda',
      name: 'Fernanda Lima',
      email: 'fernanda.lima@nextelecom.com.br',
      position: 'Analista Financeira',
      status: 'active',
      created_at: '2026-06-01T12:00:00.000Z',
      updated_at: '2026-06-01T12:00:00.000Z',
      photo_url: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=120',
    },
  },
];

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function stripMarkdown(value?: string) {
  return (value || '').replace(/[#*`|>[\]-]/g, '').replace(/\s+/g, ' ').trim();
}

function extractToc(md?: string): TocItem[] {
  if (!md) return [];

  return Array.from(md.matchAll(/^(#{2,3})\s+(.+)$/gm)).map((match, index) => {
    const text = match[2].replace(/[*`]/g, '').trim();
    return {
      id: `${slugify(text)}-${index}`,
      text,
      level: match[1].length,
    };
  });
}

function renderMarkdown(md: string): string {
  if (!md) return '';
  let headingIndex = 0;

  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="wiki-code"><div class="wiki-code-label">${lang || 'code'}</div><code>${code}</code></pre>`
    )
    .replace(/^### (.+)$/gm, (_, title) => {
      const id = `${slugify(title)}-${headingIndex++}`;
      return `<h3 id="${id}">${title}</h3>`;
    })
    .replace(/^## (.+)$/gm, (_, title) => {
      const id = `${slugify(title)}-${headingIndex++}`;
      return `<h2 id="${id}">${title}</h2>`;
    })
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="wiki-inline-code">$1</code>')
    .replace(/^\| *(.+?) *\|(.+)$/gm, (match) => {
      const cells = match.split('|').filter((_, index, arr) => index > 0 && index < arr.length - 1).map(cell => cell.trim());
      return `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
    })
    .replace(/^---$/gm, '<hr>')
    .replace(/^\d+\. (.+)$/gm, '<li class="wiki-ordered">$1</li>')
    .replace(/^[-*] (.+)$/gm, '<li class="wiki-bullet">$1</li>')
    .split(/\n{2,}/)
    .map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^<(h1|h2|h3|pre|hr|tr|li)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .join('');
}

function removeLeadingTitle(md: string) {
  return md.replace(/^#\s+.+(?:\r?\n){1,2}/, '');
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 30) return `${days} dias atrás`;
  return formatDate(dateStr);
}

export function Wiki() {
  const [categories, setCategories] = useState<CategoryWithArticles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [allArticles, setAllArticles] = useState<WikiArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editTab, setEditTab] = useState<EditorTab>('write');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleCat, setNewArticleCat] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    try {
      const result = await Promise.race([
        localDatabase.getWikiData(),
        new Promise<null>(resolve => {
          window.setTimeout(() => resolve(null), 1800);
        }),
      ]);

      const dbCats: Category[] = result?.categories ?? [];
      const dbArticles = (result?.articles ?? []) as unknown as WikiArticle[];
      const useFallback = dbCats.length === 0 && dbArticles.length === 0;
      const cats = useFallback ? fallbackCategories : dbCats;
      const articles = useFallback ? fallbackArticles : dbArticles;

      setAllArticles(articles);
      setCategories(cats.map(cat => ({
        ...cat,
        _articles: articles.filter(article => article.category_id === cat.id),
        _open: true,
      })));
    } catch {
      setAllArticles(fallbackArticles);
      setCategories(fallbackCategories.map(cat => ({
        ...cat,
        _articles: fallbackArticles.filter(article => article.category_id === cat.id),
        _open: true,
      })));
    } finally {
      setLoading(false);
    }
  }

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];

    return allArticles.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.content?.toLowerCase().includes(query) ||
      article.tags?.some(tag => tag.toLowerCase().includes(query)) ||
      article.categories?.name.toLowerCase().includes(query)
    );
  }, [allArticles, search]);

  const visibleCategories = useMemo(() => {
    if (!selectedCat) return categories;
    return categories.filter(category => category.name === selectedCat);
  }, [categories, selectedCat]);

  const recentlyUpdated = allArticles.slice(0, 5);
  const currentToc = extractToc(selectedArticle?.content);

  function openArticle(article: WikiArticle) {
    setSearch('');
    setSelectedArticle(article);
    setViewMode('article');
  }

  function openEdit(article: WikiArticle) {
    setSearch('');
    setSelectedArticle(article);
    setEditTitle(article.title);
    setEditContent(article.content || '');
    setEditTab('write');
    setViewMode('edit');
  }

  function openNew() {
    setSearch('');
    setSelectedArticle(null);
    setEditTitle('');
    setEditContent('');
    setNewArticleTitle('');
    setNewArticleCat('');
    setEditTab('write');
    setViewMode('new');
  }

  function toggleCategory(id: string) {
    setCategories(prev => prev.map(category =>
      category.id === id ? { ...category, _open: !category._open } : category
    ));
  }

  return (
    <div className="wiki-shell -mx-2 md:-mx-4">
      <WikiHeader
        search={search}
        setSearch={setSearch}
        onNew={openNew}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="wiki-layout">
        <aside className={cn('wiki-sidebar', !sidebarOpen && 'wiki-sidebar-collapsed')}>
          <WikiSidebar
            categories={categories}
            loading={loading}
            selectedArticle={selectedArticle}
            selectedCat={selectedCat}
            setSelectedCat={setSelectedCat}
            onSelect={openArticle}
            onToggle={toggleCategory}
          />
        </aside>

        <main className="wiki-main">
          {search.trim() ? (
            <SearchResults
              query={search}
              results={searchResults}
              onOpen={openArticle}
              onEdit={openEdit}
              onNew={openNew}
            />
          ) : viewMode === 'article' && selectedArticle ? (
            <ArticleView
              article={selectedArticle}
              toc={currentToc}
              onBack={() => setViewMode('home')}
              onEdit={() => openEdit(selectedArticle)}
            />
          ) : viewMode === 'edit' || viewMode === 'new' ? (
            <EditorView
              mode={viewMode}
              article={selectedArticle}
              categories={categories}
              editContent={editContent}
              editTitle={editTitle}
              editTab={editTab}
              newArticleTitle={newArticleTitle}
              newArticleCat={newArticleCat}
              setEditContent={setEditContent}
              setEditTitle={setEditTitle}
              setEditTab={setEditTab}
              setNewArticleTitle={setNewArticleTitle}
              setNewArticleCat={setNewArticleCat}
              onBack={() => setViewMode(selectedArticle ? 'article' : 'home')}
            />
          ) : (
            <WikiHome
              categories={visibleCategories}
              allArticles={allArticles}
              loading={loading}
              selectedCat={selectedCat}
              setSelectedCat={setSelectedCat}
              recentlyUpdated={recentlyUpdated}
              onOpen={openArticle}
              onEdit={openEdit}
              onNew={openNew}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function WikiHeader({
  search,
  setSearch,
  onNew,
  sidebarOpen,
  setSidebarOpen,
}: {
  search: string;
  setSearch: (value: string) => void;
  onNew: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}) {
  return (
    <header className="wiki-topbar">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="wiki-icon-button hidden lg:inline-flex"
          title={sidebarOpen ? 'Ocultar navegação' : 'Mostrar navegação'}
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
        <div className="h-10 w-10 rounded-lg bg-[#0057b8] text-white flex items-center justify-center shadow-sm">
          <BookMarked size={21} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 leading-tight">WIKI NEX</h1>
            <span className="wiki-version-badge">2.0</span>
          </div>
          <p className="text-xs text-slate-500 leading-tight hidden sm:block">Centro de inteligência operacional</p>
        </div>
      </div>

      <div className="wiki-global-search">
        <Search size={18} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Pesquisar na wiki..."
          value={search}
          onChange={event => setSearch(event.target.value)}
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs font-semibold text-slate-400 hover:text-slate-700">
            Limpar
          </button>
        )}
      </div>

      <button onClick={onNew} className="wiki-primary-button">
        <Plus size={16} />
        <span className="hidden sm:inline">Novo Artigo</span>
      </button>
    </header>
  );
}

function WikiSidebar({
  categories,
  loading,
  selectedArticle,
  selectedCat,
  setSelectedCat,
  onSelect,
  onToggle,
}: {
  categories: CategoryWithArticles[];
  loading: boolean;
  selectedArticle: WikiArticle | null;
  selectedCat: string | null;
  setSelectedCat: (value: string | null) => void;
  onSelect: (article: WikiArticle) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="h-full flex flex-col bg-[#f8fafc] border-r border-slate-200">
      <div className="px-4 py-4 border-b border-slate-200">
        <button
          onClick={() => setSelectedCat(null)}
          className={cn('wiki-sidebar-root', !selectedCat && 'wiki-sidebar-root-active')}
        >
          <BookOpen size={16} />
          Todos os artigos
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
        {loading ? (
          Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="px-4 py-2">
              <div className="h-8 rounded-md bg-slate-200/70 animate-pulse" />
            </div>
          ))
        ) : (
          categories.map(category => {
            const Icon = CATEGORY_ICONS[category.name] || Folder;
            const subcategories = SUBCATEGORIES[category.name] || [];
            const activeCategory = selectedCat === category.name;

            return (
              <div key={category.id} className="mb-1">
                <div className="group flex items-center px-3">
                  <button
                    onClick={() => onToggle(category.id)}
                    className="h-8 w-7 flex items-center justify-center text-slate-400 hover:text-slate-700"
                    title={category._open ? 'Recolher' : 'Expandir'}
                  >
                    {category._open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </button>
                  <button
                    onClick={() => setSelectedCat(activeCategory ? null : category.name)}
                    className={cn('wiki-sidebar-section', activeCategory && 'wiki-sidebar-section-active')}
                  >
                    <Icon size={15} style={{ color: category.color || '#0057b8' }} />
                    <span className="truncate">{category.name}</span>
                    <span className="ml-auto text-[10px] text-slate-400">{category._articles.length}</span>
                  </button>
                </div>

                {category._open && (
                  <div className="ml-8 border-l border-slate-200 py-1">
                    {subcategories.map(subcategory => (
                      <div key={subcategory.label} className="wiki-sidebar-subitem text-slate-400">
                        <subcategory.icon size={12} />
                        <span className="truncate">{subcategory.label}</span>
                      </div>
                    ))}
                    {category._articles.map(article => (
                      <button
                        key={article.id}
                        onClick={() => onSelect(article)}
                        className={cn(
                          'wiki-sidebar-article',
                          selectedArticle?.id === article.id && 'wiki-sidebar-article-active'
                        )}
                      >
                        <FileText size={12} />
                        <span className="truncate">{article.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>
    </div>
  );
}

function WikiHome({
  categories,
  allArticles,
  loading,
  selectedCat,
  setSelectedCat,
  recentlyUpdated,
  onOpen,
  onEdit,
  onNew,
}: {
  categories: CategoryWithArticles[];
  allArticles: WikiArticle[];
  loading: boolean;
  selectedCat: string | null;
  setSelectedCat: (value: string | null) => void;
  recentlyUpdated: WikiArticle[];
  onOpen: (article: WikiArticle) => void;
  onEdit: (article: WikiArticle) => void;
  onNew: () => void;
}) {
  return (
    <div className="wiki-home">
      <section className="wiki-hero">
        <div className="max-w-2xl">
          <p className="wiki-eyebrow">WIKI NEX 2.0</p>
          <h2>Base viva de processos, padrões e inteligência operacional.</h2>
          <p>
            Navegue por áreas, encontre procedimentos críticos e mantenha a operação alinhada com leitura limpa, busca rápida e conteúdo versionável.
          </p>
        </div>
        <div className="wiki-hero-stats">
          <Metric label="Artigos" value={allArticles.length.toString()} />
          <Metric label="Áreas" value={categories.length.toString()} />
          <Metric label="Saúde" value="94%" />
        </div>
      </section>

      <section className="wiki-category-strip">
        <button
          onClick={() => setSelectedCat(null)}
          className={cn('wiki-category-pill', !selectedCat && 'wiki-category-pill-active')}
        >
          <BookOpen size={15} />
          Todas
        </button>
        {categories.map(category => {
          const Icon = CATEGORY_ICONS[category.name] || Folder;
          const active = selectedCat === category.name;

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCat(active ? null : category.name)}
              className={cn('wiki-category-pill', active && 'wiki-category-pill-active')}
              style={active ? { backgroundColor: category.color || '#0057b8', borderColor: category.color || '#0057b8' } : undefined}
            >
              <Icon size={15} />
              {category.name}
              <span>{category._articles.length}</span>
            </button>
          );
        })}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <section className="space-y-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="wiki-panel p-5">
                <div className="h-4 w-36 rounded bg-slate-200 animate-pulse mb-4" />
                <div className="space-y-3">
                  <div className="h-16 rounded bg-slate-100 animate-pulse" />
                  <div className="h-16 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
            ))
          ) : (
            categories.map(category => {
              if (category._articles.length === 0) return null;
              const Icon = CATEGORY_ICONS[category.name] || Folder;

              return (
                <div key={category.id} className="wiki-panel">
                  <div className="wiki-section-head">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="wiki-section-icon" style={{ backgroundColor: `${category.color || '#0057b8'}18` }}>
                        <Icon size={18} style={{ color: category.color || '#0057b8' }} />
                      </div>
                      <div className="min-w-0">
                        <h3>{category.name}</h3>
                        <p>{category.description || `${category._articles.length} artigos disponíveis`}</p>
                      </div>
                    </div>
                    <button onClick={onNew} className="wiki-muted-button">
                      <Plus size={14} />
                      Adicionar
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {category._articles.map(article => (
                      <ArticleRow
                        key={article.id}
                        article={article}
                        onOpen={() => onOpen(article)}
                        onEdit={() => onEdit(article)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {!loading && allArticles.length === 0 && (
            <div className="wiki-empty-state">
              <BookOpen size={44} />
              <h3>Comece a Wiki</h3>
              <p>Crie o primeiro artigo de documentação da equipe.</p>
              <button onClick={onNew} className="wiki-primary-button">
                <Plus size={16} />
                Criar artigo
              </button>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="wiki-panel p-5">
            <div className="wiki-aside-title">
              <History size={16} />
              Atualizações recentes
            </div>
            <div className="space-y-1">
              {recentlyUpdated.map(article => (
                <button key={article.id} onClick={() => onOpen(article)} className="wiki-recent-item">
                  <span className="truncate">{article.title}</span>
                  <small>{timeAgo(article.updated_at)}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="wiki-panel p-5">
            <div className="wiki-aside-title">
              <ShieldCheck size={16} />
              Operação 2.0
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="wiki-governance-item">
                <Globe size={15} />
                <span>Conteúdos publicados por área e prontos para consulta</span>
              </div>
              <div className="wiki-governance-item">
                <History size={15} />
                <span>Estrutura preparada para versionamento e auditoria</span>
              </div>
              <div className="wiki-governance-item">
                <Tag size={15} />
                <span>Tags, categorias e trilhas por contexto operacional</span>
              </div>
            </div>
          </div>

          <div className="wiki-panel p-5">
            <div className="wiki-aside-title">
              <TrendingUp size={16} />
              Maturidade da Base
            </div>
            <div className="space-y-3">
              {[
                { label: 'Cobertura de processos', value: 86, color: '#0057b8' },
                { label: 'Artigos revisados', value: 72, color: '#ff7a00' },
                { label: 'Padrões críticos', value: 94, color: '#16a34a' },
              ].map(item => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SearchResults({
  query,
  results,
  onOpen,
  onEdit,
  onNew,
}: {
  query: string;
  results: WikiArticle[];
  onOpen: (article: WikiArticle) => void;
  onEdit: (article: WikiArticle) => void;
  onNew: () => void;
}) {
  return (
    <div className="wiki-home">
      <div className="wiki-page-title">
        <div>
          <p className="wiki-eyebrow">Busca</p>
          <h2>{results.length} resultado(s) para "{query}"</h2>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="wiki-empty-state">
          <Search size={44} />
          <h3>Nada encontrado</h3>
          <p>Crie um artigo novo para documentar este assunto.</p>
          <button onClick={onNew} className="wiki-primary-button">
            <Plus size={16} />
            Criar artigo
          </button>
        </div>
      ) : (
        <div className="wiki-panel divide-y divide-slate-100">
          {results.map(article => (
            <ArticleRow
              key={article.id}
              article={article}
              onOpen={() => onOpen(article)}
              onEdit={() => onEdit(article)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleView({
  article,
  toc,
  onBack,
  onEdit,
}: {
  article: WikiArticle;
  toc: TocItem[];
  onBack: () => void;
  onEdit: () => void;
}) {
  const category = article.categories;
  const author = article.users;
  const Icon = category?.name ? CATEGORY_ICONS[category.name] || BookOpen : BookOpen;
  const articleBody = removeLeadingTitle(article.content || '');

  return (
    <div className="wiki-document-layout">
      <article className="wiki-document">
        <div className="wiki-breadcrumb">
          <button onClick={onBack}>
            <ArrowLeft size={14} />
            Wiki
          </button>
          <ChevronRight size={13} />
          <span>{category?.name || 'Sem categoria'}</span>
        </div>

        <header className="wiki-document-header">
          <div className="flex items-center gap-2 mb-4">
            <span className="wiki-document-category" style={{ color: category?.color || '#0057b8', backgroundColor: `${category?.color || '#0057b8'}14` }}>
              <Icon size={14} />
              {category?.name || 'Geral'}
            </span>
            <span className="wiki-status-badge">
              <Globe size={12} />
              Publicado
            </span>
          </div>
          <h2>{article.title}</h2>
          <div className="wiki-document-meta">
            {author && (
              <span className="flex items-center gap-2">
                <img
                  src={author.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&size=24&background=0057b8&color=fff`}
                  alt={author.name}
                />
                {author.name}
              </span>
            )}
            <span>Atualizado {timeAgo(article.updated_at)}</span>
            <span>Revisado em {formatDate(article.updated_at)}</span>
          </div>
        </header>

        <div
          className="wiki-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(articleBody) }}
        />

        {!article.content && (
          <div className="wiki-empty-state my-8">
            <FileText size={40} />
            <h3>Artigo sem conteúdo</h3>
            <p>Adicione instruções, passos ou referências para a equipe.</p>
            <button onClick={onEdit} className="wiki-primary-button">
              <Edit3 size={16} />
              Editar artigo
            </button>
          </div>
        )}
      </article>

      <aside className="wiki-right-rail">
        <div className="wiki-panel p-4">
          <button onClick={onEdit} className="wiki-primary-button w-full justify-center mb-3">
            <Edit3 size={15} />
            Editar página
          </button>
          <button className="wiki-secondary-action">
            <History size={15} />
            Histórico
          </button>
          <button className="wiki-secondary-action">
            <Star size={15} />
            Favoritar
          </button>
        </div>

        <div className="wiki-panel p-4">
          <div className="wiki-aside-title">
            <ListTree size={16} />
            Nesta página
          </div>
          {toc.length > 0 ? (
            <nav className="space-y-1">
              {toc.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn('wiki-toc-link', item.level === 3 && 'pl-5')}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          ) : (
            <p className="text-xs text-slate-400">Sem subtítulos neste artigo.</p>
          )}
        </div>

        <div className="wiki-panel p-4">
          <div className="wiki-aside-title">
            <Tag size={16} />
            Tags
          </div>
          <div className="flex flex-wrap gap-2">
            {(article.tags || ['documentação']).map(tag => (
              <span key={tag} className="wiki-tag">{tag}</span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function EditorView({
  mode,
  article,
  categories,
  editContent,
  editTitle,
  editTab,
  newArticleTitle,
  newArticleCat,
  setEditContent,
  setEditTitle,
  setEditTab,
  setNewArticleTitle,
  setNewArticleCat,
  onBack,
}: {
  mode: 'edit' | 'new';
  article: WikiArticle | null;
  categories: CategoryWithArticles[];
  editContent: string;
  editTitle: string;
  editTab: EditorTab;
  newArticleTitle: string;
  newArticleCat: string;
  setEditContent: (value: string) => void;
  setEditTitle: (value: string) => void;
  setEditTab: (value: EditorTab) => void;
  setNewArticleTitle: (value: string) => void;
  setNewArticleCat: (value: string) => void;
  onBack: () => void;
}) {
  const title = mode === 'new' ? newArticleTitle : editTitle;

  return (
    <div className="wiki-editor">
      <div className="wiki-editor-toolbar">
        <button onClick={onBack} className="wiki-muted-button">
          <ArrowLeft size={15} />
          Voltar
        </button>
        <div className="min-w-0">
          <p className="wiki-eyebrow">{mode === 'new' ? 'Novo artigo' : 'Editando'}</p>
          <h2>{mode === 'new' ? 'Nova página da Wiki' : article?.title}</h2>
        </div>
        <button className="wiki-primary-button ml-auto">
          <Save size={16} />
          Salvar
        </button>
      </div>

      <section className="wiki-editor-card">
        <div className="wiki-editor-titlebar">
          {mode === 'new' && (
            <select
              value={newArticleCat}
              onChange={event => setNewArticleCat(event.target.value)}
              className="wiki-editor-select"
            >
              <option value="">Selecionar categoria...</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          )}
          <input
            type="text"
            placeholder="Título do artigo"
            value={title}
            onChange={event => mode === 'new' ? setNewArticleTitle(event.target.value) : setEditTitle(event.target.value)}
          />
        </div>

        <div className="wiki-editor-tabs">
          <button
            onClick={() => setEditTab('write')}
            className={cn(editTab === 'write' && 'active')}
          >
            <Code2 size={14} />
            Escrever
          </button>
          <button
            onClick={() => setEditTab('preview')}
            className={cn(editTab === 'preview' && 'active')}
          >
            <Eye size={14} />
            Visualizar
          </button>
        </div>

        {editTab === 'write' ? (
          <textarea
            value={editContent}
            onChange={event => setEditContent(event.target.value)}
            placeholder={`# Título principal\n\n## Objetivo\n\nDescreva o processo.\n\n## Procedimento\n\n1. Primeiro passo\n2. Segundo passo\n\n\`\`\`bash\n# exemplo\necho "Rede Nex"\n\`\`\``}
            spellCheck={false}
          />
        ) : (
          <div className="wiki-editor-preview">
            {editContent ? (
              <div className="wiki-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(editContent) }} />
            ) : (
              <p className="text-sm text-slate-400 italic">Nenhum conteúdo para visualizar.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function ArticleRow({
  article,
  onOpen,
  onEdit,
}: {
  article: WikiArticle;
  onOpen: () => void;
  onEdit: () => void;
}) {
  const category = article.categories;
  const author = article.users;

  return (
    <div className="wiki-article-row group" onClick={onOpen}>
      <div className="wiki-article-icon" style={{ color: category?.color || '#0057b8', backgroundColor: `${category?.color || '#0057b8'}14` }}>
        <FileText size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4>{article.title}</h4>
          {category?.name && <span className="wiki-row-category">{category.name}</span>}
        </div>
        <p>{stripMarkdown(article.content).slice(0, 150) || 'Sem resumo disponível.'}</p>
        <div className="wiki-row-meta">
          {author?.name && <span>{author.name}</span>}
          <span>Atualizado {timeAgo(article.updated_at)}</span>
          {article.tags?.slice(0, 2).map(tag => <span key={tag}>#{tag}</span>)}
        </div>
      </div>
      <button
        onClick={event => {
          event.stopPropagation();
          onEdit();
        }}
        className="wiki-row-edit"
        title="Editar artigo"
      >
        <Edit3 size={16} />
      </button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="wiki-metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
