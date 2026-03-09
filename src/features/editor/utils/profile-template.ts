/**
 * Gerador de template Craft.js baseado nos dados do perfil da empresa.
 *
 * Layout moderno inspirado no design system da landing page de referência:
 * Navbar → Hero → Serviços → Sobre → Diferenciais → Equipe → CTA → Footer
 *
 * Usa buildCraftJson do default-templates para montar a árvore de nós.
 *
 * REGRAS:
 * - Somente dados reais do perfil são exibidos (nada inventado)
 * - Português pt-BR correto com acentuação
 * - Usa as cores do perfil exatamente como o usuário definiu
 */

import type { PerfilEmpresa, Socio, Depoimento, ServicoItem } from '@/features/onboarding/types/onboarding.types'
import { buildCraftJson, type TemplateNode } from './default-templates'

// ─── Color utilities ─────────────────────────────────────────

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ]
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return `#${[r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('')}`
}

export function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  )
}

export function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}

/** Verifica se a cor é clara (para decidir cor de texto sobre ela) */
export function isLightColor(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
}

/** Largura máxima do conteúdo das seções (bg fica full-width) */
const CONTENT_MAX_WIDTH = '1080px'

/** Imagem padrão de contabilidade para o hero (parallax) */
const DEFAULT_HERO_IMAGE = '/assets/hero/contabilidade-default.svg'

// ─── Template generator ─────────────────────────────────────

export function generateProfileTemplate(
  perfil: PerfilEmpresa,
  socios: Socio[],
  depoimentos?: Depoimento[],
): string {
  const nome = perfil.nome_empresa || 'Minha Empresa'
  const slogan = perfil.slogan || 'Soluções profissionais para o seu negócio'
  const primary = perfil.cor_primaria || '#2563eb'
  const secondary = perfil.cor_secundaria || '#1A1A1A'

  // ─── Paleta derivada das cores do perfil ───
  const tintPri = lighten(primary, 0.88)    // fundo com toque primário visível
  const tintSec = lighten(secondary, 0.88)  // fundo com toque secundário visível
  const cardSoft = lighten(primary, 0.92)   // fundo suave para cards

  const sections: TemplateNode[] = []

  // 0. Navbar — barra de navegação com logo, links e WhatsApp
  sections.push(buildNavbar(perfil, nome, primary, secondary))

  // 1. Hero — gradiente escuro profissional
  sections.push(buildHero(perfil, nome, slogan, primary, secondary))

  // 1.5. Stats — strip numérico entre hero e serviços
  const statsSection = buildStats(perfil, socios, primary, secondary)
  if (statsSection) sections.push(statsSection)

  // 2. Serviços — fundo branco (respiro após hero escuro)
  if (perfil.servicos && perfil.servicos.length > 0) {
    sections.push(buildServicos(perfil.servicos, primary, secondary, '#ffffff', tintPri))
  }

  // 3. Sobre — fundo tintPri (seção PRIMARY)
  if (perfil.historia || perfil.missao || perfil.visao || perfil.valores) {
    sections.push(buildSobre(perfil, nome, primary, secondary, tintPri, cardSoft))
  }

  // 4. Diferenciais — fundo tintSec (seção SECONDARY)
  if (perfil.diferenciais && perfil.diferenciais.length > 0) {
    sections.push(buildDiferenciais(perfil.diferenciais, primary, secondary, tintSec))
  }

  // 5. Equipe — fundo branco (respiro)
  const sociosVisiveis = socios.filter(s => s.exibir_landing_page)
  if (sociosVisiveis.length > 0) {
    sections.push(buildEquipe(sociosVisiveis, primary, secondary, '#ffffff'))
  }

  // 5.5. Depoimentos — fundo tintPri (sempre incluído: reais ou placeholders)
  const depoimentosAtivos = depoimentos?.filter(d => d.ativo) ?? []
  sections.push(buildDepoimentos(depoimentosAtivos, primary, secondary, tintPri))

  // 6. CTA — fundo primário (destaque intencional)
  sections.push(buildCta(perfil, primary, secondary))

  // 7. Footer — escuro padrão com acento da secundária
  sections.push(buildFooter(perfil, nome, primary, secondary))

  return buildCraftJson({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Página',
    props: {
      background: '#ffffff',
      padding: 0,
      gap: 0,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      shadow: 0,
      radius: 0,
    },
    custom: { displayName: 'Página' },
    children: sections,
  })
}

// ─── 0. NAVBAR ───────────────────────────────────────────────

function buildNavbar(
  perfil: PerfilEmpresa,
  nome: string,
  primary: string,
  secondary: string,
): TemplateNode {
  // Glass navbar — fundo semi-transparente com backdrop-blur
  const darkBase = darken(primary, 0.35)
  const [r, g, b] = hexToRgb(darkBase)

  return {
    type: 'NavbarComponent',
    displayName: 'Navbar',
    props: {
      background: `rgba(${r}, ${g}, ${b}, 0.55)`,
      backdropBlur: 14,
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      logoText: nome,
      logoSrc: perfil.logo_url || '',
      logoHeight: 44,
      logoBg: perfil.logo_url ? '#ffffff' : 'transparent',
      logoShape: perfil.logo_url ? 'circle' : 'pill',
      showLogoText: !!perfil.logo_url,
      links: [
        { label: 'Serviços', href: '#servicos' },
        { label: 'Sobre', href: '#sobre' },
        { label: 'Equipe', href: '#equipe' },
        { label: 'Contato', href: '#contato' },
      ],
      ctaText: 'Fale Conosco',
      ctaBg: secondary,
      ctaColor: isLightColor(secondary) ? '#111827' : '#ffffff',
      ctaBorderRadius: 50,
      linkColor: '#ffffff',
      linkFontSize: 15,
      paddingX: 48,
      paddingY: 18,
      contentMaxWidth: CONTENT_MAX_WIDTH,
    },
  }
}

