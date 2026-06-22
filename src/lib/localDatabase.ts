import type { Category, Post, Training, User, WikiArticle } from '../types';

type DepartmentSeed = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
};

type RoleSeed = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
};

const now = new Date().toISOString();

const departments: DepartmentSeed[] = [
  { id: 'dept-suporte', name: 'Suporte Tecnico', description: 'Suporte tecnico aos clientes', created_at: now },
  { id: 'dept-noc', name: 'NOC', description: 'Centro de Operacoes de Rede', created_at: now },
  { id: 'dept-comercial', name: 'Comercial', description: 'Equipe comercial e vendas', created_at: now },
  { id: 'dept-financeiro', name: 'Financeiro', description: 'Gestao financeira', created_at: now },
  { id: 'dept-csc', name: 'CSC', description: 'Central de Servicos ao Cliente', created_at: now },
  { id: 'dept-infra', name: 'Infraestrutura', description: 'Infraestrutura de rede', created_at: now },
  { id: 'dept-rh', name: 'Recursos Humanos', description: 'Gestao de pessoas', created_at: now },
];

const roles: RoleSeed[] = [
  { id: 'role-admin', name: 'Administrador', description: 'Controle total do sistema', created_at: now },
  { id: 'role-gestor', name: 'Gestor', description: 'Gerenciamento do setor e publicacoes', created_at: now },
  { id: 'role-editor', name: 'Editor', description: 'Pode criar e editar conteudos', created_at: now },
  { id: 'role-colab', name: 'Colaborador', description: 'Somente visualizacao e interacao', created_at: now },
];

const users: User[] = [
  {
    id: 'user-ana',
    name: 'Ana Beatriz Santos',
    email: 'ana.beatriz@nextelecom.com.br',
    photo_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    department_id: 'dept-rh',
    position: 'Gestora de RH',
    status: 'active',
    role_id: 'role-gestor',
    admission_date: '2022-03-15',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'user-lucas',
    name: 'Lucas Alves',
    email: 'lucas.alves@nextelecom.com.br',
    photo_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    department_id: 'dept-suporte',
    position: 'Tecnico de Suporte',
    status: 'active',
    role_id: 'role-colab',
    admission_date: '2023-01-10',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'user-mariana',
    name: 'Mariana Costa',
    email: 'mariana.costa@nextelecom.com.br',
    photo_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    department_id: 'dept-noc',
    position: 'Analista de NOC',
    status: 'active',
    role_id: 'role-editor',
    admission_date: '2021-07-20',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'user-pedro',
    name: 'Pedro Henrique',
    email: 'pedro.henrique@nextelecom.com.br',
    photo_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    department_id: 'dept-comercial',
    position: 'Gerente Comercial',
    status: 'active',
    role_id: 'role-admin',
    admission_date: '2020-05-01',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'user-fernanda',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@nextelecom.com.br',
    photo_url: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
    department_id: 'dept-financeiro',
    position: 'Analista Financeira',
    status: 'active',
    role_id: 'role-colab',
    admission_date: '2022-11-15',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'user-rafael',
    name: 'Rafael Souza',
    email: 'rafael.souza@nextelecom.com.br',
    photo_url: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150',
    department_id: 'dept-infra',
    position: 'Engenheiro de Infraestrutura',
    status: 'active',
    role_id: 'role-editor',
    admission_date: '2021-02-01',
    created_at: now,
    updated_at: now,
  },
];

const categories: Category[] = [
  { id: 'cat-training-suporte', name: 'Suporte Tecnico', description: 'Treinamentos de suporte tecnico', icon: 'Wrench', color: '#ff7a00', type: 'training', created_at: now },
  { id: 'cat-training-noc', name: 'NOC', description: 'Treinamentos do Centro de Operacoes', icon: 'Network', color: '#0057b8', type: 'training', created_at: now },
  { id: 'cat-training-comercial', name: 'Comercial', description: 'Treinamentos da equipe comercial', icon: 'TrendingUp', color: '#16a34a', type: 'training', created_at: now },
  { id: 'cat-training-financeiro', name: 'Financeiro', description: 'Treinamentos financeiros', icon: 'DollarSign', color: '#9333ea', type: 'training', created_at: now },
  { id: 'cat-training-csc', name: 'CSC', description: 'Treinamentos do CSC', icon: 'Headphones', color: '#db2777', type: 'training', created_at: now },
  { id: 'cat-training-infra', name: 'Infraestrutura', description: 'Treinamentos de infraestrutura', icon: 'Server', color: '#ca8a04', type: 'training', created_at: now },
  { id: 'cat-training-rh', name: 'Recursos Humanos', description: 'Treinamentos de RH', icon: 'Users', color: '#0891b2', type: 'training', created_at: now },
  { id: 'cat-wiki-atendimento', name: 'Atendimento', description: 'Processos de atendimento ao cliente', icon: 'HeadphonesIcon', color: '#ff7a00', type: 'wiki', created_at: now },
  { id: 'cat-wiki-suporte', name: 'Suporte Tecnico', description: 'Documentacao tecnica', icon: 'Wrench', color: '#0057b8', type: 'wiki', created_at: now },
  { id: 'cat-wiki-noc', name: 'NOC', description: 'Processos do NOC', icon: 'Network', color: '#16a34a', type: 'wiki', created_at: now },
  { id: 'cat-wiki-financeiro', name: 'Financeiro', description: 'Processos financeiros', icon: 'DollarSign', color: '#9333ea', type: 'wiki', created_at: now },
  { id: 'cat-wiki-comercial', name: 'Comercial', description: 'Processos comerciais', icon: 'TrendingUp', color: '#db2777', type: 'wiki', created_at: now },
  { id: 'cat-wiki-rh', name: 'RH', description: 'Processos de RH', icon: 'Users', color: '#ca8a04', type: 'wiki', created_at: now },
];

