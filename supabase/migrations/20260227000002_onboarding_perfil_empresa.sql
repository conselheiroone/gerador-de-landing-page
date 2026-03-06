-- ==============================================================
-- Onboarding: Perfil da Empresa + Socios
-- ==============================================================

-- 1. PERFIL_EMPRESA (dados do escritorio/empresa do usuario)
CREATE TABLE perfil_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Step 1: Dados do Escritorio
  nome_empresa TEXT,
  cnpj TEXT,
  tipo_escritorio TEXT CHECK (tipo_escritorio IN ('individual', 'sociedade')),
  slogan TEXT,
  ano_fundacao INTEGER,

  -- Step 3: Contato
  telefone TEXT,
  whatsapp TEXT,
  email_contato TEXT,
  horario_atendimento TEXT,

  -- Step 3: Endereco
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,

  -- Step 4: Identidade Visual
  logo_url TEXT,
  cor_primaria TEXT DEFAULT '#10B981',
  cor_secundaria TEXT DEFAULT '#1A1A1A',

  -- Step 5: Sobre o Escritorio
  historia TEXT,
  missao TEXT,
  visao TEXT,
  valores TEXT,
  diferenciais TEXT[] DEFAULT '{}',

  -- Step 6: Servicos
  servicos JSONB DEFAULT '[]',

  -- Step 7: Redes Sociais
  redes_sociais JSONB DEFAULT '{}',

  -- Controle do Onboarding
  onboarding_completo BOOLEAN DEFAULT false,
  etapa_atual INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE perfil_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_empresa FORCE ROW LEVEL SECURITY;

-- 2. SOCIOS (contadores/socios vinculados ao escritorio)
CREATE TABLE socios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_empresa_id UUID NOT NULL REFERENCES perfil_empresa(id) ON DELETE CASCADE,

  nome_completo TEXT NOT NULL,
  crc_numero TEXT,
  crc_estado TEXT,
  cargo TEXT,
  foto_url TEXT,
  especialidades TEXT[] DEFAULT '{}',
  mini_bio TEXT,
  exibir_landing_page BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE socios FORCE ROW LEVEL SECURITY;

-- ==============================================================
-- RLS POLICIES
-- ==============================================================

-- PERFIL_EMPRESA: usuario ve/edita so o proprio
CREATE POLICY "perfil_empresa_select_own" ON perfil_empresa
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "perfil_empresa_insert_own" ON perfil_empresa
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "perfil_empresa_update_own" ON perfil_empresa
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- SOCIOS: acesso via perfil_empresa do usuario
CREATE POLICY "socios_select_own" ON socios
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfil_empresa
      WHERE perfil_empresa.id = socios.perfil_empresa_id
      AND (perfil_empresa.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "socios_insert_own" ON socios
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfil_empresa
      WHERE perfil_empresa.id = socios.perfil_empresa_id
      AND perfil_empresa.user_id = auth.uid()
    )
  );

CREATE POLICY "socios_update_own" ON socios
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfil_empresa
      WHERE perfil_empresa.id = socios.perfil_empresa_id
      AND (perfil_empresa.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "socios_delete_own" ON socios
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfil_empresa
      WHERE perfil_empresa.id = socios.perfil_empresa_id
      AND perfil_empresa.user_id = auth.uid()
    )
  );

-- ==============================================================
-- TRIGGERS: updated_at
-- ==============================================================

CREATE TRIGGER perfil_empresa_updated_at
  BEFORE UPDATE ON perfil_empresa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER socios_updated_at
  BEFORE UPDATE ON socios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==============================================================
-- STORAGE: bucket para logos e fotos
-- ==============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-socios', 'fotos-socios', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "logos_upload_authenticated" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos');

CREATE POLICY "logos_select_public" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'logos');

CREATE POLICY "logos_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "logos_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "fotos_socios_upload_authenticated" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fotos-socios');

CREATE POLICY "fotos_socios_select_public" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'fotos-socios');

CREATE POLICY "fotos_socios_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'fotos-socios' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "fotos_socios_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'fotos-socios' AND (storage.foldername(name))[1] = auth.uid()::text);
