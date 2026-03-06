/**
 * Hidrata um template Craft.js com dados do perfil da empresa.
 *
 * Percorre os nós do JSON serializado e substitui placeholders
 * por dados reais do perfil — nome, slogan, serviços, historia,
 * equipe, contato, endereço, cores e logo.
 *
 * Objetivo: preencher o MÁXIMO de informação possível, no mesmo
 * nível de riqueza do generateProfileTemplate().
 */

import type { PerfilEmpresa, Socio } from '@/features/onboarding/types/onboarding.types'
import { darken, isLightColor } from './profile-template'

// ─── Types internos do Craft.js JSON ────────────────────────

interface CraftNode {
  type: { resolvedName: string }
  isCanvas?: boolean
  props: Record<string, unknown>
  displayName?: string
  custom?: Record<string, unknown>
  hidden?: boolean
  nodes: string[]
  linkedNodes?: Record<string, string>
  parent?: string
}

type CraftNodes = Record<string, CraftNode>

// ─── Helpers ────────────────────────────────────────────────

function getDescendants(nodes: CraftNodes, nodeId: string): string[] {
  const node = nodes[nodeId]
  if (!node?.nodes?.length) return []
  const result: string[] = [...node.nodes]
  for (const childId of node.nodes) {
    result.push(...getDescendants(nodes, childId))
  }
  return result
}

function findFirst(
  nodes: CraftNodes,
  parentId: string,
  resolvedName: string,
  tagName?: string,
): CraftNode | null {
  for (const id of getDescendants(nodes, parentId)) {
    const n = nodes[id]
    if (n?.type?.resolvedName === resolvedName) {
      if (tagName && n.props?.tagName !== tagName) continue
      return n
    }
  }
  return null
}

function findAll(
  nodes: CraftNodes,
  parentId: string,
  resolvedName: string,
): CraftNode[] {
  return getDescendants(nodes, parentId)
    .map((id) => nodes[id])
    .filter((n) => n?.type?.resolvedName === resolvedName)
}

// ─── Section hydrators ─────────────────────────────────────

function hydrateHero(
  nodes: CraftNodes,
  sectionId: string,
  perfil: PerfilEmpresa,
  nome: string,
  slogan: string,
  primary: string,
  whatsappHref: string | null,
  emailHref: string | null,
): void {
  const section = nodes[sectionId]

  // Heading h1 → nome da empresa
  const h1 = findFirst(nodes, sectionId, 'HeadingComponent', 'h1')
  if (h1) h1.props.text = nome

  // Primeiro TextComponent → slogan
  if (slogan) {
    const texts = findAll(nodes, sectionId, 'TextComponent')
    if (texts.length > 0) texts[0].props.text = slogan
  }

  // Logo → se existir ImageComponent no hero, preencher com logo do perfil
  if (perfil.logo_url) {
    const img = findFirst(nodes, sectionId, 'ImageComponent')
    if (img) {
      img.props.src = perfil.logo_url
      img.props.alt = `Logo ${nome}`
      img.props.backgroundColor = '#ffffff'
      img.props.width = '100px'
      img.props.height = '100px'
      img.props.objectFit = 'contain'
    }
  }

  // Botao → WhatsApp ou email
  const btns = findAll(nodes, sectionId, 'ButtonComponent')
  if (btns.length > 0) {
    const btn = btns[0]
    if (whatsappHref) {
      btn.props.text = 'Fale pelo WhatsApp'
      btn.props.href = whatsappHref
      btn.props.background = '#25D366'
      btn.props.color = '#ffffff'
    } else if (emailHref) {
      btn.props.text = 'Entre em Contato'
      btn.props.href = emailHref
      btn.props.background = primary
      btn.props.color = isLightColor(primary) ? '#111827' : '#ffffff'
    }
  }

  // Cores do gradiente
  const gradientTo = darken(primary, 0.55)
  if (section.props.gradientFrom !== undefined) {
    section.props.gradientTo = gradientTo
  }
}

