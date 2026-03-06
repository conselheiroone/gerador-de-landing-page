import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Headphones, Phone, Clock, Save, ExternalLink } from 'lucide-react'
import { useAdminSettings } from '@/features/admin/hooks/use-admin-settings'

export function AdminSuportePage() {
  const { settings, loading, saveMultiple } = useAdminSettings()
  const [phone, setPhone] = useState('')
  const [days, setDays] = useState('Segunda a Sexta')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('18:00')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!loading) {
      setPhone(settings.support_whatsapp ?? '')
      setDays(settings.support_hours_days ?? 'Segunda a Sexta')
      setStart(settings.support_hours_start ?? '09:00')
      setEnd(settings.support_hours_end ?? '18:00')
      setNote(settings.support_hours_note ?? '')
    }
  }, [loading, settings])

  const handleSave = async () => {
    setSaving(true)
    await saveMultiple({
      support_whatsapp: phone,
      support_hours_days: days,
      support_hours_start: start,
      support_hours_end: end,
      support_hours_note: note,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const cleanPhone = phone.replace(/\D/g, '')
  const whatsappLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : ''

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-gray-500">Carregando...</div>
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Banner */}
      <motion.div variants={staggerItem} className="mb-6 rounded-lg bg-orange-50 border border-orange-200 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <Headphones className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suporte</h1>
            <p className="text-sm text-gray-500">Configure o WhatsApp e horarios de atendimento</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* WhatsApp */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4 text-green-600" />
                WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Numero com DDD
                </label>
                <Input
                  value={formatPhone(phone)}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              {whatsappLink && (
                <div className="rounded-md bg-green-50 p-3 text-sm">
                  <p className="mb-1 font-medium text-green-800">Preview do link:</p>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-green-600 hover:underline"
                  >
                    {whatsappLink}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Horarios */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-blue-600" />
                Horario de Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Dias de atendimento
                </label>
                <Input
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="Segunda a Sexta"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Inicio</label>
                  <Input
                    type="time"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Fim</label>
                  <Input
                    type="time"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mensagem fora do horario
                </label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Retornaremos no proximo dia util"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Save */}
      <motion.div variants={staggerItem} className="mt-6 flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
        {saved && (
          <span className="text-sm font-medium text-green-600">Salvo com sucesso!</span>
        )}
      </motion.div>
    </motion.div>
  )
}
