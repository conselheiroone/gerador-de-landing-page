# PRD: Layout Variado para Landing Pages

> **Status:** Proposta | **Data:** 2026-03-11
> **Problema:** Todas as landing pages geradas possuem estrutura identica, resultando em paginas visualmente repetitivas entre diferentes escritorios.

---

## 1. Contexto do Problema

Atualmente, `generateProfileTemplate()` produz **uma unica estrutura fixa**:

```
Navbar → Hero → Stats → Servicos → Segmentos → Sobre → Diferenciais → Equipe → Depoimentos → CTA → Footer
```

**O que muda entre paginas:** cores, textos, logos, quantidade de servicos/socios.
**O que NAO muda:** ordem das secoes, layout dos cards, tipografia, espacamento, estilo visual.

**Resultado:** Dois escritorios com cores diferentes ainda produzem paginas reconhecivelmente identicas em estrutura.

---

## 2. Proposta de Solucao: Sistema de Variacao em 3 Camadas

### Camada 1 — Layout Blueprints (Estrutura da Pagina)

Criar **5-8 blueprints** pre-definidos que variam a **ordem, agrupamento e estilo macro** das secoes.

| Blueprint | Descricao | Ordem Resumida |
|-----------|-----------|----------------|
| `classico` | Estrutura atual (default) | Hero → Stats → Servicos → Sobre → Depoimentos → CTA |
| `story-first` | Narrativa primeiro | Hero → Sobre (historia expandida) → Servicos → Equipe → Depoimentos → CTA |
| `social-proof` | Prova social no topo | Hero → Depoimentos → Stats → Servicos → Sobre → CTA |
| `services-hero` | Servicos como protagonista | Hero (minimalista) → Servicos (destaque full-width) → Stats → Sobre → CTA |
| `modern-minimal` | Menos secoes, mais impacto | Hero (grande) → Servicos → CTA (sem stats, sem sobre separado) |
| `full-showcase` | Tudo visivel, intercalado | Hero → Stats → Servicos → Depoimentos → Sobre → Diferenciais → Equipe → CTA |
| `cta-driven` | Multiplos CTAs entre secoes | Hero+CTA → Servicos → CTA2 → Depoimentos → CTA3 |
| `bento-grid` | Layout moderno bento | Hero → BentoFeatures (servicos) → Stats inline → Sobre compacto → CTA |

**Cada blueprint define:**
- Ordem das secoes
- Quais secoes sao obrigatorias vs opcionais
- Variante de hero (split, centered, full-image, minimal)
- Variante de servicos (cards, bento, lista, accordion)
- Variante de depoimentos (grid, carousel, quote-highlight)

### Camada 2 — Variantes de Componente (Estilo Visual)

Dentro de cada secao, oferecer **2-4 variantes visuais** para os componentes-chave:

#### Hero
| Variante | Descricao |
|----------|-----------|
| `split` | Texto esquerda + imagem/logo direita (atual) |
| `centered` | Texto centralizado + background (atual) |
| `full-image` | Imagem full-bleed com overlay forte + texto sobreposto |
| `minimal` | Apenas titulo + subtitulo + CTA, sem decoracao |
| `video-bg` | Background com video (futuro) |

#### Servicos
| Variante | Descricao |
|----------|-----------|
| `cards-grid` | Cards em grid 2-3 colunas (atual) |
| `bento` | BentoFeaturesComponent com items mistos |
| `icon-list` | Lista vertical com icones grandes a esquerda |
| `accordion` | AccordionComponent expansivel |
| `tabs` | TabsComponent por categoria |

#### Depoimentos
| Variante | Descricao |
|----------|-----------|
| `grid` | TestimonialsGridComponent (atual) |
| `carousel` | ImageCarouselComponent adaptado |
| `quote-highlight` | QuoteHighlightComponent (1 depoimento destaque + menores) |
| `cards-alternating` | Cards alternando esquerda/direita |

#### Sobre/Historia
| Variante | Descricao |
|----------|-----------|
| `mvv-cards` | Cards Missao/Visao/Valores (atual) |
| `timeline` | Linha do tempo da empresa |
| `split-image` | Texto + imagem lado a lado |
| `compact` | Paragrafo unico sem MVV |

### Camada 3 — Micro-Variacoes (Detalhes Visuais)

Randomizar detalhes que nao afetam a estrutura:

