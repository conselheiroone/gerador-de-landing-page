# Plano de Implementacao — Craft.js no Gerador de Landing Page

> **Data:** 2026-02-27
> **Versao:** 1.0
> **Status:** Aprovado para implementacao
> **Autor:** Orion (AIOS Master Orchestrator)

---

## 1. Resumo Executivo

### O que e o Craft.js?
Craft.js e um framework React modular para construcao de editores de pagina com drag-and-drop. Diferente de editores prontos, ele fornece os **blocos de construcao** para criar um editor personalizado, mantendo o paradigma "It's Just React".

### Por que Craft.js?
- **100% React** — sem plugins complexos, tudo sao componentes React
- **Drag-and-drop nativo** — sistema de connectors (`connect`, `drag`, `create`)
- **Serializacao JSON** — salvar/carregar estados completos do editor
- **Undo/Redo** — historico de acoes embutido
- **Canvas aninhados** — areas droppaveis hierarquicas (ideal para secoes de landing page)
- **Regras de componentes** — `canDrag`, `canDrop`, `canMoveIn`, `canMoveOut`
- **Compativel com React 19** — peerDependency suporta `^16.8 || ^17 || ^18 || ^19`
- **Layers** — painel de camadas estilo Photoshop (`@craftjs/layers`)

### Decisao sobre Puck Editor
O projeto possui `@puckeditor/core@0.21.1` e `@dnd-kit/*` instalados, mas **nenhum codigo de editor foi implementado** (diretorio `src/features/editor/` esta vazio). **Decisao: substituir Puck por Craft.js**, removendo dependencias nao utilizadas para evitar bundle desnecessario.

---

## 2. Pacotes e Dependencias

### Instalar
```bash
npm install @craftjs/core @craftjs/layers react-contenteditable
```

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| `@craftjs/core` | ^0.2.12 | Framework core do editor (Editor, Frame, Element, useEditor, useNode) |
| `@craftjs/layers` | ^0.2.7 | Painel de camadas estilo Photoshop (opcional, recomendado) |
| `react-contenteditable` | ^3.3.x | Edicao de texto inline no editor |

### Remover (nao utilizados)
```bash
npm uninstall @puckeditor/core @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Nota sobre o ZIP local
O arquivo `C:\Users\user\Downloads\craft.js-main.zip` contem o monorepo completo do Craft.js (core, layers, utils, examples). **Nao e necessario usar o ZIP** — os pacotes npm (`@craftjs/core`, `@craftjs/layers`) sao suficientes e ja suportam React 19. O ZIP serve como referencia para os **exemplos** (especialmente `examples/landing/`).

---

## 3. Arquitetura de Pastas

Seguindo Bulletproof React, toda a implementacao fica isolada em `src/features/editor/`:

```
src/features/editor/
├── api/
│   └── editor-api.ts                    # Salvar/carregar projetos no Supabase
│
├── components/
│   ├── EditorPage.tsx                   # Pagina principal do editor (orquestra tudo)
│   │
│   ├── viewport/                        # Layout do editor (canvas + paineis)
│   │   ├── EditorViewport.tsx           # Layout principal (sidebar + canvas + toolbar)
│   │   ├── EditorHeader.tsx             # Topbar (salvar, preview, undo/redo, toggle editor)
│   │   └── EditorSidebar.tsx            # Sidebar com abas (componentes, camadas, configuracoes)
│   │
│   ├── panels/                          # Paineis laterais
│   │   ├── ToolboxPanel.tsx             # Painel "Drag to add" — lista de componentes
│   │   ├── SettingsPanel.tsx            # Painel de configuracoes do componente selecionado
│   │   └── LayersPanel.tsx              # Painel de camadas (@craftjs/layers)
│   │
│   ├── render/
│   │   └── RenderNode.tsx               # Wrapper de renderizacao (indicadores, toolbar flutuante)
│   │
│   └── user-components/                 # Componentes do usuario (arrastáveis)
│       ├── index.ts                     # Barrel export + resolver map
│       │
│       ├── container/
│       │   ├── ContainerComponent.tsx   # Componente Container (area droppavel)
│       │   └── ContainerSettings.tsx    # Configuracoes do Container
│       │
│       ├── text/
│       │   ├── TextComponent.tsx        # Componente Texto (editavel inline)
│       │   └── TextSettings.tsx         # Configuracoes do Texto
│       │
│       ├── heading/
│       │   ├── HeadingComponent.tsx     # Componente Titulo (H1-H6)
│       │   └── HeadingSettings.tsx      # Configuracoes do Titulo
│       │
│       ├── button/
│       │   ├── ButtonComponent.tsx      # Componente Botao CTA
│       │   └── ButtonSettings.tsx       # Configuracoes do Botao
│       │
│       ├── image/
│       │   ├── ImageComponent.tsx       # Componente Imagem
│       │   └── ImageSettings.tsx        # Configuracoes da Imagem
│       │
│       ├── hero-section/
│       │   ├── HeroSectionComponent.tsx # Secao Hero (composta)
│       │   └── HeroSectionSettings.tsx  # Configuracoes do Hero
│       │
│       ├── features-section/
│       │   ├── FeaturesSectionComponent.tsx
│       │   └── FeaturesSectionSettings.tsx
│       │
│       ├── testimonials-section/
│       │   ├── TestimonialsSectionComponent.tsx
│       │   └── TestimonialsSectionSettings.tsx
│       │
│       ├── cta-section/
│       │   ├── CtaSectionComponent.tsx
│       │   └── CtaSectionSettings.tsx
│       │
│       ├── footer/
│       │   ├── FooterComponent.tsx
│       │   └── FooterSettings.tsx
│       │
│       └── divider/
│           ├── DividerComponent.tsx
│           └── DividerSettings.tsx
│
├── hooks/
│   ├── useEditorState.ts               # Hook para estado global do editor
│   ├── useEditorHistory.ts             # Hook para undo/redo
│   └── useEditorSave.ts               # Hook para auto-save no Supabase
│
├── types/
│   └── editor.types.ts                 # Tipos do editor (ProjetoEditor, ComponenteConfig, etc.)
│
└── utils/
    ├── resolver-map.ts                 # Mapa de resolvers para serializacao/desserializacao
    ├── serialization.ts                # Helpers de serializacao (compress, export HTML)
    └── default-templates.ts            # Templates padrao pre-definidos em JSON