// ─── 1. HERO — Layout split profissional ─────────────────────

function buildHero(
  perfil: PerfilEmpresa,
  nome: string,
  slogan: string,
  primary: string,
  secondary: string,
): TemplateNode {
  const whatsappHref = perfil.whatsapp
    ? `https://wa.me/55${perfil.whatsapp.replace(/\D/g, '')}`
    : null
  const emailHref = perfil.email_contato ? `mailto:${perfil.email_contato}` : '#contato'

  const heroImage = perfil.usar_imagem_hero
    ? (perfil.hero_image_url || DEFAULT_HERO_IMAGE)
    : null

  if (perfil.logo_url) {
    return buildHeroSplit(perfil, nome, slogan, primary, secondary, whatsappHref, emailHref, heroImage)
  }
  return buildHeroCentered(nome, slogan, primary, secondary, whatsappHref, emailHref, null, heroImage)
}

function buildHeroSplit(
  perfil: PerfilEmpresa,
  nome: string,
  slogan: string,
  primary: string,
  secondary: string,
  whatsappHref: string | null,
  emailHref: string,
  heroImage: string | null,
): TemplateNode {
  const gradientFrom = darken(primary, 0.65)
  const gradientTo = darken(primary, 0.40)

  const contentChildren: TemplateNode[] = []

  // Badge: "DESDE {ano} · {CIDADE}, {ESTADO}"
  const badgeParts: string[] = []
  if (perfil.ano_fundacao) badgeParts.push(`Desde ${perfil.ano_fundacao}`)
  if (perfil.cidade && perfil.estado) badgeParts.push(`${perfil.cidade}, ${perfil.estado}`)
  if (badgeParts.length > 0) {
    contentChildren.push({
      type: 'TextComponent',
      displayName: 'Badge Hero',
      props: {
        text: badgeParts.join('  ·  ').toUpperCase(),
        fontSize: '13',
        fontWeight: '700',
        textAlign: 'left',
        color: secondary,
        margin: [0, 0, 6, 0],
        letterSpacing: '2.5',
      },
    })
  }

  contentChildren.push({
    type: 'HeadingComponent',
    displayName: 'Nome da Empresa',
    props: {
      text: nome,
      tagName: 'h1',
      fontSize: '52',
      fontWeight: '900',
      textAlign: 'left',
      color: '#ffffff',
      lineHeight: '1.1',
    },
  })

  contentChildren.push({
    type: 'TextComponent',
    displayName: 'Slogan',
    props: {
      text: slogan,
      fontSize: '20',
      fontWeight: '400',
      textAlign: 'left',
      color: '#e2e8f0',
      lineHeight: '1.6',
      margin: [4, 0, 8, 0],
    },
  })

  // Meta info: linha clean sem emojis — "telefone · email · horário"
  const metaParts: string[] = []
  if (perfil.telefone) metaParts.push(perfil.telefone)
  if (perfil.email_contato) metaParts.push(perfil.email_contato)
  if (perfil.horario_atendimento) metaParts.push(perfil.horario_atendimento)

  if (metaParts.length > 0) {
    contentChildren.push({
      type: 'TextComponent',
      displayName: 'Meta Info Hero',
      props: {
        text: metaParts.join('  ·  '),
        fontSize: '15',
        fontWeight: '500',
        textAlign: 'left',
        color: 'rgba(255,255,255,0.75)',
        margin: [0, 0, 8, 0],
      },
    })
  }

  // Botões: WhatsApp (primário pill) + Email (ghost pill)
  const btns: TemplateNode[] = []

  if (whatsappHref) {
    btns.push({
      type: 'ButtonComponent',
      displayName: 'WhatsApp',
      props: {
        text: 'Falar no WhatsApp',
        href: whatsappHref,
        background: secondary,
        color: isLightColor(secondary) ? '#111827' : '#ffffff',
        size: 'lg',
        buttonStyle: 'filled',
        borderRadius: 50,
      },
    })
  }

  btns.push({
    type: 'ButtonComponent',
    displayName: 'Email',
    props: {
      text: 'Enviar e-mail',
      href: emailHref,
      background: 'transparent',
      color: '#ffffff',
      size: 'lg',
      buttonStyle: 'outline',
      borderRadius: 50,
    },
  })

  contentChildren.push({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Botões Hero',
    props: {
      background: 'transparent',
      padding: 0,
      gap: 14,
      width: '100%',
      height: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      shadow: 0,
      radius: 0,
    },
    children: btns,
  })

  // Hero usa layout full-width (logo já está na navbar)
  const contentColumn: TemplateNode = {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Conteúdo Hero',
    props: {
      background: 'transparent',
      padding: 16,
      gap: 14,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      shadow: 0,
      radius: 0,
      maxWidth: '720px',
    },
    children: contentChildren,
  }

  const heroRow: TemplateNode = {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Hero Row',
    props: {
      background: 'transparent',
      padding: 0,
      gap: 0,
      width: '100%',
      height: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      shadow: 0,
      radius: 0,
    },
    children: [contentColumn],
  }

  if (heroImage) {
    // Hero com imagem de fundo + parallax — usa HeroSectionComponent
    return {
      type: 'HeroSectionComponent',
      isCanvas: true,
      displayName: 'Hero',
      props: {
        background: gradientFrom,
        gradientFrom: '',
        gradientTo: '',
        backgroundImage: heroImage,
        overlayOpacity: 0.55,
        overlayColor: '#000000',
        parallax: true,
        paddingY: 90,
        minHeight: 500,
        textAlign: 'left',
        contentMaxWidth: CONTENT_MAX_WIDTH,
      },
      children: [heroRow],
    }
  }

  return {
    type: 'HeroSectionComponent',
    isCanvas: true,
    displayName: 'Hero',
    props: {
      background: gradientFrom,
      gradientFrom,
      gradientTo,
      gradientDirection: '135deg',
      paddingY: 90,
      minHeight: 500,
      textAlign: 'left',
      contentMaxWidth: CONTENT_MAX_WIDTH,
    },
    children: [heroRow],
  }
}

