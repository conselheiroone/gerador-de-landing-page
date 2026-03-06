# Design System - CClass Trib Conselheiro One

> Extraído de: https://cclasstrib.conselheiroone.com/
> Data: 2026-01-25

---

## Cores

### Paleta Principal

| Nome | Hex | Uso |
|------|-----|-----|
| **Brand Green** | `#10B981` | Cor principal, botões primários, links, destaques |
| **Brand Green Light** | `#D1FAE5` | Backgrounds sutis, badges, hover states |
| **Brand Green Dark** | `#059669` | Hover em botões verdes |
| **Dark/Black** | `#1A1A1A` | Sidebar, botões secundários, textos principais |
| **White** | `#FFFFFF` | Backgrounds, textos em botões escuros |
| **Gray 50** | `#F9FAFB` | Background da aplicação |
| **Gray 100** | `#F3F4F6` | Backgrounds de cards, inputs |
| **Gray 200** | `#E5E7EB` | Bordas, divisores |
| **Gray 400** | `#9CA3AF` | Textos secundários, placeholders |
| **Gray 500** | `#6B7280` | Textos de descrição |
| **Gray 600** | `#4B5563` | Labels, textos de menu |
| **Gray 900** | `#111827` | Títulos, textos principais |

### Cores de Estado

| Nome | Hex | Uso |
|------|-----|-----|
| **Success** | `#10B981` | Confirmações, check icons |
| **Warning** | `#F59E0B` | Alertas, atenção |
| **Error** | `#EF4444` | Erros, validação |
| **Info** | `#3B82F6` | Informações |

### Cores Especiais

| Nome | Hex | Uso |
|------|-----|-----|
| **WhatsApp** | `#25D366` | Botão WhatsApp |
| **Purple Accent** | `#8B5CF6` | Ícones de destaque (módulos, tempo) |
| **Orange Accent** | `#F97316` | Badges "Mais Popular" |

### CSS Variables

```css
:root {
  /* Brand Colors */
  --color-brand-primary: #10B981;
  --color-brand-primary-light: #D1FAE5;
  --color-brand-primary-dark: #059669;

  /* Neutral Colors */
  --color-white: #FFFFFF;
  --color-black: #1A1A1A;
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;

  /* State Colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* Special */
  --color-whatsapp: #25D366;
}
```

---

## Tipografia

### Font Family

```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif,
             "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
```

### Escala Tipográfica

| Nome | Tamanho | Peso | Line Height | Uso |
|------|---------|------|-------------|-----|
| Display | 72px (4.5rem) | 700 | 1.25 | Hero da landing page |
| H1 | 48px (3rem) | 700 | 1.00 | Títulos de página (ex: "Olá, Jhonata!") |
| H2 | 30px (1.875rem) | 700 | 1.20 | Seções principais |
| H3 | 24px (1.5rem) | 600/700 | 1.33 | Títulos de cards (ex: "Escolha seu Plano") |
| H4 | 20px (1.25rem) | 600 | 1.40 | Subtítulos (ex: "Atividade Recente") |
| Body Large | 18px (1.125rem) | 400/500 | 1.56 | Descrições destacadas |
| Body | 16px (1rem) | 400/500 | 1.50 | Texto padrão, itens de menu |
| Body Small | 14px (0.875rem) | 400/500 | 1.43 | Labels, descrições secundárias |
| Caption | 12px (0.75rem) | 400/500 | 1.33 | Metadados, timestamps, hints |

### Uso Específico

| Contexto | Tamanho | Peso | Cor |
|----------|---------|------|-----|
| Título de página | 30px | 700 | Gray 900 |
| Subtítulo/descrição | 16px | 400 | Gray 500 |
| Valor numérico grande | 48px | 700 | Gray 900 |
| Valor de preço | 36px | 700 | Gray 900 |
| Label de menu | 14px | 500 | Gray 600 |
| Menu ativo | 14px | 500 | Brand Green |
| Badge texto | 12px | 500 | Brand Green / White |

### CSS Variables

```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  --text-6xl: 4.5rem;    /* 72px */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.33;
  --leading-normal: 1.5;
  --leading-relaxed: 1.56;
}
```

---

## Espaçamento

Sistema baseado em **8px**.

