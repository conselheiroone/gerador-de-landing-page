# PRD — Gerador de Landing Page para Escritorios de Contabilidade

> **Versao:** 3.1
> **Data:** 2026-02-27
> **Autor:** Orion (Master Orchestrator) com squad AIOS (PO Pax + Analyst)
> **Status:** Draft — Aguardando validacao do stakeholder
> **Fontes de verdade:**
> - `docs/especificacao_tecnica.md` — Padroes de desenvolvimento e arquitetura
> - `docs/design-system.md` — Design System completo
> - `DocumentacaoGeradorLandingPage.txt` — Documentacao consolidada do produto (incluindo requisito Admin)
> - `Screenshot_1.png` — Tela inicial (Comece do zero / Comece com modelo)
> - `Templates.png` — Galeria de templates com filtros
> - `comeceDoZero.png` — Editor visual com biblioteca de componentes
> **Projetos de referencia (funcionalidades reaproveitadas):**
> - `cclasstrib-web-1` — Admin panel, aprendizado, help tips, suporte, notificacoes, legal pages
> - `cclasstrib-api` — Auth OTP, user management, learning API, payments/subscription, email service
> - `diagnosticopro` — Admin layout, announcements, help tips, onboarding, terms acceptance, UI components

---

## 1. VISAO DO PRODUTO

### 1.1 Problema

Escritorios de contabilidade no Brasil precisam de presenca digital profissional mas nao possuem equipe tecnica para criar sites. Plataformas genericas (Wix, WordPress) nao oferecem templates nem linguagem visual adequada para o nicho contabil. Alem disso, nao existe uma ferramenta que permita que a equipe interna da plataforma crie e gerencie templates de forma visual, sem depender de deploys de codigo.

### 1.2 Solucao

Plataforma SaaS com **duas camadas distintas**:

**Camada Admin (Backoffice Interno):**
- Equipe interna cria, importa e edita templates/layouts usando componentes web reais
- Editor avancado com **Puck** (MIT) para construcao visual de templates
- Biblioteca de componentes gerenciavel (shadcn/ui blocks + Aceternity UI + Magic UI)
- Controle granular de quais propriedades o cliente final pode editar (`editavel_cliente`)
- Operacoes: criar novo template, importar layout externo, editar existente, "Salvar Novo" ou "Salvar Alteracoes"

**Camada Cliente (Usuarios Finais):**
- **Dois caminhos de criacao:** Do zero (editor com componentes) OU a partir de modelos prontos
- **Editor visual drag-and-drop** com componentes pre-definidos por categoria
- **Templates profissionais** filtrados por tipo de negocio contabil
- **Componentes especializados** para o nicho (servicos contabeis, formularios de lead, CTA WhatsApp)
- **Exportacao de codigo** para hospedagem independente

### 1.3 Proposta de Valor

> "Crie sua landing page profissional em minutos — com templates feitos para contadores e editor visual sem codigo."

### 1.4 Publico-Alvo

| Segmento | Perfil | Necessidade |
|----------|--------|-------------|
| **Interno (Admin)** | Equipe da plataforma (designers, devs) | Criar e gerenciar templates sem deploy de codigo |
| **Primario** | Escritorios de contabilidade (1-20 pessoas) | Landing page profissional sem custo de dev |
| **Secundario** | Contadores autonomos | Pagina pessoal com captacao de leads |
| **Terciario** | Consultorias e franquias contabeis | Multiplas landing pages padronizadas |

### 1.5 Arquitetura de Usuarios e Papeis

| Papel | Acesso | Descricao |
|-------|--------|-----------|
| `admin` | `/admin/*` + rotas de cliente | Equipe interna — cria templates, gerencia biblioteca de componentes, importa layouts |
| `cliente` | Rotas de cliente apenas | Usuario final — usa templates, edita propriedades permitidas, exporta landing pages |

Implementacao via `profiles.role` (coluna `role TEXT CHECK (role IN ('admin', 'cliente'))`) + funcao PostgreSQL `is_admin()` para RLS + sync com JWT custom claims via trigger.

---

## 2. REFERENCIAS VISUAIS (Prints do Projeto)

### Print 1 — Tela Inicial (`Screenshot_1.png`)
```
┌──────────────────────────────────────┐
│  ┌──────────────────────────────┐    │
│  │  +  Comece do zero           │    │
│  │     Projete seu site do zero │    │
│  └──────────────────────────────┘    │
│  ┌──────────────────────────────┐    │
│  │  ✎  Comece com um modelo     │    │
│  │     Use modelos feitos por   │    │
│  │     designers                │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

### Print 2 — Galeria de Templates (`Templates.png`)
```
┌─────────┬────────────────────────────────────┐
│ Filtros │  "Selecione qualquer um dos nossos │
│         │   modelos de site e torne o seu"   │
│ Todos   │  ┌─────┐ ┌─────┐ ┌─────┐          │
│ Negocios│  │ Tmpl│ │ Tmpl│ │ Tmpl│          │
│ Cartoes │  │  1  │ │  2  │ │  3  │          │
│ Digitais│  └─────┘ └─────┘ └─────┘          │
│ Eventos │  ┌─────┐ ┌─────┐ ┌─────┐          │
│ Sem fins│  │ Tmpl│ │ Tmpl│ │ Tmpl│          │
│ lucrat. │  │  4  │ │  5  │ │  6  │          │
│ Em breve│  └─────┘ └─────┘ └─────┘          │
│         │  [Explorar componentes]             │
└─────────┴────────────────────────────────────┘
```

### Print 3 — Editor de Componentes (`comeceDoZero.png`)
```
┌───────────────┬──────────────────────────────┐
│ Componentes   │  Cabecalho                   │
│               │  "E hora de usar! Escolha um │
│ > Cabecalho   │   cabecalho bem desenhado    │
│   Depoimentos │   para colocar no topo do    │
│   Digital     │   seu site"                  │
│   Textos      │                              │
│   Botoes      │  ┌─────┐ ┌─────┐ ┌─────┐    │
│   Politica    │  │Head │ │Head │ │Head │    │
│   Privacidade │  │  1  │ │  2  │ │  3  │    │
│   Chamada p/  │  └─────┘ └─────┘ └─────┘    │
│   acao        │  ┌─────┐ ┌─────┐ ┌─────┐    │
│   Blocos      │  │Head │ │Head │ │Head │    │
│   Formularios │  │  4  │ │  5  │ │  6  │    │
│   Footer      │  └─────┘ └─────┘ └─────┘    │
│               │                              │
│ [Exportar     │  [Explorar Modelos]          │
│  Modelos]     │                              │
└───────────────┴──────────────────────────────┘
```

---

## 3. STACK TECNICA

| Camada | Tecnologia | Referencia |
|--------|------------|------------|
| **Frontend** | React 18 + Vite + TypeScript 5 (strict) | Parte 4 da spec |
| **Estilizacao** | Tailwind CSS + shadcn/ui + CVA | Parte 6 da spec |
| **Backend** | Supabase (Auth, DB, Storage, Edge Functions) | Parte 5 da spec |
| **Arquitetura** | Bulletproof React (feature-based) | Parte 4.1 da spec |
| **Estado** | useState + useReducer + Context API | Parte 4.6 da spec |
| **Animacoes** | Framer Motion (variantes padrao) | Parte 9 da spec |
| **Validacao** | Zod (obrigatorio em toda Edge Function) | Parte 3.7 da spec |
| **Seguranca** | RLS obrigatorio + CORS + Problem Details RFC 7807 | Parte 3 da spec |
| **Admin Builder** | Puck (MIT, React, JSON output) | ADR necessaria |
| **DnD (Cliente)** | dnd-kit | ADR necessaria |
| **Componentes LP** | shadcn/ui blocks + Aceternity UI + Magic UI (todos MIT) | Pesquisa Analyst |

### Decisao: Bibliotecas de Componentes para Landing Pages

| Biblioteca | Licenca | Status | Uso |
|------------|---------|--------|-----|
| **shadcn/ui blocks** | MIT | Aprovada | Componentes base (headers, features, footers) |
| **Aceternity UI** | MIT | Aprovada | Efeitos visuais (parallax, spotlight, glow) |
| **Magic UI** | MIT | Aprovada | Animacoes avancadas (marquee, particles, blur) |
| **Tailwind UI** | Comercial | **BLOQUEADA** | Licenca proibe uso em page builders/geradores |

### Design System (do design-system.md)

| Token | Valor |
|-------|-------|
| **Cor primaria** | `#10B981` (Brand Green) |
| **Cor dark** | `#1A1A1A` (Sidebar, botoes secundarios) |
| **Tipografia** | System UI sans-serif |
| **Espacamento** | Sistema 8px |
| **Radius padrao** | 8px (botoes, inputs, cards) |
| **Sidebar** | 240px expandida / 72px colapsada |
| **Header** | 64px altura |
| **Content** | Max 1280px, bg #F9FAFB |

