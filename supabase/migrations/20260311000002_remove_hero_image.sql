-- Remove colunas de imagem de fundo do hero (recurso descontinuado)
ALTER TABLE perfil_empresa
  DROP COLUMN IF EXISTS usar_imagem_hero,
  DROP COLUMN IF EXISTS hero_image_url;
