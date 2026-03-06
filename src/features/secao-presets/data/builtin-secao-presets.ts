/**
 * Seções prontas built-in para o editor.
 * Cada preset é uma seção completa com textos placeholder genéricos.
 * Usa TemplateNode + buildCraftJson() para gerar Craft.js JSON.
 */

import { buildCraftJson, type TemplateNode } from '@/features/editor/utils/default-templates'
import type { SecaoCategoria } from '../types/secao-presets.types'

export interface BuiltinSecaoPreset {
  id: string
  nome: string
  categoria: SecaoCategoria
  descricao: string
  json: string
}

// ─── Cores padrão para presets ───────────────────────────────
const PRIMARY = '#2563eb'
const SECONDARY = '#1A1A1A'
const LIGHT_BG = '#f8fafc'
const WHITE = '#ffffff'
const DARK = '#0f172a'

// ─── HERO ────────────────────────────────────────────────────

function heroCenter(): TemplateNode {
  return {
    type: 'HeroSectionComponent',
    isCanvas: true,
    displayName: 'Hero Centralizado',
    props: {
      background: DARK,
      gradientFrom: '#1e3a5f',
      gradientTo: '#0f172a',
      gradientType: 'linear',
      gradientDirection: '180deg',
      paddingY: 80,
      textAlign: 'center',
      minHeight: '500px',
    },
    children: [
      {
        type: 'TextComponent',
        displayName: 'Tag',
        props: {
          text: 'BEM-VINDO À NOSSA EMPRESA',
          fontSize: '13',
          fontWeight: '700',
          textAlign: 'center',
          color: PRIMARY,
          letterSpacing: '2.5',
          margin: [0, 0, 12, 0],
        },
      },
      {
        type: 'HeadingComponent',
        displayName: 'Titulo Hero',
        props: {
          text: 'Soluções Profissionais para o Seu Negócio',
          tagName: 'h1',
          fontSize: '48',
          fontWeight: '900',
          textAlign: 'center',
          color: WHITE,
          lineHeight: '1.1',
          maxWidth: '700',
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Subtitulo Hero',
        props: {
          text: 'Transformamos desafios em resultados com qualidade, compromisso e experiência comprovada no mercado.',
          fontSize: '18',
          fontWeight: '400',
          textAlign: 'center',
          color: '#cbd5e1',
          lineHeight: '1.6',
          margin: [8, 0, 16, 0],
        },
      },
      {
        type: 'ButtonComponent',
        displayName: 'CTA Hero',
        props: {
          text: 'Comece Agora',
          href: '#contato',
          background: PRIMARY,
          color: WHITE,
          size: 'lg',
          buttonStyle: 'filled',
          borderRadius: 50,
        },
      },
    ],
  }
}

function heroSplit(): TemplateNode {
  return {
    type: 'HeroSectionComponent',
    isCanvas: true,
    displayName: 'Hero com Imagem',
    props: {
      background: DARK,
      gradientFrom: '#1e3a5f',
      gradientTo: '#0f172a',
      gradientType: 'linear',
      gradientDirection: '135deg',
      paddingY: 60,
      textAlign: 'left',
      minHeight: '480px',
    },
    children: [
      {
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Hero Grid',
        props: {
          background: 'transparent',
          padding: 0,
          gap: 40,
          width: '100%',
          height: 'auto',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          shadow: 0,
          radius: 0,
        },
        children: [
          {
            type: 'ContainerComponent',
            isCanvas: true,
            displayName: 'Hero Texto',
            props: {
              background: 'transparent',
              padding: 0,
              gap: 8,
              width: '55%',
              height: 'auto',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              shadow: 0,
              radius: 0,
            },
            children: [
              {
                type: 'HeadingComponent',
                displayName: 'Titulo',
                props: {
                  text: 'Cresça Seu Negócio com Estratégia',
                  tagName: 'h1',
                  fontSize: '44',
                  fontWeight: '900',
                  textAlign: 'left',
                  color: WHITE,
                  lineHeight: '1.15',
                },
              },
              {
                type: 'TextComponent',
                displayName: 'Subtitulo',
                props: {
                  text: 'Descubra como nossas soluções podem transformar sua empresa e impulsionar seus resultados.',
                  fontSize: '18',
                  fontWeight: '400',
                  textAlign: 'left',
                  color: '#cbd5e1',
                  lineHeight: '1.6',
                  margin: [4, 0, 12, 0],
                },
              },
              {
                type: 'ButtonComponent',
                displayName: 'CTA',
                props: {
                  text: 'Saiba Mais',
                  href: '#servicos',
                  background: PRIMARY,
                  color: WHITE,
                  size: 'lg',
                  buttonStyle: 'filled',
                  borderRadius: 8,
                },
              },
            ],
          },
          {
            type: 'ImageComponent',
            displayName: 'Imagem Hero',
            props: {
              src: '',
              alt: 'Hero',
              width: '40%',
              height: 'auto',
              objectFit: 'cover',
              borderRadius: 12,
            },
          },
        ],
      },
    ],
  }
}

function heroGradient(): TemplateNode {
  return {
    type: 'HeroSectionComponent',
    isCanvas: true,
    displayName: 'Hero Gradiente',
    props: {
      background: PRIMARY,
      gradientFrom: PRIMARY,
      gradientTo: '#7c3aed',
      gradientType: 'linear',
      gradientDirection: '135deg',
      paddingY: 100,
      textAlign: 'center',
      minHeight: '550px',
    },
    children: [
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: {
          text: 'Inovação que Transforma Resultados',
          tagName: 'h1',
          fontSize: '52',
          fontWeight: '900',
          textAlign: 'center',
          color: WHITE,
          lineHeight: '1.1',
          maxWidth: '750',
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Subtitulo',
        props: {
          text: 'Uma plataforma completa para levar seu negócio ao próximo nível com tecnologia de ponta.',
          fontSize: '20',
          fontWeight: '400',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.9)',
          lineHeight: '1.6',
          margin: [12, 0, 20, 0],
        },
      },
      {
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Botoes',
        props: {
          background: 'transparent',
          padding: 0,
          gap: 12,
          width: 'auto',
          height: 'auto',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          shadow: 0,
          radius: 0,
        },
        children: [
          {
            type: 'ButtonComponent',
            displayName: 'CTA Primario',
            props: {
              text: 'Começar Grátis',
              href: '#',
              background: WHITE,
              color: PRIMARY,
              size: 'lg',
              buttonStyle: 'filled',
              borderRadius: 50,
            },
          },
          {
            type: 'ButtonComponent',
            displayName: 'CTA Secundario',
            props: {
              text: 'Ver Demonstração',
              href: '#',
              background: 'transparent',
              color: WHITE,
              size: 'lg',
              buttonStyle: 'outline',
              borderRadius: 50,
            },
          },
        ],
      },
    ],
  }
}