---

## 4. ARQUITETURA DUAL-LAYER

### 4.1 Visao Geral

```
┌─────────────────────────────────────────────────────┐
│                 APLICACAO UNICA (React)              │
│                                                     │
│  ┌───────────────────┐  ┌────────────────────────┐  │
│  │   CAMADA ADMIN    │  │   CAMADA CLIENTE       │  │
│  │   /admin/*        │  │   / (rotas normais)    │  │
│  │                   │  │                        │  │
│  │ - Template Builder│  │ - Tela Inicial         │  │
│  │   (Puck editor)   │  │ - Galeria Templates    │  │
│  │ - Import Layout   │  │ - Editor Visual (DnD)  │  │
│  │ - Gestao de       │  │ - Dashboard Projetos   │  │
│  │   Componentes     │  │ - Exportacao           │  │
│  │ - Gestao de       │  │ - Leads                │  │
│  │   Templates       │  │                        │  │
│  └───────┬───────────┘  └──────────┬─────────────┘  │
│          │                         │                │
│          ▼                         ▼                │
│  ┌─────────────────────────────────────────────┐    │
│  │          SUPABASE (PostgreSQL + RLS)         │    │
│  │   profiles (role: admin|cliente)             │    │
│  │   templates (JSONB com editavel_cliente)     │    │
│  │   projetos (clone do template)               │    │
│  │   componentes_biblioteca (registro)          │    │
│  │   leads (por projeto)                        │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 4.2 Separacao de Rotas

| Rota | Papel | Descricao |
|------|-------|-----------|
| `/admin/templates` | admin | CRUD de templates (Puck editor) |
| `/admin/componentes` | admin | Gerenciar biblioteca de componentes |
| `/admin/importar` | admin | Importar layouts externos |
| `/admin/dashboard` | admin | Metricas e gestao |
| `/admin/usuarios` | admin | Gestao de usuarios |
| `/admin/comunicados` | admin | Gestao de comunicados/anuncios |
| `/admin/aprendizado` | admin | Gestao de modulos de aprendizado |
| `/admin/ajuda` | admin | Gestao de dicas de ajuda contextual |
| `/admin/suporte` | admin | Configuracao de suporte (WhatsApp, horarios) |
| `/admin/onboarding` | admin | Configuracao de video de boas-vindas |
| `/admin/paginas-legais` | admin | Gestao de termos, privacidade, LGPD |
| `/admin/configuracoes` | admin | Configuracoes gerais da plataforma |
| `/` | cliente | Tela inicial (Comece do zero / Comece com modelo) |
| `/templates` | cliente | Galeria de templates (somente leitura) |
| `/editor/:id` | cliente | Editor visual com DnD |
| `/dashboard` | cliente | Gestao de projetos |
| `/preview/:id` | cliente | Preview da landing page |
| `/aprendizado` | cliente | Central de aprendizado (modulos e aulas) |
| `/aprendizado/:moduloId` | cliente | Aulas do modulo |
| `/aprendizado/:moduloId/:aulaId` | cliente | Visualizacao da aula |
| `/notificacoes` | cliente | Central de notificacoes |
| `/perfil` | cliente | Perfil do usuario |
| `/suporte` | cliente | Pagina de suporte |
| `/termos/:slug` | publico | Paginas legais (termos, privacidade) |

### 4.3 Fluxo de Dados: Template Admin -> Projeto Cliente

```
ADMIN cria template (Puck)
  → Salva como JSONB em `templates` com flags `editavel_cliente` por prop
  → Template aparece na galeria para clientes

CLIENTE seleciona template
  → Sistema faz SNAPSHOT (clone completo do JSONB)
  → Cria registro em `projetos` com dados_pagina = clone do template
  → Cliente edita APENAS props marcadas como editavel_cliente = true
  → Projeto e independente do template original (nao sofre updates)
```

### 4.4 Modelo JSONB com Controle de Editabilidade

```json
{
  "secoes": [
    {
      "id": "hero-1",
      "tipo": "cabecalho",
      "componente": "HeroComImagem",
      "ordem": 0,
      "props": {
        "titulo": {
          "valor": "Seu Escritorio de Contabilidade",
          "tipo": "text",
          "editavel_cliente": true
        },
        "subtitulo": {
          "valor": "Especialistas em gestao contabil",
          "tipo": "text",
          "editavel_cliente": true
        },
        "imagem_fundo": {
          "valor": "/templates/hero-contabilidade.jpg",
          "tipo": "image",
          "editavel_cliente": true
        },
        "cor_overlay": {
          "valor": "#1A1A1A",
          "tipo": "color",
          "editavel_cliente": false
        },
        "layout_variante": {
          "valor": "center",
          "tipo": "select",
          "opcoes": ["left", "center", "right"],
          "editavel_cliente": false
        }
      }
    },
    {
      "id": "servicos-1",
      "tipo": "blocos",
      "componente": "ServicosContabeis",
      "ordem": 1,
      "props": {
        "titulo_secao": {
          "valor": "Nossos Servicos",
          "tipo": "text",
          "editavel_cliente": true
        },
        "servicos": {
          "valor": [
            {"icone": "calculator", "titulo": "Fiscal", "descricao": "Gestao fiscal completa"},
            {"icone": "users", "titulo": "Trabalhista", "descricao": "Departamento pessoal"}
          ],
          "tipo": "array",
          "editavel_cliente": true
        }
      }
    }
  ],
  "config_global": {
    "fonte": "system-ui",
    "cor_primaria": "#10B981",
    "cor_secundaria": "#1A1A1A"
  }
}
```

---

## 5. EPICOS E ROADMAP

### Mapa Geral — 4 Fases

```
FASE 1 — FUNDACAO + ADMIN (Semanas 1-14)
  EP-01: Setup e Infraestrutura
  EP-02: Autenticacao e Perfil (com papeis admin/cliente)
  EP-13: Admin — Backoffice Core (layout, navegacao, guards)
  EP-14: Admin — Template Builder (Puck editor)
  EP-15: Admin — Importacao de Layouts
  EP-16: Admin — Gestao da Biblioteca de Componentes

FASE 2 — MVP CLIENTE (Semanas 15-26)
  EP-03: Tela Inicial (Comece do zero / Comece com modelo)
  EP-04: Galeria de Templates
  EP-05: Editor Visual (Drag-and-Drop)
  EP-06: Biblioteca de Componentes Base
  EP-10: Dashboard e Gestao de Projetos
  EP-11: Exportacao e Preview

FASE 3 — NICHO + LEADS + SEO (Semanas 27-34)
  EP-07: Templates Especializados para Contabilidade
  EP-08: Componentes do Nicho Contabil
  EP-09: Sistema de Formularios e Captacao de Leads
  EP-12: SEO e Meta Tags

FASE 4 — PLATAFORMA COMPLETA (Semanas 35-42)
  EP-17: Sistema de Aprendizado (Learning)
  EP-18: Ajuda Contextual e Dicas (Help Tips)
  EP-19: Comunicados e Notificacoes (Announcements)
  EP-20: Onboarding, Suporte e Configuracoes
  EP-21: Paginas Legais e Conformidade (Termos, LGPD)
