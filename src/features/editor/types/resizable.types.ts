export type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

export interface ResizableConfig {
  /** Direções ativas para resize */
  directions: ResizeDirection[]
  /** Nome da prop de largura do componente (ex: 'width') */
  widthProp?: string
  /** Nome da prop de altura do componente (ex: 'height', 'minHeight') */
  heightProp?: string
  /** Largura mínima em px */
  minWidth?: number
  /** Altura mínima em px */
  minHeight?: number
}

export interface HandlePosition {
  direction: ResizeDirection
  x: number
  y: number
  cursor: string
}

export const CURSOR_MAP: Record<ResizeDirection, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
}
