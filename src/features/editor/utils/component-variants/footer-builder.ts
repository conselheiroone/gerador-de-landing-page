/**
 * Builder do Footer com variantes.
 *
 * Variantes:
 * - centered: tudo centralizado, empilhado (padrão atual)
 * - columns: grid 3 colunas (marca | contato | endereço) — como demo variação 1/2
 * - compact: linha horizontal (marca à esquerda, info à direita) — como demo variação 3
 */

import type { PerfilEmpresa } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import type { FooterVariant } from '../layout-types'
import { CONTENT_MAX_WIDTH } from '../template-helpers'

// ─── Helpers compartilhados ─────────────────────────────────

function getSocialLinks(perfil: PerfilEmpresa): Array<{ platform: string; url: string }> {
  const links: Array<{ platform: string; url: string }> = []
  if (perfil.redes_sociais?.instagram) {
    const handle = perfil.redes_sociais.instagram.replace(/@/g, '')
    links.push({ platform: 'instagram', url: `https://instagram.com/${handle}` })
  }
  if (perfil.redes_sociais?.facebook) {
    const fb = perfil.redes_sociais.facebook
    links.push({ platform: 'facebook', url: fb.startsWith('http') ? fb : `https://facebook.com/${fb}` })
  }
  if (perfil.redes_sociais?.linkedin) {
    const li = perfil.redes_sociais.linkedin
    links.push({ platform: 'linkedin', url: li.startsWith('http') ? li : `https://linkedin.com/company/${li}` })
  }
  if (perfil.redes_sociais?.youtube) {
    const yt = perfil.redes_sociais.youtube
    links.push({ platform: 'youtube', url: yt.startsWith('http') ? yt : `https://youtube.com/${yt}` })
  }
  if (perfil.redes_sociais?.twitter) {
    const tw = perfil.redes_sociais.twitter
    links.push({ platform: 'twitter', url: tw.startsWith('http') ? tw : `https://x.com/${tw}` })
  }
  if (perfil.redes_sociais?.site) {
    const site = perfil.redes_sociais.site
    links.push({ platform: 'site', url: site.startsWith('http') ? site : `https://${site}` })
  }
  return links
}

function getContactLines(perfil: PerfilEmpresa): string[] {
  const lines: string[] = []
  if (perfil.telefone) lines.push(perfil.telefone)
  if (perfil.whatsapp && perfil.whatsapp !== perfil.telefone) lines.push(`WhatsApp: ${perfil.whatsapp}`)
  if (perfil.email_contato) lines.push(perfil.email_contato)
  if (perfil.horario_atendimento) lines.push(perfil.horario_atendimento)
  return lines
}

function getAddressLines(perfil: PerfilEmpresa): string[] {
  const lines: string[] = []
  if (perfil.logradouro) {
    let addr = perfil.logradouro
    if (perfil.numero) addr += `, ${perfil.numero}`
    lines.push(addr)
  }
  if (perfil.bairro) lines.push(perfil.bairro)
  if (perfil.cidade && perfil.estado) {
    let cityLine = `${perfil.cidade}/${perfil.estado}`
    if (perfil.cep) cityLine += ` - CEP ${perfil.cep}`
    lines.push(cityLine)
  }
  return lines
}

function getCopyrightText(nome: string, cnpj?: string | null): string {
  const year = new Date().getFullYear()
  const parts = [nome]
  if (cnpj) parts.push(`CNPJ: ${cnpj}`)
  parts.push(`© ${year}. Todos os direitos reservados.`)
  return parts.join('  ·  ')
}

// ─── Dispatcher ─────────────────────────────────────────────

export function buildFooter(
  perfil: PerfilEmpresa,
  nome: string,
  palette: ColorPalette,
  variant?: FooterVariant,
): TemplateNode {
  if (variant === 'columns') return buildFooterColumns(perfil, nome, palette)
  if (variant === 'compact') return buildFooterCompact(perfil, nome, palette)
  return buildFooterCentered(perfil, nome, palette)
}

