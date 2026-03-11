/**
 * Componente de preview em miniatura de um template Craft.js.
 *
 * Renderiza o template como HTML estático dentro de um iframe escalado,
 * permitindo visualizar o layout completo em tamanho reduzido.
 */

import { useMemo, useRef, useState, useEffect } from 'react'
import { craftJsonToHtml } from '../utils/export-html'

interface LayoutPreviewProps {
  /** JSON do template Craft.js */
  templateJson: string
  /** Altura do container de preview (default: 200px) */
  height?: number
  /** Classe CSS adicional */
  className?: string
}

/** Largura interna do iframe (simula viewport desktop) */
const IFRAME_WIDTH = 1280

export function LayoutPreview({
  templateJson,
  height = 200,
  className = '',
}: LayoutPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(300)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const scale = containerWidth / IFRAME_WIDTH

  const html = useMemo(() => {
    try {
      const result = craftJsonToHtml(templateJson, { pageTitle: 'Preview' })
      return result.html.replace(
        '</head>',
        `<style>
          html, body { overflow: hidden !important; pointer-events: none !important; user-select: none !important; }
          ::-webkit-scrollbar { display: none !important; }
        </style></head>`
      )
    } catch {
      return '<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#94a3b8;"><p>Erro ao gerar preview</p></body></html>'
    }
  }, [templateJson])

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden rounded-lg bg-gray-100 ${className}`}
      style={{ width: '100%', height, position: 'relative' }}
    >
      <iframe
        srcDoc={html}
        title="Preview do layout"
        sandbox="allow-same-origin"
        style={{
          width: `${IFRAME_WIDTH}px`,
          height: `${height / scale}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          border: 'none',
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        tabIndex={-1}
      />
    </div>
  )
}