function buildHeroCentered(
  nome: string,
  slogan: string,
  primary: string,
  secondary: string,
  whatsappHref: string | null,
  emailHref: string,
  areaAtuacao: string | null,
  heroImage: string | null,
): TemplateNode {
  const gradientFrom = darken(primary, 0.65)
  const gradientTo = darken(primary, 0.40)

  const children: TemplateNode[] = [
    {
      type: 'TextComponent',
      displayName: 'Área de Atuação',
      props: {
        text: areaAtuacao ? areaAtuacao.toUpperCase() : 'CONTABILIDADE & ASSESSORIA',
        fontSize: '12',
        fontWeight: '700',
        textAlign: 'center',
        color: secondary,
        margin: [0, 0, 0, 0],
      },
    },
    {
      type: 'HeadingComponent',
      displayName: 'Nome da Empresa',
      props: {
        text: nome,
        tagName: 'h1',
        fontSize: '56',
        fontWeight: '900',
        textAlign: 'center',
        color: '#ffffff',
      },
    },
    {
      type: 'DividerComponent',
      displayName: 'Acento',
      props: { color: secondary, thickness: 4, marginY: 12, style: 'solid' },
    },
    {
      type: 'TextComponent',
      displayName: 'Slogan',
      props: {
        text: slogan,
        fontSize: '22',
        fontWeight: '300',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.72)',
        margin: [0, 0, 16, 0],
      },
    },
  ]

  children.push({
    type: 'ButtonComponent',
    displayName: 'CTA Orçamento',
    props: {
      text: whatsappHref ? 'Falar no WhatsApp' : 'Solicite um Orçamento',
      href: whatsappHref || emailHref,
      background: secondary,
      color: isLightColor(secondary) ? '#111827' : '#ffffff',
      size: 'lg',
      buttonStyle: 'filled',
      borderRadius: 10,
    },
  })

  return {
    type: 'HeroSectionComponent',
    isCanvas: true,
    displayName: 'Hero',
    props: {
      background: gradientFrom,
      gradientFrom: heroImage ? '' : gradientFrom,
      gradientTo: heroImage ? '' : gradientTo,
      gradientDirection: '135deg',
      paddingY: 90,
      minHeight: 500,
      textAlign: 'center',
      contentMaxWidth: CONTENT_MAX_WIDTH,
      ...(heroImage ? {
        backgroundImage: heroImage,
        overlayOpacity: 0.55,
        overlayColor: '#000000',
        parallax: true,
      } : {}),
    },
    children,
  }
}

// ─── 1.5. STATS — faixa escura com números chave ─────────────

function buildStats(
  perfil: PerfilEmpresa,
  socios: Socio[],
  primary: string,
  secondary: string,
): TemplateNode | null {
  const currentYear = new Date().getFullYear()
  const stats: Array<{ valor: string; label: string }> = []

  if (perfil.ano_fundacao && perfil.ano_fundacao < currentYear) {
    const anos = currentYear - perfil.ano_fundacao
    stats.push({ valor: `${anos}+`, label: 'anos de experiência' })
  }

  if (perfil.servicos && perfil.servicos.length > 0) {
    const n = perfil.servicos.length
    stats.push({ valor: `${n}`, label: n === 1 ? 'serviço oferecido' : 'serviços oferecidos' })
  }

  const sociosVisiveis = socios.filter(s => s.exibir_landing_page)
  if (sociosVisiveis.length > 0) {
    const n = sociosVisiveis.length
    stats.push({ valor: `${n}`, label: n === 1 ? 'especialista dedicado' : 'especialistas dedicados' })
  }

  if (stats.length < 2) return null // não vale a seção com 1 item

  const bgDark = darken(primary, 0.45)

  return {
    type: 'StatsBandComponent',
    displayName: 'Números',
    props: {
      background: bgDark,
      textColor: '#ffffff',
      accentColor: secondary,
      labelColor: 'rgba(255,255,255,0.85)',
      paddingY: 56,
      showDivider: true,
      stats,
    },
  }
}

// ─── 2. SERVIÇOS — cards modernos com acento ─────────────────