// ─── CENTERED: Tudo empilhado centralizado (padrão) ─────────

function buildFooterCentered(
  perfil: PerfilEmpresa,
  nome: string,
  palette: ColorPalette,
): TemplateNode {
  const footerBg = palette.primaryDarker
  const mutedText = palette.textMutedOnDark
  const lightText = palette.textOnDark

  const brandChildren: TemplateNode[] = []
  if (perfil.logo_url) {
    brandChildren.push({
      type: 'ImageComponent', displayName: 'Logo Footer',
      props: { src: perfil.logo_url, alt: nome, width: '160px', height: 'auto', objectFit: 'contain', borderRadius: 0, backgroundColor: 'transparent', filter: 'brightness(0) invert(1)' },
    })
  }
  brandChildren.push({
    type: 'TextComponent', displayName: 'Nome Footer',
    props: { text: nome, fontSize: '20', fontWeight: '700', textAlign: 'center', color: lightText, margin: [perfil.logo_url ? 12 : 0, 0, 0, 0] },
  })
  if (perfil.slogan) {
    brandChildren.push({
      type: 'TextComponent', displayName: 'Slogan Footer',
      props: { text: perfil.slogan, fontSize: '14', fontWeight: '400', textAlign: 'center', color: mutedText, lineHeight: '1.5', margin: [4, 0, 0, 0] },
    })
  }

  const contactLines = getContactLines(perfil)
  const addrLines = getAddressLines(perfil)
  const infoCols: TemplateNode[] = []

  if (contactLines.length > 0) {
    infoCols.push({
      type: 'ContainerComponent', isCanvas: true, displayName: 'Col Footer – Contato',
      props: { background: 'transparent', padding: 0, gap: 0, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', shadow: 0, radius: 0 },
      children: [
        { type: 'TextComponent', displayName: 'Título Contato', props: { text: 'Contato', fontSize: '13', fontWeight: '700', textAlign: 'center', color: lightText, margin: [0, 0, 10, 0], letterSpacing: '1.5', textTransform: 'uppercase' } },
        { type: 'TextComponent', displayName: 'Dados Contato', props: { text: contactLines.join('\n'), fontSize: '13', fontWeight: '400', textAlign: 'center', color: mutedText, lineHeight: '1.8' } },
      ],
    })
  }
  if (addrLines.length > 0) {
    infoCols.push({
      type: 'ContainerComponent', isCanvas: true, displayName: 'Col Footer – Endereço',
      props: { background: 'transparent', padding: 0, gap: 0, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', shadow: 0, radius: 0 },
      children: [
        { type: 'TextComponent', displayName: 'Título Endereço', props: { text: 'Endereço', fontSize: '13', fontWeight: '700', textAlign: 'center', color: lightText, margin: [0, 0, 10, 0], letterSpacing: '1.5', textTransform: 'uppercase' } },
        { type: 'TextComponent', displayName: 'Dados Endereço', props: { text: addrLines.join('\n'), fontSize: '13', fontWeight: '400', textAlign: 'center', color: mutedText, lineHeight: '1.8' } },
      ],
    })
  }

  const socialLinks = getSocialLinks(perfil)
  const bottomChildren: TemplateNode[] = []
  if (socialLinks.length > 0) {
    bottomChildren.push({
      type: 'SocialLinksComponent', displayName: 'Redes Sociais',
      props: { links: socialLinks, iconColor: mutedText, iconSize: 20, gap: 20, justifyContent: 'center' },
    })
  }
  bottomChildren.push({
    type: 'TextComponent', displayName: 'Copyright',
    props: { text: getCopyrightText(nome, perfil.cnpj), fontSize: '12', fontWeight: '400', textAlign: 'center', color: palette.textMutedOnDark },
  })

  const footerChildren: TemplateNode[] = [
    {
      type: 'ContainerComponent', isCanvas: true, displayName: 'Footer – Marca',
      props: { background: 'transparent', padding: 0, gap: 4, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0 },
      children: brandChildren,
    },
  ]
  if (infoCols.length > 0) {
    footerChildren.push({
      type: 'ContainerComponent', isCanvas: true, displayName: 'Footer – Info',
      props: { background: 'transparent', padding: [24, 0, 0, 0], gap: 40, width: '100%', height: 'auto', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', shadow: 0, radius: 0, flexWrap: 'wrap' },
      children: infoCols,
    })
  }
  footerChildren.push({ type: 'DividerComponent', displayName: 'Divider Footer', props: { color: palette.dividerOnDark, thickness: 1, marginY: 8, style: 'solid' } })
  footerChildren.push({
    type: 'ContainerComponent', isCanvas: true, displayName: 'Rodapé Inferior',
    props: { background: 'transparent', padding: 0, gap: 12, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0 },
    children: bottomChildren,
  })

  return {
    type: 'FooterComponent', isCanvas: true, displayName: 'Rodapé',
    props: {
      background: footerBg, gradientFrom: footerBg, gradientTo: palette.primaryDark,
      gradientType: 'linear' as const, gradientDirection: '135deg',
      paddingY: 56, columns: 1, contentMaxWidth: CONTENT_MAX_WIDTH,
    },
    children: footerChildren,
  }
}

// ─── COLUMNS: Grid 3 colunas (marca | contato | endereço) ───

function buildFooterColumns(
  perfil: PerfilEmpresa,
  nome: string,
  palette: ColorPalette,
): TemplateNode {
  const footerBg = palette.primaryDarker
  const mutedText = palette.textMutedOnDark
  const lightText = palette.textOnDark

  // Coluna 1: Marca (alinhada à esquerda)
  const brandCol: TemplateNode[] = []
  if (perfil.logo_url) {
    brandCol.push({
      type: 'ImageComponent', displayName: 'Logo Footer',
      props: { src: perfil.logo_url, alt: nome, width: '180px', height: 'auto', objectFit: 'contain', borderRadius: 0, filter: 'brightness(0) invert(1)' },
    })
  }
  brandCol.push({
    type: 'TextComponent', displayName: 'Nome Footer',
    props: { text: nome, fontSize: '18', fontWeight: '800', textAlign: 'left', color: lightText, margin: [perfil.logo_url ? 8 : 0, 0, 0, 0] },
  })
  if (perfil.slogan) {
    brandCol.push({
      type: 'TextComponent', displayName: 'Slogan Footer',
      props: { text: perfil.slogan, fontSize: '14', fontWeight: '400', textAlign: 'left', color: mutedText, lineHeight: '1.5', margin: [4, 0, 0, 0] },
    })
  }

  // Coluna 2: Contato
  const contactLines = getContactLines(perfil)
  const contactCol: TemplateNode[] = [
    { type: 'TextComponent', displayName: 'Título Contato', props: { text: 'Contato', fontSize: '13', fontWeight: '700', textAlign: 'left', color: lightText, margin: [0, 0, 12, 0], letterSpacing: '1', textTransform: 'uppercase' } },
  ]
  if (contactLines.length > 0) {
    contactCol.push({
      type: 'TextComponent', displayName: 'Dados Contato',
      props: { text: contactLines.join('\n'), fontSize: '14', fontWeight: '400', textAlign: 'left', color: mutedText, lineHeight: '1.8' },
    })
  }

  // Coluna 3: Endereço
  const addrLines = getAddressLines(perfil)
  const addrCol: TemplateNode[] = [
    { type: 'TextComponent', displayName: 'Título Endereço', props: { text: 'Endereço', fontSize: '13', fontWeight: '700', textAlign: 'left', color: lightText, margin: [0, 0, 12, 0], letterSpacing: '1', textTransform: 'uppercase' } },
  ]
  if (addrLines.length > 0) {
    addrCol.push({
      type: 'TextComponent', displayName: 'Dados Endereço',
      props: { text: addrLines.join('\n'), fontSize: '14', fontWeight: '400', textAlign: 'left', color: mutedText, lineHeight: '1.8' },
    })
  }

  const gridChildren: TemplateNode[] = [
    {
      type: 'ContainerComponent', isCanvas: true, displayName: 'Col Marca',
      props: { background: 'transparent', padding: 0, gap: 0, width: 'auto', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', shadow: 0, radius: 0, flex: '2 1 280px' },
      children: brandCol,
    },
    {
      type: 'ContainerComponent', isCanvas: true, displayName: 'Col Contato',
      props: { background: 'transparent', padding: 0, gap: 0, width: 'auto', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', shadow: 0, radius: 0, flex: '1 1 180px' },
      children: contactCol,
    },
    {
      type: 'ContainerComponent', isCanvas: true, displayName: 'Col Endereço',
      props: { background: 'transparent', padding: 0, gap: 0, width: 'auto', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', shadow: 0, radius: 0, flex: '1 1 180px' },
      children: addrCol,
    },
  ]

  const socialLinks = getSocialLinks(perfil)
  const bottomChildren: TemplateNode[] = []
  if (socialLinks.length > 0) {
    bottomChildren.push({
      type: 'SocialLinksComponent', displayName: 'Redes Sociais',
      props: { links: socialLinks, iconColor: mutedText, iconSize: 18, gap: 16, justifyContent: 'center' },
    })
  }
  bottomChildren.push({
    type: 'TextComponent', displayName: 'Copyright',
    props: { text: getCopyrightText(nome, perfil.cnpj), fontSize: '12', fontWeight: '400', textAlign: 'center', color: palette.textMutedOnDark },
  })

  return {
    type: 'FooterComponent', isCanvas: true, displayName: 'Rodapé',
    props: {
      background: footerBg, gradientFrom: footerBg, gradientTo: palette.primaryDark,
      gradientType: 'linear' as const, gradientDirection: '180deg',
      paddingY: 48, columns: 1, contentMaxWidth: CONTENT_MAX_WIDTH,
    },
    children: [
      {
        type: 'ContainerComponent', isCanvas: true, displayName: 'Footer Grid',
        props: { background: 'transparent', padding: 0, gap: 48, width: '100%', height: 'auto', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', shadow: 0, radius: 0, marginBottom: 32 },
        children: gridChildren,
      },
      { type: 'DividerComponent', displayName: 'Divider Footer', props: { color: palette.dividerOnDark, thickness: 1, marginY: 0, style: 'solid' } },
      {
        type: 'ContainerComponent', isCanvas: true, displayName: 'Rodapé Inferior',
        props: { background: 'transparent', padding: 0, gap: 12, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0, marginTop: 20 },
        children: bottomChildren,
      },
    ],
  }
}

// ─── COMPACT: Linha horizontal (marca esquerda, info direita) ─

function buildFooterCompact(
  perfil: PerfilEmpresa,
  nome: string,
  palette: ColorPalette,
): TemplateNode {
  const footerBg = palette.primaryDarker
  const mutedText = palette.textMutedOnDark
  const lightText = palette.textOnDark

  // Esquerda: marca
  const leftChildren: TemplateNode[] = []
  if (perfil.logo_url) {
    leftChildren.push({
      type: 'ImageComponent', displayName: 'Logo Footer',
      props: { src: perfil.logo_url, alt: nome, width: '140px', height: 'auto', objectFit: 'contain', borderRadius: 0, filter: 'brightness(0) invert(1)' },
    })
  }
  leftChildren.push({
    type: 'TextComponent', displayName: 'Nome Footer',
    props: { text: nome, fontSize: '14', fontWeight: '900', textAlign: 'left', color: lightText, textTransform: 'uppercase', letterSpacing: '2', margin: [perfil.logo_url ? 4 : 0, 0, 4, 0] },
  })
  if (perfil.slogan) {
    leftChildren.push({
      type: 'TextComponent', displayName: 'Slogan',
      props: { text: perfil.slogan, fontSize: '12', fontWeight: '400', textAlign: 'left', color: mutedText },
    })
  }

  // Direita: info compacta
  const rightChildren: TemplateNode[] = []
  const contactLines = getContactLines(perfil)
  if (contactLines.length > 0) {
    rightChildren.push({
      type: 'ContainerComponent', isCanvas: true, displayName: 'Info Contato',
      props: { background: 'transparent', padding: 0, gap: 0, width: 'auto', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', shadow: 0, radius: 0 },
      children: [
        { type: 'TextComponent', displayName: 'Título', props: { text: 'CONTATO', fontSize: '11', fontWeight: '700', textAlign: 'left', color: lightText, letterSpacing: '1', margin: [0, 0, 8, 0] } },
        { type: 'TextComponent', displayName: 'Dados', props: { text: contactLines.join('\n'), fontSize: '12', fontWeight: '400', textAlign: 'left', color: mutedText, lineHeight: '1.8' } },
      ],
    })
  }
  const addrLines = getAddressLines(perfil)
  if (addrLines.length > 0) {
    rightChildren.push({
      type: 'ContainerComponent', isCanvas: true, displayName: 'Info Endereço',
      props: { background: 'transparent', padding: 0, gap: 0, width: 'auto', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', shadow: 0, radius: 0 },
      children: [
        { type: 'TextComponent', displayName: 'Título', props: { text: 'ENDEREÇO', fontSize: '11', fontWeight: '700', textAlign: 'left', color: lightText, letterSpacing: '1', margin: [0, 0, 8, 0] } },
        { type: 'TextComponent', displayName: 'Dados', props: { text: addrLines.join('\n'), fontSize: '12', fontWeight: '400', textAlign: 'left', color: mutedText, lineHeight: '1.8' } },
      ],
    })
  }

  const socialLinks = getSocialLinks(perfil)

  return {
    type: 'FooterComponent', isCanvas: true, displayName: 'Rodapé',
    props: {
      background: footerBg, gradientFrom: footerBg, gradientTo: palette.primaryDark,
      gradientType: 'linear' as const, gradientDirection: '135deg',
      paddingY: 40, columns: 1, contentMaxWidth: CONTENT_MAX_WIDTH,
    },
    children: [
      {
        type: 'ContainerComponent', isCanvas: true, displayName: 'Footer Row',
        props: { background: 'transparent', padding: 0, gap: 48, width: '100%', height: 'auto', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', shadow: 0, radius: 0, marginBottom: 24 },
        children: [
          {
            type: 'ContainerComponent', isCanvas: true, displayName: 'Footer Left',
            props: { background: 'transparent', padding: 0, gap: 0, width: 'auto', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', shadow: 0, radius: 0, flex: '1 1 200px' },
            children: leftChildren,
          },
          {
            type: 'ContainerComponent', isCanvas: true, displayName: 'Footer Right',
            props: { background: 'transparent', padding: 0, gap: 32, width: 'auto', height: 'auto', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end', flexWrap: 'wrap', shadow: 0, radius: 0, flex: '2 1 400px' },
            children: rightChildren,
          },
        ],
      },
      { type: 'DividerComponent', displayName: 'Divider Footer', props: { color: palette.dividerOnDark, thickness: 1, marginY: 0, style: 'solid' } },
      {
        type: 'ContainerComponent', isCanvas: true, displayName: 'Rodapé Inferior',
        props: { background: 'transparent', padding: 0, gap: 16, width: '100%', height: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', shadow: 0, radius: 0, marginTop: 16 },
        children: [
          {
            type: 'TextComponent', displayName: 'Copyright',
            props: { text: getCopyrightText(nome, perfil.cnpj), fontSize: '11', fontWeight: '400', textAlign: 'left', color: palette.textMutedOnDark },
          },
          ...(socialLinks.length > 0 ? [{
            type: 'SocialLinksComponent' as const, displayName: 'Redes Sociais',
            props: { links: socialLinks, iconColor: mutedText, iconSize: 16, gap: 16, justifyContent: 'flex-end' },
          }] : []),
        ],
      },
    ],
  }
}
