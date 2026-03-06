import { useState, useEffect, useCallback } from 'react'

const DIAS_SEMANA = [
  { key: 'seg', label: 'Seg' },
  { key: 'ter', label: 'Ter' },
  { key: 'qua', label: 'Qua' },
  { key: 'qui', label: 'Qui' },
  { key: 'sex', label: 'Sex' },
  { key: 'sab', label: 'Sáb' },
  { key: 'dom', label: 'Dom' },
] as const

const HORARIOS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00',
]

interface HorarioSelectorProps {
  value: string
  onChange: (value: string) => void
}

function parseHorario(value: string): { dias: string[]; inicio: string; fim: string } {
  const defaults = { dias: ['seg', 'ter', 'qua', 'qui', 'sex'], inicio: '08:00', fim: '18:00' }
  if (!value) return defaults

  // Tenta extrair padrão "Seg-Sex: 8h às 18h" ou "Seg a Sex 08:00 as 18:00" etc.
  const match = value.match(/(\d{1,2})[h:]?(\d{0,2})\s*(às|as|a|-)\s*(\d{1,2})[h:]?(\d{0,2})/)
  if (match) {
    const h1 = match[1].padStart(2, '0')
    const m1 = match[2] ? match[2].padStart(2, '0') : '00'
    const h2 = match[4].padStart(2, '0')
    const m2 = match[5] ? match[5].padStart(2, '0') : '00'
    defaults.inicio = `${h1}:${m1}`
    defaults.fim = `${h2}:${m2}`
  }

  const lower = value.toLowerCase()
  const dias: string[] = []
  if (lower.includes('seg')) dias.push('seg')
  if (lower.includes('ter')) dias.push('ter')
  if (lower.includes('qua')) dias.push('qua')
  if (lower.includes('qui')) dias.push('qui')
  if (lower.includes('sex')) dias.push('sex')
  if (lower.includes('sáb') || lower.includes('sab')) dias.push('sab')
  if (lower.includes('dom')) dias.push('dom')

  // Se encontrou "seg-sex" ou "seg a sex", preenche todos entre seg e sex
  if (dias.length === 0 && (lower.includes('seg') || lower.includes('segunda'))) {
    return { ...defaults, dias: ['seg', 'ter', 'qua', 'qui', 'sex'] }
  }

  return { dias: dias.length > 0 ? dias : defaults.dias, inicio: defaults.inicio, fim: defaults.fim }
}

function formatHorario(dias: string[], inicio: string, fim: string): string {
  if (dias.length === 0) return ''

  // Agrupar dias consecutivos
  const orderedKeys = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
  const labels: Record<string, string> = { seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb', dom: 'Dom' }
  const indices = dias.map(d => orderedKeys.indexOf(d)).sort((a, b) => a - b)

  const groups: string[][] = []
  let current = [orderedKeys[indices[0]]]
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === indices[i - 1] + 1) {
      current.push(orderedKeys[indices[i]])
    } else {
      groups.push(current)
      current = [orderedKeys[indices[i]]]
    }
  }
  groups.push(current)

  const diaStr = groups.map(g => {
    if (g.length >= 3) return `${labels[g[0]]}-${labels[g[g.length - 1]]}`
    return g.map(d => labels[d]).join(', ')
  }).join(', ')

  const h1 = inicio.replace(':00', 'h').replace(':', 'h')
  const h2 = fim.replace(':00', 'h').replace(':', 'h')

  return `${diaStr} ${h1} às ${h2}`
}

export function HorarioSelector({ value, onChange }: HorarioSelectorProps) {
  const parsed = parseHorario(value)
  const [dias, setDias] = useState<string[]>(parsed.dias)
  const [inicio, setInicio] = useState(parsed.inicio)
  const [fim, setFim] = useState(parsed.fim)

  const emitChange = useCallback((d: string[], i: string, f: string) => {
    onChange(formatHorario(d, i, f))
  }, [onChange])

  useEffect(() => {
    // Só re-parse se o valor veio de fora (não do nosso próprio onChange)
    const formatted = formatHorario(dias, inicio, fim)
    if (value && value !== formatted) {
      const p = parseHorario(value)
      setDias(p.dias)
      setInicio(p.inicio)
      setFim(p.fim)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleDia(dia: string) {
    const next = dias.includes(dia) ? dias.filter(d => d !== dia) : [...dias, dia]
    setDias(next)
    emitChange(next, inicio, fim)
  }

  function handleInicioChange(val: string) {
    setInicio(val)
    emitChange(dias, val, fim)
  }

  function handleFimChange(val: string) {
    setFim(val)
    emitChange(dias, inicio, val)
  }

  return (
    <div className="space-y-3">
      {/* Dias */}
      <div>
        <span className="mb-1.5 block text-xs text-gray-500">Dias de atendimento</span>
        <div className="flex flex-wrap gap-1.5">
          {DIAS_SEMANA.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleDia(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                dias.includes(key)
                  ? 'bg-brand-500 text-white'
                  : 'border border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Horários */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <span className="mb-1 block text-xs text-gray-500">Início</span>
          <select
            value={inicio}
            onChange={(e) => handleInicioChange(e.target.value)}
            className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
          >
            {HORARIOS.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
        <span className="mt-5 text-sm text-gray-400">às</span>
        <div className="flex-1">
          <span className="mb-1 block text-xs text-gray-500">Fim</span>
          <select
            value={fim}
            onChange={(e) => handleFimChange(e.target.value)}
            className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
          >
            {HORARIOS.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      {dias.length > 0 && (
        <p className="text-xs text-gray-500">
          {formatHorario(dias, inicio, fim)}
        </p>
      )}
    </div>
  )
}