- **Tipografia**: 3-4 combinacoes de font-family (Inter, Poppins, Montserrat, DM Sans)
- **Border radius**: `sharp` (4px), `rounded` (12px), `pill` (24px)
- **Shadow style**: `flat` (sem sombra), `soft`, `elevated`, `dramatic`
- **Section backgrounds**: alternar entre `branco`, `tintPri`, `tintSec`, `gradient`
- **Espacamento vertical**: `compact` (60px), `normal` (80px), `spacious` (100px)
- **Accent position**: `borderTop`, `borderLeft`, `none`, `badge`
- **Icones de servico**: variar shape do background (circle, rounded-square, none)

---

## 3. Fluxo do Usuario

### Opcao A — Randomizacao Automatica (MVP)

```
[Criar Landing Page]
    → Sistema seleciona blueprint aleatorio
    → Sistema seleciona variantes aleatorias de componente
    → Sistema aplica micro-variacoes aleatorias
    → Usuario ve preview
    → [Gerar Outra Versao] → re-randomiza tudo
    → [Editar no Editor] → abre Craft.js para ajustes manuais
```

**Vantagem:** Simples de implementar, resolve o problema imediatamente.
**UX:** Botao "Gerar outra versao" para re-randomizar ate gostar.

### Opcao B — Escolha de Estilo (Recomendado)

```
[Criar Landing Page]
    → Tela de selecao com 4-6 previews em miniatura
    → Cada preview mostra blueprint diferente com variantes visuais
    → Usuario clica no preferido
    → [Personalizar] (opcional) → ajusta variantes especificas
    → [Editar no Editor] → abre Craft.js
```

**Vantagem:** Usuario tem controle, cada preview ja usa dados reais do perfil.
**UX:** Similar a galeria de templates, mas todos sao gerados dinamicamente.

### Opcao C — Hibrido (Ideal)

Combina A + B:
1. Sistema gera **4 variacoes** automaticamente usando blueprints diferentes
2. Usuario escolhe a que mais gosta
3. Botao "Mais opcoes" gera mais 4 variacoes
4. Apos escolher, pode editar no Craft.js

---

## 3.1. Regra Critica: Integridade Total dos Dados do Perfil

> **PRINCIPIO FUNDAMENTAL:** A variacao de layout NUNCA pode resultar em perda de dados do perfil.
> Muda-se a ESTRUTURA e o ESTILO — jamais o CONTEUDO.

Todas as variantes de blueprint e componente DEVEM consumir o objeto `PerfilEmpresa` completo, garantindo que **todos** os dados a seguir estejam presentes em qualquer layout gerado:

| Dado | Onde aparece hoje | Regra |
|------|-------------------|-------|
| `logo_url` | Navbar + Footer | OBRIGATORIO em todos os blueprints |
| `nome_empresa` | Navbar, Hero h1, Footer, CTA | OBRIGATORIO |
| `slogan` | Hero subtitle | OBRIGATORIO |
| `cor_primaria` / `cor_secundaria` | Palette inteira | OBRIGATORIO — gera todas as variacoes de cor |
| `telefone` / `whatsapp` / `email_contato` | Hero, CTA, Footer | OBRIGATORIO em pelo menos 2 locais |
| `redes_sociais` (Instagram, Facebook, LinkedIn) | Footer | OBRIGATORIO — Footer sempre exibe redes sociais |
| `servicos[]` | Secao Servicos | OBRIGATORIO — todos os servicos listados, sem cortar |
| `segmentos[]` | Secao Segmentos | Condicional (se `length > 0`) — mas se existir, exibe TODOS |
| `historia` / `missao` / `visao` / `valores` | Secao Sobre/MVV | Condicional — se preenchido, nunca omitir |
| `diferenciais[]` | Secao Diferenciais | Condicional (se `length > 0`) — exibe TODOS |
| `socios[]` (foto, nome, cargo, CRC, especialidades, mini_bio) | Secao Equipe | Condicional (se `exibir_landing_page: true`) — exibe TODOS os campos |
| `depoimentos[]` | Secao Depoimentos | OBRIGATORIO (usa placeholders se vazio) |
| `usar_imagem_hero` / `hero_image_url` | Hero background | OBRIGATORIO — respeitar escolha do usuario |
| `cidade` / `estado` / endereco completo | Hero badge, Footer | OBRIGATORIO |
| `google_place_id` | Reviews importadas | Condicional — se existir, reviews reais exibidas |
| `anno_fundacao` | Stats, floating cards, badge "Desde..." | OBRIGATORIO quando existir |

**Imagens padrao** (hero-bg, about-office, hero-professional, cta-bg) devem ser utilizadas conforme o blueprint escolhido. Nenhuma variante pode gerar uma secao sem a imagem que o layout atual utiliza — pode apenas **reposicionar** ou **estilizar diferente** a mesma imagem.