function buildServicos(
  servicos: PerfilEmpresa['servicos'],
  _primary: string,
  secondary: string,
  sectionBg: string,
  _tintPri: string,
): TemplateNode {
  const items = servicos as ServicoItem[]
  const columns = items.length <= 2 ? 2 : 3

  const headerChildren: TemplateNode[] = [
    {
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: 'Cabeçalho Serviços',
      props: {
        background: 'transparent',
        padding: 0,
        gap: 8,
        width: '100%',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        shadow: 0,
        radius: 0,
      },
      children: [
        {
          type: 'TextComponent',
          displayName: 'Tag Serviços',
          props: {
            text: 'O QUE FAZEMOS',
            fontSize: '12',
            fontWeight: '700',
            textAlign: 'center',
            color: secondary,
            margin: [0, 0, 0, 0],
          },
        },
        {
          type: 'HeadingComponent',
          displayName: 'Título Serviços',
          props: {
            text: 'Nossos Serviços',
            tagName: 'h2',
            fontSize: '40',
            fontWeight: '800',
            textAlign: 'center',
            color: '#0f172a',
          },
        },
        {
          type: 'DividerComponent',
          displayName: 'Divisor',
          props: { color: secondary, thickness: 4, marginY: 8, style: 'solid' },
        },
        {
          type: 'TextComponent',
          displayName: 'Subtítulo Serviços',
          props: {
            text: 'Soluções contábeis completas para empresas de todos os segmentos e portes.',
            fontSize: '16',
            fontWeight: '400',
            textAlign: 'center',
            color: '#64748b',
            margin: [0, 0, 0, 0],
          },
        },
      ],
    },
  ]

  const cards: TemplateNode[] = items.map((servico, i) => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: `Serviço ${i + 1}`,
    props: {
      background: '#ffffff',
      padding: 28,
      gap: 12,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      shadow: 2,
      radius: 16,
      borderAccent: secondary,
      borderAccentPosition: 'top',
    },
    children: [
      {
        type: 'HeadingComponent',
        displayName: 'Título Serviço',
        props: {
          text: servico.nome,
          tagName: 'h3',
          fontSize: '17',
          fontWeight: '700',
          textAlign: 'left',
          color: '#0f172a',
          lineHeight: '1.4',
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Descrição Serviço',
        props: {
          text: servico.descricao || 'Serviço especializado para atender às necessidades do seu negócio com excelência e agilidade.',
          fontSize: '15',
          fontWeight: '400',
          textAlign: 'left',
          color: '#64748b',
          margin: [0, 0, 0, 0],
          lineHeight: '1.6',
        },
      },
    ],
  }))

  return {
    type: 'FeaturesSectionComponent',
    isCanvas: true,
    displayName: 'Serviços',
    props: { background: sectionBg, columns, gap: 18, paddingY: 80, contentMaxWidth: CONTENT_MAX_WIDTH, sectionId: 'servicos' },
    children: [...headerChildren, ...cards],
  }
}

// ─── 3. SOBRE — história + MVV cards modernos ────────────────

function buildSobre(
  perfil: PerfilEmpresa,
  nome: string,
  primary: string,
  secondary: string,
  sectionBg: string,
  _cardSoft: string,
): TemplateNode {
  const children: TemplateNode[] = []

  children.push({
    type: 'TextComponent',
    displayName: 'Tag Sobre',
    props: {
      text: 'CONHEÇA-NOS',
      fontSize: '12',
      fontWeight: '700',
      textAlign: 'center',
      color: secondary,
      margin: [0, 0, 0, 0],
    },
  })

  children.push({
    type: 'HeadingComponent',
    displayName: 'Título Sobre',
    props: {
      text: `Sobre a ${nome}`,
      tagName: 'h2',
      fontSize: '40',
      fontWeight: '800',
      textAlign: 'center',
      color: '#0f172a',
    },
  })

  children.push({
    type: 'DividerComponent',
    displayName: 'Divisor Sobre',
    props: { color: secondary, thickness: 4, marginY: 8, style: 'solid' },
  })

  if (perfil.historia) {
    children.push({
      type: 'TextComponent',
      displayName: 'História',
      props: {
        text: perfil.historia,
        fontSize: '18',
        fontWeight: '400',
        textAlign: 'center',
        color: '#334155',
        margin: [8, 0, 24, 0],
      },
    })
  }

  // MVV — cards modernos com borda superior colorida
  const mvvDefs = [
    { label: '🎯  Missão', value: perfil.missao, accent: primary },
    { label: '🔭  Visão', value: perfil.visao, accent: secondary },
    { label: '💎  Valores', value: perfil.valores, accent: secondary },
  ].filter(item => item.value)

  if (mvvDefs.length > 0) {
    const mvvCards: TemplateNode[] = mvvDefs.map((item) => ({
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: item.label,
      props: {
        background: '#ffffff',
        padding: 28,
        gap: 12,
        width: '100%',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        shadow: 0,
        radius: 16,
      },
      children: [
        // Borda superior colorida simulada via DividerComponent
        {
          type: 'DividerComponent',
          displayName: 'Acento Topo',
          props: { color: item.accent, thickness: 4, marginY: 0, style: 'solid' },
        },
        {
          type: 'HeadingComponent',
          displayName: 'Título MVV',
          props: {
            text: item.label,
            tagName: 'h3',
            fontSize: '17',
            fontWeight: '700',
            textAlign: 'left',
            color: '#0f172a',
          },
        },
        {
          type: 'TextComponent',
          displayName: 'Texto MVV',
          props: {
            text: item.value!,
            fontSize: '15',
            fontWeight: '400',
            textAlign: 'left',
            color: '#334155',
            margin: [0, 0, 0, 0],
            lineHeight: '1.6',
          },
        },
      ],
    }))

    children.push({
      type: 'FeaturesSectionComponent',
      isCanvas: true,
      displayName: 'Missão, Visão e Valores',
      props: {
        background: 'transparent',
        columns: Math.min(mvvCards.length, 3),
        gap: 20,
        paddingY: 10,
      },
      children: mvvCards,
    } as TemplateNode)
  }

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Sobre',
    props: {
      background: sectionBg,
      padding: 0,
      paddingY: 80,
      gap: 0,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      shadow: 0,
      radius: 0,
      sectionId: 'sobre',
    },
    children: [
      {
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Conteúdo Sobre',
        props: {
          background: 'transparent',
          padding: 0,
          gap: 12,
          width: CONTENT_MAX_WIDTH,
          height: 'auto',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          shadow: 0,
          radius: 0,
        },
        children,
      },
    ],
  }
}