function hydrateFeatures(
  nodes: CraftNodes,
  sectionId: string,
  perfil: PerfilEmpresa,
  secondary: string,
): void {
  const services = perfil.servicos || []
  if (services.length === 0) return

  const section = nodes[sectionId]
  const directChildren = section.nodes || []
  let serviceIndex = 0

  for (const cardId of directChildren) {
    const card = nodes[cardId]
    if (!card || card.type?.resolvedName !== 'ContainerComponent') continue

    // Distinguir card de servico vs cabecalho: card tem heading h3
    const cardHeading = findFirst(nodes, cardId, 'HeadingComponent', 'h3')
    if (!cardHeading) continue

    if (serviceIndex >= services.length) break

    cardHeading.props.text = services[serviceIndex].nome

    const cardText = findFirst(nodes, cardId, 'TextComponent')
    if (cardText && services[serviceIndex].descricao) {
      cardText.props.text = services[serviceIndex].descricao
    }

    // Dividers nos cards → cor secundaria
    const divider = findFirst(nodes, cardId, 'DividerComponent')
    if (divider) divider.props.color = secondary

    serviceIndex++
  }

  // Cabecalho da secao: divider com cor secundaria
  for (const childId of directChildren) {
    const child = nodes[childId]
    if (!child || child.type?.resolvedName !== 'ContainerComponent') continue
    const heading = findFirst(nodes, childId, 'HeadingComponent', 'h3')
    if (heading) continue // e um card, nao cabecalho
    // Cabecalho: tem h2 mas nao h3
    const h2 = findFirst(nodes, childId, 'HeadingComponent', 'h2')
    if (h2) {
      const headerDivider = findFirst(nodes, childId, 'DividerComponent')
      if (headerDivider) headerDivider.props.color = secondary
    }
  }
}

function hydrateGenericSection(
  nodes: CraftNodes,
  sectionId: string,
  perfil: PerfilEmpresa,
  nome: string,
  primary: string,
): boolean {
  // Tenta preencher com dados "Sobre" se disponiveis
  const heading = findFirst(nodes, sectionId, 'HeadingComponent', 'h2')
  const texts = findAll(nodes, sectionId, 'TextComponent')

  if (!heading && texts.length === 0) return false

  // Preencher heading com "Sobre a {nome}"
  if (heading && perfil.historia) {
    heading.props.text = `Sobre a ${nome}`
    heading.props.color = '#111827'
  }

  // Preencher primeiro texto com historia
  if (texts.length > 0 && perfil.historia) {
    texts[0].props.text = perfil.historia
  }

  // Botao "Sobre" → contato
  const btn = findFirst(nodes, sectionId, 'ButtonComponent')
  if (btn) {
    const whatsappHref = perfil.whatsapp
      ? `https://wa.me/55${perfil.whatsapp.replace(/\D/g, '')}`
      : null
    if (whatsappHref) {
      btn.props.text = 'Fale Conosco'
      btn.props.href = whatsappHref
    } else if (perfil.email_contato) {
      btn.props.text = 'Entre em Contato'
      btn.props.href = `mailto:${perfil.email_contato}`
    }
    btn.props.background = primary
    btn.props.color = isLightColor(primary) ? '#111827' : '#ffffff'
  }

  // Label acima do heading → cor primaria
  const allTexts = findAll(nodes, sectionId, 'TextComponent')
  for (const t of allTexts) {
    if (t.props.fontSize === '13' && t.props.fontWeight === '700') {
      t.props.color = primary
    }
  }

  return true
}

