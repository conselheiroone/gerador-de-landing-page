import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { PerfilEmpresa, Socio, ServicoItem, SegmentoItem, RedesSociais } from '../types/onboarding.types'
import type { Json } from '@/integrations/supabase/types'
import {
  getPerfilEmpresa,
  getSocios,
  updatePerfilEmpresa,
  upsertSociosDirect,
  uploadLogo,
  uploadHeroImage,
  uploadFotoSocio,
  buscarCep,
} from '../api/onboarding'

export function usePerfilEmpresa() {
  const { session } = useAuth()
  const userId = session?.user?.id

  const [perfil, setPerfil] = useState<PerfilEmpresa | null>(null)
  const [socios, setSocios] = useState<Socio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [savedSection, setSavedSection] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)

    try {
      const perfilData = await getPerfilEmpresa(userId)
      if (!perfilData) return
      setPerfil(perfilData)

      const sociosData = await getSocios(perfilData.id)
      setSocios(sociosData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  function showSaved(section: string) {
    setSavedSection(section)
    setTimeout(() => setSavedSection(null), 2000)
  }

  const updateDadosEscritorio = useCallback(async (dados: {
    nome_empresa: string
    cnpj: string
    tipo_escritorio: 'individual' | 'sociedade'
    slogan: string
    ano_fundacao: string
  }) => {
    if (!perfil) return
    setSavingSection('dados')
    setError(null)
    try {
      const updated = await updatePerfilEmpresa(perfil.id, {
        nome_empresa: dados.nome_empresa || null,
        cnpj: dados.cnpj || null,
        tipo_escritorio: dados.tipo_escritorio,
        slogan: dados.slogan || null,
        ano_fundacao: dados.ano_fundacao ? parseInt(dados.ano_fundacao, 10) : null,
      })
      setPerfil(updated)
      showSaved('dados')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSavingSection(null)
    }
  }, [perfil])

  const updateSocios = useCallback(async (
    sociosData: Array<Omit<Socio, 'created_at' | 'updated_at' | 'perfil_empresa_id'>>,
  ) => {
    if (!perfil) return
    setSavingSection('socios')
    setError(null)
    try {
      const updated = await upsertSociosDirect(perfil.id, sociosData)
      setSocios(updated)
      showSaved('socios')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSavingSection(null)
    }
  }, [perfil])

  const updateContato = useCallback(async (dados: {
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
  }) => {
    if (!perfil) return
    setSavingSection('contato')
    setError(null)
    try {
      const updated = await updatePerfilEmpresa(perfil.id, {
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
      })
      setPerfil(updated)
      showSaved('contato')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSavingSection(null)
    }
  }, [perfil])

  const updateIdentidadeVisual = useCallback(async (dados: {
    logo_url: string
    cor_primaria: string
    cor_secundaria: string
    usar_imagem_hero?: boolean
    hero_image_url?: string
  }) => {
    if (!perfil) return
    setSavingSection('visual')
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        logo_url: dados.logo_url || null,
        cor_primaria: dados.cor_primaria,
        cor_secundaria: dados.cor_secundaria,
      }
      if (dados.usar_imagem_hero !== undefined) {
        payload.usar_imagem_hero = dados.usar_imagem_hero
        payload.hero_image_url = dados.hero_image_url || null
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await updatePerfilEmpresa(perfil.id, payload as any)
      setPerfil(updated)
      showSaved('visual')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSavingSection(null)
    }
  }, [perfil])

  const updateSobre = useCallback(async (dados: {
    historia: string
    missao: string
    visao: string
    valores: string
    diferenciais: string[]
    google_place_id?: string
  }) => {
    if (!perfil) return
    setSavingSection('sobre')
    setError(null)
    try {
      const payload: Record<string, unknown> = {
        historia: dados.historia || null,
        missao: dados.missao || null,
        visao: dados.visao || null,
        valores: dados.valores || null,
        diferenciais: dados.diferenciais,
      }
      if (dados.google_place_id !== undefined) {
        payload.google_place_id = dados.google_place_id || null
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await updatePerfilEmpresa(perfil.id, payload as any)
      setPerfil(updated)
      showSaved('sobre')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSavingSection(null)
    }
  }, [perfil])

  const updateGooglePlaceId = useCallback(async (placeId: string) => {
    if (!perfil) return
    setSavingSection('depoimentos')
    setError(null)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await updatePerfilEmpresa(perfil.id, { google_place_id: placeId || null } as any)
      setPerfil(updated)
      showSaved('depoimentos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSavingSection(null)
    }
  }, [perfil])

  const updateServicos = useCallback(async (servicos: ServicoItem[]) => {
    if (!perfil) return
    setSavingSection('servicos')
    setError(null)
    try {
      const updated = await updatePerfilEmpresa(perfil.id, {
        servicos: servicos as unknown as Json,
      })
      setPerfil(updated)
      showSaved('servicos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSavingSection(null)
    }
  }, [perfil])

  const updateSegmentos = useCallback(async (segmentos: SegmentoItem[]) => {
    if (!perfil) return
    setSavingSection('segmentos')
    setError(null)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await updatePerfilEmpresa(perfil.id, { segmentos } as any)
      setPerfil(updated)
      showSaved('segmentos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSavingSection(null)
    }
  }, [perfil])

  const updateRedesSociais = useCallback(async (redes: RedesSociais) => {
    if (!perfil) return
    setSavingSection('redes')
    setError(null)
    try {
      const updated = await updatePerfilEmpresa(perfil.id, {
        redes_sociais: redes as unknown as Json,
      })
      setPerfil(updated)
      showSaved('redes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSavingSection(null)
    }
  }, [perfil])

  return {
    perfil,
    socios,
    userId,
    isLoading,
    savingSection,
    savedSection,
    error,
    clearError: useCallback(() => setError(null), []),
    updateDadosEscritorio,
    updateSocios,
    updateContato,
    updateIdentidadeVisual,
    updateSobre,
    updateServicos,
    updateSegmentos,
    updateRedesSociais,
    updateGooglePlaceId,
    uploadLogo,
    uploadHeroImage,
    uploadFotoSocio,
    buscarCep,
    reload: loadData,
  }
}