// ─── SOBRE ───────────────────────────────────────────────────

function sobreTexto(): TemplateNode {
  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Sobre — Texto',
    props: {
      background: LIGHT_BG,
      padding: 60,
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
        type: 'TextComponent',
        displayName: 'Tag',
        props: {
          text: 'SOBRE NÓS',
          fontSize: '13',
          fontWeight: '700',
          textAlign: 'center',
          color: PRIMARY,
          letterSpacing: '2',
        },
      },
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: {
          text: 'Conheça Nossa História',
          tagName: 'h2',
          fontSize: '36',
          fontWeight: '800',
          textAlign: 'center',
          color: SECONDARY,
          lineHeight: '1.2',
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Descricao',
        props: {
          text: 'Desde a nossa fundação, trabalhamos com dedicação para oferecer as melhores soluções do mercado. Nossa equipe é formada por profissionais experientes e comprometidos com a excelência em cada projeto.',
          fontSize: '16',
          fontWeight: '400',
          textAlign: 'center',
          color: '#64748b',
          lineHeight: '1.7',
          margin: [8, 0, 0, 0],
        },
      },
    ],
  }
}

function sobreDuasColunas(): TemplateNode {
  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Sobre — 2 Colunas',
    props: {
      background: WHITE,
      padding: 60,
      gap: 40,
      width: '100%',
      height: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadow: 0,
      radius: 0,
    },
    children: [
      {
        type: 'ImageComponent',
        displayName: 'Foto',
        props: {
          src: '',
          alt: 'Sobre nós',
          width: '45%',
          height: '360px',
          objectFit: 'cover',
          borderRadius: 12,
        },
      },
      {
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Texto Sobre',
        props: {
          background: 'transparent',
          padding: 0,
          gap: 12,
          width: '50%',
          height: 'auto',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          shadow: 0,
          radius: 0,
        },
        children: [
          {
            type: 'TextComponent',
            displayName: 'Tag',
            props: {
              text: 'QUEM SOMOS',
              fontSize: '13',
              fontWeight: '700',
              textAlign: 'left',
              color: PRIMARY,
              letterSpacing: '2',
            },
          },
          {
            type: 'HeadingComponent',
            displayName: 'Titulo',
            props: {
              text: 'Uma Empresa que Valoriza Pessoas',
              tagName: 'h2',
              fontSize: '32',
              fontWeight: '800',
              textAlign: 'left',
              color: SECONDARY,
              lineHeight: '1.2',
            },
          },
          {
            type: 'TextComponent',
            displayName: 'Descricao',
            props: {
              text: 'Com anos de experiência no mercado, construímos nossa reputação com base na confiança e na entrega de resultados excepcionais para nossos clientes.',
              fontSize: '16',
              fontWeight: '400',
              textAlign: 'left',
              color: '#64748b',
              lineHeight: '1.7',
            },
          },
          {
            type: 'ButtonComponent',
            displayName: 'CTA',
            props: {
              text: 'Conheça Nossa Equipe',
              href: '#equipe',
              background: PRIMARY,
              color: WHITE,
              size: 'md',
              buttonStyle: 'filled',
              borderRadius: 8,
            },
          },
        ],
      },
    ],
  }
}

