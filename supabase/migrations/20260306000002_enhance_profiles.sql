-- ============================================================
-- ENHANCE PROFILES: novos campos de usuario
-- ============================================================

-- P0: Campos essenciais
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- P1: Campos importantes
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo'
  CHECK (status IN ('ativo', 'suspenso', 'pendente'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aceite_termos_em TIMESTAMPTZ;
