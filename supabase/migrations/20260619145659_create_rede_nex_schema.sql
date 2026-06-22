
-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_departments" ON departments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_departments" ON departments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_departments" ON departments FOR DELETE TO authenticated USING (true);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_roles" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_roles" ON roles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_roles" ON roles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_roles" ON roles FOR DELETE TO authenticated USING (true);

-- Users (collaborators profile)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  photo_url text,
  department_id uuid REFERENCES departments(id),
  position text,
  phone text,
  status text DEFAULT 'active' CHECK (status IN ('active','inactive')),
  role_id uuid REFERENCES roles(id),
  admission_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_users" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_users" ON users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_users" ON users FOR DELETE TO authenticated USING (true);

-- Posts (Feed)
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES users(id),
  title text,
  content text NOT NULL,
  type text DEFAULT 'message' CHECK (type IN ('message','announcement','alert','update','event','poll')),
  image_url text,
  video_url text,
  pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_posts" ON posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_posts" ON posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_posts" ON posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_posts" ON posts FOR DELETE TO authenticated USING (true);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_comments" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_comments" ON comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_comments" ON comments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_comments" ON comments FOR DELETE TO authenticated USING (true);

-- Likes
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_likes" ON likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_likes" ON likes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_likes" ON likes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_likes" ON likes FOR DELETE TO authenticated USING (true);

-- Categories (for training)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  color text,
  parent_id uuid REFERENCES categories(id),
  type text DEFAULT 'training' CHECK (type IN ('training','wiki')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_categories" ON categories FOR DELETE TO authenticated USING (true);

-- Trainings
CREATE TABLE IF NOT EXISTS trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id),
  thumbnail_url text,
  video_url text,
  pdf_url text,
  duration_minutes integer DEFAULT 0,
  level text DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','advanced')),
  status text DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_trainings" ON trainings FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_trainings" ON trainings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_trainings" ON trainings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_trainings" ON trainings FOR DELETE TO authenticated USING (true);

-- Training Progress
CREATE TABLE IF NOT EXISTS training_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid REFERENCES trainings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  progress integer DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  completed boolean DEFAULT false,
  completed_at timestamptz,
  started_at timestamptz DEFAULT now(),
  UNIQUE(training_id, user_id)
);

ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_training_progress" ON training_progress FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_training_progress" ON training_progress FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_training_progress" ON training_progress FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_training_progress" ON training_progress FOR DELETE TO authenticated USING (true);

-- Wiki Articles
CREATE TABLE IF NOT EXISTS wiki_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  category_id uuid REFERENCES categories(id),
  author_id uuid REFERENCES users(id),
  status text DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wiki_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_wiki_articles" ON wiki_articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_wiki_articles" ON wiki_articles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_wiki_articles" ON wiki_articles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_wiki_articles" ON wiki_articles FOR DELETE TO authenticated USING (true);

-- Wiki Versions
CREATE TABLE IF NOT EXISTS wiki_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES wiki_articles(id) ON DELETE CASCADE,
  content text,
  editor_id uuid REFERENCES users(id),
  version_number integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wiki_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_wiki_versions" ON wiki_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_wiki_versions" ON wiki_versions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_wiki_versions" ON wiki_versions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_wiki_versions" ON wiki_versions FOR DELETE TO authenticated USING (true);

-- Attachments
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  url text NOT NULL,
  file_type text,
  file_size integer,
  post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  training_id uuid REFERENCES trainings(id) ON DELETE SET NULL,
  wiki_article_id uuid REFERENCES wiki_articles(id) ON DELETE SET NULL,
  uploaded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_attachments" ON attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_attachments" ON attachments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_attachments" ON attachments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_attachments" ON attachments FOR DELETE TO authenticated USING (true);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  title text NOT NULL,
  message text,
  type text DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_notifications" ON notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_notifications" ON notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_notifications" ON notifications FOR DELETE TO authenticated USING (true);

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  module text NOT NULL,
  action text NOT NULL,
  allowed boolean DEFAULT true,
  UNIQUE(role_id, module, action)
);

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_permissions" ON permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_permissions" ON permissions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_permissions" ON permissions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_permissions" ON permissions FOR DELETE TO authenticated USING (true);