// ─── SERVIÇOS ────────────────────────────────────────────────

function servicosGrid(): TemplateNode {
  const cardProps = (titulo: string, desc: string) => ({
    type: 'ContainerComponent' as const,
    isCanvas: true as const,
    displayName: titulo,
    props: {
      background: WHITE,
      padding: 28,
      gap: 10,
      width: '100%',
      height: 'auto',
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      shadow: 2,
      radius: 12,
      borderAccent: PRIMARY,
      borderAccentPosition: 'top',
    },
    children: [
      {
        type: 'HeadingComponent',
        displayName: `T ${titulo}`,
        props: {
          text: titulo,
          tagName: 'h3',
          fontSize: '17',
          fontWeight: '700',
          textAlign: 'left',
          color: SECONDARY,
          lineHeight: '1.4',
        },
      },
      {
        type: 'TextComponent',
        displayName: `D ${titulo}`,
        props: {
          text: desc,
          fontSize: '15',
          fontWeight: '400',
          textAlign: 'left',
          color: '#64748b',
          lineHeight: '1.6',
        },
      },
    ],
  })

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Serviços — Grid',
    props: {
      background: LIGHT_BG,
      padding: 60,
      gap: 20,
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
        displayName: 'Tag',
        props: {
          text: 'NOSSOS SERVIÇOS',
          fontSize: '13',
          fontWeight: '700',
          textAlign: 'center',
          color: PRIMARY,
          letterSpacing: '2',
        },
      },
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: {
          text: 'O Que Fazemos por Você',
          tagName: 'h2',
          fontSize: '36',
          fontWeight: '800',
          textAlign: 'center',
          color: SECONDARY,
          lineHeight: '1.2',
          margin: [0, 0, 12, 0],
        },
      },
      {
        type: 'FeaturesSectionComponent',
        isCanvas: true,
        displayName: 'Grid Serviços',
        props: {
          background: 'transparent',
          columns: 3,
          gap: 24,
          paddingY: 0,
        },
        children: [
          cardProps('Consultoria Estratégica', 'Análise completa do seu negócio com plano de ação personalizado para crescimento sustentável.'),
          cardProps('Desenvolvimento Digital', 'Criação de plataformas e ferramentas digitais sob medida para suas necessidades.'),
          cardProps('Gestão de Projetos', 'Acompanhamento completo de projetos do início ao fim com metodologias ágeis.'),
        ],
      },
    ],
  }
}

function servicosLista(): TemplateNode {
  const itemNode = (titulo: string, desc: string): TemplateNode => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: titulo,
    props: {
      background: 'transparent',
      padding: 20,
      gap: 4,
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
        type: 'HeadingComponent',
        displayName: `T ${titulo}`,
        props: {
          text: titulo,
          tagName: 'h3',
          fontSize: '20',
          fontWeight: '700',
          textAlign: 'left',
          color: SECONDARY,
          lineHeight: '1.4',
        },
      },
      {
        type: 'TextComponent',
        displayName: `D ${titulo}`,
        props: {
          text: desc,
          fontSize: '15',
          fontWeight: '400',
          textAlign: 'left',
          color: '#64748b',
          lineHeight: '1.6',
        },
      },
      {
        type: 'DividerComponent',
        displayName: 'Divisor',
        props: { color: '#e2e8f0', thickness: 1, margin: [12, 0, 0, 0] },
      },
    ],
  })

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Serviços — Lista',
    props: {
      background: WHITE,
      padding: 60,
      gap: 16,
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
        displayName: 'Tag',
        props: { text: 'SERVIÇOS', fontSize: '13', fontWeight: '700', textAlign: 'center', color: PRIMARY, letterSpacing: '2' },
      },
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: { text: 'Soluções Completas', tagName: 'h2', fontSize: '36', fontWeight: '800', textAlign: 'center', color: SECONDARY, lineHeight: '1.2' },
      },
      itemNode('Planejamento Estratégico', 'Definimos metas claras e caminhos para alcançar os resultados desejados.'),
      itemNode('Execução e Implementação', 'Colocamos o plano em prática com agilidade e precisão.'),
      itemNode('Monitoramento e Resultados', 'Acompanhamos métricas e ajustamos a rota para máxima performance.'),
    ],
  }
}