```

**Justificativa Admin-First:** O admin cria os templates que alimentam a galeria do cliente. Sem templates, a camada cliente nao tem conteudo. Construir admin primeiro garante que quando o MVP cliente for lancado, ja existam templates prontos.

**Justificativa Fase 4:** Funcionalidades inspiradas nos projetos de referencia (`diagnosticopro`, `cclasstrib-web-1`, `cclasstrib-api`) que elevam a plataforma de um builder simples para um SaaS completo: educacao do usuario, suporte integrado, conformidade legal e comunicacao com a base.

---

### EP-01: Setup e Infraestrutura

**Objetivo:** Base tecnica completa conforme especificacao_tecnica.md

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Inicializar React + Vite + TypeScript + Tailwind | MUST | P |
| 2 | Configurar estrutura Bulletproof React (app/, features/, components/, hooks/, lib/, types/, config/, integrations/, utils/) | MUST | P |
| 3 | Instalar e configurar shadcn/ui | MUST | P |
| 4 | Configurar Supabase client (auth + db + storage) | MUST | P |
| 5 | Aplicar Design System tokens (cores, tipografia, espacamento, shadows, radius) conforme design-system.md | MUST | M |
| 6 | Criar motion-variants.ts (fadeIn, slideUp, slideDown, scaleIn, staggerContainer, staggerItem, cardAnimation, pageTransition) | MUST | P |
| 7 | Configurar ESLint + Prettier + path aliases (@/) | SHOULD | P |
| 8 | Inicializar git + .gitignore + primeiro commit | MUST | P |
| 9 | Instalar Puck + dnd-kit + dependencias do admin builder | MUST | P |

**Agente responsavel:** `@dev` (Dex) para implementacao, `@architect` para validar estrutura

**Criterios de Aceite:**
- `npm run dev` sem erros
- `npm run build` sem warnings
- Estrutura de pastas conforme Parte 4.1 da spec
- Design tokens aplicados no tailwind.config.ts
- Motion variants funcionais
- Puck e dnd-kit instalados e importaveis

---

### EP-02: Autenticacao e Perfil (com Papeis)

**Objetivo:** Sistema de auth completo com Supabase + sistema de papeis (admin/cliente)

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Tela de Login (email/senha) com validacao Zod | MUST | M |
| 2 | Tela de Registro com confirmacao de email (role default = 'cliente') | MUST | M |
| 3 | Recuperacao de senha (forgot/reset) | MUST | P |
| 4 | Login com Google (OAuth) | SHOULD | M |
| 5 | AuthGuard para protecao de rotas + AuthContext | MUST | M |
| 6 | AdminGuard para rotas /admin/* (verifica role = 'admin') | MUST | M |
| 7 | Pagina de perfil do usuario (nome, empresa, logo) | MUST | M |
| 8 | Coluna `role` em profiles + funcao `is_admin()` no PostgreSQL | MUST | P |
| 9 | Trigger para sync role -> JWT custom claims (app_metadata) | MUST | M |
| 10 | RLS policies em todas as tabelas (usando is_admin() para admins) | MUST | M |
| 11 | Edge Function para operacoes sensiveis de auth | MUST | M |

**Agente responsavel:** `@dev` (Dex), `@data-engineer` para schema e RLS

**Criterios de Aceite:**
- Login/Registro funcionais com Zod validation
- Rotas protegidas redirecionam para /login
- Rotas /admin/* acessiveis apenas por role = 'admin'
- `is_admin()` funcional e usado em todas as RLS policies de admin
- RLS com FORCE ROW LEVEL SECURITY em toda tabela
- Edge Functions com Zod + Problem Details RFC 7807 + Logging
- Nenhum segredo exposto no client

---

### EP-13: Admin — Backoffice Core

**Objetivo:** Layout e infraestrutura do painel administrativo

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Layout do admin: sidebar de navegacao + header + content area | MUST | M |
| 2 | Navegacao admin: Templates, Componentes, Importar, Dashboard | MUST | P |
| 3 | Dashboard admin com metricas (total templates, total usuarios, total projetos, leads) | SHOULD | M |
| 4 | Listagem de templates existentes (grid com thumbnail, nome, categoria, status, data) | MUST | M |
| 5 | CRUD de templates: criar novo, editar, duplicar, ativar/desativar, excluir | MUST | G |
| 6 | Operacoes "Salvar Novo" (cria template novo) e "Salvar Alteracoes" (atualiza existente) | MUST | M |
| 7 | Configuracao de metadados do template (nome, descricao, categoria, thumbnail) | MUST | P |

**Agente responsavel:** `@dev` (Dex), `@ux-design-expert` para layout admin

**Design System aplicavel:**
- Reutilizar sidebar dark (#1A1A1A) e header (64px) do design-system.md
- Content area: bg #F9FAFB, max-width 1280px
- Cards de template: stat-card style com acoes (editar, duplicar, ativar/desativar)

---

### EP-14: Admin — Template Builder (Puck)

**Objetivo:** Editor avancado para construcao de templates usando Puck (MIT)

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Integrar Puck editor como engine do template builder admin | MUST | GG |
| 2 | Registrar componentes da biblioteca no Puck (mapear props para Puck fields) | MUST | G |
| 3 | Drag-and-drop de componentes no canvas Puck | MUST | G |
| 4 | Painel de propriedades por componente com flag `editavel_cliente` (toggle por prop) | MUST | G |
| 5 | Preview responsivo no builder (desktop/tablet/mobile) | MUST | M |
| 6 | Salvar output do Puck como JSONB no formato padrao (secoes + props + editavel_cliente) | MUST | G |
| 7 | Carregar template existente no Puck para edicao | MUST | M |
| 8 | Thumbnail automatico do template (captura de screenshot ou upload manual) | SHOULD | M |
| 9 | Versionamento basico: historico de alteracoes do template | COULD | G |

**Agente responsavel:** `@architect` para integracao Puck, `@dev` (Dex) para implementacao

**Decisao arquitetural (ADR necessaria):**
- Adapter entre Puck JSON output <-> nosso formato JSONB padrao
- Como mapear componentes React para Puck components
- Estrategia de rendering: Puck render vs custom renderer

**Criterios de Aceite:**
- Admin pode construir um template completo visualmente no Puck
- Cada prop pode ser marcada como editavel ou nao pelo cliente
- Output salvo como JSONB valido no Supabase
- Template criado aparece corretamente na galeria do cliente

---

### EP-15: Admin — Importacao de Layouts

**Objetivo:** Permitir que admins importem layouts externos para o sistema

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Upload de arquivo HTML como base para novo template | MUST | G |
| 2 | Parser HTML -> JSONB: extrair secoes, textos, imagens e mapear para componentes | MUST | GG |
| 3 | Interface de revisao pos-importacao: admin valida mapeamento e ajusta componentes | MUST | G |
| 4 | Importacao de assets (imagens) para Supabase Storage | MUST | M |
| 5 | Importacao via URL (fetch da pagina e parse) | SHOULD | G |
| 6 | Mapeamento automatico de secoes comuns (header, hero, footer, CTA) | SHOULD | G |

**Agente responsavel:** `@architect` para estrategia de parsing, `@dev` (Dex)

**Riscos:**
- Parsing de HTML arbitrario e complexo e impreciso
- Mitigacao: interface de revisao obrigatoria + mapeamento manual como fallback

---

### EP-16: Admin — Gestao da Biblioteca de Componentes

**Objetivo:** Gerenciar quais componentes estao disponiveis para templates e para clientes

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Catalogo de componentes disponíveis (listagem com preview, categoria, status) | MUST | M |
| 2 | Ativar/desativar componentes da biblioteca | MUST | P |
| 3 | Categorizar componentes (Cabecalho, Depoimentos, Digital, Textos, etc.) | MUST | P |
| 4 | Preview individual de cada componente com suas variantes | SHOULD | M |
| 5 | Configurar props default por componente (valores iniciais quando arrastado) | SHOULD | M |
| 6 | Registrar novos componentes (dev adiciona codigo, admin registra no catalogo) | COULD | G |

**Agente responsavel:** `@dev` (Dex), `@architect` para registro de componentes

---

### EP-03: Tela Inicial — Fluxo de Criacao

**Objetivo:** Reproduzir a tela do `Screenshot_1.png` — ponto de entrada do usuario cliente

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Tela de boas-vindas com 2 action cards: "Comece do zero" e "Comece com um modelo" | MUST | M |
| 2 | Navegacao: "Comece do zero" -> Editor de Componentes (EP-05) | MUST | P |
| 3 | Navegacao: "Comece com modelo" -> Galeria de Templates (EP-04) | MUST | P |
| 4 | Animacao de entrada com stagger (conforme Parte 9 da spec) | SHOULD | P |

**Agente responsavel:** `@dev` (Dex), `@ux-design-expert` para layout

**Design System aplicavel:**
- Action cards: border 1px #E5E7EB, radius 12px, padding 20px 24px
- Icones: 20px, stroke 1.5px
- Hover: border-color #10B981, bg #F9FAFB
- Animacao: cardAnimation variant

---

### EP-04: Galeria de Templates

**Objetivo:** Reproduzir a tela do `Templates.png` — navegacao e selecao de modelos

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Layout da galeria: sidebar de filtros + grid de templates | MUST | M |
| 2 | Filtros por categoria (Todos, Negocios, Cartoes Digitais, Eventos, Sem fins lucrativos) | MUST | M |
| 3 | Campo de busca por nome de template | SHOULD | P |
| 4 | Card de template com thumbnail + titulo + hover preview | MUST | M |
| 5 | Acao: clicar no template -> SNAPSHOT (clone JSONB completo) para editor | MUST | G |
| 6 | Link "Explorar componentes" que leva ao editor do zero | SHOULD | P |
| 7 | Carregar templates da tabela `templates` (apenas ativo = true, via RLS publico) | MUST | M |
| 8 | Skeleton loading durante carregamento (conforme Parte 9.3 da spec) | MUST | P |

**Agente responsavel:** `@dev` (Dex), `@ux-design-expert` para UI, `@data-engineer` para schema de templates

**Ponto critico:** A story 5 implementa o modelo SNAPSHOT — o clone completo do JSONB do template para o projeto do cliente, tornando-o independente do template original.

**Design System aplicavel:**
- Sidebar: largura fixa, itens com padding 12px 16px, hover bg rgba(255,255,255,0.1)
- Grid: 3 colunas desktop, gap 24px
- Card: radius 16px, overflow hidden, shadow-md no hover
- Busca: search-input 400px, bg #F9FAFB, border 1px #E5E7EB

---

### EP-05: Editor Visual (Drag-and-Drop) — Cliente

**Objetivo:** Reproduzir a tela do `comeceDoZero.png` — editor principal da plataforma

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Layout do editor: sidebar de componentes (esquerda) + canvas central + toolbar superior | MUST | G |
| 2 | Sidebar de categorias de componentes (Cabecalho, Depoimentos, Digital, Textos, Botoes, Politica de Privacidade, Chamada para acao, Blocos, Formularios, Footer) | MUST | G |
| 3 | Grid de componentes visuais com thumbnail por categoria | MUST | G |
| 4 | Sistema drag-and-drop com dnd-kit: arrastar componente da sidebar para o canvas | MUST | GG |
| 5 | Canvas: area de preview onde componentes sao empilhados em ordem | MUST | G |
| 6 | Reordenacao de secoes no canvas (drag para reordenar) | MUST | M |
| 7 | Selecao de componente no canvas -> painel de propriedades (somente props com `editavel_cliente = true` se veio de template) | MUST | G |
| 8 | Preview responsivo (toggle desktop/tablet/mobile) | MUST | M |
| 9 | Undo/Redo (ctrl+z / ctrl+shift+z) | SHOULD | M |
| 10 | Salvar projeto no Supabase (auto-save + save manual) | MUST | M |
| 11 | Toolbar: botoes Salvar, Preview, Exportar, Toggle responsivo | MUST | M |
| 12 | Link "Explorar Modelos" que leva a galeria de templates | SHOULD | P |

**Agente responsavel:** `@architect` para integracao dnd-kit, `@dev` (Dex), `@ux-design-expert`

**Ponto critico (Story 7):** Quando o projeto vem de um template clonado, o painel de propriedades exibe apenas as props marcadas como `editavel_cliente = true`. Quando criado do zero, todas as props sao editaveis.

**Design System aplicavel:**
- Sidebar componentes: bg #1A1A1A (dark), 240px, categorias colapsaveis
- Canvas: bg #FFFFFF, max-width variavel conforme preview
- Toolbar: 64px height, bg #FFFFFF, border-bottom 1px #E5E7EB

---

### EP-06: Biblioteca de Componentes Base

**Objetivo:** Componentes visuais arrastaveis conforme categorias do print `comeceDoZero.png`

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | **Cabecalho/Header**: 4+ variantes (hero com imagem, hero com video bg, hero minimalista, hero com form) | MUST | G |
| 2 | **Textos**: secao de texto livre, titulo + subtitulo, 2 colunas de texto | MUST | M |
| 3 | **Botoes/CTA**: botao primario, secundario, outline, CTA full-width | MUST | P |
| 4 | **Chamada para acao**: banner CTA com titulo + botao, CTA com imagem lateral | MUST | M |
| 5 | **Blocos**: secao de features (grid 3 colunas), cards informativos, secao com icones | MUST | M |
| 6 | **Depoimentos**: carousel de testimonials, grid de depoimentos com foto + nome | MUST | M |
| 7 | **Formularios**: formulario de contato (nome, email, telefone, mensagem), formulario newsletter | MUST | M |
| 8 | **Footer**: footer com colunas (links, contato, redes sociais), footer simples | MUST | M |
| 9 | **Politica de Privacidade**: secao de texto legal, banner de cookies | SHOULD | P |
| 10 | **Digital**: secao de midias sociais, embed de video, galeria de imagens | SHOULD | M |
| 11 | **Divisores/Espacadores**: linha horizontal, espaco vertical, wave divider | MUST | P |
| 12 | Cada componente: versao de edicao (canvas) + versao de render (preview/export) | MUST | G |
| 13 | Painel de propriedades por componente (texto, cores, imagens, links, alinhamento) | MUST | G |
| 14 | Registrar cada componente no Puck (admin) e no dnd-kit (cliente) | MUST | G |

**Agente responsavel:** `@dev` (Dex), `@ux-design-expert` para variantes visuais

**Regras (da spec):**
- Cada componente < 300 linhas (Parte 4.4)
- Tailwind utility-first, sem inline styles (Parte 6.1)
- Responsivos em mobile/tablet/desktop (Breakpoints do design-system.md)
- shadcn/ui como base + CVA para variantes
- Componentes devem funcionar tanto no Puck (admin) quanto no dnd-kit (cliente)

---

### EP-07: Templates Especializados para Contabilidade

**Objetivo:** Templates prontos para o nicho contabil (criados pelo admin via Puck)

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Template: "Escritorio de Contabilidade Moderno" (hero + servicos + equipe + depoimentos + contato + footer) | MUST | G |
| 2 | Template: "Contador Autonomo" (hero pessoal + sobre + servicos + depoimentos + CTA WhatsApp) | MUST | G |
| 3 | Template: "Abertura de Empresa" (hero + passo-a-passo + FAQ + formulario + CTA) | SHOULD | G |
| 4 | Template: "Consultoria Fiscal" (hero + servicos detalhados + numeros + depoimentos + contato) | SHOULD | G |
| 5 | Categorias de filtro na galeria: "Contabilidade", "Consultoria", "MEI/Abertura", "Geral" | MUST | P |
| 6 | Thumbnails de preview para cada template | MUST | M |
| 7 | Definir flags `editavel_cliente` apropriadas para cada template contabil | MUST | M |

**Agente responsavel:** `@ux-design-expert` para design, `@dev` (Dex), admin cria via Puck

---

### EP-08: Componentes do Nicho Contabil

**Objetivo:** Componentes especializados que nao existem em builders genericos

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Secao "Nossos Servicos" com icones contabeis (fiscal, trabalhista, societario, consultoria, BPO, IRPF) | MUST | M |
| 2 | Secao "Equipe" (fotos + nome + cargo + CRM/CRC) | MUST | M |
| 3 | Banner "Agende uma Consulta" com botao WhatsApp integrado | MUST | P |
| 4 | Secao "Numeros do Escritorio" (clientes atendidos, anos de mercado, empresas abertas — contador animado) | SHOULD | M |
| 5 | Secao "Perguntas Frequentes" para contabilidade (accordion pre-preenchido) | SHOULD | P |
| 6 | Secao "Localizacao" com mapa embed + dados de contato | COULD | M |

**Agente responsavel:** `@dev` (Dex), `@ux-design-expert` para visual

---

### EP-09: Sistema de Formularios e Captacao de Leads

**Objetivo:** Formularios funcionais que capturam leads para o escritorio

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Formulario de contato padrao (nome, email, telefone, mensagem) com validacao Zod | MUST | M |
| 2 | Armazenamento de leads no Supabase (tabela leads com RLS por usuario) | MUST | M |
| 3 | Botao WhatsApp flutuante com numero e mensagem configuravel | MUST | P |
| 4 | Notificacao por email ao receber lead (Edge Function) | SHOULD | M |
| 5 | Lista de leads no dashboard (visualizar, filtrar, exportar CSV) | SHOULD | M |
| 6 | Anti-spam: honeypot + rate limiting na Edge Function | MUST | P |

**Agente responsavel:** `@dev` (Dex), `@data-engineer` para schema, `@qa` (Quinn) para validacao

**Regras de seguranca (da spec):**
- Edge Function com Zod + Problem Details + Logging (Parte 5.1)
- Rate limiting por IP (Parte 3)
- RLS com FORCE em tabela de leads (Parte 3.1)
- Nunca expor dados de leads de um usuario para outro

---

### EP-10: Dashboard e Gestao de Projetos

**Objetivo:** Area logada para gerenciar landing pages criadas

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Dashboard com grid de projetos (card com thumbnail, nome, data, status) | MUST | M |
| 2 | Criar novo projeto (leva para Tela Inicial EP-03) | MUST | P |
| 3 | Duplicar projeto existente | SHOULD | P |
| 4 | Excluir projeto (soft delete com confirmacao) | MUST | P |
| 5 | Busca e filtro de projetos por nome/data | SHOULD | P |
| 6 | Sidebar de navegacao conforme design-system.md (240px, bg #1A1A1A, icones outline) | MUST | M |

**Design System aplicavel:**
- Sidebar: conforme "Layout > Sidebar" do design-system.md
- Header/Topbar: 64px, bg white, border-bottom, search input 400px
- Content area: bg #F9FAFB, max-width 1280px, padding 24-32px
- Cards de projeto: stat-card style, radius 12px, shadow-card

---

### EP-11: Exportacao e Preview

**Objetivo:** Transformar o projeto visual em codigo utilizavel

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Preview em nova aba (renderizacao completa da landing page) | MUST | G |
| 2 | Exportar como HTML + CSS + JS (zip download) | MUST | G |
| 3 | Codigo gerado limpo, semantico e responsivo | MUST | G |
| 4 | Incluir meta tags basicas no HTML exportado | MUST | P |

**Agente responsavel:** `@dev` (Dex), `@architect` para engine de renderizacao

**Decisao arquitetural (ADR):**
- Engine de render unica: mesma funcao gera preview E HTML exportado
- Garantir fidelidade: preview === export

---

### EP-12: SEO e Meta Tags

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | Painel de configuracao SEO no editor (title, description, keywords) | MUST | M |
| 2 | Open Graph tags (og:title, og:description, og:image) | SHOULD | P |
| 3 | Favicon customizavel | COULD | P |
| 4 | Sitemap basico no HTML exportado | COULD | P |

---

### EP-17: Sistema de Aprendizado (Learning)

**Objetivo:** Central de educacao para ensinar usuarios a usar a plataforma, criar landing pages eficazes e maximizar conversoes
**Referencia:** Adaptado de `diagnosticopro` (learning system) e `cclasstrib-api` (aprendizado API)

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | **Admin:** CRUD de modulos de aprendizado (titulo, descricao, thumbnail, ordem, status publicado/rascunho) | MUST | M |
| 2 | **Admin:** CRUD de aulas dentro de modulos (titulo, video URL, ordem, anexos) | MUST | M |
| 3 | **Admin:** Upload de thumbnails para modulos (Supabase Storage) | MUST | P |
| 4 | **Admin:** Gerenciar anexos por aula (upload de PDFs, imagens) | SHOULD | M |
| 5 | **Admin:** Moderar comentarios de aulas (aprovar/rejeitar) | SHOULD | M |
| 6 | **Cliente:** Pagina de aprendizado com grid de modulos (cards com thumbnail, titulo, progresso) | MUST | M |
| 7 | **Cliente:** Visualizacao de aula com player de video (YouTube embed) | MUST | M |
| 8 | **Cliente:** Tracking de progresso (marcar aula como concluida, barra de progresso por modulo) | MUST | M |
| 9 | **Cliente:** Sistema de comentarios por aula | SHOULD | M |
| 10 | **Cliente:** Sistema de avaliacao por estrelas (1-5) por aula | SHOULD | P |
| 11 | **Cliente:** Certificado de conclusao de modulo (geracao PDF) | COULD | G |

**Agente responsavel:** `@dev` (Dex), `@ux-design-expert` para UI, `@data-engineer` para schema

**Conteudos planejados para o nicho:**
- "Como criar uma landing page que converte" (modulo introdutorio)
- "Usando o editor visual — passo a passo" (tutorial da ferramenta)
- "Melhores praticas de SEO para contadores" (SEO basico)
- "Como capturar leads com formularios eficazes" (marketing)
- "Configurando seu WhatsApp Business" (integracao)

**Dados relevantes (do diagnosticopro):**
- Hooks: `useLearningAdmin()`, `useLearningModule()`, `useLearningLesson()`
- Componentes: ModuleCard, YouTubePlayer, CommentSection, StarRating, CertificateModal
- Schema: learning_modules, learning_lessons, learning_attachments, learning_progress, lesson_comments

---

### EP-18: Ajuda Contextual e Dicas (Help Tips)

**Objetivo:** Sistema de dicas contextuais em todas as telas da plataforma, com video e texto configuravel pelo admin
**Referencia:** Adaptado de `diagnosticopro` (help tips system)

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | **Admin:** Pagina de gestao de dicas de ajuda organizadas por pagina/secao | MUST | M |
| 2 | **Admin:** Editar dica: titulo, descricao, video URL, ativo/inativo | MUST | M |
| 3 | **Admin:** Metricas: total de dicas, dicas com conteudo, dicas ativas | SHOULD | P |
| 4 | **Cliente:** Componente `HelpTipButton` — botao (?) contextual ao lado de labels/secoes | MUST | M |
| 5 | **Cliente:** Componente `HelpTipDialog` — modal com video + texto explicativo | MUST | M |
| 6 | **Cliente:** Auto-registro de anchor points (cada HelpTipButton registra sua pagina/secao) | SHOULD | M |
| 7 | Dicas pre-configuradas para: Editor, Galeria de Templates, Dashboard, Exportacao, SEO, Formularios | MUST | M |

**Agente responsavel:** `@dev` (Dex), `@ux-design-expert`

**Paginas com help tips planejados:**
- `/editor` — "Como arrastar componentes", "Como editar propriedades", "Preview responsivo"
- `/templates` — "Como escolher um template", "Filtros de categoria"
- `/dashboard` — "Gerenciando seus projetos", "Exportar vs Preview"
- `/editor/seo` — "Configurando SEO", "Open Graph tags"
- `/editor/formulario` — "Configurando formularios de lead", "Anti-spam"

**Dados relevantes (do diagnosticopro):**
- Hooks: `useHelpTips()`, `useHelpTipsAdmin()`
- Componentes: HelpTipButton (51 linhas), HelpTipDialog (40 linhas)
- Schema: help_tips (id, page_path, section_title, title, description, video_url, is_active)

---

### EP-19: Comunicados e Notificacoes (Announcements)

**Objetivo:** Sistema para admin comunicar novidades, manutencoes, novos templates e updates aos clientes
**Referencia:** Adaptado de `diagnosticopro` (announcement system completo)

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | **Admin:** CRUD de comunicados (titulo, conteudo, tipo, prioridade, data expiracao) | MUST | G |
| 2 | **Admin:** Tipos: info, warning, maintenance, update (com icones e cores distintas) | MUST | P |
| 3 | **Admin:** Status: rascunho/publicado/expirado | MUST | P |
| 4 | **Admin:** Rich text editor (TipTap) para conteudo do comunicado | MUST | M |
| 5 | **Admin:** URL externa e path interno opcionals (link do comunicado) | SHOULD | P |
| 6 | **Cliente:** Banner de comunicado no topo da pagina (dismissivel) | MUST | M |
| 7 | **Cliente:** NotificationBell no header com badge de nao-lidos (max 9+) | MUST | M |
| 8 | **Cliente:** Popover de notificacoes recentes (ultimas 5) com "ver mais" | MUST | M |
| 9 | **Cliente:** Pagina de notificacoes com busca, filtros (status, tipo, data), ordenacao e paginacao | SHOULD | G |
| 10 | **Cliente:** Marcar como lido (individual e ao abrir) | MUST | P |

**Agente responsavel:** `@dev` (Dex), `@ux-design-expert`

**Tipos de comunicado para o contexto:**
- **info:** "Novo template disponivel: Escritorio Moderno v2"
- **update:** "Nova funcionalidade: Exportacao com meta tags OG"
- **maintenance:** "Manutencao programada dia 15/03 das 02h-04h"
- **warning:** "Atualize seu perfil para aproveitar novos recursos"

**Dados relevantes (do diagnosticopro):**
- Hooks: `useAnnouncements()`, `useAnnouncementsAdmin()`
- Componentes: AnnouncementBanner, NotificationBell (com popover)
- Schema: announcements, announcement_dismissals
- Rich text: TipTap editor (ja usado em legal pages tambem)

---

### EP-20: Onboarding, Suporte e Configuracoes

**Objetivo:** Experiencia de primeiro acesso, suporte via WhatsApp e configuracoes admin centralizadas
**Referencia:** Adaptado de `diagnosticopro` (onboarding, support, admin settings)

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | **Admin:** Configurar video de boas-vindas (URL + titulo) para onboarding | MUST | P |
| 2 | **Admin:** Configurar suporte WhatsApp (numero, horario de atendimento, mensagem fora de horario) | MUST | M |
| 3 | **Admin:** Pagina de configuracoes gerais (key-value store em admin_settings) | MUST | M |
| 4 | **Cliente:** Modal de onboarding no primeiro acesso (video de boas-vindas + "Nao mostrar novamente") | MUST | M |
| 5 | **Cliente:** SupportFab — botao flutuante WhatsApp (canto inferior direito, verde #25D366) | MUST | P |
| 6 | **Cliente:** Pagina de suporte com info de contato e horarios | SHOULD | P |
| 7 | **Ambos:** Tabela `admin_settings` centralizada (key-value) para todas as configuracoes da plataforma | MUST | P |

**Agente responsavel:** `@dev` (Dex)

**Configuracoes admin planejadas:**
- `onboarding_video_url` — Video de boas-vindas
- `onboarding_video_title` — Titulo do video
- `support_whatsapp` — Numero do suporte
- `support_hours_days` — "Segunda a Sexta"
- `support_hours_start` — "09:00"
- `support_hours_end` — "18:00"
- `support_hours_note` — Mensagem fora de horario
- `platform_name` — Nome da plataforma
- `platform_logo_url` — Logo

**Dados relevantes (do diagnosticopro):**
- Hooks: `useOnboarding()`, `useSupportSettings()`, `useAdminSettings()`, `useSetting(key)`
- Componentes: OnboardingVideoModal, SupportFab
- Schema: admin_settings (key-value), visualizacoes_onboarding

---

### EP-21: Paginas Legais e Conformidade (Termos, LGPD)

**Objetivo:** Gestao de termos de uso, politica de privacidade e LGPD com versionamento e aceitacao obrigatoria
**Referencia:** Adaptado de `diagnosticopro` (legal pages system) e `cclasstrib-api` (termos com versionamento)

| # | Story | Prioridade | Tamanho |
|---|-------|------------|---------|
| 1 | **Admin:** Editar paginas legais (Termos de Uso, Politica de Privacidade, LGPD) com rich text editor | MUST | M |
| 2 | **Admin:** Versionamento automatico (incrementa versao ao salvar) com historico | MUST | M |
| 3 | **Admin:** Registro de quem editou e quando (audit trail) | MUST | P |
| 4 | **Cliente:** Modal de aceitacao de termos obrigatoria no primeiro login e quando versao atualiza | MUST | M |
| 5 | **Cliente:** Checkbox "Li e aceito os termos" obrigatorio antes de usar a plataforma | MUST | P |
| 6 | **Publico:** Paginas legais acessiveis via URL publica (/termos/:slug) | MUST | P |
| 7 | **Ambos:** Tracking de aceitacao por usuario (user_id, legal_page_id, version, accepted_at) | MUST | P |

**Agente responsavel:** `@dev` (Dex), `@data-engineer` para schema

**Paginas legais planejadas:**
- `termos-de-uso` — Termos de Uso da plataforma
- `politica-de-privacidade` — Politica de Privacidade
- `lgpd` — Politica de Protecao de Dados (LGPD)

**Dados relevantes (do diagnosticopro):**
- Hooks: `useTermsAcceptance()`
- Componentes: TermsAcceptanceModal
- Schema: legal_pages, legal_page_versions, terms_acceptance
- Fluxo: Login -> verifica termos pendentes -> mostra modal -> aceita -> libera acesso

---

## 6. ESTRUTURA DE FEATURES (Bulletproof React)

```
src/
  app/
    routes/              # Rotas da aplicacao (admin/* e cliente)
    App.tsx              # Root component
    provider.tsx         # ThemeProvider, AuthProvider, QueryProvider
    router.tsx           # Configuracao de rotas com guards

  features/
    auth/                # EP-02: Login, registro, sessao, perfil, roles
      api/ components/ hooks/ types/ utils/

    admin/               # EP-13 a EP-21: Todo o backoffice admin
      components/
        layout/          # AdminSidebar, AdminHeader, AdminLayout
        template-builder/ # Integracao Puck
        importador/      # Import de layouts
        componentes/     # Gestao da biblioteca
        usuarios/        # Gestao de usuarios
        comunicados/     # Gestao de comunicados
        aprendizado/     # Gestao de modulos e aulas
        ajuda/           # Gestao de dicas de ajuda
        suporte/         # Configuracao de suporte
        onboarding/      # Configuracao de onboarding
        paginas-legais/  # Gestao de termos e privacidade
        configuracoes/   # Configuracoes gerais (admin_settings)
      api/ hooks/ types/ utils/

    landing-builder/     # EP-03 + EP-05: Tela inicial + Editor visual (cliente)
      api/ components/ hooks/ types/ utils/

    templates/           # EP-04 + EP-07: Galeria e templates contabeis (cliente)
      api/ components/ hooks/ types/ utils/

    componentes-lp/      # EP-06 + EP-08: Biblioteca de componentes (compartilhada)
      components/        # Componentes reais (HeroComImagem, ServicosContabeis, etc.)
      registry/          # Registro para Puck (admin) e dnd-kit (cliente)
      api/ hooks/ types/ utils/

    leads/               # EP-09: Formularios e captacao
      api/ components/ hooks/ types/ utils/

    dashboard/           # EP-10: Gestao de projetos (cliente)
      api/ components/ hooks/ types/ utils/

    exportacao/          # EP-11 + EP-12: Export, preview, SEO
      api/ components/ hooks/ types/ utils/

    aprendizado/         # EP-17: Central de aprendizado (cliente)
      api/ components/ hooks/ types/ utils/

    notificacoes/        # EP-19: Comunicados e notificacoes (cliente)
      api/ components/ hooks/ types/ utils/

    legal/               # EP-21: Paginas legais publicas
      api/ components/ hooks/ types/ utils/

  components/
    ui/                  # shadcn/ui (Button, Card, Input, Skeleton, etc.)
    layout/              # Sidebar, Header, MainLayout (cliente)
    shared/              # HelpTipButton, HelpTipDialog, SupportFab,
                         # AnnouncementBanner, NotificationBell,
                         # OnboardingVideoModal, TermsAcceptanceModal,
                         # RichTextEditor, EmptyState, motion wrappers

  hooks/                 # useTheme, useMediaQuery, useDebounce
  lib/                   # cn(), motion-variants.ts, formatters
  types/                 # Tipos globais (Projeto, Template, Componente, Lead, UserRole)
  config/                # env.ts (variaveis tipadas)
  integrations/
    supabase/            # client.ts + types.ts
  utils/                 # Helpers compartilhados
