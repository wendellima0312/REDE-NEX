-- Rede Nex local PostgreSQL schema
-- Run with: psql -d rede_nex -f database/local_postgres_schema.sql

begin;

create extension if not exists pgcrypto;

create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  photo_url text,
  cover_url text,
  bio text,
  department_id uuid references departments(id) on delete set null,
  position text,
  phone text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  role_id uuid references roles(id) on delete set null,
  admission_date date,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  color text,
  parent_id uuid references categories(id) on delete set null,
  type text not null default 'training' check (type in ('training', 'wiki')),
  created_at timestamptz not null default now(),
  unique (name, type)
);

create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  color text default '#0057b8',
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references users(id) on delete set null,
  title text,
  content text not null,
  type text not null default 'message' check (type in ('message', 'announcement', 'alert', 'update', 'event', 'poll')),
  image_url text,
  video_url text,
  pinned boolean not null default false,
  visibility text not null default 'company' check (visibility in ('company', 'department', 'community')),
  community_id uuid references communities(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid references users(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'love', 'celebrate', 'insightful')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists post_bookmarks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'moderator', 'member')),
  created_at timestamptz not null default now(),
  unique (community_id, user_id)
);

create table if not exists trainings (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  description text,
  category_id uuid references categories(id) on delete set null,
  thumbnail_url text,
  video_url text,
  pdf_url text,
  duration_minutes integer not null default 0,
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists training_progress (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references trainings(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  progress integer not null default 0 check (progress between 0 and 100),
  completed boolean not null default false,
  completed_at timestamptz,
  started_at timestamptz not null default now(),
  unique (training_id, user_id)
);

create table if not exists wiki_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text,
  category_id uuid references categories(id) on delete set null,
  author_id uuid references users(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wiki_versions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references wiki_articles(id) on delete cascade,
  content text,
  editor_id uuid references users(id) on delete set null,
  version_number integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  public_url text,
  file_name text not null,
  file_type text,
  file_size integer,
  owner_id uuid references users(id) on delete set null,
  context text not null default 'general' check (context in ('avatar', 'cover', 'post', 'wiki', 'training', 'general')),
  post_id uuid references posts(id) on delete cascade,
  wiki_article_id uuid references wiki_articles(id) on delete cascade,
  training_id uuid references trainings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (bucket, path)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  message text,
  type text not null default 'info' check (type in ('info', 'success', 'warning', 'error')),
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid references roles(id) on delete cascade,
  module text not null,
  action text not null,
  allowed boolean not null default true,
  unique (role_id, module, action)
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at before update on users for each row execute function set_updated_at();

drop trigger if exists posts_set_updated_at on posts;
create trigger posts_set_updated_at before update on posts for each row execute function set_updated_at();

drop trigger if exists communities_set_updated_at on communities;
create trigger communities_set_updated_at before update on communities for each row execute function set_updated_at();

drop trigger if exists trainings_set_updated_at on trainings;
create trigger trainings_set_updated_at before update on trainings for each row execute function set_updated_at();

drop trigger if exists wiki_articles_set_updated_at on wiki_articles;
create trigger wiki_articles_set_updated_at before update on wiki_articles for each row execute function set_updated_at();

create index if not exists users_department_idx on users(department_id);
create index if not exists users_role_idx on users(role_id);
create index if not exists posts_author_idx on posts(author_id);
create index if not exists posts_created_at_idx on posts(created_at desc);
create index if not exists posts_community_idx on posts(community_id);
create index if not exists comments_post_idx on comments(post_id);
create index if not exists post_reactions_post_idx on post_reactions(post_id);
create index if not exists post_bookmarks_user_idx on post_bookmarks(user_id);
create index if not exists community_members_community_idx on community_members(community_id);
create index if not exists categories_type_idx on categories(type);
create index if not exists trainings_category_idx on trainings(category_id);
create index if not exists wiki_articles_category_idx on wiki_articles(category_id);
create index if not exists media_assets_owner_idx on media_assets(owner_id);
create index if not exists notifications_user_idx on notifications(user_id);
create index if not exists permissions_role_idx on permissions(role_id);

insert into departments (name, description) values
  ('Suporte Tecnico', 'Suporte tecnico aos clientes'),
  ('NOC', 'Centro de Operacoes de Rede'),
  ('Comercial', 'Equipe comercial e vendas'),
  ('Financeiro', 'Gestao financeira'),
  ('CSC', 'Central de Servicos ao Cliente'),
  ('Infraestrutura', 'Infraestrutura de rede'),
  ('Recursos Humanos', 'Gestao de pessoas')
on conflict (name) do update set description = excluded.description;

insert into roles (name, description) values
  ('Administrador', 'Controle total do sistema'),
  ('Gestor', 'Gerenciamento do setor e publicacoes'),
  ('Editor', 'Pode criar e editar conteudos'),
  ('Colaborador', 'Somente visualizacao e interacao')
on conflict (name) do update set description = excluded.description;

insert into categories (name, description, icon, color, type) values
  ('Suporte Tecnico', 'Treinamentos de suporte tecnico', 'Wrench', '#ff7a00', 'training'),
  ('NOC', 'Treinamentos do Centro de Operacoes', 'Network', '#0057b8', 'training'),
  ('Comercial', 'Treinamentos da equipe comercial', 'TrendingUp', '#16a34a', 'training'),
  ('Financeiro', 'Treinamentos financeiros', 'DollarSign', '#9333ea', 'training'),
  ('CSC', 'Treinamentos do CSC', 'Headphones', '#db2777', 'training'),
  ('Infraestrutura', 'Treinamentos de infraestrutura', 'Server', '#ca8a04', 'training'),
  ('Recursos Humanos', 'Treinamentos de RH', 'Users', '#0891b2', 'training'),
  ('Atendimento', 'Processos de atendimento ao cliente', 'HeadphonesIcon', '#ff7a00', 'wiki'),
  ('Suporte Tecnico', 'Documentacao tecnica', 'Wrench', '#0057b8', 'wiki'),
  ('NOC', 'Processos do NOC', 'Network', '#16a34a', 'wiki'),
  ('Financeiro', 'Processos financeiros', 'DollarSign', '#9333ea', 'wiki'),
  ('Comercial', 'Processos comerciais', 'TrendingUp', '#db2777', 'wiki'),
  ('RH', 'Processos de RH', 'Users', '#ca8a04', 'wiki')
on conflict (name, type) do update set description = excluded.description, icon = excluded.icon, color = excluded.color;

commit;