function hydrateTestimonials(
  nodes: CraftNodes,
  sectionId: string,
  socios: Socio[],
  primary: string,
): void {
  const visibleSocios = socios.filter((s) => s.exibir_landing_page)
  if (visibleSocios.length === 0) return

  const section = nodes[sectionId]
  const directChildren = section.nodes || []
  let socioIndex = 0

  for (const cardId of directChildren) {
    const card = nodes[cardId]
    if (!card || card.type?.resolvedName !== 'ContainerComponent') continue

    if (socioIndex >= visibleSocios.length) break
    const socio = visibleSocios[socioIndex]

    const texts = findAll(nodes, cardId, 'TextComponent')

    // Primeiro texto → mini_bio ou especialidades
    if (texts.length >= 1) {
      if (socio.mini_bio) {
        texts[0].props.text = `"${socio.mini_bio}"`
      } else if (socio.especialidades?.length > 0) {
        texts[0].props.text = `Especialista em ${socio.especialidades.slice(0, 3).join(', ')}.`
      }
    }

    // Segundo texto → nome e cargo
    if (texts.length >= 2) {
      const parts = [socio.nome_completo]
      if (socio.cargo) parts[0] = `${socio.nome_completo}, ${socio.cargo}`
      if (socio.crc_numero) {
        parts.push(`CRC ${socio.crc_estado || ''} ${socio.crc_numero}`)
      }
      texts[1].props.text = `— ${parts.join(' | ')}`
      texts[1].props.color = primary
    }

    // Foto se existir ImageComponent
    if (socio.foto_url) {
      const img = findFirst(nodes, cardId, 'ImageComponent')
      if (img) {
        img.props.src = socio.foto_url
        img.props.alt = socio.nome_completo
      }
    }

    socioIndex++
  }
}

function hydrateCta(
  nodes: CraftNodes,
  sectionId: string,
  perfil: PerfilEmpresa,
  primary: string,
  secondary: string,
  whatsappHref: string | null,
  emailHref: string | null,
): void {
  const section = nodes[sectionId]

  // Aplicar cor primaria ao fundo
  section.props.background = primary

  const ctaTextColor = isLightColor(primary) ? '#111827' : '#ffffff'
  const ctaSubText = isLightColor(primary) ? '#374151' : '#e2e8f0'

  // Heading → cor de contraste
  const heading = findFirst(nodes, sectionId, 'HeadingComponent')
  if (heading) heading.props.color = ctaTextColor

  // Textos → cor suave de contraste
  const texts = findAll(nodes, sectionId, 'TextComponent')
  for (const t of texts) t.props.color = ctaSubText

  // Se tem dados de contato, adicionar ao texto
  if (texts.length > 0) {
    const contactParts: string[] = []
    if (perfil.telefone) contactParts.push(perfil.telefone)
    if (perfil.email_contato) contactParts.push(perfil.email_contato)
    if (perfil.horario_atendimento) contactParts.push(perfil.horario_atendimento)

    if (contactParts.length > 0 && texts.length >= 2) {
      texts[texts.length - 1].props.text = contactParts.join('  |  ')
    }
  }

  // Botao → WhatsApp ou contato
  const btn = findFirst(nodes, sectionId, 'ButtonComponent')
  if (btn) {
    if (whatsappHref) {
      btn.props.text = 'Fale pelo WhatsApp'
      btn.props.href = whatsappHref
      btn.props.background = '#25D366'
      btn.props.color = '#ffffff'
    } else if (emailHref) {
      btn.props.text = 'Entre em Contato'
      btn.props.href = emailHref
      btn.props.background = secondary
      btn.props.color = isLightColor(secondary) ? '#111827' : '#ffffff'
    }
  }
}

