# Perfil da Empresa — Snapshot dos Dados

> Visao geral dos dados cadastrados no perfil do escritorio contabil, organizados por secao conforme o onboarding.

---

## Dados do Escritorio

| Campo | Valor |
|-------|-------|
| Nome do escritorio | `nome_empresa` |
| CNPJ | `cnpj` |
| Tipo de constituicao | `individual` ou `sociedade` |
| Slogan / Tagline | `slogan` |
| Ano de fundacao | `ano_fundacao` |

---

## Socios e Contadores

Lista de socios/contadores vinculados ao escritorio. Cada socio possui:

| Campo | Valor |
|-------|-------|
| Nome completo | `nome_completo` |
| Numero CRC | `crc_numero` |
| Estado CRC | `crc_estado` (UF) |
| Cargo | `cargo` |
| Foto | `foto_url` |
| Especialidades | lista de areas (ex: Contabilidade Fiscal, BPO Financeiro) |
| Mini bio | `mini_bio` |
| Exibir na landing page | sim / nao |

---

## Contato e Localizacao

| Campo | Valor |
|-------|-------|
| Telefone | `telefone` |
| WhatsApp | `whatsapp` |
| E-mail de contato | `email_contato` |
| Horario de atendimento | `horario_atendimento` (ex: Seg-Sex 8h-18h) |
| CEP | `cep` |
| Logradouro | `logradouro` |
| Numero | `numero` |
| Complemento | `complemento` |
| Bairro | `bairro` |
| Cidade | `cidade` |
| Estado | `estado` (UF) |

---

## Identidade Visual

| Campo | Valor |
|-------|-------|
| Logo | `logo_url` |
| Cor primaria | `cor_primaria` — extraida automaticamente da logo no upload |
| Cor secundaria | `cor_secundaria` — extraida automaticamente da logo no upload |

> As cores sao extraidas automaticamente da logo no momento do upload durante o onboarding. O usuario pode ajustar manualmente apos a extracao, mas o ponto de partida sao sempre as cores dominantes da logo cadastrada.

---

## Sobre o Escritorio

| Campo | Valor |
|-------|-------|
| Historia | `historia` |
| Missao | `missao` |
| Visao | `visao` |
| Valores | `valores` |
| Diferenciais | lista livre (ex: Atendimento personalizado, +10 anos de experiencia) |

---

## Servicos

Lista dos servicos oferecidos pelo escritorio. Cada servico:

| Campo | Valor |
|-------|-------|
| Nome do servico | `nome` |
| Descricao | `descricao` (opcional) |

Servicos sugeridos disponiveis no cadastro:
- Abertura e Encerramento de Empresas
- Contabilidade Mensal
- Folha de Pagamento
- Escrituracao Fiscal
- Declaracao de Imposto de Renda
- Planejamento Tributario
- BPO Financeiro
- Certidoes e Regularizacoes
- Consultoria Empresarial
- Obrigacoes Acessorias
- Lucro Real / Presumido / Simples
- Balancos e Demonstracoes
- Auditoria Contabil
- Recuperacao de Creditos Tributarios

---

## Redes Sociais

| Plataforma | Campo |
|------------|-------|
| Instagram | `instagram` |
| Facebook | `facebook` |
| LinkedIn | `linkedin` |
| YouTube | `youtube` |
| Site | `site` |
| Twitter / X | `twitter` |

---

*Dados cadastrados via onboarding em `docs/perfil-empresa.md` — atualizado em 2026-03-03*
