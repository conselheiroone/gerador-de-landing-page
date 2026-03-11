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

import type { PerfilEmpresa, Socio, Depoimento, ServicoItem, SegmentoItem } from '@/features/onboarding/types/onboarding.types'
import { buildCraftJson, type TemplateNode } from './default-templates'
import {
  generatePalette,
  type ColorPalette,
  // Re-exporta funções de cor para compatibilidade
  hexToRgb,
  rgbToHex,
  lighten,
  darken,
  isLightColor,
} from './color-palette'

// Re-exporta para compatibilidade com código existente
export { hexToRgb, rgbToHex, lighten, darken, isLightColor }

/** Largura máxima do conteúdo das seções (bg fica full-width) */
const CONTENT_MAX_WIDTH = '1200px'

// ─── Descrições específicas para serviços contábeis ──────────
// Usadas como fallback quando o usuário não preenche descrição
const SERVICE_DESCRIPTIONS: Record<string, string> = {
  'Abertura e Encerramento de Empresas': 'Assessoria completa para abertura, alteração e encerramento de empresas, incluindo registro em órgãos competentes e obtenção de licenças.',
  'Contabilidade Mensal': 'Escrituração contábil completa, balancetes mensais e relatórios gerenciais para acompanhamento da saúde financeira do seu negócio.',
  'Folha de Pagamento': 'Processamento completo da folha de pagamento, admissões, rescisões, férias e gestão de encargos trabalhistas.',
  'Escrituração Fiscal': 'Apuração de impostos, escrituração de livros fiscais e cumprimento de todas as obrigações tributárias da sua empresa.',
  'Declaração de Imposto de Renda': 'Elaboração e transmissão de declarações de IR para pessoas físicas e jurídicas com planejamento para otimização tributária.',
  'Planejamento Tributário': 'Análise e implementação de estratégias legais para redução da carga tributária e otimização fiscal do seu negócio.',
  'BPO Financeiro': 'Terceirização completa do departamento financeiro: contas a pagar, a receber, conciliação bancária e gestão de fluxo de caixa.',
  'Certidões e Regularizações': 'Obtenção de certidões negativas, regularização de pendências fiscais e trabalhistas junto aos órgãos competentes.',
  'Consultoria Empresarial': 'Orientação estratégica para tomada de decisões, análise de viabilidade e acompanhamento do desempenho empresarial.',
  'Obrigações Acessórias': 'Transmissão de SPED, EFD, DCTF, DIRF e demais declarações exigidas pelos fiscos federal, estadual e municipal.',
  'Lucro Real / Presumido / Simples': 'Enquadramento tributário adequado e gestão contábil específica para cada regime de tributação.',
  'Balanços e Demonstrações': 'Elaboração de balanços patrimoniais, DRE, fluxo de caixa e demais demonstrações contábeis obrigatórias.',
  'Auditoria Contábil': 'Revisão e validação dos registros contábeis, identificação de inconsistências e recomendações de melhorias.',
  'Recuperação de Créditos Tributários': 'Identificação e recuperação de tributos pagos a maior, aproveitamento de créditos e compensações fiscais.',
  // Variações comuns
  'Abertura de Empresas': 'Assessoria completa para abertura de empresas, incluindo registro em órgãos competentes e obtenção de alvarás e licenças.',
  'Encerramento de Empresas': 'Processo completo de baixa de empresas junto aos órgãos fiscais, trabalhistas e demais entidades.',
  'Imposto de Renda': 'Elaboração e transmissão de declarações de IR para pessoas físicas e jurídicas com orientação personalizada.',
  'Imposto de Renda PF': 'Declaração de Imposto de Renda para pessoas físicas com análise de deduções e planejamento tributário.',
  'Imposto de Renda PJ': 'Apuração e declaração do IRPJ com planejamento tributário para otimização da carga fiscal.',
  'Consultoria Tributária': 'Orientação especializada em questões fiscais, análise de cenários e definição de estratégias tributárias.',
  'Contabilidade Digital': 'Serviços contábeis 100% online com plataformas modernas, agilidade e atendimento personalizado.',
  'Contabilidade Rural': 'Assessoria contábil especializada para produtores rurais, com foco em benefícios fiscais do setor.',
  'Departamento Pessoal': 'Gestão completa de rotinas trabalhistas, admissões, rescisões, férias e obrigações acessórias.',
  'Gestão Fiscal': 'Acompanhamento e controle das obrigações fiscais, evitando multas e otimizando a carga tributária.',
  'Legalização de Empresas': 'Regularização de empresas junto aos órgãos competentes, obtenção de licenças e alvarás de funcionamento.',
  'Perícia Contábil': 'Elaboração de laudos periciais contábeis para processos judiciais e extrajudiciais.',
  'Contabilidade Societária': 'Assessoria em operações societárias, transformações, fusões, cisões e incorporações.',
}

/**
 * Retorna a descrição de um serviço.
 * Prioridade: descrição do usuário > descrição do mapa > fallback genérico baseado no nome
 */
function getServiceDescription(nome: string, descricaoUsuario?: string): string {
  // Se o usuário preencheu descrição, usa ela
  if (descricaoUsuario && descricaoUsuario.trim()) {
    return descricaoUsuario
  }

  // Busca no mapa de descrições (case-insensitive)
  const nomeNormalizado = nome.trim()
  const descricaoMapa = SERVICE_DESCRIPTIONS[nomeNormalizado]
  if (descricaoMapa) {
    return descricaoMapa
  }

  // Busca parcial (se o nome contém alguma chave do mapa)
  const chaveEncontrada = Object.keys(SERVICE_DESCRIPTIONS).find(chave =>
    nomeNormalizado.toLowerCase().includes(chave.toLowerCase()) ||
    chave.toLowerCase().includes(nomeNormalizado.toLowerCase())
  )
  if (chaveEncontrada) {
    return SERVICE_DESCRIPTIONS[chaveEncontrada]
  }

  // Fallback genérico contextualizado com o nome do serviço
  return `Serviço de ${nome.toLowerCase()} com atendimento especializado, focado em qualidade e resultados para o seu negócio.`
}

// ─── Ícones Lucide específicos para serviços contábeis ───────
// Nomes correspondem ao ICON_MAP do IconComponent
const SERVICE_ICONS: Record<string, string> = {
  // Abertura/Encerramento
  'Abertura e Encerramento de Empresas': 'building',
  'Abertura de Empresas': 'rocket',
  'Encerramento de Empresas': 'folder',
  'Legalização de Empresas': 'badgecheck',
  // Contabilidade
  'Contabilidade Mensal': 'barchart',
  'Contabilidade Digital': 'calculator',
  'Contabilidade Rural': 'spreadsheet',
  'Contabilidade Societária': 'users',
  // Fiscal/Tributário
  'Escrituração Fiscal': 'filepen',
  'Gestão Fiscal': 'clipboardcheck',
  'Planejamento Tributário': 'trending',
  'Consultoria Tributária': 'target',
  'Recuperação de Créditos Tributários': 'handcoins',
  // Imposto de Renda
  'Declaração de Imposto de Renda': 'filetext',
  'Imposto de Renda': 'filetext',
  'Imposto de Renda PF': 'usercheck',
  'Imposto de Renda PJ': 'building2',
  // Trabalhista
  'Folha de Pagamento': 'users',
  'Departamento Pessoal': 'usercog',
  // Financeiro
  'BPO Financeiro': 'wallet',
  // Obrigações
  'Obrigações Acessórias': 'clipboardlist',
  'Certidões e Regularizações': 'scroll',
  // Outros
  'Consultoria Empresarial': 'briefcase',
  'Lucro Real / Presumido / Simples': 'scale',
  'Balanços e Demonstrações': 'piechart',
  'Auditoria Contábil': 'search',
  'Perícia Contábil': 'scale',
}