```

---

## 4. Fases de Implementacao

### Fase 1 — Setup e Fundacao (Prioridade: CRITICA)

**Objetivo:** Configurar Craft.js, criar estrutura base e editor funcional minimo.

#### 1.1 Gestao de Dependencias
- [ ] Instalar `@craftjs/core`, `@craftjs/layers`, `react-contenteditable`
- [ ] Remover `@puckeditor/core`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- [ ] Atualizar `vite.config.ts` — ajustar chunk splitting (remover puck/dndkit, adicionar craftjs)
- [ ] Verificar compatibilidade com React 19 (Craft.js suporta `^19`)

#### 1.2 Tipos Base
Criar `src/features/editor/types/editor.types.ts`:
```typescript
export interface ProjetoEditor {
  id: string;
  nome: string;
  json_estado: string; // JSON serializado do Craft.js
  template_id?: string;
  usuario_id: string;
  created_at: string;
  updated_at: string;
}

export interface ComponenteConfig {
  displayName: string;
  icon: string; // nome do icone Lucide
  category: 'basico' | 'secao' | 'layout' | 'midia';
  description: string;
}

export type ResolverMap = Record<string, React.ComponentType<any>>;
```

#### 1.3 Componentes Base (Container + Text)
Implementar os dois componentes fundamentais seguindo o padrao Craft.js:

**ContainerComponent.tsx** — padrao:
```typescript
import { useNode } from '@craftjs/core';

export const ContainerComponent = ({ background, padding, children, ...props }) => {
  const { connectors: { connect, drag } } = useNode();
  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{ background, padding }}
      className="min-h-[60px]"
    >
      {children}
    </div>
  );
};

ContainerComponent.craft = {
  displayName: 'Container',
  props: { background: '#ffffff', padding: 16 },
  rules: { canDrag: () => true },
  related: { settings: ContainerSettings },
};
```

**TextComponent.tsx** — padrao:
```typescript
import { useNode, useEditor } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';

export const TextComponent = ({ text, fontSize, fontWeight, color }) => {
  const { connectors: { connect }, setProp } = useNode();
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

  return (
    <ContentEditable
      innerRef={connect}
      html={text}
      disabled={!enabled}
      onChange={(e) => setProp((p) => (p.text = e.target.value), 500)}
      style={{ fontSize, fontWeight, color }}
    />
  );
};

