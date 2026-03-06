-- ==============================================================
-- SEED: Dados de desenvolvimento local
-- ==============================================================
-- Executar apos `supabase start` e criar usuario via Studio/API
--
-- Usuario principal: diego@conselheiroone.com (admin)
-- Usuario teste:     diego.info.as@gmail.com (cliente)
--
-- COMO USAR:
-- 1. Crie os usuarios no Supabase Studio (http://localhost:54323)
--    ou via `supabase auth create-user`
-- 2. Copie os UUIDs gerados e substitua abaixo
-- 3. Execute: npx supabase db execute --local < supabase/seed.sql
-- ==============================================================

-- ============================================
-- VARIAVEIS: Substitua pelos UUIDs reais
-- ============================================
-- Para descobrir os UUIDs apos criar os usuarios:
-- SELECT id, email FROM auth.users;

-- Atualizar profiles existentes
UPDATE profiles SET
  nome = 'Diego',
  empresa = 'Conselheiro One',
  role = 'admin',
  telefone = '(11) 99999-0001',
  cargo = 'CEO',
  status = 'ativo'
WHERE email = 'diego@conselheiroone.com';

UPDATE profiles SET
  nome = 'Diego Info',
  empresa = 'Conselheiro One',
  role = 'cliente',
  telefone = '(11) 99999-0002',
  cargo = 'Contador',
  status = 'ativo'
WHERE email = 'diego.info.as@gmail.com';

-- ============================================
-- PERFIL_EMPRESA: Conselheiro One (admin)
-- ============================================
UPDATE perfil_empresa SET
  -- Step 1: Dados do Escritorio
  nome_empresa = 'Conselheiro One Contabilidade',
  cnpj = '12.345.678/0001-99',
  tipo_escritorio = 'sociedade',
  slogan = 'Contabilidade que transforma negocios',
  ano_fundacao = 2015,

  -- Step 3: Contato
  telefone = '(11) 3456-7890',
  whatsapp = '(11) 99999-0001',
  email_contato = 'contato@conselheiroone.com',
  horario_atendimento = 'Seg a Sex, 8h as 18h',

  -- Step 3: Endereco
  cep = '01310-100',
  logradouro = 'Av. Paulista',
  numero = '1000',
  complemento = 'Sala 1501',
  bairro = 'Bela Vista',
  cidade = 'Sao Paulo',
  estado = 'SP',

  -- Step 4: Identidade Visual
  cor_primaria = '#10B981',
  cor_secundaria = '#1E3A5F',

  -- Step 5: Sobre o Escritorio
  historia = 'Fundado em 2015, o Conselheiro One nasceu da visao de oferecer contabilidade consultiva para pequenas e medias empresas. Com uma equipe multidisciplinar, nos especializamos em transformar numeros em decisoes estrategicas.',
  missao = 'Simplificar a gestao contabil e financeira dos nossos clientes, permitindo que foquem no crescimento dos seus negocios.',
  visao = 'Ser referencia nacional em contabilidade consultiva para PMEs ate 2028.',
  valores = 'Transparencia, Inovacao, Proximidade, Excelencia',
  diferenciais = ARRAY['Atendimento personalizado', 'Dashboard em tempo real', 'Consultoria tributaria proativa', 'Equipe especializada por segmento'],

  -- Step 6: Servicos
  servicos = '[
    {"nome": "Contabilidade Empresarial", "descricao": "Escrituracao contabil completa, balancetes mensais e demonstracoes financeiras para sua empresa.", "icone": "building"},
    {"nome": "Planejamento Tributario", "descricao": "Analise e otimizacao da carga tributaria com estrategias legais para reduzir impostos.", "icone": "calculator"},
    {"nome": "Departamento Pessoal", "descricao": "Folha de pagamento, admissoes, demissoes, ferias e todas as obrigacoes trabalhistas.", "icone": "users"},
    {"nome": "Abertura de Empresa", "descricao": "Assessoria completa para abertura, alteracao e baixa de empresas em todos os regimes.", "icone": "file-plus"},
    {"nome": "BPO Financeiro", "descricao": "Terceirizacao do financeiro: contas a pagar, receber, conciliacao e fluxo de caixa.", "icone": "wallet"},
    {"nome": "Consultoria para Startups", "descricao": "Contabilidade e assessoria fiscal especializada para startups e empresas de tecnologia.", "icone": "rocket"}
  ]'::jsonb,

  -- Step 7: Redes Sociais
  redes_sociais = '{
    "instagram": "https://instagram.com/conselheiroone",
    "linkedin": "https://linkedin.com/company/conselheiroone",
    "facebook": "https://facebook.com/conselheiroone",
    "youtube": "https://youtube.com/@conselheiroone"
  }'::jsonb,

  -- Onboarding
  onboarding_completo = true,
  etapa_atual = 8
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'diego@conselheiroone.com' LIMIT 1);

