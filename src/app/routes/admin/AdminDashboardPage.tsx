import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Users, Eye, TrendingUp } from 'lucide-react'

const stats = [
  { label: 'Templates', valor: '0', icon: <FileText className="h-5 w-5" />, cor: 'bg-brand-100 text-brand-500' },
  { label: 'Usuarios', valor: '0', icon: <Users className="h-5 w-5" />, cor: 'bg-blue-100 text-blue-500' },
  { label: 'Projetos Criados', valor: '0', icon: <Eye className="h-5 w-5" />, cor: 'bg-purple-100 text-purple-500' },
  { label: 'Leads Captados', valor: '0', icon: <TrendingUp className="h-5 w-5" />, cor: 'bg-amber-100 text-amber-500' },
]

export function AdminDashboardPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Painel Admin</h1>
        <p className="text-sm text-gray-500">
          Visao geral da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={staggerItem}>
            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {stat.valor}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.cor}`}>
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
