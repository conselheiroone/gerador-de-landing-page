-- ─── Depoimentos e Google Place ID ────────────────────────────────────────────
-- Adiciona suporte a depoimentos de clientes na landing page.
-- Inclui integração com Google Place ID para buscar avaliações do Google.

-- 1. Campo google_place_id na tabela perfil_empresa
ALTER TABLE perfil_empresa
  ADD COLUMN IF NOT EXISTS google_place_id TEXT;

-- 2. Tabela de depoimentos
CREATE TABLE IF NOT EXISTS depoimentos (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_empresa_id UUID         NOT NULL REFERENCES perfil_empresa(id) ON DELETE CASCADE,

  nome_cliente      TEXT         NOT NULL,
  cargo             TEXT,
  citacao           TEXT         NOT NULL,
  nota              SMALLINT     NOT NULL DEFAULT 5 CHECK (nota BETWEEN 1 AND 5),
  foto_url          TEXT,

  -- Origem do depoimento
  source            TEXT         NOT NULL DEFAULT 'manual'
                                 CHECK (source IN ('manual', 'google', 'placeholder')),
  google_review_id  TEXT,        -- ID único do Google (para deduplicação)

  ativo             BOOLEAN      NOT NULL DEFAULT true,
  ordem             INTEGER      NOT NULL DEFAULT 0,

  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 3. RLS
ALTER TABLE depoimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "depoimentos_select_own"
  ON depoimentos FOR SELECT TO authenticated
  USING (
    perfil_empresa_id IN (
      SELECT id FROM perfil_empresa WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "depoimentos_insert_own"
  ON depoimentos FOR INSERT TO authenticated
  WITH CHECK (
    perfil_empresa_id IN (
      SELECT id FROM perfil_empresa WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "depoimentos_update_own"
  ON depoimentos FOR UPDATE TO authenticated
  USING (
    perfil_empresa_id IN (
      SELECT id FROM perfil_empresa WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "depoimentos_delete_own"
  ON depoimentos FOR DELETE TO authenticated
  USING (
    perfil_empresa_id IN (
      SELECT id FROM perfil_empresa WHERE user_id = auth.uid()
    )
  );

-- 4. Trigger updated_at
CREATE TRIGGER depoimentos_updated_at
  BEFORE UPDATE ON depoimentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Índices
CREATE INDEX IF NOT EXISTS idx_depoimentos_perfil ON depoimentos (perfil_empresa_id, ativo, ordem);
CREATE UNIQUE INDEX IF NOT EXISTS idx_depoimentos_google_review
  ON depoimentos (perfil_empresa_id, google_review_id)
  WHERE google_review_id IS NOT NULL;