```

---

## 7. SCHEMA DE BANCO DE DADOS

```sql
-- ============================================================
-- PROFILES (extensao do Supabase Auth — com ROLE)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  empresa TEXT,
  logo_url TEXT,
  role TEXT NOT NULL DEFAULT 'cliente'
    CHECK (role IN ('admin', 'cliente')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Funcao helper para RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger para sync role -> JWT custom claims
CREATE OR REPLACE FUNCTION sync_role_to_jwt()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_role_change
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_role_to_jwt();

-- ============================================================
-- TEMPLATES (gerenciados pelo admin)
-- ============================================================
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_por UUID REFERENCES profiles(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL
    CHECK (categoria IN ('contabilidade', 'consultoria', 'mei', 'geral',
                         'negocios', 'cartoes_digitais', 'eventos', 'sem_fins_lucrativos')),
  thumbnail_url TEXT,
  dados_pagina JSONB NOT NULL,
  ativo BOOLEAN DEFAULT true,
  versao INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMPONENTES BIBLIOTECA (registro de componentes disponiveis)
-- ============================================================
CREATE TABLE componentes_biblioteca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  nome_exibicao TEXT NOT NULL,
  categoria TEXT NOT NULL
    CHECK (categoria IN ('cabecalho', 'depoimentos', 'digital', 'textos',
                         'botoes', 'politica_privacidade', 'chamada_acao',
                         'blocos', 'formularios', 'footer', 'divisores')),
  descricao TEXT,
  thumbnail_url TEXT,
  props_schema JSONB NOT NULL DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PROJETOS DE LANDING PAGE (pertence ao cliente)
-- ============================================================
CREATE TABLE projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  template_id UUID REFERENCES templates(id),
  dados_pagina JSONB NOT NULL DEFAULT '{"secoes": []}',
  config_seo JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho', 'publicado', 'arquivado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- LEADS (capturados via formularios das landing pages)
-- ============================================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES projetos(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  nome TEXT,
  email TEXT,
  telefone TEXT,
  mensagem TEXT,
  origem TEXT DEFAULT 'formulario'
    CHECK (origem IN ('formulario', 'whatsapp', 'newsletter')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ADMIN SETTINGS (key-value store — EP-20)
-- ============================================================
CREATE TABLE admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES profiles(id)
);

-- ============================================================
-- COMUNICADOS / ANNOUNCEMENTS (EP-19)
-- ============================================================
CREATE TABLE comunicados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT,
  tipo TEXT NOT NULL DEFAULT 'info'
    CHECK (tipo IN ('info', 'warning', 'maintenance', 'update')),
  prioridade TEXT NOT NULL DEFAULT 'normal'
    CHECK (prioridade IN ('normal', 'high')),
  is_publicado BOOLEAN DEFAULT false,
  criado_por UUID REFERENCES profiles(id),
  expira_em TIMESTAMPTZ,
  url_externa TEXT,
  path_interno TEXT,
  has_detalhe BOOLEAN DEFAULT false,
  detalhe_body TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE comunicados_lidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comunicado_id UUID NOT NULL REFERENCES comunicados(id) ON DELETE CASCADE,
  lido_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, comunicado_id)
);

-- ============================================================
-- APRENDIZADO / LEARNING (EP-17)
-- ============================================================
CREATE TABLE modulos_aprendizado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  thumbnail_url TEXT,
  is_publicado BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID NOT NULL REFERENCES modulos_aprendizado(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  video_url TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE aulas_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  tamanho INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE progresso_aprendizado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  aula_id UUID NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  concluida BOOLEAN DEFAULT false,
  concluida_em TIMESTAMPTZ,
  UNIQUE(user_id, aula_id)
);

CREATE TABLE comentarios_aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  status TEXT DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE avaliacoes_aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, aula_id)
);

