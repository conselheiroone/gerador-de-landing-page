# Epic: Configuracao OpenRouter — Admin

**Epic ID:** EPIC-OR
**Data:** 2026-03-06 (v3)
**Status:** Draft

---

## Resumo

Tela administrativa para controle centralizado da integracao com OpenRouter.
O admin configura modelos de IA e prompts-base para geracao de imagens.
Tarefas 4 (geracao automatica junto com config empresa) e 5 (regeneracao) ficam pendentes para fase futura.

---

## Modelos Definidos

3 modelos fixos como constante no backend:

| ID OpenRouter | Alias | Custo | Melhor para |
|---------------|-------|-------|-------------|
| `google/gemini-flash-3.1-image-preview` | Gemini Flash | $0.30/M tokens | Custo-beneficio, instrucoes ricas |
| `black-forest-labs/flux-2-klein-4b` | FLUX.2 Klein | $0.014/megapixel | Alto volume, velocidade |
| `openai/gpt-5-image-mini` | GPT-5 Image Mini | - | Seguimento de instrucoes complexas |

Esses 3 modelos sao uma **constante no backend** (Edge Function). O admin escolhe entre eles — nao e texto livre.

**IMPORTANTE:** Cada modelo tem APIs diferentes no OpenRouter:
- **Gemini Flash**: usa `/api/v1/chat/completions` (multimodal — envia prompt como mensagem, recebe imagem inline)
- **FLUX.2 Klein**: usa `/api/v1/images/generations` (endpoint de imagem padrao, similar ao DALL-E)
- **GPT-5 Image Mini**: usa `/api/v1/chat/completions` (multimodal — similar ao Gemini)

A Edge Function precisara de logica condicional por tipo de modelo.

---

## Tarefas a Implementar

### Checklist Original (status)

| # | Tarefa | Status |
|---|--------|--------|
| 1 | Configuracao da .env no Supabase | ✅ |
| 2 | Implementacao de chamadas via Edge Functions | ✅ |
| 3 | Definir quais serao os modelos | ✅ (definido acima) |
| 4 | Geracao de imagem junto com config empresa | ⏸️ Pendente (fase futura) |
| 5 | Regeneracao de imagens geradas | ⏸️ Pendente (fase futura) |
| 6 | Modelo default do sistema (admin) | ☐ **OR-001** |
| 7 | Modelo por geracao especifica (admin) | ~~OR-002~~ **Removido** (absorvido pelo OR-001) |
| 8 | Modelo especifico por usuario (admin) | ☐ **OR-002** |
| 9 | Administrar prompts de imagem (admin) | ☐ **OR-003** |

> **Nota sobre tarefa 7:** Como temos apenas 3 modelos de imagem e o admin escolhe UM global, a granularidade "por tipo de geracao" nao faz sentido no MVP. Se no futuro houver modelos de texto (agentes), pode ser reintroduzida. A tarefa 7 foi absorvida na escolha do modelo global (OR-001).

---

## Story OR-001: Modelo Default Global + Constante de Modelos

**Prioridade:** P1 (fundacao)

**Como** administrador,
**Quero** escolher qual dos 3 modelos de imagem sera o default global da aplicacao,
**Para** controlar custo, qualidade e trocar de modelo sem deploy.

### Criterios de Aceite

- [ ] CA1: Constante `AVAILABLE_MODELS` na Edge Function com os 3 modelos (id, alias, tipo de API)
- [ ] CA2: Pagina admin `/admin/ia` com secao "Modelo Global"
- [ ] CA3: Admin seleciona 1 dos 3 modelos como default (radio/select, nao texto livre)
- [ ] CA4: Salvamento em `admin_settings` key `openrouter_default_image_model`
- [ ] CA5: Edge Function le modelo do banco e usa (fallback: `google/gemini-flash-3.1-image-preview`)
- [ ] CA6: Edge Function suporta os 3 tipos de chamada (chat/completions vs images/generations)
- [ ] CA7: Feedback visual de sucesso/erro ao salvar

### Regras de Negocio

- RN1: Apenas `role = 'admin'`
- RN2: Mudanca imediata (sem restart)
- RN3: Apenas modelos da constante (whitelist)

### Escopo Tecnico

**Constante na Edge Function:**
```typescript
const AVAILABLE_MODELS = [
  {
    id: 'google/gemini-flash-3.1-image-preview',
    alias: 'Gemini Flash',
    apiType: 'chat',  // usa /chat/completions
  },
  {
    id: 'black-forest-labs/flux-2-klein-4b',
    alias: 'FLUX.2 Klein',
    apiType: 'image',  // usa /images/generations
  },
  {
    id: 'openai/gpt-5-image-mini',
    alias: 'GPT-5 Image Mini',
    apiType: 'chat',  // usa /chat/completions
  },
] as const
```