function hydrateFooter(
  nodes: CraftNodes,
  sectionId: string,
  perfil: PerfilEmpresa,
  nome: string,
  primary: string,
  secondary: string,
): void {
  const section = nodes[sectionId]
  const footerBg = '#0f172a'
  const gradientTo = darken(primary, 0.55)
  section.props.gradientFrom = footerBg
  section.props.gradientTo = gradientTo
  section.props.gradientType = 'linear'
  section.props.gradientDirection = '135deg'

  const texts = findAll(nodes, sectionId, 'TextComponent')
  const year = new Date().getFullYear()

  // Divider no footer → cor secundaria
  const divider = findFirst(nodes, sectionId, 'DividerComponent')
  if (divider) divider.props.color = secondary

  // Primeiro texto: empresa + CNPJ + copyright
  if (texts.length >= 1) {
    const parts = [nome]
    if (perfil.cnpj) parts.push(`CNPJ: ${perfil.cnpj}`)
    parts.push(`\u00a9 ${year}. Todos os direitos reservados.`)
    texts[0].props.text = parts.join('\n')
  }

  // Segundo texto: contato completo
  if (texts.length >= 2) {
    const contactParts: string[] = []
    if (perfil.telefone) contactParts.push(perfil.telefone)
    if (perfil.whatsapp && perfil.whatsapp !== perfil.telefone) {
      contactParts.push(`WhatsApp: ${perfil.whatsapp}`)
    }
    if (perfil.email_contato) contactParts.push(perfil.email_contato)
    if (perfil.horario_atendimento) contactParts.push(perfil.horario_atendimento)
    if (contactParts.length > 0) {
      texts[1].props.text = contactParts.join('\n')
    }
  }

  // Terceiro texto: endereco + redes sociais
  if (texts.length >= 3) {
    const col3Lines: string[] = []

    if (perfil.logradouro) {
      let addr = perfil.logradouro
      if (perfil.numero) addr += `, ${perfil.numero}`
      if (perfil.bairro) addr += ` - ${perfil.bairro}`
      col3Lines.push(addr)
    }
    if (perfil.cidade && perfil.estado) {
      let cityLine = `${perfil.cidade}/${perfil.estado}`
      if (perfil.cep) cityLine += ` - CEP ${perfil.cep}`
      col3Lines.push(cityLine)
    }

    // Redes sociais
    const socials: string[] = []
    if (perfil.redes_sociais?.instagram) {
      socials.push(`Instagram: @${perfil.redes_sociais.instagram.replace(/@/g, '')}`)
    }
    if (perfil.redes_sociais?.facebook) {
      socials.push(`Facebook: ${perfil.redes_sociais.facebook}`)
    }
    if (perfil.redes_sociais?.linkedin) {
      socials.push(`LinkedIn: ${perfil.redes_sociais.linkedin}`)
    }
    if (socials.length > 0) col3Lines.push('', ...socials)

    if (col3Lines.length > 0) {
      texts[2].props.text = col3Lines.join('\n')
    }
  }
}

// ─── Passagem global de placeholders ────────────────────────
//
// Substitui textos genéricos conhecidos em QUALQUER nó do template,
// independente de qual seção eles estejam.