// ─── FEATURES ────────────────────────────────────────────────

function featuresBento(): TemplateNode {
  return {
    type: 'BentoFeaturesComponent',
    displayName: 'Features — Bento',
    props: {
      background: LIGHT_BG,
      cardBackground: WHITE,
      textColor: SECONDARY,
      descriptionColor: '#64748b',
      accentColor: PRIMARY,
      paddingY: 60,
      sectionTag: 'POR QUE NOS ESCOLHER',
      sectionTitle: 'Diferenciais que Fazem a Diferença',
      items: [
        { titulo: 'Experiência Comprovada', descricao: 'Mais de uma década atuando no mercado com resultados consistentes.', size: 'wide' },
        { titulo: 'Equipe Qualificada', descricao: 'Profissionais certificados e em constante atualização.', size: 'normal' },
        { titulo: 'Atendimento Personalizado', descricao: 'Cada cliente recebe atenção exclusiva e soluções sob medida.', size: 'normal' },
        { titulo: 'Tecnologia de Ponta', descricao: 'Utilizamos as ferramentas mais modernas do mercado.', size: 'wide' },
      ],
    },
  }
}

function featuresChecklist(): TemplateNode {
  const checkItem = (text: string): TemplateNode => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: text,
    props: {
      background: 'transparent',
      padding: 12,
      gap: 8,
      width: '100%',
      height: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      shadow: 0,
      radius: 0,
    },
    children: [
      {
        type: 'TextComponent',
        displayName: 'Check',
        props: { text: '✓', fontSize: '18', fontWeight: '700', color: PRIMARY, textAlign: 'center' },
      },
      {
        type: 'TextComponent',
        displayName: 'Item',
        props: { text, fontSize: '16', fontWeight: '500', color: SECONDARY, textAlign: 'left', lineHeight: '1.5' },
      },
    ],
  })

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Features — Checklist',
    props: {
      background: WHITE,
      padding: 60,
      gap: 16,
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
        displayName: 'Tag',
        props: { text: 'DIFERENCIAIS', fontSize: '13', fontWeight: '700', textAlign: 'center', color: PRIMARY, letterSpacing: '2' },
      },
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: { text: 'O Que Nos Torna Diferentes', tagName: 'h2', fontSize: '36', fontWeight: '800', textAlign: 'center', color: SECONDARY, lineHeight: '1.2' },
      },
      checkItem('Atendimento personalizado e dedicado'),
      checkItem('Prazos cumpridos com compromisso'),
      checkItem('Suporte técnico permanente'),
      checkItem('Metodologias ágeis e modernas'),
      checkItem('Transparência total nos processos'),
    ],
  }
}

// ─── CTA ─────────────────────────────────────────────────────

function ctaFaixa(): TemplateNode {
  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'CTA — Faixa',
    props: {
      background: PRIMARY,
      padding: 60,
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
        displayName: 'Titulo CTA',
        props: {
          text: 'Pronto para Começar?',
          tagName: 'h2',
          fontSize: '36',
          fontWeight: '800',
          textAlign: 'center',
          color: WHITE,
          lineHeight: '1.2',
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Descricao CTA',
        props: {
          text: 'Entre em contato e descubra como podemos ajudar seu negócio a crescer.',
          fontSize: '18',
          fontWeight: '400',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.9)',
          lineHeight: '1.6',
        },
      },
      {
        type: 'ButtonComponent',
        displayName: 'Botao CTA',
        props: {
          text: 'Fale Conosco',
          href: '#contato',
          background: WHITE,
          color: PRIMARY,
          size: 'lg',
          buttonStyle: 'filled',
          borderRadius: 50,
        },
      },
    ],
  }
}

function ctaCard(): TemplateNode {
  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'CTA — Card',
    props: {
      background: LIGHT_BG,
      padding: 60,
      gap: 0,
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
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Card CTA',
        props: {
          background: DARK,
          padding: 48,
          gap: 16,
          width: '90%',
          height: 'auto',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          shadow: 3,
          radius: 16,
        },
        children: [
          {
            type: 'HeadingComponent',
            displayName: 'Titulo',
            props: { text: 'Vamos Trabalhar Juntos?', tagName: 'h2', fontSize: '32', fontWeight: '800', textAlign: 'center', color: WHITE, lineHeight: '1.2' },
          },
          {
            type: 'TextComponent',
            displayName: 'Subtitulo',
            props: { text: 'Solicite um orçamento gratuito e sem compromisso.', fontSize: '16', fontWeight: '400', textAlign: 'center', color: '#94a3b8', lineHeight: '1.6' },
          },
          {
            type: 'ButtonComponent',
            displayName: 'Botao',
            props: { text: 'Solicitar Orçamento', href: '#contato', background: PRIMARY, color: WHITE, size: 'lg', buttonStyle: 'filled', borderRadius: 8 },
          },
        ],
      },
    ],
  }
}