// ─── 4. DIFERENCIAIS ────────────────────────────────────────

function buildDiferenciais(
  diferenciais: string[],
  _primary: string,
  secondary: string,
  sectionBg: string,
): TemplateNode {
  const cards: TemplateNode[] = diferenciais.slice(0, 6).map((diff, i) => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: `Diferencial ${i + 1}`,
    props: {
      background: '#ffffff',
      padding: 28,
      gap: 8,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      shadow: 1,
      radius: 16,
    },
    children: [
      {
        type: 'TextComponent',
        displayName: 'Índice',
        props: {
          text: String(i + 1).padStart(2, '0'),
          fontSize: '36',
          fontWeight: '900',
          textAlign: 'left',
          color: lighten(secondary, 0.55),
          margin: [0, 0, 0, 0],
        },
      },
      {
        type: 'DividerComponent',
        displayName: 'Linha Diferencial',
        props: { color: secondary, thickness: 2, marginY: 4, style: 'solid' },
      },
      {
        type: 'TextComponent',
        displayName: 'Diferencial',
        props: {
          text: diff,
          fontSize: '15',
          fontWeight: '600',
          textAlign: 'left',
          color: '#111827',
          margin: [0, 0, 0, 0],
          lineHeight: '1.5',
        },
      },
    ],
  }))

  const columns = cards.length <= 2 ? 2 : 3

  return {
    type: 'FeaturesSectionComponent',
    isCanvas: true,
    displayName: 'Diferenciais',
    props: { background: sectionBg, columns, gap: 16, paddingY: 80, contentMaxWidth: CONTENT_MAX_WIDTH },
    children: [
      {
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Cabeçalho Diferenciais',
        props: {
          background: 'transparent',
          padding: 0,
          gap: 8,
          width: '100%',
          height: 'auto',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          shadow: 0,
          radius: 0,
        },
        children: [
          {
            type: 'TextComponent',
            displayName: 'Tag Diferenciais',
            props: {
              text: 'POR QUE NOS ESCOLHER',
              fontSize: '12',
              fontWeight: '700',
              textAlign: 'center',
              color: secondary,
              margin: [0, 0, 0, 0],
            },
          },
          {
            type: 'HeadingComponent',
            displayName: 'Título',
            props: {
              text: 'Nossos Diferenciais',
              tagName: 'h2',
              fontSize: '36',
              fontWeight: '800',
              textAlign: 'center',
              color: '#0f172a',
            },
          },
          {
            type: 'DividerComponent',
            displayName: 'Divisor',
            props: { color: secondary, thickness: 4, marginY: 8, style: 'solid' },
          },
        ],
      },
      ...cards,
    ],
  }
}

// ─── 5. EQUIPE — cards com foto, cargo e bio ────────────────

function buildEquipe(
  sociosVisiveis: Socio[],
  primary: string,
  secondary: string,
  bgLight: string,
): TemplateNode {
  const columns = sociosVisiveis.length >= 3 ? 3 : sociosVisiveis.length

  const cards: TemplateNode[] = sociosVisiveis.map((socio, i) => {
    const cardChildren: TemplateNode[] = []

    if (socio.foto_url) {
      cardChildren.push({
        type: 'ImageComponent',
        displayName: 'Foto',
        props: {
          src: socio.foto_url,
          alt: socio.nome_completo,
          width: '100px',
          height: '100px',
          objectFit: 'cover',
          borderRadius: 50,
        },
      })
    }

    cardChildren.push({
      type: 'HeadingComponent',
      displayName: 'Nome',
      props: {
        text: socio.nome_completo,
        tagName: 'h3',
        fontSize: '19',
        fontWeight: '700',
        textAlign: 'center',
        color: '#0f172a',
      },
    })

    if (socio.cargo) {
      cardChildren.push({
        type: 'TextComponent',
        displayName: 'Cargo',
        props: {
          text: socio.cargo,
          fontSize: '12',
          fontWeight: '700',
          textAlign: 'center',
          color: secondary,  // usa cor secundária (laranja/acento)
          margin: [0, 0, 4, 0],
        },
      })
    }

    if (socio.crc_numero) {
      cardChildren.push({
        type: 'TextComponent',
        displayName: 'CRC',
        props: {
          text: `CRC ${socio.crc_estado || ''}  ${socio.crc_numero}`,
          fontSize: '12',
          fontWeight: '500',
          textAlign: 'center',
          color: '#94a3b8',
          margin: [0, 0, 8, 0],
        },
      })
    }

    if (socio.mini_bio) {
      cardChildren.push({
        type: 'TextComponent',
        displayName: 'Bio',
        props: {
          text: `"${socio.mini_bio}"`,
          fontSize: '14',
          fontWeight: '400',
          textAlign: 'center',
          color: '#475569',
          margin: [4, 0, 8, 0],
        },
      })
    }

    // Especialidades separadas por ponto médio
    if (socio.especialidades && socio.especialidades.length > 0) {
      cardChildren.push({
        type: 'TextComponent',
        displayName: 'Especialidades',
        props: {
          text: socio.especialidades.join('  ·  '),
          fontSize: '12',
          fontWeight: '500',
          textAlign: 'center',
          color: primary,
          margin: [0, 0, 0, 0],
        },
      })
    }

    return {
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: `Sócio ${i + 1}`,
      props: {
        background: '#ffffff',
        padding: 32,
        gap: 8,
        width: '100%',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        shadow: 2,
        radius: 20,
      },
      children: cardChildren,
    }
  })

  return {
    type: 'FeaturesSectionComponent',
    isCanvas: true,
    displayName: 'Equipe',
    props: { background: bgLight, columns, gap: 24, paddingY: 80, contentMaxWidth: CONTENT_MAX_WIDTH, sectionId: 'equipe' },
    children: [
      {
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Cabeçalho Equipe',
        props: {
          background: 'transparent',
          padding: 0,
          gap: 8,
          width: '100%',
          height: 'auto',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          shadow: 0,
          radius: 0,
        },
        children: [
          {
            type: 'TextComponent',
            displayName: 'Tag Equipe',
            props: {
              text: 'PROFISSIONAIS',
              fontSize: '12',
              fontWeight: '700',
              textAlign: 'center',
              color: secondary,
              margin: [0, 0, 0, 0],
            },
          },
          {
            type: 'HeadingComponent',
            displayName: 'Título Equipe',
            props: {
              text: 'Nossa Equipe',
              tagName: 'h2',
              fontSize: '40',
              fontWeight: '800',
              textAlign: 'center',
              color: '#0f172a',
            },
          },
          {
            type: 'DividerComponent',
            displayName: 'Divisor',
            props: { color: secondary, thickness: 4, marginY: 8, style: 'solid' },
          },
          {
            type: 'TextComponent',
            displayName: 'Subtítulo Equipe',
            props: {
              text: 'Especialistas comprometidos com o sucesso do seu negócio.',
              fontSize: '16',
              fontWeight: '400',
              textAlign: 'center',
              color: '#64748b',
              margin: [0, 0, 0, 0],
            },
          },
        ],
      },
      ...cards,
    ],
  }
}

