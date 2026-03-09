-- ============================================================
-- ADD ACEITE_TERMOS_VERSAO: rastrear versão aceita dos termos
-- ============================================================
-- Permite forçar re-aceitação quando admin publica nova versão

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aceite_termos_versao INT DEFAULT 0;

-- Preencher com versão atual para usuários que já aceitaram
UPDATE profiles
SET aceite_termos_versao = (
  SELECT current_version FROM legal_pages WHERE slug = 'termos-de-uso' LIMIT 1
)
WHERE aceite_termos_em IS NOT NULL;