| Token | Valor | Rem | Uso |
|-------|-------|-----|-----|
| `spacing-1` | 2px | 0.125rem | Gaps mínimos |
| `spacing-2` | 4px | 0.25rem | Padding interno de badges |
| `spacing-3` | 6px | 0.375rem | Espaçamento entre ícone e texto |
| `spacing-4` | 8px | 0.5rem | Padding de botões pequenos |
| `spacing-5` | 12px | 0.75rem | Padding horizontal de inputs |
| `spacing-6` | 16px | 1rem | Padding padrão de botões |
| `spacing-7` | 20px | 1.25rem | Gap entre itens de lista |
| `spacing-8` | 24px | 1.5rem | Padding de cards |
| `spacing-9` | 32px | 2rem | Gap entre seções |
| `spacing-10` | 40px | 2.5rem | Margem entre blocos |
| `spacing-11` | 48px | 3rem | Padding de seções |
| `spacing-12` | 64px | 4rem | Espaçamento de hero |

### CSS Variables

```css
:root {
  --spacing-0: 0;
  --spacing-1: 0.125rem;  /* 2px */
  --spacing-2: 0.25rem;   /* 4px */
  --spacing-3: 0.375rem;  /* 6px */
  --spacing-4: 0.5rem;    /* 8px */
  --spacing-5: 0.75rem;   /* 12px */
  --spacing-6: 1rem;      /* 16px */
  --spacing-7: 1.25rem;   /* 20px */
  --spacing-8: 1.5rem;    /* 24px */
  --spacing-9: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-11: 3rem;     /* 48px */
  --spacing-12: 4rem;     /* 64px */
}
```

---

## Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | 6px | Badges pequenos |
| `radius-md` | 8px | Botões, inputs, cards pequenos |
| `radius-lg` | 12px | Cards, containers |
| `radius-xl` | 16px | Cards grandes, modais |
| `radius-2xl` | 24px | Hero cards, imagens de módulo |
| `radius-full` | 9999px | Avatares, badges pill, steps |

### CSS Variables

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.375rem;  /* 6px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;
}
```

---

## Bordas

| Propriedade | Valor | Uso |
|-------------|-------|-----|
| Default | `1px solid #E5E7EB` | Cards, inputs, divisores |
| Focus | `2px solid #10B981` | Focus rings |
| Active/Selected | `2px solid #10B981` | Cards de plano selecionado |

### CSS Variables

```css
:root {
  --border-width-default: 1px;
  --border-width-focus: 2px;
  --border-color-default: #E5E7EB;
  --border-color-focus: #10B981;
}
```

---

## Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Inputs, elementos sutis |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)` | Cards, dropdowns |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)` | Modais, cards elevados |
| `shadow-card` | `0 1px 3px rgba(0,0,0,0.1)` | Cards de estatística |

### CSS Variables

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

---

## Layout

### Sidebar

| Propriedade | Valor |
|-------------|-------|
| Largura (expandida) | 240px |
| Largura (colapsada) | 72px |
| Background | `#1A1A1A` (dark) |
| Item padding | 12px 16px |
| Item border-radius | 8px |
| Item hover bg | `rgba(255,255,255,0.1)` |
| Item active bg | `rgba(16,185,129,0.1)` |
| Item active color | `#10B981` |
| Divider | `1px solid rgba(255,255,255,0.1)` |

### Header/Topbar

| Propriedade | Valor |
|-------------|-------|
| Altura | 64px |
| Background | `#FFFFFF` |
| Border bottom | `1px solid #E5E7EB` |
| Search input width | 400px |

### Content Area

| Propriedade | Valor |
|-------------|-------|
| Background | `#F9FAFB` |
| Max width | 1280px |
| Padding | 24px - 32px |
| Gap entre cards | 24px |

### Grid

| Propriedade | Valor |
|-------------|-------|
| Colunas (desktop) | 12 |
| Gap | 24px |
| Cards de estatística | 4 colunas (25% cada) |
| Cards de plano | 3 colunas (33% cada) |

---

## Componentes

### Botões

#### Primary (Verde)

```css
.btn-primary {
  background-color: #10B981;
  color: #FFFFFF;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  background-color: #059669;
}

.btn-primary:focus {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
}
```

#### Secondary (Dark/Black)

```css
.btn-secondary {
  background-color: #1A1A1A;
  color: #FFFFFF;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  border: none;
}

.btn-secondary:hover {
  background-color: #333333;
}
```

#### Outline

```css
.btn-outline {
  background-color: transparent;
  color: #10B981;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  border: 1px solid #10B981;
}

.btn-outline:hover {
  background-color: rgba(16, 185, 129, 0.05);
}
```

#### Ghost

```css
.btn-ghost {
  background-color: transparent;
  color: #6B7280;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  border: none;
}

.btn-ghost:hover {
  background-color: #F3F4F6;
}
```

#### CTA (Call to Action)

```css
.btn-cta {
  background-color: #10B981;
  color: #FFFFFF;
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
```

### Inputs

#### Text Input

```css
.input {
  width: 100%;
  padding: 12px 16px 12px 44px; /* espaço para ícone */
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
  color: #111827;
  background-color: #FFFFFF;
}