// ─── DEPOIMENTOS ─────────────────────────────────────────────

function depoimentosGrid(): TemplateNode {
  return {
    type: 'TestimonialsGridComponent',
    displayName: 'Depoimentos — Grid',
    props: {
      background: LIGHT_BG,
      cardBackground: WHITE,
      accentColor: PRIMARY,
      textColor: SECONDARY,
      paddingY: 60,
      columns: 3,
      showStars: true,
      sectionTag: 'DEPOIMENTOS',
      sectionTitle: 'O Que Nossos Clientes Dizem',
      depoimentos: [
        { nomeCliente: 'Maria Silva', cargo: 'CEO, Tech Solutions', citacao: 'Excelente trabalho! Superaram todas as expectativas do projeto.', nota: 5 },
        { nomeCliente: 'João Pereira', cargo: 'Diretor, StartupX', citacao: 'Profissionalismo e qualidade em cada detalhe da entrega.', nota: 5 },
        { nomeCliente: 'Ana Costa', cargo: 'Gerente, Empresa Y', citacao: 'Recomendo fortemente. O atendimento personalizado faz toda a diferença.', nota: 5 },
      ],
    },
  }
}

function depoimentoQuote(): TemplateNode {
  return {
    type: 'QuoteHighlightComponent',
    displayName: 'Depoimento — Quote',
    props: {
      background: DARK,
      quoteColor: WHITE,
      authorColor: '#94a3b8',
      accentColor: PRIMARY,
      paddingY: 80,
      citacao: 'Trabalhar com esta equipe transformou completamente nossa operação. Os resultados falam por si.',
      nomeCliente: 'Carlos Mendes',
      cargo: 'Fundador, Inovação Corp',
    },
  }
}

// ─── PREÇOS ──────────────────────────────────────────────────

function precosPlanos(): TemplateNode {
  const planoCard = (nome: string, preco: string, desc: string, destaque: boolean): TemplateNode => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: nome,
    props: {
      background: destaque ? PRIMARY : WHITE,
      padding: 32,
      gap: 12,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      shadow: destaque ? 3 : 1,
      radius: 16,
      borderAccent: destaque ? '' : PRIMARY,
      borderAccentPosition: 'top',
    },
    children: [
      {
        type: 'TextComponent',
        displayName: 'Nome Plano',
        props: { text: nome.toUpperCase(), fontSize: '13', fontWeight: '700', textAlign: 'center', color: destaque ? 'rgba(255,255,255,0.8)' : PRIMARY, letterSpacing: '2' },
      },
      {
        type: 'HeadingComponent',
        displayName: 'Preco',
        props: { text: preco, tagName: 'h3', fontSize: '40', fontWeight: '900', textAlign: 'center', color: destaque ? WHITE : SECONDARY, lineHeight: '1.1' },
      },
      {
        type: 'TextComponent',
        displayName: 'Desc',
        props: { text: desc, fontSize: '14', fontWeight: '400', textAlign: 'center', color: destaque ? 'rgba(255,255,255,0.8)' : '#64748b', lineHeight: '1.6' },
      },
      {
        type: 'ButtonComponent',
        displayName: 'CTA Plano',
        props: {
          text: 'Escolher Plano',
          href: '#contato',
          background: destaque ? WHITE : PRIMARY,
          color: destaque ? PRIMARY : WHITE,
          size: 'md',
          buttonStyle: 'filled',
          borderRadius: 8,
        },
      },
    ],
  })

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Preços — Planos',
    props: {
      background: LIGHT_BG,
      padding: 60,
      gap: 20,
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
        displayName: 'Tag',
        props: { text: 'PLANOS E PREÇOS', fontSize: '13', fontWeight: '700', textAlign: 'center', color: PRIMARY, letterSpacing: '2' },
      },
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: { text: 'Escolha o Plano Ideal', tagName: 'h2', fontSize: '36', fontWeight: '800', textAlign: 'center', color: SECONDARY, lineHeight: '1.2', margin: [0, 0, 12, 0] },
      },
      {
        type: 'FeaturesSectionComponent',
        isCanvas: true,
        displayName: 'Grid Planos',
        props: { background: 'transparent', columns: 3, gap: 24, paddingY: 0 },
        children: [
          planoCard('Básico', 'R$ 97/mês', 'Para quem está começando. Inclui recursos essenciais.', false),
          planoCard('Profissional', 'R$ 197/mês', 'O mais popular. Recursos completos para crescer.', true),
          planoCard('Enterprise', 'Sob consulta', 'Soluções sob medida para grandes operações.', false),
        ],
      },
    ],
  }
}

