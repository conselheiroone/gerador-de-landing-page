-- Adiciona campo segmentos (JSONB) à tabela perfil_empresa
-- Segmentos de atuação do escritório (SegmentoItem[])
ALTER TABLE perfil_empresa
  ADD COLUMN IF NOT EXISTS segmentos JSONB DEFAULT '[]';
