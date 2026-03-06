import { Element, useEditor } from '@craftjs/core'
import {
  Square,
  Type,
  Heading,
  MousePointerClick,
  ImageIcon,
  Minus,
  Layout,
  Grid3x3,
  MessageSquareQuote,
  Megaphone,
  PanelBottom,
  Navigation,
  Video,
  Share2,
  Columns3,
  MoveVertical,
  PanelTop,
  ListCollapse,
  Sparkles,
  List,
  Star,
  Hash,
  BarChart3,
  AlertCircle,
  Tag,
  GalleryHorizontalEnd,
  SlidersHorizontal,
  Building2,
  FlipHorizontal,
} from 'lucide-react'
import { ContainerComponent } from '../user-components/container/ContainerComponent'
import { TextComponent } from '../user-components/text/TextComponent'
import { HeadingComponent } from '../user-components/heading/HeadingComponent'
import { ButtonComponent } from '../user-components/button/ButtonComponent'
import { ImageComponent } from '../user-components/image/ImageComponent'
import { DividerComponent } from '../user-components/divider/DividerComponent'
import { HeroSectionComponent } from '../user-components/hero-section/HeroSectionComponent'
import { FeaturesSectionComponent } from '../user-components/features-section/FeaturesSectionComponent'
import { TestimonialsSectionComponent } from '../user-components/testimonials-section/TestimonialsSectionComponent'
import { CtaSectionComponent } from '../user-components/cta-section/CtaSectionComponent'
import { FooterComponent } from '../user-components/footer/FooterComponent'
import { NavbarComponent } from '../user-components/navbar/NavbarComponent'
import { VideoComponent } from '../user-components/video/VideoComponent'
import { StatsBandComponent } from '../user-components/stats-band/StatsBandComponent'
import { BentoFeaturesComponent } from '../user-components/bento-features/BentoFeaturesComponent'
import { QuoteHighlightComponent } from '../user-components/quote-highlight/QuoteHighlightComponent'
import { TestimonialsGridComponent } from '../user-components/testimonials-grid/TestimonialsGridComponent'
import { SocialLinksComponent } from '../user-components/social-links/SocialLinksComponent'
import { ColumnsComponent } from '../user-components/columns/ColumnsComponent'
import { SpacerComponent } from '../user-components/spacer/SpacerComponent'
import { TabsComponent } from '../user-components/tabs/TabsComponent'
import { AccordionComponent } from '../user-components/accordion/AccordionComponent'
import { IconComponent } from '../user-components/icon/IconComponent'
import { IconListComponent } from '../user-components/icon-list/IconListComponent'
import { StarRatingComponent } from '../user-components/star-rating/StarRatingComponent'
import { NumberCounterComponent } from '../user-components/number-counter/NumberCounterComponent'
import { ProgressBarComponent } from '../user-components/progress-bar/ProgressBarComponent'
import { AlertComponent } from '../user-components/alert/AlertComponent'
import { BadgeComponent } from '../user-components/badge/BadgeComponent'
import { ImageGalleryComponent } from '../user-components/image-gallery/ImageGalleryComponent'
import { ImageCarouselComponent } from '../user-components/image-carousel/ImageCarouselComponent'
import { LogoGridComponent } from '../user-components/logo-grid/LogoGridComponent'
import { BeforeAfterComponent } from '../user-components/before-after/BeforeAfterComponent'

interface ToolboxItemProps {
  icon: React.ReactNode
  label: string
  createRef: (ref: HTMLElement | null) => void
}

const ToolboxItem = ({ icon, label, createRef }: ToolboxItemProps) => {
  return (
    <div
      ref={(ref) => { if (ref) createRef(ref) }}
      className="flex flex-col items-center gap-1 p-3 rounded-lg cursor-move transition-colors hover:bg-gray-100 border border-transparent hover:border-gray-200"
    >
      <span className="text-gray-500">{icon}</span>
      <span className="text-[10px] text-gray-500 font-medium text-center leading-tight">{label}</span>
    </div>
  )
}

interface ToolboxCategory {
  title: string
  items: {
    icon: React.ReactNode
    label: string
    element: React.ReactElement
  }[]
}