-- ============================================================
-- DICAS DE AJUDA / HELP TIPS (EP-18)
-- ============================================================
CREATE TABLE dicas_ajuda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  section_title TEXT NOT NULL,
  titulo TEXT,
  descricao TEXT,
  video_url TEXT,
  is_ativo BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_path, section_title)
);

-- ============================================================
-- PAGINAS LEGAIS (EP-21)
-- ============================================================
CREATE TABLE paginas_legais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  conteudo TEXT,
  versao_atual INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES profiles(id)
);

CREATE TABLE paginas_legais_versoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pagina_legal_id UUID NOT NULL REFERENCES paginas_legais(id) ON DELETE CASCADE,
  versao INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT,
  publicado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE aceites_termos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pagina_legal_id UUID NOT NULL REFERENCES paginas_legais(id),
  versao INTEGER NOT NULL,
  aceito_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, pagina_legal_id)
);

-- ============================================================
-- ONBOARDING VIEWS (EP-20)
-- ============================================================
CREATE TABLE visualizacoes_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  visualizado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================================
-- RLS — ROW LEVEL SECURITY
-- ============================================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (is_admin());

-- TEMPLATES
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates FORCE ROW LEVEL SECURITY;

CREATE POLICY "Templates ativos sao publicos"
  ON templates FOR SELECT USING (ativo = true);
