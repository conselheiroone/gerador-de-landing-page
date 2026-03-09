import { useState } from 'react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Users,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Mail,
  Pencil,
  Phone,
  Briefcase,
  Clock,
} from 'lucide-react'
import type { UserRole } from '@/types'
import type { AdminUser } from '@/features/admin/types/admin.types'
import { useUsersAdmin } from '@/features/admin/hooks/use-users-admin'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AdminUsuariosPage() {
  const {
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
    updateUser,
    cadastrarUsuario,
    deleteUser,
  } = useUsersAdmin()
  const { session } = useAuth()

  // ── Cadastrar ──────────────────────────────────────────
  const [cadastroOpen, setCadastroOpen] = useState(false)
  const [cadastroEmail, setCadastroEmail] = useState('')
  const [cadastroNome, setCadastroNome] = useState('')
  const [cadastroTelefone, setCadastroTelefone] = useState('')
  const [cadastroCargo, setCadastroCargo] = useState('')
  const [cadastroRole, setCadastroRole] = useState<UserRole>('cliente')
  const [cadastroError, setCadastroError] = useState('')
  const [cadastroLoading, setCadastroLoading] = useState(false)
  const [cadastroSuccess, setCadastroSuccess] = useState(false)

  const handleCadastrar = async () => {
    if (!cadastroEmail.trim()) { setCadastroError('Email é obrigatório'); return }
    setCadastroLoading(true)
    setCadastroError('')
    const { error } = await cadastrarUsuario(cadastroEmail.trim(), cadastroNome.trim(), cadastroRole, cadastroTelefone.trim() || undefined, cadastroCargo.trim() || undefined)
    setCadastroLoading(false)
    if (error) {
      setCadastroError(error.message)
    } else {
      setCadastroSuccess(true)
      setCadastroEmail('')
      setCadastroNome('')
      setCadastroTelefone('')
      setCadastroCargo('')
      setCadastroRole('cliente')
      setTimeout(() => { setCadastroSuccess(false); setCadastroOpen(false) }, 2000)
    }
  }

  // ── Editar ─────────────────────────────────────────────
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editTelefone, setEditTelefone] = useState('')
  const [editCargo, setEditCargo] = useState('')
  const [editStatus, setEditStatus] = useState<'ativo' | 'suspenso' | 'pendente'>('ativo')
  const [editRole, setEditRole] = useState<UserRole>('cliente')
  const [editError, setEditError] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  const openEdit = (user: AdminUser) => {
    setEditUser(user)
    setEditNome(user.nome ?? '')
    setEditTelefone(user.telefone ?? '')
    setEditCargo(user.cargo ?? '')
    setEditStatus(user.status ?? 'ativo')
    setEditRole(user.role as UserRole)
    setEditError('')
  }

  const handleEditar = async () => {
    if (!editUser) return
    setEditLoading(true)
    setEditError('')
    const { error } = await updateUser(editUser.id, {
      nome: editNome,
      role: editRole,
      telefone: editTelefone,
      cargo: editCargo,
      status: editStatus,
    })
    setEditLoading(false)
    if (error) {
      setEditError(error.message)
    } else {
      setEditUser(null)
    }
  }

  // ── Excluir ────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nome: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleteLoading(true)
    setDeleteError('')
    const { error } = await deleteUser(confirmDelete.id)
    setDeleteLoading(false)
    if (error) {
      setDeleteError(error.message)
    } else {
      setConfirmDelete(null)
    }
  }

  const clienteCount = total - adminCount - avancadoCount

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Banner */}
      <motion.div variants={staggerItem} className="mb-6 rounded-lg bg-indigo-50 border border-indigo-200 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
              <p className="text-sm text-gray-500">Gerencie usuários e permissões</p>
            </div>
          </div>
          <Button onClick={() => { setCadastroOpen(true); setCadastroError(''); setCadastroSuccess(false) }}>
            <UserPlus className="mr-2 h-4 w-4" />
            Cadastrar Usuário
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerItem} className="mb-6 grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{adminCount}</p>
          <p className="text-sm text-gray-500">Admins</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{avancadoCount}</p>
          <p className="text-sm text-gray-500">Avançados</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{clienteCount}</p>
          <p className="text-sm text-gray-500">Clientes</p>
        </CardContent></Card>
      </motion.div>

      {/* Search */}
      <motion.div variants={staggerItem} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder="Buscar por nome ou email..."
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* User list */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardContent className="divide-y divide-gray-100 p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-500">Carregando...</div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-500">Nenhum usuário encontrado</div>
            ) : (
              users.map((user) => {
                const isCurrentUser = user.id === session?.user?.id
                const initials = (user.nome ?? user.email).slice(0, 2).toUpperCase()
                const avatarBg = user.role === 'admin'
                  ? 'bg-emerald-500 text-white'
                  : user.role === 'avancado'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-400 text-white'

                return (
                  <div key={user.id} className="flex items-center gap-4 px-6 py-4">
                    <Avatar size="md" fallback={initials} className={avatarBg} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-gray-900">{user.nome ?? 'Sem nome'}</p>
                        {user.role === 'admin' && <Badge variant="success">Admin</Badge>}
                        {user.role === 'avancado' && <Badge variant="primary">Avançado</Badge>}
                        {user.status === 'suspenso' && <Badge variant="error">Suspenso</Badge>}
                        {user.status === 'pendente' && <Badge variant="secondary">Pendente</Badge>}
                        {isCurrentUser && <Badge variant="secondary">Você</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="truncate">{user.email}</span>
                        {user.cargo && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {user.cargo}
                          </span>
                        )}
                        {user.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.telefone}
                          </span>
                        )}
                      </div>
                    </div>
                    {!isCurrentUser && (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setDeleteError(''); setConfirmDelete({ id: user.id, nome: user.nome ?? user.email }) }}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Excluir
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={staggerItem} className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Página {page + 1} de {totalPages} ({total} usuários)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              Próximo <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── Dialog: Cadastrar ── */}
      <Dialog open={cadastroOpen} onOpenChange={(o) => { setCadastroOpen(o); setCadastroError('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Cadastrar Usuário
            </DialogTitle>
            <DialogDescription>
              A conta será criada imediatamente. O usuário acessa pelo login com seu e-mail e recebe o código de acesso por e-mail.
            </DialogDescription>
          </DialogHeader>
          {cadastroSuccess ? (
            <div className="py-6 text-center text-emerald-600 font-medium">Usuário cadastrado com sucesso!</div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">Email *</p>
                <Input type="email" placeholder="usuario@exemplo.com" value={cadastroEmail} onChange={(e) => setCadastroEmail(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-gray-700">Nome</p>
                  <Input placeholder="Nome completo" value={cadastroNome} onChange={(e) => setCadastroNome(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-gray-700">Telefone</p>
                  <Input placeholder="(11) 99999-9999" value={cadastroTelefone} onChange={(e) => setCadastroTelefone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">Cargo</p>
                <Input placeholder="Ex: Contador, Gerente" value={cadastroCargo} onChange={(e) => setCadastroCargo(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">Nível de acesso</p>
                <Select value={cadastroRole} onValueChange={(v) => setCadastroRole(v as UserRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente — apenas gerar do perfil</SelectItem>
                    <SelectItem value="avancado">Avançado — gerar + editor livre</SelectItem>
                    <SelectItem value="admin">Admin — acesso total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {cadastroError && <p className="text-sm text-red-600">{cadastroError}</p>}
            </div>
          )}
          {!cadastroSuccess && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setCadastroOpen(false)}>Cancelar</Button>
              <Button onClick={handleCadastrar} disabled={cadastroLoading}>
                {cadastroLoading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Editar ── */}
      <Dialog open={!!editUser} onOpenChange={(o) => { if (!o) setEditUser(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Editar Usuário
            </DialogTitle>
            <DialogDescription>
              Altere o nome e o nível de acesso do usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700">Email</p>
              <Input value={editUser?.email ?? ''} disabled className="bg-gray-50 text-gray-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">Nome</p>
                <Input placeholder="Nome completo" value={editNome} onChange={(e) => setEditNome(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">Telefone</p>
                <Input placeholder="(11) 99999-9999" value={editTelefone} onChange={(e) => setEditTelefone(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700">Cargo</p>
              <Input placeholder="Ex: Gerente de Marketing, Desenvolvedor" value={editCargo} onChange={(e) => setEditCargo(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">Status</p>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as 'ativo' | 'suspenso' | 'pendente')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">Nível de acesso</p>
                <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editUser?.ultimo_acesso && (
              <p className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                Último acesso: {new Date(editUser.ultimo_acesso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {editError && <p className="text-sm text-red-600">{editError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
            <Button onClick={handleEditar} disabled={editLoading}>
              {editLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Excluir ── */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => { if (!o) setConfirmDelete(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Excluir Usuário
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário "<strong>{confirmDelete?.nome}</strong>"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-red-600 px-1">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button onClick={handleDelete} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700">
              {deleteLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