**Edge Function — logica condicional:**
```
if (model.apiType === 'image') {
  // POST /api/v1/images/generations { model, prompt, n, size }
} else if (model.apiType === 'chat') {
  // POST /api/v1/chat/completions { model, messages: [{ role: 'user', content: prompt }] }
  // Extrair imagem da resposta (base64 ou URL)
}
```

**Edge Function — resolver modelo:**
```
1. Criar supabaseClient com SUPABASE_SERVICE_ROLE_KEY
2. SELECT value FROM admin_settings WHERE key = 'openrouter_default_image_model'
3. Validar que esta na AVAILABLE_MODELS
4. Fallback: primeiro modelo da lista
```

**Frontend:**
- `src/features/admin/constants/openrouter-models.ts` — espelho da constante (id + alias para UI)
- `src/app/routes/admin/AdminIAPage.tsx` — pagina admin
- `src/features/admin/components/ia/ModelDefaultForm.tsx` — radio group dos 3 modelos
- Reutilizar `useAdminSettings`
- Adicionar item "Configuracoes de IA" na sidebar admin

**Migration:** Nenhuma. Usa `admin_settings` existente.

---

## Story OR-002: Modelo Especifico por Usuario

**Prioridade:** P2 (depende de OR-001)

**Como** administrador,
**Quero** atribuir um dos 3 modelos a um usuario especifico sem que ele saiba,
**Para** testes A/B, planos diferenciados ou controle de custos.

### Criterios de Aceite

- [ ] CA1: Na pagina admin de usuarios, acao "Configurar modelo de IA" por usuario
- [ ] CA2: Admin escolhe 1 dos 3 modelos (mesmo radio group) ou "Usar default global"
- [ ] CA3: Configuracao **invisivel** ao usuario
- [ ] CA4: Edge Function resolve: user override > default global > fallback
- [ ] CA5: Admin pode remover override (volta ao default)
- [ ] CA6: Lista de overrides ativos visivel na pagina `/admin/ia`

### Regras de Negocio

- RN1: Usuario NUNCA ve qual modelo e usado
- RN2: Edge Function identifica user via JWT
- RN3: Override por usuario = maior prioridade
- RN4: Somente modelos da constante

### Escopo Tecnico

**Migration:**
```sql
CREATE TABLE public.openrouter_user_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  image_model TEXT NOT NULL,
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- RLS: SOMENTE admin
ALTER TABLE public.openrouter_user_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_full ON public.openrouter_user_overrides
  FOR ALL USING (public.is_admin());
-- Nenhuma policy para usuario comum (invisivel)
```

**Edge Function — cadeia de resolucao:**
```
1. Extrair user_id do JWT (Authorization header)
2. SELECT image_model FROM openrouter_user_overrides
   WHERE user_id = $1 AND is_active = true
3. Se encontrou -> usa este modelo
4. Se nao -> usa default global (OR-001)
5. Validar que esta na AVAILABLE_MODELS
```

**Frontend:**
- `src/features/admin/components/ia/UserModelOverrideModal.tsx`
- `src/features/admin/components/ia/UserOverridesList.tsx`
- `src/features/admin/hooks/use-user-model-overrides.ts`

---

## Story OR-003: Administracao de Prompts por Modelo

**Prioridade:** P1 (paralelo com OR-001)

**Como** administrador,
**Quero** configurar o prompt-base (system prompt) para cada um dos 3 modelos em uma unica tela com editor Markdown,
**Para** controlar a qualidade e estilo das imagens geradas, adaptando o prompt as capacidades de cada modelo.

### Contexto

Cada modelo responde diferente ao mesmo prompt. O admin precisa configurar prompts otimizados para cada modelo. A tela mostra os **3 editores lado a lado** (ou em tabs), cada um com o prompt Markdown do respectivo modelo.

Quando a aplicacao gerar uma imagem (fase futura), ela:
1. Identifica qual modelo esta ativo (via OR-001/OR-002)
2. Busca o prompt-base daquele modelo
3. Interpola variaveis do PerfilEmpresa
4. Envia ao OpenRouter

### Criterios de Aceite