let posts: Post[] = [
  {
    id: 'post-1',
    author_id: 'user-pedro',
    title: 'Bem-vindos a Rede Nex!',
    content: 'Apresentamos a nova plataforma corporativa da Nex Telecom. A Rede Nex sera nosso espaco central para comunicacao, treinamento e compartilhamento de conhecimento.',
    type: 'announcement',
    pinned: true,
    created_at: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
    updated_at: now,
  },
  {
    id: 'post-2',
    author_id: 'user-mariana',
    title: 'Meta comercial superada',
    content: 'Fechamos a semana com 127% da meta. Destaque para as indicacoes vindas do atendimento e para o novo script de abordagem consultiva.',
    type: 'update',
    pinned: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: now,
  },
  {
    id: 'post-3',
    author_id: 'user-lucas',
    title: 'Manutencao programada no backbone',
    content: 'Hoje as 23h iniciaremos uma janela de manutencao no backbone principal. A equipe de NOC estara em plantao.',
    type: 'alert',
    pinned: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updated_at: now,
  },
];

const trainings: Training[] = [
  { id: 'training-onu-gpon', title: 'Configuracao de ONU GPON', description: 'Aprenda a configurar equipamentos ONU para conexoes GPON de forma eficiente.', category_id: 'cat-training-suporte', duration_minutes: 60, level: 'intermediate', status: 'published', created_by: 'user-rafael', created_at: now, updated_at: now },
  { id: 'training-backbone', title: 'Monitoramento de Backbone', description: 'Tecnicas avancadas de monitoramento de backbone e deteccao de falhas.', category_id: 'cat-training-noc', duration_minutes: 90, level: 'advanced', status: 'published', created_by: 'user-mariana', created_at: now, updated_at: now },
  { id: 'training-vendas', title: 'Tecnicas de Vendas Consultivas', description: 'Desenvolva habilidades de vendas consultivas para o mercado de telecomunicacoes.', category_id: 'cat-training-comercial', duration_minutes: 45, level: 'beginner', status: 'published', created_by: 'user-pedro', created_at: now, updated_at: now },
  { id: 'training-mesh', title: 'Configuracao de Mesh Wi-Fi', description: 'Instalacao e configuracao de sistemas Mesh Wi-Fi residencial e empresarial.', category_id: 'cat-training-suporte', duration_minutes: 30, level: 'beginner', status: 'published', created_by: 'user-rafael', created_at: now, updated_at: now },
  { id: 'training-cobranca', title: 'Cobranca e Negociacao', description: 'Estrategias eficazes de cobranca e negociacao com clientes inadimplentes.', category_id: 'cat-training-financeiro', duration_minutes: 50, level: 'intermediate', status: 'published', created_by: 'user-fernanda', created_at: now, updated_at: now },
];