-- Seed data
INSERT INTO departments (name, description) VALUES
  ('Suporte Técnico', 'Suporte técnico aos clientes'),
  ('NOC', 'Centro de Operações de Rede'),
  ('Comercial', 'Equipe comercial e vendas'),
  ('Financeiro', 'Gestão financeira'),
  ('CSC', 'Central de Serviços ao Cliente'),
  ('Infraestrutura', 'Infraestrutura de rede'),
  ('Recursos Humanos', 'Gestão de pessoas');

INSERT INTO roles (name, description) VALUES
  ('Administrador', 'Controle total do sistema'),
  ('Gestor', 'Gerenciamento do setor e publicações'),
  ('Editor', 'Pode criar e editar conteúdos'),
  ('Colaborador', 'Somente visualização e interação');

INSERT INTO users (name, email, position, status, role_id, department_id, admission_date, photo_url)
SELECT 
  'Ana Beatriz Santos', 'ana.beatriz@nextelecom.com.br', 'Gestora de RH', 'active', r.id, d.id, '2022-03-15',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
FROM roles r, departments d WHERE r.name = 'Gestor' AND d.name = 'Recursos Humanos';

INSERT INTO users (name, email, position, status, role_id, department_id, admission_date, photo_url)
SELECT 
  'Lucas Alves', 'lucas.alves@nextelecom.com.br', 'Técnico de Suporte', 'active', r.id, d.id, '2023-01-10',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
FROM roles r, departments d WHERE r.name = 'Colaborador' AND d.name = 'Suporte Técnico';

INSERT INTO users (name, email, position, status, role_id, department_id, admission_date, photo_url)
SELECT 
  'Mariana Costa', 'mariana.costa@nextelecom.com.br', 'Analista de NOC', 'active', r.id, d.id, '2021-07-20',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
FROM roles r, departments d WHERE r.name = 'Editor' AND d.name = 'NOC';

INSERT INTO users (name, email, position, status, role_id, department_id, admission_date, photo_url)
SELECT 
  'Pedro Henrique', 'pedro.henrique@nextelecom.com.br', 'Gerente Comercial', 'active', r.id, d.id, '2020-05-01',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150'
FROM roles r, departments d WHERE r.name = 'Administrador' AND d.name = 'Comercial';

INSERT INTO users (name, email, position, status, role_id, department_id, admission_date, photo_url)
SELECT 
  'Fernanda Lima', 'fernanda.lima@nextelecom.com.br', 'Analista Financeira', 'active', r.id, d.id, '2022-11-15',
  'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150'
FROM roles r, departments d WHERE r.name = 'Colaborador' AND d.name = 'Financeiro';

INSERT INTO users (name, email, position, status, role_id, department_id, admission_date, photo_url)
SELECT 
  'Rafael Souza', 'rafael.souza@nextelecom.com.br', 'Engenheiro de Infraestrutura', 'active', r.id, d.id, '2021-02-01',
  'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150'
FROM roles r, departments d WHERE r.name = 'Editor' AND d.name = 'Infraestrutura';

-- Seed posts
INSERT INTO posts (author_id, title, content, type, pinned)
SELECT u.id, 'Bem-vindos à Rede Nex!', 
  'Prezados colaboradores, é com grande satisfação que apresentamos a nova plataforma corporativa da Nex Telecom. A Rede Nex será nosso espaço central para comunicação, treinamento e compartilhamento de conhecimento. Contamos com a participação de todos!',
  'announcement', true
FROM users u WHERE u.name = 'Pedro Henrique' LIMIT 1;

INSERT INTO posts (author_id, title, content, type)
SELECT u.id, 'Parabéns Ana Beatriz!', 
  'Neste final de semana foi o aniversário de Ana Beatriz! Desejamos muitas felicidades e saúde para nossa colega querida. Que continue brilhando em tudo que faz!',
  'message'
FROM users u WHERE u.name = 'Lucas Alves' LIMIT 1;

