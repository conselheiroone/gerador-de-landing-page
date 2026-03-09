/**
 * Starter Templates — templates completos (página inteira) para iniciar.
 * Admin escolhe um starter, define o título e abre o editor com ele carregado.
 */

import { buildCraftJson, type TemplateNode } from '@/features/editor/utils/default-templates'

export interface StarterTemplate {
  id: string
  nome: string
  descricao: string
  categoria: string
  json: string
}

// ─── Cores padrão ────────────────────────────────────────────
const PRI = '#2563eb'
const SEC = '#1A1A1A'
const WHITE = '#ffffff'
const LIGHT = '#f8fafc'
const DARK = '#0f172a'

// ─── Helpers ─────────────────────────────────────────────────

function page(children: TemplateNode[]): string {
  return buildCraftJson({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Página',
    props: {
      background: WHITE,
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
    children,
  })
}

function navbar(): TemplateNode {
  return {
    type: 'NavbarComponent',
    displayName: 'Navbar',
    props: {
      background: DARK,
      logoText: 'Sua Empresa',
      logoSrc: '',
      links: [
        { label: 'Início', href: '#' },
        { label: 'Serviços', href: '#servicos' },
        { label: 'Sobre', href: '#sobre' },
        { label: 'Contato', href: '#contato' },
      ],
      ctaText: 'Fale Conosco',
      ctaBg: PRI,
      ctaColor: WHITE,
      ctaBorderRadius: 50,
      linkColor: WHITE,
      linkFontSize: 15,
      paddingX: 48,
      paddingY: 18,
    },
  }
}

function heroCenter(titulo: string, subtitulo: string): TemplateNode {
  return {
    type: 'HeroSectionComponent',
    isCanvas: true,
    displayName: 'Hero',
    props: {
      background: DARK,
      gradientFrom: '#1e3a5f',
      gradientTo: DARK,
      gradientType: 'linear',
      gradientDirection: '180deg',
      paddingY: 80,
      textAlign: 'center',
      minHeight: '480px',
    },
    children: [
      { type: 'HeadingComponent', displayName: 'Título', props: { text: titulo, tagName: 'h1', fontSize: '48', fontWeight: '900', textAlign: 'center', color: WHITE, lineHeight: '1.1', maxWidth: '700' } },
      { type: 'TextComponent', displayName: 'Subtítulo', props: { text: subtitulo, fontSize: '18', fontWeight: '400', textAlign: 'center', color: '#cbd5e1', lineHeight: '1.6', margin: [8, 0, 16, 0] } },
      { type: 'ButtonComponent', displayName: 'CTA', props: { text: 'Começar Agora', href: '#contato', background: PRI, color: WHITE, size: 'lg', buttonStyle: 'filled', borderRadius: 50 } },
    ],
  }
}

function secaoServicos(): TemplateNode {
  const card = (t: string, d: string): TemplateNode => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: t,
    props: { background: WHITE, padding: 28, gap: 10, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', shadow: 2, radius: 12, borderAccent: PRI, borderAccentPosition: 'top' },
    children: [
      { type: 'HeadingComponent', displayName: 'T', props: { text: t, tagName: 'h3', fontSize: '17', fontWeight: '700', textAlign: 'left', color: SEC, lineHeight: '1.4' } },
      { type: 'TextComponent', displayName: 'D', props: { text: d, fontSize: '15', fontWeight: '400', textAlign: 'left', color: '#64748b', lineHeight: '1.6' } },
    ],
  })

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Serviços',
    props: { background: LIGHT, padding: 60, gap: 20, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', shadow: 0, radius: 0 },
    children: [
      { type: 'TextComponent', displayName: 'Tag', props: { text: 'NOSSOS SERVIÇOS', fontSize: '13', fontWeight: '700', textAlign: 'center', color: PRI, letterSpacing: '2' } },
      { type: 'HeadingComponent', displayName: 'Título', props: { text: 'O Que Fazemos', tagName: 'h2', fontSize: '36', fontWeight: '800', textAlign: 'center', color: SEC, lineHeight: '1.2', margin: [0, 0, 12, 0] } },
      {
        type: 'FeaturesSectionComponent',
        isCanvas: true,
        displayName: 'Grid',
        props: { background: 'transparent', columns: 3, gap: 24, paddingY: 0 },
        children: [
          card('Consultoria', 'Análise completa do seu negócio com plano personalizado.'),
          card('Desenvolvimento', 'Soluções digitais sob medida para suas necessidades.'),
          card('Gestão', 'Acompanhamento de projetos com metodologias ágeis.'),
        ],
      },
    ],
  }
}

