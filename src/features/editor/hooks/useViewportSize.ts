import { createContext, useContext } from 'react'

export type ViewportMode = 'desktop' | 'tablet' | 'mobile'

export const viewportWidths: Record<ViewportMode, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
}

export const viewportLabels: Record<ViewportMode, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
}

export interface ViewportContextValue {
  mode: ViewportMode
  setMode: (mode: ViewportMode) => void
}

export const ViewportContext = createContext<ViewportContextValue>({
  mode: 'desktop',
  setMode: () => {},
})

export function useViewportSize() {
  return useContext(ViewportContext)
}