INSERT INTO posts (author_id, title, content, type)
SELECT u.id, 'Manutenção Programada - NOC', 
  'Informamos que haverá manutenção programada no backbone principal nesta sexta-feira, das 00h às 04h. Durante este período, pode haver instabilidade em algumas rotas. Equipe NOC estará de prontidão.',
  'alert'
FROM users u WHERE u.name = 'Mariana Costa' LIMIT 1;

INSERT INTO posts (author_id, title, content, type)
SELECT u.id, 'Meta de Vendas Junho Superada!', 
  'Temos o prazer de comunicar que nossa equipe comercial superou a meta de vendas de junho em 127%! Um resultado extraordinário que demonstra o comprometimento e dedicação de toda a equipe. Parabéns a todos!',
  'update'
FROM users u WHERE u.name = 'Pedro Henrique' LIMIT 1;

-- Seed categories for training
INSERT INTO categories (name, description, icon, color, type) VALUES
  ('Suporte Técnico', 'Treinamentos de suporte técnico', 'Wrench', '#ff7a00', 'training'),
  ('NOC', 'Treinamentos do Centro de Operações', 'Network', '#0057b8', 'training'),
  ('Comercial', 'Treinamentos da equipe comercial', 'TrendingUp', '#16a34a', 'training'),
  ('Financeiro', 'Treinamentos financeiros', 'DollarSign', '#9333ea', 'training'),
  ('CSC', 'Treinamentos do CSC', 'Headphones', '#db2777', 'training'),
  ('Infraestrutura', 'Treinamentos de infraestrutura', 'Server', '#ca8a04', 'training'),
  ('Recursos Humanos', 'Treinamentos de RH', 'Users', '#0891b2', 'training');

-- Seed trainings
INSERT INTO trainings (title, description, category_id, level, status, duration_minutes, created_by)
SELECT 'Configuração de ONU GPON', 'Aprenda a configurar equipamentos ONU para conexões GPON de forma eficiente.', c.id, 'intermediate', 'published', 60,
  (SELECT id FROM users WHERE name = 'Rafael Souza' LIMIT 1)
FROM categories c WHERE c.name = 'Suporte Técnico' AND c.type = 'training';

INSERT INTO trainings (title, description, category_id, level, status, duration_minutes, created_by)
SELECT 'Monitoramento de Backbone', 'Técnicas avançadas de monitoramento de backbone e detecção de falhas.', c.id, 'advanced', 'published', 90,
  (SELECT id FROM users WHERE name = 'Mariana Costa' LIMIT 1)
FROM categories c WHERE c.name = 'NOC' AND c.type = 'training';

INSERT INTO trainings (title, description, category_id, level, status, duration_minutes, created_by)
SELECT 'Técnicas de Vendas Consultivas', 'Desenvolva habilidades de vendas consultivas para o mercado de telecomunicações.', c.id, 'beginner', 'published', 45,
  (SELECT id FROM users WHERE name = 'Pedro Henrique' LIMIT 1)
FROM categories c WHERE c.name = 'Comercial' AND c.type = 'training';

INSERT INTO trainings (title, description, category_id, level, status, duration_minutes, created_by)
SELECT 'Configuração de Mesh Wi-Fi', 'Instalação e configuração de sistemas Mesh Wi-Fi residencial e empresarial.', c.id, 'beginner', 'published', 30,
  (SELECT id FROM users WHERE name = 'Rafael Souza' LIMIT 1)
FROM categories c WHERE c.name = 'Suporte Técnico' AND c.type = 'training';

INSERT INTO trainings (title, description, category_id, level, status, duration_minutes, created_by)
SELECT 'Cobrança e Negociação', 'Estratégias eficazes de cobrança e negociação com clientes inadimplentes.', c.id, 'intermediate', 'published', 50,
  (SELECT id FROM users WHERE name = 'Fernanda Lima' LIMIT 1)
FROM categories c WHERE c.name = 'Financeiro' AND c.type = 'training';