function deepHydratePlaceholders(
  nodes: CraftNodes,
  perfil: PerfilEmpresa,
  socios: Socio[],
  nome: string,
  primary: string,
  secondary: string,
  whatsappHref: string | null,
): void {
  const currentYear = new Date().getFullYear()

  // ── Passo 1: substituição de texto em todos os nós ────────
  for (const node of Object.values(nodes)) {
    if (!node?.props) continue
    const resolvedName = node.type?.resolvedName
    const text = node.props.text as string | undefined
    if (typeof text !== 'string') continue

    // Placeholder combinado de contato
    if (
      text === 'email@empresa.com | (00) 0000-0000' ||
      text === 'email@empresa.com | (00) 00000-0000' ||
      /email@empresa\.com/.test(text)
    ) {
      const parts: string[] = []
      if (perfil.email_contato) parts.push(perfil.email_contato)
      if (perfil.telefone) parts.push(perfil.telefone)
      if (perfil.horario_atendimento) parts.push(perfil.horario_atendimento)
      node.props.text = parts.length ? parts.join('  |  ') : ''
    }

    // Placeholder de descrição genérica
    else if (
      text.toLowerCase().includes('descricao sobre a empresa') ||
      text.toLowerCase().includes('descrição sobre a empresa') ||
      text === 'Edite com suas informacoes.' ||
      text === 'Edite com suas informações.'
    ) {
      node.props.text = perfil.historia || perfil.slogan || ''
    }

    // "Quem Somos" → "Sobre a {nome}"
    else if (
      resolvedName === 'HeadingComponent' &&
      (text === 'Quem Somos' || text === 'Sobre Nos' || text === 'Sobre Nós')
    ) {
      node.props.text = `Sobre a ${nome}`
    }

    // "Saiba Mais" → "Fale Conosco"
    else if (
      resolvedName === 'ButtonComponent' &&
      (text === 'Saiba Mais' || text === 'Saiba mais' || text === 'Saiba Mais »')
    ) {
      node.props.text = 'Fale Conosco'
      if (whatsappHref) {
        node.props.href = whatsappHref
        node.props.background = '#25D366'
        node.props.color = '#ffffff'
      }
    }
  }

  // ── Passo 2: stats "00+" → dados reais ────────────────────
  // Procura pares (HeadingComponent com "00+") + (TextComponent com label)
  // dentro do mesmo ContainerComponent pai.
  for (const node of Object.values(nodes)) {
    if (node.type?.resolvedName !== 'ContainerComponent') continue
    if (!node.nodes?.length) continue

    const childNodes = node.nodes.map((id) => nodes[id]).filter(Boolean)
    const heading = childNodes.find((n) => n.type?.resolvedName === 'HeadingComponent')
    const labelNode = childNodes.find((n) => n.type?.resolvedName === 'TextComponent')

    if (!heading || !labelNode) continue
    if (heading.props.text !== '00+' && heading.props.text !== '00') continue

    const label = ((labelNode.props.text as string) || '').toLowerCase()

    if (/ano|experiên|experienc|fundaç|fundaca/.test(label)) {
      if (perfil.ano_fundacao && perfil.ano_fundacao < currentYear) {
        const anos = currentYear - perfil.ano_fundacao
        heading.props.text = `${anos}+`
        labelNode.props.text = 'anos de experiência'
        heading.props.color = secondary
      }
    } else if (/especialista|profissional|equipe|contador/.test(label)) {
      const n = socios.filter((s) => s.exibir_landing_page).length
      if (n > 0) {
        heading.props.text = `${n}`
        labelNode.props.text = n === 1 ? 'especialista' : 'especialistas'
        heading.props.color = secondary
      }
    } else if (/servic|soluç|soluca/.test(label)) {
      const n = perfil.servicos?.length || 0
      if (n > 0) {
        heading.props.text = `${n}`
        labelNode.props.text = n === 1 ? 'serviço' : 'serviços'
        heading.props.color = secondary
      }
    }
    // "Clientes Atendidos" e "Projetos Entregues" → sem dados no perfil, manter
  }

  // ── Passo 3: Componentes profissionais em qualquer nível ──
  for (const node of Object.values(nodes)) {
    const resolvedName = node?.type?.resolvedName
    if (!resolvedName || !node.props) continue

    if (resolvedName === 'NavbarComponent') {
      if (perfil.logo_url) node.props.logoSrc = perfil.logo_url
      node.props.logoText = nome
    }

    // StatsBand: cor de acento = cor secundária do perfil
    if (resolvedName === 'StatsBandComponent') {
      node.props.accentColor = secondary
    }

    // QuoteHighlight: cor de acento = cor secundária
    if (resolvedName === 'QuoteHighlightComponent') {
      node.props.accentColor = secondary
    }
  }

  // ── Passo 4: cor primária em headings com cor azul padrão ─
  // Se o template usa cor fixa "#2563eb" (azul padrão), substitui pela primary
  for (const node of Object.values(nodes)) {
    if (!node?.props) continue
    if (
      (node.props.color === '#2563eb' || node.props.background === '#2563eb') &&
      primary !== '#2563eb'
    ) {
      if (node.props.color === '#2563eb') node.props.color = primary
      if (node.props.background === '#2563eb') node.props.background = primary
    }
  }
}

