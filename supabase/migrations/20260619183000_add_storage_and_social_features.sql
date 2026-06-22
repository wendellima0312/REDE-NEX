-- Rede Nex 2.0 storage and social layer
-- Adds file buckets, media metadata, richer reactions, bookmarks, and communities.

-- User profile enrichments
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Post enrichments
ALTER TABLE posts ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'company'
  CHECK (visibility IN ('company', 'department', 'community'));
ALTER TABLE posts ADD COLUMN IF NOT EXISTS community_id uuid;

-- Central media registry for images, videos, avatars, wiki files, and training files
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  path text NOT NULL,
  public_url text,
  file_name text NOT NULL,
  file_type text,
  file_size integer,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  context text NOT NULL DEFAULT 'general'
    CHECK (context IN ('avatar', 'cover', 'post', 'wiki', 'training', 'general')),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  wiki_article_id uuid REFERENCES wiki_articles(id) ON DELETE CASCADE,
  training_id uuid REFERENCES trainings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(bucket, path)
);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'media_assets' AND policyname = 'select_media_assets'
  ) THEN
    CREATE POLICY "select_media_assets" ON media_assets FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'media_assets' AND policyname = 'insert_media_assets'
  ) THEN
    CREATE POLICY "insert_media_assets" ON media_assets FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'media_assets' AND policyname = 'update_media_assets'
  ) THEN
    CREATE POLICY "update_media_assets" ON media_assets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'media_assets' AND policyname = 'delete_media_assets'
  ) THEN
    CREATE POLICY "delete_media_assets" ON media_assets FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS media_assets_owner_idx ON media_assets(owner_id);
CREATE INDEX IF NOT EXISTS media_assets_context_idx ON media_assets(context);
CREATE INDEX IF NOT EXISTS media_assets_post_idx ON media_assets(post_id);
CREATE INDEX IF NOT EXISTS media_assets_wiki_article_idx ON media_assets(wiki_article_id);

-- Rich post reactions for the social feed
CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  reaction text NOT NULL CHECK (reaction IN ('like', 'love', 'celebrate', 'insightful')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'post_reactions' AND policyname = 'select_post_reactions'
  ) THEN
    CREATE POLICY "select_post_reactions" ON post_reactions FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'post_reactions' AND policyname = 'insert_post_reactions'
  ) THEN
    CREATE POLICY "insert_post_reactions" ON post_reactions FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'post_reactions' AND policyname = 'update_post_reactions'
  ) THEN
    CREATE POLICY "update_post_reactions" ON post_reactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'post_reactions' AND policyname = 'delete_post_reactions'
  ) THEN
    CREATE POLICY "delete_post_reactions" ON post_reactions FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS post_reactions_post_idx ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS post_reactions_user_idx ON post_reactions(user_id);

-- Saved posts
CREATE TABLE IF NOT EXISTS post_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'post_bookmarks' AND policyname = 'select_post_bookmarks'
  ) THEN
    CREATE POLICY "select_post_bookmarks" ON post_bookmarks FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'post_bookmarks' AND policyname = 'insert_post_bookmarks'
  ) THEN
    CREATE POLICY "insert_post_bookmarks" ON post_bookmarks FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'post_bookmarks' AND policyname = 'delete_post_bookmarks'
  ) THEN
    CREATE POLICY "delete_post_bookmarks" ON post_bookmarks FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS post_bookmarks_user_idx ON post_bookmarks(user_id);

-- Feed communities
CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  color text DEFAULT '#0057b8',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'communities' AND policyname = 'select_communities'
  ) THEN
    CREATE POLICY "select_communities" ON communities FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'communities' AND policyname = 'insert_communities'
  ) THEN
    CREATE POLICY "insert_communities" ON communities FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'communities' AND policyname = 'update_communities'
  ) THEN
    CREATE POLICY "update_communities" ON communities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(community_id, user_id)
);

ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'community_members' AND policyname = 'select_community_members'
  ) THEN
    CREATE POLICY "select_community_members" ON community_members FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'community_members' AND policyname = 'insert_community_members'
  ) THEN
    CREATE POLICY "insert_community_members" ON community_members FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'community_members' AND policyname = 'delete_community_members'
  ) THEN
    CREATE POLICY "delete_community_members" ON community_members FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS community_members_community_idx ON community_members(community_id);
CREATE INDEX IF NOT EXISTS community_members_user_idx ON community_members(user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'posts_community_id_fkey'
      AND table_schema = 'public'
      AND table_name = 'posts'
  ) THEN
    ALTER TABLE posts
      ADD CONSTRAINT posts_community_id_fkey
      FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Storage buckets for user images and content attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('post-media', 'post-media', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4']),
  ('wiki-attachments', 'wiki-attachments', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain']),
  ('training-media', 'training-media', true, 104857600, ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'video/mp4'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'rede_nex_storage_select'
  ) THEN
    CREATE POLICY "rede_nex_storage_select"
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id IN ('avatars', 'post-media', 'wiki-attachments', 'training-media'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'rede_nex_storage_insert'
  ) THEN
    CREATE POLICY "rede_nex_storage_insert"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id IN ('avatars', 'post-media', 'wiki-attachments', 'training-media'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'rede_nex_storage_update'
  ) THEN
    CREATE POLICY "rede_nex_storage_update"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id IN ('avatars', 'post-media', 'wiki-attachments', 'training-media'))
      WITH CHECK (bucket_id IN ('avatars', 'post-media', 'wiki-attachments', 'training-media'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'rede_nex_storage_delete'
  ) THEN
    CREATE POLICY "rede_nex_storage_delete"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id IN ('avatars', 'post-media', 'wiki-attachments', 'training-media'));
  END IF;
END $$;

INSERT INTO communities (name, description, icon, color)
VALUES
  ('Atendimento', 'Troca de scripts, boas práticas e rotinas do atendimento.', 'MessageCircle', '#ff7a00'),
  ('Suporte GPON', 'Configurações, incidentes e padrões técnicos de suporte.', 'Zap', '#0057b8'),
  ('Comercial B2B', 'Estratégias, oportunidades e acompanhamento comercial.', 'Briefcase', '#16a34a'),
  ('Financeiro', 'Cobrança, negociação e rotinas financeiras.', 'DollarSign', '#9333ea')
ON CONFLICT (name) DO NOTHING;
