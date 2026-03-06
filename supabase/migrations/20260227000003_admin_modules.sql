-- ============================================================
-- Migration: Admin Modules
-- Tabelas para: Suporte, Paginas Legais, Usuarios (admin_settings),
-- Comunicados, Aprendizado, Dicas de Ajuda
-- ============================================================

-- 1. admin_settings (key-value para configuracoes gerais)
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem tudo em admin_settings"
  ON public.admin_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Usuarios autenticados podem ler admin_settings"
  ON public.admin_settings FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2. legal_pages (paginas legais com versionamento)
CREATE TABLE IF NOT EXISTS public.legal_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  current_version INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem tudo em legal_pages"
  ON public.legal_pages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Qualquer pessoa pode ler legal_pages"
  ON public.legal_pages FOR SELECT
  USING (true);

-- 2.1 legal_page_versions (historico de versoes)
CREATE TABLE IF NOT EXISTS public.legal_page_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  legal_page_id UUID REFERENCES public.legal_pages(id) ON DELETE CASCADE,
  version INT NOT NULL,
  content TEXT,
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.legal_page_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem tudo em legal_page_versions"
  ON public.legal_page_versions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed: 3 paginas legais iniciais
INSERT INTO public.legal_pages (slug, title, content) VALUES
  ('termos-de-uso', 'Termos de Uso', ''),
  ('politica-de-privacidade', 'Politica de Privacidade', ''),
  ('lgpd', 'LGPD', '')
ON CONFLICT (slug) DO NOTHING;

-- 3. announcements (comunicados)
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'maintenance', 'update')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high')),
  is_published BOOLEAN DEFAULT false,
  has_detail BOOLEAN DEFAULT false,
  detail_body TEXT,
  external_url TEXT,
  internal_path TEXT,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem tudo em announcements"
  ON public.announcements FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Usuarios autenticados podem ler announcements publicados"
  ON public.announcements FOR SELECT
  USING (auth.role() = 'authenticated' AND is_published = true);

-- 3.1 announcement_dismissals (rastreio de dispensas)
CREATE TABLE IF NOT EXISTS public.announcement_dismissals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

ALTER TABLE public.announcement_dismissals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem gerenciar suas dispensas"
  ON public.announcement_dismissals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. learning_modules (modulos de aprendizado)
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem tudo em learning_modules"
  ON public.learning_modules FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Usuarios podem ler modulos publicados"
  ON public.learning_modules FOR SELECT
  USING (auth.role() = 'authenticated' AND is_published = true);

-- 4.1 learning_lessons (aulas)
CREATE TABLE IF NOT EXISTS public.learning_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT,
  duration_seconds INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem tudo em learning_lessons"
  ON public.learning_lessons FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Usuarios podem ler aulas publicadas"
  ON public.learning_lessons FOR SELECT
  USING (auth.role() = 'authenticated' AND is_published = true);

-- 4.2 learning_attachments (anexos das aulas)
CREATE TABLE IF NOT EXISTS public.learning_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INT,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.learning_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem tudo em learning_attachments"
  ON public.learning_attachments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Usuarios podem ler anexos"
  ON public.learning_attachments FOR SELECT
  USING (auth.role() = 'authenticated');

-- 4.3 learning_progress (progresso do usuario)
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem gerenciar seu progresso"
  ON public.learning_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. help_tips (dicas de ajuda)
CREATE TABLE IF NOT EXISTS public.help_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_name TEXT NOT NULL,
  section_title TEXT,
  anchor_key TEXT,
  title TEXT,
  description TEXT,
  video_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_path, anchor_key)
);

ALTER TABLE public.help_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem tudo em help_tips"
  ON public.help_tips FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Usuarios podem ler dicas ativas"
  ON public.help_tips FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Storage buckets para aprendizado
INSERT INTO storage.buckets (id, name, public)
VALUES ('module-thumbnails', 'module-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-attachments', 'lesson-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Admins podem upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'module-thumbnails' AND public.is_admin());

CREATE POLICY "Qualquer pessoa pode ver thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'module-thumbnails');

CREATE POLICY "Admins podem deletar thumbnails"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'module-thumbnails' AND public.is_admin());

CREATE POLICY "Admins podem upload anexos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lesson-attachments' AND public.is_admin());

CREATE POLICY "Usuarios autenticados podem ler anexos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Admins podem deletar anexos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'lesson-attachments' AND public.is_admin());
