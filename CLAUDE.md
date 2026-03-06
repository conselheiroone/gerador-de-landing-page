# CLAUDE.md — Gerador de Landing Page

## Project Overview

Plataforma para criacao e geracao de landing pages com suporte a templates prontos e criacao do zero. Interface visual com drag-and-drop, editor WYSIWYG e exportacao de codigo.

## Stack

- **Frontend:** React 18+ / Vite / TypeScript 5 / Tailwind CSS
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions)
- **Arquitetura:** Bulletproof React
- **Package Manager:** npm

## Architecture

Bulletproof React com features isoladas:

```
src/
  features/         -> Features isoladas (editor, templates, auth, etc.)
  components/        -> Componentes compartilhados
  hooks/             -> Hooks customizados
  lib/               -> Configuracoes (supabase, etc.)
  types/             -> Tipos globais
  utils/             -> Utilitarios
  styles/            -> Estilos globais
```

## Build & Run Commands

```bash
# Install
npm install

# Dev server
npm run dev

# Build (production)
npm run build

# Preview build
npm run preview
```

## Key Conventions

- Standalone components com TypeScript estrito
- Validacao com Zod em formularios e inputs
- Supabase RLS obrigatorio em todas as tabelas
- Nunca expor segredos no client (usar Edge Functions)
- Tailwind CSS para estilizacao (sem CSS-in-JS)
- Idioma do codigo: portugues para nomes de dominio, ingles para patterns e infraestrutura
- Nunca commitar `.env` ou credenciais

## Important File Paths

- Documentacao tecnica: `docs/especificacao_tecnica.md`
- Design System: `docs/design-system.md`
- Especificacao tributaria: `docs/ESPECIFICACAO_SISTEMA_TRIBUTARIO.md`

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
