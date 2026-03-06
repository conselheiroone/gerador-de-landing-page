-- Adiciona campos para imagem de fundo do Hero com parallax
ALTER TABLE perfil_empresa
  ADD COLUMN IF NOT EXISTS usar_imagem_hero BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