// Ícones fallback por categoria (usados quando não há match exato)
const FALLBACK_ICONS = ['barchart', 'filetext', 'briefcase', 'trending', 'building', 'dollar', 'clipboardlist', 'target', 'scale', 'check']

/**
 * Retorna o nome do ícone Lucide apropriado para um serviço.
 */
function getServiceIcon(nome: string, index: number): string {
  const nomeNormalizado = nome.trim()

  // Busca exata
  if (SERVICE_ICONS[nomeNormalizado]) {
    return SERVICE_ICONS[nomeNormalizado]
  }

  // Busca parcial por palavras-chave
  const nomeLower = nomeNormalizado.toLowerCase()
  if (nomeLower.includes('abertura') || nomeLower.includes('encerramento')) return 'building'
  if (nomeLower.includes('imposto') || nomeLower.includes('irpf') || nomeLower.includes('irpj')) return 'filetext'
  if (nomeLower.includes('folha') || nomeLower.includes('pagamento') || nomeLower.includes('pessoal')) return 'users'
  if (nomeLower.includes('fiscal') || nomeLower.includes('escrituração')) return 'filepen'
  if (nomeLower.includes('tributár') || nomeLower.includes('planejamento')) return 'trending'
  if (nomeLower.includes('bpo') || nomeLower.includes('financeiro')) return 'wallet'
  if (nomeLower.includes('certid') || nomeLower.includes('regulariz')) return 'scroll'
  if (nomeLower.includes('obrigaç') || nomeLower.includes('acessóri')) return 'clipboardlist'
  if (nomeLower.includes('consultoria')) return 'briefcase'
  if (nomeLower.includes('auditoria')) return 'search'
  if (nomeLower.includes('contabil')) return 'barchart'
  if (nomeLower.includes('balanço') || nomeLower.includes('demonstra')) return 'piechart'
  if (nomeLower.includes('recupera') || nomeLower.includes('crédito')) return 'handcoins'

  // Fallback baseado no índice
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length]
}

// ─── Assets estáticos do template ────────────────────────────
const ASSETS = {
  heroBg: '/assets/hero-bg.jpg',
  heroProfessional: '/assets/hero-professional.png',
  aboutOffice: '/assets/about-office.jpg',
  ctaBg: '/assets/cta-bg.jpg',
}

/** Imagem padrão de contabilidade para o hero (parallax) */
const DEFAULT_HERO_IMAGE = ASSETS.heroBg

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

  // ─── Gera paleta completa de cores harmônicas ───
  const palette = generatePalette(primary, secondary)

  // Aliases para compatibilidade com código existente
  const tintPri = palette.primaryTint      // fundo com toque primário visível
  const tintSec = palette.secondaryTint    // fundo com toque secundário visível

  const sections: TemplateNode[] = []

  // 0. Navbar — barra de navegação com logo, links e WhatsApp
  sections.push(buildNavbar(perfil, nome, palette))

  // 1. Hero — gradiente escuro profissional
  sections.push(buildHero(perfil, nome, slogan, palette))

  // 1.5. Stats — strip numérico entre hero e serviços
  const statsSection = buildStats(perfil, socios, palette)
  if (statsSection) sections.push(statsSection)

  // 2. Serviços — fundo branco (respiro após hero escuro)
  if (perfil.servicos && perfil.servicos.length > 0) {
    sections.push(buildServicos(perfil.servicos, palette, '#ffffff'))
  }

  // 2.5. Segmentos de Atuação — seção com cards animados (dados do perfil)
  if (perfil.segmentos && perfil.segmentos.length > 0) {
    sections.push(buildSegmentos(perfil.segmentos, palette, tintPri))
  }

  // 3. Sobre — fundo branco
  if (perfil.historia || perfil.missao || perfil.visao || perfil.valores) {
    sections.push(buildSobre(perfil, nome, palette, '#ffffff'))
  }

  // 4. Diferenciais — fundo tintSec (seção SECONDARY)
  if (perfil.diferenciais && perfil.diferenciais.length > 0) {
    sections.push(buildDiferenciais(perfil.diferenciais, palette, tintSec))
  }

  // 5. Equipe — fundo branco (respiro)
  const sociosVisiveis = socios.filter(s => s.exibir_landing_page)
  if (sociosVisiveis.length > 0) {
    sections.push(buildEquipe(sociosVisiveis, palette, '#ffffff'))
  }

  // 5.5. Depoimentos — fundo tintPri (sempre incluído: reais ou placeholders)
  const depoimentosAtivos = depoimentos?.filter(d => d.ativo) ?? []
  sections.push(buildDepoimentos(depoimentosAtivos, palette, tintPri))

  // 6. CTA — fundo primário (destaque intencional)
  sections.push(buildCta(perfil, palette))

  // 7. Footer — escuro padrão com acento da secundária
  sections.push(buildFooter(perfil, nome, palette))

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
  palette: ColorPalette,
): TemplateNode {
  const hasLogo = !!perfil.logo_url

  return {
    type: 'NavbarComponent',
    displayName: 'Navbar',
    props: {
      background: palette.navbarBg,
      backdropBlur: 0,
      borderBottom: 'none',
      logoText: nome,
      logoSrc: perfil.logo_url || '',
      logoWidth: hasLogo ? 140 : undefined,
      logoHeight: hasLogo ? 48 : 44,
      logoBg: hasLogo ? palette.cardBackground : 'transparent',
      logoShape: hasLogo ? 'pill' : 'pill',
      showLogoText: false,
      links: [
        { label: 'Início', href: '#' },
        ...(perfil.servicos?.length ? [{ label: 'Serviços', href: '#servicos' }] : []),
        ...(perfil.segmentos?.length ? [{ label: 'Segmentos', href: '#segmentos' }] : []),
        { label: 'Sobre', href: '#sobre' },
        { label: 'Equipe', href: '#equipe' },
      ],
      ctaText: 'Fale Conosco',
      ctaBg: palette.primary,
      ctaColor: palette.textOnPrimary,
      ctaBorderRadius: 8,
      linkColor: palette.textOnDark,
      linkFontSize: 14,
      paddingX: 40,
      paddingY: 16,
      contentMaxWidth: CONTENT_MAX_WIDTH,
    },
  }
}

// ─── 1. HERO — Layout split profissional ─────────────────────

function buildHero(
  perfil: PerfilEmpresa,
  nome: string,
  slogan: string,
  palette: ColorPalette,
): TemplateNode {
  const whatsappHref = perfil.whatsapp
    ? `https://wa.me/55${perfil.whatsapp.replace(/\D/g, '')}`
    : null
  const emailHref = perfil.email_contato ? `mailto:${perfil.email_contato}` : '#contato'

  const heroImage = perfil.usar_imagem_hero
    ? (perfil.hero_image_url || DEFAULT_HERO_IMAGE)
    : null

  if (perfil.logo_url) {
    return buildHeroSplit(perfil, nome, slogan, palette, whatsappHref, emailHref, heroImage)
  }
  return buildHeroCentered(nome, slogan, palette, whatsappHref, emailHref, null, heroImage)
}

