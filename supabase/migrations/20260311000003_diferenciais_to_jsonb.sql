-- Migra diferenciais de text[] para jsonb (DiferencialItem[])
-- Step 1: Adiciona coluna temporária jsonb
ALTER TABLE perfil_empresa ADD COLUMN diferenciais_new jsonb DEFAULT '[]'::jsonb;

-- Step 2: Converte dados existentes (text[] → jsonb array de objetos {nome: string})
UPDATE perfil_empresa
SET diferenciais_new = COALESCE(
  (SELECT jsonb_agg(
    CASE
      WHEN item ~ '^\{' THEN item::jsonb
      ELSE jsonb_build_object('nome', item)
    END
  ) FROM unnest(diferenciais) AS item),
  '[]'::jsonb
);

-- Step 3: Remove coluna antiga e renomeia
ALTER TABLE perfil_empresa DROP COLUMN diferenciais;
ALTER TABLE perfil_empresa RENAME COLUMN diferenciais_new TO diferenciais;