TextComponent.craft = {
  displayName: 'Texto',
  props: { text: 'Edite este texto', fontSize: '16px', fontWeight: '400', color: '#333' },
  related: { settings: TextSettings },
};
```

#### 1.4 Editor Page (MVP)
Criar `EditorPage.tsx` com a estrutura minima:
```typescript
import { Editor, Frame, Element } from '@craftjs/core';
import { resolverMap } from '../utils/resolver-map';

export const EditorPage = () => {
  return (
    <Editor resolver={resolverMap} onRender={RenderNode}>
      <EditorViewport>
        <Frame>
          <Element canvas is={ContainerComponent} background="#fff" padding={40}>
            <TextComponent text="Sua Landing Page" fontSize="32px" />
          </Element>
        </Frame>
      </EditorViewport>
    </Editor>
  );
};
```

#### 1.5 Roteamento
- [ ] Adicionar rota `/editor/novo` no `router.tsx`
- [ ] Adicionar rota `/editor/:projetoId` para edicao de projeto existente

**Entregavel Fase 1:** Editor abre com canvas basico, texto editavel inline, container arrastavel.

---

### Fase 2 — Viewport e Paineis (Prioridade: ALTA)

**Objetivo:** Criar a interface completa do editor com sidebar, toolbox e settings.

#### 2.1 EditorViewport
Layout responsivo com 3 areas:
- **Sidebar esquerda** — Toolbox (componentes arrastáveis) e Layers
- **Canvas central** — Area de edicao (Frame do Craft.js)
- **Panel direito** — Settings do componente selecionado

```
┌──────────────────────────────────────────────────────┐
│  EditorHeader (salvar, preview, undo/redo)            │
├──────────┬───────────────────────────┬───────────────┤
│          │                           │               │
│ Toolbox  │       Canvas (Frame)      │   Settings    │
│          │                           │   Panel       │
│ ──────── │                           │               │
│          │                           │               │
│ Layers   │                           │               │
│          │                           │               │
└──────────┴───────────────────────────┴───────────────┘
```

#### 2.2 ToolboxPanel
- Usar `useEditor().connectors.create()` para drag-to-create
- Listar componentes por categoria (`basico`, `secao`, `layout`, `midia`)
- Icones Lucide para cada componente
- Busca/filtro de componentes

#### 2.3 SettingsPanel
- Usar `useEditor()` para detectar componente selecionado
- Renderizar `React.createElement(selected.settings)` do componente related
- Botao de deletar componente (`actions.delete()`)
- Exibir nome e tipo do componente selecionado

#### 2.4 EditorHeader
- Toggle editor on/off (`actions.setOptions()`)
- Botao Undo (`actions.history.undo()`) / Redo (`actions.history.redo()`)
- Indicadores `query.history.canUndo()` / `canRedo()`
- Botao Salvar (serializar + enviar ao Supabase)
- Botao Preview (abrir em nova aba)

#### 2.5 RenderNode
- Wrapper `onRender` que adiciona indicadores visuais:
  - Borda ao hover
  - Toolbar flutuante ao selecionar (mover, deletar, duplicar)
  - Nome do componente no canto superior

**Entregavel Fase 2:** Interface completa do editor com toolbox funcional, settings panel e undo/redo.

---

### Fase 3 — User Components para Landing Page (Prioridade: ALTA)

**Objetivo:** Criar todos os componentes de landing page com settings completas.

#### 3.1 Componentes Basicos
| Componente | Props Principais | Settings |
|------------|------------------|----------|
| `HeadingComponent` | text, level (H1-H6), fontSize, color, textAlign | Nivel, tamanho, cor, alinhamento |
| `ButtonComponent` | text, url, variant, size, bgColor, textColor, borderRadius | Texto, link, estilo, cores |
| `ImageComponent` | src, alt, width, height, objectFit, borderRadius | Upload/URL, dimensoes, ajuste |
| `DividerComponent` | color, thickness, style, margin | Cor, espessura, estilo |

#### 3.2 Secoes Compostas (Canvas Aninhados)
Cada secao e um `Container` canvas que aceita componentes filhos:

| Secao | Composicao | Regras |
|-------|-----------|--------|
| `HeroSectionComponent` | Container canvas com Heading + Text + Button + Image | Aceita apenas basicos |
| `FeaturesSectionComponent` | Container canvas com grid de feature cards | Aceita containers e basicos |
| `TestimonialsSectionComponent` | Container canvas com cards de depoimentos | Aceita containers e basicos |
| `CtaSectionComponent` | Container canvas com Heading + Text + Button | Aceita apenas basicos |
| `FooterComponent` | Container com colunas de links | Aceita texto e links |

#### 3.3 Padrao de Cada User Component
Cada componente segue o padrao:
1. **Component** — renderiza o componente com `useNode()` connectors
2. **Settings** — painel de configuracoes com `useNode().setProp()`
3. **craft static** — props padrao, regras, displayName, related settings

```typescript
// Padrao para TODOS os componentes:
MinhaSecao.craft = {
  displayName: 'Nome Exibido',
  props: { /* valores padrao */ },
  rules: {
    canDrag: () => true,
    canMoveIn: (nodes) => /* regras de aceite */,
    canMoveOut: (nodes) => /* regras de saida */,
  },
  related: {
    settings: MinhaSecaoSettings,
  },
};
```

**Entregavel Fase 3:** Todos os componentes de landing page funcional, com settings e regras de drag-and-drop.

---

### Fase 4 — Serializacao e Persistencia (Prioridade: ALTA)

**Objetivo:** Salvar, carregar e exportar projetos.

#### 4.1 Serializacao
- `query.serialize()` retorna JSON string completo do editor
- Comprimir com `JSON.stringify` + opcional LZ-string para storage
- Armazenar na coluna `dados_pagina` (jsonb) da tabela `projetos` no Supabase

#### 4.2 Desserializacao (Carregar Projeto)
- Carregar JSON do Supabase via `projetoId`
- Passar para `<Frame json={jsonCarregado}>` para restaurar estado
- O `resolver` map deve conter **todos** os componentes para desserializar corretamente

#### 4.3 Resolver Map
Arquivo critico — mapeia nomes de componentes para classes React:
```typescript
// src/features/editor/utils/resolver-map.ts
export const resolverMap = {
  ContainerComponent,
  TextComponent,
  HeadingComponent,
  ButtonComponent,
  ImageComponent,
  HeroSectionComponent,
  FeaturesSectionComponent,
  TestimonialsSectionComponent,
  CtaSectionComponent,
  FooterComponent,
  DividerComponent,
};
```
> **IMPORTANTE:** Se um componente e renomeado ou removido, projetos salvos com ele nao desserializarao. Manter retrocompatibilidade.

#### 4.4 Auto-Save
- Usar `onNodesChange` callback do `<Editor>` para detectar mudancas
- Debounce de 3-5 segundos antes de salvar
- Indicador visual de "Salvando..." / "Salvo"
- Fallback: salvar em `localStorage` se offline

#### 4.5 API Supabase
```typescript
// src/features/editor/api/editor-api.ts
export async function salvarProjeto(projetoId: string, json: string): Promise<void>;
export async function carregarProjeto(projetoId: string): Promise<ProjetoEditor>;
export async function criarProjeto(nome: string, templateJson?: string): Promise<ProjetoEditor>;
export async function listarProjetos(usuarioId: string): Promise<ProjetoEditor[]>;
export async function deletarProjeto(projetoId: string): Promise<void>;
```

**Entregavel Fase 4:** Projetos salvam e carregam do Supabase, auto-save funcional.

---

### Fase 5 — Templates Pre-definidos (Prioridade: MEDIA)

**Objetivo:** Oferecer templates prontos que o usuario pode escolher e personalizar.

#### 5.1 Templates como JSON
Cada template e um JSON serializado do Craft.js, armazenado em:
- `src/features/editor/utils/default-templates.ts` (templates built-in)
- Tabela `templates` no Supabase (templates dinamicos via admin)

#### 5.2 Template Gallery
Implementar em `src/features/templates/`:
- Galeria com preview visual de cada template
- Categorias: Escritorio Contabil, Servicos, Portfolio, SaaS
- Botao "Usar Template" que cria projeto com JSON do template
- Preview em modal antes de confirmar

#### 5.3 Templates Iniciais
| Template | Descricao | Secoes |
|----------|-----------|--------|
| `contabil-classico` | Landing page para escritorio contabil | Hero + Servicos + Depoimentos + CTA + Footer |
| `servicos-moderno` | Pagina de servicos profissionais | Hero + Features + Pricing + CTA + Footer |
| `portfolio-minimalista` | Portfolio simples e elegante | Hero + Galeria + Sobre + Contato + Footer |
| `em-branco` | Canvas vazio para criacao livre | Container vazio |

**Entregavel Fase 5:** Galeria de templates funcional, usuario escolhe e personaliza.

---

### Fase 6 — Layers Panel e UX Avancada (Prioridade: MEDIA)

**Objetivo:** Painel de camadas e melhorias de experiencia.

#### 6.1 Layers Panel (`@craftjs/layers`)
- Integrar `<Layers />` do `@craftjs/layers`
- Exibir arvore hierarquica de componentes
- Drag-and-drop para reordenar na arvore
- Toggle visibilidade de camadas
- **Nota:** `@craftjs/layers` depende de `styled-components >= 6.1`. Avaliar se vale a dependencia ou implementar layers customizado com Tailwind.

#### 6.2 Melhorias de UX
- [ ] Indicador de drop zone (cor customizavel via `indicator` prop do Editor)
- [ ] Atalhos de teclado (Ctrl+Z undo, Ctrl+Y redo, Delete remover, Ctrl+D duplicar)
- [ ] Zoom no canvas (50%, 75%, 100%, 125%, 150%)
- [ ] Grid/guide lines no canvas
- [ ] Modo mobile preview (viewport responsivo)
- [ ] Copy/paste de componentes (`query.node(id)` + `actions.add()`)

**Entregavel Fase 6:** Painel de camadas, atalhos de teclado, preview responsivo.

---

### Fase 7 — Exportacao de Codigo (Prioridade: BAIXA)

**Objetivo:** Permitir ao usuario exportar a landing page como HTML/CSS puro.

#### 7.1 Exportacao HTML
- Percorrer arvore de nodes serializada
- Converter cada node para HTML semantico equivalente
- Gerar CSS inline ou stylesheet separado
- Incluir Tailwind CDN ou CSS puro

#### 7.2 Formatos de Exportacao
| Formato | Descricao |
|---------|-----------|
| HTML + CSS inline | Arquivo unico, pronto para deploy |
| HTML + CSS externo | Dois arquivos separados |
| React Components | Componentes React exportaveis |
| ZIP completo | HTML + CSS + assets |

#### 7.3 Preview
- Abrir preview em nova aba/iframe
- Renderizar o JSON do editor como pagina estatica (modo `enabled={false}`)

**Entregavel Fase 7:** Exportacao funcional em multiplos formatos.

---

## 5. Conceitos-Chave do Craft.js (Referencia Rapida)

### Hooks Principais
| Hook | Uso | Disponivel Em |
|------|-----|---------------|
| `useEditor()` | Estado global, actions, query, connectors | Qualquer componente dentro de `<Editor>` |
| `useNode()` | Estado do node, connectors, setProp | Apenas User Components |

### Connectors (como conectar DOM ao editor)
```typescript
// User Component — tornar draggavel e droppavel
const { connectors: { connect, drag } } = useNode();
<div ref={(ref) => connect(drag(ref))}>...</div>

