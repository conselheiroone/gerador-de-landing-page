import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { PerfilEmpresa, Socio } from '../types/onboarding.types'
import {
  getPerfilEmpresa,
  createPerfilEmpresa,
  getSocios,
  salvarStep1,
  upsertSocios,
  salvarStep3,
  salvarStep4,
  salvarStep5,
  salvarStep6,
  salvarStep7,
  finalizarOnboarding,
} from '../api/onboarding'
import type { DadosEscritorioInput, ContatoLocalizacaoInput, IdentidadeVisualInput, SobreEscritorioInput, ServicosInput, RedesSociaisInput } from '../schemas/onboarding.schemas'

export function useOnboarding() {
  const { session, signOut } = useAuth()
  const userId = session?.user?.id

  const [perfil, setPerfil] = useState<PerfilEmpresa | null>(null)
  const [socios, setSocios] = useState<Socio[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)

    try {
      let perfilData = await getPerfilEmpresa(userId)

      if (!perfilData) {
        perfilData = await createPerfilEmpresa(userId)
      }

      setPerfil(perfilData)
      setCurrentStep(perfilData.etapa_atual || 1)

      const sociosData = await getSocios(perfilData.id)
      setSocios(sociosData)
    } catch (err) {
      const rawMsg = err instanceof Error
        ? err.message
        : (err as { message?: string })?.message ?? 'Erro ao carregar dados'

      if (rawMsg.includes('foreign key constraint')) {
        // Sessão órfã — usuário não existe mais no banco (ex: db reset)
        setError('Sessão expirada. Redirecionando para login...')
        await signOut()
        return
      }
      setError(rawMsg)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const saveStep1 = useCallback(async (dados: DadosEscritorioInput) => {
    if (!perfil) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await salvarStep1(perfil.id, {
        nome_empresa: dados.nome_empresa,
        cnpj: dados.cnpj ?? '',
        tipo_escritorio: dados.tipo_escritorio,
        slogan: dados.slogan ?? '',
        ano_fundacao: dados.ano_fundacao ?? '',
      })
      setPerfil(updated)
      setCurrentStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [perfil])

  const saveStep2 = useCallback(async (sociosData: Array<Omit<Socio, 'created_at' | 'updated_at' | 'perfil_empresa_id'>>) => {
    if (!perfil) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await upsertSocios(perfil.id, sociosData)
      setSocios(updated)
      setCurrentStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [perfil])

  const saveStep3 = useCallback(async (dados: ContatoLocalizacaoInput) => {
    if (!perfil) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await salvarStep3(perfil.id, {
        telefone: dados.telefone ?? '',
        whatsapp: dados.whatsapp ?? '',
        email_contato: dados.email_contato ?? '',
        horario_atendimento: dados.horario_atendimento ?? '',
        cep: dados.cep ?? '',
        logradouro: dados.logradouro ?? '',
        numero: dados.numero ?? '',
        complemento: dados.complemento ?? '',
        bairro: dados.bairro ?? '',
        cidade: dados.cidade ?? '',
        estado: dados.estado ?? '',
      })
      setPerfil(updated)
      setCurrentStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [perfil])

  const saveStep4 = useCallback(async (dados: IdentidadeVisualInput) => {
    if (!perfil) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await salvarStep4(perfil.id, {
        logo_url: dados.logo_url ?? '',
        cor_primaria: dados.cor_primaria,
        cor_secundaria: dados.cor_secundaria,
        usar_imagem_hero: dados.usar_imagem_hero ?? false,
        hero_image_url: dados.hero_image_url ?? '',
      })
      setPerfil(updated)
      setCurrentStep(5)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [perfil])

  const saveStep5 = useCallback(async (dados: SobreEscritorioInput) => {
    if (!perfil) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await salvarStep5(perfil.id, {
        historia: dados.historia ?? '',
        missao: dados.missao ?? '',
        visao: dados.visao ?? '',
        valores: dados.valores ?? '',
        diferenciais: dados.diferenciais,
      })
      setPerfil(updated)
      setCurrentStep(6)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [perfil])

  const saveStep6 = useCallback(async (dados: ServicosInput) => {
    if (!perfil) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await salvarStep6(perfil.id, dados.servicos)
      setPerfil(updated)
      setCurrentStep(7)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [perfil])

  const saveStep7 = useCallback(async (dados: RedesSociaisInput) => {
    if (!perfil) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await salvarStep7(perfil.id, {
        instagram: dados.instagram || undefined,
        facebook: dados.facebook || undefined,
        linkedin: dados.linkedin || undefined,
        youtube: dados.youtube || undefined,
        site: dados.site || undefined,
        twitter: dados.twitter || undefined,
      })
      setPerfil(updated)
      setCurrentStep(8)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [perfil])

  const finalizar = useCallback(async () => {
    if (!perfil) return
    setIsSaving(true)
    setError(null)
    try {
      await finalizarOnboarding(perfil.id)
      setPerfil(prev => prev ? { ...prev, onboarding_completo: true } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [perfil])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 8) {
      setCurrentStep(step)
    }
  }, [])

  return {
    perfil,
    socios,
    currentStep,
    isLoading,
    isSaving,
    error,
    saveStep1,
    saveStep2,
    saveStep3,
    saveStep4,
    saveStep5,
    saveStep6,
    saveStep7,
    finalizar,
    goToStep,
  }
}
