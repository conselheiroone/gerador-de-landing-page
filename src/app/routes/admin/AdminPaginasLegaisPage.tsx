import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Scale, FileText, Shield, Lock, Save } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { LegalPage } from '@/features/admin/types/admin.types'

const PAGES_CONFIG = [
  { slug: 'termos-de-uso', label: 'Termos de Uso', icon: FileText },
  { slug: 'politica-de-privacidade', label: 'Politica de Privacidade', icon: Shield },
  { slug: 'lgpd', label: 'LGPD', icon: Lock },
]

export function AdminPaginasLegaisPage() {
  const { session } = useAuth()
  const [pages, setPages] = useState<LegalPage[]>([])
  const [loading, setLoading] = useState(true)
  const [contents, setContents] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const loadPages = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('legal_pages')
      .select('*')
      .order('slug')

    if (data) {
      setPages(data)
      const map: Record<string, string> = {}
      data.forEach((p) => { map[p.slug] = p.content })
      setContents(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPages()
  }, [loadPages])

  const handleSave = async (slug: string) => {
    const page = pages.find((p) => p.slug === slug)
    if (!page) return

    setSaving(slug)
    const newVersion = page.current_version + 1

    // Salvar versao
    await supabase.from('legal_page_versions').insert({
      legal_page_id: page.id,
      version: newVersion,
      content: contents[slug],
      published_by: session?.user?.id ?? null,
    })

    // Atualizar pagina
    await supabase
      .from('legal_pages')
      .update({
        content: contents[slug],
        current_version: newVersion,
        updated_at: new Date().toISOString(),
        updated_by: session?.user?.id ?? null,
      })
      .eq('id', page.id)

    await loadPages()
    setSaving(null)
    setSaved(slug)
    setTimeout(() => setSaved(null), 3000)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-gray-500">Carregando...</div>
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Banner */}
      <motion.div variants={staggerItem} className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Scale className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paginas Legais</h1>
            <p className="text-sm text-gray-500">Gerencie Termos de Uso, Privacidade e LGPD</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Tabs defaultValue="termos-de-uso">
          <TabsList className="mb-4">
            {PAGES_CONFIG.map(({ slug, label, icon: Icon }) => (
              <TabsTrigger key={slug} value={slug} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {PAGES_CONFIG.map(({ slug, label }) => {
            const page = pages.find((p) => p.slug === slug)
            return (
              <TabsContent key={slug} value={slug}>
                <Card>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
                      <div className="flex items-center gap-2">
                        {page && (
                          <Badge variant="secondary">
                            v{page.current_version}
                          </Badge>
                        )}
                        {page?.updated_at && (
                          <span className="text-xs text-gray-500">
                            Atualizado em {new Date(page.updated_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>

                    <Textarea
                      value={contents[slug] ?? ''}
                      onChange={(e) =>
                        setContents((prev) => ({ ...prev, [slug]: e.target.value }))
                      }
                      placeholder={`Insira o conteudo de ${label} aqui...`}
                      rows={20}
                      className="min-h-[400px] font-mono text-sm"
                    />

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleSave(slug)}
                        disabled={saving === slug}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {saving === slug ? 'Salvando...' : 'Salvar e Publicar'}
                      </Button>
                      {saved === slug && (
                        <span className="text-sm font-medium text-green-600">
                          Salvo com sucesso!
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