// Toolbox — criar novos componentes via drag
const { connectors } = useEditor();
<button ref={(ref) => connectors.create(ref, <TextComponent />)}>Add Text</button>

// Selecionar componente ao clicar
<div ref={(ref) => connectors.select(ref, nodeId)}>...</div>
```

### Serializacao
```typescript
// Salvar
const json = query.serialize(); // JSON string

// Carregar
<Frame json={jsonSalvo}>...</Frame>
// ou
actions.deserialize(jsonSalvo);
```

### Historico (Undo/Redo)
```typescript
const { actions, query } = useEditor();
actions.history.undo();
actions.history.redo();
query.history.canUndo(); // boolean
query.history.canRedo(); // boolean
```

---

## 6. Riscos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Craft.js v0.2.x sem atualizacoes frequentes | Medio | Codigo fonte disponivel no ZIP para fork se necessario |
| `@craftjs/layers` depende de `styled-components` | Baixo | Implementar layers panel customizado com Tailwind se indesejavel |
| Retrocompatibilidade de resolver (renomear componentes quebra projetos salvos) | Alto | Manter nomes de componentes estaveis, versionar resolver map |
| Performance com muitos nodes | Medio | Usar `onNodesChange` com debounce, virtualizar layers panel |
| React 19 strict mode + Craft.js refs | Baixo | Craft.js core suporta React 19, testar connectors com strict mode |

---

## 7. Vite Config — Ajustes Necessarios

Atualizar `vite.config.ts` para chunk splitting otimizado:

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        motion: ['framer-motion'],
        supabase: ['@supabase/supabase-js'],
        craftjs: ['@craftjs/core', '@craftjs/layers'],  // NOVO
        // Remover: puck, dndkit
      },
    },
  },
},
```