CREATE POLICY "Admins full access templates"
  ON templates FOR ALL USING (is_admin());

-- COMPONENTES BIBLIOTECA
ALTER TABLE componentes_biblioteca ENABLE ROW LEVEL SECURITY;
ALTER TABLE componentes_biblioteca FORCE ROW LEVEL SECURITY;

CREATE POLICY "Componentes ativos sao publicos"
  ON componentes_biblioteca FOR SELECT USING (ativo = true);
CREATE POLICY "Admins full access componentes"
  ON componentes_biblioteca FOR ALL USING (is_admin());

-- PROJETOS
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own projetos"
  ON projetos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all projetos"
  ON projetos FOR SELECT USING (is_admin());

-- LEADS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Leads can be inserted via Edge Function"
  ON leads FOR INSERT WITH CHECK (true);  -- controlado pela Edge Function
CREATE POLICY "Admins can view all leads"
  ON leads FOR SELECT USING (is_admin());

-- ADMIN SETTINGS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings FORCE ROW LEVEL SECURITY;

CREATE POLICY "Settings are public read"
  ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Admins full access settings"
  ON admin_settings FOR ALL USING (is_admin());

-- COMUNICADOS
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados FORCE ROW LEVEL SECURITY;

CREATE POLICY "Comunicados publicados sao publicos"
  ON comunicados FOR SELECT USING (is_publicado = true);
