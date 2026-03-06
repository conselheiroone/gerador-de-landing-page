import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { UserRole } from '@/types'
import type { AdminUser } from '../types/admin.types'

const PAGE_SIZE = 10

export function useUsersAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')

  const loadUsers = useCallback(async (pageNum = 0, searchTerm = '') => {
    setLoading(true)
    const from = pageNum * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (searchTerm) {
      query = query.or(
        `nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
      )
    }

    const { data, count, error } = await query

    if (!error && data) {
      setUsers(data as AdminUser[])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [])

  const setUserRole = useCallback(async (userId: string, newRole: UserRole) => {
    const { error } = await supabase
      .from('profiles')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ role: newRole as any, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (!error) {
      await loadUsers(page, search)
    }
    return { error }
  }, [loadUsers, page, search])

  const toggleAdmin = useCallback(async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'cliente' : 'admin'
    return setUserRole(userId, newRole as UserRole)
  }, [setUserRole])

  const cadastrarUsuario = useCallback(async (email: string, nome: string, role: UserRole) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return { error: new Error('Não autenticado') }

    const res = await supabase.functions.invoke('cadastrar-usuario', {
      body: { email, nome, role },
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.error || res.data?.error) {
      return { error: new Error(res.data?.error ?? res.error?.message ?? 'Erro ao cadastrar') }
    }

    await loadUsers(page, search)
    return { error: null }
  }, [loadUsers, page, search])

  const updateUser = useCallback(async (userId: string, dados: { nome: string; role: UserRole }) => {
    const { error } = await supabase
      .from('profiles')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ nome: dados.nome, role: dados.role as any, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (!error) {
      await loadUsers(page, search)
    }
    return { error }
  }, [loadUsers, page, search])

  const deleteUser = useCallback(async (userId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return { error: new Error('Não autenticado') }

    const res = await supabase.functions.invoke('delete-user', {
      body: { userId },
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.error || res.data?.error) {
      return { error: new Error(res.data?.error ?? res.error?.message ?? 'Erro ao excluir') }
    }

    await loadUsers(page, search)
    return { error: null }
  }, [loadUsers, page, search])

  useEffect(() => {
    loadUsers(page, search)
  }, [loadUsers, page, search])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const adminCount = users.filter((u) => u.role === 'admin').length
  const avancadoCount = users.filter((u) => u.role === 'avancado').length

  return {
    users,
    loading,
    total,
    page,
    setPage,
    search,
    setSearch,
    totalPages,
    adminCount,
    avancadoCount,
    toggleAdmin,
    setUserRole,
    updateUser,
    cadastrarUsuario,
    deleteUser,
    reload: () => loadUsers(page, search),
  }
}