-- ============================================
-- PERFIL_EMPRESA: Cliente teste
-- ============================================
-- Cria perfil_empresa para o usuario cliente (se existir)
INSERT INTO perfil_empresa (
  user_id,
  nome_empresa, cnpj, tipo_escritorio, slogan, ano_fundacao,
  telefone, whatsapp, email_contato, horario_atendimento,
  cep, logradouro, numero, bairro, cidade, estado,
  cor_primaria, cor_secundaria,
  historia, missao, visao, valores, diferenciais,
  servicos, redes_sociais,
  onboarding_completo, etapa_atual
)
SELECT
  u.id,
  'Silva & Associados Contabilidade',
  '98.765.432/0001-10',
  'sociedade',
  'Sua contabilidade em boas maos',
  2010,
  '(21) 2345-6789',
  '(21) 98888-7777',
  'contato@silvacontabil.com.br',
  'Seg a Sex, 9h as 17h',
  '20040-020',
  'Av. Rio Branco',
  '156',
  'Centro',
  'Rio de Janeiro',
  'RJ',
  '#2563EB',
  '#1E293B',
  'A Silva & Associados atua ha mais de 14 anos no mercado carioca, oferecendo solucoes contabeis completas para empresas de todos os portes.',
  'Oferecer servicos contabeis de excelencia com atendimento humanizado.',
  'Ser o escritorio de contabilidade mais confiavel do Rio de Janeiro.',
  'Etica, Compromisso, Agilidade, Confianca',
  ARRAY['Mais de 14 anos de experiencia', 'Atendimento humanizado', 'Tecnologia de ponta', 'Especialistas em MEI e Simples Nacional'],
  '[
    {"nome": "Contabilidade Geral", "descricao": "Servicos contabeis completos para sua empresa, do MEI ao Lucro Real.", "icone": "building"},
    {"nome": "Imposto de Renda", "descricao": "Declaracao de IRPF e IRPJ com planejamento para pagar menos impostos.", "icone": "calculator"},
    {"nome": "Folha de Pagamento", "descricao": "Gestao completa do departamento pessoal e folha de pagamento.", "icone": "users"},
    {"nome": "Abertura de MEI", "descricao": "Assessoria para formalizacao como Microempreendedor Individual.", "icone": "file-plus"}
  ]'::jsonb,
  '{"instagram": "https://instagram.com/silvacontabil", "linkedin": "https://linkedin.com/company/silvacontabil"}'::jsonb,
  true,
  8
