# Objetivo do Produto — Gerador de Landing Page

**Versão:** 1.0
**Data:** 2026-03-04
**Status:** Ativo

---

## 1. Visão Geral

O **Gerador de Landing Page** é uma plataforma SaaS especializada na criação de landing pages profissionais para **escritórios de contabilidade e contadores autônomos**. A plataforma elimina a barreira técnica entre contadores e a presença digital, oferecendo ferramentas visuais intuitivas que não exigem conhecimento de código.

### Proposta de Valor

> Permitir que qualquer escritório contábil — do autônomo ao médio porte — crie, personalize e publique uma landing page profissional em minutos, com componentes e templates desenvolvidos especificamente para o nicho contábil.

---

## 2. Problema que Resolve

Contadores e escritórios de contabilidade frequentemente:

- **Não têm orçamento** para contratar desenvolvedores web
- **Não têm tempo** para aprender ferramentas complexas
- **Encontram templates genéricos** que não falam a linguagem do nicho (sem seções de serviços contábeis, CRC, abertura de CNPJ, etc.)
- **Perdem leads** por não ter uma página de captura profissional

A plataforma resolve todos esses pontos com templates prontos para o nicho e um editor visual drag-and-drop acessível.

---

## 3. Público-Alvo

### Usuários Externos (Clientes)

| Perfil | Descrição |
|--------|-----------|
| Escritório de contabilidade | 1 a 20 funcionários, estabelecidos, precisam de presença digital |
| Contador autônomo | Profissional independente que precisa de página pessoal |
| Consultorias e franquias | Empresas especializadas em consultoria tributária/fiscal |
| Serviços de abertura de empresa | Especialistas em MEI/CNPJ que precisam captar leads |

### Usuários Internos (Admin)

| Perfil | Função |
|--------|--------|
| Designer / Desenvolvedor | Cria e mantém templates e componentes da biblioteca |
| Gestor da plataforma | Gerencia usuários, conteúdos de aprendizado e configurações |

---

## 4. Arquitetura de Produto — Duas Camadas

### Camada Admin (Backoffice Interno)

A equipe interna opera um backoffice completo para:

- Criar e editar templates com o **editor Puck** (drag-and-drop avançado)
- Controlar granularmente quais propriedades o cliente pode editar (flag `editavel_cliente`)
- Importar layouts externos (HTML → template editável)
- Gerenciar a biblioteca de componentes (ativar/desativar, categorizar)
- Gerir usuários, comunicados, conteúdos de aprendizado e configurações da plataforma

### Camada Cliente (Usuários Finais)

Os contadores têm acesso a um ambiente simplificado com:

- **Dois caminhos de criação:**
  - Galeria de templates prontos → clonar e personalizar
  - Editor do zero → arrastar componentes para o canvas
- Edição restrita às propriedades liberadas pelo admin
- Exportação do resultado como arquivo ZIP (HTML + CSS + JS)

---

## 5. Funcionalidades Principais

### 5.1 Editor Visual (Cliente)

- Drag-and-drop de componentes para o canvas
- Reordenação de seções
- Painel de propriedades contextual
- Preview responsivo (mobile / tablet / desktop)
- Undo/Redo e auto-save

### 5.2 Galeria de Templates

- Templates prontos criados pelo admin
- Filtro por categoria + busca por nome
- Preview antes de selecionar
- Clonagem isolada (SNAPSHOT) — o projeto não é afetado por atualizações do template original

### 5.3 Biblioteca de Componentes (10 categorias)

| Categoria | Exemplos |
|-----------|----------|
| Cabeçalho | Hero com imagem, vídeo background, minimalista, com formulário |
| Depoimentos | Carrossel, grid com foto |
| Digital | Embed de vídeo, galeria, redes sociais |
| Textos | Texto livre, título + subtítulo, duas colunas |
| Botões | Primário, secundário, outline, CTA full-width |
| Política de Privacidade | Seção legal, banner de cookies |
| Chamada para ação | Banner com botão, CTA com imagem lateral |
| Blocos | Grid 3 colunas, cards, seção com ícones |
| Formulários | Contato, newsletter |
| Footer | Colunas com links, contato, redes sociais |

### 5.4 Componentes Exclusivos para Contabilidade

- **Nossos Serviços:** fiscal, trabalhista, societário, BPO, IRPF
- **Equipe:** foto, nome, cargo, registro CRC
- **Agende uma Consulta:** banner com botão de WhatsApp
- **Números do Escritório:** clientes atendidos, anos de atuação, empresas abertas
- **FAQ:** perguntas frequentes pré-preenchidas para contabilidade
- **Localização:** seção com mapa integrado

### 5.5 Captação de Leads

- Formulários de contato com validação
- Botão de WhatsApp flutuante (número e mensagem configuráveis)
- Armazenamento e dashboard de leads (visualizar, filtrar, exportar CSV)
- Notificação por e-mail ao receber lead
- Anti-spam (honeypot + rate limiting)

### 5.6 Exportação

- Preview completo em nova aba
- Download como ZIP (HTML + CSS + JS)
- Código limpo, semântico e responsivo
- Meta tags SEO configuráveis (title, description, Open Graph)

### 5.7 Importação de Layouts (Admin)

**Fluxo atual implementado:**

1. Admin cola a URL de um site externo
2. A plataforma extrai o layout via **Playwright** (renderização real) ou **Edge Function** (parse de HTML estático)
3. O resultado é convertido automaticamente para **Craft.js JSON**
4. Paleta de cores e tipografia são detectadas e aplicadas automaticamente
5. Todos os textos são substituídos por **placeholders** (nunca copia conteúdo real do site)
6. Admin escolhe uma das saídas:
   - **"Salvar como Template"** → salva na tabela `templates` com categoria `Importado`; o template fica disponível na galeria para clientes usarem
   - **"Abrir no Editor"** → carrega o layout diretamente no editor visual sem salvar

