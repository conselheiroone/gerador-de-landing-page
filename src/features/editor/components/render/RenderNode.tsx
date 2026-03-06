import { useNode, useEditor } from '@craftjs/core'
import { ROOT_NODE } from '@craftjs/utils'
import { useCallback, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { ArrowUp, Move, GripVertical, Trash2, Copy } from 'lucide-react'
import { useResizable } from '../../hooks/useResizable'
import { useMoveMode } from '../../hooks/useMoveMode'

/**
 * Verifica se `ancestorId` é ancestral de `nodeId` percorrendo a árvore.
 */
function isAncestor(
  query: ReturnType<typeof useEditor>['query'],
  nodeId: string,
  ancestorId: string,
): boolean {
  let current = nodeId
  while (current) {
    const parentId = query.node(current).get()?.data?.parent
    if (!parentId) return false
    if (parentId === ancestorId) return true
    current = parentId
  }
  return false
}

export const RenderNode = ({ render }: { render: React.ReactElement }) => {
  const { id } = useNode()
  const { actions, query, isActive } = useEditor((_, query) => ({
    isActive: query.getEvent('selected').contains(id),
  }))

  const { movingNodeId, startMove, cancelMove } = useMoveMode()

  const {
    isHover,
    dom,
    name,
    moveable,
    deletable,
    connectors: { drag },
    parent,
    isCanvas,
    childrenCount,
    resizableConfig,
  } = useNode((node) => {
    const instanceConfig = node.data.custom?.resizable
    const staticConfig = (node.data.type as unknown as { craft?: { custom?: { resizable?: unknown } } })?.craft?.custom?.resizable
    return {
      isHover: node.events.hovered,
      dom: node.dom,
      name: node.data.custom?.displayName || node.data.displayName,
      moveable: query.node(node.id).isDraggable(),
      deletable: query.node(node.id).isDeletable(),
      parent: node.data.parent,
      isCanvas: node.data.isCanvas,
      childrenCount: node.data.nodes?.length ?? 0,
      resizableConfig: (instanceConfig ?? staticConfig) as import('../../types/resizable.types').ResizableConfig | undefined,
    }
  })

  useResizable({ nodeId: id, dom, isActive, resizableConfig })

  const currentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (dom) {
      if (isActive || isHover) {
        dom.classList.add('component-selected')
      } else {
        dom.classList.remove('component-selected')
      }
    }
  }, [dom, isActive, isHover])

  const getPos = useCallback((dom: HTMLElement | null) => {
    const { top, left, bottom } = dom
      ? dom.getBoundingClientRect()
      : { top: 0, left: 0, bottom: 0 }
    return {
      top: `${top > 0 ? top : bottom}px`,
      left: `${left}px`,
    }
  }, [])

  const scroll = useCallback(() => {
    const { current: currentDOM } = currentRef
    if (!currentDOM || !dom) return
    const { top, left } = getPos(dom)
    currentDOM.style.top = top
    currentDOM.style.left = left
  }, [dom, getPos])

  useEffect(() => {
    const renderer = document.querySelector('.craftjs-renderer')
    if (!renderer) return
    renderer.addEventListener('scroll', scroll)
    return () => {
      renderer.removeEventListener('scroll', scroll)
    }
  }, [scroll])

  // --- Move mode: ESC cancela ---
  useEffect(() => {
    if (!movingNodeId) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelMove()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [movingNodeId, cancelMove])

  const isBeingMoved = movingNodeId === id
  const isMoveMode = !!movingNodeId

  // Este nó é um drop target válido?
  const isValidDropTarget =
    isMoveMode &&
    isCanvas &&
    id !== movingNodeId &&
    !isAncestor(query, id, movingNodeId!)

  const handleDrop = useCallback(() => {
    if (!movingNodeId) return
    try {
      actions.move(movingNodeId, id, childrenCount)
    } catch {
      // Craft.js pode rejeitar o move se não for permitido
    }
    cancelMove()
  }, [movingNodeId, id, childrenCount, actions, cancelMove])

  // --- Visual do componente sendo movido ---
  useEffect(() => {
    if (!dom) return
    if (isBeingMoved) {
      dom.style.opacity = '0.4'
      dom.style.outline = '2px dashed #2563eb'
      dom.style.outlineOffset = '-2px'
    } else {
      dom.style.opacity = ''
      dom.style.outline = ''
      dom.style.outlineOffset = ''
    }
    return () => {
      dom.style.opacity = ''
      dom.style.outline = ''
      dom.style.outlineOffset = ''
    }
  }, [dom, isBeingMoved])

  const portalContainer = document.querySelector('.page-container')

  return (
    <>
      {/* Toolbar do componente (esconde durante move mode) */}
      {(isHover || isActive) && !isMoveMode && portalContainer
        ? ReactDOM.createPortal(
            <div
              ref={currentRef}
              className="fixed flex items-center gap-1 px-2 py-1 text-white text-xs z-[9999] rounded-t pointer-events-auto"
              style={{
                left: getPos(dom).left,
                top: getPos(dom).top,
                marginTop: '-28px',
                background: isActive ? '#2563eb' : '#6b7280',
              }}
            >
              <span className="mr-2 font-medium">{name}</span>
              {moveable && (
                <button
                  className="p-0.5 hover:bg-white/20 rounded cursor-pointer"
                  title="Mover (clique para reposicionar)"
                  onClick={(e) => {
                    e.stopPropagation()
                    startMove(id, name ?? 'Componente')
                  }}
                >
                  <Move className="w-3.5 h-3.5" />
                </button>
              )}
              {moveable && (
                <button
                  ref={(ref) => { if (ref) drag(ref) }}
                  className="p-0.5 hover:bg-white/20 rounded cursor-move opacity-50"
                  title="Arrastar"
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </button>
              )}
              {id !== ROOT_NODE && (
                <button
                  className="p-0.5 hover:bg-white/20 rounded cursor-pointer"
                  onClick={() => { if (parent) actions.selectNode(parent) }}
                  title="Selecionar pai"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              )}
              {id !== ROOT_NODE && (
                <button
                  className="p-0.5 hover:bg-white/20 rounded cursor-pointer"
                  onClick={() => {
                    const freshNode = query.node(id).toSerializedNode()
                    const nodeTree = query.parseSerializedNode(freshNode).toNode()
                    if (parent) actions.add(nodeTree, parent)
                  }}
                  title="Duplicar"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
              {deletable && (
                <button
                  className="p-0.5 hover:bg-red-400/40 rounded cursor-pointer"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    actions.delete(id)
                  }}
                  title="Deletar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>,
            portalContainer
          )
        : null}

      {/* Drop zone inline: aparece no topo de cada canvas válido durante move mode */}
      {isValidDropTarget && (
        <div
          className="relative z-50 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            handleDrop()
          }}
        >
          <div className="flex items-center justify-center py-3 mx-2 my-1 bg-blue-50 border-2 border-dashed border-blue-400 rounded-lg text-blue-600 text-xs font-semibold hover:bg-blue-100 hover:border-blue-500 transition-colors">
            <Move className="w-3.5 h-3.5 mr-1.5" />
            Soltar aqui — {name}
          </div>
        </div>
      )}

      {render}
    </>
  )
}
