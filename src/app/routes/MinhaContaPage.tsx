import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { User, Save, Check, Mail, Phone, Briefcase, Shield } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { supabase } from '@/integrations/supabase/client'

export function MinhaContaPage() {
  const { profile, session } = useAuth()

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cargo, setCargo] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setNome(profile.nome ?? '')
      setTelefone(profile.telefone ?? '')
      setCargo(profile.cargo ?? '')
    }
  }, [profile])

  const handleSave = async () => {
    if (!session?.user?.id) return
    setSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        nome: nome.trim() || null,
        telefone: telefone.trim() || null,
        cargo: cargo.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)

    setSaving(false)
    if (updateError) {
      setError(updateError.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const roleLabelMap: Record<string, string> = {
    admin: 'Administrador',
    avancado: 'Avancado',
    cliente: 'Cliente',
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto max-w-2xl">
      {/* Banner */}
      <motion.div variants={staggerItem} className="mb-6 rounded-lg bg-brand-50 border border-brand-200 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
            <User className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
            <p className="text-sm text-gray-500">Gerencie suas informacoes pessoais</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <CardContent className="space-y-6 p-6">
            {/* Email — somente leitura */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <Input value={profile?.email ?? ''} disabled className="bg-gray-50 text-gray-500" />
              <p className="text-xs text-gray-400">O email nao pode ser alterado.</p>
            </div>

            {/* Nivel de acesso — somente leitura */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <Shield className="h-4 w-4" />
                Nivel de acesso
              </label>
              <div>
                <Badge variant={profile?.role === 'admin' ? 'success' : profile?.role === 'avancado' ? 'primary' : 'secondary'}>
                  {roleLabelMap[profile?.role ?? 'cliente']}
                </Badge>
                <span className="ml-2 text-xs text-gray-400">Apenas o administrador pode alterar.</span>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Nome */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <User className="h-4 w-4" />
                Nome
              </label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            {/* Telefone e Cargo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Phone className="h-4 w-4" />
                  Telefone
                </label>
                <Input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Briefcase className="h-4 w-4" />
                  Cargo
                </label>
                <Input
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ex: Contador, Gerente"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {/* Save */}
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSave} isLoading={saving}>
                <Save className="mr-2 h-4 w-4" />
                Salvar alteracoes
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 animate-in fade-in">
                  <Check className="h-4 w-4" />
                  Salvo com sucesso
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