**Validacao obrigatoria:** Cada builder de variante recebe os mesmos parametros (`perfil`, `socios`, `depoimentos`, `palette`) que os builders atuais. Um teste automatizado deve verificar que o JSON gerado por qualquer blueprint contem pelo menos as mesmas chaves de dados que o blueprint `classico`.

---

## 4. Arquitetura Tecnica

### 4.1 Novos Arquivos

```
src/features/editor/utils/
  layout-blueprints.ts          # Definicao dos blueprints
  layout-variations.ts          # Motor de variacao (randomizacao + selecao)
  component-variants/
    hero-variants.ts            # Builders alternativos para hero
    services-variants.ts        # Builders alternativos para servicos
    testimonials-variants.ts    # Builders alternativos para depoimentos
    about-variants.ts           # Builders alternativos para sobre/historia
    cta-variants.ts             # Builders alternativos para CTA
  micro-variations.ts           # Tipografia, spacing, shadows, etc.
```

### 4.2 Interface do Blueprint

```typescript
interface LayoutBlueprint {
  id: string;
  name: string;
  description: string;
  sections: BlueprintSection[];
  defaults: {
    fontFamily: string;
    borderRadius: 'sharp' | 'rounded' | 'pill';
    shadowStyle: 'flat' | 'soft' | 'elevated';
    spacingScale: 'compact' | 'normal' | 'spacious';
  };
}

interface BlueprintSection {
  type: SectionType;
  required: boolean;
  variant: string;         // ex: 'split', 'centered', 'bento'
  backgroundStyle: string; // ex: 'white', 'tintPri', 'tintSec'
}

type SectionType =
  | 'navbar' | 'hero' | 'stats' | 'services'
  | 'segments' | 'about' | 'differentials'
  | 'team' | 'testimonials' | 'cta' | 'footer';
```

### 4.3 Motor de Variacao

> **Regra:** O motor recebe TODOS os dados do perfil e GARANTE que nenhum dado e descartado.
> A variacao e EXCLUSIVAMENTE estrutural/visual — nunca de conteudo.

```typescript
// Gera uma pagina com variacao completa
// IMPORTANTE: perfil completo (redes sociais, logo, fotos, endereco, etc.)
// e repassado integralmente para cada builder de secao
function generateVariedTemplate(
  perfil: PerfilEmpresa,         // COMPLETO — inclui redes_sociais, logo, hero_image, etc.
  socios: Socio[],               // TODOS os socios visiveis
  depoimentos: Depoimento[],    // TODOS os depoimentos
  options?: {
    blueprintId?: string;      // Fixar blueprint especifico
    seed?: number;             // Para reprodutibilidade
    preferences?: Partial<VariationPreferences>;
  }
): TemplateNode;

// Gera N variacoes para selecao
function generateTemplateVariations(
  perfil: PerfilEmpresa,
  socios: Socio[],
  depoimentos: Depoimento[],
  count: number               // ex: 4
): { blueprint: LayoutBlueprint; template: TemplateNode }[];
```

### 4.4 Refatoracao de `profile-template.ts`

O arquivo atual (`2600+ linhas`) sera refatorado:

1. **Extrair builders** para arquivos separados por secao (ja existem como funcoes internas)
2. **Criar variantes** de cada builder (ex: `buildHeroSplit`, `buildHeroCentered`, `buildHeroFullImage`)
3. **Parametrizar** `generateProfileTemplate` para aceitar `LayoutBlueprint` como guia
4. **Manter retrocompatibilidade**: sem blueprint = comportamento atual (`classico`)

---

## 5. Banco de Dados

### Novas colunas (opcional, para persistir preferencia)

```sql
ALTER TABLE perfil_empresa
  ADD COLUMN layout_blueprint_id TEXT DEFAULT NULL,
  ADD COLUMN layout_preferences JSONB DEFAULT NULL;
```

**Nota:** Pode ser adiado para fase 2. Na fase 1, a variacao e efemera (gerada na hora).

---

## 6. Fases de Implementacao

### Fase 1 — MVP: Blueprints + Randomizacao (Sprint 1-2)

**Objetivo:** Landing pages visivelmente diferentes entre si.

