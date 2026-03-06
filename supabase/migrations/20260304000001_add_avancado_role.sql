-- Adiciona role 'avancado' ao sistema de permissões
-- Hierarquia: cliente < avancado < admin

ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'avancado', 'cliente'));