function buildHeroSplit(
  perfil: PerfilEmpresa,
  nome: string,
  slogan: string,
  palette: ColorPalette,
  whatsappHref: string | null,
  _emailHref: string,
  _heroImage: string | null,
): TemplateNode {
  // Cores do template de referência
  const gradientFrom = palette.primaryDark

  // ─── COLUNA ESQUERDA: Texto ─────────────────────────────────
  const textChildren: TemplateNode[] = []

  // Badge: "Desde {ano} · {CIDADE}, {ESTADO}"
  const badgeParts: string[] = []
  if (perfil.ano_fundacao) badgeParts.push(`Desde ${perfil.ano_fundacao}`)
  if (perfil.cidade && perfil.estado) badgeParts.push(`${perfil.cidade}, ${perfil.estado}`)
  if (badgeParts.length > 0) {
    textChildren.push({
      type: 'BadgeComponent',
      displayName: 'Badge Hero',
      props: {
        text: badgeParts.join('  ·  '),
        badgeStyle: 'filled',
        color: palette.secondaryAlpha90,
        backgroundColor: palette.secondaryAlpha90,
        fontSize: 13,
        fontWeight: 600,
        borderRadius: 50,
        paddingX: 20,
        paddingY: 10,
        textTransform: 'none',
        letterSpacing: 0,
        marginBottom: 28,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${palette.borderOnDark}`,
      },
    })
  }

  // Título: Nome da empresa
  textChildren.push({
    type: 'HeadingComponent',
    displayName: 'Nome da Empresa',
    props: {
      text: nome,
      tagName: 'h1',
      fontSize: '56',
      fontWeight: '900',
      textAlign: 'left',
      color: palette.textOnDark,
      lineHeight: '1.1',
      letterSpacing: '-2',
      margin: [0, 0, 20, 0],
    },
  })

  // Slogan
  textChildren.push({
    type: 'TextComponent',
    displayName: 'Slogan',
    props: {
      text: slogan,
      fontSize: '20',
      fontWeight: '400',
      textAlign: 'left',
      color: palette.textMutedOnDark,
      lineHeight: '1.5',
      maxWidth: '480px',
      margin: [0, 0, 16, 0],
    },
  })

  // Contato: telefone e email
  const contactParts: TemplateNode[] = []
  if (perfil.telefone) {
    contactParts.push({
      type: 'TextComponent',
      displayName: 'Telefone',
      props: {
        text: `📞 ${perfil.telefone}`,
        fontSize: '15',
        fontWeight: '400',
        textAlign: 'left',
        color: palette.textMutedOnDark,
      },
    })
  }
  if (perfil.email_contato) {
    contactParts.push({
      type: 'TextComponent',
      displayName: 'Email',
      props: {
        text: `✉️ ${perfil.email_contato}`,
        fontSize: '15',
        fontWeight: '400',
        textAlign: 'left',
        color: palette.textMutedOnDark,
      },
    })
  }

  if (contactParts.length > 0) {
    textChildren.push({
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: 'Contato Hero',
      props: {
        background: 'transparent',
        padding: 0,
        gap: 16,
        width: 'auto',
        height: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        shadow: 0,
        radius: 0,
        marginBottom: 32,
      },
      children: contactParts,
    })
  }

  // Botão WhatsApp
  if (whatsappHref) {
    textChildren.push({
      type: 'ButtonComponent',
      displayName: 'WhatsApp',
      props: {
        text: 'Falar no WhatsApp',
        href: whatsappHref,
        background: palette.secondary,
        color: palette.textOnSecondary,
        size: 'lg',
        buttonStyle: 'filled',
        borderRadius: 50,
        icon: 'whatsapp',
      },
    })
  }

  // Features: badges de destaque com ícone visual
  const currentYear = new Date().getFullYear()
  const anosExp = perfil.ano_fundacao ? currentYear - perfil.ano_fundacao : null
  const features: string[] = []
  if (anosExp && anosExp > 0) features.push(`${anosExp}+ anos`)
  features.push('100% digital')
  features.push('Atendimento nacional')

  textChildren.push({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Features Hero',
    props: {
      background: 'transparent',
      padding: 0,
      gap: 32,
      width: 'auto',
      height: 'auto',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
      shadow: 0,
      radius: 0,
      marginTop: 40,
    },
    children: features.map((feat, i) => ({
      type: 'ContainerComponent',
      isCanvas: false,
      displayName: `Feature ${i + 1}`,
      props: {
        background: 'transparent',
        padding: 0,
        gap: 8,
        width: 'auto',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        shadow: 0,
        radius: 0,
      },
      children: [
        {
          type: 'ContainerComponent',
          isCanvas: false,
          displayName: 'Ícone Feature',
          props: {
            background: 'rgba(255, 255, 255, 0.15)',
            padding: 0,
            gap: 0,
            width: '32px',
            height: '32px',
            minHeight: 32,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadow: 0,
            radius: 8,
          },
          children: [
            {
              type: 'TextComponent',
              displayName: 'Check',
              props: {
                text: '✓',
                fontSize: '14',
                fontWeight: '700',
                color: palette.textOnDark,
                textAlign: 'center',
                lineHeight: '1',
                margin: [0, 0, 0, 0],
              },
            },
          ],
        },
        {
          type: 'TextComponent',
          displayName: 'Texto Feature',
          props: {
            text: feat,
            fontSize: '13',
            fontWeight: '500',
            textAlign: 'center',
            color: palette.textMutedOnDark,
          },
        },
      ],
    })),
  })

  // Coluna de texto
  const leftColumn: TemplateNode = {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Texto Hero',
    props: {
      background: 'transparent',
      padding: 0,
      gap: 16,
      width: 'auto',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      shadow: 0,
      radius: 0,
      flex: '1 1 400px',
      minWidth: '320px',
    },
    children: textChildren,
  }

  // ─── COLUNA DIREITA: Imagem com cards flutuantes ────────────
  // Monta os cards flutuantes para incluir no wrapper
  const floatingCards: TemplateNode[] = []

  // Card flutuante: Anos de experiência (lado esquerdo/baixo)
  if (anosExp && anosExp > 0) {
    floatingCards.push({
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: 'Card Experiência',
      props: {
        background: 'rgba(255, 255, 255, 0.95)',
        padding: 16,
        paddingX: 20,
        gap: 4,
        width: 'auto',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        shadow: 0,
        radius: 12,
        position: 'absolute',
        bottom: '60px',
        left: '-30px',
        zIndex: 3,
        backdropFilter: 'blur(10px)',
        boxShadowCustom: '0 10px 30px rgba(0, 0, 0, 0.15)',
        animationPreset: 'float',
      },
      children: [
        {
          type: 'TextComponent',
          displayName: 'Número Experiência',
          props: {
            text: `${anosExp}+`,
            fontSize: '28',
            fontWeight: '800',
            textAlign: 'center',
            color: palette.primary,
            lineHeight: '1',
          },
        },
        {
          type: 'TextComponent',
          displayName: 'Label Experiência',
          props: {
            text: 'Anos de experiência',
            fontSize: '12',
            fontWeight: '600',
            textAlign: 'center',
            color: palette.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.5',
          },
        },
      ],
    })
  }

  // Card flutuante: Clientes atendidos (lado direito/topo)
  floatingCards.push({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Card Clientes',
    props: {
      background: 'rgba(255, 255, 255, 0.95)',
      padding: 16,
      paddingX: 20,
      gap: 4,
      width: 'auto',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      shadow: 0,
      radius: 12,
      position: 'absolute',
      top: '100px',
      right: '-20px',
      zIndex: 3,
      backdropFilter: 'blur(10px)',
      boxShadowCustom: '0 10px 30px rgba(0, 0, 0, 0.15)',
      animationPreset: 'float',
    },
    children: [
      {
        type: 'TextComponent',
        displayName: 'Número Clientes',
        props: {
          text: '500+',
          fontSize: '28',
          fontWeight: '800',
          textAlign: 'center',
          color: palette.primary,
          lineHeight: '1',
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Label Clientes',
        props: {
          text: 'Clientes atendidos',
          fontSize: '12',
          fontWeight: '600',
          textAlign: 'center',
          color: palette.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.5',
        },
      },
    ],
  })

  // Container da imagem com decoração e cards flutuantes
  const rightColumnChildren: TemplateNode[] = [
    {
      type: 'ContainerComponent',
      isCanvas: false,
      displayName: 'Wrapper Imagem Hero',
      props: {
        background: 'transparent',
        padding: 0,
        gap: 0,
        width: '100%',
        maxWidth: '550px',
        height: 'auto', // Auto-size to image content (igual ao HTML ref: .hero-image-wrapper sem height explícito)
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        shadow: 0,
        radius: 0,
        position: 'relative',
      },
      children: [
        // Imagem do profissional
        {
          type: 'ImageComponent',
          displayName: 'Imagem Hero',
          props: {
            src: ASSETS.heroProfessional,
            alt: 'Profissional',
            width: '100%',
            maxWidth: '550px',
            height: '690px',
            objectFit: 'contain',
            borderRadius: '20px 20px 0 0',
            boxShadow: '0 -10px 60px rgba(0, 0, 0, 0.3)',
            zIndex: 2,
          },
        },
        // Frame decorativo ao redor da imagem (z-index 1 para ficar ATRÁS da imagem z-index 2)
        {
          type: 'ContainerComponent',
          isCanvas: false,
          displayName: 'Frame Decorativo',
          props: {
            background: 'transparent',
            padding: 0,
            gap: 0,
            width: '70%',
            height: '75%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            shadow: 0,
            radius: 0,
            position: 'absolute',
            bottom: '0',
            left: '50%',
            zIndex: 1,
            border: '3px solid rgba(255, 255, 255, 0.2)',
            borderBottom: 'none',
            borderRadiusCustom: '20px 20px 0 0',
            transform: 'translateX(-50%)',
            minHeight: 0,
          },
          children: [],
        },
        // Cards flutuantes (DENTRO do wrapper para posicionamento correto)
        ...floatingCards,
      ],
    },
  ]

  // Coluna da imagem (espelha .hero-image-section { height: 100%; align-items: flex-end })
  const rightColumn: TemplateNode = {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Imagem Hero',
    props: {
      background: 'transparent',
      padding: 0,
      gap: 0,
      width: 'auto',
      height: '100%', // Preenche a altura do grid (igual ao HTML ref)
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      shadow: 0,
      radius: 0,
      position: 'relative',
      flex: '1 1 400px',
      minWidth: '320px',
    },
    children: rightColumnChildren,
  }

  // Grid de duas colunas
  const heroGrid: TemplateNode = {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Hero Grid',
    props: {
      background: 'transparent',
      padding: 0,
      gap: 40,
      width: '100%',
      height: '100%',
      flexDirection: 'row',
      alignItems: 'stretch', // Estica colunas para altura total (igual ao HTML ref: .hero-grid { height: 100% })
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      shadow: 0,
      radius: 0,
      flex: '1 1 auto', // Cresce para preencher o hero (igual ao HTML ref: .hero-content { height: 100% })
    },
    children: [leftColumn, rightColumn],
  }

  // Overlay com gradiente duplo como no HTML de referência
  const overlayGradient = palette.heroOverlay

  return {
    type: 'HeroSectionComponent',
    isCanvas: true,
    displayName: 'Hero',
    props: {
      background: gradientFrom,
      gradientFrom: '',
      gradientTo: '',
      gradientDirection: '135deg',
      backgroundImage: ASSETS.heroBg,
      overlayOpacity: 0.85,
      // Usa gradiente como overlay para efeito visual idêntico ao HTML
      overlayColor: overlayGradient,
      paddingY: 70,
      paddingTop: 70,
      paddingBottom: 0, // Sem espaçamento para colar na stats band
      minHeight: 600,
      minHeightCalc: 'calc(100vh - 156px)', // Hero + Stats = 100vh (stats: 80px padding + ~76px conteúdo)
      textAlign: 'left',
      contentMaxWidth: CONTENT_MAX_WIDTH,
    },
    children: [heroGrid],
  }
}

function buildHeroCentered(
  nome: string,
  slogan: string,
  palette: ColorPalette,
  whatsappHref: string | null,
  emailHref: string,
  areaAtuacao: string | null,
  heroImage: string | null,
): TemplateNode {
  const gradientFrom = palette.primaryDarker
  const gradientTo = palette.primaryDark

  const children: TemplateNode[] = [
    {
      type: 'TextComponent',
      displayName: 'Área de Atuação',
      props: {
        text: areaAtuacao ? areaAtuacao.toUpperCase() : 'CONTABILIDADE & ASSESSORIA',
        fontSize: '12',
        fontWeight: '700',
        textAlign: 'center',
        color: palette.secondary,
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
        color: palette.textOnDark,
      },
    },
    {
      type: 'DividerComponent',
      displayName: 'Acento',
      props: { color: palette.secondary, thickness: 4, marginY: 12, style: 'solid' },
    },
    {
      type: 'TextComponent',
      displayName: 'Slogan',
      props: {
        text: slogan,
        fontSize: '22',
        fontWeight: '300',
        textAlign: 'center',
        color: palette.textMutedOnDark,
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
      background: palette.secondary,
      color: palette.textOnSecondary,
      size: 'lg',
      buttonStyle: 'filled',
      borderRadius: 10,
      icon: whatsappHref ? 'whatsapp' : undefined,
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
  palette: ColorPalette,
): TemplateNode | null {
  const currentYear = new Date().getFullYear()
  const stats: Array<{ valor: string; label: string }> = []

  if (perfil.ano_fundacao && perfil.ano_fundacao < currentYear) {
    const anos = currentYear - perfil.ano_fundacao
    stats.push({ valor: `${anos}`, label: 'Anos de Experiência' })
  }

  if (perfil.servicos && perfil.servicos.length > 0) {
    const n = perfil.servicos.length
    stats.push({ valor: `${n}`, label: n === 1 ? 'Serviço Oferecido' : 'Serviços Oferecidos' })
  }

  const sociosVisiveis = socios.filter(s => s.exibir_landing_page)
  if (sociosVisiveis.length > 0) {
    const n = sociosVisiveis.length
    stats.push({ valor: `${n}`, label: n === 1 ? 'Especialista Dedicado' : 'Especialistas Dedicados' })
  }

  // Sempre adiciona clientes atendidos para manter consistência
  if (stats.length < 3) {
    stats.push({ valor: '500+', label: 'Clientes Atendidos' })
  }

  if (stats.length < 2) return null

  return {
    type: 'StatsBandComponent',
    displayName: 'Números',
    props: {
      background: palette.statsBg,
      textColor: palette.textOnDark,
      accentColor: palette.textOnDark,
      labelColor: palette.textMutedOnDark,
      paddingY: 40,
      showDivider: true,
      stats,
      fontSize: 56,
      labelFontSize: 12,
      fontWeight: '900',
      labelTextTransform: 'uppercase',
      labelLetterSpacing: 2,
      // Efeito glow como no HTML de referência
      showGlow: true,
    },
  }
}

// ─── 2. SERVIÇOS — cards modernos com acento ─────────────────

function buildServicos(
  servicos: PerfilEmpresa['servicos'],
  palette: ColorPalette,
  sectionBg: string,
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
            color: palette.secondary,
            letterSpacing: '2',
            margin: [0, 0, 8, 0],
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
            color: palette.textOnLight,
          },
        },
        {
          type: 'DividerComponent',
          displayName: 'Divisor Serviços',
          props: { color: palette.secondary, thickness: 4, marginY: 16, style: 'solid', width: '60px' },
        },
        {
          type: 'TextComponent',
          displayName: 'Subtítulo Serviços',
          props: {
            text: 'Soluções contábeis completas para empresas de todos os segmentos e portes.',
            fontSize: '16',
            fontWeight: '400',
            textAlign: 'center',
            color: palette.textMuted,
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
      background: palette.cardBackground,
      padding: 28,
      gap: 12,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      shadow: 2,
      radius: 16,
      borderAccent: palette.secondary,
      borderAccentPosition: 'top',
    },
    children: [
      {
        type: 'ContainerComponent',
        isCanvas: false,
        displayName: 'Wrapper Ícone',
        props: {
          background: 'transparent',
          padding: 0,
          gap: 0,
          width: '100%',
          height: 'auto',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          shadow: 0,
          radius: 0,
          marginBottom: 16,
        },
        children: [
          {
            type: 'IconComponent',
            displayName: 'Ícone Serviço',
            props: {
              icon: getServiceIcon(servico.nome, i),
              size: 28,
              color: palette.textOnSecondary,
              backgroundColor: palette.secondary,
              shape: 'rounded',
              padding: 14,
              weight: 'regular',
            },
          },
        ],
      },
      {
        type: 'HeadingComponent',
        displayName: 'Título Serviço',
        props: {
          text: servico.nome,
          tagName: 'h3',
          fontSize: '18',
          fontWeight: '700',
          textAlign: 'center',
          color: palette.textOnLight,
          lineHeight: '1.4',
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Descrição Serviço',
        props: {
          text: getServiceDescription(servico.nome, servico.descricao),
          fontSize: '15',
          fontWeight: '400',
          textAlign: 'center',
          color: palette.textMuted,
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

// ─── 2.5. SEGMENTOS — cards animados para segmentos de atuação ─

const SEGMENT_ICONS: Record<string, string> = {
  'Agronegócios': '🌾',
  'Startups': '🚀',
  'Farmácias': '💊',
  'Médicos e Saúde': '⚕️',
  'Comércio': '🏪',
  'Construção Civil': '🏗️',
  'Indústria': '🏭',
  'Transportadoras': '🚛',
  'Restaurantes e Alimentação': '🍽️',
  'E-commerce': '🛒',
  'Educação': '🎓',
  'Igrejas e Instituições Religiosas': '⛪',
  'ONGs e Terceiro Setor': '🤝',
  'Prestadores de Serviços': '🔧',
  'Profissionais Liberais': '💼',
  'Condomínios': '🏢',
}

const FALLBACK_SEGMENT_ICONS = ['🏢', '📊', '🎯', '💡', '🌟', '📈']

const SEGMENT_DESCRIPTIONS: Record<string, string> = {
  'Agronegócios': 'Produtores rurais, cooperativas e empresas do setor agrícola.',
  'Startups': 'Empresas de tecnologia e inovação em fase de crescimento.',
  'Farmácias': 'Drogarias, farmácias de manipulação e distribuidoras.',
  'Médicos e Saúde': 'Clínicas, consultórios e profissionais da área da saúde.',
  'Comércio': 'Lojas, restaurantes e estabelecimentos comerciais.',
  'Construção Civil': 'Construtoras, empreiteiras e prestadores de serviços.',
  'Indústria': 'Fábricas, manufaturas e empresas do setor industrial.',
  'Transportadoras': 'Empresas de transporte, logística e distribuição.',
  'Restaurantes e Alimentação': 'Restaurantes, bares, lanchonetes e serviços de alimentação.',
  'E-commerce': 'Lojas virtuais, marketplaces e comércio eletrônico.',
  'Educação': 'Escolas, cursos, universidades e instituições de ensino.',
  'Igrejas e Instituições Religiosas': 'Igrejas, templos e organizações religiosas.',
  'ONGs e Terceiro Setor': 'Organizações sem fins lucrativos, associações e fundações.',
  'Prestadores de Serviços': 'Empresas e profissionais que oferecem serviços especializados.',
  'Profissionais Liberais': 'Advogados, engenheiros, arquitetos e demais profissionais autônomos.',
  'Condomínios': 'Condomínios residenciais, comerciais e administradoras.',
}

function getSegmentIcon(nome: string, index: number): string {
  if (SEGMENT_ICONS[nome]) return SEGMENT_ICONS[nome]
  const nomeLower = nome.toLowerCase()
  const match = Object.entries(SEGMENT_ICONS).find(([k]) => nomeLower.includes(k.toLowerCase()) || k.toLowerCase().includes(nomeLower))
  if (match) return match[1]
  return FALLBACK_SEGMENT_ICONS[index % FALLBACK_SEGMENT_ICONS.length]
}

function getSegmentDescription(nome: string, descricaoUsuario?: string): string {
  if (descricaoUsuario && descricaoUsuario.trim()) return descricaoUsuario
  if (SEGMENT_DESCRIPTIONS[nome]) return SEGMENT_DESCRIPTIONS[nome]
  const match = Object.keys(SEGMENT_DESCRIPTIONS).find(k =>
    nome.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(nome.toLowerCase())
  )
  if (match) return SEGMENT_DESCRIPTIONS[match]
  return `Atendimento especializado para o segmento de ${nome.toLowerCase()}.`
}

function buildSegmentos(
  segmentos: SegmentoItem[],
  palette: ColorPalette,
  sectionBg: string,
): TemplateNode {
  const segments = segmentos.map((seg, i) => ({
    icon: getSegmentIcon(seg.nome, i),
    titulo: seg.nome,
    descricao: getSegmentDescription(seg.nome, seg.descricao),
  }))

  return {
    type: 'SegmentsComponent',
    displayName: 'Segmentos',
    props: {
      background: sectionBg,
      backgroundTo: palette.background,
      primaryColor: palette.primary,
      primaryLight: palette.primaryTint,
      primaryLighter: palette.primarySoft,
      primaryAlpha10: palette.primaryAlpha10,
      primaryAlpha15: palette.primaryAlpha15,
      primaryAlpha30: palette.primaryAlpha30,
      titleColor: palette.textOnLight,
      textColor: palette.textMuted,
      accentColor: palette.secondary,
      paddingY: 80,
      segments,
      sectionTag: 'QUEM ATENDEMOS',
      sectionTitle: 'Segmentos de Atuação',
      sectionDescription: 'Experiência comprovada em diversos setores da economia.',
      contentMaxWidth: CONTENT_MAX_WIDTH,
      sectionId: 'segmentos',
    },
  }
}

// ─── 3. SOBRE — layout com imagem lateral + MVV cards ────────

function buildSobre(
  perfil: PerfilEmpresa,
  nome: string,
  palette: ColorPalette,
  sectionBg: string,
): TemplateNode {
  const currentYear = new Date().getFullYear()
  const anosExp = perfil.ano_fundacao ? currentYear - perfil.ano_fundacao : null

  // ─── HEADER CENTRALIZADO ─────────────────────────────────────
  const headerChildren: TemplateNode[] = [
    {
      type: 'TextComponent',
      displayName: 'Tag Sobre',
      props: {
        text: 'CONHEÇA-NOS',
        fontSize: '12',
        fontWeight: '700',
        textAlign: 'center',
        color: palette.secondary,
        letterSpacing: '2',
        margin: [0, 0, 8, 0],
      },
    },
    {
      type: 'HeadingComponent',
      displayName: 'Título Sobre',
      props: {
        text: `Sobre a ${nome}`,
        tagName: 'h2',
        fontSize: '40',
        fontWeight: '800',
        textAlign: 'center',
        color: palette.textOnLight,
      },
    },
    {
      type: 'DividerComponent',
      displayName: 'Divisor Sobre',
      props: { color: palette.secondary, thickness: 4, marginY: 16, style: 'solid', width: '60px' },
    },
    {
      type: 'TextComponent',
      displayName: 'Subtítulo Sobre',
      props: {
        text: 'Conheça nossa história e os valores que nos guiam.',
        fontSize: '16',
        fontWeight: '400',
        textAlign: 'center',
        color: palette.textMuted,
        margin: [0, 0, 0, 0],
      },
    },
  ]

  // ─── GRID: IMAGEM + TEXTO ────────────────────────────────────
  // Coluna esquerda: Imagem com badge de experiência
  const imageColumnChildren: TemplateNode[] = [
    {
      type: 'ImageComponent',
      displayName: 'Imagem Escritório',
      props: {
        src: ASSETS.aboutOffice,
        alt: `Escritório ${nome}`,
        width: '100%',
        height: '400px',
        objectFit: 'cover',
        borderRadius: 16,
      },
    },
  ]

  // Badge de anos de experiência sobre a imagem
  if (anosExp && anosExp > 0) {
    imageColumnChildren.push({
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: 'Badge Experiência',
      props: {
        background: palette.primary,
        padding: 20,
        gap: 4,
        width: 'auto',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        shadow: 3,
        radius: 16,
        position: 'absolute',
        bottom: '-24px',
        right: '-24px',
      },
      children: [
        {
          type: 'TextComponent',
          displayName: 'Número Anos',
          props: {
            text: `${anosExp}+`,
            fontSize: '40',
            fontWeight: '900',
            textAlign: 'center',
            color: palette.textOnPrimary,
            lineHeight: '1',
          },
        },
        {
          type: 'TextComponent',
          displayName: 'Label Anos',
          props: {
            text: 'Anos',
            fontSize: '12',
            fontWeight: '600',
            textAlign: 'center',
            color: palette.textMutedOnDark,
            textTransform: 'uppercase',
            letterSpacing: '1',
          },
        },
      ],
    })
  }

  const imageColumn: TemplateNode = {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Coluna Imagem',
    props: {
      background: 'transparent',
      padding: 0,
      gap: 0,
      width: 'auto',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      shadow: 0,
      radius: 0,
      position: 'relative',
      flex: '1 1 350px',
      minWidth: '300px',
      maxWidth: '500px',
    },
    children: imageColumnChildren,
  }

  // Coluna direita: Texto + features
  const textColumnChildren: TemplateNode[] = [
    {
      type: 'TextComponent',
      displayName: 'Tag Texto',
      props: {
        text: 'NOSSA HISTÓRIA',
        fontSize: '12',
        fontWeight: '700',
        textAlign: 'left',
        color: palette.secondary,
        letterSpacing: '2',
      },
    },
    {
      type: 'HeadingComponent',
      displayName: 'Título Texto',
      props: {
        text: `Sua contabilidade em boas mãos`,
        tagName: 'h3',
        fontSize: '36',
        fontWeight: '800',
        textAlign: 'left',
        color: palette.textOnLight,
        lineHeight: '1.2',
      },
    },
  ]

  // História
  if (perfil.historia) {
    textColumnChildren.push({
      type: 'TextComponent',
      displayName: 'História',
      props: {
        text: perfil.historia,
        fontSize: '16',
        fontWeight: '400',
        textAlign: 'left',
        color: palette.textMuted,
        lineHeight: '1.8',
        margin: [8, 0, 16, 0],
      },
    })
  }

  // Features de destaque
  const features = [
    'Atendimento 100% digital e personalizado',
    'Equipe especializada e certificada',
    'Suporte contínuo e proativo',
  ]

  textColumnChildren.push({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Features Sobre',
    props: {
      background: 'transparent',
      padding: 0,
      gap: 12,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      shadow: 0,
      radius: 0,
    },
    children: features.map((feat, i) => ({
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: `Feature ${i + 1}`,
      props: {
        background: 'transparent',
        padding: 0,
        gap: 12,
        width: '100%',
        height: 'auto',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        shadow: 0,
        radius: 0,
      },
      children: [
        {
          type: 'ContainerComponent',
          isCanvas: false,
          displayName: 'Ícone',
          props: {
            background: palette.primary,
            padding: 0,
            gap: 0,
            width: '36px',
            height: '36px',
            minHeight: 36,
            minWidth: '36px',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadow: 0,
            radius: 10,
            flex: '0 0 36px',
          },
          children: [
            {
              type: 'TextComponent',
              displayName: 'Check',
              props: {
                text: '✓',
                fontSize: '16',
                fontWeight: '700',
                color: palette.textOnPrimary,
                textAlign: 'center',
                lineHeight: '1',
                margin: [0, 0, 0, 0],
              },
            },
          ],
        },
        {
          type: 'TextComponent',
          displayName: 'Texto Feature',
          props: {
            text: feat,
            fontSize: '15',
            fontWeight: '600',
            textAlign: 'left',
            color: palette.textOnLight,
            margin: [0, 0, 0, 0],
          },
        },
      ],
    })),
  })

  const textColumn: TemplateNode = {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Coluna Texto',
    props: {
      background: 'transparent',
      padding: 0,
      gap: 16,
      width: 'auto',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      shadow: 0,
      radius: 0,
      flex: '1 1 400px',
      minWidth: '300px',
    },
    children: textColumnChildren,
  }

  const mainGrid: TemplateNode = {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Grid Sobre',
    props: {
      background: 'transparent',
      padding: 0,
      gap: 48,
      width: '100%',
      height: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      shadow: 0,
      radius: 0,
      marginTop: 48,
      marginBottom: 60,
    },
    children: [imageColumn, textColumn],
  }

  // ─── MVV CARDS ───────────────────────────────────────────────
  const mvvDefs = [
    { label: 'Missão', icon: '🎯', value: perfil.missao, accentLight: palette.primaryLight },
    { label: 'Visão', icon: '🔭', value: perfil.visao, accentLight: palette.primaryMid },
    { label: 'Valores', icon: '💎', value: perfil.valores, accentLight: palette.primaryLighter },
  ].filter(item => item.value)

  let mvvSection: TemplateNode | null = null
  if (mvvDefs.length > 0) {
    const mvvCards: TemplateNode[] = mvvDefs.map((item) => ({
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: item.label,
      props: {
        background: palette.cardBackground,
        padding: 32,
        gap: 12,
        width: 'auto',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        shadow: 1,
        radius: 16,
        borderAccent: palette.secondary,
        borderAccentPosition: 'top',
        flex: '1 1 280px',
        minWidth: '250px',
        maxWidth: '380px',
      },
      children: [
        {
          type: 'ContainerComponent',
          isCanvas: false,
          displayName: 'Ícone MVV',
          props: {
            background: item.accentLight,
            padding: 12,
            gap: 0,
            width: '56px',
            height: '56px',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadow: 0,
            radius: 12,
          },
          children: [
            {
              type: 'TextComponent',
              displayName: 'Emoji',
              props: {
                text: item.icon,
                fontSize: '24',
              },
            },
          ],
        },
        {
          type: 'HeadingComponent',
          displayName: 'Título MVV',
          props: {
            text: item.label,
            tagName: 'h3',
            fontSize: '18',
            fontWeight: '700',
            textAlign: 'center',
            color: palette.textOnLight,
          },
        },
        {
          type: 'TextComponent',
          displayName: 'Texto MVV',
          props: {
            text: item.value!,
            fontSize: '14',
            fontWeight: '400',
            textAlign: 'center',
            color: palette.textMuted,
            lineHeight: '1.7',
          },
        },
      ],
    }))

    mvvSection = {
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: 'Nossos Pilares',
      props: {
        background: 'transparent',
        padding: 0,
        gap: 16,
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
          type: 'HeadingComponent',
          displayName: 'Título Pilares',
          props: {
            text: 'Nossos Pilares',
            tagName: 'h3',
            fontSize: '28',
            fontWeight: '800',
            textAlign: 'center',
            color: palette.textOnLight,
          },
        },
        {
          type: 'ContainerComponent',
          isCanvas: true,
          displayName: 'Grid MVV',
          props: {
            background: 'transparent',
            padding: 0,
            gap: 24,
            width: '100%',
            height: 'auto',
            flexDirection: 'row',
            alignItems: 'stretch',
            justifyContent: 'center',
            flexWrap: 'wrap',
            shadow: 0,
            radius: 0,
            marginTop: 24,
          },
          children: mvvCards,
        },
      ],
    }
  }

  const sectionChildren: TemplateNode[] = [
    {
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: 'Header Sobre',
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
      children: headerChildren,
    },
    mainGrid,
  ]

  if (mvvSection) {
    sectionChildren.push(mvvSection)
  }

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Sobre',
    props: {
      background: sectionBg,
      padding: 0,
      paddingY: 80,
      paddingX: 40,
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
          gap: 0,
          width: '100%',
          maxWidth: CONTENT_MAX_WIDTH,
          height: 'auto',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          shadow: 0,
          radius: 0,
        },
        children: sectionChildren,
      },
    ],
  }
}

// ─── 4. DIFERENCIAIS ────────────────────────────────────────

function buildDiferenciais(
  diferenciais: string[],
  palette: ColorPalette,
  sectionBg: string,
): TemplateNode {
  const cards: TemplateNode[] = diferenciais.slice(0, 6).map((diff, i) => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: `Diferencial ${i + 1}`,
    props: {
      background: palette.cardBackground,
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
          color: palette.secondaryLighter,
          margin: [0, 0, 0, 0],
        },
      },
      {
        type: 'DividerComponent',
        displayName: 'Linha Diferencial',
        props: { color: palette.secondary, thickness: 2, marginY: 4, style: 'solid' },
      },
      {
        type: 'TextComponent',
        displayName: 'Diferencial',
        props: {
          text: diff,
          fontSize: '15',
          fontWeight: '600',
          textAlign: 'left',
          color: palette.textOnLight,
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
              color: palette.secondary,
              letterSpacing: '2',
              margin: [0, 0, 8, 0],
            },
          },
          {
            type: 'HeadingComponent',
            displayName: 'Título',
            props: {
              text: 'Nossos Diferenciais',
              tagName: 'h2',
              fontSize: '40',
              fontWeight: '800',
              textAlign: 'center',
              color: palette.textOnLight,
            },
          },
          {
            type: 'DividerComponent',
            displayName: 'Divisor',
            props: { color: palette.secondary, thickness: 4, marginY: 16, style: 'solid', width: '60px' },
          },
          {
            type: 'TextComponent',
            displayName: 'Subtítulo Diferenciais',
            props: {
              text: 'O que nos torna a escolha certa para o seu negócio.',
              fontSize: '16',
              fontWeight: '400',
              textAlign: 'center',
              color: palette.textMuted,
              margin: [0, 0, 0, 0],
            },
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
  palette: ColorPalette,
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
        color: palette.textOnLight,
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
          color: palette.secondary,  // usa cor secundária (laranja/acento)
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
          color: palette.textMuted,
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
          color: palette.textMuted,
          margin: [4, 0, 8, 0],
        },
      })
    }

    // Especialidades como tags
    if (socio.especialidades && socio.especialidades.length > 0) {
      const tagChildren: TemplateNode[] = socio.especialidades.map((esp, idx) => ({
        type: 'BadgeComponent',
        displayName: `Tag ${idx + 1}`,
        props: {
          text: esp,
          background: palette.primarySoft,
          color: palette.primary,
          fontSize: 12,
          fontWeight: '500',
          borderRadius: 50,
          paddingX: 16,
          paddingY: 6,
          border: `1px solid ${palette.primaryAlpha15}`,
        },
      }))

      cardChildren.push({
        type: 'ContainerComponent',
        isCanvas: false,
        displayName: 'Especialidades',
        props: {
          background: 'transparent',
          padding: 0,
          gap: 8,
          width: '100%',
          height: 'auto',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          shadow: 0,
          radius: 0,
        },
        children: tagChildren,
      })
    }

    return {
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: `Sócio ${i + 1}`,
      props: {
        background: palette.cardBackground,
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
              color: palette.secondary,
              letterSpacing: '2',
              margin: [0, 0, 8, 0],
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
              color: palette.textOnLight,
            },
          },
          {
            type: 'DividerComponent',
            displayName: 'Divisor',
            props: { color: palette.secondary, thickness: 4, marginY: 16, style: 'solid', width: '60px' },
          },
          {
            type: 'TextComponent',
            displayName: 'Subtítulo Equipe',
            props: {
              text: 'Especialistas comprometidos com o sucesso do seu negócio.',
              fontSize: '16',
              fontWeight: '400',
              textAlign: 'center',
              color: palette.textMuted,
              margin: [0, 0, 0, 0],
            },
          },
        ],
      },
      ...cards,
    ],
  }
}

// ─── 6. CTA — call to action com background image ──────────

function buildCta(
  perfil: PerfilEmpresa,
  palette: ColorPalette,
): TemplateNode {
  const whatsappHref = perfil.whatsapp
    ? `https://wa.me/55${perfil.whatsapp.replace(/\D/g, '')}`
    : null
  const emailHref = perfil.email_contato ? `mailto:${perfil.email_contato}` : '#contato'

  // Texto do botão adapta ao contexto
  let ctaBtnText = 'Fale Conosco'
  if (whatsappHref) {
    ctaBtnText = 'Falar pelo WhatsApp'
  }


  const ctaChildren: TemplateNode[] = [
    // Badge com transparência e blur
    {
      type: 'BadgeComponent',
      displayName: 'Tag CTA',
      props: {
        text: 'Fale Conosco',
        badgeStyle: 'soft',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        color: palette.textOnDark,
        fontSize: 13,
        fontWeight: 600,
        borderRadius: 50,
        paddingX: 24,
        paddingY: 10,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 24,
      },
    },
    // Título
    {
      type: 'HeadingComponent',
      displayName: 'Título CTA',
      props: {
        text: 'Pronto para transformar seu negócio?',
        tagName: 'h2',
        fontSize: '48',
        fontWeight: '800',
        textAlign: 'center',
        color: palette.textOnDark,
        lineHeight: '1.2',
        maxWidth: '700px',
        textShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
      },
    },
    // Subtítulo
    {
      type: 'TextComponent',
      displayName: 'Subtítulo CTA',
      props: {
        text: 'Entre em contato agora e descubra como podemos ajudar o seu negócio a crescer com segurança e eficiência.',
        fontSize: '18',
        fontWeight: '400',
        textAlign: 'center',
        color: palette.textMutedOnDark,
        lineHeight: '1.7',
        margin: [8, 0, 28, 0],
        maxWidth: '550px',
      },
    },
    // Botão WhatsApp
    {
      type: 'ButtonComponent',
      displayName: 'Botão CTA',
      props: {
        text: ctaBtnText,
        href: whatsappHref || emailHref,
        background: palette.cardBackground,
        color: palette.secondary,
        size: 'lg',
        buttonStyle: 'filled',
        borderRadius: 50,
        paddingX: 36,
        paddingY: 16,
        shadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
        icon: whatsappHref ? 'whatsapp' : undefined,
      },
    },
  ]

  // Informações de contato
  const contactParts: string[] = []
  if (perfil.telefone) contactParts.push(perfil.telefone)
  if (perfil.email_contato) contactParts.push(perfil.email_contato)

  if (contactParts.length > 0) {
    ctaChildren.push({
      type: 'TextComponent',
      displayName: 'Informações de Contato',
      props: {
        text: contactParts.join('  ·  '),
        fontSize: '15',
        fontWeight: '500',
        textAlign: 'center',
        color: palette.textMutedOnDark,
        margin: [24, 0, 0, 0],
      },
    })
  }

  // Usa HeroSectionComponent para ter background image com overlay
  // Gera overlay gradiente usando cores mais escuras para melhor contraste
  const ctaOverlay = `linear-gradient(135deg, ${palette.primaryDarker} 0%, ${palette.secondaryDarker} 100%)`

  return {
    type: 'HeroSectionComponent',
    isCanvas: true,
    displayName: 'CTA',
    props: {
      background: palette.primaryDarker,
      gradientFrom: '',
      gradientTo: '',
      backgroundImage: ASSETS.ctaBg,
      overlayOpacity: 0.88,
      overlayColor: ctaOverlay,
      parallax: true,
      paddingY: 100,
      minHeight: 400,
      textAlign: 'center',
      contentMaxWidth: CONTENT_MAX_WIDTH,
      sectionId: 'contato',
    },
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
  palette: ColorPalette,
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
        accentColor: palette.secondary,
      })),
      background: sectionBg,
      cardBackground: palette.cardBackground,
      accentColor: palette.secondary,
      textColor: palette.textOnLight,
      paddingY: 80,
      columns,
      showStars: true,
      sectionTag: 'DEPOIMENTOS',
      sectionTitle: 'O que nossos clientes dizem',
      sectionDescription: 'A satisfação dos nossos clientes é o nosso maior orgulho.',
    },
  }
}

