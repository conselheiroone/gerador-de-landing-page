import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import type { TestimonialsGridProps, TestimonialItem } from './TestimonialsGridComponent'

export function TestimonialsGridSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as TestimonialsGridProps,
  }))

  return (
    <div className="space-y-4 p-2">
      {/* Textos da seção */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tag da seção</label>
        <input
          type="text"
          value={props.sectionTag}
          onChange={(e) => setProp((p: TestimonialsGridProps) => { p.sectionTag = e.target.value })}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Título</label>
        <input
          type="text"
          value={props.sectionTitle}
          onChange={(e) => setProp((p: TestimonialsGridProps) => { p.sectionTitle = e.target.value })}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1"
        />
      </div>

      {/* Cores */}
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fundo seção</label>
          <ColorInput value={props.background} onChange={(v) => setProp((p: TestimonialsGridProps) => { p.background = v })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Acento padrão</label>
          <ColorInput value={props.accentColor} onChange={(v) => setProp((p: TestimonialsGridProps) => { p.accentColor = v })} />
        </div>
      </div>

      {/* Colunas */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Colunas</label>
        <div className="flex gap-1">
          {([1, 2, 3] as const).map((cols) => (
            <button
              key={cols}
              onClick={() => setProp((p: TestimonialsGridProps) => { p.columns = cols })}
              className={`flex-1 py-1 text-xs rounded transition-colors ${
                props.columns === cols
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cols}
            </button>
          ))}
        </div>
      </div>

      {/* Estrelas */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={props.showStars}
          onChange={(e) => setProp((p: TestimonialsGridProps) => { p.showStars = e.target.checked })}
          className="rounded"
        />
        <span className="text-xs font-medium text-gray-500">Mostrar estrelas</span>
      </label>

      {/* Padding */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Espaço vertical: {props.paddingY}px
        </label>
        <input
          type="range" min={40} max={120} step={8}
          value={props.paddingY}
          onChange={(e) => setProp((p: TestimonialsGridProps) => { p.paddingY = Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Lista de depoimentos */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">Depoimentos</label>
        {(props.depoimentos || []).map((dep: TestimonialItem, i: number) => (
          <div key={i} className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">#{i + 1}</span>
              {/* Estrelas editáveis */}
              <div style={{ display: 'flex', gap: '1px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setProp((p: TestimonialsGridProps) => {
                      p.depoimentos = [...p.depoimentos]
                      p.depoimentos[i] = { ...p.depoimentos[i], nota: star }
                    })}
                    style={{
                      color: star <= dep.nota ? '#f59e0b' : '#d1d5db',
                      fontSize: '14px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0 1px',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={dep.citacao}
              onChange={(e) => setProp((p: TestimonialsGridProps) => {
                p.depoimentos = [...p.depoimentos]
                p.depoimentos[i] = { ...p.depoimentos[i], citacao: e.target.value }
              })}
              rows={3}
              placeholder="Citação do cliente..."
              className="w-full text-sm border border-gray-200 rounded px-2 py-1 resize-none"
            />

            <div className="grid grid-cols-2 gap-1">
              <input
                type="text"
                value={dep.nomeCliente}
                onChange={(e) => setProp((p: TestimonialsGridProps) => {
                  p.depoimentos = [...p.depoimentos]
                  p.depoimentos[i] = { ...p.depoimentos[i], nomeCliente: e.target.value }
                })}
                placeholder="Nome"
                className="text-xs border border-gray-200 rounded px-2 py-1"
              />
              <input
                type="text"
                value={dep.cargo}
                onChange={(e) => setProp((p: TestimonialsGridProps) => {
                  p.depoimentos = [...p.depoimentos]
                  p.depoimentos[i] = { ...p.depoimentos[i], cargo: e.target.value }
                })}
                placeholder="Cargo / Empresa"
                className="text-xs border border-gray-200 rounded px-2 py-1"
              />
            </div>
          </div>
        ))}

        <div className="flex gap-1 mt-1">
          <button
            onClick={() => setProp((p: TestimonialsGridProps) => {
              p.depoimentos = [
                ...p.depoimentos,
                { nomeCliente: 'Novo Cliente', cargo: 'Empresário', citacao: 'Excelente atendimento!', nota: 5 },
              ]
            })}
            className="flex-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded py-1 hover:bg-blue-100 transition-colors"
          >
            + Adicionar
          </button>
          {props.depoimentos?.length > 1 && (
            <button
              onClick={() => setProp((p: TestimonialsGridProps) => {
                p.depoimentos = p.depoimentos.slice(0, -1)
              })}
              className="flex-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded py-1 hover:bg-red-100 transition-colors"
            >
              − Remover
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