.input::placeholder {
  color: #9CA3AF;
}

.input:focus {
  outline: none;
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
}
```

#### Search Input

```css
.search-input {
  padding: 8px 16px 8px 40px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  width: 400px;
  background-color: #F9FAFB;
}

.search-input::placeholder {
  color: #9CA3AF;
}
```

### Cards

#### Stat Card

```css
.stat-card {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-card__label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
}

.stat-card__value {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.stat-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
}
```

#### Feature Card (Dashboard Hero)

```css
.feature-card {
  background: linear-gradient(135deg, #065F46 0%, #10B981 100%);
  border-radius: 16px;
  padding: 32px;
  color: #FFFFFF;
}

.feature-card__badge {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
}

.feature-card__title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
}

.feature-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.feature-card__stat {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
}
```

#### Pricing Card

```css
.pricing-card {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 32px;
}

.pricing-card--featured {
  border: 2px solid #10B981;
}

.pricing-card__badge {
  background-color: #F97316;
  color: #FFFFFF;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.pricing-card__title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.pricing-card__description {
  font-size: 14px;
  color: #6B7280;
}

.pricing-card__price {
  font-size: 36px;
  font-weight: 700;
  color: #111827;
}

.pricing-card__price-period {
  font-size: 16px;
  font-weight: 400;
  color: #6B7280;
}

.pricing-card__credits {
  background-color: #F3F4F6;
  border-radius: 8px;
  padding: 12px 16px;
  text-align: center;
}

.pricing-card__credits-value {
  color: #10B981;
  font-weight: 600;
}

.pricing-card__feature {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.pricing-card__feature-icon {
  color: #10B981;
}
```

#### Module Card (Aprendizado)

```css
.module-card {
  border-radius: 16px;
  overflow: hidden;
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
}

.module-card__image {
  position: relative;
  height: 200px;
  background-size: cover;
  background-position: center;
}

.module-card__badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -80%);
  background-color: #10B981;
  color: #FFFFFF;
  padding: 8px 24px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 600;
}