FROM auth.users u
WHERE u.email = 'diego.info.as@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  nome_empresa = EXCLUDED.nome_empresa,
  cnpj = EXCLUDED.cnpj,
  tipo_escritorio = EXCLUDED.tipo_escritorio,
  slogan = EXCLUDED.slogan,
  ano_fundacao = EXCLUDED.ano_fundacao,
  telefone = EXCLUDED.telefone,
  whatsapp = EXCLUDED.whatsapp,
  email_contato = EXCLUDED.email_contato,
  horario_atendimento = EXCLUDED.horario_atendimento,
  cep = EXCLUDED.cep,
  logradouro = EXCLUDED.logradouro,
  numero = EXCLUDED.numero,
  bairro = EXCLUDED.bairro,
  cidade = EXCLUDED.cidade,
  estado = EXCLUDED.estado,
  cor_primaria = EXCLUDED.cor_primaria,
  cor_secundaria = EXCLUDED.cor_secundaria,
  historia = EXCLUDED.historia,
  missao = EXCLUDED.missao,
  visao = EXCLUDED.visao,
  valores = EXCLUDED.valores,
  diferenciais = EXCLUDED.diferenciais,
  servicos = EXCLUDED.servicos,
  redes_sociais = EXCLUDED.redes_sociais,
  onboarding_completo = EXCLUDED.onboarding_completo,
  etapa_atual = EXCLUDED.etapa_atual;

-- ============================================
-- SOCIOS: Conselheiro One
-- ============================================
INSERT INTO socios (perfil_empresa_id, nome_completo, crc_numero, crc_estado, cargo, especialidades, mini_bio, exibir_landing_page, ordem)
SELECT
  pe.id,
  s.nome_completo, s.crc_numero, s.crc_estado, s.cargo, s.especialidades, s.mini_bio, s.exibir_landing_page, s.ordem
FROM perfil_empresa pe
JOIN auth.users u ON u.id = pe.user_id AND u.email = 'diego@conselheiroone.com'
CROSS JOIN (VALUES
  ('Diego Oliveira',    'CRC-SP 123456/O-7', 'SP', 'Socio Fundador',     ARRAY['Planejamento Tributario', 'Consultoria Empresarial'],    'Contador com mais de 15 anos de experiencia em consultoria tributaria para PMEs.',        true, 0),
  ('Ana Carolina Lima', 'CRC-SP 234567/O-8', 'SP', 'Socia Responsavel',  ARRAY['Departamento Pessoal', 'Legislacao Trabalhista'],        'Especialista em departamento pessoal e legislacao trabalhista com foco em compliance.',    true, 1),
  ('Rafael Santos',     'CRC-SP 345678/O-9', 'SP', 'Contador Senior',    ARRAY['Contabilidade Internacional', 'IFRS'],                  'Experiencia em contabilidade internacional e normas IFRS para empresas em expansao.',      true, 2)
) AS s(nome_completo, crc_numero, crc_estado, cargo, especialidades, mini_bio, exibir_landing_page, ordem)
WHERE NOT EXISTS (SELECT 1 FROM socios WHERE socios.perfil_empresa_id = pe.id);

-- ============================================
-- SOCIOS: Silva & Associados (cliente)
-- ============================================
INSERT INTO socios (perfil_empresa_id, nome_completo, crc_numero, crc_estado, cargo, especialidades, mini_bio, exibir_landing_page, ordem)
SELECT
  pe.id,
  s.nome_completo, s.crc_numero, s.crc_estado, s.cargo, s.especialidades, s.mini_bio, s.exibir_landing_page, s.ordem
FROM perfil_empresa pe
JOIN auth.users u ON u.id = pe.user_id AND u.email = 'diego.info.as@gmail.com'
CROSS JOIN (VALUES
  ('Marcos Silva',     'CRC-RJ 111222/O-3', 'RJ', 'Socio Fundador',    ARRAY['Contabilidade Geral', 'Auditoria'],          'Fundador do escritorio, com 20 anos de experiencia no mercado carioca.',  true, 0),
  ('Patricia Mendes',  'CRC-RJ 222333/O-4', 'RJ', 'Contadora',         ARRAY['Imposto de Renda', 'MEI'],                   'Especialista em IRPF/IRPJ e assessoria para microempreendedores.',        true, 1)
) AS s(nome_completo, crc_numero, crc_estado, cargo, especialidades, mini_bio, exibir_landing_page, ordem)
WHERE NOT EXISTS (SELECT 1 FROM socios WHERE socios.perfil_empresa_id = pe.id);
