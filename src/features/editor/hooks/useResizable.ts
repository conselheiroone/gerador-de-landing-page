import { useEditor } from '@craftjs/core'
import { useEffect, useRef, useState } from 'react'
import type { ResizableConfig, ResizeDirection } from '../types/resizable.types'
import { CURSOR_MAP } from '../types/resizable.types'

const EDGE_ZONE = 8 // px de distância da borda para ativar resize

interface UseResizableParams {
  nodeId: string
  dom: HTMLElement | null
  isActive: boolean
  resizableConfig: ResizableConfig | undefined
}

interface DragState {
  direction: ResizeDirection
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  aspectRatio: number
}

/**
 * Detecta qual direção de resize baseado na posição do mouse relativa ao elemento.
 * Estilo Windows — cursor muda ao se aproximar das bordas.
 */
function detectEdge(
  e: MouseEvent,
  rect: DOMRect,
  directions: ResizeDirection[]
): ResizeDirection | null {
  const x = e.clientX
  const y = e.clientY

  const nearLeft = x - rect.left < EDGE_ZONE
  const nearRight = rect.right - x < EDGE_ZONE
  const nearTop = y - rect.top < EDGE_ZONE
  const nearBottom = rect.bottom - y < EDGE_ZONE

  // Cantos primeiro (mais específico)
  if (nearTop && nearLeft && directions.includes('nw')) return 'nw'
  if (nearTop && nearRight && directions.includes('ne')) return 'ne'
  if (nearBottom && nearRight && directions.includes('se')) return 'se'
  if (nearBottom && nearLeft && directions.includes('sw')) return 'sw'

  // Bordas
  if (nearTop && directions.includes('n')) return 'n'
  if (nearBottom && directions.includes('s')) return 's'
  if (nearRight && directions.includes('e')) return 'e'
  if (nearLeft && directions.includes('w')) return 'w'

  return null
}

export function useResizable({ nodeId, dom, isActive, resizableConfig }: UseResizableParams) {
  const { actions } = useEditor()

  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<DragState | null>(null)
  const originalCursorRef = useRef<string>('')

  const isResizable = isActive && !!(resizableConfig && resizableConfig.directions.length > 0)

  // Mousemove no elemento — muda cursor ao se aproximar das bordas
  useEffect(() => {
    if (!dom || !isResizable || !resizableConfig) return

    const onMouseMove = (e: MouseEvent) => {
      if (dragRef.current) return // não mudar cursor durante drag
      const rect = dom.getBoundingClientRect()
      const edge = detectEdge(e, rect, resizableConfig.directions)
      dom.style.cursor = edge ? CURSOR_MAP[edge] : ''
    }

    const onMouseLeave = () => {
      if (!dragRef.current) {
        dom.style.cursor = ''
      }
    }

    dom.addEventListener('mousemove', onMouseMove)
    dom.addEventListener('mouseleave', onMouseLeave)
    return () => {
      dom.removeEventListener('mousemove', onMouseMove)
      dom.removeEventListener('mouseleave', onMouseLeave)
      dom.style.cursor = ''
    }
  }, [dom, isResizable, resizableConfig])

  // Mousedown no elemento — inicia resize se estiver na borda
  useEffect(() => {
    if (!dom || !isResizable || !resizableConfig) return

    const onMouseDown = (e: MouseEvent) => {
      const rect = dom.getBoundingClientRect()
      const edge = detectEdge(e, rect, resizableConfig.directions)
      if (!edge) return

      e.preventDefault()
      e.stopPropagation()

      originalCursorRef.current = document.body.style.cursor
      document.body.style.cursor = CURSOR_MAP[edge]

      dragRef.current = {
        direction: edge,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
        aspectRatio: rect.width / (rect.height || 1),
      }
      setIsDragging(true)
    }

    dom.addEventListener('mousedown', onMouseDown)
    return () => {
      dom.removeEventListener('mousedown', onMouseDown)
    }
  }, [dom, isResizable, resizableConfig])

  // Drag em andamento — mousemove/mouseup no document
  useEffect(() => {
    if (!isDragging || !resizableConfig) return

    const onMouseMove = (e: MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return

      const deltaX = e.clientX - drag.startX
      const deltaY = e.clientY - drag.startY
      const dir = drag.direction

      let newWidth = drag.startWidth
      let newHeight = drag.startHeight

      if (dir.includes('e')) newWidth = drag.startWidth + deltaX
      if (dir.includes('w')) newWidth = drag.startWidth - deltaX
      if (dir.includes('s')) newHeight = drag.startHeight + deltaY
      if (dir.includes('n')) newHeight = drag.startHeight - deltaY

      // Shift = aspect ratio lock (cantos)
      if (e.shiftKey && dir.length === 2) {
        newHeight = newWidth / drag.aspectRatio
      }

      const minW = resizableConfig.minWidth ?? 30
      const minH = resizableConfig.minHeight ?? 30
      newWidth = Math.max(minW, Math.round(newWidth))
      newHeight = Math.max(minH, Math.round(newHeight))

      actions.setProp(nodeId, (props: Record<string, unknown>) => {
        if (resizableConfig.widthProp && (dir.includes('e') || dir.includes('w'))) {
          props[resizableConfig.widthProp] = `${newWidth}px`
        }
        if (resizableConfig.heightProp && (dir.includes('s') || dir.includes('n'))) {
          const current = props[resizableConfig.heightProp]
          props[resizableConfig.heightProp] = typeof current === 'number' ? newHeight : `${newHeight}px`
        }
      })
    }

    const onMouseUp = () => {
      dragRef.current = null
      setIsDragging(false)
      document.body.style.cursor = originalCursorRef.current
      if (dom) dom.style.cursor = ''
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDragging, resizableConfig, nodeId, actions, dom])

  return {
    isResizable,
    isDragging,
  }
}