**Limitações conhecidas (não implementadas):**

- ❌ Não é possível re-editar um template já importado pelo fluxo de importação
- ❌ Não há interface dedicada para o admin abrir e ajustar um template importado salvo (só via editor visual geral)

### 5.8 Plataforma de Suporte ao Usuário

| Feature | Descrição |
|---------|-----------|
| Central de Aprendizado | Módulos e aulas em vídeo com tracking de progresso |
| Dicas Contextuais | Botão (?) ao lado de elementos com vídeo + texto explicativo |
| Comunicados | Admin publica avisos (info, manutenção, atualização) com banner e sino de notificações |
| Onboarding | Modal de boas-vindas no primeiro acesso com vídeo |
| Suporte WhatsApp | Botão flutuante configurável com horário de atendimento |
| Páginas Legais | Termos de Uso, Privacidade, LGPD com aceitação obrigatória e versionamento |

---

## 6. Templates Planejados para o Nicho

| Template | Seções | Público |
|----------|--------|---------|
| Escritório Moderno | Hero + Serviços + Equipe + Depoimentos + Contato + Footer | Escritórios estabelecidos |
| Contador Autônomo | Hero pessoal + Sobre + Serviços + Depoimentos + CTA WhatsApp | Profissionais independentes |
| Abertura de Empresa | Hero + Passo a passo + FAQ + Formulário + CTA | Serviços de abertura MEI/CNPJ |
| Consultoria Fiscal | Hero + Serviços detalhados + Números + Depoimentos + Contato | Consultorias tributárias |

---

## 7. Diferenciais Competitivos

1. **Nicho específico:** componentes e templates feitos para contabilidade, não genéricos
2. **Dupla camada:** admin controla o que o cliente pode editar — evita quebra de layout
3. **Importação inteligente:** extrai layout de qualquer site com Playwright e converte automaticamente
4. **Exportação de código:** o cliente recebe HTML/CSS/JS limpo para hospedar onde quiser
5. **Plataforma de educação embutida:** reduz suporte e aumenta retenção
6. **Conformidade LGPD:** termos com aceitação rastreada, políticas versionadas

---

## 8. Roadmap por Fases

```
FASE 1 — FUNDAÇÃO + ADMIN (Semanas 1-14)
  ├─ Setup e infraestrutura
  ├─ Autenticação com papéis (admin/cliente)
  ├─ Backoffice admin completo
  ├─ Template Builder (Puck)
  ├─ Importação de layouts
  └─ Gestão da biblioteca de componentes
     → ADMIN MVP

FASE 2 — MVP CLIENTE (Semanas 15-26)
  ├─ Tela inicial (do zero / com modelo)
  ├─ Galeria de templates
  ├─ Editor visual (drag-and-drop)
  ├─ Biblioteca de componentes base
  ├─ Dashboard de projetos
  └─ Exportação e preview
     → MVP CLIENTE

FASE 3 — NICHO + LEADS + SEO (Semanas 27-34)
  ├─ Templates especializados para contabilidade
  ├─ Componentes do nicho contábil
  ├─ Sistema de leads
  └─ SEO e meta tags
     → PRODUTO V1

FASE 4 — PLATAFORMA COMPLETA (Semanas 35-42)
  ├─ Central de aprendizado
  ├─ Dicas contextuais e ajuda
  ├─ Comunicados e notificações
  ├─ Onboarding, suporte e configurações
  └─ Páginas legais e conformidade LGPD
     → PLATAFORMA COMPLETA V1.1
```

**Total:** 21 épicos | ~42 semanas | 4 fases

---

## 9. Stack Técnica (Resumo)

| Camada | Tecnologias |
|--------|-------------|
| Frontend | React 18 + Vite + TypeScript 5 + Tailwind CSS 4 |
| Editor Admin | Puck (drag-and-drop com JSON output) |
| Editor Cliente | Craft.js + dnd-kit |
| Backend | Supabase (Auth, PostgreSQL, Storage, Edge Functions) |
| Segurança | RLS em todas as tabelas, Zod em todas as Edge Functions |
| Servidor de Extração | Express + Playwright (porta 3001) |
| Animações | Framer Motion |
| Validação | Zod |
| Arquitetura | Bulletproof React (feature-based) |

---

## 10. Banco de Dados — Visão Macro

19 tabelas no total, todas com RLS obrigatório:

**Core do produto:** `profiles`, `templates`, `componentes_biblioteca`, `projetos`, `leads`

**Plataforma:** `admin_settings`, `comunicados`, `comunicados_lidos`, `modulos_aprendizado`, `aulas`, `aulas_anexos`, `progresso_aprendizado`, `comentarios_aulas`, `avaliacoes_aulas`, `dicas_ajuda`, `paginas_legais`, `paginas_legais_versoes`, `aceites_termos`, `visualizacoes_onboarding`

---

## 11. Documentação Relacionada

| Documento | Localização | Descrição |
|-----------|-------------|-----------|
| Especificação técnica completa | [docs/especificacao_tecnica.md](especificacao_tecnica.md) | Padrões de dev, segurança, arquitetura |
| Design System | [docs/design-system.md](design-system.md) | Cores, tipografia, componentes, tokens |
| Documentação consolidada | [DocumentacaoGeradorLandingPage.txt](../DocumentacaoGeradorLandingPage.txt) | Visão completa do produto (v3.1) |
| PRD | [docs/prd/](prd/) | Product Requirements Document v3.0 |
| Instruções do projeto | [CLAUDE.md](../CLAUDE.md) | Regras e convenções do projeto |
