import { supabase } from '@/integrations/supabase/client'
import type { Database, Json } from '@/integrations/supabase/types'
import type { PerfilEmpresa, Socio, ServicoItem, RedesSociais } from '../types/onboarding.types'

type DbPerfilRow = Database['public']['Tables']['perfil_empresa']['Row']
type DbPerfilUpdate = Database['public']['Tables']['perfil_empresa']['Update']

function toPerfilEmpresa(row: DbPerfilRow): PerfilEmpresa {
  return {
    ...row,
    servicos: (row.servicos ?? []) as unknown as ServicoItem[],
    redes_sociais: (row.redes_sociais ?? {}) as unknown as RedesSociais,
    // campos adicionados via migration — não estão no tipo gerado ainda
    google_place_id: (row as Record<string, unknown>).google_place_id as string | null ?? null,
    usar_imagem_hero: (row as Record<string, unknown>).usar_imagem_hero as boolean ?? false,
    hero_image_url: (row as Record<string, unknown>).hero_image_url as string | null ?? null,
  }
}

// ==================== PERFIL EMPRESA ====================

export async function getPerfilEmpresa(userId: string): Promise<PerfilEmpresa | null> {
  const { data, error } = await supabase
    .from('perfil_empresa')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data ? toPerfilEmpresa(data) : null
}

export async function createPerfilEmpresa(userId: string): Promise<PerfilEmpresa> {
  const { data, error } = await supabase
    .from('perfil_empresa')
    .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true })
    .select()
    .single()

  if (error) {
    // Fallback: se upsert falhar, tenta buscar o registro existente
    const existing = await getPerfilEmpresa(userId)
    if (existing) return existing
    throw error
  }
  return toPerfilEmpresa(data)
}

export async function updatePerfilEmpresa(
  perfilId: string,
  dados: DbPerfilUpdate,
): Promise<PerfilEmpresa> {
  const { data, error } = await supabase
    .from('perfil_empresa')
    .update(dados)
    .eq('id', perfilId)
    .select()
    .single()

  if (error) throw error
  return toPerfilEmpresa(data)
}

export async function salvarStep1(perfilId: string, dados: {
  nome_empresa: string
  cnpj: string
  tipo_escritorio: 'individual' | 'sociedade'
  slogan: string
  ano_fundacao: string
}) {
  return updatePerfilEmpresa(perfilId, {
    nome_empresa: dados.nome_empresa || null,
    cnpj: dados.cnpj || null,
    tipo_escritorio: dados.tipo_escritorio,
    slogan: dados.slogan || null,
    ano_fundacao: dados.ano_fundacao ? parseInt(dados.ano_fundacao, 10) : null,
    etapa_atual: 2,
  })
}

export async function salvarStep3(perfilId: string, dados: {
  telefone: string
  whatsapp: string
  email_contato: string
  horario_atendimento: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}) {
  return updatePerfilEmpresa(perfilId, {
    telefone: dados.telefone || null,
    whatsapp: dados.whatsapp || null,
    email_contato: dados.email_contato || null,
    horario_atendimento: dados.horario_atendimento || null,
    cep: dados.cep || null,
    logradouro: dados.logradouro || null,
    numero: dados.numero || null,
    complemento: dados.complemento || null,
    bairro: dados.bairro || null,
    cidade: dados.cidade || null,
    estado: dados.estado || null,
    etapa_atual: 4,
  })
}

export async function salvarStep4(perfilId: string, dados: {
  logo_url: string
  cor_primaria: string
  cor_secundaria: string
  usar_imagem_hero: boolean
  hero_image_url: string
}) {
  return updatePerfilEmpresa(perfilId, {
    logo_url: dados.logo_url || null,
    cor_primaria: dados.cor_primaria,
    cor_secundaria: dados.cor_secundaria,
    etapa_atual: 5,
    // hero image — campos não estão no tipo gerado do Supabase ainda
    ...({ usar_imagem_hero: dados.usar_imagem_hero, hero_image_url: dados.hero_image_url || null } as Record<string, unknown>),
  } as DbPerfilUpdate)
}

export async function salvarStep5(perfilId: string, dados: {
  historia: string
  missao: string
  visao: string
  valores: string
  diferenciais: string[]
}) {
  return updatePerfilEmpresa(perfilId, {
    historia: dados.historia || null,
    missao: dados.missao || null,
    visao: dados.visao || null,
    valores: dados.valores || null,
    diferenciais: dados.diferenciais,
    etapa_atual: 6,
  })
}

export async function salvarStep6(perfilId: string, servicos: ServicoItem[]) {
  return updatePerfilEmpresa(perfilId, {
    servicos: servicos as unknown as Json,
    etapa_atual: 7,
  })
}

export async function salvarStep7(perfilId: string, redes: RedesSociais) {
  return updatePerfilEmpresa(perfilId, {
    redes_sociais: redes as unknown as Json,
    etapa_atual: 8,
  })
}