---

## 8. Ordem de Execucao Recomendada

```
Fase 1 (Setup + Fundacao)
   ↓
Fase 2 (Viewport + Paineis)
   ↓
Fase 3 (User Components)     ← Pode ser paralelizada com Fase 2
   ↓
Fase 4 (Serializacao + Persistencia)
   ↓
Fase 5 (Templates)           ← Depende de Fase 4
   ↓
Fase 6 (Layers + UX)         ← Pode ser paralelizada com Fase 5
   ↓
Fase 7 (Exportacao)           ← Ultima prioridade
```

**Estimativa de complexidade:**
- Fases 1-2: Fundacao — base para tudo
- Fases 3-4: Core — funcionalidades essenciais
- Fases 5-7: Avancado — diferenciais de produto

---

## 9. Checklist de Validacao por Fase

### Fase 1 — Validacao
- [ ] `npm run build` compila sem erros
- [ ] Editor abre no navegador sem crashes
- [ ] Container renderiza com area visivel
- [ ] Texto editavel inline funciona
- [ ] Drag-and-drop basico funciona (mover texto dentro do container)

### Fase 2 — Validacao
- [ ] Toolbox exibe componentes com icones
- [ ] Arrastar componente do toolbox para o canvas funciona
- [ ] Clicar em componente exibe settings panel
- [ ] Undo/Redo funciona via botoes
- [ ] Toggle editor on/off desabilita edicao