const wikiArticles: WikiArticle[] = [
  {
    id: 'wiki-atendimento-1',
    title: 'Procedimento de Atendimento ao Cliente',
    slug: 'procedimento-atendimento-cliente',
    content: '# Procedimento de Atendimento ao Cliente\n\n## Objetivo\nPadronizar o atendimento ao cliente garantindo qualidade e eficiencia.\n\n## Fluxo de Atendimento\n\n1. Saudacao inicial: cumprimentar o cliente de forma cordial\n2. Identificacao: solicitar CPF/CNPJ e confirmar dados\n3. Diagnostico: ouvir e entender a solicitacao do cliente\n4. Resolucao: executar procedimento adequado\n5. Encerramento: confirmar resolucao e despedir-se\n\n## Pontos Importantes\n\n- Sempre manter tom profissional e empatico\n- Registrar todas as interacoes no sistema\n- Tempo maximo de espera: 3 minutos\n- Escalar para supervisor quando necessario',
    category_id: 'cat-wiki-atendimento',
    author_id: 'user-ana',
    status: 'published',
    tags: ['atendimento', 'clientes', 'procedimentos'],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'wiki-suporte-1',
    title: 'Configuracao de OLT Huawei',
    slug: 'configuracao-olt-huawei',
    content: '# Configuracao de OLT Huawei\n\n## Requisitos\n- Acesso SSH a OLT\n- Credenciais de administrador\n- Manual do equipamento\n\n## Procedimento\n\n### 1. Acesso ao Equipamento\n```bash\nssh admin@192.168.1.1\n```\n\n### 2. Configuracao de VLAN\n```text\nvlan 100 smart\nport vlan 100 0/0 0\n```\n\n## Troubleshooting\n- ONU nao registra: verificar serial number\n- Sem sinal: verificar atenuacao da fibra\n- Lentidao: verificar perfil de velocidade',
    category_id: 'cat-wiki-suporte',
    author_id: 'user-rafael',
    status: 'published',
    tags: ['olt', 'gpon', 'huawei', 'configuracao'],
    created_at: now,
    updated_at: now,
  },
  {
    id: 'wiki-financeiro-1',
    title: 'Processo de Cobranca',
    slug: 'processo-cobranca',
    content: '# Processo de Cobranca\n\n## Regua de Cobranca\n\n| Dias de Atraso | Acao |\n|---|---|\n| 1-5 dias | SMS automatico |\n| 6-10 dias | Ligacao ativa |\n| 11-20 dias | Suspensao do servico |\n| 21-30 dias | Negociacao especial |\n| +30 dias | Cobranca juridica |\n\n## Script de Negociacao\n\n1. Identificar o cliente\n2. Informar o valor em atraso\n3. Oferecer opcoes de parcelamento\n4. Registrar acordo no sistema\n5. Enviar confirmacao por e-mail',
    category_id: 'cat-wiki-financeiro',
    author_id: 'user-fernanda',
    status: 'published',
    tags: ['cobranca', 'inadimplencia', 'negociacao'],
    created_at: now,
    updated_at: now,
  },
];

function wait() {
  return new Promise(resolve => window.setTimeout(resolve, 180));
}

function withUserRelations<T extends { author_id?: string; created_by?: string; category_id?: string }>(record: T) {
  const userId = record.author_id || record.created_by;
  const user = users.find(item => item.id === userId);
  const category = categories.find(item => item.id === record.category_id);

  return {
    ...record,
    users: user ? { ...user, departments: departments.find(item => item.id === user.department_id), roles: roles.find(item => item.id === user.role_id) } : undefined,
    categories: category,
  };
}

function withPostRelations(post: Post): Post {
  const author = users.find(item => item.id === post.author_id);
  return {
    ...post,
    users: author ? { ...author, departments: departments.find(item => item.id === author.department_id), roles: roles.find(item => item.id === author.role_id) } : undefined,
    likes: [],
    comments: [],
  };
}

export const localDatabase = {
  async getDashboardData() {
    await wait();
    return {
      stats: {
        users: users.length,
        trainings: trainings.filter(item => item.status === 'published').length,
        articles: wikiArticles.filter(item => item.status === 'published').length,
        posts: posts.length,
      },
      recentPosts: posts
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(withPostRelations),
    };
  },

  async getFeedPosts() {
    await wait();
    return posts
      .slice()
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(withPostRelations);
  },

  async createPost(content: string, type: Post['type']) {
    await wait();
    const post: Post = {
      id: `post-${Date.now()}`,
      author_id: 'user-pedro',
      content,
      type,
      pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    posts = [post, ...posts];
    return withPostRelations(post);
  },

  async getUsers() {
    await wait();
    return users
      .map(user => ({
        ...user,
        departments: departments.find(item => item.id === user.department_id) ?? null,
        roles: roles.find(item => item.id === user.role_id) ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getDepartments() {
    await wait();
    return departments.slice().sort((a, b) => a.name.localeCompare(b.name));
  },

  async getTrainingData() {
    await wait();
    return {
      trainings: trainings
        .filter(item => item.status === 'published')
        .map(item => withUserRelations(item) as Training)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      categories: categories
        .filter(item => item.type === 'training')
        .sort((a, b) => a.name.localeCompare(b.name)),
    };
  },

  async getWikiData() {
    await wait();
    return {
      categories: categories
        .filter(item => item.type === 'wiki')
        .sort((a, b) => a.name.localeCompare(b.name)),
      articles: wikiArticles
        .filter(item => item.status === 'published')
        .map(item => withUserRelations(item) as WikiArticle)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    };
  },
};