// ─── 6. CTA — call to action com fundo da cor primária ──────

function buildCta(
  perfil: PerfilEmpresa,
  primary: string,
  secondary: string,
): TemplateNode {
  const whatsappHref = perfil.whatsapp
    ? `https://wa.me/55${perfil.whatsapp.replace(/\D/g, '')}`
    : null
  const emailHref = perfil.email_contato ? `mailto:${perfil.email_contato}` : '#contato'

  // Fundo escuro da primary para maior contraste e separação visual
  const ctaBg = darken(primary, 0.35)
  const ctaTextColor = '#ffffff'
  const ctaSubText = 'rgba(255,255,255,0.75)'

  // Texto do botão adapta ao contexto
  const nomeEmpresa = perfil.nome_empresa || ''
  let ctaBtnText = 'Fale Conosco'
  if (whatsappHref) {
    ctaBtnText = 'Falar pelo WhatsApp'
  } else {
    ctaBtnText = 'Falar com um contador'
  }

  // Título CTA adapta ao nome da empresa
  const ctaTitle = nomeEmpresa
    ? `Pronto para transformar\nseu negócio com a ${nomeEmpresa}?`
    : 'Pronto para transformar\nseu negócio?'

  const ctaChildren: TemplateNode[] = [
    {
      type: 'TextComponent',
      displayName: 'Tag CTA',
      props: {
        text: 'FALE CONOSCO',
        fontSize: '13',
        fontWeight: '700',
        textAlign: 'center',
        color: secondary,
        margin: [0, 0, 12, 0],
        letterSpacing: '3',
      },
    },
    {
      type: 'HeadingComponent',
      displayName: 'Título CTA',
      props: {
        text: ctaTitle,
        tagName: 'h2',
        fontSize: '42',
        fontWeight: '800',
        textAlign: 'center',
        color: ctaTextColor,
        lineHeight: '1.15',
        maxWidth: '700',
      },
    },
    {
      type: 'TextComponent',
      displayName: 'Subtítulo CTA',
      props: {
        text: 'Entre em contato agora e descubra como podemos ajudar o seu negócio a crescer com segurança e eficiência.',
        fontSize: '17',
        fontWeight: '400',
        textAlign: 'center',
        color: ctaSubText,
        lineHeight: '1.6',
        margin: [4, 0, 24, 0],
      },
    },
    {
      type: 'ButtonComponent',
      displayName: 'Botão CTA',
      props: {
        text: ctaBtnText,
        href: whatsappHref || emailHref,
        background: secondary,
        color: isLightColor(secondary) ? '#111827' : '#ffffff',
        size: 'lg',
        buttonStyle: 'filled',
        borderRadius: 50,
      },
    },
  ]

  // Informações de contato — itens separados por ponto para melhor leitura
  const contactParts: string[] = []
  if (perfil.telefone) contactParts.push(perfil.telefone)
  if (perfil.email_contato) contactParts.push(perfil.email_contato)
  if (perfil.horario_atendimento) contactParts.push(perfil.horario_atendimento)

  if (contactParts.length > 0) {
    ctaChildren.push({
      type: 'TextComponent',
      displayName: 'Informações de Contato',
      props: {
        text: contactParts.join('  ·  '),
        fontSize: '14',
        fontWeight: '500',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.55)',
        margin: [20, 0, 0, 0],
        letterSpacing: '0.5',
      },
    })
  }

  return {
    type: 'CtaSectionComponent',
    isCanvas: true,
    displayName: 'CTA',
    props: { background: ctaBg, paddingY: 80, radius: 0, contentMaxWidth: CONTENT_MAX_WIDTH, sectionId: 'contato' },
    children: ctaChildren,
  }
}

// ─── 5.5. DEPOIMENTOS — grid de cards com estrelas ────────────