- [ ] CA1: Secao "Prompts de Imagem" na pagina `/admin/ia`
- [ ] CA2: **3 editores Markdown** visiveis na mesma tela (um por modelo)
- [ ] CA3: Cada editor mostra: nome do modelo + badge (ativo/inativo) + editor de texto
- [ ] CA4: O editor suporta Markdown com preview lado-a-lado (ou toggle)
- [ ] CA5: Variaveis interpolaveis documentadas acima do editor: `{{nome_empresa}}`, `{{slogan}}`, `{{segmento}}`, `{{servicos}}`, `{{diferenciais}}`, `{{cor_primaria}}`, `{{cor_secundaria}}`, `{{cidade}}`, `{{estado}}`
- [ ] CA6: Botao "Salvar" individual por editor (salva apenas o prompt daquele modelo)
- [ ] CA7: Indicacao visual de qual modelo esta ativo globalmente (destaque/badge)
- [ ] CA8: Preview do prompt renderizado com dados de exemplo
- [ ] CA9: Admin pode definir um **system prompt global** (prefixo aplicado a TODOS os modelos)

### Regras de Negocio

- RN1: Os 3 prompts sao independentes — cada modelo tem seu proprio prompt otimizado
- RN2: O system prompt global e concatenado ANTES do prompt do modelo: `[global] + [modelo-especifico]`
- RN3: Variaveis nao preenchidas sao removidas silenciosamente
- RN4: Prompt final (apos interpolacao) truncado em 4000 chars (aumentar do limite atual de 1000)
- RN5: Usuario NUNCA ve o prompt — montagem e 100% server-side
- RN6: Deve existir seed com prompts default para os 3 modelos

### Exemplo — Prompt para Gemini Flash

```markdown
## Instrucoes de Geracao

Crie uma imagem profissional para o site da empresa **{{nome_empresa}}**.

### Contexto
- Segmento: {{segmento}}
- Servicos: {{servicos}}
- Diferenciais: {{diferenciais}}
- Localizacao: {{cidade}}/{{estado}}

### Estilo Visual
- Cores predominantes: {{cor_primaria}} e {{cor_secundaria}}
- Estilo: fotografia corporativa moderna, clean, alta resolucao
- Sem texto na imagem
- Aspecto profissional e confiavel
```

### Exemplo — Prompt para FLUX.2 Klein (mais direto)

```markdown
Professional corporate photography for {{nome_empresa}}, a {{segmento}} company.
Clean modern style, colors {{cor_primaria}} and {{cor_secundaria}}.
High quality, no text overlay, business-oriented.
Located in {{cidade}}, {{estado}}, Brazil.
```

### Exemplo — Prompt para GPT-5 Image Mini (instrucoes detalhadas)

```markdown
Generate a high-quality professional image for the website of {{nome_empresa}}.

**Company Profile:**
- Industry: {{segmento}}
- Services: {{servicos}}
- Differentials: {{diferenciais}}
- Tagline: "{{slogan}}"

**Visual Requirements:**
- Primary color: {{cor_primaria}}
- Secondary color: {{cor_secundaria}}
- Style: Modern corporate photography
- No text in the image
- Clean, trustworthy, professional aesthetic
- Suitable for a hero banner (16:9 aspect ratio)
```

### Escopo Tecnico

**Migration:**
```sql
-- Prompts por modelo (1 registro por modelo)
CREATE TABLE public.ai_model_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id TEXT UNIQUE NOT NULL,          -- ex: 'google/gemini-flash-3.1-image-preview'
  prompt_template TEXT NOT NULL DEFAULT '',  -- Markdown com variaveis {{}}
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.ai_model_prompts ENABLE ROW LEVEL SECURITY;
-- Admin CRUD
CREATE POLICY admin_full ON public.ai_model_prompts
  FOR ALL USING (public.is_admin());
-- Usuario NAO le (prompt e server-side)

-- Seed: um registro por modelo com prompt default
INSERT INTO public.ai_model_prompts (model_id, prompt_template) VALUES
  ('google/gemini-flash-3.1-image-preview', '...prompt gemini...'),
  ('black-forest-labs/flux-2-klein-4b', '...prompt flux...'),
  ('openai/gpt-5-image-mini', '...prompt gpt5...');

-- System prompt global via admin_settings
-- key: 'ai_image_system_prompt'
```

**Frontend:**
- `src/features/admin/components/ia/PromptEditorPanel.tsx` — editor Markdown com preview para 1 modelo
- `src/features/admin/components/ia/ModelPromptsSection.tsx` — layout com 3 editores (grid ou tabs)
- `src/features/admin/components/ia/SystemPromptEditor.tsx` — editor do prompt global
- `src/features/admin/components/ia/VariablesReference.tsx` — referencia de variaveis disponiveis
- `src/features/admin/hooks/use-model-prompts.ts` — CRUD para `ai_model_prompts`
- Lib de editor Markdown: sugestao `@uiw/react-md-editor` (leve, com preview)

**Utilitarios:**
- `src/features/admin/utils/prompt-interpolation.ts` — substitui `{{var}}` por valores