CREATE POLICY "Admins full access comunicados"
  ON comunicados FOR ALL USING (is_admin());

ALTER TABLE comunicados_lidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados_lidos FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reads"
  ON comunicados_lidos FOR ALL USING (auth.uid() = user_id);

-- APRENDIZADO
ALTER TABLE modulos_aprendizado ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos_aprendizado FORCE ROW LEVEL SECURITY;

CREATE POLICY "Modulos publicados sao publicos"
  ON modulos_aprendizado FOR SELECT USING (is_publicado = true);
CREATE POLICY "Admins full access modulos"
  ON modulos_aprendizado FOR ALL USING (is_admin());

ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas FORCE ROW LEVEL SECURITY;

CREATE POLICY "Aulas de modulos publicados sao publicas"
  ON aulas FOR SELECT USING (
    EXISTS (SELECT 1 FROM modulos_aprendizado m WHERE m.id = modulo_id AND m.is_publicado = true)
  );
CREATE POLICY "Admins full access aulas"
  ON aulas FOR ALL USING (is_admin());

ALTER TABLE progresso_aprendizado ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_aprendizado FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own progress"
  ON progresso_aprendizado FOR ALL USING (auth.uid() = user_id);

ALTER TABLE comentarios_aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios_aulas FORCE ROW LEVEL SECURITY;

CREATE POLICY "Comentarios aprovados sao publicos"
  ON comentarios_aulas FOR SELECT USING (status = 'aprovado');
CREATE POLICY "Users can insert own comments"
  ON comentarios_aulas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access comentarios"
  ON comentarios_aulas FOR ALL USING (is_admin());

ALTER TABLE avaliacoes_aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_aulas FORCE ROW LEVEL SECURITY;

CREATE POLICY "Avaliacoes sao publicas"
  ON avaliacoes_aulas FOR SELECT USING (true);
CREATE POLICY "Users manage own ratings"
  ON avaliacoes_aulas FOR ALL USING (auth.uid() = user_id);

-- DICAS DE AJUDA
ALTER TABLE dicas_ajuda ENABLE ROW LEVEL SECURITY;
ALTER TABLE dicas_ajuda FORCE ROW LEVEL SECURITY;

CREATE POLICY "Dicas ativas sao publicas"
  ON dicas_ajuda FOR SELECT USING (is_ativo = true);
CREATE POLICY "Admins full access dicas"
  ON dicas_ajuda FOR ALL USING (is_admin());

-- PAGINAS LEGAIS
ALTER TABLE paginas_legais ENABLE ROW LEVEL SECURITY;
ALTER TABLE paginas_legais FORCE ROW LEVEL SECURITY;

CREATE POLICY "Paginas legais sao publicas"
  ON paginas_legais FOR SELECT USING (true);
CREATE POLICY "Admins full access paginas legais"
  ON paginas_legais FOR ALL USING (is_admin());

ALTER TABLE aceites_termos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aceites_termos FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own acceptances"
  ON aceites_termos FOR ALL USING (auth.uid() = user_id);

-- ONBOARDING
ALTER TABLE visualizacoes_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizacoes_onboarding FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own onboarding"
  ON visualizacoes_onboarding FOR ALL USING (auth.uid() = user_id);
```

---

## 8. ROADMAP DE ENTREGAS

```
====================================================================
FASE 1 — FUNDACAO + ADMIN (Semanas 1-14)
====================================================================

SPRINT 1-2 (Semanas 1-4)
  EP-01: Setup completo
  EP-02: Auth com sistema de roles (admin/cliente)
  -> Entregavel: App com login, roles, estrutura base, design system

SPRINT 3-4 (Semanas 5-8)
  EP-13: Admin Backoffice Core (layout, CRUD templates)
  EP-16: Gestao da Biblioteca de Componentes
  -> Entregavel: Painel admin funcional com listagem de templates

SPRINT 5-7 (Semanas 9-14)
  EP-14: Template Builder com Puck
  EP-15: Importacao de Layouts (basico)
  -> Entregavel: Admin pode criar e importar templates completos
  -> *** ADMIN MVP ***

====================================================================
FASE 2 — MVP CLIENTE (Semanas 15-26)
====================================================================