// ─── FAQ ─────────────────────────────────────────────────────

function faqSimples(): TemplateNode {
  const faqItem = (pergunta: string, resposta: string): TemplateNode => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: pergunta,
    props: {
      background: WHITE,
      padding: 24,
      gap: 8,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      shadow: 1,
      radius: 8,
    },
    children: [
      {
        type: 'HeadingComponent',
        displayName: 'Pergunta',
        props: { text: pergunta, tagName: 'h3', fontSize: '17', fontWeight: '700', textAlign: 'left', color: SECONDARY, lineHeight: '1.4' },
      },
      {
        type: 'TextComponent',
        displayName: 'Resposta',
        props: { text: resposta, fontSize: '15', fontWeight: '400', textAlign: 'left', color: '#64748b', lineHeight: '1.6' },
      },
    ],
  })

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'FAQ',
    props: {
      background: LIGHT_BG,
      padding: 60,
      gap: 16,
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
        displayName: 'Tag',
        props: { text: 'PERGUNTAS FREQUENTES', fontSize: '13', fontWeight: '700', textAlign: 'center', color: PRIMARY, letterSpacing: '2' },
      },
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: { text: 'Dúvidas Comuns', tagName: 'h2', fontSize: '36', fontWeight: '800', textAlign: 'center', color: SECONDARY, lineHeight: '1.2', margin: [0, 0, 12, 0] },
      },
      faqItem('Como funciona o processo?', 'Nosso processo é simples: você nos procura, analisamos sua necessidade e apresentamos uma proposta personalizada em até 48 horas.'),
      faqItem('Qual o prazo de entrega?', 'O prazo varia conforme o projeto, mas geralmente entregamos em 2 a 4 semanas após a aprovação.'),
      faqItem('Oferecem suporte pós-entrega?', 'Sim! Todos os planos incluem suporte técnico por e-mail e WhatsApp após a entrega.'),
      faqItem('Posso cancelar a qualquer momento?', 'Sim, nossos planos não possuem fidelidade. Você pode cancelar quando desejar.'),
    ],
  }
}

// ─── EQUIPE ──────────────────────────────────────────────────

function equipeGrid(): TemplateNode {
  const membroCard = (nome: string, cargo: string): TemplateNode => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: nome,
    props: {
      background: WHITE,
      padding: 24,
      gap: 10,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      shadow: 1,
      radius: 12,
    },
    children: [
      {
        type: 'ImageComponent',
        displayName: 'Foto',
        props: { src: '', alt: nome, width: '100px', height: '100px', objectFit: 'cover', borderRadius: 999 },
      },
      {
        type: 'HeadingComponent',
        displayName: 'Nome',
        props: { text: nome, tagName: 'h3', fontSize: '17', fontWeight: '700', textAlign: 'center', color: SECONDARY, lineHeight: '1.4' },
      },
      {
        type: 'TextComponent',
        displayName: 'Cargo',
        props: { text: cargo, fontSize: '14', fontWeight: '500', textAlign: 'center', color: PRIMARY },
      },
    ],
  })

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Equipe — Grid',
    props: {
      background: WHITE,
      padding: 60,
      gap: 20,
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
        displayName: 'Tag',
        props: { text: 'NOSSA EQUIPE', fontSize: '13', fontWeight: '700', textAlign: 'center', color: PRIMARY, letterSpacing: '2' },
      },
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: { text: 'Conheça Quem Faz Acontecer', tagName: 'h2', fontSize: '36', fontWeight: '800', textAlign: 'center', color: SECONDARY, lineHeight: '1.2', margin: [0, 0, 12, 0] },
      },
      {
        type: 'FeaturesSectionComponent',
        isCanvas: true,
        displayName: 'Grid Equipe',
        props: { background: 'transparent', columns: 3, gap: 24, paddingY: 0 },
        children: [
          membroCard('Ana Oliveira', 'CEO & Fundadora'),
          membroCard('Pedro Santos', 'Diretor de Tecnologia'),
          membroCard('Carla Lima', 'Gerente de Projetos'),
        ],
      },
    ],
  }
}

// ─── RODAPÉ ──────────────────────────────────────────────────

function rodape3col(): TemplateNode {
  return {
    type: 'FooterComponent',
    displayName: 'Rodapé — 3 Colunas',
    props: {
      background: '#111827',
      paddingY: 40,
      columns: 3,
      logoText: 'Sua Empresa',
      descricao: 'Soluções profissionais para seu negócio crescer com segurança.',
      links: [
        { label: 'Início', href: '#' },
        { label: 'Serviços', href: '#servicos' },
        { label: 'Sobre', href: '#sobre' },
        { label: 'Contato', href: '#contato' },
      ],
      contato: {
        email: 'contato@empresa.com',
        telefone: '(11) 9999-0000',
        endereco: 'São Paulo, SP',
      },
      copyright: '© 2026 Sua Empresa. Todos os direitos reservados.',
      textColor: '#9ca3af',
      linkColor: '#d1d5db',
    },
  }
}