const PLACEHOLDER_DEPOIMENTOS: Depoimento[] = [
  {
    id: 'p1', perfil_empresa_id: '', nome_cliente: 'Carlos Mendes', cargo: 'Empresário',
    citacao: 'Excelente atendimento! A equipe resolveu todas as nossas pendências fiscais com agilidade e transparência. Recomendo muito.',
    nota: 5, foto_url: null, source: 'placeholder', google_review_id: null,
    ativo: true, ordem: 0, created_at: '', updated_at: '',
  },
  {
    id: 'p2', perfil_empresa_id: '', nome_cliente: 'Fernanda Oliveira', cargo: 'Diretora Administrativa',
    citacao: 'Profissionais competentes e sempre disponíveis. Nossa gestão contábil ficou muito mais tranquila desde que contratamos o escritório.',
    nota: 5, foto_url: null, source: 'placeholder', google_review_id: null,
    ativo: true, ordem: 1, created_at: '', updated_at: '',
  },
  {
    id: 'p3', perfil_empresa_id: '', nome_cliente: 'Roberto Costa', cargo: 'Sócio-proprietário',
    citacao: 'Ótima experiência. O planejamento tributário bem feito resultou em economia real para a empresa. Parceria de anos!',
    nota: 5, foto_url: null, source: 'placeholder', google_review_id: null,
    ativo: true, ordem: 2, created_at: '', updated_at: '',
  },
]

function buildDepoimentos(
  depoimentos: Depoimento[],
  _primary: string,
  secondary: string,
  sectionBg: string,
): TemplateNode {
  const itens = depoimentos.length > 0 ? depoimentos : PLACEHOLDER_DEPOIMENTOS
  const columns = itens.length >= 3 ? 3 : (itens.length as 1 | 2 | 3)

  return {
    type: 'TestimonialsGridComponent',
    displayName: 'Depoimentos',
    props: {
      depoimentos: itens.map(d => ({
        nomeCliente: d.nome_cliente,
        cargo: d.cargo || 'Cliente',
        citacao: d.citacao,
        nota: d.nota,
        accentColor: secondary,
      })),
      background: sectionBg,
      cardBackground: '#ffffff',
      accentColor: secondary,
      textColor: '#0f172a',
      paddingY: 80,
      columns,
      showStars: true,
      sectionTag: 'DEPOIMENTOS',
      sectionTitle: 'O que nossos clientes dizem',
    },
  }
}

// ─── 7. FOOTER — multi-coluna escuro com logo ────────────────