### Fase 3 — Validacao
- [ ] Todos os componentes de landing page renderizam corretamente
- [ ] Settings de cada componente atualizam props em tempo real
- [ ] Regras de `canMoveIn` impedem componentes invalidos em secoes
- [ ] Secoes compostas aceitam drag-and-drop interno

### Fase 4 — Validacao
- [ ] Serializar editor para JSON funciona (`query.serialize()`)
- [ ] Desserializar JSON restaura estado completo (`<Frame json=...>`)
- [ ] Salvar projeto no Supabase persiste corretamente
- [ ] Carregar projeto do Supabase restaura editor
- [ ] Auto-save com debounce funciona sem perda de dados

### Fase 5 — Validacao
- [ ] Galeria de templates exibe previews
- [ ] Selecionar template cria projeto com JSON correto
- [ ] Template carregado e totalmente editavel
- [ ] Templates do admin sao exibidos na galeria

### Fase 6 — Validacao
- [ ] Painel de layers exibe arvore hierarquica
- [ ] Reordenar no layers reflete no canvas
- [ ] Atalhos de teclado funcionam
- [ ] Preview responsivo mostra viewport mobile

### Fase 7 — Validacao
- [ ] Exportar HTML gera arquivo valido
- [ ] HTML exportado renderiza identico ao editor
- [ ] CSS exportado cobre todos os estilos
- [ ] Preview em nova aba funciona

---

## 10. Referencia — Arquivos-Chave do Craft.js (ZIP)

Para consulta durante implementacao, os arquivos mais relevantes do ZIP (`C:\Users\user\Downloads\craft.js-main.zip`):

| Caminho no ZIP | Relevancia |
|----------------|-----------|
| `examples/landing/pages/index.tsx` | Exemplo completo de editor para landing page |
| `examples/landing/components/editor/RenderNode.tsx` | Implementacao de RenderNode com toolbar flutuante |
| `examples/landing/components/editor/Viewport/` | Layout do editor (Header, Sidebar, Toolbox) |
| `examples/landing/components/selectors/Container/` | Container com Resizer e Settings |
| `examples/landing/components/selectors/Text/` | Texto editavel com ContentEditable |
| `examples/landing/components/selectors/Button/` | Botao com variantes |
| `examples/landing/components/editor/Toolbar/` | Componentes de toolbar genericos |
| `packages/core/src/` | Codigo fonte do core (Editor, Frame, hooks) |
| `packages/layers/src/` | Codigo fonte do painel de layers |

---

*— Orion, orquestrando o sistema 🎯*