function rodapeMinimal(): TemplateNode {
  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Rodapé — Minimal',
    props: {
      background: '#111827',
      padding: 24,
      gap: 0,
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
        displayName: 'Copyright',
        props: {
          text: '© 2026 Sua Empresa. Todos os direitos reservados.',
          fontSize: '13',
          fontWeight: '400',
          textAlign: 'center',
          color: '#6b7280',
          lineHeight: '1.5',
        },
      },
    ],
  }
}

// ─── CONTATO ─────────────────────────────────────────────────

function contatoInfoLateral(): TemplateNode {
  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Contato — Info + Form',
    props: {
      background: WHITE,
      padding: 60,
      gap: 40,
      width: '100%',
      height: 'auto',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
      shadow: 0,
      radius: 0,
    },
    children: [
      {
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Info Contato',
        props: {
          background: 'transparent',
          padding: 0,
          gap: 16,
          width: '40%',
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
            displayName: 'Tag',
            props: { text: 'CONTATO', fontSize: '13', fontWeight: '700', textAlign: 'left', color: PRIMARY, letterSpacing: '2' },
          },
          {
            type: 'HeadingComponent',
            displayName: 'Titulo',
            props: { text: 'Fale Conosco', tagName: 'h2', fontSize: '32', fontWeight: '800', textAlign: 'left', color: SECONDARY, lineHeight: '1.2' },
          },
          {
            type: 'TextComponent',
            displayName: 'Desc',
            props: { text: 'Estamos prontos para atender você. Entre em contato por qualquer um dos canais abaixo.', fontSize: '15', fontWeight: '400', textAlign: 'left', color: '#64748b', lineHeight: '1.6' },
          },
          {
            type: 'TextComponent',
            displayName: 'Email',
            props: { text: 'Email: contato@empresa.com', fontSize: '15', fontWeight: '500', textAlign: 'left', color: SECONDARY },
          },
          {
            type: 'TextComponent',
            displayName: 'Telefone',
            props: { text: 'Telefone: (11) 9999-0000', fontSize: '15', fontWeight: '500', textAlign: 'left', color: SECONDARY },
          },
          {
            type: 'TextComponent',
            displayName: 'Endereco',
            props: { text: 'Endereço: São Paulo, SP', fontSize: '15', fontWeight: '500', textAlign: 'left', color: SECONDARY },
          },
        ],
      },
      {
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Form Area',
        props: {
          background: LIGHT_BG,
          padding: 32,
          gap: 16,
          width: '55%',
          height: 'auto',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
          shadow: 1,
          radius: 12,
        },
        children: [
          {
            type: 'HeadingComponent',
            displayName: 'Form Titulo',
            props: { text: 'Envie uma Mensagem', tagName: 'h3', fontSize: '20', fontWeight: '700', textAlign: 'left', color: SECONDARY, lineHeight: '1.4' },
          },
          {
            type: 'TextComponent',
            displayName: 'Form Desc',
            props: { text: 'Preencha o formulário e retornaremos em até 24 horas.', fontSize: '14', fontWeight: '400', textAlign: 'left', color: '#64748b', lineHeight: '1.5' },
          },
          {
            type: 'ButtonComponent',
            displayName: 'Enviar',
            props: { text: 'Enviar Mensagem', href: '#', background: PRIMARY, color: WHITE, size: 'lg', buttonStyle: 'filled', borderRadius: 8 },
          },
        ],
      },
    ],
  }
}

// ─── STATS ───────────────────────────────────────────────────

function statsBand(): TemplateNode {
  return {
    type: 'StatsBandComponent',
    displayName: 'Stats — Números',
    props: {
      background: DARK,
      textColor: WHITE,
      accentColor: PRIMARY,
      labelColor: '#94a3b8',
      paddingY: 40,
      showDivider: true,
      stats: [
        { valor: '10+', label: 'Anos de Experiência' },
        { valor: '500+', label: 'Projetos Entregues' },
        { valor: '98%', label: 'Clientes Satisfeitos' },
        { valor: '24/7', label: 'Suporte Disponível' },
      ],
    },
  }
}

// ─── EXPORT ──────────────────────────────────────────────────