function buildFooter(
  perfil: PerfilEmpresa,
  nome: string,
  primary: string,
  _secondary: string,
): TemplateNode {
  const year = new Date().getFullYear()
  const footerBg = darken(primary, 0.65)
  const gradientTo = darken(primary, 0.40)
  const mutedText = '#9ca3af'
  const lightText = '#e2e8f0'

  // ════════════════════════════════════════════════════════════════
  // SEÇÃO SUPERIOR — Colunas opcionais (Logo+Nome | Contato | Endereço)
  // Só inclui colunas que tenham dados preenchidos
  // ════════════════════════════════════════════════════════════════
  const upperColumns: TemplateNode[] = []

  // ── Col: Logo + Nome + Slogan ──────────────────────────────
  const col1Children: TemplateNode[] = []

  if (perfil.logo_url) {
    col1Children.push({
      type: 'ImageComponent',
      displayName: 'Logo Footer',
      props: {
        src: perfil.logo_url,
        alt: nome,
        width: '80px',
        height: '80px',
        objectFit: 'contain',
        borderRadius: 8,
        backgroundColor: 'transparent',
      },
    })
  }

  col1Children.push({
    type: 'TextComponent',
    displayName: 'Nome Footer',
    props: {
      text: nome,
      fontSize: '18',
      fontWeight: '700',
      textAlign: 'left',
      color: '#ffffff',
      margin: [8, 0, 0, 0],
    },
  })

  if (perfil.slogan) {
    col1Children.push({
      type: 'TextComponent',
      displayName: 'Slogan Footer',
      props: {
        text: perfil.slogan,
        fontSize: '14',
        fontWeight: '400',
        textAlign: 'left',
        color: mutedText,
        lineHeight: '1.5',
        margin: [2, 0, 0, 0],
      },
    })
  }

  upperColumns.push({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Col Footer – Marca',
    props: {
      background: 'transparent',
      padding: 0,
      gap: 6,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      shadow: 0,
      radius: 0,
    },
    children: col1Children,
  })

  // ── Col: Contato (só se houver dados) ──────────────────────
  const contactLines: string[] = []
  if (perfil.telefone) contactLines.push(perfil.telefone)
  if (perfil.whatsapp && perfil.whatsapp !== perfil.telefone) contactLines.push(`WhatsApp: ${perfil.whatsapp}`)
  if (perfil.email_contato) contactLines.push(perfil.email_contato)
  if (perfil.horario_atendimento) contactLines.push(perfil.horario_atendimento)

  if (contactLines.length > 0) {
    upperColumns.push({
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: 'Col Footer – Contato',
      props: {
        background: 'transparent',
        padding: 0,
        gap: 0,
        width: '100%',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        shadow: 0,
        radius: 0,
      },
      children: [
        {
          type: 'TextComponent',
          displayName: 'Título Contato',
          props: {
            text: 'Contato',
            fontSize: '14',
            fontWeight: '700',
            textAlign: 'left',
            color: lightText,
            margin: [0, 0, 8, 0],
            letterSpacing: '1',
          },
        },
        {
          type: 'TextComponent',
          displayName: 'Dados Contato',
          props: {
            text: contactLines.join('\n'),
            fontSize: '13',
            fontWeight: '400',
            textAlign: 'left',
            color: mutedText,
            lineHeight: '1.8',
            margin: [0, 0, 0, 0],
          },
        },
      ],
    })
  }

  // ── Col: Endereço (só se houver dados) ─────────────────────
  const addrLines: string[] = []
  if (perfil.logradouro) {
    let addr = perfil.logradouro
    if (perfil.numero) addr += `, ${perfil.numero}`
    addrLines.push(addr)
  }
  if (perfil.bairro) addrLines.push(perfil.bairro)
  if (perfil.cidade && perfil.estado) {
    let cityLine = `${perfil.cidade}/${perfil.estado}`
    if (perfil.cep) cityLine += ` - CEP ${perfil.cep}`
    addrLines.push(cityLine)
  }

  if (addrLines.length > 0) {
    upperColumns.push({
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: 'Col Footer – Endereço',
      props: {
        background: 'transparent',
        padding: 0,
        gap: 0,
        width: '100%',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        shadow: 0,
        radius: 0,
      },
      children: [
        {
          type: 'TextComponent',
          displayName: 'Título Endereço',
          props: {
            text: 'Endereço',
            fontSize: '14',
            fontWeight: '700',
            textAlign: 'left',
            color: lightText,
            margin: [0, 0, 8, 0],
            letterSpacing: '1',
          },
        },
        {
          type: 'TextComponent',
          displayName: 'Dados Endereço',
          props: {
            text: addrLines.join('\n'),
            fontSize: '13',
            fontWeight: '400',
            textAlign: 'left',
            color: mutedText,
            lineHeight: '1.8',
            margin: [0, 0, 0, 0],
          },
        },
      ],
    })
  }

  // ════════════════════════════════════════════════════════════════
  // SEÇÃO INFERIOR — Dados obrigatórios centralizados
  // (Redes Sociais + Copyright — sempre presente)
  // ════════════════════════════════════════════════════════════════
  const bottomChildren: TemplateNode[] = []

  // ── Redes sociais (ícones) ──────────────────────────────────
  const socialLinks: Array<{ platform: string; url: string }> = []
  if (perfil.redes_sociais?.instagram) {
    const handle = perfil.redes_sociais.instagram.replace(/@/g, '')
    socialLinks.push({ platform: 'instagram', url: `https://instagram.com/${handle}` })
  }
  if (perfil.redes_sociais?.facebook) {
    const fb = perfil.redes_sociais.facebook
    const fbUrl = fb.startsWith('http') ? fb : `https://facebook.com/${fb}`
    socialLinks.push({ platform: 'facebook', url: fbUrl })
  }
  if (perfil.redes_sociais?.linkedin) {
    const li = perfil.redes_sociais.linkedin
    const liUrl = li.startsWith('http') ? li : `https://linkedin.com/company/${li}`
    socialLinks.push({ platform: 'linkedin', url: liUrl })
  }
  if (perfil.redes_sociais?.youtube) {
    const yt = perfil.redes_sociais.youtube
    const ytUrl = yt.startsWith('http') ? yt : `https://youtube.com/${yt}`
    socialLinks.push({ platform: 'youtube', url: ytUrl })
  }
  if (perfil.redes_sociais?.twitter) {
    const tw = perfil.redes_sociais.twitter
    const twUrl = tw.startsWith('http') ? tw : `https://x.com/${tw}`
    socialLinks.push({ platform: 'twitter', url: twUrl })
  }
  if (perfil.redes_sociais?.site) {
    const site = perfil.redes_sociais.site
    const siteUrl = site.startsWith('http') ? site : `https://${site}`
    socialLinks.push({ platform: 'site', url: siteUrl })
  }

  if (socialLinks.length > 0) {
    bottomChildren.push({
      type: 'SocialLinksComponent',
      displayName: 'Redes Sociais',
      props: {
        links: socialLinks,
        iconColor: mutedText,
        iconSize: 20,
        gap: 20,
        justifyContent: 'center',
      },
    })
  }

  // ── Copyright (sempre presente, centralizado) ───────────────
  const copyrightParts = [nome]
  if (perfil.cnpj) copyrightParts.push(`CNPJ: ${perfil.cnpj}`)
  copyrightParts.push(`© ${year}. Todos os direitos reservados.`)

  bottomChildren.push({
    type: 'TextComponent',
    displayName: 'Copyright',
    props: {
      text: copyrightParts.join('  ·  '),
      fontSize: '12',
      fontWeight: '400',
      textAlign: 'center',
      color: 'rgba(255,255,255,0.35)',
      margin: [0, 0, 0, 0],
    },
  })

  // ════════════════════════════════════════════════════════════════
  // MONTAGEM FINAL — Seção superior (cols) + Divider + Seção inferior (centralizada)
  // ════════════════════════════════════════════════════════════════
  const footerChildren: TemplateNode[] = [
    ...upperColumns,
    {
      type: 'DividerComponent',
      displayName: 'Divider Footer',
      props: {
        color: 'rgba(255,255,255,0.1)',
        thickness: 1,
        marginY: 8,
        style: 'solid',
      },
    },
    {
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: 'Rodapé Inferior',
      props: {
        background: 'transparent',
        padding: 0,
        gap: 12,
        width: '100%',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        shadow: 0,
        radius: 0,
      },
      children: bottomChildren,
    },
  ]

  // Colunas adaptativas: depende de quantas colunas opcionais existem
  const numCols = upperColumns.length

  return {
    type: 'FooterComponent',
    isCanvas: true,
    displayName: 'Rodapé',
    props: {
      background: footerBg,
      gradientFrom: footerBg,
      gradientTo,
      gradientType: 'linear' as const,
      gradientDirection: '135deg',
      paddingY: 56,
      columns: numCols,
      contentMaxWidth: CONTENT_MAX_WIDTH,
    },
    children: footerChildren,
  }
}
