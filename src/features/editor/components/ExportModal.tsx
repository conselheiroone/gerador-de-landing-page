import { useEditor } from '@craftjs/core'
import { useState, useEffect } from 'react'
import { X, Download, FileCode, FolderArchive, Eye, Copy, Check } from 'lucide-react'
import { craftJsonToHtml } from '../utils/export-html'
import { downloadHtmlInline, downloadZip } from '../utils/download-zip'

interface ExportModalProps {
  open: boolean
  onClose: () => void
  pageTitle: string
}

type ExportTab = 'preview' | 'code'
type ExportFormat = 'html-inline' | 'html-css-zip'

export const ExportModal = ({ open, onClose, pageTitle }: ExportModalProps) => {
  const { query } = useEditor()
  const [tab, setTab] = useState<ExportTab>('preview')
  const [copied, setCopied] = useState(false)
  const [html, setHtml] = useState('')
  const [hasLocalUrls, setHasLocalUrls] = useState(false)

  // Recalcular HTML sempre que a modal abre.
  // query é referência estável em Craft.js — useMemo([query]) nunca re-executaria.
  // Por isso usamos useEffect acionado pela prop open.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return
    try {
      const json = query.serialize()
      if (!json) { setHtml(''); return }
      const result = craftJsonToHtml(json, { pageTitle })
      setHtml(result.html)
      setHasLocalUrls(/http:\/\/(localhost|127\.0\.0\.1)/.test(result.html))
    } catch (err) {
      console.error('[Export] Erro ao gerar HTML:', err)
      setHtml('')
    }
  }, [open, pageTitle])

  const handleDownload = (format: ExportFormat) => {
    try {
      const json = query.serialize()
      if (!json) return
      if (format === 'html-inline') {
        downloadHtmlInline(json, pageTitle)
      } else {
        downloadZip(json, pageTitle)
      }
    } catch (err) {
      console.error('[Export] Erro ao fazer download:', err)
    }
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Exportar Landing Page</h2>
            <p className="text-sm text-gray-400 mt-0.5">{pageTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setTab('preview')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === 'preview'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => setTab('code')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === 'code'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Codigo HTML
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {tab === 'preview' ? (
            html ? (
              <iframe
                srcDoc={html}
                title="Preview da Landing Page"
                className="w-full h-full border-0"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                Gerando preview...
              </div>
            )
          ) : (
            <div className="relative h-full">
              <button
                onClick={handleCopyCode}
                className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-600">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
              <pre className="h-full overflow-auto p-6 bg-gray-900 text-gray-100 text-xs leading-relaxed font-mono">
                <code>{html}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer — Download Actions */}
        <div className="flex flex-col gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
          {hasLocalUrls && (
            <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-500 text-base leading-none mt-0.5">&#9888;</span>
              <p className="text-xs text-amber-700">
                <strong>Imagens locais detectadas:</strong> Algumas imagens apontam para o servidor local (localhost) e nao funcionarao fora deste computador. Para publicar, faca upload das imagens e atualize as URLs.
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            A pagina exportada e totalmente responsiva e independente.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDownload('html-inline')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              HTML Unico
            </button>
            <button
              onClick={() => handleDownload('html-css-zip')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FolderArchive className="w-4 h-4" />
              ZIP (HTML + CSS)
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