export const ToolboxPanel = () => {
  const {
    connectors: { create },
  } = useEditor()

  const categories: ToolboxCategory[] = [
    {
      title: 'Layout',
      items: [
        {
          icon: <Columns3 className="w-5 h-5" />,
          label: 'Colunas',
          element: (
            <Element
              canvas
              is={ColumnsComponent}
              layout="50-50"
              gap={16}
              background="transparent"
              padding={0}
              minHeight={80}
            />
          ),
        },
        {
          icon: <MoveVertical className="w-5 h-5" />,
          label: 'Espaçador',
          element: <SpacerComponent />,
        },
        {
          icon: <PanelTop className="w-5 h-5" />,
          label: 'Abas',
          element: <TabsComponent />,
        },
        {
          icon: <ListCollapse className="w-5 h-5" />,
          label: 'Sanfona',
          element: <AccordionComponent />,
        },
      ],
    },
    {
      title: 'Basicos',
      items: [
        {
          icon: <Square className="w-5 h-5" />,
          label: 'Container',
          element: (
            <Element
              canvas
              is={ContainerComponent}
              background="#f9fafb"
              padding={20}
              gap={10}
              width="100%"
              height="auto"
            />
          ),
        },
        {
          icon: <Heading className="w-5 h-5" />,
          label: 'Titulo',
          element: <HeadingComponent />,
        },
        {
          icon: <Type className="w-5 h-5" />,
          label: 'Texto',
          element: <TextComponent />,
        },
        {
          icon: <MousePointerClick className="w-5 h-5" />,
          label: 'Botao',
          element: <ButtonComponent />,
        },
        {
          icon: <ImageIcon className="w-5 h-5" />,
          label: 'Imagem',
          element: <ImageComponent />,
        },
        {
          icon: <Minus className="w-5 h-5" />,
          label: 'Divisor',
          element: <DividerComponent />,
        },
        {
          icon: <Video className="w-5 h-5" />,
          label: 'Video',
          element: <VideoComponent />,
        },
      ],
    },
    {
      title: 'Essenciais',
      items: [
        {
          icon: <Sparkles className="w-5 h-5" />,
          label: 'Ícone',
          element: <IconComponent />,
        },
        {
          icon: <List className="w-5 h-5" />,
          label: 'Lista Ícones',
          element: <IconListComponent />,
        },
        {
          icon: <Star className="w-5 h-5" />,
          label: 'Estrelas',
          element: <StarRatingComponent />,
        },
        {
          icon: <Hash className="w-5 h-5" />,
          label: 'Contador',
          element: <NumberCounterComponent />,
        },
        {
          icon: <BarChart3 className="w-5 h-5" />,
          label: 'Progresso',
          element: <ProgressBarComponent />,
        },
        {
          icon: <AlertCircle className="w-5 h-5" />,
          label: 'Alerta',
          element: <AlertComponent />,
        },
        {
          icon: <Tag className="w-5 h-5" />,
          label: 'Etiqueta',
          element: <BadgeComponent />,
        },
      ],
    },
    {
      title: 'Mídia',
      items: [
        {
          icon: <GalleryHorizontalEnd className="w-5 h-5" />,
          label: 'Galeria',
          element: <ImageGalleryComponent />,
        },
        {
          icon: <SlidersHorizontal className="w-5 h-5" />,
          label: 'Carrossel',
          element: <ImageCarouselComponent />,
        },
        {
          icon: <Building2 className="w-5 h-5" />,
          label: 'Logo Grid',
          element: <LogoGridComponent />,
        },
        {
          icon: <FlipHorizontal className="w-5 h-5" />,
          label: 'Antes/Depois',
          element: <BeforeAfterComponent />,
        },
      ],
    },
    {
      title: 'Secoes',
      items: [
        {
          icon: <Navigation className="w-5 h-5" />,
          label: 'Navbar',
          element: (
            <NavbarComponent
              background="#0f172a"
              logoText="Logo"
              logoSrc=""
              links={[
                { label: 'Início', href: '#' },
                { label: 'Sobre', href: '#' },
                { label: 'Serviços', href: '#' },
                { label: 'Contato', href: '#' },
              ]}
              ctaText="Contato"
              ctaBg="#f97316"
              ctaColor="#ffffff"
              linkColor="#ffffff"
              paddingX={40}
              paddingY={16}
            />
          ),
        },
        {
          icon: <Layout className="w-5 h-5" />,
          label: 'Hero',
          element: (
            <Element
              canvas
              is={HeroSectionComponent}
              background="#0f172a"
              paddingY={60}
              textAlign="center"
              gradientType="linear"
            />
          ),
        },
        {
          icon: <Grid3x3 className="w-5 h-5" />,
          label: 'Features',
          element: (
            <Element
              canvas
              is={FeaturesSectionComponent}
              background="#ffffff"
              columns={3}
              gap={24}
              paddingY={60}
            />
          ),
        },
        {
          icon: <MessageSquareQuote className="w-5 h-5" />,
          label: 'Depoimentos',
          element: (
            <Element
              canvas
              is={TestimonialsSectionComponent}
              background="#f8fafc"
              columns={2}
              paddingY={60}
            />
          ),
        },
        {
          icon: <Megaphone className="w-5 h-5" />,
          label: 'CTA',
          element: (
            <Element
              canvas
              is={CtaSectionComponent}
              background="#2563eb"
              paddingY={50}
              radius={12}
            />
          ),
        },
        {
          icon: <PanelBottom className="w-5 h-5" />,
          label: 'Rodape',
          element: (
            <Element
              canvas
              is={FooterComponent}
              background="#111827"
              paddingY={40}
              columns={3}
            />
          ),
        },
      ],
    },
    {
      title: 'Profissional',
      items: [
        {
          icon: <Grid3x3 className="w-5 h-5" />,
          label: 'Stats Band',
          element: <StatsBandComponent />,
        },
        {
          icon: <Layout className="w-5 h-5" />,
          label: 'Bento Grid',
          element: <BentoFeaturesComponent />,
        },
        {
          icon: <MessageSquareQuote className="w-5 h-5" />,
          label: 'Depoimento',
          element: <QuoteHighlightComponent />,
        },
        {
          icon: <MessageSquareQuote className="w-5 h-5" />,
          label: 'Grid Depoim.',
          element: <TestimonialsGridComponent />,
        },
        {
          icon: <Share2 className="w-5 h-5" />,
          label: 'Redes Sociais',
          element: <SocialLinksComponent />,
        },
      ],
    },
  ]

  return (
    <div className="p-3 space-y-4">
      {categories.map((category) => (
        <div key={category.title}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            {category.title}
          </h3>
          <div className="grid grid-cols-2 gap-1">
            {category.items.map((item) => (
              <ToolboxItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                createRef={(ref) => {
                  if (ref) create(ref, item.element)
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
