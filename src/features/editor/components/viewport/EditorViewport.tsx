import { useEditor } from '@craftjs/core'
import { useState } from 'react'
import { Layers, PanelLeft, Settings2, LayoutGrid, Move, X } from 'lucide-react'
import { EditorHeader } from './EditorHeader'
import { PreviewAnimations } from './PreviewAnimations'
import { ToolboxPanel } from '../panels/ToolboxPanel'
import { SettingsPanel } from '../panels/SettingsPanel'
import { LayersPanel } from '../panels/LayersPanel'
import { SecoesPanel } from '../panels/SecoesPanel'
import { ViewportContext, viewportWidths, type ViewportMode } from '../../hooks/useViewportSize'
import { MoveModeProvider, useMoveMode } from '../../hooks/useMoveMode'

interface EditorViewportProps {
  children: React.ReactNode
  pageTitle?: string
}

function MoveModeBanner() {
  const { movingNodeId, movingNodeName, cancelMove } = useMoveMode()
  if (!movingNodeId) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-center gap-4 py-3 px-6 bg-blue-600 text-white shadow-lg">
      <Move className="w-4 h-4 animate-pulse" />
      <span className="text-sm font-medium">
        Movendo <strong>{movingNodeName}</strong> — role a página e clique em um container destino
      </span>
      <button
        onClick={cancelMove}
        className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        Cancelar
      </button>
      <span className="text-xs text-blue-200">ou pressione ESC</span>
    </div>
  )
}

export const EditorViewport = ({ children, pageTitle }: EditorViewportProps) => {
  const {
    enabled,
    connectors,
  } = useEditor((state) => ({
    enabled: state.options.enabled,
  }))

  const [sidebarTab, setSidebarTab] = useState<'components' | 'layers' | 'sections'>('components')
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop')

  return (
    <MoveModeProvider>
    <ViewportContext.Provider value={{ mode: viewportMode, setMode: setViewportMode }}>
      <div className="flex flex-col h-screen w-full bg-gray-50">
        <EditorHeader pageTitle={pageTitle} />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Esquerda */}
          <aside
            className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
              enabled ? 'w-60' : 'w-0 overflow-hidden'
            }`}
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setSidebarTab('components')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                  sidebarTab === 'components'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <PanelLeft className="w-3.5 h-3.5" />
                Componentes
              </button>
              <button
                onClick={() => setSidebarTab('sections')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                  sidebarTab === 'sections'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Seções
              </button>
              <button
                onClick={() => setSidebarTab('layers')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                  sidebarTab === 'layers'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Camadas
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {sidebarTab === 'components' && <ToolboxPanel />}
              {sidebarTab === 'sections' && <SecoesPanel />}
              {sidebarTab === 'layers' && <LayersPanel />}
            </div>
          </aside>

          {/* Canvas Central */}
          <main className="page-container flex flex-1 flex-col overflow-hidden">
            <div
              className={`craftjs-renderer flex-1 overflow-auto transition-colors ${
                enabled ? 'bg-gray-100' : 'bg-white'
              }`}
              ref={(ref) => {
                if (ref) connectors.select(connectors.hover(ref, ''), '')
              }}
            >
              <div className="relative flex flex-col items-center py-8 min-h-full">
                {/* Viewport container responsivo — container queries para simular breakpoints */}
                <div
                  className="lp-viewport-container transition-all duration-300 w-full"
                  style={{
                    containerType: 'inline-size',
                    maxWidth: viewportWidths[viewportMode],
                    ...(viewportMode !== 'desktop' ? {
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.06)',
                      borderRadius: viewportMode === 'mobile' ? '24px' : '12px',
                      overflow: 'hidden',
                      background: '#ffffff',
                    } : {}),
                  }}
                >
                  {children}
                </div>

                {/* Label do viewport */}
                {viewportMode !== 'desktop' && (
                  <div className="mt-3 text-xs text-gray-400 font-medium">
                    {viewportMode === 'tablet' ? '768px' : '375px'}
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Sidebar Direita — Settings */}
          <aside
            className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${
              enabled ? 'w-72' : 'w-0 overflow-hidden'
            }`}
          >
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100">
              <Settings2 className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propriedades
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SettingsPanel />
            </div>
          </aside>
        </div>
      </div>
      <MoveModeBanner />
      <PreviewAnimations />
    </ViewportContext.Provider>
    </MoveModeProvider>
  )
}
