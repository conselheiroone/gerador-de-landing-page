import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/features/auth/hooks/use-auth'

interface TermosAceiteState {
  precisaAceitar: boolean
  loading: boolean
  termosConteudo: string
  termosVersao: number
  termosAtualizadoEm: string | null
  aceitarTermos: () => Promise<void>
}

export function useTermosAceite(): TermosAceiteState {
  const { profile, session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [precisaAceitar, setPrecisaAceitar] = useState(false)
  const [termosConteudo, setTermosConteudo] = useState('')
  const [termosVersao, setTermosVersao] = useState(0)
  const [termosAtualizadoEm, setTermosAtualizadoEm] = useState<string | null>(null)

  useEffect(() => {
    if (!profile || !session) {
      setLoading(false)
      return
    }

    // Admin não precisa aceitar termos
    if (profile.role === 'admin') {
      setPrecisaAceitar(false)
      setLoading(false)
      return
    }

    async function verificar() {
      setLoading(true)
      const { data: termos } = await supabase
        .from('legal_pages')
        .select('content, current_version, updated_at')
        .eq('slug', 'termos-de-uso')
        .single()

      if (!termos) {
        setPrecisaAceitar(false)
        setLoading(false)
        return
      }

      // Sem conteúdo publicado = nada para aceitar
      if (!termos.content || termos.content.trim() === '') {
        setPrecisaAceitar(false)
        setLoading(false)
        return
      }

      setTermosConteudo(termos.content)
      setTermosVersao(termos.current_version)
      setTermosAtualizadoEm(termos.updated_at)

      const versaoAceita = profile?.aceite_termos_versao ?? 0
      setPrecisaAceitar(versaoAceita < termos.current_version)
      setLoading(false)
    }

    verificar()
  }, [profile, session])

  const aceitarTermos = useCallback(async () => {
    if (!session?.user?.id) return

    const agora = new Date().toISOString()

    await supabase
      .from('profiles')
      .update({
        aceite_termos_em: agora,
        aceite_termos_versao: termosVersao,
      })
      .eq('id', session.user.id)

    setPrecisaAceitar(false)
  }, [session, termosVersao])

  return {
    precisaAceitar,
    loading,
    termosConteudo,
    termosVersao,
    termosAtualizadoEm,
    aceitarTermos,
  }
}