1. Definir 4 blueprints iniciais (`classico`, `story-first`, `social-proof`, `services-hero`)
2. Refatorar `profile-template.ts` — extrair builders de secao
3. Implementar `generateVariedTemplate()` com selecao de blueprint
4. Adicionar 2 variantes de Hero (`full-image`, `minimal`)
5. Adicionar 2 variantes de Servicos (`bento`, `icon-list`)
6. Botao "Gerar outra versao" na tela de criacao
7. Testes unitarios para cada blueprint
8. **Teste de integridade de dados:** validar que TODOS os blueprints geram JSON contendo:
   - Logo no navbar e footer
   - Redes sociais no footer
   - Todos os servicos do perfil
   - Todos os socios visiveis com foto, CRC, especialidades
   - Telefone/WhatsApp/email em pelo menos 2 secoes
   - Hero image quando `usar_imagem_hero = true`
   - Imagens padrao (about-office, cta-bg, hero-professional) nos locais apropriados

**Entrega:** Usuario gera paginas com estrutura diferente a cada clique, sem perder NENHUM dado do perfil.

### Fase 2 — Selecao Visual (Sprint 3)

**Objetivo:** Usuario escolhe entre variacoes previamente geradas.

1. Tela de selecao com previews em miniatura (4 opcoes)
2. `generateTemplateVariations()` gera N opcoes
3. Preview renderizado em iframe ou canvas reduzido
4. Botao "Mais opcoes" para re-gerar

**Entrega:** Experiencia de "escolher seu estilo" antes de editar.

### Fase 3 — Micro-Variacoes + Persistencia (Sprint 4)

**Objetivo:** Personalizacao fina e memoria de preferencias.

1. Implementar micro-variacoes (tipografia, spacing, shadows)
2. Salvar `layout_blueprint_id` e `layout_preferences` no perfil
3. Adicionar mais variantes de componente (depoimentos carousel, sobre timeline)
4. Adicionar mais blueprints (total: 6-8)

**Entrega:** Cada pagina gerada e unica mesmo para o mesmo usuario.

---

## 7. Metricas de Sucesso

| Metrica | Baseline | Meta |
|---------|----------|------|
| Secoes em ordem identica entre 2 paginas aleatorias | 100% | < 30% |
| Variantes visuais distintas possiveis | 1 | 50+ combinacoes |
| Usuarios que geram > 1 versao antes de editar | 0% | > 40% |
| Satisfacao com variedade (pesquisa) | N/A | > 4/5 |

---

## 8. Riscos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Combinacoes incoerentes visualmente | Alto | Blueprints curados manualmente, nao puramente aleatorios |
| Performance ao gerar N variacoes | Medio | Gerar previews com JSON leve, renderizar sob demanda |
| Complexidade de manutencao dos builders | Medio | Cada variante como funcao pura isolada, testes unitarios |
| Quebra de retrocompatibilidade | Alto | Blueprint `classico` = comportamento atual exato |
| Hydrate nao funcionar com novos layouts | Medio | `hydrarTemplateComPerfil` precisa ser atualizado por variante |
| Perda de dados do perfil em variantes novas | **Critico** | Teste automatizado de integridade: JSON de cada blueprint validado contra checklist de campos obrigatorios (logo, redes sociais, telefone, servicos, socios, imagens). Build falha se algum campo estiver ausente |

---

## 9. Decisoes em Aberto

1. **Opcao A vs B vs C** — Qual fluxo de UX priorizar no MVP?
   - **Recomendacao:** Opcao C (hibrido) com MVP da Opcao A primeiro
2. **Quantidade de blueprints iniciais** — 4 vs 6 vs 8?
   - **Recomendacao:** 4 no MVP, expandir para 8 na fase 3
3. **Preview das variacoes** — iframe real vs screenshot estatico vs skeleton?
   - **Recomendacao:** Skeleton/wireframe no MVP, iframe real na fase 2
4. **Seed reprodutivel** — Salvar seed para poder recriar exatamente a mesma variacao?
   - **Recomendacao:** Sim, util para debug e compartilhamento

---

## 10. Resumo Executivo

**Problema:** Paginas identicas → baixa diferenciacao entre escritorios.

**Solucao:** Sistema de variacao em 3 camadas:
- **Blueprints** mudam a ESTRUTURA (ordem e agrupamento de secoes)
- **Variantes de componente** mudam o ESTILO (como cada secao e renderizada)
- **Micro-variacoes** mudam os DETALHES (tipografia, sombras, espacamento)

**MVP:** 4 blueprints + 2 variantes de hero + 2 de servicos + botao "gerar outra versao".

**Resultado esperado:** 50+ combinacoes visuais distintas a partir do mesmo perfil de dados.

---

*Documento gerado por: Orion (Orchestrator) + Analyst + PO — 2026-03-11*