function secaoSobre(): TemplateNode {
  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Sobre',
    props: { background: WHITE, padding: 60, gap: 40, width: '100%', height: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0 },
    children: [
      { type: 'ImageComponent', displayName: 'Foto', props: { src: '', alt: 'Sobre nós', width: '45%', height: '320px', objectFit: 'cover', borderRadius: 12 } },
      {
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Texto',
        props: { background: 'transparent', padding: 0, gap: 12, width: '50%', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', shadow: 0, radius: 0 },
        children: [
          { type: 'TextComponent', displayName: 'Tag', props: { text: 'SOBRE NÓS', fontSize: '13', fontWeight: '700', textAlign: 'left', color: PRI, letterSpacing: '2' } },
          { type: 'HeadingComponent', displayName: 'Título', props: { text: 'Nossa História', tagName: 'h2', fontSize: '32', fontWeight: '800', textAlign: 'left', color: SEC, lineHeight: '1.2' } },
          { type: 'TextComponent', displayName: 'Desc', props: { text: 'Com anos de experiência, construímos nossa reputação com base na confiança e entrega de resultados excepcionais.', fontSize: '16', fontWeight: '400', textAlign: 'left', color: '#64748b', lineHeight: '1.7' } },
        ],
      },
    ],
  }
}

function secaoCta(): TemplateNode {
  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'CTA',
    props: { background: PRI, padding: 60, gap: 16, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0 },
    children: [
      { type: 'HeadingComponent', displayName: 'Título', props: { text: 'Pronto para Começar?', tagName: 'h2', fontSize: '36', fontWeight: '800', textAlign: 'center', color: WHITE, lineHeight: '1.2' } },
      { type: 'TextComponent', displayName: 'Desc', props: { text: 'Entre em contato e descubra como podemos ajudar.', fontSize: '18', fontWeight: '400', textAlign: 'center', color: 'rgba(255,255,255,0.9)', lineHeight: '1.6' } },
      { type: 'ButtonComponent', displayName: 'Botão', props: { text: 'Fale Conosco', href: '#contato', background: WHITE, color: PRI, size: 'lg', buttonStyle: 'filled', borderRadius: 50 } },
    ],
  }
}

function footer(): TemplateNode {
  return {
    type: 'FooterComponent',
    displayName: 'Rodapé',
    props: {
      background: '#111827',
      paddingY: 40,
      columns: 3,
      logoText: 'Sua Empresa',
      descricao: 'Soluções profissionais para seu negócio.',
      links: [
        { label: 'Início', href: '#' },
        { label: 'Serviços', href: '#servicos' },
        { label: 'Sobre', href: '#sobre' },
        { label: 'Contato', href: '#contato' },
      ],
      contato: { email: 'contato@empresa.com', telefone: '(11) 9999-0000', endereco: 'São Paulo, SP' },
      copyright: '© 2026 Sua Empresa. Todos os direitos reservados.',
      textColor: '#9ca3af',
      linkColor: '#d1d5db',
    },
  }
}

function secaoStats(): TemplateNode {
  return {
    type: 'StatsBandComponent',
    displayName: 'Stats',
    props: {
      background: DARK,
      textColor: WHITE,
      accentColor: PRI,
      labelColor: '#94a3b8',
      paddingY: 40,
      showDivider: true,
      stats: [
        { valor: '10+', label: 'Anos' },
        { valor: '500+', label: 'Projetos' },
        { valor: '98%', label: 'Satisfação' },
      ],
    },
  }
}

function secaoDepoimentos(): TemplateNode {
  return {
    type: 'TestimonialsGridComponent',
    displayName: 'Depoimentos',
    props: {
      background: LIGHT,
      cardBackground: WHITE,
      accentColor: PRI,
      textColor: SEC,
      paddingY: 60,
      columns: 3,
      showStars: true,
      sectionTag: 'DEPOIMENTOS',
      sectionTitle: 'O Que Dizem Sobre Nós',
      depoimentos: [
        { nomeCliente: 'Maria Silva', cargo: 'CEO', citacao: 'Excelente trabalho! Superaram expectativas.', nota: 5 },
        { nomeCliente: 'João Pereira', cargo: 'Diretor', citacao: 'Profissionalismo em cada detalhe.', nota: 5 },
        { nomeCliente: 'Ana Costa', cargo: 'Gerente', citacao: 'Atendimento personalizado e resultados.', nota: 5 },
      ],
    },
  }
}

