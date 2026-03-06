// ─── BoxNode: Arvore de caixas extraida do browser real ──────

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Representa um no do DOM como o navegador "enxerga":
 * posicao real (bounding rect) + estilos computados.
 */
export interface BoxNode {
  uid: string
  tag: string
  rect: Rect
  /** Subset de getComputedStyle (apenas propriedades relevantes) */
  computed: Record<string, string>
  /** Texto direto (se for folha textual) */
  text?: string
  /** true se for <img>, <svg>, ou background-image */
  isImg?: boolean
  /** true se for <video> ou conter iframe de video */
  isVideo?: boolean
  children: BoxNode[]
}
