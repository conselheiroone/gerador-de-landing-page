-- Adiciona campos para persistir preferência de layout do usuário
-- Fase 3 do sistema de variação de layouts

ALTER TABLE perfil_empresa
  ADD COLUMN IF NOT EXISTS layout_blueprint_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS layout_preferences JSONB DEFAULT NULL;

-- Comentários
COMMENT ON COLUMN perfil_empresa.layout_blueprint_id IS 'ID do blueprint de layout preferido (classico, story-first, social-proof, etc.)';
COMMENT ON COLUMN perfil_empresa.layout_preferences IS 'Preferências de micro-variação (font, borderRadius, shadowStyle, spacing)';
