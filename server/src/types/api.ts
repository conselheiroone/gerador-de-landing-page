// ─── DTOs da API ─────────────────────────────────────────────

import type { ColorPalette } from './design-tokens.js'

export interface ExtractLayoutRequest {
  url: string
}

export interface ExtractLayoutResponse {
  success: boolean
  craftJson: string
  colorPalette: ColorPalette
  fontFamily: string | null
  sectionCount: number
  title: string | null
  error?: string
}