function wrapAndBuild(node: TemplateNode): string {
  // Wrap section in a root Container to create a valid Craft.js tree
  return buildCraftJson({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Seção',
    props: {
      background: 'transparent',
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
    children: [node],
  })
}

export const builtinSecaoPresets: BuiltinSecaoPreset[] = [
  // Hero (3)
  { id: 'builtin-hero-center', nome: 'Hero Centralizado', categoria: 'Hero', descricao: 'Hero com título, subtítulo e CTA centralizados sobre fundo escuro.', json: wrapAndBuild(heroCenter()) },
  { id: 'builtin-hero-split', nome: 'Hero com Imagem', categoria: 'Hero', descricao: 'Hero dividido: texto à esquerda, imagem à direita.', json: wrapAndBuild(heroSplit()) },
  { id: 'builtin-hero-gradient', nome: 'Hero Gradiente', categoria: 'Hero', descricao: 'Hero com gradiente vibrante e dois botões de ação.', json: wrapAndBuild(heroGradient()) },

  // Sobre (2)
  { id: 'builtin-sobre-texto', nome: 'Sobre — Texto', categoria: 'Sobre', descricao: 'Seção "Sobre" centralizada com tag, título e parágrafo.', json: wrapAndBuild(sobreTexto()) },
  { id: 'builtin-sobre-2col', nome: 'Sobre — 2 Colunas', categoria: 'Sobre', descricao: 'Seção "Sobre" com imagem à esquerda e texto à direita.', json: wrapAndBuild(sobreDuasColunas()) },

  // Servicos (2)
  { id: 'builtin-servicos-grid', nome: 'Serviços — Grid', categoria: 'Servicos', descricao: 'Grid de 3 cards de serviço com borda superior de acento.', json: wrapAndBuild(servicosGrid()) },
  { id: 'builtin-servicos-lista', nome: 'Serviços — Lista', categoria: 'Servicos', descricao: 'Lista vertical de serviços com divisores elegantes.', json: wrapAndBuild(servicosLista()) },

  // Features (2)
  { id: 'builtin-features-bento', nome: 'Features — Bento', categoria: 'Features', descricao: 'Grid bento 2x2 com itens normal e wide.', json: wrapAndBuild(featuresBento()) },
  { id: 'builtin-features-checklist', nome: 'Features — Checklist', categoria: 'Features', descricao: 'Lista de diferenciais com ícone de check.', json: wrapAndBuild(featuresChecklist()) },

  // CTA (2)
  { id: 'builtin-cta-faixa', nome: 'CTA — Faixa', categoria: 'CTA', descricao: 'Call-to-action em faixa com fundo primário.', json: wrapAndBuild(ctaFaixa()) },
  { id: 'builtin-cta-card', nome: 'CTA — Card', categoria: 'CTA', descricao: 'CTA dentro de card escuro centralizado.', json: wrapAndBuild(ctaCard()) },

  // Depoimentos (2)
  { id: 'builtin-depoimentos-grid', nome: 'Depoimentos — Grid', categoria: 'Depoimentos', descricao: 'Grid de 3 cards de depoimento com estrelas.', json: wrapAndBuild(depoimentosGrid()) },
  { id: 'builtin-depoimento-quote', nome: 'Depoimento — Quote', categoria: 'Depoimentos', descricao: 'Citação destaque com aspas decorativas.', json: wrapAndBuild(depoimentoQuote()) },

  // Precos (1)
  { id: 'builtin-precos-planos', nome: 'Preços — 3 Planos', categoria: 'Precos', descricao: 'Tabela de preços com 3 planos lado a lado.', json: wrapAndBuild(precosPlanos()) },

  // FAQ (1)
  { id: 'builtin-faq-simples', nome: 'FAQ — Simples', categoria: 'FAQ', descricao: 'Perguntas frequentes em cards empilhados.', json: wrapAndBuild(faqSimples()) },

  // Equipe (1)
  { id: 'builtin-equipe-grid', nome: 'Equipe — Grid', categoria: 'Equipe', descricao: 'Grid de membros da equipe com foto e cargo.', json: wrapAndBuild(equipeGrid()) },

  // Rodape (2)
  { id: 'builtin-rodape-3col', nome: 'Rodapé — 3 Colunas', categoria: 'Rodape', descricao: 'Rodapé completo com 3 colunas: sobre, links e contato.', json: wrapAndBuild(rodape3col()) },
  { id: 'builtin-rodape-minimal', nome: 'Rodapé — Minimal', categoria: 'Rodape', descricao: 'Rodapé simples com apenas copyright.', json: wrapAndBuild(rodapeMinimal()) },

  // Contato (1)
  { id: 'builtin-contato-info', nome: 'Contato — Info + Form', categoria: 'Contato', descricao: 'Seção de contato com informações à esquerda e área de form à direita.', json: wrapAndBuild(contatoInfoLateral()) },

  // Stats (1)
  { id: 'builtin-stats-band', nome: 'Stats — Números', categoria: 'Features', descricao: 'Faixa de estatísticas com números grandes e separadores.', json: wrapAndBuild(statsBand()) },
]