-- Seed wiki categories
INSERT INTO categories (name, description, icon, color, type) VALUES
  ('Atendimento', 'Processos de atendimento ao cliente', 'HeadphonesIcon', '#ff7a00', 'wiki'),
  ('Suporte Técnico', 'Documentação técnica', 'Wrench', '#0057b8', 'wiki'),
  ('NOC', 'Processos do NOC', 'Network', '#16a34a', 'wiki'),
  ('Financeiro', 'Processos financeiros', 'DollarSign', '#9333ea', 'wiki'),
  ('Comercial', 'Processos comerciais', 'TrendingUp', '#db2777', 'wiki'),
  ('RH', 'Processos de RH', 'Users', '#ca8a04', 'wiki');

-- Seed wiki articles
INSERT INTO wiki_articles (title, slug, content, category_id, author_id, status, tags)
SELECT 
  'Procedimento de Atendimento ao Cliente',
  'procedimento-atendimento-cliente',
  E'# Procedimento de Atendimento ao Cliente\n\n## Objetivo\nPadronizar o atendimento ao cliente garantindo qualidade e eficiência.\n\n## Fluxo de Atendimento\n\n1. **Saudação inicial**: Cumprimentar o cliente de forma cordial\n2. **Identificação**: Solicitar CPF/CNPJ e confirmar dados\n3. **Diagnóstico**: Ouvir e entender a solicitação do cliente\n4. **Resolução**: Executar procedimento adequado\n5. **Encerramento**: Confirmar resolução e despedir-se\n\n## Pontos Importantes\n\n- Sempre manter tom profissional e empático\n- Registrar todas as interações no sistema\n- Tempo máximo de espera: 3 minutos\n- Escalar para supervisor quando necessário',
  c.id,
  (SELECT id FROM users WHERE name = 'Ana Beatriz Santos' LIMIT 1),
  'published',
  ARRAY['atendimento', 'clientes', 'procedimentos']
FROM categories c WHERE c.name = 'Atendimento' AND c.type = 'wiki';

INSERT INTO wiki_articles (title, slug, content, category_id, author_id, status, tags)
SELECT 
  'Configuração de OLT Huawei',
  'configuracao-olt-huawei',
  E'# Configuração de OLT Huawei\n\n## Requisitos\n- Acesso SSH à OLT\n- Credenciais de administrador\n- Manual do equipamento\n\n## Procedimento\n\n### 1. Acesso ao Equipamento\n```bash\nssh admin@192.168.1.1\n```\n\n### 2. Configuração de VLAN\n```\nvlan 100 smart\nport vlan 100 0/0 0\n```\n\n### 3. Configuração de ONU\n```\nontadd ont-sn 0 0 [serial] sn-auth "bridge" omci ont-lineprofile-id 10\n```\n\n## Troubleshooting\n- ONU não registra: verificar serial number\n- Sem sinal: verificar atenuação da fibra\n- Lentidão: verificar perfil de velocidade',
  c.id,
  (SELECT id FROM users WHERE name = 'Rafael Souza' LIMIT 1),
  'published',
  ARRAY['OLT', 'GPON', 'Huawei', 'configuração']
FROM categories c WHERE c.name = 'Suporte Técnico' AND c.type = 'wiki';

INSERT INTO wiki_articles (title, slug, content, category_id, author_id, status, tags)
SELECT 
  'Processo de Cobrança',
  'processo-cobranca',
  E'# Processo de Cobrança\n\n## Régua de Cobrança\n\n| Dias de Atraso | Ação |\n|---|---|\n| 1-5 dias | SMS automático |\n| 6-10 dias | Ligação ativa |\n| 11-20 dias | Suspensão do serviço |\n| 21-30 dias | Negociação especial |\n| +30 dias | Cobrança jurídica |\n\n## Script de Negociação\n\n1. Identificar o cliente\n2. Informar o valor em atraso\n3. Oferecer opções de parcelamento\n4. Registrar acordo no sistema\n5. Enviar confirmação por e-mail\n\n## Limites de Desconto\n- Multa e juros: até 100%\n- Valor principal: sem desconto',
  c.id,
  (SELECT id FROM users WHERE name = 'Fernanda Lima' LIMIT 1),
  'published',
  ARRAY['cobrança', 'inadimplência', 'negociação']
FROM categories c WHERE c.name = 'Financeiro' AND c.type = 'wiki';