**Edge Function (preparacao para fase futura):**
- Aceitar `template_id` e `variables` opcionais no body
- Se fornecidos: buscar prompt do modelo ativo, interpolar, concatenar system prompt
- Se nao: manter comportamento atual (prompt raw) — retrocompatibilidade

---

## Layout da Pagina Admin `/admin/ia`

```
┌─────────────────────────────────────────────────────────────┐
│  Configuracoes de IA                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SECAO 1: Modelo Global                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ (●) Gemini Flash — Melhor custo-beneficio    [ATIVO] │   │
│  │ ( ) FLUX.2 Klein — Ultra economico                   │   │
│  │ ( ) GPT-5 Image Mini — Melhor instrucoes             │   │
│  │                                    [Salvar Modelo]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  SECAO 2: System Prompt Global                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Editor Markdown (prefixo aplicado a todos os modelos)│   │
│  │                                    [Salvar Prompt]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  SECAO 3: Prompts por Modelo                                │
│  ┌─────────────┬──────────────┬──────────────┐             │
│  │ Gemini Flash│ FLUX.2 Klein │ GPT-5 Mini   │             │
│  │  [ATIVO]    │              │              │             │
│  ├─────────────┴──────────────┴──────────────┤             │
│  │ Variaveis: {{nome_empresa}} {{segmento}}  │             │
│  │ {{servicos}} {{cor_primaria}} ...          │             │
│  ├───────────────────────────────────────────┤             │
│  │                                           │             │
│  │  Editor Markdown com Preview              │             │
│  │  (conteudo muda conforme tab selecionada) │             │
│  │                                           │             │
│  │                              [Salvar]     │             │
│  └───────────────────────────────────────────┘             │
│                                                             │
│  SECAO 4: Overrides por Usuario                             │
│  ┌───────────────────────────────────────────┐             │
│  │ Usuario        │ Modelo         │ Motivo  │             │
│  │ joao@email.com │ FLUX.2 Klein   │ Teste   │ [Remover]  │
│  │ maria@...      │ GPT-5 Mini     │ Premium │ [Remover]  │
│  │                       [+ Adicionar Override] │           │
│  └───────────────────────────────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Cadeia de Resolucao de Modelo

```
Request chega na Edge Function
  │
  ├─ 1. Tem override para este user_id? (openrouter_user_overrides)
  │     SIM → usa modelo do override
  │     NAO ↓
  │
  ├─ 2. Tem default global? (admin_settings.openrouter_default_image_model)
  │     SIM → usa modelo global
  │     NAO ↓
  │
  └─ 3. Fallback: google/gemini-flash-3.1-image-preview
```

---

## Cadeia de Montagem do Prompt (fase futura — tarefas 4 e 5)

```
1. Resolver modelo (cadeia acima)
2. Buscar system prompt global (admin_settings.ai_image_system_prompt)
3. Buscar prompt-template do modelo (ai_model_prompts WHERE model_id)
4. Interpolar variaveis do PerfilEmpresa no template
5. Concatenar: [system_prompt] + [template interpolado]
6. Truncar em 4000 chars
7. Enviar ao OpenRouter com o modelo resolvido
```

---

## Ordem de Implementacao

```
Fase 1 (paralelo):
  OR-001: Constante de modelos + modelo default global + pagina admin  [P1]
  OR-003: Editores de prompt por modelo + system prompt global         [P1]

Fase 2 (depende de OR-001):
  OR-002: Override de modelo por usuario                               [P2]

Pendente (fase futura):
  Tarefa 4: Geracao automatica junto com config empresa
  Tarefa 5: Regeneracao de imagens
```

---

## Seguranca

| Tabela | Admin | Usuario | Anonimo |
|--------|-------|---------|---------|
| `admin_settings` (existente) | CRUD | SELECT | Nenhum |
| `openrouter_user_overrides` (nova) | CRUD | **Nenhum** | Nenhum |
| `ai_model_prompts` (nova) | CRUD | **Nenhum** | Nenhum |

- `openrouter_user_overrides`: usuario NAO pode saber seu modelo
- `ai_model_prompts`: prompts sao server-side, usuario nunca ve
- Edge Function usa `SUPABASE_SERVICE_ROLE_KEY` para queries restritas
- Apenas modelos da constante `AVAILABLE_MODELS` sao aceitos (whitelist)

---

## Dependencias entre Stories

```
OR-001 (Modelo Global + Constante) ← OR-002 (Override por Usuario) depende
OR-003 (Prompts por Modelo) ——————— independente (paralelo com OR-001)

Fase futura (tarefas 4 e 5) ←——— depende de OR-001 + OR-003
```