// ─── Funcao principal ───────────────────────────────────────

export function hydrarTemplateComPerfil(
  craftJson: string,
  perfil: PerfilEmpresa,
  socios: Socio[],
): string {
  let nodes: CraftNodes
  try {
    nodes = JSON.parse(craftJson)
  } catch {
    return craftJson
  }

  const root = nodes['ROOT']
  if (!root) return craftJson

  const primary = perfil.cor_primaria || '#2563eb'
  const secondary = perfil.cor_secundaria || '#1A1A1A'
  const nome = perfil.nome_empresa || 'Minha Empresa'
  const slogan = perfil.slogan || ''

  const whatsappHref = perfil.whatsapp
    ? `https://wa.me/55${perfil.whatsapp.replace(/\D/g, '')}`
    : null
  const emailHref = perfil.email_contato
    ? `mailto:${perfil.email_contato}`
    : null

  let featuresHydrated = false
  let genericHydrated = false

  for (const childId of root.nodes || []) {
    const node = nodes[childId]
    if (!node) continue

    const type = node.type?.resolvedName

    // ── Navbar ──
    if (type === 'NavbarComponent') {
      if (perfil.logo_url) node.props.logoSrc = perfil.logo_url
      node.props.logoText = nome
    }

    // ── Hero ──
    if (type === 'HeroSectionComponent') {
      hydrateHero(nodes, childId, perfil, nome, slogan, primary, whatsappHref, emailHref)
    }

    // ── Servicos (primeiro FeaturesSectionComponent) ──
    if (type === 'FeaturesSectionComponent' && !featuresHydrated) {
      hydrateFeatures(nodes, childId, perfil, secondary)
      featuresHydrated = true
    }

    // ── Depoimentos → Equipe ──
    if (type === 'TestimonialsSectionComponent') {
      hydrateTestimonials(nodes, childId, socios, primary)
    }

    // ── Secoes genericas (Sobre, Diferenciais, etc.) ──
    if (type === 'ContainerComponent' && !genericHydrated) {
      // Secao generica no root = provavelmente "Sobre"
      const hasH2 = findFirst(nodes, childId, 'HeadingComponent', 'h2')
      if (hasH2) {
        genericHydrated = hydrateGenericSection(nodes, childId, perfil, nome, primary)
      }
    }

    // ── CTA ──
    if (type === 'CtaSectionComponent') {
      hydrateCta(nodes, childId, perfil, primary, secondary, whatsappHref, emailHref)
    }

    // ── Footer ──
    if (type === 'FooterComponent') {
      hydrateFooter(nodes, childId, perfil, nome, primary, secondary)
    }

    // ── StatsBandComponent ──
    if (type === 'StatsBandComponent') {
      node.props.accentColor = secondary
    }

    // ── BentoFeaturesComponent ──
    if (type === 'BentoFeaturesComponent') {
      const services = perfil.servicos || []
      if (services.length > 0 && Array.isArray(node.props.items)) {
        const items = node.props.items as Array<Record<string, unknown>>
        services.slice(0, items.length).forEach((svc, i) => {
          items[i] = { ...items[i], titulo: svc.nome, descricao: svc.descricao || items[i].descricao }
        })
      }
    }

    // ── QuoteHighlightComponent ──
    if (type === 'QuoteHighlightComponent') {
      node.props.accentColor = secondary
      const visibleSocios = socios.filter((s) => s.exibir_landing_page)
      if (visibleSocios.length > 0) {
        const socio = visibleSocios[0]
        if (socio.mini_bio) node.props.quote = socio.mini_bio
        node.props.author = socio.nome_completo
        node.props.role = socio.cargo || ''
      }
    }
  }

  // Passagem final: substituir todos os placeholders restantes
  deepHydratePlaceholders(nodes, perfil, socios, nome, primary, secondary, whatsappHref)

  return JSON.stringify(nodes)
}
