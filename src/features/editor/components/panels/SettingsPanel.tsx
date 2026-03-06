import { useEditor } from '@craftjs/core'
import { createElement } from 'react'
import { Trash2, Settings } from 'lucide-react'

export const SettingsPanel = () => {
  const { actions, selected } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').first()
    let selected

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.displayName,
        settings: state.nodes[currentNodeId].related?.settings,
        isDeletable: query.node(currentNodeId).isDeletable(),
      }
    }

    return { selected }
  })

  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10">
        <Settings className="w-10 h-10 text-gray-200 mb-3" />
        <p className="text-sm text-gray-400">
          Clique em um componente no canvas para editar suas propriedades.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div>
          <span className="inline-block px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded">
            {selected.name}
          </span>
        </div>
        {selected.isDeletable && (
          <button
            onClick={() => actions.delete(selected.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Deletar componente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {selected.settings && createElement(selected.settings)}
    </div>
  )
}