// ─── 7. FOOTER — multi-coluna escuro com logo ────────────────

function buildFooter(
  perfil: PerfilEmpresa,
  nome: string,
  palette: ColorPalette,
): TemplateNode {
  const year = new Date().getFullYear()
  const footerBg = palette.primaryDarker
  const gradientTo = palette.primaryDark
  const mutedText = palette.textMutedOnDark
  const lightText = palette.textOnDark

  // ════════════════════════════════════════════════════════════════
  // BLOCO 1 — Identidade de Marca (centralizado, full-width)
  // Logo + Nome + Slogan
  // ════════════════════════════════════════════════════════════════
  const brandChildren: TemplateNode[] = []

  if (perfil.logo_url) {
    brandChildren.push({
      type: 'ImageComponent',
      displayName: 'Logo Footer',
      props: {
        src: perfil.logo_url,
        alt: nome,
        width: '160px',
        height: 'auto',
        objectFit: 'contain',
        borderRadius: 0,
        backgroundColor: 'transparent',
        filter: 'brightness(0) invert(1)',
      },
    })
  }

  brandChildren.push({
    type: 'TextComponent',
    displayName: 'Nome Footer',
    props: {
      text: nome,
      fontSize: '20',
      fontWeight: '700',
      textAlign: 'center',
      color: lightText,
      margin: [perfil.logo_url ? 12 : 0, 0, 0, 0],
    },
  })

  if (perfil.slogan) {
    brandChildren.push({
      type: 'TextComponent',
      displayName: 'Slogan Footer',
      props: {
        text: perfil.slogan,
        fontSize: '14',
        fontWeight: '400',
        textAlign: 'center',
        color: mutedText,
        lineHeight: '1.5',
        margin: [4, 0, 0, 0],
      },
    })
  }

  // ════════════════════════════════════════════════════════════════
  // BLOCO 2 — Informações de Contato e Endereço (2 colunas centralizadas)
  // ════════════════════════════════════════════════════════════════
  const infoCols: TemplateNode[] = []

  // ── Col: Contato (só se houver dados) ──────────────────────
  const contactLines: string[] = []
  if (perfil.telefone) contactLines.push(perfil.telefone)
  if (perfil.whatsapp && perfil.whatsapp !== perfil.telefone) contactLines.push(`WhatsApp: ${perfil.whatsapp}`)
  if (perfil.email_contato) contactLines.push(perfil.email_contato)
  if (perfil.horario_atendimento) contactLines.push(perfil.horario_atendimento)

  if (contactLines.length > 0) {
    infoCols.push({
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
        alignItems: 'center',
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
            fontSize: '13',
            fontWeight: '700',
            textAlign: 'center',
            color: lightText,
            margin: [0, 0, 10, 0],
            letterSpacing: '1.5',
            textTransform: 'uppercase',
          },
        },
        {
          type: 'TextComponent',
          displayName: 'Dados Contato',
          props: {
            text: contactLines.join('\n'),
            fontSize: '13',
            fontWeight: '400',
            textAlign: 'center',
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
    infoCols.push({
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
        alignItems: 'center',
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
            fontSize: '13',
            fontWeight: '700',
            textAlign: 'center',
            color: lightText,
            margin: [0, 0, 10, 0],
            letterSpacing: '1.5',
            textTransform: 'uppercase',
          },
        },
        {
          type: 'TextComponent',
          displayName: 'Dados Endereço',
          props: {
            text: addrLines.join('\n'),
            fontSize: '13',
            fontWeight: '400',
            textAlign: 'center',
            color: mutedText,
            lineHeight: '1.8',
            margin: [0, 0, 0, 0],
          },
        },
      ],
    })
  }

  // ════════════════════════════════════════════════════════════════
  // SEÇÃO INFERIOR — Redes Sociais + Copyright (centralizado)
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
      color: palette.textMutedOnDark,
      margin: [0, 0, 0, 0],
    },
  })

  // ════════════════════════════════════════════════════════════════
  // MONTAGEM FINAL — Marca (centrada) + Info (cols) + Divider + Inferior
  // ════════════════════════════════════════════════════════════════
  const footerChildren: TemplateNode[] = [
    // Bloco Marca — centralizado, full-width
    {
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: 'Footer – Marca',
      props: {
        background: 'transparent',
        padding: 0,
        gap: 4,
        width: '100%',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        shadow: 0,
        radius: 0,
      },
      children: brandChildren,
    },
  ]

  // Bloco Info — colunas de Contato + Endereço (se existirem)
  if (infoCols.length > 0) {
    footerChildren.push({
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: 'Footer – Info',
      props: {
        background: 'transparent',
        padding: [24, 0, 0, 0],
        gap: 40,
        width: '100%',
        height: 'auto',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        shadow: 0,
        radius: 0,
        flexWrap: 'wrap',
      },
      children: infoCols,
    })
  }

  // Divider
  footerChildren.push({
    type: 'DividerComponent',
    displayName: 'Divider Footer',
    props: {
      color: palette.dividerOnDark,
      thickness: 1,
      marginY: 8,
      style: 'solid',
    },
  })

  // Rodapé Inferior
  footerChildren.push({
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
  })

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
      columns: 1,
      contentMaxWidth: CONTENT_MAX_WIDTH,
    },
    children: footerChildren,
  }
}