export async function finalizarOnboarding(perfilId: string) {
  return updatePerfilEmpresa(perfilId, {
    onboarding_completo: true,
  })
}

// ==================== SOCIOS ====================

export async function getSocios(perfilEmpresaId: string): Promise<Socio[]> {
  const { data, error } = await supabase
    .from('socios')
    .select('*')
    .eq('perfil_empresa_id', perfilEmpresaId)
    .order('ordem', { ascending: true })

  if (error) throw error
  return (data ?? []) as unknown as Socio[]
}

export async function upsertSocios(
  perfilEmpresaId: string,
  socios: Array<Omit<Socio, 'created_at' | 'updated_at' | 'perfil_empresa_id'>>,
): Promise<Socio[]> {
  // Remove socios que nao estao mais na lista
  const existingIds = socios.filter(s => s.id).map(s => s.id)

  if (existingIds.length > 0) {
    await supabase
      .from('socios')
      .delete()
      .eq('perfil_empresa_id', perfilEmpresaId)
      .not('id', 'in', `(${existingIds.join(',')})`)
  } else {
    await supabase
      .from('socios')
      .delete()
      .eq('perfil_empresa_id', perfilEmpresaId)
  }

  const results: Socio[] = []

  for (const socio of socios) {
    if (socio.id) {
      const { data, error } = await supabase
        .from('socios')
        .update({
          nome_completo: socio.nome_completo,
          crc_numero: socio.crc_numero,
          crc_estado: socio.crc_estado,
          cargo: socio.cargo,
          foto_url: socio.foto_url,
          especialidades: socio.especialidades,
          mini_bio: socio.mini_bio,
          exibir_landing_page: socio.exibir_landing_page,
          ordem: socio.ordem,
        })
        .eq('id', socio.id)
        .select()
        .single()
      if (error) throw error
      results.push(data as unknown as Socio)
    } else {
      const { data, error } = await supabase
        .from('socios')
        .insert({
          perfil_empresa_id: perfilEmpresaId,
          nome_completo: socio.nome_completo,
          crc_numero: socio.crc_numero,
          crc_estado: socio.crc_estado,
          cargo: socio.cargo,
          foto_url: socio.foto_url,
          especialidades: socio.especialidades,
          mini_bio: socio.mini_bio,
          exibir_landing_page: socio.exibir_landing_page,
          ordem: socio.ordem,
        })
        .select()
        .single()
      if (error) throw error
      results.push(data as unknown as Socio)
    }
  }

  return results
}

export async function upsertSociosDirect(
  perfilEmpresaId: string,
  socios: Array<Omit<Socio, 'created_at' | 'updated_at' | 'perfil_empresa_id'>>,
): Promise<Socio[]> {
  const existingIds = socios.filter(s => s.id).map(s => s.id)

  if (existingIds.length > 0) {
    await supabase
      .from('socios')
      .delete()
      .eq('perfil_empresa_id', perfilEmpresaId)
      .not('id', 'in', `(${existingIds.join(',')})`)
  } else {
    await supabase
      .from('socios')
      .delete()
      .eq('perfil_empresa_id', perfilEmpresaId)
  }

  const results: Socio[] = []

  for (const socio of socios) {
    if (socio.id) {
      const { data, error } = await supabase
        .from('socios')
        .update({
          nome_completo: socio.nome_completo,
          crc_numero: socio.crc_numero,
          crc_estado: socio.crc_estado,
          cargo: socio.cargo,
          foto_url: socio.foto_url,
          especialidades: socio.especialidades,
          mini_bio: socio.mini_bio,
          exibir_landing_page: socio.exibir_landing_page,
          ordem: socio.ordem,
        })
        .eq('id', socio.id)
        .select()
        .single()
      if (error) throw error
      results.push(data as unknown as Socio)
    } else {
      const { data, error } = await supabase
        .from('socios')
        .insert({
          perfil_empresa_id: perfilEmpresaId,
          nome_completo: socio.nome_completo,
          crc_numero: socio.crc_numero,
          crc_estado: socio.crc_estado,
          cargo: socio.cargo,
          foto_url: socio.foto_url,
          especialidades: socio.especialidades,
          mini_bio: socio.mini_bio,
          exibir_landing_page: socio.exibir_landing_page,
          ordem: socio.ordem,
        })
        .select()
        .single()
      if (error) throw error
      results.push(data as unknown as Socio)
    }
  }

  return results
}

// ==================== UPLOAD ====================

export async function uploadLogo(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/logo-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from('logos').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadHeroImage(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/hero-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from('logos').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadFotoSocio(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/socio-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('fotos-socios')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from('fotos-socios').getPublicUrl(path)
  return data.publicUrl
}

// ==================== VIACEP ====================

export interface ViaCepResponse {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export async function buscarCep(cep: string): Promise<ViaCepResponse | null> {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) return null

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
  const data: ViaCepResponse = await response.json()

  if (data.erro) return null
  return data
}
