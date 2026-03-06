// ─── API client para o servidor Playwright local ─────────────

export interface PlaywrightLayoutResponse {
  success: boolean
  craftJson: string
  colorPalette: {
    primary: string | null
    accent: string | null
    background: string | null
    text: string | null
    gradientFrom: string | null
    gradientTo: string | null
    gradientType: 'linear' | 'radial' | null
    gradientDirection: string | null
  }
  fontFamily: string | null
  sectionCount: number
  title: string | null
  error?: string
}

const PLAYWRIGHT_SERVER_URL = 'http://localhost:3001'

/**
 * Chama o servidor Playwright local para extrair layout de uma URL.
 * Retorna o Craft.js JSON pronto para uso no editor.
 */
export async function buscarLayoutPlaywright(
  url: string,
): Promise<PlaywrightLayoutResponse> {
  const response = await fetch(`${PLAYWRIGHT_SERVER_URL}/api/extract-layout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(
      body.error || `Erro do servidor Playwright: ${response.status}`,
    )
  }

  const data: PlaywrightLayoutResponse = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Erro ao extrair layout')
  }

  return data
}

/** Verifica se o servidor Playwright esta disponivel */
export async function checkPlaywrightServer(): Promise<boolean> {
  try {
    const res = await fetch(`${PLAYWRIGHT_SERVER_URL}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    })
    return res.ok
  } catch {
    return false
  }
}