.module-card__title {
  position: absolute;
  bottom: 40px;
  left: 24px;
  right: 24px;
  color: #FFFFFF;
  font-size: 24px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.module-card__meta {
  position: absolute;
  bottom: 16px;
  left: 24px;
  right: 24px;
  display: flex;
  justify-content: space-between;
  color: #FFFFFF;
  font-size: 12px;
}

.module-card__content {
  padding: 16px 24px;
}

.module-card__progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.module-card__progress-text {
  font-size: 14px;
  color: #6B7280;
}

.module-card__progress-value {
  font-size: 14px;
  color: #10B981;
  font-weight: 500;
}
```

### Badges

#### Default Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.badge--primary {
  background-color: #D1FAE5;
  color: #065F46;
}

.badge--secondary {
  background-color: #F3F4F6;
  color: #374151;
}

.badge--warning {
  background-color: #FEF3C7;
  color: #92400E;
}

.badge--orange {
  background-color: #F97316;
  color: #FFFFFF;
}
```

### Steps/Stepper

```css
.step {
  display: flex;
  align-items: center;
  gap: 16px;
}

.step__number {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background-color: #10B981;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step__content {
  flex: 1;
}

.step__title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.step__description {
  font-size: 14px;
  color: #6B7280;
}
```

### Avatar

```css
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  background-color: #10B981;
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar--sm {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.avatar--lg {
  width: 48px;
  height: 48px;
  font-size: 18px;
}
```

### Progress Bar

```css
.progress {
  height: 4px;
  background-color: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
}

.progress__bar {
  height: 100%;
  background-color: #10B981;
  border-radius: 9999px;
  transition: width 0.3s ease;
}
```

### Empty State

```css
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-state__icon {
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  background-color: #D1FAE5;
  color: #10B981;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state__title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.empty-state__description {
  font-size: 14px;
  color: #6B7280;
  max-width: 400px;
  margin: 0 auto;
}
```

### Breadcrumb

```css
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6B7280;
}

.breadcrumb__item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb__link {
  color: #6B7280;
  text-decoration: none;
}

.breadcrumb__link:hover {
  color: #111827;
}

.breadcrumb__current {
  color: #111827;
  font-weight: 500;
}

.breadcrumb__separator {
  color: #D1D5DB;
}
```

### Action List Item

```css
.action-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-item:hover {
  background-color: #F9FAFB;
  border-color: #10B981;
}

.action-item__icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #D1FAE5;
  color: #10B981;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-item__content {
  flex: 1;
}

.action-item__title {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.action-item__description {
  font-size: 12px;
  color: #6B7280;
}

.action-item__arrow {
  color: #9CA3AF;
}
```

### CTA Banner (Sidebar)

```css
.cta-banner {
  background-color: #10B981;
  border-radius: 12px;
  padding: 16px;
  color: #FFFFFF;
  margin: 16px;
}

.cta-banner__icon {
  margin-bottom: 8px;
}

.cta-banner__title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.cta-banner__description {
  font-size: 12px;
  opacity: 0.9;
}
```

---

## Ícones

O sistema utiliza ícones de linha (outline) com as seguintes características:

| Propriedade | Valor |
|-------------|-------|
| Stroke width | 1.5px - 2px |
| Tamanho padrão | 20px |
| Tamanho pequeno | 16px |
| Tamanho grande | 24px |
| Cor padrão | `currentColor` |

### Ícones Identificados

- Dashboard (grid 2x2)
- Empresas (building)
- Parametrização (settings/cog)
- Aprendizado (graduation cap)
- Assinatura (credit card)
- Usuários (users)
- Filas (mail)
- Planos (sparkles/star)
- Termos (document)
- Landing Page (layout)
- Search (magnifying glass)
- Plus (+)
- Chevron (>, <)
- Check (checkmark)
- Lock (padlock)
- Clock (time)
- Chart/Analytics
- Lightning bolt
- Shield

---

## Breakpoints

| Nome | Valor | Descrição |
|------|-------|-----------|
| Mobile | < 640px | Layout single column |
| Tablet | 640px - 1024px | Layout adaptado |
| Desktop | > 1024px | Layout completo com sidebar |

```css
/* Mobile first */
@media (min-width: 640px) {
  /* Tablet */
}

@media (min-width: 1024px) {
  /* Desktop */
}

@media (min-width: 1280px) {
  /* Large Desktop */
}
```

---

## Animações e Transições

```css
:root {
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
}

/* Hover transitions */
.btn, .card, .input {
  transition: all var(--transition-normal);
}

/* Focus transitions */
.input:focus, .btn:focus {
  transition: box-shadow var(--transition-fast);
}
```

---

## Tokens Completos (CSS Custom Properties)

```css
:root {
  /* ==================== COLORS ==================== */

  /* Brand */
  --color-brand-50: #ECFDF5;
  --color-brand-100: #D1FAE5;
  --color-brand-200: #A7F3D0;
  --color-brand-300: #6EE7B7;
  --color-brand-400: #34D399;
  --color-brand-500: #10B981;
  --color-brand-600: #059669;
  --color-brand-700: #047857;
  --color-brand-800: #065F46;
  --color-brand-900: #064E3B;

  /* Gray */
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;

  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* Special */
  --color-white: #FFFFFF;
  --color-black: #1A1A1A;
  --color-whatsapp: #25D366;

  /* ==================== TYPOGRAPHY ==================== */

  --font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
                 "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* ==================== SPACING ==================== */

  --space-0: 0;
  --space-1: 0.125rem;
  --space-2: 0.25rem;
  --space-3: 0.375rem;
  --space-4: 0.5rem;
  --space-5: 0.75rem;
  --space-6: 1rem;
  --space-7: 1.25rem;
  --space-8: 1.5rem;
  --space-9: 2rem;
  --space-10: 2.5rem;
  --space-11: 3rem;
  --space-12: 4rem;

  /* ==================== BORDER RADIUS ==================== */

  --radius-none: 0;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* ==================== SHADOWS ==================== */

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  /* ==================== BORDERS ==================== */

  --border-width: 1px;
  --border-color: var(--color-gray-200);

  /* ==================== TRANSITIONS ==================== */

  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;

  /* ==================== Z-INDEX ==================== */

  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-tooltip: 1060;
}
```

---

## Arquivos de Assets

| Tipo | URL |
|------|-----|
| Favicon | `/favicon.ico` |
| Icon SVG | `/logo/green_icon.svg` |
| Apple Touch Icon | `/logo/green_icon.svg` |

---

## Frameworks Utilizados

- **Tailwind CSS** - Classes utilitárias
- **PrimeReact/Vue/NG** - Componentes Prime
- **Fluent UI** - Componentes Fluent
