# CLAUDE.md — Gerador de Landing Page

## Project Overview

Plataforma para criacao e geracao de landing pages para escritorios de contabilidade. Suporte a templates prontos, criacao do zero e importacao de layout externo por URL. Interface visual com drag-and-drop (Craft.js), editor WYSIWYG e exportacao de codigo (HTML/ZIP).

## Stack

- **Frontend:** React 18+ / Vite / TypeScript 5 / Tailwind CSS
- **Editor:** Craft.js (drag-and-drop visual editor)
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions em Deno)
- **Arquitetura:** Bulletproof React
- **Package Manager:** npm
- **Servidor auxiliar:** Express + Playwright (porta 3001, para importacao de layout avancada)

## Architecture

Bulletproof React com features isoladas:

```
src/
  app/routes/        -> Paginas da aplicacao (HomePage, DashboardPage, EditorNovoPage, etc.)
  features/          -> Features isoladas
    admin/           -> Painel administrativo (comunicados, suporte, importar layout)
    auth/            -> Autenticacao e registro
    dashboard/       -> Dashboard do usuario
    depoimentos/     -> API e gestao de depoimentos/reviews do Google
    editor/          -> Editor visual Craft.js (componentes, utils, API)
    importar-layout/ -> Importacao de layout por URL (Edge Function + Playwright)
    onboarding/      -> Wizard de onboarding (5 steps)
    secao-presets/   -> Presets de secoes para o editor
    templates/       -> Galeria de templates prontos
  components/        -> Componentes compartilhados (ui/, layout/)
  hooks/             -> Hooks customizados
  lib/               -> Configuracoes (supabase, utils, motion-variants)
  types/             -> Tipos globais
  utils/             -> Utilitarios
  styles/            -> Estilos globais
```

## Build & Run Commands

```bash
# Install
npm install

# Dev server (frontend only)
npm run dev

# Dev server (frontend + Playwright server)
npm run dev:all

# Build (production)
npm run build

# Preview build
npm run preview

# Supabase local
npx supabase start
npx supabase status

# Edge Functions (local, hot-reload)
npx supabase functions serve --no-verify-jwt --env-file supabase/.env
```

## Supabase Edge Functions

| Funcao | Descricao |
|--------|-----------|
| `cadastrar-usuario` | Registro de usuario com role e metadata |
| `delete-user` | Exclusao de conta de usuario |
| `fetch-html` | Fetch + parse de HTML externo para importacao de layout |
| `fetch-google-reviews` | Busca reviews do Google Places API v1 |
| `generate-image` | Geracao de imagem via OpenRouter API (multi-modelo) |

## Database (Supabase)

Tabelas principais:
- `perfil_empresa` — Perfil do escritorio (servicos como JSONB `ServicoItem[]`, cores, logo, hero image, google_place_id)
- `depoimentos` — Depoimentos/reviews de clientes
- `admin_settings` — Configuracoes globais do admin (ex: modelo OpenRouter padrao)
- `openrouter_user_overrides` — Override de modelo de IA por usuario

Migrations em: `supabase/migrations/`

## Key Conventions

- Standalone components com TypeScript estrito
- Validacao com Zod em formularios e inputs
- Supabase RLS obrigatorio em todas as tabelas
- Nunca expor segredos no client (usar Edge Functions)
- Tailwind CSS para estilizacao (sem CSS-in-JS)
- Idioma do codigo: portugues para nomes de dominio, ingles para patterns e infraestrutura
- Nunca commitar `.env` ou credenciais
- Textos do frontend SEMPRE em PT-BR com acentuacao correta

## Editor — Componentes Craft.js

Componentes basicos: `ContainerComponent`, `TextComponent`, `HeadingComponent`, `ImageComponent`, `ButtonComponent`, `DividerComponent`, `SpacerComponent`

Componentes profissionais: `HeroSectionComponent`, `StatsBandComponent`, `BentoFeaturesComponent`, `QuoteHighlightComponent`, `FeaturesSectionComponent`, `TestimonialsGridComponent`

Registrados em: `src/features/editor/components/user-components/index.ts`

## Profile Template (Geracao de Landing Page)

- `src/features/editor/utils/profile-template.ts` — `generateProfileTemplate()` gera TemplateNode JSON completo a partir do perfil
- `src/features/editor/utils/hydrate-template.ts` — `hydrarTemplateComPerfil()` hidrata template existente com dados do perfil
- Servicos: sem limite de quantidade, grid de 3 colunas (multiplos de 3), cada servico pode ter `descricao` opcional
- Hero: suporta `backgroundImage`, `overlayOpacity`, `parallax` (configuravel no perfil)
- Tipo `ServicoItem`: `{ nome: string, descricao?: string }` em `onboarding.types.ts`

## Important File Paths

- Documentacao tecnica: `docs/especificacao_tecnica.md`
- Design System: `docs/design-system.md`
- Objetivo do produto: `docs/objetivo-do-produto.md`
- Perfil empresa (spec): `docs/perfil-empresa.md`
- Plano Craft.js: `docs/plano-implementacao-craftjs.md`

## AIOS Framework

Este projeto usa [AIOS (AI-Orchestrated System)](https://github.com/SynkraAI/aios-core) para orquestracao de agentes de desenvolvimento.

- Agents: `.claude/commands/AIOS/agents/` (12 agentes disponiveis)
- Framework core: `.aios-core/`
- Para invocar agentes: usar `/AIOS/agents/{nome}` no Claude Code (ex: `/AIOS/agents/aios-master`)

### Squad disponivel

| Agente | Persona | Uso |
|--------|---------|-----|
| `aios-master` | Orion | Orquestracao, framework, execucao geral |
| `dev` | Dex | Implementacao de codigo |
| `qa` | Quinn | Testes e code review |
| `architect` | -- | Decisoes arquiteturais |
| `pm` | -- | Product management, epicos |
| `po` | -- | Product owner, stories |
| `sm` | -- | Scrum master |
| `analyst` | -- | Pesquisa e analise |
| `data-engineer` | -- | Banco de dados |
| `devops` | -- | CI/CD e infraestrutura |
| `ux-design-expert` | -- | UX/UI |
| `squad-creator` | -- | Criacao de squads |
