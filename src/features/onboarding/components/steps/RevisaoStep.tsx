import { motion } from 'framer-motion'
import { CheckCircle, Building2, Users, MapPin, Palette, BookOpen, Briefcase, Share2, Edit3 } from 'lucide-react'
import { slideUp } from '@/lib/motion-variants'
import { Button } from '@/components/ui/button'
import type { PerfilEmpresa, Socio, ServicoItem, RedesSociais } from '../../types/onboarding.types'

interface RevisaoStepProps {
  perfil: PerfilEmpresa
  socios: Socio[]
  onFinalizar: () => Promise<void>
  onBack: () => void
  onEditStep: (step: number) => void
  isSaving: boolean
}

function SectionCard({
  icon: Icon,
  title,
  step,
  onEdit,
  children,
}: {
  icon: React.ElementType
  title: string
  step: number
  onEdit: (step: number) => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand-500" />
          <span className="text-sm font-medium text-gray-900">{title}</span>
        </div>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600"
        >
          <Edit3 className="h-3 w-3" />
          Editar
        </button>
      </div>
      <div className="px-4 py-3 text-sm text-gray-600">{children}</div>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex gap-2">
      <span className="font-medium text-gray-700">{label}:</span>
      <span>{value}</span>
    </div>
  )
}

export function RevisaoStep({ perfil, socios, onFinalizar, onBack, onEditStep, isSaving }: RevisaoStepProps) {
  const servicos = (perfil.servicos as ServicoItem[] | null) ?? []
  const redes = (perfil.redes_sociais as RedesSociais | null) ?? {}

  return (
    <motion.div variants={slideUp} initial="hidden" animate="visible">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
          <CheckCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Revisão</h2>
          <p className="text-sm text-gray-500">Confira os dados antes de finalizar</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Dados do Escritório */}
        <SectionCard icon={Building2} title="Dados do Escritório" step={1} onEdit={onEditStep}>
          <div className="space-y-1">
            <InfoLine label="Nome" value={perfil.nome_empresa} />
            <InfoLine label="CNPJ" value={perfil.cnpj} />
            <InfoLine label="Tipo" value={perfil.tipo_escritorio === 'sociedade' ? 'Sociedade' : 'Individual'} />
            <InfoLine label="Slogan" value={perfil.slogan} />
            <InfoLine label="Fundação" value={perfil.ano_fundacao?.toString()} />
          </div>
        </SectionCard>

        {/* Sócios */}
        <SectionCard icon={Users} title={`Sócios e Contadores (${socios.length})`} step={2} onEdit={onEditStep}>
          <div className="space-y-2">
            {socios.map(socio => (
              <div key={socio.id} className="flex items-center gap-3">
                {socio.foto_url ? (
                  <img src={socio.foto_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-100" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{socio.nome_completo}</p>
                  <p className="text-xs text-gray-400">
                    {[socio.cargo, socio.crc_numero ? `CRC: ${socio.crc_numero}/${socio.crc_estado}` : null]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                </div>
              </div>
            ))}
            {socios.length === 0 && (
              <p className="text-gray-400 italic">Nenhum sócio cadastrado</p>
            )}
          </div>
        </SectionCard>

        {/* Contato */}
        <SectionCard icon={MapPin} title="Contato e Localização" step={3} onEdit={onEditStep}>
          <div className="space-y-1">
            <InfoLine label="Telefone" value={perfil.telefone} />
            <InfoLine label="WhatsApp" value={perfil.whatsapp} />
            <InfoLine label="Email" value={perfil.email_contato} />
            <InfoLine label="Horário" value={perfil.horario_atendimento} />
            {perfil.logradouro && (
              <InfoLine
                label="Endereço"
                value={[perfil.logradouro, perfil.numero, perfil.bairro, perfil.cidade, perfil.estado]
                  .filter(Boolean)
                  .join(', ')}
              />
            )}
          </div>
        </SectionCard>

        {/* Identidade Visual */}
        <SectionCard icon={Palette} title="Identidade Visual" step={4} onEdit={onEditStep}>
          <div className="flex items-center gap-4">
            {perfil.logo_url ? (
              <img src={perfil.logo_url} alt="Logo" className="h-12 w-12 rounded border object-contain p-1" />
            ) : (
              <span className="text-gray-400 italic">Sem logo</span>
            )}
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded" style={{ backgroundColor: perfil.cor_primaria }} />
                <span className="text-xs">{perfil.cor_primaria}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded" style={{ backgroundColor: perfil.cor_secundaria }} />
                <span className="text-xs">{perfil.cor_secundaria}</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Sobre */}
        <SectionCard icon={BookOpen} title="Sobre o Escritório" step={5} onEdit={onEditStep}>
          <div className="space-y-1">
            {perfil.historia && <p className="line-clamp-2">{perfil.historia}</p>}
            <InfoLine label="Missão" value={perfil.missao} />
            {perfil.diferenciais?.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {perfil.diferenciais.map((d, i) => (
                  <span key={i} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">
                    {d}
                  </span>
                ))}
              </div>
            )}
            {!perfil.historia && !perfil.missao && (
              <p className="text-gray-400 italic">Não preenchido</p>
            )}
          </div>
        </SectionCard>

        {/* Serviços */}
        <SectionCard icon={Briefcase} title={`Serviços (${servicos.length})`} step={6} onEdit={onEditStep}>
          {servicos.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {servicos.map((s, i) => (
                <span key={i} className="rounded bg-gray-100 px-2 py-1 text-xs">
                  {s.nome}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">Nenhum serviço adicionado</p>
          )}
        </SectionCard>

        {/* Redes Sociais */}
        <SectionCard icon={Share2} title="Redes Sociais" step={7} onEdit={onEditStep}>
          <div className="space-y-1">
            {redes.instagram && <InfoLine label="Instagram" value={redes.instagram} />}
            {redes.facebook && <InfoLine label="Facebook" value={redes.facebook} />}
            {redes.linkedin && <InfoLine label="LinkedIn" value={redes.linkedin} />}
            {redes.youtube && <InfoLine label="YouTube" value={redes.youtube} />}
            {redes.site && <InfoLine label="Site" value={redes.site} />}
            {!redes.instagram && !redes.facebook && !redes.linkedin && !redes.youtube && !redes.site && (
              <p className="text-gray-400 italic">Nenhuma rede social adicionada</p>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 rounded-lg border border-brand-200 bg-brand-50 p-4 text-center">
        <p className="text-sm text-brand-700">
          Tudo certo? Você pode editar essas informações depois em{' '}
          <span className="font-medium">Configurações &gt; Perfil da Empresa</span>.
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="ghost" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={onFinalizar} isLoading={isSaving} size="lg">
          Concluir e Começar
        </Button>
      </div>
    </motion.div>
  )
}
