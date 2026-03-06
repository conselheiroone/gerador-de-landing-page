import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Play, GraduationCap } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import type { LearningModule } from '@/features/admin/types/admin.types'

export function AprendizadoPage() {
  const navigate = useNavigate()
  const [modules, setModules] = useState<LearningModule[]>([])
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })

      if (data) {
        setModules(data)
        // Busca contagem de aulas publicadas por módulo
        const counts: Record<string, number> = {}
        await Promise.all(
          data.map(async (m) => {
            const { count } = await supabase
              .from('learning_lessons')
              .select('id', { count: 'exact', head: true })
              .eq('module_id', m.id)
              .eq('is_published', true)
            counts[m.id] = count ?? 0
          }),
        )
        setLessonCounts(counts)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-4xl space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aprendizado</h1>
            <p className="text-sm text-gray-500">Módulos e aulas disponibilizados para você</p>
          </div>
        </div>
      </motion.div>

      {/* Lista de módulos */}
      {modules.length === 0 ? (
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <BookOpen className="h-12 w-12 text-gray-300" />
              <p className="font-medium text-gray-500">Nenhum módulo disponível ainda</p>
              <p className="text-sm text-gray-400">O administrador publicará conteúdos em breve.</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {modules.map((m) => (
            <motion.div
              key={m.id}
              variants={staggerItem}
              onClick={() => navigate(`/aprendizado/modulo/${m.id}`)}
              className="cursor-pointer"
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                {/* Thumbnail */}
                {m.thumbnail_url ? (
                  <div className="relative h-40 bg-gray-100">
                    <img
                      src={m.thumbnail_url}
                      alt={m.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                        <Play className="h-5 w-5 text-brand-600" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center bg-brand-50">
                    <GraduationCap className="h-14 w-14 text-brand-200" />
                  </div>
                )}

                <CardContent className="p-4">
                  <h2 className="font-semibold text-gray-900 line-clamp-2">{m.title}</h2>
                  {m.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{m.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {lessonCounts[m.id] ?? 0}{' '}
                      {(lessonCounts[m.id] ?? 0) === 1 ? 'aula' : 'aulas'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