SPRINT 8-9 (Semanas 15-18)
  EP-03: Tela inicial
  EP-04: Galeria de templates (com SNAPSHOT)
  -> Entregavel: Cliente pode escolher template e clonar

SPRINT 10-12 (Semanas 19-24)
  EP-05: Editor visual (DnD com dnd-kit)
  EP-06: Componentes base
  -> Entregavel: Editor funcional com componentes arrastaveis

SPRINT 13 (Semanas 25-26)
  EP-10: Dashboard de projetos
  EP-11: Exportacao e Preview
  -> *** MVP CLIENTE LANCAMENTO ***

====================================================================
FASE 3 — NICHO CONTABIL + LEADS + SEO (Semanas 27-34)
====================================================================

SPRINT 14-15 (Semanas 27-30)
  EP-07: Templates contabeis (criados pelo admin via Puck)
  EP-08: Componentes do nicho contabil
  -> Entregavel: 4 templates + componentes especializados

SPRINT 16-17 (Semanas 31-34)
  EP-09: Sistema de leads
  EP-12: SEO e meta tags
  -> *** PRODUTO V1 ***

====================================================================
FASE 4 — PLATAFORMA COMPLETA (Semanas 35-42)
====================================================================

SPRINT 18-19 (Semanas 35-38)
  EP-21: Paginas legais (termos, privacidade, LGPD)
  EP-20: Onboarding + suporte + configuracoes admin
  EP-18: Ajuda contextual (help tips)
  -> Entregavel: Conformidade legal + suporte + dicas

SPRINT 20-21 (Semanas 39-42)
  EP-17: Sistema de aprendizado (modulos, aulas, progresso)
  EP-19: Comunicados e notificacoes
  -> *** PLATAFORMA COMPLETA V1.1 ***
```

---

## 9. ADRs NECESSARIAS

Antes de iniciar a implementacao, os seguintes ADRs (Architecture Decision Records) devem ser definidos pelo `@architect`:

| # | ADR | Impacto | Epico |
|---|-----|---------|-------|
| 1 | **Lib de DnD (cliente):** dnd-kit vs react-beautiful-dnd vs pragmatic-drag-and-drop | Alto | EP-05 |
| 2 | **Integracao Puck:** Adapter Puck JSON <-> JSONB padrao, estrategia de rendering | Critico | EP-14 |
| 3 | **Single app vs Separate apps:** Confirmar decisao de app unica com route-based separation | Medio | EP-13 |
| 4 | **Registro de componentes:** Como registrar componentes para funcionar em Puck (admin) E dnd-kit (cliente) | Alto | EP-06, EP-14 |
| 5 | **Modelo SNAPSHOT:** Estrategia de clone completo do template para projeto do cliente | Alto | EP-04 |
| 6 | **Validacao JSONB:** Schema Zod para validar estrutura do dados_pagina em runtime | Medio | EP-05, EP-14 |
| 7 | **Estrategia de parsing HTML** para importacao de layouts | Alto | EP-15 |

---

## 10. DELEGACAO PARA O TIME AIOS

| Agente | Responsabilidade | Epicos |
|--------|-----------------|--------|
| `@architect` | ADRs (DnD, Puck, JSONB, rendering), decisoes arquiteturais | EP-05, EP-14, EP-15 |
| `@dev` (Dex) | Implementacao de todo o codigo | EP-01 a EP-21 |
| `@data-engineer` | Schema Supabase com roles, RLS policies, migrations, is_admin() | EP-02, EP-04, EP-09, EP-13, EP-17, EP-19, EP-21 |
| `@ux-design-expert` | Layout das telas (admin + cliente), variantes de componentes | EP-03, EP-04, EP-05, EP-06, EP-07, EP-13, EP-17, EP-18 |
| `@qa` (Quinn) | Validacao de seguranca, RLS, testes manuais, testes de role | Todos |
| `@sm` | Detalhamento de stories para cada epico | Todos |
| `@po` (Pax) | Refinamento e priorizacao do backlog | Todos |
| `@devops` | Setup de git, CI/CD, deploy | EP-01 |
| `@analyst` | Pesquisa de libs, analise competitiva, viabilidade tecnica | EP-14, EP-15 |

### Referencia de Codigo dos Projetos Existentes

Componentes e hooks dos projetos `diagnosticopro` e `cclasstrib-web-1` que servem de base para implementacao:

| Feature | Arquivo(s) de Referencia | Epico |
|---------|-------------------------|-------|
| Admin Layout | `diagnosticopro/src/components/layout/admin-layout.tsx` | EP-13 |
| User Management | `diagnosticopro/src/pages/admin/admin-users.tsx` + hook | EP-13 |
| Announcements | `diagnosticopro/src/pages/admin/admin-announcements.tsx` + hooks + banner + bell | EP-19 |
| Help Tips | `diagnosticopro/src/pages/admin/admin-help-tips.tsx` + HelpTipButton + HelpTipDialog | EP-18 |
| Learning System | `diagnosticopro/src/pages/aprendizado*.tsx` + components/learning/* + hooks | EP-17 |
| Legal Pages | `diagnosticopro/src/pages/admin/admin-legal-pages.tsx` + TermsAcceptanceModal | EP-21 |
| Onboarding | `diagnosticopro/src/pages/admin/admin-onboarding.tsx` + OnboardingVideoModal | EP-20 |
| Support FAB | `diagnosticopro/src/components/shared/support-fab.tsx` | EP-20 |
| Admin Settings | `diagnosticopro/src/hooks/use-admin-settings.ts` | EP-20 |
| Rich Text Editor | `diagnosticopro/src/components/shared/rich-text-editor.tsx` (TipTap) | EP-19, EP-21 |
| Motion Wrappers | `diagnosticopro/src/components/shared/motion.tsx` (SlideDown, FadeIn, Stagger) | EP-01 |
| Notification Page | `diagnosticopro/src/pages/notificacoes.tsx` (filtros, busca, paginacao) | EP-19 |
| Auth OTP Pattern | `cclasstrib-api/src/auth/` (JWT + OTP + guards) | EP-02 |
| Email Service | `cclasstrib-api/src/email/email.service.ts` (multi-provider) | EP-09, EP-19 |
| Activity Logging | `cclasstrib-api/src/atividade-usuario/` (audit trail) | Futuro |
| UI Components | `diagnosticopro/src/components/ui/` (25 componentes Radix + Tailwind) | EP-01 |

---

## 11. RISCOS E MITIGACOES

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Complexidade da integracao Puck | Critico | Prototipo isolado (spike) na Sprint 5 antes de commitar |
| Adapter Puck JSON <-> JSONB padrao | Alto | ADR dedicada + testes unitarios extensivos |
| Complexidade do editor DnD (cliente) | Alto | Usar dnd-kit (madura) + prototipo isolado antes |
| Performance com muitos componentes | Medio | Virtualizacao + lazy loading + memoizacao |
| Exportacao HTML fiel ao preview | Alto | Engine de render unica para preview e export |
| Seguranca de dados entre usuarios | Critico | RLS rigoroso + is_admin() + testes de penetracao com @qa |
| Parsing HTML na importacao | Alto | Interface de revisao obrigatoria + mapeamento manual como fallback |
| Licenca de componentes (Tailwind UI) | Critico | **BLOQUEADA** — usar apenas shadcn/ui blocks + Aceternity + Magic UI (MIT) |
| Escopo creep | Alto | Respeitar MUST/SHOULD/COULD, cortar se necessario |
| Admin-first delay no MVP cliente | Medio | Sprints admin paralelas com setup de componentes base |

---

## 13. PROXIMOS PASSOS IMEDIATOS

1. **Stakeholder** valida este PRD v3.1
2. `@architect` -> define ADRs (Puck, DnD, JSONB, rendering, SNAPSHOT)
3. `@data-engineer` -> revisa e detalha schema SQL completo (21 tabelas + RLS)
4. `@sm` -> detalha stories do EP-01 e EP-02
5. `@dev` -> inicializa o projeto (EP-01)
6. `@devops` -> setup git + github remote

---

> **Legenda de Tamanhos:**
> **P** = Pequena (1-2 dias) | **M** = Media (3-5 dias) | **G** = Grande (1-2 semanas) | **GG** = Extra Grande (2+ semanas)

> **Total de Epicos:** 21 | **Fases:** 4 | **Estimativa:** ~42 semanas
> **Projetos de Referencia:** diagnosticopro (Supabase + React), cclasstrib-web-1 (Next.js), cclasstrib-api (NestJS)

---

*— Orion, orquestrando o sistema com squad completo (PO Pax + Analyst)*
