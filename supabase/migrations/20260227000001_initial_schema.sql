-- ==============================================================
-- Gerador de Landing Page - Schema Inicial
-- ==============================================================

-- 1. PROFILES (usuarios com papeis)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT,
  empresa TEXT,
  logo_url TEXT,
  role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('admin', 'cliente')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

-- 2. FUNCAO is_admin()
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. TEMPLATES (criados pelo admin)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  thumbnail_url TEXT,
  dados_template JSONB NOT NULL DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  criado_por UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates FORCE ROW LEVEL SECURITY;

-- 4. COMPONENTES_BIBLIOTECA (registro de componentes)
CREATE TABLE componentes_biblioteca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  thumbnail_url TEXT,
  dados_componente JSONB NOT NULL DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE componentes_biblioteca ENABLE ROW LEVEL SECURITY;
ALTER TABLE componentes_biblioteca FORCE ROW LEVEL SECURITY;

-- 5. PROJETOS (landing pages dos clientes)
CREATE TABLE projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  template_id UUID REFERENCES templates(id),
  dados_pagina JSONB NOT NULL DEFAULT '{}',
  usuario_id UUID NOT NULL REFERENCES profiles(id),
  publicado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos FORCE ROW LEVEL SECURITY;

-- 6. LEADS (captados pelas landing pages)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  mensagem TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads FORCE ROW LEVEL SECURITY;

-- ==============================================================
-- RLS POLICIES
-- ==============================================================

-- PROFILES
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE TO authenticated
  USING (is_admin());

-- TEMPLATES
CREATE POLICY "templates_select_active" ON templates
  FOR SELECT TO authenticated
  USING (ativo = true OR is_admin());

CREATE POLICY "templates_insert_admin" ON templates
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "templates_update_admin" ON templates
  FOR UPDATE TO authenticated
  USING (is_admin());

CREATE POLICY "templates_delete_admin" ON templates
  FOR DELETE TO authenticated
  USING (is_admin());

-- COMPONENTES_BIBLIOTECA
CREATE POLICY "componentes_select_active" ON componentes_biblioteca
  FOR SELECT TO authenticated
  USING (ativo = true OR is_admin());

CREATE POLICY "componentes_insert_admin" ON componentes_biblioteca
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "componentes_update_admin" ON componentes_biblioteca
  FOR UPDATE TO authenticated
  USING (is_admin());

CREATE POLICY "componentes_delete_admin" ON componentes_biblioteca
  FOR DELETE TO authenticated
  USING (is_admin());

-- PROJETOS
CREATE POLICY "projetos_select_own" ON projetos
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid() OR is_admin());

CREATE POLICY "projetos_insert_own" ON projetos
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "projetos_update_own" ON projetos
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid() OR is_admin());

CREATE POLICY "projetos_delete_own" ON projetos
  FOR DELETE TO authenticated
  USING (usuario_id = auth.uid());

-- LEADS
CREATE POLICY "leads_select_project_owner" ON leads
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projetos
      WHERE projetos.id = leads.projeto_id
      AND (projetos.usuario_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "leads_insert_public" ON leads
  FOR INSERT TO anon
  WITH CHECK (true);

-- ==============================================================
-- TRIGGER: auto-criar profile no registro
-- ==============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================
-- TRIGGER: updated_at automatico
-- ==============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER componentes_updated_at
  BEFORE UPDATE ON componentes_biblioteca
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projetos_updated_at
  BEFORE UPDATE ON projetos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
