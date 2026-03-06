import { useEditor } from '@craftjs/core'
import { ChevronRight, ChevronDown, Eye, EyeOff, GripVertical } from 'lucide-react'
import { useState, useCallback } from 'react'

interface LayerNodeProps {
  nodeId: string
  depth: number
}

const LayerNode = ({ nodeId, depth }: LayerNodeProps) => {
  const [expanded, setExpanded] = useState(true)

  const { node, selected, actions, childNodes } = useEditor((state) => {
    const currentNode = state.nodes[nodeId]
    if (!currentNode) return { node: null, selected: false, childNodes: [] }

    return {
      node: {
        displayName: currentNode.data.custom?.displayName
          || currentNode.data.displayName
          || currentNode.data.name
          || 'Componente',
        hidden: currentNode.data.hidden,
        isCanvas: currentNode.data.isCanvas,
      },
      selected: state.events.selected.has(nodeId),
      childNodes: currentNode.data.nodes || [],
    }
  })

  const handleSelect = useCallback(() => {
    actions.selectNode(nodeId)
  }, [actions, nodeId])

  const handleToggleHidden = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    actions.setHidden(nodeId, !node?.hidden)
  }, [actions, nodeId, node?.hidden])

  if (!node) return null

  const hasChildren = childNodes.length > 0

  return (
    <div>
      <div
        onClick={handleSelect}
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer text-xs transition-colors group ${
          selected
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="p-0.5 hover:bg-gray-200 rounded shrink-0"
          >
            {expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Drag Handle */}
        <GripVertical className="w-3 h-3 text-gray-300 shrink-0 opacity-0 group-hover:opacity-100" />

        {/* Nome */}
        <span
          className={`flex-1 truncate ${
            node.hidden ? 'opacity-40 line-through' : ''
          } ${node.isCanvas ? 'font-medium' : ''}`}
        >
          {node.displayName}
        </span>

        {/* Toggle Visibilidade */}
        <button
          onClick={handleToggleHidden}
          className="p-0.5 hover:bg-gray-200 rounded shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          title={node.hidden ? 'Mostrar' : 'Ocultar'}
        >
          {node.hidden ? (
            <EyeOff className="w-3 h-3 text-gray-400" />
          ) : (
            <Eye className="w-3 h-3 text-gray-400" />
          )}
        </button>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {childNodes.map((childId: string) => (
            <LayerNode key={childId} nodeId={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export const LayersPanel = () => {
  const { rootNodeId } = useEditor((state) => ({
    rootNodeId: state.nodes.ROOT ? 'ROOT' : null,
  }))

  if (!rootNodeId) {
    return (
      <div className="p-4 text-center text-xs text-gray-400">
        Nenhum componente no canvas
      </div>
    )
  }

  return (
    <div className="py-2">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-3">
        Arvore de Componentes
      </h3>
      <LayerNode nodeId={rootNodeId} depth={0} />
    </div>
  )
}