function secaoPrecos(): TemplateNode {
  const plano = (nome: string, preco: string, dest: boolean): TemplateNode => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: nome,
    props: { background: dest ? PRI : WHITE, padding: 32, gap: 12, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', shadow: dest ? 3 : 1, radius: 16 },
    children: [
      { type: 'TextComponent', displayName: 'Nome', props: { text: nome.toUpperCase(), fontSize: '13', fontWeight: '700', textAlign: 'center', color: dest ? 'rgba(255,255,255,0.8)' : PRI, letterSpacing: '2' } },
      { type: 'HeadingComponent', displayName: 'Preco', props: { text: preco, tagName: 'h3', fontSize: '40', fontWeight: '900', textAlign: 'center', color: dest ? WHITE : SEC, lineHeight: '1.1' } },
      { type: 'ButtonComponent', displayName: 'CTA', props: { text: 'Escolher', href: '#', background: dest ? WHITE : PRI, color: dest ? PRI : WHITE, size: 'md', buttonStyle: 'filled', borderRadius: 8 } },
    ],
  })

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Preços',
    props: { background: LIGHT, padding: 60, gap: 20, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', shadow: 0, radius: 0 },
    children: [
      { type: 'TextComponent', displayName: 'Tag', props: { text: 'PLANOS', fontSize: '13', fontWeight: '700', textAlign: 'center', color: PRI, letterSpacing: '2' } },
      { type: 'HeadingComponent', displayName: 'Título', props: { text: 'Escolha o Plano Ideal', tagName: 'h2', fontSize: '36', fontWeight: '800', textAlign: 'center', color: SEC, lineHeight: '1.2', margin: [0, 0, 12, 0] } },
      {
        type: 'FeaturesSectionComponent',
        isCanvas: true,
        displayName: 'Grid',
        props: { background: 'transparent', columns: 3, gap: 24, paddingY: 0 },
        children: [
          plano('Básico', 'R$ 97/mês', false),
          plano('Pro', 'R$ 197/mês', true),
          plano('Enterprise', 'Consulte', false),
        ],
      },
    ],
  }
}

// ─── Templates completos ─────────────────────────────────────

export const starterTemplates: StarterTemplate[] = [
  {
    id: 'starter-blank',
    nome: 'Em Branco',
    descricao: 'Comece do zero com um canvas vazio.',
    categoria: 'Básico',
    json: '',
  },
  {
    id: 'starter-negocio',
    nome: 'Negócio Profissional',
    descricao: 'Template completo: Navbar, Hero, Stats, Serviços, Sobre, Depoimentos, CTA e Rodapé.',
    categoria: 'Negócios',
    json: page([
      navbar(),
      heroCenter('Soluções Profissionais para Seu Negócio', 'Transformamos desafios em resultados com qualidade e compromisso.'),
      secaoStats(),
      secaoServicos(),
      secaoSobre(),
      secaoDepoimentos(),
      secaoCta(),
      footer(),
    ]),
  },
  {
    id: 'starter-portfolio',
    nome: 'Portfolio Criativo',
    descricao: 'Hero impactante, seção sobre e CTA. Ideal para freelancers e criativos.',
    categoria: 'Portfolio',
    json: page([
      navbar(),
      heroCenter('Seu Nome Aqui', 'Designer, Desenvolvedor & Criativo. Transformando ideias em experiências digitais.'),
      secaoSobre(),
      secaoCta(),
      footer(),
    ]),
  },
  {
    id: 'starter-landing',
    nome: 'Landing Page Simples',
    descricao: 'Hero + Serviços + CTA. Direto ao ponto para conversão.',
    categoria: 'Landing Page',
    json: page([
      navbar(),
      heroCenter('Sua Oferta Irresistível', 'Descubra como resolver seu problema de forma simples e eficaz.'),
      secaoServicos(),
      secaoCta(),
      footer(),
    ]),
  },
  {
    id: 'starter-saas',
    nome: 'SaaS / Produto',
    descricao: 'Hero, Features, Preços, Depoimentos e CTA. Estrutura para produtos digitais.',
    categoria: 'SaaS',
    json: page([
      navbar(),
      heroCenter('A Plataforma que Seu Negócio Precisa', 'Automatize processos, ganhe tempo e escale resultados.'),
      secaoServicos(),
      secaoPrecos(),
      secaoDepoimentos(),
      secaoCta(),
      footer(),
    ]),
  },
]
