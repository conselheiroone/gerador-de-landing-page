/**
 * Extrai cores dominantes de um arquivo de imagem usando Canvas API.
 *
 * Algoritmo:
 * 1. Renderiza imagem em canvas 100x100
 * 2. Filtra pixels transparentes, brancos e pretos
 * 3. Quantiza cores em intervalos de 24
 * 4. Prioriza cores saturadas (> 0.15)
 * 5. Seleciona primária (mais frequente) e secundária (distância > 60)
 *
 * As cores retornadas são as cores reais da imagem, sem ajustes.
 * O usuário pode editá-las manualmente depois.
 */
export function extractColorsFromFile(
  file: File,
): Promise<{ primary: string; secondary: string } | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 100
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(objectUrl)
        resolve(null)
        return
      }

      ctx.drawImage(img, 0, 0, size, size)
      const { data: pixels } = ctx.getImageData(0, 0, size, size)

      const colorMap = new Map<
        string,
        { r: number; g: number; b: number; count: number; saturation: number }
      >()

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]

        if (a < 128) continue

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const brightness = (max + min) / 2
        if (brightness > 240 || brightness < 15) continue

        const saturation = max === 0 ? 0 : (max - min) / max

        const qr = Math.round(r / 24) * 24
        const qg = Math.round(g / 24) * 24
        const qb = Math.round(b / 24) * 24
        const key = `${qr},${qg},${qb}`

        const existing = colorMap.get(key)
        if (existing) {
          existing.count++
          existing.r = Math.round(
            (existing.r * (existing.count - 1) + r) / existing.count,
          )
          existing.g = Math.round(
            (existing.g * (existing.count - 1) + g) / existing.count,
          )
          existing.b = Math.round(
            (existing.b * (existing.count - 1) + b) / existing.count,
          )
          existing.saturation = Math.max(existing.saturation, saturation)
        } else {
          colorMap.set(key, { r, g, b, count: 1, saturation })
        }
      }

      const colors = [...colorMap.values()]
      const saturated = colors
        .filter((c) => c.saturation > 0.15)
        .sort((a, b) => b.count - a.count)
      const allSorted = colors.sort((a, b) => b.count - a.count)
      const pool = saturated.length >= 2 ? saturated : allSorted

      URL.revokeObjectURL(objectUrl)

      if (pool.length === 0) {
        resolve(null)
        return
      }

      const clamp = (v: number) => Math.min(255, Math.max(0, v))
      const toHex = (c: { r: number; g: number; b: number }) =>
        `#${clamp(c.r).toString(16).padStart(2, '0')}${clamp(c.g).toString(16).padStart(2, '0')}${clamp(c.b).toString(16).padStart(2, '0')}`

      const colorDist = (
        a: { r: number; g: number; b: number },
        b: { r: number; g: number; b: number },
      ) => Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2)

      const primaryRaw = pool[0]
      let secondaryRaw: (typeof pool)[0] | null = null
      for (let i = 1; i < pool.length; i++) {
        if (colorDist(primaryRaw, pool[i]) > 60) {
          secondaryRaw = pool[i]
          break
        }
      }

      resolve({
        primary: toHex(primaryRaw),
        secondary: secondaryRaw ? toHex(secondaryRaw) : '#1A1A1A',
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(null)
    }

    img.src = objectUrl
  })
}
